import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { LoaderPage } from "../base/LoaderForm.jsx";
import { useParams } from "react-router-dom";
import { useStore } from "../../store";
import "./style.scss";

const ProductDetails = () => {
  const history = useHistory();
  const { productId } = useParams();
  const [state] = useStore();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${state.domain}/products/product/${productId}`
        );
        if (!res.ok) throw new Error(`Lỗi khi tải sản phẩm (${res.status})`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const formatCurrency = (v) =>
    (parseFloat(v) || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const handlePlaceOrder = async () => {
    if (!product) return;
    if (qty < 1) return alert("Số lượng phải lớn hơn 0");
    if (qty > product.stock)
      return alert(`Chỉ còn ${product.stock} sản phẩm trong kho.`);

    const orderPayload = {
      customerName: "Khách vãng lai",
      customerPhone: "",
      productId: product.id,
      quantity: qty,
      unitPrice: parseFloat(product.price),
      total: parseFloat(product.price) * qty,
    };

    try {
      setPlacing(true);
      const res = await fetch(`${state.domain}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi đặt hàng");
      alert(`Đặt hàng thành công! Mã đơn: ${json.orderId || "—"}`);
      history.push(`/bill/${json.orderId}`);
    } catch (err) {
      console.error(err);
      alert("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading)
    return (
      <div className="product-details">
        <LoaderPage />
      </div>
    );
  if (error) return <div className="product-details error">{error}</div>;
  if (!product) return <div className="product-details">Chưa có sản phẩm</div>;

  const mainImage =
    Array.isArray(product.imageUrl) && product.imageUrl.length > 0
      ? `${state.domain}${product.imageUrl[0]}`
      : "https://via.placeholder.com/480x360?text=No+Image";

  // add to shopping cart

  const handleAddToCart = async () => {
    if (!product) return;
    if (qty < 1) return alert("Số lượng phải lớn hơn 0");
    try {
      const res = await fetch(`${state.domain}/api/shopping-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.accessToken}`, // 👈 quan trọng
        },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Lỗi thêm vào giỏ hàng");
      window.toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error(err);
      window.toast.error("Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="product-details">
      <div className="product-top">
        <div className="image-gallery">
          <img src={mainImage} alt={product.productName} className="main-img" />
          <div className="thumbs">
            {Array.isArray(product.imageUrl) &&
              product.imageUrl.map((url, i) => (
                <img
                  key={i}
                  src={`${state.domain}${url}`}
                  alt={`Ảnh ${i + 1}`}
                  onClick={() =>
                    (document.querySelector(
                      ".main-img"
                    ).src = `${state.domain}${url}`)
                  }
                />
              ))}
          </div>
        </div>

        <div className="info">
          <h1 className="title">{product.productName}</h1>
          <p className="sku">
            Mã: <strong>{product.id}</strong>
          </p>
          <p className="price">{formatCurrency(product.price)}</p>
          <p className="stock">
            Tồn kho: <strong>{product.stock ?? 0}</strong>
          </p>

          <div className="actions">
            <label className="qty">
              Số lượng
              <input
                type="number"
                min="1"
                max={product.stock ?? 9999}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
            </label>

            <div className="total">
              Thành tiền:{" "}
              <strong>{formatCurrency((product.price || 0) * qty)}</strong>
            </div>

            <div className="buttons">
              <button
                className="btn btn-primary"
                onClick={handlePlaceOrder}
                disabled={placing || (product.stock || 0) <= 0}
              >
                {placing ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>

              <button className="btn btn-ghost" onClick={handleAddToCart}>
                Thêm vào giỏ
              </button>
            </div>

            <div className="meta">
              <small>
                Ngày nhập kho:{" "}
                {product.restockDate ? product.restockDate.split("T")[0] : "—"}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="product-description">
        <h2>Mô tả sản phẩm</h2>
        <div
          className="desc-content"
          dangerouslySetInnerHTML={{
            __html: product.description.replace(/\r?\n/g, "<br/>"),
          }}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
