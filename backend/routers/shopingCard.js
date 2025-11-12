const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { authenticate } = require("@authenticate");
const suid = require("@suid");
const getVNDate = require("@dateVN");

const router = express.Router();

router.get("/shopping-cart", authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await queryDatabase(
      `
      SELECT
        p.id,
        p.productName AS name,
        p.price,
        p.categoryId,
        sc.quantity,
        sc.product_id
      FROM shopping_cart sc
      JOIN products p ON sc.product_id = p.id
      WHERE sc.user_id =  ?
      `,
      [userId]
    );

    // Format lại dữ liệu để có đủ các trường
    const result = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image: `/storages/${row.categoryId}/${row.product_id}/1.jpg`,
      quantity: row.quantity,
      selected: false,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching shopping cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/shopping-cart", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  console.log("Add to cart request:", { userId, productId, quantity });

  try {
    // Chèn hoặc update quantity
    await queryDatabase(
      `
      INSERT INTO shopping_cart (id, product_id, user_id, quantity, added_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `,
      [suid(), productId, userId, quantity || 1, getVNDate()]
    );

    res.json({ message: "Added to cart successfully" });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// xóa item

router.delete("/shopping-cart/:productId", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    // Xóa sản phẩm của user trong giỏ
    await queryDatabase(
      `DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    res.json({
      success: true,
      message: "Sản phẩm đã được xóa khỏi giỏ hàng",
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, không thể xóa sản phẩm",
    });
  }
});

module.exports = router;
