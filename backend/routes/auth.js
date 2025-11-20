const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const queryDatabase = require("@mySQLConfig"); // Đảm bảo đường dẫn đúng
const { toBase64URL } = require("@suid"); // Đảm bảo hàm này trả về string safe
const getVNDate = require("@dateVN");

const router = express.Router();
router.use(cookieParser());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// HELPER: Tạo JWT (Thêm role vào token)
// ==========================================
const createTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role || 'user' // Quan trọng: Thêm role vào token
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  
  return { accessToken, refreshToken };
};

// ==========================================
// MIDDLEWARE: Authenticate
// ==========================================
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Thiếu token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token không hợp lệ" });
    req.user = decoded;
    next();
  });
};

// ==========================================
// ROUTE: Login Google
// ==========================================
router.post("/google", async (req, res) => {
  const { credential } = req.body;

  try {
    // 1. Verify Token với Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const { email, name, picture, sub, given_name, family_name, email_verified } = payload;
    
    // Lưu ý: Đảm bảo ID này không dài quá giới hạn của cột `id` trong DB
    const userId = toBase64URL(sub); 

    // 2. Chuẩn bị dữ liệu User
    const now = getVNDate();
    
    // 3. Thực hiện Upsert (Thêm mới hoặc Cập nhật)
    // Bỏ cột 'mention', dùng snake_case cho DB column
    const sql = `
      INSERT INTO users 
        (id, email, name, given_name, family_name, picture, email_verified, created_at, updated_at, login_count, role, status)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'user', 'active')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        given_name = VALUES(given_name),
        family_name = VALUES(family_name),
        picture = VALUES(picture),
        email_verified = VALUES(email_verified),
        updated_at = VALUES(updated_at),
        login_count = login_count + 1;
    `;

    await queryDatabase(sql, [
      userId, email, name, given_name, family_name, picture, email_verified ? 1 : 0, now, now
    ]);

    // 4. Lấy lại thông tin User mới nhất từ DB (để lấy đúng Role và Status hiện tại)
    // Vì nếu user là admin, lệnh INSERT ở trên không đổi role, nhưng ta cần role để tạo token
    const [currentUser] = await queryDatabase("SELECT * FROM users WHERE id = ?", [userId]);

    if (currentUser.status === 'locked') {
        return res.status(403).json({ error: "Tài khoản của bạn đã bị khóa" });
    }

    // 5. Tạo Token
    const { accessToken, refreshToken } = createTokens(currentUser);

    // 6. Set Cookie Refresh Token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set true nếu dùng https
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    // 7. Trả về Client
    res.json({ 
        accessToken, 
        user: currentUser 
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(401).json({ error: "Xác thực thất bại" });
  }
});

// ==========================================
// ROUTE: Refresh Token
// ==========================================
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Vui lòng đăng nhập lại" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Refresh token hết hạn" });

    try {
        // Query DB để check xem user có bị khóa hoặc đổi role không trước khi cấp token mới
        const [user] = await queryDatabase("SELECT id, email, role, status FROM users WHERE id = ?", [decoded.id]);
        
        if (!user || user.status === 'locked') {
            return res.status(403).json({ error: "User không tồn tại hoặc bị khóa" });
        }

        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken });
    } catch (dbError) {
        console.error(dbError);
        res.status(500).json({ error: "Lỗi server" });
    }
  });
});

// ==========================================
// ROUTE: Get Me (Profile)
// ==========================================
router.get("/me", authenticate, async (req, res) => {
  try {
    const [user] = await queryDatabase("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Trả về object user (SQL trả về snake_case, Frontend có thể dùng trực tiếp hoặc map lại nếu muốn)
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ==========================================
// ROUTE: Logout
// ==========================================
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Đã đăng xuất" });
});

// Middleware kiểm tra Admin
const authorizeAdmin = (req, res, next) => {
  // authenticate phải chạy trước để có req.user
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Không có quyền truy cập (Admin only)" });
  }
  next();
};

module.exports = router;
module.exports.authenticate = authenticate;
module.exports.authorizeAdmin = authorizeAdmin;