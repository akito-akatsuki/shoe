const express = require("express");
const router = express.Router();
const queryDatabase = require("@mySQLConfig");
const suid = require("@suid");

router.post("/orders", async (req, res) => {
  const orderId = suid();
  const { customerName, customerPhone, productId, quantity, unitPrice, total } =
    req.body;

  try {
    // lưu vào DB
    await queryDatabase(
      `INSERT INTO orders (id, customerName, customerPhone, productId, quantity, unitPrice, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        customerName,
        customerPhone,
        productId,
        quantity,
        unitPrice,
        total,
      ]
    );

    res.json({ success: true, orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể tạo đơn hàng" });
  }
});

router.get("/orders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await queryDatabase(
      `SELECT o.*, p.productName
       FROM orders o
       LEFT JOIN products p ON o.productId = p.id
       WHERE o.id = ?`,
      [id]
    );

    if (!rows[0])
      return res.status(404).json({ error: "Không tìm thấy hóa đơn" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi truy vấn hóa đơn" });
  }
});

module.exports = router;
