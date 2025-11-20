import React, { useState, useEffect } from "react";
import { Lock, Unlock, RefreshCcw, Shield, User } from "lucide-react";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "../ui/Button";
import { useStore } from "../../store";

export const AdminUsers = ({ accessToken }) => {
  const [state] = useStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Hàm lấy danh sách Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${state.domain}/api/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Lỗi tải danh sách người dùng");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  // 2. Hàm Toggle Lock (Khóa/Mở khóa)
  const toggleLock = async (user) => {
    // Không cho phép tự khóa chính mình hoặc khóa admin khác (tùy logic)
    if (user.role === "admin") {
      alert("Không thể khóa tài khoản Admin!");
      return;
    }

    const newStatus = user.status === "active" ? "locked" : "active";
    const confirmMsg =
      newStatus === "locked"
        ? `Bạn có chắc muốn KHÓA tài khoản ${user.name}?`
        : `Mở khóa cho tài khoản ${user.name}?`;

    if (!window.confirm(confirmMsg)) return;

    // Optimistic Update: Cập nhật UI trước cho mượt
    const previousUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    try {
      const res = await fetch(`${state.domain}/api/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Lỗi cập nhật trạng thái");

      // (Tùy chọn) Có thể hiển thị thông báo thành công
      // alert(`Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} thành công`);
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + err.message);
      // Rollback lại trạng thái cũ nếu lỗi server
      setUsers(previousUsers);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải danh sách người dùng...
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <Button variant="outline" onClick={fetchUsers} title="Tải lại">
          <RefreshCcw className="fill-transparent" size={18} />
        </Button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Đăng nhập</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b hover:bg-gray-50 last:border-0"
                  >
                    <td className="p-4 flex items-center gap-3">
                      {u.picture ? (
                        <img
                          src={u.picture}
                          className="w-10 h-10 rounded-full border object-cover"
                          alt=""
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/40?text=U";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <User className="fill-transparent" size={20} />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                        <div className="text-[10px] text-gray-400">
                          ID: {u.id.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {u.role === "admin" && <Shield className="fill-transparent" size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {u.login_count || 0} lần
                      <div className="text-[10px] text-gray-400">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("vi-VN")
                          : "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-4">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => toggleLock(u)}
                          className={`p-2 rounded transition-colors ${
                            u.status === "active"
                              ? "text-red-500 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            u.status === "active" ? "Khóa tài khoản" : "Mở khóa"
                          }
                        >
                          {u.status === "active" ? (
                            <Lock className="fill-transparent" size={18} />
                          ) : (
                            <Unlock className="fill-transparent" size={18} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
