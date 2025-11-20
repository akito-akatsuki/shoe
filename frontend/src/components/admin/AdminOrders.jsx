import React, { useState, useEffect } from "react";
import { Eye, X, RefreshCcw } from "lucide-react"; // Thêm icon Refresh
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { useStore } from "../../store";

export const AdminOrders = ({ accessToken }) => {
  // Nhận accessToken từ MainContent
  const [state] = useStore();
  const [orders, setOrders] = useState([]);
  const [selOrd, setSelOrd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Hàm lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${state.domain}/api/orders/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Gửi kèm Token Admin
        },
      });

      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${res.statusText}`);
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Lỗi fetchOrders:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component mount hoặc accessToken thay đổi
  useEffect(() => {
    if (accessToken) {
      fetchOrders();
    }
  }, [accessToken]);

  // 2. Hàm cập nhật trạng thái đơn hàng
  const updateStatus = async (id, newStatus) => {
    // Optimistic update (Cập nhật giao diện ngay lập tức để cảm giác nhanh hơn)
    const previousOrders = [...orders];
    const previousSelOrd = selOrd ? { ...selOrd } : null;

    // Cập nhật UI tạm thời
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    if (selOrd && selOrd.id === id) setSelOrd({ ...selOrd, status: newStatus });

    try {
      const res = await fetch(`${state.domain}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Không thể cập nhật trạng thái trên server");
      }

      // Nếu thành công, có thể alert hoặc toast
      // alert("Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi updateStatus:", err);
      alert("Lỗi cập nhật: " + err.message);

      // Rollback (Hoàn tác) nếu lỗi
      setOrders(previousOrders);
      setSelOrd(previousSelOrd);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải danh sách đơn hàng...
      </div>
    );
  if (error)
    return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
        <Button variant="outline" onClick={fetchOrders} title="Tải lại">
          <RefreshCcw className="fill-transparent" size={18} />
        </Button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 whitespace-nowrap">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b hover:bg-gray-50 last:border-0"
                >
                  <td className="p-4 font-bold text-gray-700 text-sm">
                    {o.id}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">
                      {o.user_name || o.userName}
                    </div>
                    <div className="text-xs text-gray-500">{o.phone}</div>
                  </td>
                  <td className="p-4 font-bold text-blue-600">
                    {Number(o.total).toLocaleString()} đ
                  </td>
                  <td className="p-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => setSelOrd(o)}
                      className="p-2 bg-gray-100 rounded hover:bg-blue-100 transition-colors text-gray-600 hover:text-blue-600"
                      title="Xem chi tiết"
                    >
                      <Eye className="fill-transparent" size={18} />
                    </button>
                    {o.status === "pending" && (
                      <Button
                        className="py-1 px-3 text-xs h-[34px]"
                        onClick={() => updateStatus(o.id, "shipping")}
                      >
                        Duyệt
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selOrd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[85vh] overflow-auto p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b pb-3 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-xl text-gray-800">
                Chi tiết đơn: {selOrd.id}
              </h3>
              <button
                onClick={() => setSelOrd(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="fill-transparent" size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-2">
                <p>
                  <span className="font-semibold text-gray-600 w-24 inline-block">
                    Khách hàng:
                  </span>{" "}
                  {selOrd.user_name || selOrd.userName}
                </p>
                <p>
                  <span className="font-semibold text-gray-600 w-24 inline-block">
                    SĐT:
                  </span>{" "}
                  {selOrd.phone}
                </p>
                <p>
                  <span className="font-semibold text-gray-600 w-24 inline-block">
                    Địa chỉ:
                  </span>{" "}
                  {selOrd.address}
                </p>
                <p>
                  <span className="font-semibold text-gray-600 w-24 inline-block">
                    Thanh toán:
                  </span>
                  {selOrd.payment_method === "cod" ||
                  selOrd.paymentMethod === "cod"
                    ? " Tiền mặt (COD)"
                    : " Chuyển khoản"}
                </p>
                <p>
                  <span className="font-semibold text-gray-600 w-24 inline-block">
                    Ngày đặt:
                  </span>{" "}
                  {new Date(selOrd.created_at || selOrd.date).toLocaleString(
                    "vi-VN"
                  )}
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                {/* API trả về items, nếu chưa có bảng join thì cần xử lý ở backend để join order_items */}
                {/* Giả sử backend API /all đã trả về kèm mảng items hoặc bạn phải fetch thêm chi tiết */}
                {!selOrd.items || selOrd.items.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 italic">
                    Không có thông tin sản phẩm (Cần join bảng order_items)
                  </div>
                ) : (
                  selOrd.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 border-b last:border-0 p-3 hover:bg-gray-50 items-center"
                    >
                      {/* Xử lý ảnh: check null hoặc array */}
                      <img
                        src={i.image || "https://via.placeholder.com/50"}
                        className="w-14 h-14 rounded bg-gray-200 object-cover border"
                        alt=""
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-medium text-gray-900">
                          {i.product_name || i.name}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Size:{" "}
                          <span className="font-semibold">
                            {i.selected_size || i.selectedSize}
                          </span>{" "}
                          | Màu:{" "}
                          <span className="font-semibold">
                            {i.selected_color || i.selectedColor}
                          </span>{" "}
                          | SL:{" "}
                          <span className="font-semibold">
                            {i.quantity || i.qty}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-gray-700 text-right">
                        {(
                          Number(i.price) * Number(i.quantity || i.qty)
                        ).toLocaleString()}{" "}
                        đ
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Tổng thanh toán</span>
                <span className="text-blue-600">
                  {Number(selOrd.total).toLocaleString()} đ
                </span>
              </div>

              {/* Quick Actions in Modal */}
              <div className="flex gap-3 mt-4 pt-2">
                {selOrd.status === "pending" && (
                  <>
                    <Button
                      variant="success"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(selOrd.id, "shipping")}
                    >
                      Xác nhận giao hàng
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => updateStatus(selOrd.id, "cancelled")}
                    >
                      Hủy đơn
                    </Button>
                  </>
                )}
                {selOrd.status === "shipping" && (
                  <Button
                    variant="success"
                    className="flex-1 w-full"
                    onClick={() => updateStatus(selOrd.id, "delivered")}
                  >
                    Xác nhận đã giao
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
