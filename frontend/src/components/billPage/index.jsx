import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.scss";
import userIcon from "./assets/svg/user.svg";
import { useStore } from "../../store";

export default function BillPage() {
  const [state] = useStore();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        console.log(orderId);
        const res = await fetch(`${state.domain}/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) return <div>Đang tải hóa đơn...</div>;
  if (!order) return <div>Không tìm thấy hóa đơn</div>;

  return (
    <div className="bill-container">
      <div className="invoice">
        <div className="invoice-header">
          <div className="shop-name">
            Giày
            <span>trangwebhay.vn</span>
          </div>
          <div className="logo"></div>
        </div>

        <div className="content">
          <h2>HÓA ĐƠN THANH TOÁN</h2>

          <div className="customer-info">
            <h3>Information:</h3>
            <p>
              <img src={userIcon} style={{ width: 20 }} /> Name:{" "}
              {order.customerName}
            </p>
            <p>📞 Phone: {order.customerPhone || "Chưa cung cấp"}</p>

            <div className="invoice-meta">
              <p>Hóa đơn: #{order.id}</p>
              <p>Ngày: {order.created_at?.split("T")[0]}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mục</th>
                <th className="center">Số lượng</th>
                <th className="center">Đơn giá</th>
                <th className="center">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{order.productName}</td>
                <td className="center">{order.quantity}</td>
                <td className="center">
                  {Number(order.unitPrice).toLocaleString("vi-VN")} đ
                </td>
                <td className="center">
                  {Number(order.total).toLocaleString("vi-VN")} đ
                </td>
              </tr>
            </tbody>
          </table>

          <div className="total">
            <p>
              <strong>
                Tổng tiền: {Number(order.total).toLocaleString()} đ
              </strong>
            </p>
          </div>

          <div className="payment-info">
            <h3>Thông tin Thanh toán</h3>
            <p>Ngân hàng: Vietcombank</p>
            <p>Tên tài khoản: Giày</p>
            <p>Số tài khoản: 00001012456</p>
          </div>
        </div>

        <div className="footer">
          ✉️ <span className="highlight">xinchao@trangwebhay.vn</span>
        </div>
      </div>
    </div>
  );
}
