import React, { useEffect, useState } from "react";
import "./style.scss";

export default function ProductUpdateForm() {
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/products/product-list")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const handleSelectProduct = (product, categoryId) => {
    setSelectedProduct({ ...product, categoryId });
    setNewImages([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const formData = new FormData();
    formData.append("productId", selectedProduct.productId);
    formData.append("categoryId", selectedProduct.categoryId);
    formData.append("productName", selectedProduct.productName);
    formData.append("price", selectedProduct.price);
    newImages.forEach((file) => formData.append("files", file));

    const res = await fetch("http://localhost:5000/products/update", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    alert(result.message || "Updated!");
  };

  return (
    <div className="product-update">
      <h2>Cập nhật sản phẩm</h2>

      <div className="layout">
        {/* Danh mục & sản phẩm */}
        <div className="category-list">
          {categories.map((cat) => (
            <div key={cat.categoryId} className="category">
              <div className="category-name">{cat.categoryName}</div>
              {cat.products.map((prod) => (
                <div
                  key={prod.productId}
                  onClick={() => handleSelectProduct(prod, cat.categoryId)}
                  className={`product-item ${
                    selectedProduct?.productId === prod.productId
                      ? "selected"
                      : ""
                  }`}
                >
                  {prod.productName}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Form update */}
        {selectedProduct && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input
                name="productName"
                value={selectedProduct.productName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Giá</label>
              <input
                name="price"
                value={selectedProduct.price}
                onChange={handleChange}
              />
            </div>

            {/* Ảnh hiện tại */}
            <div className="form-group">
              <label>Ảnh hiện tại</label>
              <div className="current-images">
                {selectedProduct.images?.map((img, i) => (
                  <img key={i} src={`http://localhost:5000${img.url}`} alt="" />
                ))}
              </div>
            </div>

            {/* Upload ảnh mới */}
            <div className="form-group">
              <label>Chọn ảnh mới (nhiều ảnh)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              {newImages.length > 0 && (
                <div className="preview-container">
                  {newImages.map((file, i) => (
                    <div key={i} className="preview-item">
                      <img src={URL.createObjectURL(file)} alt="preview" />
                      <button type="button" onClick={() => removeNewImage(i)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn">
              Lưu thay đổi
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
