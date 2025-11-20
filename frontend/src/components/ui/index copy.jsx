// import React, { useRef, useState, useEffect } from "react";
// import { useHistory } from "react-router-dom";
// import { useStore } from "../../store"

// import Banner from "./child/banner";
// import List from "./child/list";

// import "./style.scss";

// export default function HomePage() {
//   const [state, dispatch] = useStore();
//   const [data, setData] = useState([]);

//   useEffect(async () => {
//     try {
//       const response = await fetch(`${state.domain}/products/product-list`);
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       const result = await response.json();
//       console.log("Fetched product list:", result);
//       setData(result);
//     } catch (error) {
//       window.toast.error("Error fetching product list:", error);
//     }
//   }, []);


//   return (
//     <div className="home-page">
//       {data &&
//         data.map((category) => (
//           <div key={category.categoryId}>
//             <Banner
//               bannerUrl={`${state.domain}${encodeURI(category.bannerURL)}`}
//               width="100%"
//             />
//             <List
//               products={category.products}
//               categorize={category.categoryName}
//             />
//           </div>
//         ))}
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut, Home, CreditCard, Package, Settings, BarChart2, Plus, Trash2, Edit, CheckCircle, Truck, XCircle, Users, DollarSign, Lock, Unlock, QrCode, Save, Eye, Image as ImageIcon } from 'lucide-react';

// --- Mock Data ---
const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: 'Nike Air Force 1', 
    price: 2500000, 
    category: 'Lifestyle', 
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Huyền thoại sống mãi với thời gian. Nike Air Force 1 mang lại phong cách cổ điển pha lẫn hiện đại. Đế Air êm ái giúp bạn thoải mái cả ngày dài. Chất liệu da cao cấp dễ dàng vệ sinh.',
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ['White', 'Black']
  },
  { 
    id: 2, 
    name: 'Adidas Ultraboost', 
    price: 3200000, 
    category: 'Running', 
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee797455c32?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Đôi giày chạy bộ hoàn hảo với công nghệ đệm Boost phản hồi năng lượng cực tốt. Thân giày Primeknit ôm sát bàn chân, thoáng khí tối đa.',
    sizes: [40, 41, 42, 44],
    colors: ['Grey', 'Blue', 'Black']
  },
  { 
    id: 3, 
    name: 'Jordan 1 High OG', 
    price: 4500000, 
    category: 'Basketball', 
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Biểu tượng của văn hóa sát mặt đất. Thiết kế High-top bảo vệ cổ chân, phối màu OG cực chất dành cho các tín đồ thời trang đường phố.',
    sizes: [41, 42, 43],
    colors: ['Red', 'White']
  },
  { 
    id: 4, 
    name: 'Puma RS-X', 
    price: 1800000, 
    category: 'Lifestyle', 
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80'],
    description: 'Phong cách Retro Future độc đáo. Đế giày chunky hầm hố nhưng cực kỳ nhẹ nhàng.',
    sizes: [39, 40, 41],
    colors: ['Multi']
  },
  { 
    id: 5, 
    name: 'New Balance 550', 
    price: 2800000, 
    category: 'Vintage', 
    images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80'],
    description: 'Sự trở lại của dòng giày bóng rổ thập niên 80. Thiết kế đơn giản, tinh tế, dễ phối đồ.',
    sizes: [38, 39, 40, 41, 42],
    colors: ['White', 'Green']
  },
  { 
    id: 6, 
    name: 'Converse Chuck 70', 
    price: 1600000, 
    category: 'Classic', 
    images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80'],
    description: 'Phiên bản nâng cấp của dòng Classic với đế ngà vintage, vải canvas dày dặn hơn và đệm lót êm ái.',
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    colors: ['Black', 'Yellow', 'Parchment']
  },
];

