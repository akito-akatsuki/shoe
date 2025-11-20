// src/components/layout/AdminLayout.jsx
import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom'; // 1. Import Router hooks
import { BarChart2, Package, CreditCard, Users, LogOut } from 'lucide-react';

export const AdminLayout = () => {
  // Hàm tiện ích để xác định style cho Link khi active
  const getNavLinkClass = ({ isActive }) => 
    `flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const getMobileLinkClass = ({ isActive }) => 
    `p-3 whitespace-nowrap ${
      isActive ? 'text-blue-400 font-bold border-b-2 border-blue-400' : 'text-gray-300'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- Desktop Sidebar --- */}
      <div className="hidden md:block w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-4 text-xl font-bold border-b border-gray-800">Admin Portal</div>
        <nav className="p-4 space-y-2">
          {/* Dùng NavLink để tự động highlight khi active */}
          <NavLink to="/admin/stats" className={getNavLinkClass}>
            <BarChart2 size={20} /> Thống kê
          </NavLink>
          
          <NavLink to="/admin/products" className={getNavLinkClass}>
            <Package size={20} /> Sản phẩm
          </NavLink>
          
          <NavLink to="/admin/orders" className={getNavLinkClass}>
            <CreditCard size={20} /> Đơn hàng
          </NavLink>
          
          <NavLink to="/admin/users" className={getNavLinkClass}>
            <Users size={20} /> Người dùng
          </NavLink>
          
          {/* Nút Thoát về trang chủ */}
          <Link to="/" className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-red-900 text-red-300 mt-8 transition-colors">
            <LogOut size={20} /> Thoát
          </Link>
        </nav>
      </div>

      {/* --- Mobile View --- */}
      <div className="md:hidden flex-1 flex flex-col h-screen">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center flex-shrink-0">
          <span className="font-bold">Admin Portal</span>
          <Link to="/" className="text-sm bg-red-600 px-3 py-1 rounded text-white">Thoát</Link>
        </div>
        
        {/* Mobile Horizontal Nav */}
        <div className="flex overflow-x-auto bg-gray-800 text-white scrollbar-hide flex-shrink-0">
          <NavLink to="/admin/stats" className={getMobileLinkClass}>Thống kê</NavLink>
          <NavLink to="/admin/products" className={getMobileLinkClass}>Sản phẩm</NavLink>
          <NavLink to="/admin/orders" className={getMobileLinkClass}>Đơn hàng</NavLink>
          <NavLink to="/admin/users" className={getMobileLinkClass}>Users</NavLink>
        </div>
        
        {/* Mobile Content Area */}
        <div className="flex-1 p-4 overflow-auto">
           <Outlet /> {/* Nơi hiển thị nội dung con */}
        </div>
      </div>

      {/* --- Desktop Content Area --- */}
      <div className="hidden md:block flex-1 p-8 overflow-auto h-screen">
        <Outlet /> {/* Nơi hiển thị nội dung con */}
      </div>
    </div>
  );
};