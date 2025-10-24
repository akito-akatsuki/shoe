require("dotenv").config();
const nodemailer = require("nodemailer");

// 1️⃣ Tạo transporter kết nối Gmail SMTP (dùng chung)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // User
    pass: process.env.GMAIL_PASS, // App password
  },
});

// 2️⃣ Danh sách template email
const templates = {
  welcome: (data) => ({
    subject: "🎉 Chào mừng bạn đến với DH Team!",
    text: `Xin chào ${
      data.userName || "bạn"
    }, chào mừng bạn đến với hệ thống DH Team!`,
    html: `
      
    `,
  }),
};

// 3️⃣ Hàm gửi mail tổng quát
async function sendEmail(type, toEmail, data = {}) {
  const template = templates[type];
  if (!template) {
    console.error(`❌ Không tìm thấy template email: ${type}`);
    return;
  }

  const payload = template(data);

  const mailOptions = {
    from: `"DH Team" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email [${type}] đã gửi đến ${toEmail}: ${info.response}`);
  } catch (error) {
    console.error(`❌ Lỗi khi gửi email [${type}]:`, error);
  }
}

module.exports = { sendEmail };
