import React, { useRef, useState, useEffect } from "react";
import { LoaderPage } from "../base/LoaderForm.jsx";
import { useHistory } from "react-router-dom";
import { useStore, actions } from "../../store";

import Banner from "./child/banner";
import List from "./child/list";

import "./style.scss";

export default function HomePage() {
  const [state, dispatch] = useStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      // Nếu allProducts rỗng hoặc undefined, bật loading
      if (!state.allProducts || state.allProducts.length === 0)
        setLoading(true);

      try {
        const response = await fetch(`${state.domain}/products/product-list`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        dispatch(actions.set_all_products(result));
      } catch (error) {
        console.error("Error fetching product list:", error);
        window.toast.error("Error fetching product list");
      } finally {
        // Chỉ tắt loading nếu trước đó đã bật
        if (!state.allProducts || state.allProducts.length === 0)
          setLoading(false);
      }
    };

    fetchProducts();
  }, [state.allProducts]);

  return (
    <>
      {loading ? (
        <LoaderPage />
      ) : (
        <div className="home-page">
          {state.allProducts &&
            state.allProducts.map((category) => (
              <div key={category.categoryId}>
                <Banner
                  bannerUrl={`${state.domain}${encodeURI(category.bannerURL)}`}
                  width="100%"
                />
                <List
                  products={category.products}
                  categorize={category.categoryName}
                />
              </div>
            ))}
        </div>
      )}
    </>
  );
}
