import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  Plus, 
  X, 
  Check, 
  Search, 
  ShoppingCart,
  ArrowRight,
  Hash,
  Box,
  CreditCard,
  Loader2
} from 'lucide-react';
import { Button } from './ui/Button';
import { bulkOrderAPI, bulkProductAPI, IMG_BASE_URL } from '../utils/api';

export const BulkUserTester: React.FC = () => {
  const { 
    bulkUsers, 
    actions 
  } = useData();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [baseSelections, setBaseSelections] = useState<Record<number, { color: string, shape: string }>>({});

  // Fetch products when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserProducts();
      setCart([]);
    }
  }, [selectedUser]);

  const fetchUserProducts = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await bulkProductAPI.getByUser(selectedUser.userID);
      if (res.data.success) {
        setUserProducts(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    let selected_color = undefined;
    let selected_shape = undefined;

    if (product.product_type === 'base') {
      const selection = baseSelections[product.id];
      if (!selection?.color || !selection?.shape) {
        alert("Please select both a Color and a Shape for this base product.");
        return;
      }
      selected_color = selection.color;
      selected_shape = selection.shape;
    }

    const cartKey = `${product.id}-${selected_color || ''}-${selected_shape || ''}`;
    const existingIndex = cart.findIndex(item => 
      `${item.bulk_product_id}-${item.selected_color || ''}-${item.selected_shape || ''}` === cartKey
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { 
        ...product,
        bulk_product_id: product.id, 
        quantity: 1,
        selected_color,
        selected_shape
      }]);
    }
  };

  const updateBaseSelection = (productId: number, field: 'color' | 'shape', value: string) => {
    setBaseSelections(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { color: '', shape: '' }),
        [field]: value
      }
    }));
  };

  const updateQuantity = (productId: number, qty: number, color?: string, shape?: string) => {
    const itemKey = `${productId}-${color || ''}-${shape || ''}`;
    if (qty < 1) {
      setCart(cart.filter(item => `${item.bulk_product_id}-${item.selected_color || ''}-${item.selected_shape || ''}` !== itemKey));
    } else {
      setCart(cart.map(item => 
        `${item.bulk_product_id}-${item.selected_color || ''}-${item.selected_shape || ''}` === itemKey 
          ? { ...item, quantity: qty } 
          : item
      ));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedUser || cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const payload = {
        userID: parseInt(selectedUser.userID),
        items: cart.map(item => ({
          bulk_product_id: item.bulk_product_id,
          quantity: item.quantity,
          selected_color: item.selected_color,
          selected_shape: item.selected_shape
        }))
      };

      // Since the API requires a token of the user, this temporary page might need a JWT from the backend
      // for the specific user, or we use a testing bypass.
      // Let's rely on the fact that this is a TEST page for the developer.

      const res = await bulkOrderAPI.place(payload);
      if (res.data.success) {
        alert(`Order placed successfully! Invoice: ${res.data.data.invoiceNumber}`);
        setCart([]);
        actions.fetchData(); // Refresh admin views
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.response?.data?.message || e.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredUsers = bulkUsers.filter((u: any) =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobileNo.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShoppingCart className="text-indigo-600" />
            Bulk Order Simulator
          </h1>
          <p className="text-slate-500 font-medium">Temporary page to test bulk order placement as different users.</p>
        </div>

        {selectedUser && (
          <Button variant="ghost" className="rounded-2xl" onClick={() => setSelectedUser(null)}>
            <X size={18} className="mr-2" /> Change User
          </Button>
        )}
      </div>

      {!selectedUser ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 shadow-sm">
          <div className="mb-8 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search for a bulk user to simulate..."
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] outline-none transition-all font-bold text-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user: any) => (
              <button
                key={user.userID}
                onClick={() => setSelectedUser(user)}
                className="flex items-center gap-5 p-6 bg-white border-2 border-slate-50 rounded-[2rem] hover:border-indigo-500 hover:shadow-xl transition-all group text-left"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Users size={28} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 truncate">{user.fullName}</p>
                  <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{user.mobileNo}</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-200 group-hover:text-indigo-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 shadow-sm h-full">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Box className="text-indigo-600" />
                {selectedUser.fullName}'s Registry
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 text-indigo-200 animate-spin" />
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Fetching products...</p>
                </div>
              ) : userProducts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <Package className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                  <p className="font-bold text-slate-400">No products assigned to this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProducts.map((product) => (
                    <div key={product.id} className="p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col h-full">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                            {product.product_image ? (
                              <img src={`${IMG_BASE_URL}${product.product_image}`} alt={product.box_name} className="h-full w-full object-cover" />
                            ) : (
                              <Package size={20} className="h-full w-full p-2 text-slate-200" />
                            )}
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-black text-slate-400">{product.sr_no || 'No SR#'}</span>
                            <h4 className="font-black text-slate-800 truncate">
                              {product.product_type === 'base' ? `Size: ${product.size}` : product.box_name}
                            </h4>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 transition-all shrink-0"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.product_type === 'box' && (
                          <span className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-100">Size: {product.size}</span>
                        )}
                        {product.product_type === 'base' && (
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase border border-indigo-100">Configurable Base</span>
                        )}
                        {product.die_no && <span className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-100">Die: {product.die_no}</span>}
                        {product.no_sheet && <span className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-100">Sheets: {product.no_sheet}</span>}
                      </div>

                      {product.product_type === 'base' ? (
                        <div className="flex-1 space-y-3 p-3 bg-white/50 rounded-2xl border border-indigo-100/50">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest pl-1">Select Color</label>
                            <select 
                              className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                              value={baseSelections[product.id]?.color || ''}
                              onChange={(e) => updateBaseSelection(product.id, 'color', e.target.value)}
                            >
                              <option value="">Pick Color</option>
                              {product.available_colors?.split(',').map((c: string) => c.trim()).filter(Boolean).map((color: string) => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest pl-1">Select Shape</label>
                            <select 
                              className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                              value={baseSelections[product.id]?.shape || ''}
                              onChange={(e) => updateBaseSelection(product.id, 'shape', e.target.value)}
                            >
                              <option value="">Pick Shape</option>
                              {product.available_shapes?.split(',').map((s: string) => s.trim()).filter(Boolean).map((shape: string) => (
                                <option key={shape} value={shape}>{shape}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 p-3 bg-white/50 rounded-2xl border border-slate-100/50">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-300 uppercase leading-tight">Paper/Liner</p>
                            <p className="text-[10px] font-bold text-slate-600 truncate">{product.paper || '-'} / {product.liner || '-'}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-300 uppercase leading-tight">Plate Name</p>
                            <p className="text-[10px] font-bold text-slate-600 truncate">{product.plate_name || '-'}</p>
                          </div>
                          <div className="col-span-2 space-y-0.5 pt-1 border-t border-slate-50">
                            <p className="text-[8px] font-black text-slate-300 uppercase leading-tight">Sheet Size</p>
                            <p className="text-[10px] font-bold text-slate-600 truncate">{product.sheet_size || '-'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart / Simulation View */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 shadow-sm flex flex-col h-full sticky top-8">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <ShoppingCart className="text-indigo-600" />
                Order Preparation
              </h2>

              <div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-300 flex flex-col items-center gap-4">
                    <Package className="h-10 w-10 text-slate-100" />
                    <p className="text-sm font-medium">Your preparation cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.bulk_product_id}-${item.selected_color || ''}-${item.selected_shape || ''}`} className="p-5 bg-slate-50 rounded-3xl space-y-4 border border-slate-100 relative group/item">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                              {item.product_image ? (
                                <img src={`${IMG_BASE_URL}${item.product_image}`} alt={item.product_name} className="h-full w-full object-cover" />
                              ) : (
                                <Package size={14} className="h-full w-full p-1.5 text-slate-200" />
                              )}
                            </div>
                            <div>
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase">{item.sr_no || 'SR#'}</span>
                                <p className="font-black text-slate-800 text-sm truncate">
                                  {item.product_type === 'base' ? `Size: ${item.size}` : item.box_name}
                                </p>
                            </div>
                          </div>
                          {item.product_type === 'box' && <p className="text-[10px] font-bold text-slate-400 mt-0.5">Size: {item.size}</p>}
                        </div>
                        <button onClick={() => updateQuantity(item.bulk_product_id, 0, item.selected_color, item.selected_shape)} className="h-8 w-8 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Quantity</label>
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.bulk_product_id, parseInt(e.target.value) || 0, item.selected_color, item.selected_shape)}
                            className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-slate-100 font-bold text-indigo-600 outline-none focus:border-indigo-500 shadow-sm transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                             {item.product_type === 'base' ? 'Configuration' : 'Specifications'}
                           </p>
                           <div className="flex flex-wrap gap-1">
                             {item.product_type === 'base' ? (
                               <>
                                 <div className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-bold shadow-sm">Color: {item.selected_color}</div>
                                 <div className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-bold shadow-sm">Shape: {item.selected_shape}</div>
                               </>
                             ) : (
                               <>
                                 <div className="px-2 py-1 bg-white rounded-lg text-[8px] font-bold text-slate-400 border border-slate-100">Paper/Liner: {item.paper || '-'}/{item.liner || '-'}</div>
                                 <div className="px-2 py-1 bg-white rounded-lg text-[8px] font-bold text-slate-400 border border-slate-100">Plate: {item.plate_name || '-'}</div>
                                 <div className="px-2 py-1 bg-white rounded-lg text-[8px] font-bold text-slate-400 border border-slate-100">Die: {item.die_no || '-'}</div>
                                 <div className="px-2 py-1 bg-white rounded-lg text-[8px] font-bold text-slate-400 border border-slate-100">Sheet: {item.sheet_size} ({item.no_sheet})</div>
                               </>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                <Button 
                  className="w-full py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-200"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cart.length === 0}
                >
                  {placingOrder ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" />}
                  Place Test Order
                </Button>
                
                <p className="text-[10px] text-center text-rose-400 font-bold uppercase tracking-tighter">
                  Warning: This will create a real database entry
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
