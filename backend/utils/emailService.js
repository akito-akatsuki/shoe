// utils/emailService.js
const nodemailer = require("nodemailer");

// 1. Cấu hình Transporter (Người vận chuyển)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Lưu ý: Đây phải là "App Password", không phải mật khẩu đăng nhập thường
  },
});

// 2. Hàm tạo mẫu HTML hóa đơn đẹp
const createInvoiceTemplate = (order, items) => {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${item.product_name} <br> <span style="font-size: 12px; color: #888;">${item.selected_size} / ${item.selected_color}</span></td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">${Number(item.price).toLocaleString()} đ</td>
      <td style="padding: 10px; text-align: right;"><b>${(item.price * item.quantity).toLocaleString()} đ</b></td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Cảm ơn bạn đã mua hàng!</h2>
      <p>Xin chào <b>${order.user_name}</b>,</p>
      <p>Đơn hàng <b>#${order.id}</b> của bạn đã được xác nhận thanh toán thành công.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><b>Địa chỉ nhận hàng:</b> ${order.address}</p>
        <p style="margin: 5px 0;"><b>Số điện thoại:</b> ${order.phone}</p>
        <p style="margin: 5px 0;"><b>Phương thức:</b> ${order.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
            <th style="padding: 10px;">SL</th>
            <th style="padding: 10px; text-align: right;">Đơn giá</th>
            <th style="padding: 10px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p>Phí vận chuyển: 30.000 đ</p>
        <h3 style="color: #dc2626;">TỔNG CỘNG: ${Number(order.total).toLocaleString()} đ</h3>
      </div>

      <hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;">
      <p style="text-align: center; font-size: 12px; color: #666;">
        Nếu có thắc mắc, vui lòng liên hệ hotline: 09xx.xxx.xxx<br>
        SneakerStore - Uy tín làm nên thương hiệu.
      </p>
    </div>
  `;
};

// 3. Hàm gửi Email chính
// const sendBillEmail = async (toEmail, orderData, orderItems) => {
//   try {
//     const htmlContent = createInvoiceTemplate(orderData, orderItems);

//     const info = await transporter.sendMail({
//       from: '"SneakerStore Admin" <' + process.env.GMAIL_USER + '>', // Tên người gửi
//       to: toEmail, // Email khách hàng
//       subject: `[SneakerStore] Hóa đơn điện tử - Đơn hàng #${orderData.id}`,
//       html: htmlContent,
//     });

//     console.log("Email sent: %s", info.messageId);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// };

const sendBillEmail = async (toEmail, orderData, orderItems, customSubject) => {
  try {
    const htmlContent = createInvoiceTemplate(orderData, orderItems);

    // Tiêu đề mặc định nếu không truyền
    const subject = customSubject || `[SneakerStore] Thông tin đơn hàng #${orderData.id}`;

    const info = await transporter.sendMail({
      from: '"SneakerStore Admin" <' + process.env.GMAIL_USER + '>',
      to: toEmail,
      subject: subject, // Sử dụng tiêu đề động
      html: htmlContent,
    });

    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports.sendBillEmail = sendBillEmail;