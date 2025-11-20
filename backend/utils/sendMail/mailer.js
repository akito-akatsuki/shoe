require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Tạo transporter kết nối Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // App Password (16 ký tự)
  },
});

// Đọc template HTML từ file
function loadTemplate(fileName, data = {}) {
  const filePath = path.join(__dirname, "templates", `${fileName}.html`);
  let html = fs.readFileSync(filePath, "utf-8");

  // Thay thế biến trong template ({{variable}})
  for (const key in data) {
    html = html.replaceAll(`{{${key}}}`, data[key]);
  }

  return html;
}

// Hàm gửi mail tổng quát
async function sendEmail({
  type, // loại email: welcome, invoice, request, confirmation...
  to, // người nhận
  cc, // (tùy chọn) cc
  bcc, // (tùy chọn) bcc
  subject, // (tùy chọn) tiêu đề tùy chỉnh
  data = {}, // dữ liệu thay thế trong template
  attachments, // (tùy chọn) danh sách file đính kèm
}) {
  try {
    // Đọc HTML template
    const html = loadTemplate(type, data);

    // Nếu subject không được truyền thì tự tạo mặc định
    const defaultSubjects = {
      welcome: "🎉 Chào mừng bạn đến với DH Team!",
    };

    const mailOptions = {
      from: `"DH Team" <${process.env.GMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject: subject || defaultSubjects[type] || "Thông báo từ DH Team",
      html,
      attachments, // Mảng [{ filename, path }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email [${type}] đã gửi đến ${to}: ${info.response}`);
  } catch (error) {
    console.error(`❌ Lỗi khi gửi email [${type}]:`, error.message);
  }
}

module.exports = { sendEmail };
