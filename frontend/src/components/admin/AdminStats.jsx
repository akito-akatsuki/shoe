import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from "../../store";

export const AdminStats = ({ accessToken }) => {
    const [state] = useStore();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${state.domain}/api/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error("Không thể tải thống kê");
            }

            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Lỗi stats:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchStats();
        }
    }, [accessToken]);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải thống kê...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Thống kê tổng quan</h2>
                <Button variant="outline" onClick={fetchStats} title="Tải lại">
                    <RefreshCcw className="fill-transparent" size={18} />
                </Button>
            </div>
            
            {/* --- ĐÃ SỬA Ở ĐÂY --- */}
            {/* grid-cols-1: Mobile (1 cột) */}
            {/* sm:grid-cols-2: Tablet/Màn nhỏ (2 cột) */}
            {/* lg:grid-cols-4: Laptop/PC (4 cột) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Card Doanh thu */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105">
                    <div>
                        <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">Doanh thu</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">
                            {Number(stats.totalRevenue).toLocaleString()} đ
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                        <DollarSign className="fill-transparent" size={24} />
                    </div>
                </div>

                {/* Card Đơn hàng */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105">
                    <div>
                        <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">Đơn hàng</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">
                            {stats.totalOrders}
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                        <ShoppingCart className="fill-transparent" size={24} />
                    </div>
                </div>

                {/* Card Sản phẩm */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105">
                    <div>
                        <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">Sản phẩm</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">
                            {stats.totalProducts}
                        </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <Package className="fill-transparent" size={24} />
                    </div>
                </div>

                {/* Card Người dùng */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105">
                    <div>
                        <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">Người dùng</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">
                            {stats.totalUsers}
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <Users className="fill-transparent" size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};