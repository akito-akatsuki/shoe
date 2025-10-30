import React from "react";
import { useStore } from "../../../../store";

import "./style.scss";

export default function List({ categorize, products }) {
  const [state] = useStore();

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
                  background: `url(${state.domain}${encodeURI(
                    item.url
                  )}) center center / cover no-repeat`,
                }}
              ></div>
              <div className="wapper-content">
                <div className="product-title">{item.productName}</div>
                <div className="product-price">{item.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
