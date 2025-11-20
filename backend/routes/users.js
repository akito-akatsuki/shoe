const express = require("express");
const router = express.Router();
const queryDatabase = require("@mySQLConfig");
const { authenticate, authorizeAdmin } = require("@auth");

// --- ADMIN ROUTES ---

// 1. Lấy tất cả users
router.get("/", authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Không trả về thông tin nhạy cảm nếu có password
    const users = await queryDatabase("SELECT id, email, name, picture, role, status, created_at, login_count FROM users ORDER BY created_at DESC");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Khóa / Mở khóa User
router.put("/:id/status", authenticate, authorizeAdmin, async (req, res) => {
  const { status } = req.body; // 'active' hoặc 'locked'
  try {
    await queryDatabase("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: `User đã được chuyển sang trạng thái ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Set quyền Admin (Cẩn thận với API này)
router.put("/:id/role", authenticate, authorizeAdmin, async (req, res) => {
    const { role } = req.body; // 'user' hoặc 'admin'
    try {
      await queryDatabase("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
      res.json({ message: "Phân quyền thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;