const express = require("express");
const router = express.Router();
const queryDatabase = require("@mySQLConfig"); // Config DB của bạn
const { upload, processAndSaveImages } = require("@uploadHelper");
const { authenticate, authorizeAdmin } = require("@auth");

// --- CLIENT ROUTES ---

// 1. Lấy danh sách sản phẩm (Có tìm kiếm)
router.get("/", async (req, res) => {
  const { search } = req.query;
  try {
    let sql = "SELECT * FROM products";
    let params = [];

    if (search) {
      sql += " WHERE name LIKE ?";
      params.push(`%${search}%`);
    }
    
    sql += " ORDER BY created_at DESC";

    const rows = await queryDatabase(sql, params);
    
    // MySQL có thể trả về JSON dạng string, cần parse nếu driver không tự làm
    // (Tùy config driver, ở đây giả sử driver trả về object chuẩn cho json column)
    res.json(rows); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Lấy chi tiết 1 sản phẩm
router.get("/:id", async (req, res) => {
  try {
    const [product] = await queryDatabase("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

router.post("/", authenticate, authorizeAdmin, upload.array('newImages', 10), async (req, res) => {
  try {
    const { name, price, category, description, sizes, colors } = req.body;
    
    // Xử lý file ảnh mới
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        imageUrls = await processAndSaveImages(req.files);
    }

    // Parse sizes/colors từ string JSON gửi lên (FormData gửi array dưới dạng string)
    const parsedSizes = sizes ? JSON.parse(sizes) : [];
    const parsedColors = colors ? JSON.parse(colors) : [];

    const sql = `INSERT INTO products (name, price, category, description, images, sizes, colors) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    await queryDatabase(sql, [
      name, price, category, description, 
      JSON.stringify(imageUrls), 
      JSON.stringify(parsedSizes), 
      JSON.stringify(parsedColors)
    ]);

    res.status(201).json({ message: "Thêm thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", authenticate, authorizeAdmin, upload.array('newImages', 10), async (req, res) => {
  try {
    const { name, price, category, description, sizes, colors, keepImages } = req.body;
    
    // 1. Xử lý ảnh cũ muốn giữ lại
    // keepImages có thể là string (1 ảnh) hoặc array (nhiều ảnh) hoặc undefined
    let finalImages = [];
    if (keepImages) {
        finalImages = Array.isArray(keepImages) ? keepImages : [keepImages];
    }

    // 2. Xử lý và thêm ảnh mới upload
    if (req.files && req.files.length > 0) {
        const newImageUrls = await processAndSaveImages(req.files);
        finalImages = [...finalImages, ...newImageUrls];
    }

    // (Nâng cao: Bạn có thể viết logic xóa file ảnh cũ khỏi ổ cứng nếu nó không nằm trong finalImages)

    const parsedSizes = sizes ? JSON.parse(sizes) : [];
    const parsedColors = colors ? JSON.parse(colors) : [];

    const sql = `
      UPDATE products 
      SET name=?, price=?, category=?, description=?, images=?, sizes=?, colors=?
      WHERE id=?
    `;
    await queryDatabase(sql, [
      name, price, category, description, 
      JSON.stringify(finalImages), 
      JSON.stringify(parsedSizes), 
      JSON.stringify(parsedColors), 
      req.params.id
    ]);
    
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Xóa sản phẩm (Admin)
router.delete("/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    await queryDatabase("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;