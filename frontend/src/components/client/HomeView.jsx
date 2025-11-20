import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Loader2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../../store";

export const HomeView = ({ searchQuery }) => {
  const navigate = useNavigate();
  const [state] = useStore();

  // 1. State quản lý dữ liệu
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${state.domain}/api/products`);
        if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Home load error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [state.domain]);

  // 3. Filter Logic
  const filtered = products.filter(
    (p) =>
      p.name && p.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  // Helper Image
  const getProductImage = (images) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p>Đang tải bộ sưu tập mới nhất...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">Có lỗi xảy ra: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* === 1. HERO SECTION (Chỉ hiện khi KHÔNG tìm kiếm) === */}
      {!searchQuery && (
        <>
          {/* Banner Chính */}
          <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop"
              alt="Hero Banner"
              className="w-full h-full object-cover object-center brightness-75"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-20 max-w-7xl mx-auto">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                New Collection 2025
              </span>
              <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 leading-tight animate-in fade-in slide-in-from-bottom-5 duration-1000">
                NÂNG TẦM <br /> BƯỚC CHÂN BẠN
              </h1>
              <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-lg animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                Khám phá những mẫu sneaker độc đáo, phong cách và thoải mái nhất
                dành cho mọi hành trình.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("product-list")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
              >
                Mua Sắm Ngay <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Dịch vụ (Services/Features) */}
          <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  <Truck size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">
                    Miễn phí vận chuyển
                  </h4>
                  <p className="text-sm text-gray-500">Đơn hàng trên 1 triệu</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-green-50 rounded-full text-green-600">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Hàng chính hãng</h4>
                  <p className="text-sm text-gray-500">
                    Cam kết 100% Authentic
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                  <RotateCcw size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Đổi trả dễ dàng</h4>
                  <p className="text-sm text-gray-500">Trong vòng 7 ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-2">
                <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                  <Headphones size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Hỗ trợ 24/7</h4>
                  <p className="text-sm text-gray-500">Hotline: 1900 xxxx</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === 2. PRODUCT LIST === */}
      <div id="product-list" className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {searchQuery ? `Kết quả: "${searchQuery}"` : "Sản Phẩm Nổi Bật"}
            </h2>
            <p className="text-gray-500">
              {searchQuery
                ? `Tìm thấy ${filtered.length} sản phẩm phù hợp`
                : "Những đôi giày được săn đón nhiều nhất tuần qua"}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              Không tìm thấy sản phẩm nào.
            </p>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-2">
                Thử tìm với từ khóa "Nike", "Adidas"...
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((product) => {
              const thumb = getProductImage(product.images);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full"
                >
                  {/* Image Area */}
                  <Link
                    to={`/product/${product.id}`}
                    className="relative block h-72 bg-gray-100 overflow-hidden"
                  >
                    <img
                      src={
                        `${state.domain}${thumb}` ||
                        "https://via.placeholder.com/400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400?text=Sneaker";
                      }}
                    />
                    {/* Overlay khi hover (tùy chọn) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                  </Link>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-1 rounded">
                        {product.category || "Sneaker"}
                      </span>
                    </div>

                    <Link to={`/product/${product.id}`}>
                      <h3
                        className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <div>
                        <span className="block text-xl font-bold text-gray-900">
                          {Number(product.price).toLocaleString("vi-VN")} ₫
                        </span>
                        {/* Giả lập giá gốc gạch ngang để nhìn hấp dẫn hơn */}
                        <span className="text-sm text-gray-400 line-through">
                          {(Number(product.price) * 1.1).toLocaleString(
                            "vi-VN",
                            { maximumFractionDigits: 0 }
                          )}{" "}
                          ₫
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
