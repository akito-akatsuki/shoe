import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, RefreshCcw, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useStore } from "../../store";

export const AdminProducts = ({ accessToken }) => {
    const [state] = useStore();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({ 
        name: '', price: '', category: '', description: '', sizesStr: '', colorsStr: '' 
    });
    
    // State quản lý ảnh
    const [existingImages, setExistingImages] = useState([]); // Ảnh cũ (URL string)
    const [newFiles, setNewFiles] = useState([]); // Ảnh mới (File object)

    // 1. Fetch Products (Giữ nguyên)
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${state.domain}/api/products`);
            if (!res.ok) throw new Error("Lỗi tải sản phẩm");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // Reset Form
    const resetForm = () => {
        setFormData({ name: '', price: '', category: '', description: '', sizesStr: '', colorsStr: '' });
        setExistingImages([]);
        setNewFiles([]);
        setEditingId(null);
    }

    // Mở Modal Thêm mới
    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    }

    // Mở Modal Sửa
    const handleEdit = (product) => {
        const parseArr = (val) => {
            if (Array.isArray(val)) return val;
            try { return JSON.parse(val); } catch { return []; }
        };

        const images = parseArr(product.images);
        const sizes = parseArr(product.sizes);
        const colors = parseArr(product.colors);

        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            sizesStr: sizes.join(', '),
            colorsStr: colors.join(', ')
        });
        setExistingImages(images); // Load ảnh cũ vào state
        setNewFiles([]); // Reset ảnh mới
        setEditingId(product.id);
        setShowModal(true);
    }

    // Xử lý chọn file ảnh
    const handleFileChange = (e) => {
        if (e.target.files) {
            // Gộp thêm file mới vào danh sách
            const filesArray = Array.from(e.target.files);
            setNewFiles(prev => [...prev, ...filesArray]);
        }
    };

    // Xóa ảnh cũ (khỏi danh sách hiển thị)
    const removeExistingImage = (indexToRemove) => {
        setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Xóa ảnh mới (khỏi danh sách chuẩn bị upload)
    const removeNewFile = (indexToRemove) => {
        setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // SAVE (Dùng FormData)
    const handleSave = async (e) => {
        e.preventDefault();

        const sizesArray = formData.sizesStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const colorsArray = formData.colorsStr.split(',').map(s => s.trim()).filter(s => s !== '');

        // Tạo FormData
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('sizes', JSON.stringify(sizesArray));
        data.append('colors', JSON.stringify(colorsArray));

        // Append ảnh cũ (để backend biết giữ lại ảnh nào)
        existingImages.forEach(url => {
            data.append('keepImages', url);
        });

        // Append ảnh mới (để backend upload và xử lý)
        newFiles.forEach(file => {
            data.append('newImages', file);
        });

        try {
            let res;
            const headers = {
                'Authorization': `Bearer ${accessToken}` 
                // Lưu ý: KHÔNG set 'Content-Type': 'application/json' khi gửi FormData
                // Trình duyệt sẽ tự set multipart/form-data boundary
            };

            if (editingId) {
                res = await fetch(`${state.domain}/api/products/${editingId}`, {
                    method: 'PUT',
                    headers: headers,
                    body: data
                });
            } else {
                res = await fetch(`${state.domain}/api/products`, {
                    method: 'POST',
                    headers: headers,
                    body: data
                });
            }

            if (!res.ok) throw new Error("Lỗi lưu sản phẩm");

            await fetchProducts();
            setShowModal(false);
            resetForm();

        } catch (err) {
            console.error(err);
            alert("Lỗi: " + err.message);
        }
    }

    // Delete giữ nguyên
    const handleDelete = async (id) => { /* ...giữ nguyên... */ }

    // --- RENDER ---
    if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
      <div>
        {/* Header & Table giữ nguyên, chỉ sửa phần Modal bên dưới */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <div className="flex gap-2">
              <Button variant="outline" onClick={fetchProducts} title="Tải lại"><RefreshCcw className="fill-transparent" size={18} /></Button>
              <Button variant="primary" onClick={handleAddNew}><Plus className="fill-transparent" size={18} /> Thêm mới</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
             {/* ... Table code giữ nguyên ... */}
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
                {products.map(p => {
                     let thumb = '';
                     if (Array.isArray(p.images) && p.images.length > 0) thumb = p.images[0];
                     else if (typeof p.images === 'string') {
                          try { const parsed = JSON.parse(p.images); thumb = parsed[0]; } catch {}
                     }
                    return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 text-gray-500">#{p.id}</td>
                        <td className="p-4"><img src={`${state.domain}${thumb}`} className="w-10 h-10 rounded object-cover border" alt=""/></td>
                        <td className="p-4 font-medium">{p.name}</td>
                        <td className="p-4">{Number(p.price).toLocaleString()} đ</td>
                        <td className="p-4 text-right space-x-2">
                            <button onClick={() => handleEdit(p)} className="text-blue-600 p-1"><Edit className="fill-transparent" size={18}/></button>
                            <button onClick={() => handleDelete(p.id)} className="text-red-600 p-1"><Trash2 className="fill-transparent" size={18}/></button>
                        </td>
                    </tr>
                )})}
              </tbody>
            </table>
             </div>
        </div>

        {/* --- MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b bg-white sticky top-0 z-10">
                      <h3 className="text-xl font-bold">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="fill-transparent" size={24} /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="Tên sản phẩm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                          <Input label="Giá (VNĐ)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                      </div>
                      <Input label="Danh mục" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                           <Input label="Sizes (VD: 39, 40)" value={formData.sizesStr} onChange={e => setFormData({...formData, sizesStr: e.target.value})} />
                           <Input label="Colors (VD: Red, Blue)" value={formData.colorsStr} onChange={e => setFormData({...formData, colorsStr: e.target.value})} />
                      </div>

                      {/* --- KHU VỰC UPLOAD ẢNH --- */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm (Tự động cắt vuông)</label>
                          
                          {/* Nút chọn ảnh */}
                          <div className="flex items-center justify-center w-full mb-4">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-2 text-gray-500 fill-transparent" />
                                      <p className="text-sm text-gray-500"><span className="font-semibold">Click để tải ảnh</span> hoặc kéo thả</p>
                                      <p className="text-xs text-gray-500">JPG, PNG (Sẽ tự cắt khung vuông)</p>
                                  </div>
                                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                              </label>
                          </div>

                          {/* Hiển thị ảnh đã chọn & ảnh cũ */}
                          <div className="grid grid-cols-4 gap-4">
                              {/* Ảnh cũ */}
                              {existingImages.map((url, idx) => (
                                  <div key={`old-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                      <img src={`${state.domain}${url}`} alt="old" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <X className="fill-transparent" size={12} />
                                      </button>
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">Đã có</div>
                                  </div>
                              ))}
                              
                              {/* Ảnh mới chọn */}
                              {newFiles.map((file, idx) => (
                                  <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-blue-300 ring-2 ring-blue-100">
                                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                          <X className="fill-transparent" size={12} />
                                      </button>
                                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-1">Mới</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      {/* --- END UPLOAD --- */}

                      <div className="flex gap-3 pt-4 border-t mt-6">
                          <Button type="button" variant="secondary" className="flex-1 p-2.5" onClick={() => setShowModal(false)}>Hủy</Button>
                          <Button type="submit" variant="primary" className="flex-1 p-2.5"><Save className="fill-transparent" size={18} /> Lưu lại</Button>
                      </div>
                  </form>
              </div>
          </div>
        )}
      </div>
    )
};