import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Loader2, CheckCircle, Copy, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useStore } from "../../store"; // Giả sử bạn có hook useStore để lấy domain

export const PaymentView = ({ user, accessToken, onOrderSuccess }) => {
  const navigate = useNavigate();
  const [state] = useStore(); // Lấy domain từ store global nếu có

  // State quản lý dữ liệu
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // State MỚI: Lưu kết quả đơn hàng thành công để hiện QR/Thông báo
  const [successOrder, setSuccessOrder] = useState(null);

  // 1. Effect: Tự động điền thông tin user nếu có
  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: user.name || "",
        // Nếu user có lưu sđt/địa chỉ trong DB thì điền vào đây
      }));
    }
  }, [user]);

  // 2. Effect: Fetch giỏ hàng từ Server để tính tiền
  useEffect(() => {
    const fetchCart = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${state.domain}/api/cart`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
        }
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [accessToken, state.domain]);

  // Tính toán tổng tiền
  const totalPrice = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
  const shippingFee = 30000;
  const finalTotal = totalPrice + shippingFee;

  // --- HÀM TẠO URL QR CODE ---
  const getQrUrl = (orderId, amount) => {
    const BANK_ID =state.BANK_ID;
    const ACCOUNT_NO = state.ACCOUNT_NO;
    const TEMPLATE = "compact2";
    const content = `Pay ${orderId}`;
    return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
  };

  // --- XỬ LÝ ĐẶT HÀNG ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setIsSubmitting(true);

    try {
      // BƯỚC 1: Tạo đơn hàng (POST /api/orders)
      // Lưu ý: Không gửi ID, để Backend tự sinh
      const orderPayload = {
        user_id: user ? user.id : "GUEST",
        user_name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        items: cartItems,
        total: finalTotal,
        payment_method: paymentMethod,
      };

      const orderRes = await fetch(`${state.domain}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        throw new Error("Lỗi khi tạo đơn hàng");
      }

      const orderData = await orderRes.json(); // Nhận lại { orderId: 'ORD-...' }

      // BƯỚC 2: Xóa giỏ hàng trên Server (DELETE /api/cart/clear/all)
      if (accessToken) {
        await fetch(`${state.domain}/api/cart/clear/all`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      // Callback để cập nhật số lượng trên Navbar về 0
      if (onOrderSuccess) onOrderSuccess();

      // BƯỚC 3: Chuyển sang màn hình thành công
      setSuccessOrder({
        id: orderData.orderId,
        total: finalTotal,
        method: paymentMethod,
      });

    } catch (err) {
      console.error(err);
      alert("Đặt hàng thất bại: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI 1: MÀN HÌNH THÀNH CÔNG (Sau khi Backend trả về ID) ---
  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6 inline-flex bg-green-100 p-4 rounded-full">
          <CheckCircle className="w-16 h-16 text-green-600 fill-transparent" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-8">
          Mã đơn hàng của bạn: <b className="text-gray-800">{successOrder.id}</b>
        </p>

        {/* Nếu chọn chuyển khoản -> Hiện QR Code */}
        {successOrder.method === "bank" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 max-w-sm mx-auto mb-8">
            <p className="font-bold text-blue-600 mb-4 bg-blue-50 py-2 rounded-lg">
              Quét mã để thanh toán ngay
            </p>

            <img
              src={getQrUrl(successOrder.id, successOrder.total)}
              alt="QR Code"
              className="w-full h-auto rounded-lg border border-gray-200 mb-4"
            />

            <div className="text-sm text-gray-600 space-y-2 text-left">
              <div className="flex justify-between">
                <span>Ngân hàng:</span> <b>MB Bank</b>
              </div>
              <div className="flex justify-between">
                <span>Số TK:</span> <b>0000 1234 56789</b>
              </div>
              <div className="flex justify-between">
                <span>Số tiền:</span>{" "}
                <b className="text-blue-600">
                  {successOrder.total.toLocaleString()} đ
                </b>
              </div>
              <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>Nội dung:</span>
                <b className="font-mono">{`Pay ${successOrder.id}`}</b>
                <Copy
                  size={14}
                  className="ml-2 cursor-pointer text-gray-500 hover:text-black fill-transparent"
                  onClick={() =>
                    navigator.clipboard.writeText(`Pay ${successOrder.id}`)
                  }
                  title="Sao chép nội dung"
                />
              </div>
            </div>
            <p className="text-xs text-red-500 mt-4 italic">
              * Hệ thống sẽ gửi email xác nhận sau khi Admin duyệt đơn.
            </p>
          </div>
        )}

        {/* Nếu chọn COD */}
        {successOrder.method === "cod" && (
          <div className="bg-gray-50 p-6 rounded-xl mb-8 max-w-md mx-auto border border-gray-200">
            <p className="text-gray-700">Cảm ơn bạn đã tin tưởng.</p>
            <p className="text-gray-700 font-medium mt-1">
              Chúng tôi sẽ liên hệ sớm nhất để giao hàng.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Vui lòng chuẩn bị số tiền:{" "}
              <b className="text-blue-600">
                {successOrder.total.toLocaleString()} đ
              </b>{" "}
              khi nhận hàng.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
          <Button variant="primary" onClick={() => navigate("/profile")}>
            Xem đơn hàng của tôi <ArrowRight size={16} className="ml-1 fill-transparent" />
          </Button>
        </div>
      </div>
    );
  }

  // Loading UI ban đầu khi fetch cart
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-600 fill-transparent" />
      </div>
    );
  }

  // Empty Cart UI
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed m-4 max-w-3xl mx-auto">
        <p className="text-gray-500 text-lg mb-4">Giỏ hàng trống trơn!</p>
        <Button onClick={() => navigate("/")} variant="primary">
          Mua sắm ngay
        </Button>
      </div>
    );
  }

  // --- UI 2: FORM ĐẶT HÀNG (Mặc định) ---
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Button
        variant="secondary"
        className="mb-6 pl-0 hover:no-underline hover:text-blue-600 transition-colors"
        onClick={() => navigate("/cart")}
      >
        ← Quay lại giỏ hàng
      </Button>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Cột trái: Form thông tin */}
        <div className="md:col-span-7">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <CreditCard className="text-blue-600 fill-transparent" /> Thông tin giao hàng
            </h2>
            <form
              id="checkout-form"
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              <Input
                label="Họ tên người nhận"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                placeholder="Nguyễn Văn A"
                required
              />
              <Input
                label="Số điện thoại"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                placeholder="0912..."
                required
              />
              <Input
                label="Địa chỉ giao hàng"
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, address: e.target.value })
                }
                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                required
              />

              <div className="pt-4">
                <h3 className="font-bold mb-3 text-gray-700">
                  Phương thức thanh toán
                </h3>
                <div className="space-y-3">
                  {/* COD Option */}
                  <label
                    className={`border p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                      <Truck classname="fill-transparent" size={20} />
                    </div>
                    <span className="font-medium text-gray-700">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </label>

                  {/* Bank Option */}
                  <label
                    className={`border p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === "bank"
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                    />
                    <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                      <CreditCard className="fill-transparent" size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">
                        Chuyển khoản ngân hàng
                      </span>
                      <span className="text-xs text-gray-500">
                        Hiện mã QR sau khi đặt hàng
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 sticky top-24">
            <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">
              Đơn hàng của bạn
            </h3>

            {/* List items */}
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 mb-4 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border">
                    <img
                      src={
                        Array.isArray(item.images)
                          ? item.images[0]
                          : typeof item.images === "string"
                          ? JSON.parse(item.images)[0]
                          : item.images
                      }
                      className="w-full h-full object-cover"
                      alt={item.name}
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/50")
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium truncate max-w-[150px]">
                      {item.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Size: {item.selectedSize} | x{item.qty}
                    </div>
                  </div>
                  <div className="font-medium text-gray-700">
                    {(item.price * item.qty).toLocaleString()} đ
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4 bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tạm tính:</span>
                <span>{totalPrice.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-blue-600 pt-2 border-t border-gray-200 mt-2">
                <span>Tổng cộng:</span>
                <span>{finalTotal.toLocaleString()} đ</span>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full py-3 mt-4 shadow-lg shadow-blue-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin fill-transparent" /> Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="fill-transparent" size={18} /> Xác nhận đặt hàng
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};