import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Trash2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { getColorStyle } from "../../utils/helpers";
import { useStore } from "../../store";

export const CartView = ({ accessToken, onOrderSuccess }) => {
  const navigate = useNavigate();
  const [state] = useStore();

  // 1. State quản lý dữ liệu nội bộ
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Hàm Fetch giỏ hàng từ Server
  const fetchCart = async () => {
    // Nếu chưa đăng nhập (không có token), không gọi API
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${state.domain}/api/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Không thể tải giỏ hàng");

      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [accessToken]);

  // 3. Hàm Xóa sản phẩm (Gọi API DELETE)
  const handleRemoveItem = async (cartItemId) => {
    if (!accessToken) return;

    // Optimistic Update: Xóa trên giao diện trước cho mượt
    const prevItems = [...cartItems];
    setCartItems((prev) =>
      prev.filter((item) => item.cartItemId !== cartItemId)
    );

    try {
      const res = await fetch(`${state.domain}/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Lỗi khi xóa");
      if (onCartChange) onCartChange();
    } catch (err) {
      console.error(err);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
      // Rollback nếu lỗi
      setCartItems(prevItems);
    }
  };

  // 4. Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.qty,
    0
  );

  // Helper xử lý ảnh (vì API trả về có thể là JSON string hoặc Array)
  const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4 fill-transparent" />
        <p>Đang đồng bộ giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 text-gray-800">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
          <ShoppingCart classname='fill-transparent' size={28} />
        </div>
        Giỏ hàng của bạn
      </h2>

      {!accessToken || cartItems.length === 0 ? (
        // --- EMPTY STATE ---
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-300 fill-transparent" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Giỏ hàng chưa có sản phẩm
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {!accessToken
              ? "Vui lòng đăng nhập để xem giỏ hàng của bạn."
              : "Có vẻ như bạn chưa tìm được món đồ ưng ý. Hãy quay lại cửa hàng nhé!"}
          </p>
          <div className="w-full flex justify-center">
            <Button
              variant="primary"
              onClick={() => navigate("/")}
              className="px-8 py-3 shadow-lg shadow-blue-200"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      ) : (
        // --- CART LIST ---
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Products */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const thumb = getProductImage(item.images);

              return (
                <div
                  key={item.cartItemId}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={
                        thumb || "https://via.placeholder.com/100?text=No+Img"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/100?text=Error";
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between items-start">
                      <h3
                        className="font-bold text-base md:text-lg text-gray-800 line-clamp-1 pr-8"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      {/* Mobile Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="sm:hidden text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="fill-transparent" size={18} />
                      </button>
                    </div>

                    <p className="text-blue-600 font-bold text-lg mt-1">
                      {Number(item.price).toLocaleString("vi-VN")} đ
                    </p>

                    {/* Attributes */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                      <div className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs flex items-center gap-1">
                        Size:{" "}
                        <b className="text-gray-900">{item.selectedSize}</b>
                      </div>

                      <div className="bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs flex items-center gap-2">
                        Màu:
                        <span className="flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 inline-block shadow-sm"
                            style={getColorStyle(item.selectedColor)}
                          ></span>
                          <span className="font-medium text-gray-900">
                            {item.selectedColor}
                          </span>
                        </span>
                      </div>

                      <div className="ml-auto font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        x{item.qty}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Remove Button (Hiện khi hover) */}
                  <Button
                    variant="danger"
                    className="hidden sm:flex p-2 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0"
                    onClick={() => handleRemoveItem(item.cartItemId)}
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-4 h-4 fill-transparent" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Right Column: Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
            <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4 text-gray-800">
              Tổng quan đơn hàng
            </h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>
                  Tạm tính ({cartItems.reduce((a, b) => a + b.qty, 0)} sản
                  phẩm):
                </span>
                <span className="font-medium">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">30.000 đ</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-4 flex justify-between items-end mb-6">
              <span className="text-gray-600 font-medium">
                Tổng thanh toán:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {(totalPrice + 30000).toLocaleString("vi-VN")} đ
              </span>
            </div>

            <Button
              variant="primary"
              className="w-full py-3.5 text-base font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              onClick={() => navigate("/checkout")}
            >
              Tiến hành thanh toán <ArrowRight className="fill-transparent" size={18} />
            </Button>

            <div className="mt-6 bg-gray-50 p-3 rounded-lg text-xs text-gray-500 text-center leading-relaxed">
              <span className="font-semibold">Bảo mật thanh toán 100%.</span>
              <br />
              Hỗ trợ đổi trả trong vòng 30 ngày.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
