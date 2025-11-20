import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { getColorStyle } from "../../utils/helpers";
import { useStore } from "../../store";

export const ProductDetailView = ({ accessToken, onCartChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state] = useStore();

  // State
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // State lựa chọn
  const [activeImg, setActiveImg] = useState(null);
  const [chosenSize, setChosenSize] = useState(null);
  const [chosenColor, setChosenColor] = useState(null);

  // 1. Fetch Product Detail
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${state.domain}/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Sản phẩm không tồn tại");
          throw new Error("Lỗi tải dữ liệu");
        }
        const data = await res.json();

        // Xử lý parse JSON cho các trường images, sizes, colors nếu backend trả về string
        const parsedData = {
          ...data,
          images:
            typeof data.images === "string"
              ? JSON.parse(data.images)
              : data.images,
          sizes:
            typeof data.sizes === "string"
              ? JSON.parse(data.sizes)
              : data.sizes,
          colors:
            typeof data.colors === "string"
              ? JSON.parse(data.colors)
              : data.colors,
        };

        setProduct(parsedData);

        // Set ảnh mặc định
        if (parsedData.images && parsedData.images.length > 0) {
          setActiveImg(parsedData.images[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // 2. Handle Add to Cart
  const handleAddToCart = async () => {
    if (!chosenSize || !chosenColor) {
      alert("Vui lòng chọn Size và Màu sắc!");
      return;
    }

    if (!accessToken) {
      // Nếu chưa đăng nhập, chuyển hướng login hoặc báo lỗi
      if (
        window.confirm(
          "Bạn cần đăng nhập để thêm vào giỏ hàng. Đăng nhập ngay?"
        )
      ) {
        // Ở đây chưa có trang login riêng (dùng Google Login ở Navbar),
        // nên ta chỉ alert hoặc scroll lên top để user bấm login
        window.scrollTo(0, 0);
        alert("Vui lòng bấm nút Login phía trên bên phải màn hình.");
      }
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${state.domain}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          selected_size: chosenSize,
          selected_color: chosenColor,
        }),
      });

      if (!res.ok) throw new Error("Lỗi thêm vào giỏ");

      if (onCartChange) onCartChange();
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
      // Có thể gọi 1 callback props để reload giỏ hàng trên Navbar nếu muốn (optional)
    } catch (err) {
      console.error(err);
      alert("Không thể thêm vào giỏ hàng: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Loading UI
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 fill-transparent" />
      </div>
    );

  // 4. Error UI (404)
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-500 fill-transparent" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Không tìm thấy sản phẩm!
        </h2>
        <p className="text-gray-500 mb-6">
          {error || "Sản phẩm có thể đã bị xóa hoặc đường dẫn không đúng."}
        </p>
        <Button onClick={() => navigate("/")}>Về trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="secondary"
        className="mb-6 p-1 flex justify-center items-center hover:no-underline hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </Button>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square relative shadow-inner border border-gray-200 group">
            <img
              src={`${state.domain}${activeImg}` || (`${state.domain}${product.images}` && `${state.domain}${product.images[0]}`)}
              alt={product.name}
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              onError={(e) =>
                (e.target.src = "https://t4.ftcdn.net/jpg/01/37/57/81/360_F_137578103_ulK9MbD9IfKACx9RZe6Rx7PAyBA9aN2K.jpg")
              }
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === img
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={`${state.domain}${img}`}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide border border-blue-100">
              {product.category || "Sneaker"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {product.name}
          </h1>
          <div className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-3">
            {Number(product.price).toLocaleString("vi-VN")} đ
            {/* Giả lập giá cũ */}
            <span className="text-lg text-gray-400 line-through font-normal">
              {(Number(product.price) * 1.2).toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Colors */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <label className="font-bold text-gray-700">Màu sắc</label>
              {chosenColor && (
                <span className="text-sm text-blue-600 font-bold animate-pulse">
                  {chosenColor}
                </span>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {product.colors?.map((c) => (
                <button
                  key={c}
                  onClick={() => setChosenColor(c)}
                  className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all ${
                    chosenColor === c
                      ? "ring-2 ring-offset-2 ring-blue-600 scale-110"
                      : "hover:scale-105 border border-gray-200"
                  }`}
                  style={getColorStyle(c)}
                  title={c}
                >
                  {chosenColor === c && (
                    <CheckCircle
                      size={18}
                      className={
                        ["White", "Yellow", "Beige", "Cream"].includes(c)
                          ? "text-gray-800 fill-transparent"
                          : "text-white fill-transparent"
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <label className="font-bold text-gray-700">Kích thước (EU)</label>
              {chosenSize && (
                <span className="text-sm text-blue-600 font-bold animate-pulse">
                  Size {chosenSize}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setChosenSize(size)}
                  className={`py-2.5 rounded-lg border font-medium transition-all ${
                    chosenSize === size
                      ? "border-blue-600 bg-blue-600 text-white shadow-md transform scale-105"
                      : "border-gray-200 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <Button
              variant="primary"
              className="w-full py-4 text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin fill-transparent" /> Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart className="fill-transparent" /> Thêm vào giỏ hàng
                </span>
              )}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Miễn phí vận chuyển cho đơn hàng trên 1.000.000 đ
            </p>
          </div>
        </div>
        <div className="md:col-span-2 w-full mt-10 prose prose-sm text-gray-600 mb-8 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-2 uppercase">
            Mô tả sản phẩm
          </h3>
          <p>
            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </p>
        </div>
      </div>
    </div>
  );
};
