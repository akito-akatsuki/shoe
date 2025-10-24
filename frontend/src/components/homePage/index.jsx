import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Banner from "./child/banner";
import List from "./child/list";
import { products as p1 } from "./data";

import "./style.scss";

export default function HomePage() {
  const [p, setP] = useState([]);

  useEffect(() => {
    const category = "Giày bóng rổ";
    // Fetch products from backend API
    fetch(`http://localhost:5000/products/${encodeURIComponent(category)}`)
      .then((response) => response.json())
      .then((data) => {
        setP(data);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <div className="home-page">
      <Banner
        bannerUrl="http://localhost:5000/storages/img/banner/IMG_0121.jpg"
        width="100%"
      />
      <List products={p} categorize="Giày bóng rổ" />
      <Banner
        bannerUrl="http://localhost:5000/storages/img/banner/IMG_0124.jpg"
        width="100%"
      />
      <List products={p1} categorize="Giày chạy bộ" />
      <Banner
        bannerUrl="http://localhost:5000/storages/img/banner/IMG_0125.jpg"
        width="100%"
      />
      <List products={p1} categorize="Giày thể thao" />
      <Banner
        bannerUrl="http://localhost:5000/storages/img/banner/IMG_0126.png"
        width="100%"
      />
      <List products={p1} categorize="Phụ kiện thể thao" />
    </div>
  );
}
