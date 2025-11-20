import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Loader2, Package, User, RefreshCcw, CheckCircle, QrCode, X, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from "../../store";

export const UserInfoView = ({ user, accessToken }) => {
    const [state] = useStore(); 
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State MỚI: Lưu đơn hàng đang muốn thanh toán lại (để hiện Modal)
    const [payingOrder, setPayingOrder] = useState(null);

    // 1. Fetch Orders
    const fetchMyOrders = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${state.domain}/api/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMyOrders(); }, [accessToken]);

    // 2. Hàm xử lý: Khách xác nhận đã nhận hàng
    const handleConfirmReceived = async (orderId) => {
        if (!window.confirm("Bạn xác nhận đã nhận được hàng và sản phẩm nguyên vẹn?")) return;

        try {
            const res = await fetch(`${state.domain}/api/orders/${orderId}/receive`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert("Cảm ơn bạn đã mua hàng!");
                fetchMyOrders(); // Tải lại danh sách để cập nhật trạng thái
            } else {
                const err = await res.json();
                alert(err.error || "Lỗi xác nhận");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối");
        }
    };

    // 3. Helper tạo link QR (VietQR)
    const getQrUrl = (orderId, amount) => {
        const BANK_ID = state.BANK_ID; 
        const ACCOUNT_NO = state.ACCOUNT_NO; // Thay số tài khoản của bạn
        const TEMPLATE = "compact2";
        const content = `Pay ${orderId}`;
        return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
    };

    // Tính toán thống kê
    const totalSpent = orders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? Number(curr.total) : 0), 0);
    const totalOrders = orders.length;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 relative">
            <div className="grid md:grid-cols-12 gap-8">
                {/* Cột trái: User Info */}
                <div className="md:col-span-4 lg:col-span-3 h-fit">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center sticky top-24">
                        <img src={user.picture || "https://via.placeholder.com/100"} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50 shadow-sm" alt="Avatar" />
                        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <div className="text-xl font-bold text-blue-600">{totalOrders}</div>
                                <div className="text-xs text-gray-600 font-medium">Đơn hàng</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                <div className="text-xl font-bold text-green-600">
                                    {totalSpent > 1000000 ? `${(totalSpent/1000000).toFixed(1)}M` : `${(totalSpent/1000).toFixed(0)}k`}
                                </div>
                                <div className="text-xs text-gray-600 font-medium">Chi tiêu</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Order History */}
                <div className="md:col-span-8 lg:col-span-9">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-blue-600 fill-transparent"/> Lịch sử đơn hàng
                        </h3>
                        <Button variant="outline" onClick={fetchMyOrders} title="Làm mới" className="p-2 h-auto"><RefreshCcw className="fill-transparent" size={16} /></Button>
                    </div>

                    {isLoading ? <div className="text-center py-10"><Loader2 className="animate-spin inline fill-transparent"/> Đang tải...</div> : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-50">
                                        <div>
                                            <span className="font-bold text-gray-800 text-lg mr-3">#{order.id}</span>
                                            <span className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-3 mb-4">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 text-sm text-gray-600">
                                                    <img 
                                                        src={item.image || 'https://via.placeholder.com/50'} 
                                                        className="w-12 h-12 rounded object-cover border bg-gray-100" 
                                                        alt="" 
                                                        onError={(e) => e.target.src='https://via.placeholder.com/50'}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">{item.product_name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Size: {item.selected_size} | Màu: {item.selected_color} | x{item.quantity}
                                                        </div>
                                                    </div>
                                                    <div className="font-bold">
                                                        {Number(item.price * item.quantity).toLocaleString()} đ
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 italic text-sm">Đang cập nhật chi tiết...</div>
                                        )}
                                    </div>

                                    {/* Footer & Actions */}
                                    <div className="bg-gray-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex justify-between items-center mt-2">
                                        <div className="text-sm text-gray-500">
                                            {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-2">
                                                <span className="text-xs text-gray-500 mr-2">Tổng tiền:</span>
                                                <span className="font-bold text-blue-600 text-lg">{Number(order.total).toLocaleString()} đ</span>
                                            </div>

                                            {/* Nút 1: Thanh toán lại (Cho đơn Bank + Pending) */}
                                            {order.status === 'pending' && order.payment_method === 'bank' && (
                                                <Button 
                                                    onClick={() => setPayingOrder(order)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 h-auto shadow-sm flex items-center gap-1"
                                                >
                                                    <QrCode className="fill-transparent" size={14} /> Thanh toán ngay
                                                </Button>
                                            )}

                                            {/* Nút 2: Đã nhận hàng (Cho đơn Shipping) */}
                                            {order.status === 'shipping' && (
                                                <Button 
                                                    onClick={() => handleConfirmReceived(order.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 h-auto flex items-center gap-1"
                                                >
                                                    <CheckCircle className="fill-transparent" size={14} /> Đã nhận hàng
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL THANH TOÁN QR --- */}
            {payingOrder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Thanh toán đơn #{payingOrder.id}</h3>
                            <button onClick={() => setPayingOrder(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                <X className="fill-transparent" size={20}/>
                            </button>
                        </div>
                        
                        <div className="p-6 flex flex-col items-center">
                            <div className="bg-white p-2 rounded-xl border-2 border-blue-100 shadow-sm mb-4">
                                <img 
                                    src={getQrUrl(payingOrder.id, payingOrder.total)} 
                                    alt="QR Code" 
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            
                            <div className="w-full space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngân hàng:</span>
                                    <span className="font-bold">MB Bank</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tài khoản:</span>
                                    <span className="font-bold">0000 1234 56789</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tiền:</span>
                                    <span className="font-bold text-blue-600 text-base">{Number(payingOrder.total).toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-gray-500">Nội dung:</span>
                                    <div className="flex items-center gap-2 font-mono font-bold bg-white px-2 py-1 rounded border">
                                        Pay {payingOrder.id}
                                        <Copy size={12} className="cursor-pointer text-gray-400 hover:text-black fill-transparent" onClick={() => navigator.clipboard.writeText(`Pay ${payingOrder.id}`)}/>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-center text-gray-400 mt-4 max-w-xs">
                                Sau khi chuyển khoản, vui lòng chờ Admin xác nhận (thường trong 15-30 phút).
                            </p>
                        </div>
                        
                        <div className="p-4 border-t bg-gray-50 flex justify-center">
                             <Button onClick={() => setPayingOrder(null)} variant="secondary" className="w-full">Đóng</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};