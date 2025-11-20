import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { ShoppingCart, Search, Menu, X, LogOut, Home, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { GoogleLogin } from '@react-oauth/google'; // Import Google Login

export const Navbar = ({ user, cartCount, onGoogleLoginSuccess, onGoogleLoginError, logout, searchQuery, setSearchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
              Sneaker<span className="text-gray-800">Store</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Search Input */}
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
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative cursor-pointer group">
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                {user.picture ? (
                    <img src={user.picture} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.name?.charAt(0) || 'U'}
                    </div>
                )}
                
                <div className="flex flex-col text-xs">
                  <span className="font-bold truncate max-w-[100px]">{user.name}</span>
                  <Link to="/profile" className="text-gray-500 cursor-pointer hover:text-blue-600">Hồ sơ</Link>
                </div>
                {user.role === 'admin' && (
                  <Button variant="outline" className="ml-2 py-1 px-2 text-xs h-8" onClick={() => navigate('/admin')}>Admin</Button>
                )}
                <LogOut className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-500 ml-2 transition-colors" onClick={logout} />
              </div>
            ) : (
              // Google Login Button
              <div className="flex items-center">
                  <GoogleLogin
                    onSuccess={onGoogleLoginSuccess}
                    onError={onGoogleLoginError}
                    type="standard"
                    theme="outline"
                    size="medium"
                    text="signin_with"
                    shape="rectangular"
                  />
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button & Cart */}
          <div className="flex items-center md:hidden gap-4">
            <Link to="/cart" className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-blue-600">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-40 px-4 pb-4 pt-2 space-y-4">
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
          
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block">
            <Button variant="secondary" className="w-full justify-start">
               <Home className="w-4 h-4 mr-2" /> Trang chủ
            </Button>
          </Link>

          {/* Mobile User Actions */}
          {user ? (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3 p-2">
                  <img src={user.picture || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-sm text-blue-600">Xem hồ sơ</Link>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Button variant="outline" className="w-full mb-2" onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}>Trang quản trị</Button>
                )}
                <Button variant="danger" className="w-full" onClick={() => { logout(); setIsMenuOpen(false); }}>Đăng xuất</Button>
             </div>
          ) : (
             <div className="flex justify-center pt-2 border-t border-gray-100">
                 <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        onGoogleLoginSuccess(credentialResponse);
                        setIsMenuOpen(false);
                    }}
                    onError={onGoogleLoginError}
                    type="standard"
                    theme="filled_blue"
                    width="250"
                  />
             </div>
          )}
        </div>
      )}
    </nav>
  );
};