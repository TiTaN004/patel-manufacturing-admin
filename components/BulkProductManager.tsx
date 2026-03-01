import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { BulkUser, BulkProduct, BulkBaseMaster, BulkMasterProduct } from '../types';
import { Button } from './ui/Button';
import { 
  Users, 
  Plus, 
  Search, 
  Package, 
  Trash2, 
  Edit3, 
  X, 
  Save,
  ChevronRight,
  UserCheck,
  Layers,
  Box,
  Loader2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { uploadAPI, IMG_BASE_URL } from '../utils/api';

export const BulkProductManager: React.FC = () => {
  const { bulkUsers, bulkProducts, bulkMasters, bulkMasterProducts, actions, loading } = useData();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const masterOptionLabel = (m: BulkBaseMaster) => m.value;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BulkProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedMasterIds, setSelectedMasterIds] = useState<number[]>([]);

  const [formData, setFormData] = useState<Partial<BulkProduct>>({
    product_type: 'box',
    sr_no: '',
    box_name: '',
    size: '',
    paper: '',
    liner: '',
    sheet_size: '',
    no_sheet: '',
    die_no: '',
    plate_name: '',
    available_colors: '',
    available_shapes: ''
  });

  useEffect(() => {
    if (selectedUser) {
      actions.fetchBulkProducts(parseInt(selectedUser.userID));
    }
  }, [selectedUser]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = { ...formData, userID: parseInt(selectedUser.userID) };

    if (editingProduct) {
      await actions.updateBulkProduct(editingProduct.id, payload);
    } else {
      await actions.addBulkProduct(payload);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      product_type: 'box',
      sr_no: '',
      box_name: '',
      size: '',
      paper: '',
      liner: '',
      sheet_size: '',
      no_sheet: '',
      die_no: '',
      plate_name: '',
      available_colors: '',
      available_shapes: ''
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await uploadAPI.single(uploadData);
      if (res.data.success) {
        setFormData(prev => ({ ...prev, product_image: res.data.data.url }));
      }
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Failed to upload image');
    }
  };

  const openEditModal = (product: BulkProduct) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const filteredUsers = bulkUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobileNo.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-8 border-b bg-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Box className="h-6 w-6 text-indigo-600" />
              Bulk Product Registry
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage specialized box and base specifications for bulk clients.</p>
          </div>
          
          {selectedUser && (
            <Button 
                onClick={() => { setEditingProduct(null); setFormData({ product_type: 'box', sr_no: '', box_name: '', size: '', paper: '', liner: '', sheet_size: '', no_sheet: '', die_no: '', plate_name: '', available_colors: '', available_shapes: '' }); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-black shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              New Specification
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* User Sidebar */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search bulk users..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 outline-none text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map(user => (
              <button
                key={user.userID}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 text-left border-b transition-all flex items-center justify-between group ${
                  selectedUser?.userID === user.userID ? 'bg-indigo-50 border-r-4 border-r-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                    selectedUser?.userID === user.userID ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${selectedUser?.userID === user.userID ? 'text-indigo-900' : 'text-slate-700'}`}>{user.fullName}</p>
                    <p className="text-xs text-slate-400 font-medium">{user.mobileNo}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`transition-transform ${selectedUser?.userID === user.userID ? 'text-indigo-600 translate-x-1' : 'text-slate-200 group-hover:text-slate-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {!selectedUser ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                <UserCheck className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Select a Bulk User</h3>
              <p className="text-slate-500 mt-2 font-medium">Choose a client from the sidebar to view and manage their specific product catalog.</p>
            </div>
          ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">{selectedUser.fullName}'s Products</h3>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Managing Specifications</p>
                        </div>
                    </div>

                    <Button 
                      onClick={() => setIsBulkModalOpen(true)}
                      variant="secondary"
                      className="border-2 border-indigo-100 rounded-2xl px-6 py-3 font-black text-indigo-600 flex items-center gap-2"
                    >
                      <Layers size={18} />
                      Bulk Add from Master
                    </Button>
                </div>

                {bulkProducts.length === 0 ? (
                    <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-indigo-50/30 flex flex-col items-center justify-center text-center">
                        <Package className="h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No products registered yet</p>
                        <Button 
                            variant="secondary" 
                            className="mt-6 border-2 border-indigo-100 rounded-2xl font-black text-indigo-600"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add First Specification
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {bulkProducts.map(product => (
                            <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(product)} className="h-10 w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                        <Edit3 size={18} />
                                    </button>
                                    <button onClick={() => { if(window.confirm('Delete this specification?')) actions.deleteBulkProduct(product.id, parseInt(selectedUser.userID)) }} className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 border-white shadow-inner shrink-0 group-hover:rotate-6 transition-all overflow-hidden ${product.product_type === 'base' ? 'bg-indigo-600' : 'bg-slate-50'}`}>
                                        {product.product_image ? (
                                          <img src={`${IMG_BASE_URL}${product.product_image}`} alt={product.box_name} className="h-full w-full object-cover" />
                                        ) : (
                                          product.product_type === 'base' ? <Layers size={24} className="text-white" /> : <Box size={24} className="text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="pr-20">
                                        <div className="flex items-center gap-2">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${product.product_type === 'base' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {product.product_type || 'box'}
                                          </span>
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.sr_no || 'No SR#'}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 mt-0.5">
                                          {product.product_type === 'base' ? `Size: ${product.size}` : product.box_name}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {product.product_type !== 'base' && (
                                              <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Size: {product.size}</span>
                                            )}
                                            {product.product_type !== 'base' && (
                                              <>
                                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Die: {product.die_no}</span>
                                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">Sheet: {product.no_sheet}</span>
                                              </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {product.product_type === 'base' ? (
                                  <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Colors</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {(product.available_colors || '').split(',').map(c => c.trim()).filter(Boolean).map((color, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">{color}</span>
                                          ))}
                                          {!(product.available_colors) && <span className="text-xs text-slate-300 italic">No colors defined</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Shapes</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {(product.available_shapes || '').split(',').map(s => s.trim()).filter(Boolean).map((shape, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">{shape}</span>
                                          ))}
                                          {!(product.available_shapes) && <span className="text-xs text-slate-300 italic">No shapes defined</span>}
                                        </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plate Name</p>
                                          <p className="text-sm font-black text-slate-800 truncate">{product.plate_name || '-'}</p>
                                      </div>
                                      <div className="space-y-1">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paper / Liner</p>
                                          <p className="text-sm font-black text-slate-800 truncate">{product.paper || '-'} / {product.liner || '-'}</p>
                                      </div>
                                      <div className="space-y-1">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sheet Size</p>
                                          <p className="text-sm font-black text-slate-800 truncate">{product.sheet_size || '-'}</p>
                                      </div>
                                  </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="text-xl font-black tracking-tight">{editingProduct ? 'Update Specification' : 'New Product Register'}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">For {selectedUser?.fullName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="mb-8 flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-[2rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {formData.product_image ? (
                      <img src={`${IMG_BASE_URL}${formData.product_image}`} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={48} className="text-slate-200" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-indigo-700 transition-all">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {formData.product_image && (
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, product_image: ''})}
                      className="absolute -top-2 -right-2 h-8 w-8 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-rose-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Image (Max 200KB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Product Type</label>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, product_type: 'box'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black border-2 transition-all ${
                        formData.product_type === 'box' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <Box size={18} /> Box
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, product_type: 'base'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black border-2 transition-all ${
                        formData.product_type === 'base' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <Layers size={18} /> Base
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 lg:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sr No.</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                    value={formData.sr_no}
                    onChange={e => setFormData({...formData, sr_no: e.target.value})}
                  />
                </div>
                {formData.product_type === 'box' && (
                  <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Box Name *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                      value={formData.box_name}
                      onChange={e => setFormData({...formData, box_name: e.target.value})}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Size *</label>
                  {formData.product_type === 'base' ? (
                    <select
                      required
                      className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                      value={formData.size}
                      onChange={e => {
                        const selectedSize = e.target.value;
                        setFormData({...formData, size: selectedSize, box_name: `Base ${selectedSize}`});
                      }}
                    >
                      <option value="">Select Size</option>
                      {bulkMasters.filter(m => m.type === 'size').map(m => (
                        <option key={m.id} value={m.value}>{masterOptionLabel(m)}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required
                      className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                      value={formData.size}
                      onChange={e => setFormData({...formData, size: e.target.value})}
                    />
                  )}
                </div>

                {formData.product_type === 'base' ? (
                  <>
                    <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Permitted Colors</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bulkMasters.filter(m => m.type === 'color').map(m => {
                          const isSelected = formData.available_colors?.split(',').map(c => c.trim()).includes(m.value);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                const colors = formData.available_colors ? formData.available_colors.split(',').map(c => c.trim()).filter(Boolean) : [];
                                const newColors = isSelected ? colors.filter(c => c !== m.value) : [...colors, m.value];
                                setFormData({...formData, available_colors: newColors.join(', ')});
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                isSelected ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {masterOptionLabel(m)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Permitted Shapes</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bulkMasters.filter(m => m.type === 'shape').map(m => {
                          const isSelected = formData.available_shapes?.split(',').map(c => c.trim()).includes(m.value);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                const shapes = formData.available_shapes ? formData.available_shapes.split(',').map(c => c.trim()).filter(Boolean) : [];
                                const newShapes = isSelected ? shapes.filter(s => s !== m.value) : [...shapes, m.value];
                                setFormData({...formData, available_shapes: newShapes.join(', ')});
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                isSelected ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {masterOptionLabel(m)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Paper</label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                        value={formData.paper}
                        onChange={e => setFormData({...formData, paper: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Liner</label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                        value={formData.liner}
                        onChange={e => setFormData({...formData, liner: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sheet Size</label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                        value={formData.sheet_size}
                        onChange={e => setFormData({...formData, sheet_size: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">No. Sheet</label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                        value={formData.no_sheet}
                        onChange={e => setFormData({...formData, no_sheet: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Die No.</label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                        value={formData.die_no}
                        onChange={e => setFormData({...formData, die_no: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Plate Only Name</label>
                      <input 
                        type="text" 
                        className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                        value={formData.plate_name}
                        onChange={e => setFormData({...formData, plate_name: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-10 flex gap-4">
                <Button 
                    variant="secondary" 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 font-black rounded-2xl"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 font-black rounded-2xl shadow-xl shadow-indigo-200"
                >
                    <Save className="mr-2 h-5 w-5" /> {editingProduct ? 'Save Changes' : 'Create Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bulk Assignment Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 h-[80vh]">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-indigo-900 text-white">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Bulk Add from Master</h3>
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mt-1">Select multiple products for {selectedUser?.fullName}</p>
              </div>
              <button onClick={() => { setIsBulkModalOpen(false); setSelectedMasterIds([]); }} className="h-12 w-12 flex items-center justify-center bg-indigo-800 text-indigo-300 hover:text-white rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bulkMasterProducts.map(master => {
                  const isSelected = selectedMasterIds.includes(master.id);
                  const isAlreadyAssigned = bulkProducts.some(p => 
                    p.product_type === master.product_type && 
                    p.box_name === master.box_name && 
                    p.size === master.size
                  );

                  return (
                    <button 
                      key={master.id}
                      disabled={isAlreadyAssigned}
                      onClick={() => {
                        setSelectedMasterIds(prev => 
                          isSelected ? prev.filter(id => id !== master.id) : [...prev, master.id]
                        );
                      }}
                      className={`flex items-start gap-4 p-5 rounded-[1.5rem] border-2 transition-all text-left group ${
                        isAlreadyAssigned
                          ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                          : isSelected 
                            ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' 
                            : 'bg-white border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-transform ${
                        !isAlreadyAssigned && 'group-hover:scale-110'
                      } ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {master.product_image ? (
                          <img src={`${IMG_BASE_URL}${master.product_image}`} alt={master.box_name} className="h-full w-full object-cover" />
                        ) : (
                          master.product_type === 'base' ? <Layers size={20} /> : <Box size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${master.product_type === 'base' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            {master.product_type}
                          </span>
                          {isAlreadyAssigned ? (
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded">Already Assigned</span>
                          ) : (
                            isSelected && <div className="h-5 w-5 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-110 animate-in zoom-in duration-200"><UserCheck size={12} /></div>
                          )}
                        </div>
                        <h4 className={`font-black mt-1 truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {master.product_type === 'base' ? `Base Size: ${master.size}` : master.box_name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{master.size}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Items</p>
                <p className="text-lg font-black text-indigo-900">{selectedMasterIds.length} <span className="text-sm text-slate-400">Products</span></p>
              </div>
              <div className="flex gap-4">
                <Button 
                   variant="secondary" 
                   onClick={() => { setIsBulkModalOpen(false); setSelectedMasterIds([]); }}
                   className="px-8 py-4 font-black rounded-2xl"
                >
                  Cancel
                </Button>
                <Button 
                   onClick={async () => {
                     if (selectedMasterIds.length === 0) return;
                     await actions.bulkAssignMasterProducts(parseInt(selectedUser.userID), selectedMasterIds);
                     setIsBulkModalOpen(false);
                     setSelectedMasterIds([]);
                   }}
                   className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 disabled:opacity-50"
                   disabled={selectedMasterIds.length === 0}
                >
                   Assign Selected ({selectedMasterIds.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
