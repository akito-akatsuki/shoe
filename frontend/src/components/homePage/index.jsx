import React, { useRef, useState, useEffect } from "react";
import { LoaderPage } from "../base/LoaderForm.jsx";
import { useHistory } from "react-router-dom";
import { useStore } from "../../store";

import Banner from "./child/banner";
import List from "./child/list";

import "./style.scss";

export default function HomePage() {
  const [state, dispatch] = useStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${state.domain}/products/product-list`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("Fetched product list:", result);
      setData(result);
    } catch (error) {
      window.toast.error("Error fetching product list:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {loading ? (
        <LoaderPage />
      ) : (
        <div className="home-page">
          {data &&
            data.map((category) => (
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
