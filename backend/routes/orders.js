const express = require("express");
const router = express.Router();
const queryDatabase = require("@mySQLConfig");
const { authenticate, authorizeAdmin } = require("@auth");
const suid = require("@suid"); // Cần cài: npm i nanoid
const { sendBillEmail } = require("@emailService");

// --- CLIENT ROUTES ---

// 1. Tạo đơn hàng (Checkout)
router.post("/", async (req, res) => {
  // Route này có thể không cần login (Khách vãng lai), hoặc bắt buộc login tùy logic của bạn
  // Ở đây tôi xử lý cả 2 trường hợp dựa vào việc gửi token hay không
  
  const { user_id, user_name, phone, address, items, payment_method, total } = req.body;
  
  // Tạo ID đơn hàng
  const orderId = suid(); 

  try {
    // ! QUAN TRỌNG: Nên dùng Transaction, nhưng để đơn giản demo tôi viết query tuần tự.
    // Nếu dùng MySQL connection pool chuẩn, hãy dùng connection.beginTransaction()

    // B1: Insert bảng orders
    await queryDatabase(
      `INSERT INTO orders (id, user_id, user_name, phone, address, total, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderId, user_id === 'GUEST' ? null : user_id, user_name, phone, address, total, payment_method]
    );

    // B2: Insert bảng order_items (Lặp qua từng sản phẩm)
    // Cách tối ưu: Bulk Insert (Insert nhiều dòng 1 lúc)
    const itemValues = items.map(item => [
      orderId, 
      item.id, 
      item.name, 
      item.qty, 
      item.price, 
      item.selectedSize, 
      item.selectedColor, 
      item.images?.[0] || "" // Lấy ảnh đầu tiên làm thumbnail
    ]);

    if (itemValues.length > 0) {
      await queryDatabase(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, selected_size, selected_color, image) VALUES ?`, 
        [itemValues] // Lưu ý cú pháp bulk insert của mysql module
      );
    }

    // B3: Update chi tiêu user (Nếu đã login)
    if (user_id && user_id !== 'GUEST') {
        // Logic cộng dồn chi tiêu nếu cần
        // await queryDatabase("UPDATE users SET spent = spent + ? WHERE id = ?", [total, user_id]);
    }

    res.status(201).json({ message: "Đặt hàng thành công", orderId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tạo đơn hàng" });
  }
});

// 2. Lấy lịch sử đơn hàng của tôi (Yêu cầu Login)
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    // Bước 1: Lấy danh sách đơn hàng
    const orders = await queryDatabase(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", 
      [req.user.id]
    );

    // Bước 2: Lấy chi tiết sản phẩm cho từng đơn (Join thủ công bằng code)
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await queryDatabase(
            "SELECT * FROM order_items WHERE order_id = ?",
            [order.id]
        );
        return { ...order, items }; // Gộp mảng items vào object order
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- 2. SỬA: Lấy tất cả đơn hàng cho Admin (KÈM ITEM) ---
router.get("/all", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const orders = await queryDatabase("SELECT * FROM orders ORDER BY created_at DESC");

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await queryDatabase(
            "SELECT * FROM order_items WHERE order_id = ?",
            [order.id]
        );
        return { ...order, items };
    }));

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. THÊM MỚI: Khách xác nhận đã nhận hàng ---
router.put("/:id/receive", authenticate, async (req, res) => {
    const orderId = req.params.id;
    try {
        // Chỉ cho phép xác nhận nếu đơn hàng thuộc về user đó và đang ở trạng thái 'shipping'
        const [order] = await queryDatabase(
            "SELECT * FROM orders WHERE id = ? AND user_id = ?", 
            [orderId, req.user.id]
        );

        if (!order) return res.status(404).json({ error: "Đơn hàng không tồn tại" });
        if (order.status !== 'shipping') return res.status(400).json({ error: "Đơn hàng chưa được giao hoặc đã hoàn thành" });

        await queryDatabase("UPDATE orders SET status = 'delivered' WHERE id = ?", [orderId]);
        
        res.json({ message: "Đã xác nhận nhận hàng thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// 4. Cập nhật trạng thái đơn hàng (Admin)
// ... (Phần import và code trên giữ nguyên)
// UPDATE STATUS (Sửa lại logic gửi mail)
router.put("/:id/status", authenticate, authorizeAdmin, async (req, res) => {
  const { status } = req.body; // 'shipping' hoặc 'delivered'
  const orderId = req.params.id;

  console.log(`>>> [DEBUG] Admin đổi đơn ${orderId} sang: "${status}"`);

  try {
    // 1. Cập nhật trạng thái mới vào DB trước
    await queryDatabase("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

    // 2. Lấy thông tin đơn hàng để kiểm tra Payment Method và Email
    const sqlOrderInfo = `
        SELECT o.*, u.email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?
    `;
    const [orderData] = await queryDatabase(sqlOrderInfo, [orderId]);

    // Nếu không tìm thấy đơn hoặc user không có email thì bỏ qua
    if (!orderData || !orderData.email) {
        console.log(">>> [DEBUG] Không tìm thấy email user hoặc đơn hàng lỗi.");
        return res.json({ message: "Cập nhật thành công (Không gửi mail)" });
    }

    const sqlItems = `SELECT * FROM order_items WHERE order_id = ?`;
    const orderItems = await queryDatabase(sqlItems, [orderId]);

    // --- LOGIC GỬI MAIL TÙY CHỈNH ---
    let shouldSendEmail = false;
    let emailSubject = "";

    // TRƯỜNG HỢP 1: Chuyển khoản (BANK) -> Gửi ngay khi xác nhận Ship (shipping)
    if (orderData.payment_method === 'bank' && status === 'shipping') {
        shouldSendEmail = true;
        emailSubject = `[SneakerStore] Xác nhận thanh toán & Đơn hàng #${orderId} đang giao`;
        console.log(">>> [LOGIC] Đơn BANK -> Gửi mail lúc Shipping");
    }

    // TRƯỜNG HỢP 2: Tiền mặt (COD) -> Gửi khi đã nhận hàng (delivered)
    else if (orderData.payment_method === 'cod' && status === 'delivered') {
        shouldSendEmail = true;
        emailSubject = `[SneakerStore] Cảm ơn bạn đã nhận hàng - Hóa đơn #${orderId}`;
        console.log(">>> [LOGIC] Đơn COD -> Gửi mail lúc Delivered");
    }

    // TRƯỜNG HỢP 3 (Phụ): Nếu đơn BANK mà chuyển sang Delivered, có thể gửi thư cảm ơn (Tùy chọn)
    // Nếu bạn chỉ muốn gửi 1 lần duy nhất cho Bank thì bỏ qua đoạn này.
    else if (orderData.payment_method === 'bank' && status === 'delivered') {
         console.log(">>> [LOGIC] Đơn BANK đã giao xong (Đã gửi mail lúc ship rồi nên không gửi nữa)");
    }

    // 3. Thực hiện gửi mail nếu thỏa mãn điều kiện
    if (shouldSendEmail) {
        // Chúng ta cần sửa hàm sendBillEmail một chút để nhận Subject từ bên ngoài (Xem Bước 3)
        // Hoặc bạn có thể hardcode subject trong utils nếu lười sửa
        await sendBillEmail(orderData.email, orderData, orderItems, emailSubject); 
        console.log(">>> [DEBUG] ✅ Đã gửi mail thành công!");
    }

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error(">>> [DEBUG] ❌ Lỗi Server:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;