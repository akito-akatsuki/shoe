// test-email.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Đảm bảo bạn đã cài dotenv: npm install dotenv

async function main() {
  // 1. Cấu hình
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Email của bạn
      pass: process.env.GMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự
    },
  });

  // 2. Gửi thử
  try {
    console.log("Đang gửi mail...");
    const info = await transporter.sendMail({
      from: `"Test System" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Gửi cho chính mình để test
      subject: "Test Nodemailer",
      text: "Nếu bạn đọc được tin này thì cấu hình đã thành công!",
    });

    console.log("Gửi thành công!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ GỬI THẤT BẠI:");
    console.error(error);
  }
}

main();