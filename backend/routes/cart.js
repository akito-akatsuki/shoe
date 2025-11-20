const express = require("express");
const router = express.Router();
const queryDatabase = require("@mySQLConfig");
const { authenticate } = require("@auth"); // Middleware check login

// --- 1. Lấy giỏ hàng của User đang đăng nhập ---
// GET /api/cart
router.get("/", authenticate, async (req, res) => {
  try {
    // Join bảng cart_items với products để lấy tên, giá, ảnh
    const sql = `
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        c.selected_size,
        c.selected_color,
        p.id as product_id,
        p.name,
        p.price,
        p.images
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;
    
    const items = await queryDatabase(sql, [req.user.id]);

    // Format lại dữ liệu (parse JSON images) để Frontend dễ dùng
    const formattedItems = items.map(item => ({
      cartItemId: item.cart_item_id, // ID để xóa/sửa
      id: item.product_id,           // ID sản phẩm
      name: item.name,
      price: item.price,
      qty: item.quantity,
      selectedSize: item.selected_size,
      selectedColor: item.selected_color,
      images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images // Parse ảnh
    }));

    res.json(formattedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tải giỏ hàng" });
  }
});

// --- 2. Thêm vào giỏ hàng (Hoặc cộng dồn nếu đã có) ---
// POST /api/cart
router.post("/", authenticate, async (req, res) => {
  const { product_id, quantity, selected_size, selected_color } = req.body;

  if (!product_id || !selected_size || !selected_color) {
    return res.status(400).json({ error: "Thiếu thông tin sản phẩm" });
  }

  try {
    // Sử dụng câu lệnh INSERT ... ON DUPLICATE KEY UPDATE của MySQL
    // Nếu trùng (user_id, product_id, size, color) thì tự động cộng dồn quantity
    const sql = `
      INSERT INTO cart_items (user_id, product_id, quantity, selected_size, selected_color)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    await queryDatabase(sql, [
      req.user.id, 
      product_id, 
      quantity || 1, 
      selected_size, 
      selected_color
    ]);

    res.json({ message: "Đã thêm vào giỏ hàng" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi thêm vào giỏ hàng" });
  }
});

// --- 3. Cập nhật số lượng ---
// PUT /api/cart/:id
router.put("/:id", authenticate, async (req, res) => {
  const { quantity } = req.body; // Số lượng mới
  const cartItemId = req.params.id;

  if (quantity < 1) {
    return res.status(400).json({ error: "Số lượng phải lớn hơn 0" });
  }

  try {
    // Chỉ update nếu item đó thuộc về user đang login
    await queryDatabase(
      "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
      [quantity, cartItemId, req.user.id]
    );
    res.json({ message: "Đã cập nhật số lượng" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. Xóa sản phẩm khỏi giỏ ---
// DELETE /api/cart/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await queryDatabase(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. Xóa toàn bộ giỏ hàng (Sau khi thanh toán) ---
// DELETE /api/cart/clear/all
router.delete("/clear/all", authenticate, async (req, res) => {
    try {
      await queryDatabase("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
      res.json({ message: "Đã làm trống giỏ hàng" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;