import React, { useEffect, useState } from "react";
import {useStore} from "../../store";

import "./style.scss";

export default function ProductManager() {
  const [state, dispatch] = useStore();
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: "",
  });
  const [productForm, setProductForm] = useState({
    productName: "",
    description: "",
    categoryId: "",
    stock: 0,
    price: 0,
  });
  const [images, setImages] = useState([]);

  // ✅ Lấy danh sách category
  const fetchCategories = async () => {
    const res = await fetch(`${state.domain}/products/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Thêm category
  const addCategory = async (e) => {
    e.preventDefault();
    const res = await fetch(`${state.domain}/products/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Thêm category thành công!");
      setCategoryForm({ categoryName: "", description: "" });
      fetchCategories();
    } else {
      alert(data.error || "Lỗi khi thêm category");
    }
  };

  // ✅ Khi chọn file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // ✅ Thêm product + upload ảnh
  const addProduct = async (e) => {
    e.preventDefault();

    if (!productForm.categoryId || !productForm.productName) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const formData = new FormData();
    formData.append("productName", productForm.productName);
    formData.append("description", productForm.description);
    formData.append("categoryId", productForm.categoryId);
    formData.append("stock", productForm.stock);
    formData.append("price", productForm.price);

    images.forEach((img) => formData.append("files", img));

    const res = await fetch(`${state.domain}/products/product`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("Thêm product thành công!");
      setProductForm({
        productName: "",
        description: "",
        categoryId: "",
        stock: 0,
        price: 0,
      });
      setImages([]);
    } else {
      alert(data.error || "Lỗi khi thêm product");
    }
  };

  return (
    <div className="product-manager">
      <h1>Quản lý Category & Product</h1>

      {/* --- Form thêm Category --- */}
      <div className="block">
        <h2>Thêm Category</h2>
        <form onSubmit={addCategory}>
          <input
            type="text"
            placeholder="Tên category"
            value={categoryForm.categoryName}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, categoryName: e.target.value })
            }
          />
          <textarea
            placeholder="Mô tả"
            value={categoryForm.description}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, description: e.target.value })
            }
          />
          <button type="submit">Thêm Category</button>
        </form>
      </div>

      {/* --- Form thêm Product --- */}
      <div className="block">
        <h2>Thêm Product</h2>
        <form onSubmit={addProduct} encType="multipart/form-data">
          <select
            value={productForm.categoryId}
            onChange={(e) =>
              setProductForm({ ...productForm, categoryId: e.target.value })
            }
          >
            <option value="">-- Chọn Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tên product"
            value={productForm.productName}
            onChange={(e) =>
              setProductForm({ ...productForm, productName: e.target.value })
            }
          />
          <textarea
            placeholder="Mô tả"
            value={productForm.description}
            onChange={(e) =>
              setProductForm({ ...productForm, description: e.target.value })
            }
          />
          <label>Số lượng tồn kho:</label>
          <input
            type="number"
            placeholder="Số lượng tồn kho"
            value={productForm.stock}
            onChange={(e) =>
              setProductForm({ ...productForm, stock: Number(e.target.value) })
            }
          />
          <label>Giá sản phẩm:</label>
          <input
            type="number"
            placeholder="Giá sản phẩm"
            value={productForm.price}
            onChange={(e) =>
              setProductForm({ ...productForm, price: Number(e.target.value) })
            }
          />

          <label>Hình ảnh sản phẩm:</label>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {images.length > 0 && (
              <div className="image-preview">
                {images.map((img, idx) => (
                  <img key={idx} src={URL.createObjectURL(img)} alt="preview" />
                ))}
              </div>
            )}
          </div>

          <button type="submit">Thêm Product</button>
        </form>
      </div>

      {/* --- Danh sách Category --- */}
      <div className="block category-list">
        <h2>Danh sách Category</h2>
        {categories.length === 0 ? (
          <p className="empty">Chưa có category nào.</p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <b>{c.categoryName}</b> — {c.description || "Không có mô tả"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
