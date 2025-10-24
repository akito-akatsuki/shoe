require("dotenv").config();
const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const users = require("../user.js");
const { toBase64URL } = require("../utils/suid.js");
//===================
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "users.json");

// Nếu chưa có file users.json thì tạo rỗng
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "[]", "utf8");
}

//===================

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, name, picture, sub } = payload;

    // Kiểm tra user tồn tại chưa
    let existingUser = users.find((u) => u.email === email);

    if (!existingUser) {
      const newUser = {
        id: toBase64URL(sub),
        email,
        name,
        picture,
        createdAt: new Date().toISOString(),
        loginCount: 1,
        mention: "@" + email.split("@")[0],
      };
      users.push(newUser);
      fs.writeFileSync(filePath, JSON.stringify(newUser, null, 2), "utf8");
      console.log("👤 New user:", newUser);
      return res.json({ message: "first_login", user: newUser });
    } else {
      existingUser.loginCount++;
      console.log("🔁 Returning user:", existingUser.email);
      return res.json({ message: "returning_user", user: existingUser });
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
