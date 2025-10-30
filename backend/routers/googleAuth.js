const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");
const queryDatabase = require("@mySQLConfig");

const { toBase64URL } = require("@suid");
const getVNDate = require("@dateVN");
//===================

// Helper tạo JWT
const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" } // access token 15 phút
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" } // refresh token 7 ngày
  );
  return { accessToken, refreshToken };
};

// Middleware xác thực JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Thiếu token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ error: "Token hết hạn hoặc không hợp lệ" });
    req.user = decoded;
    next();
  });
};

//===================

const router = express.Router();
router.use(cookieParser());

// Google OAuth2 setup

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const {
      email,
      name,
      picture,
      sub,
      given_name,
      family_name,
      email_verified,
    } = payload;

    const userId = toBase64URL(sub);

    // Kiểm tra user tồn tại chưa
    const [existingUser] = await queryDatabase(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    const user = {
      id: userId,
      email,
      name,
      given_name,
      family_name,
      picture,
      createdAt: getVNDate(),
      updatedAt: getVNDate(),
      loginCount: 1,
      mention: "@" + email.split("@")[0],
      email_verified,
    };

    // Thêm user mới vào database
    await queryDatabase(
      `INSERT INTO users
        (id, email, name, given_name, family_name, picture, created_at, updated_at, login_count, mention, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          name = VALUES(name),
          given_name = VALUES(given_name),
          family_name = VALUES(family_name),
          picture = VALUES(picture),
          updated_at = VALUES(updated_at),
          login_count = login_count + 1,
          mention = VALUES(mention),
          email_verified = VALUES(email_verified);`,
      [
        user.id,
        user.email,
        user.name,
        user.given_name,
        user.family_name,
        user.picture,
        user.createdAt,
        user.updatedAt,
        user.loginCount,
        user.mention,
        user.email_verified,
      ]
    );

    // Tạo token
    const { accessToken, refreshToken } = createTokens(user);

    // Lưu refreshToken trong cookie HTTPOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // bật true nếu chạy HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.json({ accessToken, user });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Refresh token route
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "Không có refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ error: "Refresh token không hợp lệ" });

    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.json({ accessToken });
  });
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Đã đăng xuất" });
});

// get data user
router.get("/me", authenticate, async (req, res) => {
  try {
    const [row] = await queryDatabase("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (!row.id) return res.status(404).json({ error: "User không tồn tại" });
    res.json(row);
  } catch (err) {
    console.error("Lỗi truy vấn /auth/me:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
module.exports.authenticate = authenticate;
