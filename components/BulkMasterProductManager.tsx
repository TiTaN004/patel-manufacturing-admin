import React, { useState } from 'react';
import { useData } from '../DataContext';
import { BulkMasterProduct, BulkBaseMaster } from '../types';
import { Button } from './ui/Button';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Save,
  Layers,
  Box,
  Loader2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { uploadAPI, IMG_BASE_URL } from '../utils/api';

export const BulkMasterProductManager: React.FC = () => {
  const { bulkMasterProducts, bulkMasters, actions, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BulkMasterProduct | null>(null);
  const masterOptionLabel = (m: BulkBaseMaster) => m.value;

  const [formData, setFormData] = useState<Partial<BulkMasterProduct>>({
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

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      await actions.updateBulkMasterProduct(editingProduct.id, formData);
    } else {
      await actions.addBulkMasterProduct(formData);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
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

  const openEditModal = (product: BulkMasterProduct) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-8 border-b bg-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Layers className="h-6 w-6 text-indigo-600" />
              Product Master Registry
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Pre-define box and base specifications to reuse across all bulk clients.</p>
          </div>
          
          <Button 
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-black shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            New Master Specification
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {bulkMasterProducts.length === 0 ? (
            <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-indigo-50/30 flex flex-col items-center justify-center text-center">
                <Box className="h-12 w-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No master products defined yet</p>
                <Button 
                    variant="secondary" 
                    className="mt-6 border-2 border-indigo-100 rounded-2xl font-black text-indigo-600"
                    onClick={openCreateModal}
                >
                    Create First Master
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {bulkMasterProducts.map(product => (
                    <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(product)} className="h-10 w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                <Edit3 size={18} />
                            </button>
                            <button onClick={() => { if(window.confirm('Delete this master specification?')) actions.deleteBulkMasterProduct(product.id) }} className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="text-xl font-black tracking-tight">{editingProduct ? 'Update Master Specification' : 'New Master Register'}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Global Specification Master</p>
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Product Image (Max 200KB)</p>
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
    </div>
  );
};
