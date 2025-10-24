import React from "react";

import "./style.scss";

export default function List({ categorize, products }) {
  return (
    <div className="product-list-container">
      <div className="categorize-section">{categorize}</div>
      <div className="product-list">
        {products.map((item) => (
          <div className="product-box" key={item.id}>
            <div className="product-item">
              <div
                className="product-image"
                style={{
                  background: `url(${encodeURI(
                    item.img
                  )}) center center / cover no-repeat`,
                }}
              ></div>
              {console.log(item.url)}
              <div className="wapper-content">
                <div className="product-title">{item.name}</div>
                <div className="product-price">{item.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
