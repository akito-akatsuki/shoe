// src/components/CartPage.js
import React, { useState } from "react";
import "./style.scss";

const ShopingCartPage = () => {
  // Sample cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Sản phẩm A",
      price: 100000,
      image: "https://via.placeholder.com/100",
      quantity: 1,
      selected: false,
    },
    {
      id: 2,
      name: "Sản phẩm B",
      price: 200000,
      image: "https://via.placeholder.com/100",
      quantity: 1,
      selected: false,
    },
    {
      id: 3,
      name: "Sản phẩm C",
      price: 150000,
      image: "https://via.placeholder.com/100",
      quantity: 1,
      selected: false,
    },
  ]);

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
            <img src={item.image} alt={item.name} />
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
