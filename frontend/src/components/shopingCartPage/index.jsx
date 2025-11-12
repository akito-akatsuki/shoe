// src/components/CartPage.js
import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import "./style.scss";

import trashIcon from "./assets/icons/trash-icon.svg";

const ShopingCartPage = () => {
  // Sample cart data
  const [state] = useStore();
  const [cartItems, setCartItems] = useState([]);

  useEffect(async () => {
    if (!state.accessToken) return;
    try {
      const response = await fetch(`${state.domain}/api/shopping-cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.accessToken}`, // 👈 quan trọng
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch cart items");
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      window.toast.error("Không thể tải giỏ hàng.");
      console.error("Error fetching cart items:", error);
    }
  }, [state.accessToken]);

  // Handle change quantity
  const handleQuantityChange = (id, action) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                action === "increase"
                  ? item.quantity + 1
                  : item.quantity > 1
                  ? item.quantity - 1
                  : item.quantity,
            }
          : item
      )
    );
  };

  // Handle item selection
  const handleSelectItem = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Calculate total selected items and price
  const calculateTotal = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    const totalPrice = selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    return { selectedCount: selectedItems.length, totalPrice };
  };

  const { selectedCount, totalPrice } = calculateTotal();

  // xóa item
  const handleRemove = async (product_id) => {
    try {
      const response = await fetch(
        `${state.domain}/api/shopping-cart/${product_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.accessToken}`, // gửi token
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }

      const data = await response.json();

      if (data.success) {
        // Cập nhật state để loại bỏ sản phẩm vừa xóa
        setCartItems((prev) => prev.filter((item) => item.id !== product_id));
        window.toast.success(data.message);
      } else {
        window.toast.error(data.message || "Xảy ra lỗi khi xóa sản phẩm");
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      window.toast.error("Không thể xóa sản phẩm, thử lại sau.");
    }
  };

  return (
    <div className="cart-page">
      <h2>Giỏ Hàng</h2>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => handleSelectItem(item.id)}
            />
            <img src={`${state.domain}${item.image}`} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.price.toLocaleString()} VND</p>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(item.id, "decrease")}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, "increase")}
                >
                  +
                </button>
              </div>
            </div>
            <div className="item-right">
              <button
                className="remove-button"
                onClick={() => handleRemove(item.id)}
              >
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    background: `url(${trashIcon}) center center / cover no-repeat`,
                  }}
                ></div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="footer">
        <p>Đã chọn {selectedCount} sản phẩm</p>
        <p>Tổng tiền: {totalPrice.toLocaleString()} VND</p>
        <button className="order-button" disabled={selectedCount === 0}>
          Đặt Hàng
        </button>
      </div>
    </div>
  );
};

export default ShopingCartPage;
