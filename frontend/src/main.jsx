import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Outlet,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import UI Components
import { Navbar } from "./components/layout/Navbar";
import { AdminLayout } from "./components/layout/AdminLayout";

// Import Client Views
import { HomeView } from "./components/client/HomeView";
import { ProductDetailView } from "./components/client/ProductDetailView";
import { CartView } from "./components/client/CartView";
import { PaymentView } from "./components/client/PaymentView";
import { UserInfoView } from "./components/client/UserInfoView";

// Import Admin Views
import { AdminStats } from "./components/admin/AdminStats";
import { AdminProducts } from "./components/admin/AdminProducts";
import { AdminOrders } from "./components/admin/AdminOrders";
import { AdminUsers } from "./components/admin/AdminUsers";

// Data (Giữ lại MOCK_PRODUCTS để hiển thị sản phẩm nếu chưa có API Product)
import { MOCK_PRODUCTS } from "./data/mockData";
import { useStore } from "./store";

// --- Layout Wrapper cho Khách Hàng ---
const MainLayout = ({
  user,
  cartCount,
  onGoogleLoginSuccess,
  onGoogleLoginError,
  logout,
  searchQuery,
  setSearchQuery,
}) => (
  <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0">
    <Navbar
      user={user}
      cartCount={cartCount} // Truyền số lượng thực tế xuống Navbar
      onGoogleLoginSuccess={onGoogleLoginSuccess}
      onGoogleLoginError={onGoogleLoginError}
      logout={logout}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
    <main className="min-h-[calc(100dvh-64px-85px-48px)] transition-opacity duration-300 ease-in-out">
      <Outlet />
    </main>
    <footer className="bg-white border-t mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p>&copy; 2025 SneakerStore. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

// --- Protected Route (Bảo vệ trang Admin) ---
const ProtectedRoute = ({ user, role, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children ? children : <Outlet />;
};

export default function MainContent() {
  const [state] = useStore();
  // State
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // STATE MỚI: Quản lý số lượng giỏ hàng toàn cục
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- API HELPER FUNCTIONS ---

  // 1. Refresh Token: Gọi endpoint /refresh để lấy token mới từ cookie httpOnly
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${state.domain}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // Quan trọng: gửi cookie đi kèm
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.accessToken;
    } catch (err) {
      console.error("Refresh error:", err);
      return null;
    }
  };

  // 2. Lấy thông tin user (/me)
  const fetchUserInfo = useCallback(async (token) => {
    try {
      const res = await fetch(`${state.domain}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Nếu token không hợp lệ thì reset
        setUser(null);
        setAccessToken(null);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  }, []);

  // --- AUTHENTICATION FLOW ---

  // --- HÀM MỚI: Lấy số lượng giỏ hàng từ API ---
  const fetchCartCount = useCallback(
    async (token) => {
      const tokenToUse = token || accessToken;
      if (!tokenToUse) {
        setCartCount(0);
        return;
      }

      try {
        const res = await fetch(`${state.domain}/api/cart`, {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });
        if (res.ok) {
          const items = await res.json();
          // Tính tổng số lượng (Quantity) của tất cả items
          const totalQty = items.reduce((acc, item) => acc + item.qty, 0);
          setCartCount(totalQty);
        }
      } catch (err) {
        console.error("Lỗi lấy số lượng giỏ:", err);
      }
    },
    [accessToken]
  );

  // --- INITIALIZE ---
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const newToken = await refreshAccessToken(); // Hàm này bạn lấy từ code cũ
      if (newToken) {
        setAccessToken(newToken);
        await fetchUserInfo(newToken); // Hàm này bạn lấy từ code cũ
        await fetchCartCount(newToken); // <--- GỌI LẤY GIỎ HÀNG KHI LOGIN
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 4. Xử lý Login Google thành công
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${state.domain}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
        credentials: "include", // Để backend set cookie refresh token
      });

      const data = await res.json();

      if (res.ok) {
        setAccessToken(data.accessToken);
        setUser(data.user);
      } else {
        alert("Đăng nhập thất bại: " + (data.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Lỗi kết nối đến server");
    }
  };

  const handleGoogleLoginError = () => {
    console.log("Google Login Failed");
    alert("Đăng nhập Google thất bại");
  };

  // 5. Xử lý Logout
  const logout = async () => {
    try {
      await fetch(`${state.domain}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }
    // Clear client state
    setUser(null);
    setAccessToken(null);
    setCart([]);
    // navigate('/'); // Nếu cần redirect về trang chủ
  };

  // --- CART & ORDER LOGIC (Client-Side Only cho Demo) ---
  const addToCart = (product, size, color) => {
    if (!size || !color) {
      alert("Vui lòng chọn Size và Màu sắc!");
      return;
    }
    setCart((prev) => {
      const itemKey = `${product.id}-${size}-${color}`;
      const exist = prev.find((x) => x.cartItemId === itemKey);
      if (exist) {
        return prev.map((x) =>
          x.cartItemId === itemKey ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartItemId: itemKey,
          selectedSize: size,
          selectedColor: color,
          qty: 1,
        },
      ];
    });
    alert(`Đã thêm ${product.name} vào giỏ!`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x.cartItemId !== id));
  };

  const totalPrice = cart.reduce((a, i) => a + i.price * i.qty, 0);

  const handlePlaceOrder = (paymentMethod, customerInfo) => {
    // Trong thực tế: Gọi API POST /orders
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.id || "GUEST",
      userName: customerInfo.name,
      date: new Date().toISOString(),
      items: cart,
      total: totalPrice + 30000,
      status: "pending",
      paymentMethod: paymentMethod,
      address: customerInfo.address,
      phone: customerInfo.phone,
    };

    setOrders([newOrder, ...orders]);

    // Cập nhật giả lập nếu có user (thực tế Backend sẽ làm việc này)
    if (user) {
      setUser((prev) => ({
        ...prev,
        // Lưu ý: đây chỉ là update state tạm thời, dữ liệu thật cần reload từ API
        loginCount: prev.loginCount, // giữ nguyên
      }));
    }

    setCart([]);
    alert(`Đặt hàng thành công! Mã đơn: ${newOrder.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={state.clientId}>
    <Router>
      <Routes>
        {/* --- CLIENT ROUTES --- */}
        <Route
          path="/"
          element={
            <MainLayout
              user={user}
              cartCount={cartCount} // Truyền count xuống layout
              onGoogleLoginSuccess={handleGoogleLoginSuccess}
              onGoogleLoginError={() => alert("Login Failed")}
              logout={logout}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          }
        >
          <Route index element={<HomeView searchQuery={searchQuery} />} />
          {/* --- SỬA 1: Truyền hàm cập nhật xuống trang chi tiết --- */}
          <Route
            path="product/:id"
            element={
              <ProductDetailView
                accessToken={accessToken}
                onCartChange={() => fetchCartCount(accessToken)} // <--- QUAN TRỌNG
              />
            }
          />

          {/* --- SỬA 2: Truyền hàm cập nhật xuống giỏ hàng (để xử lý xóa) --- */}
          <Route
            path="cart"
            element={
              <CartView
                accessToken={accessToken}
                onCartChange={() => fetchCartCount(accessToken)} // <--- QUAN TRỌNG
              />
            }
          />

          {/* --- SỬA 3: Truyền hàm reset về 0 xuống trang thanh toán --- */}
          <Route
            path="checkout"
            element={
              <PaymentView
                user={user}
                accessToken={accessToken}
                onOrderSuccess={() => setCartCount(0)} // <--- Đặt hàng xong thì set về 0 luôn
              />
            }
          />
          <Route
            path="profile"
            element={
              user ? (
                <UserInfoView user={user} accessToken={accessToken} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="stats" />} />
          <Route
            path="stats"
            element={<AdminStats accessToken={accessToken} />}
          />
          <Route
            path="products"
            element={<AdminProducts accessToken={accessToken} />}
          />
          <Route
            path="orders"
            element={<AdminOrders accessToken={accessToken} />}
          />
          <Route
            path="users"
            element={<AdminUsers accessToken={accessToken} />}
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-xl font-bold text-gray-500">
              404 - Không tìm thấy trang
            </div>
          }
        />
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
}
