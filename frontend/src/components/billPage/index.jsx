import React from "react";
import "./style.scss";

import userIcon from "./assets/svg/user.svg";

export default function BillPage() {
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
            <h3>Infomation:</h3>
            <p>
              <img
                src={userIcon}
                alt="User"
                style={{ width: "20px", height: "20px" }}
              />{" "}
              Name: Nguyễn Văn A
            </p>
            <p>📞 Phone: +84 912 345 678</p>
            <p>📍 Address: Số 13 Quang Trung, Thành phố Vinh, Nghệ An</p>
            <div className="invoice-meta">
              <p>Hóa đơn: #12345</p>
              <p>Ngày: 06/01/2025</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mục</th>
                <th className="center">Số lượng</th>
                <th className="center">Đơn giá</th>
                <th className="center">Giảm giá</th>
                <th className="center">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sửa giày sneaker</td>
                <td className="center">1</td>
                <td className="center">2.000.000đ</td>
                <td className="center">2%</td>
                <td className="center">2.000.000đ</td>
              </tr>
              <tr>
                <td>Vệ sinh giày sneaker</td>
                <td className="center">2</td>
                <td className="center">2.000.000đ</td>
                <td className="center">2%</td>
                <td className="center">4.000.000đ</td>
              </tr>
              <tr>
                <td>Chống nước cho giày sneaker</td>
                <td className="center">1</td>
                <td className="center">2.000.000đ</td>
                <td className="center">2%</td>
                <td className="center">2.000.000đ</td>
              </tr>
            </tbody>
          </table>

          <div className="total">
            <p>Tổng cộng: 8.000.000đ</p>
            <p>Thuế (0%): 0đ</p>
            <p>
              <strong>Tổng tiền: 8.000.000đ</strong>
            </p>
          </div>

          <div className="payment-info">
            <h3>Thông tin Thanh toán</h3>
            <p>Ngân hàng:</p>
            <p>Tên tài khoản: Giày</p>
            <p>Số tài khoản: 00001012456</p>
            <p>Hạn thanh toán: 06/01/2025</p>
          </div>
        </div>

        <div className="footer">
          ✉️ <span className="highlight">xinchao@trangwebhay.vn</span> | 📍 123
          Đường ABC, Thành phố DEF | ☎️{" "}
          <span className="highlight">+84 912 345 678</span>
        </div>
      </div>
    </div>
  );
}