const INITIAL_USERS = [
  { id: 'USER_123', name: 'Nguyen Van A', email: 'nguyenvana@gmail.com', role: 'user', status: 'active', spent: 0, orders: 0, picture: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random' },
  { id: 'ADMIN_001', name: 'Admin User', email: 'admin@store.com', role: 'admin', status: 'active', spent: 0, orders: 0, picture: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff' },
];

// --- Helper Functions ---
const getColorStyle = (colorName) => {
  const map = {
    'White': '#ffffff', 'Black': '#000000', 'Red': '#ef4444', 'Blue': '#3b82f6',
    'Green': '#22c55e', 'Yellow': '#eab308', 'Grey': '#6b7280', 'Multi': 'linear-gradient(45deg, red, blue)',
    'Parchment': '#f3e5ab'
  };
  const bg = map[colorName] || '#cbd5e1'; // Default gray
  return { background: bg, border: colorName === 'White' ? '1px solid #e5e7eb' : 'none' };
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-600 text-white hover:bg-green-700",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-gray-400 bg-transparent"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, className = '', type="text", ...props }) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    {type === 'textarea' ? (
      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" {...props} />
    ) : (
      <input type={type} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    shipping: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
    locked: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

// --- Main Application ---

export default function HomePage() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState([]); 
  const [allUsers, setAllUsers] = useState(INITIAL_USERS); 
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simulated Login
  const loginGoogle = (role = 'user') => {
    const foundUser = allUsers.find(u => u.role === role && u.status === 'active') || allUsers[0];
    if (foundUser.status === 'locked') {
      alert("Tài khoản của bạn đã bị khóa!");
      return;
    }
    setUser(foundUser);
    setView('home');
    setIsMenuOpen(false);
  };

  const logout = () => {
    setUser(null);
    setView('home');
    setCart([]);
    setIsMenuOpen(false);
  };

  // Add to Cart with Variants
  const addToCart = (product, size, color) => {
    if (!size || !color) {
      alert("Vui lòng chọn Size và Màu sắc!");
      return;
    }

    setCart(prev => {
      // Create a unique key for the item variation
      const itemKey = `${product.id}-${size}-${color}`;
      const exist = prev.find(x => x.cartItemId === itemKey);
      
      if (exist) {
        return prev.map(x => x.cartItemId === itemKey ? { ...x, qty: x.qty + 1 } : x);
      }
      
      return [...prev, { 
        ...product, 
        cartItemId: itemKey, // Unique ID for cart operations
        selectedSize: size, 
        selectedColor: color, 
        qty: 1 
      }];
    });
    alert(`Đã thêm ${product.name} (Size: ${size}, Màu: ${color}) vào giỏ!`);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(x => x.cartItemId !== cartItemId));
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePlaceOrder = (paymentMethod, customerInfo) => {
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.id || 'GUEST',
      userName: customerInfo.name,
      date: new Date().toISOString(),
      items: cart,
      total: totalPrice + 30000,
      status: 'pending',
      paymentMethod: paymentMethod,
      address: customerInfo.address,
      phone: customerInfo.phone
    };

    setOrders([newOrder, ...orders]);
    
    if (user) {
        setAllUsers(prev => prev.map(u => 
            u.id === user.id 
            ? { ...u, orders: u.orders + 1, spent: u.spent + newOrder.total } 
            : u
        ));
        setUser(prev => ({ ...prev, orders: (prev.orders || 0) + 1, spent: (prev.spent || 0) + newOrder.total }));
    }

    setCart([]);
    alert(`Đặt hàng thành công! Mã đơn: ${newOrder.id}`);
    setView('home');
  };

  // --- Views ---

  const Navbar = () => (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => setView('home')}>
            <span className="text-2xl font-bold text-blue-600">Sneaker<span className="text-gray-800">Store</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm giày..." 
                className="pl-10 pr-4 py-1 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 w-64 transition-all duration-300 focus:w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2" />
            </div>
            
            <div className="relative cursor-pointer group" onClick={() => setView('cart')}>
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                <div className="flex flex-col text-xs">
                  <span className="font-bold truncate max-w-[100px]">{user.name}</span>
                  <span className="text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => setView('user')}>Hồ sơ</span>
                </div>
                {user.role === 'admin' && (
                  <Button variant="outline" className="ml-2 py-1 px-2 text-xs h-8" onClick={() => setView('admin-stats')}>Admin</Button>
                )}
                <LogOut className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500 ml-2 transition-colors" onClick={logout} />
              </div>
            ) : (
              <div className="flex gap-2">
                 <Button variant="primary" className="py-1 px-3 text-sm h-9" onClick={() => loginGoogle('user')}>Login</Button>
                 <Button variant="secondary" className="py-1 px-3 text-sm h-9" onClick={() => loginGoogle('admin')}>Admin</Button>
              </div>
            )}
          </div>
          
           {/* Mobile Menu Button */}
           <div className="flex items-center md:hidden gap-4">
            <div className="relative cursor-pointer" onClick={() => setView('cart')}>
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-blue-600">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-40 px-4 pb-4 pt-2 space-y-4">
          {/* ... (Mobile menu content - similar to previous version) ... */}
           <div className="relative mt-2">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          </div>
          <Button variant="secondary" className="w-full justify-start" onClick={() => { setView('home'); setIsMenuOpen(false); }}>
             <Home className="w-4 h-4" /> Trang chủ
          </Button>
        </div>
      )}
    </nav>
  );

  const HomeView = () => {
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bộ sưu tập mới nhất</h2>
          <p className="text-gray-600 text-sm md:text-base">Khám phá các mẫu giày thể thao đang hot nhất thị trường.</p>
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div className="h-64 overflow-hidden relative group cursor-pointer flex-shrink-0" onClick={() => { setSelectedProduct(product); setView('detail'); }}>
                  {/* Handle legacy data or array data for images */}
                  <img src={Array.isArray(product.images) ? product.images[0] : product.images} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">{product.category}</p>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 cursor-pointer hover:text-blue-600 line-clamp-2" onClick={() => { setSelectedProduct(product); setView('detail'); }}>{product.name}</h3>
                  <div className="mt-auto pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{product.price.toLocaleString('vi-VN')} đ</span>
                    <button onClick={() => { setSelectedProduct(product); setView('detail'); }} className="p-2 bg-gray-100 rounded-full hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ProductDetailView = () => {
    const [activeImg, setActiveImg] = useState(selectedProduct.images[0]);
    const [chosenSize, setChosenSize] = useState(null);
    const [chosenColor, setChosenColor] = useState(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <Button variant="secondary" className="mb-6" onClick={() => setView('home')}>← Quay lại</Button>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white p-4 md:p-8 rounded-2xl shadow-sm">
            
            {/* Left: Images Gallery */}
            <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square relative shadow-inner">
                    <img src={activeImg} alt={selectedProduct.name} className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300" />
                </div>
                {selectedProduct.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {selectedProduct.images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImg(img)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImg === img ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="thumbnail"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Info & Selectors */}
            <div className="flex flex-col">
                <div className="mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{selectedProduct.category}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                <div className="text-3xl font-bold text-blue-600 mb-6">{selectedProduct.price.toLocaleString('vi-VN')} đ</div>

                {/* Description */}
                <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                    <p>{selectedProduct.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
                </div>
                
                {/* Colors */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <label className="font-medium text-gray-700">Màu sắc</label>
                        {chosenColor && <span className="text-sm text-blue-600 font-medium">{chosenColor}</span>}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {selectedProduct.colors?.map(c => (
                            <button 
                                key={c} 
                                onClick={() => setChosenColor(c)}
                                className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all ${chosenColor === c ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'}`}
                                style={getColorStyle(c)}
                                title={c}
                            >
                                {chosenColor === c && (c === 'White' || c === 'Parchment' || c === 'Yellow' ? <CheckCircle size={16} className="text-gray-800"/> : <CheckCircle size={16} className="text-white"/>)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sizes */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <label className="font-medium text-gray-700">Kích thước (EU)</label>
                        {chosenSize && <span className="text-sm text-blue-600 font-medium">Size {chosenSize}</span>}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {selectedProduct.sizes?.map(size => (
                            <button 
                                key={size} 
                                onClick={() => setChosenSize(size)}
                                className={`py-2 rounded-lg border font-medium transition-all ${chosenSize === size ? 'border-blue-600 bg-blue-50 text-blue-600 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-400'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t">
                    <Button variant="primary" className="w-full py-4 text-lg shadow-lg shadow-blue-100" onClick={() => addToCart(selectedProduct, chosenSize, chosenColor)}>
                        <ShoppingCart className="mr-2" /> Thêm vào giỏ hàng
                    </Button>
                </div>
            </div>
        </div>
        </div>
    );
  }

  const CartView = () => (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
        <ShoppingCart /> Giỏ hàng của bạn
      </h2>
      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">Giỏ hàng đang trống</p>
          <Button variant="primary" onClick={() => setView('home')}>Mua sắm ngay</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.cartItemId} className="flex items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <img src={Array.isArray(item.images) ? item.images[0] : item.images} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base md:text-lg truncate">{item.name}</h3>
                  <p className="text-blue-600 font-medium">{item.price.toLocaleString('vi-VN')} đ</p>
                  
                  {/* Display Selected Variants */}
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Size: <b className="text-gray-800">{item.selectedSize}</b></span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                        Màu: 
                        <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" style={getColorStyle(item.selectedColor)}></span> 
                        {item.selectedColor}
                    </span>
                    <span className="ml-auto">SL: {item.qty}</span>
                  </div>
                </div>
                <Button variant="danger" className="p-2 rounded-full flex-shrink-0 opacity-80 hover:opacity-100" onClick={() => removeFromCart(item.cartItemId)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-20">
             {/* Total Box */}
             <h3 className="text-xl font-bold mb-4">Tổng quan</h3>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Phí vận chuyển:</span>
              <span>30.000 đ</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-xl mb-6">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{(totalPrice + 30000).toLocaleString('vi-VN')} đ</span>
            </div>
            <Button variant="primary" className="w-full py-3" onClick={() => setView('pay')}>
              Tiến hành thanh toán
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const AdminProducts = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Enhanced Form Data State
    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        category: '', 
        imagesStr: '', // Handle comma separated URLs string
        description: '',
        sizesStr: '', // Handle comma separated numbers
        colorsStr: '' // Handle comma separated strings
    });

    const resetForm = () => {
        setFormData({ name: '', price: '', category: '', imagesStr: '', description: '', sizesStr: '', colorsStr: '' });
        setEditingId(null);
    }

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    }

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            imagesStr: product.images.join('\n'), // Join for textarea
            description: product.description || '',
            sizesStr: product.sizes?.join(', ') || '',
            colorsStr: product.colors?.join(', ') || ''
        });
        setEditingId(product.id);
        setShowModal(true);
    }

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    }

    const handleSave = (e) => {
        e.preventDefault();
        
        // Parse strings back to arrays
        const imagesArray = formData.imagesStr.split('\n').map(s => s.trim()).filter(s => s !== '');
        const sizesArray = formData.sizesStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const colorsArray = formData.colorsStr.split(',').map(s => s.trim()).filter(s => s !== '');

        const productPayload = {
            name: formData.name,
            price: Number(formData.price),
            category: formData.category,
            images: imagesArray.length > 0 ? imagesArray : ['https://via.placeholder.com/400'],
            description: formData.description,
            sizes: sizesArray.length > 0 ? sizesArray : [39, 40, 41],
            colors: colorsArray.length > 0 ? colorsArray : ['White']
        };

        if (editingId) {
            // Update
            setProducts(products.map(p => p.id === editingId ? { ...productPayload, id: editingId } : p));
        } else {
            // Add new
            const newProduct = {
                ...productPayload,
                id: Date.now()
            };
            setProducts([...products, newProduct]);
        }
        setShowModal(false);
        resetForm();
    }

    return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
        <Button variant="primary" onClick={handleAddNew}><Plus size={18} /> Thêm mới</Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-500 w-16">ID</th>
                <th className="p-4 font-medium text-gray-500 w-20">Ảnh</th>
                <th className="p-4 font-medium text-gray-500">Tên</th>
                <th className="p-4 font-medium text-gray-500">Giá</th>
                <th className="p-4 font-medium text-gray-500 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">#{p.id}</td>
                  <td className="p-4"><img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover bg-gray-200" /></td>
                  <td className="p-4 font-medium max-w-xs truncate" title={p.name}>{p.name}</td>
                  <td className="p-4 whitespace-nowrap">{p.price.toLocaleString()} đ</td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => handleEdit(p)}><Edit size={18} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" onClick={() => handleDelete(p.id)}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Tên sản phẩm" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required 
                        />
                        <Input 
                            label="Giá (VNĐ)" 
                            type="number"
                            value={formData.price} 
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            required 
                        />
                    </div>
                    
                    <Input 
                        label="Danh mục" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        placeholder="VD: Running, Lifestyle..."
                        required 
                    />

                    <Input 
                        label="Mô tả sản phẩm" 
                        type="textarea"
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Nhập mô tả chi tiết..."
                        className="min-h-[120px]"
                    />

                    <div className="grid grid-cols-2 gap-4">
                         <Input 
                            label="Sizes (cách nhau bởi dấu phẩy)" 
                            value={formData.sizesStr} 
                            onChange={e => setFormData({...formData, sizesStr: e.target.value})}
                            placeholder="39, 40, 41, 42"
                        />
                         <Input 
                            label="Màu sắc (cách nhau bởi dấu phẩy)" 
                            value={formData.colorsStr} 
                            onChange={e => setFormData({...formData, colorsStr: e.target.value})}
                            placeholder="Red, Blue, Black, White"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách link ảnh (mỗi dòng 1 link)</label>
                        <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] font-mono text-sm"
                            value={formData.imagesStr}
                            onChange={e => setFormData({...formData, imagesStr: e.target.value})}
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                            required
                        ></textarea>
                    </div>

                    {/* Preview Images */}
                    {formData.imagesStr && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Xem trước ảnh:</label>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {formData.imagesStr.split('\n').map((url, idx) => url.trim() && (
                                    <img key={idx} src={url} alt="Preview" className="w-16 h-16 object-cover rounded border bg-gray-50 flex-shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t mt-6">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button type="submit" variant="primary" className="flex-1"><Save size={18} /> Lưu lại</Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </AdminLayout>
  )};

  // Reuse Payment, Orders, Users, Stats components from previous version...
  // ... (Keeping AdminStats, AdminOrders, AdminUsers, PaymentView, UserInfoView exactly as they were, just ensuring they are defined)
  
  const PaymentView = () => {
    // ... (Same content as before)
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [customerInfo, setCustomerInfo] = useState({name: user?.name || '', phone: '', address: ''});
    const handleSubmit = (e) => { e.preventDefault(); if(!customerInfo.name || !customerInfo.phone || !customerInfo.address) { alert("Vui lòng điền đầy đủ!"); return; } handlePlaceOrder(paymentMethod, customerInfo); }
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
            <Button variant="secondary" className="mb-4" onClick={() => setView('cart')}>← Quay lại giỏ hàng</Button>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CreditCard /> Thanh toán</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Họ tên người nhận" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                        <Input label="Số điện thoại" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    </div>
                    <Input label="Địa chỉ giao hàng" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                    <div className="border-t pt-6">
                        <h3 className="font-bold mb-4">Phương thức thanh toán</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`border p-4 rounded-lg flex items-center gap-3 cursor-pointer ${paymentMethod === 'cod' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : ''}`} onClick={() => setPaymentMethod('cod')}>
                                <Truck className="w-5 h-5 text-blue-600" /><span className="font-medium">COD</span>
                            </div>
                            <div className={`border p-4 rounded-lg flex items-center gap-3 cursor-pointer ${paymentMethod === 'bank' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : ''}`} onClick={() => setPaymentMethod('bank')}>
                                <CreditCard className="w-5 h-5 text-blue-600" /><span>Chuyển khoản</span>
                            </div>
                        </div>
                        {paymentMethod === 'bank' && (<div className="mt-4 p-4 bg-gray-50 rounded border text-sm"><p>Ngân hàng: <b>MB Bank</b> - STK: <b>0000 1234 56789</b></p></div>)}
                    </div>
                    <Button type="submit" className="w-full py-3 mt-6">Xác nhận ({(totalPrice + 30000).toLocaleString()} đ)</Button>
                </form>
            </div>
        </div>
    );
  }

  const UserInfoView = () => {
      const userOrders = orders.filter(o => o.userId === user.id);
      return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <img src={user.picture} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100" />
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-8 grid grid-cols-3 gap-4 text-left">
                    <div className="bg-blue-50 p-4 rounded-xl"><div className="text-2xl font-bold text-blue-600">{user.orders || 0}</div><div className="text-sm text-gray-600">Đơn hàng</div></div>
                    <div className="bg-green-50 p-4 rounded-xl"><div className="text-2xl font-bold text-green-600">{(user.spent || 0).toLocaleString()}đ</div><div className="text-sm text-gray-600">Đã tiêu</div></div>
                </div>
                {userOrders.length > 0 && <div className="mt-8 text-left"><h3 className="font-bold mb-4">Lịch sử</h3>{userOrders.map(o => <div key={o.id} className="border p-3 rounded mb-2 flex justify-between"><span>{o.id}</span><span>{o.total.toLocaleString()}đ - {o.status}</span></div>)}</div>}
            </div>
        </div>
      );
  }

  const AdminStats = () => (
      <AdminLayout>
          <h2 className="text-2xl font-bold mb-6">Thống kê</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded shadow-sm border"><div className="text-gray-500">Doanh thu</div><div className="text-2xl font-bold">{orders.reduce((a,c)=>a+c.total,0).toLocaleString()} đ</div></div>
              <div className="bg-white p-6 rounded shadow-sm border"><div className="text-gray-500">Đơn hàng</div><div className="text-2xl font-bold">{orders.length}</div></div>
              <div className="bg-white p-6 rounded shadow-sm border"><div className="text-gray-500">Sản phẩm</div><div className="text-2xl font-bold">{products.length}</div></div>
              <div className="bg-white p-6 rounded shadow-sm border"><div className="text-gray-500">User</div><div className="text-2xl font-bold">{allUsers.length}</div></div>
          </div>
      </AdminLayout>
  );

  const AdminOrders = () => {
    const updateStatus = (id, st) => setOrders(orders.map(o => o.id === id ? {...o, status: st} : o));
    const [selOrd, setSelOrd] = useState(null);
    return (
        <AdminLayout>
            <h2 className="text-2xl font-bold mb-6">Đơn hàng</h2>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4">Mã</th><th className="p-4">Khách</th><th className="p-4">Tổng</th><th className="p-4">TT</th><th className="p-4">Action</th></tr></thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b">
                                <td className="p-4 font-bold">{o.id}</td>
                                <td className="p-4"><div>{o.userName}</div><div className="text-xs text-gray-500">{o.phone}</div></td>
                                <td className="p-4 font-bold text-blue-600">{o.total.toLocaleString()}</td>
                                <td className="p-4"><StatusBadge status={o.status}/></td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={()=>setSelOrd(o)} className="p-2 bg-gray-100 rounded"><Eye size={16}/></button>
                                    {o.status === 'pending' && <Button className="py-1 px-2 text-xs" onClick={()=>updateStatus(o.id, 'shipping')}>Duyệt</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selOrd && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-auto p-6">
                        <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">Chi tiết {selOrd.id}</h3><button onClick={()=>setSelOrd(null)}><X/></button></div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded"><b>Khách:</b> {selOrd.userName} - {selOrd.phone}<br/><b>ĐC:</b> {selOrd.address}</div>
                            <div>
                                {selOrd.items.map((i,idx)=>(
                                    <div key={idx} className="flex gap-3 border-b py-2">
                                        <img src={Array.isArray(i.images) ? i.images[0] : i.images} className="w-12 h-12 rounded bg-gray-200 object-cover"/>
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium">{i.name}</div>
                                            <div className="text-gray-500">Sz: {i.selectedSize} | Màu: {i.selectedColor} | SL: {i.qty}</div>
                                        </div>
                                        <div className="font-bold">{(i.price*i.qty).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Tổng</span><span>{selOrd.total.toLocaleString()} đ</span></div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
  }

  const AdminUsers = () => {
      const toggleLock = (id) => setAllUsers(allUsers.map(u => u.id === id ? {...u, status: u.status==='active'?'locked':'active'} : u));
      return (
          <AdminLayout>
              <h2 className="text-2xl font-bold mb-6">Người dùng</h2>
              <div className="bg-white rounded shadow overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                      <tbody>
                          {allUsers.map(u => (
                              <tr key={u.id} className="border-b">
                                  <td className="p-4 flex items-center gap-2"><img src={u.picture} className="w-8 h-8 rounded-full"/><div>{u.name}<div className="text-xs text-gray-500">{u.email}</div></div></td>
                                  <td className="p-4 uppercase text-xs font-bold">{u.role}</td>
                                  <td className="p-4"><StatusBadge status={u.status}/></td>
                                  <td className="p-4"><button onClick={()=>toggleLock(u.id)} className="text-blue-600">{u.status==='active' ? <Lock size={18}/> : <Unlock size={18}/>}</button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </AdminLayout>
      );
  }

  const AdminLayout = ({ children }) => (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-4 text-xl font-bold border-b border-gray-800">Admin Portal</div>
        <nav className="p-4 space-y-2">
          <div onClick={() => setView('admin-stats')} className={`flex items-center gap-3 p-3 rounded cursor-pointer ${view === 'admin-stats' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}><BarChart2 size={20} /> Thống kê</div>
          <div onClick={() => setView('admin-products')} className={`flex items-center gap-3 p-3 rounded cursor-pointer ${view === 'admin-products' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}><Package size={20} /> Sản phẩm</div>
          <div onClick={() => setView('admin-orders')} className={`flex items-center gap-3 p-3 rounded cursor-pointer ${view === 'admin-orders' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}><CreditCard size={20} /> Đơn hàng</div>
          <div onClick={() => setView('admin-users')} className={`flex items-center gap-3 p-3 rounded cursor-pointer ${view === 'admin-users' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}><Users size={20} /> Người dùng</div>
          <div onClick={() => setView('home')} className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-red-900 text-red-300 mt-8"><LogOut size={20} /> Thoát</div>
        </nav>
      </div>
      <div className="md:hidden flex-1 flex flex-col h-screen">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center"><span className="font-bold">Admin Portal</span><button onClick={() => setView('home')} className="text-sm bg-red-600 px-3 py-1 rounded">Thoát</button></div>
        <div className="flex overflow-x-auto bg-gray-800 text-white whitespace-nowrap"><div onClick={() => setView('admin-stats')} className="p-3">Thống kê</div><div onClick={() => setView('admin-products')} className="p-3">Sản phẩm</div><div onClick={() => setView('admin-orders')} className="p-3">Đơn hàng</div></div>
         <div className="flex-1 p-4 overflow-auto">{children}</div>
      </div>
      <div className="hidden md:block flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );

  // --- Routing Logic ---

  if (view.startsWith('admin-')) {
    if (view === 'admin-products') return <AdminProducts />;
    if (view === 'admin-orders') return <AdminOrders />;
    if (view === 'admin-users') return <AdminUsers />;
    if (view === 'admin-stats') return <AdminStats />;
    return <AdminStats />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0">
      <Navbar />
      <main className="transition-opacity duration-300 ease-in-out">
        {view === 'home' && <HomeView />}
        {view === 'detail' && selectedProduct && <ProductDetailView />}
        {view === 'cart' && <CartView />}
        {view === 'pay' && <PaymentView />}
        {view === 'user' && user && <UserInfoView />}
      </main>
      <footer className="bg-white border-t mt-12 py-8"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm"><p>&copy; 2025 SneakerStore.</p></div></footer>
    </div>
  );
}