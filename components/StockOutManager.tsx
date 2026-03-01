import React, { useState, useCallback, useEffect } from 'react';
import { useData } from '../DataContext';
import { Product, StockOutRecord, PaymentType } from '../types';
import { Button } from './ui/Button';
import { ClipboardList, Plus, Search, User, X, Edit3, ArrowUpRight, Save, Receipt, CreditCard, Banknote, Upload, Image as ImageIcon } from 'lucide-react';
import { IMG_BASE_URL, uploadAPI } from '@/utils/api';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { Pagination } from './ui/Pagination';

export const StockOutManager: React.FC = () => {
  const { 
    allProducts: products, 
    stockOutRecords: records, 
    totalOrders, 
    orderPage, 
    pageSize, 
    searchTerm,
    actions 
  } = useData();

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockOutRecord | null>(null);

  // Stats - Note: These will only be for the current page if records are paginated.
  // Ideally, backend should return these global stats.
  const totalStockInHand = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalStockSold = (records || []).reduce((acc, r) => acc + (r.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0), 0);

  const filteredRecords = records; // Backend handles search now

  return (
    <div className="">
      {/* KPI Cards */}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
           <div className="min-w-0">
             <p className="text-xs md:text-sm text-slate-500 font-medium truncate">Total Inventory (In Hand)</p>
             <p className="text-xl md:text-3xl font-black text-indigo-600 mt-1">{totalStockInHand}</p>
           </div>
           <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0 ml-2">
             <ClipboardList size={18} className="md:w-6 md:h-6" />
           </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
           <div className="min-w-0">
             <p className="text-xs md:text-sm text-slate-500 font-medium truncate">Total Stock Sold</p>
             <p className="text-xl md:text-3xl font-black text-orange-600 mt-1">{totalStockSold}</p>
           </div>
           <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 shrink-0 ml-2">
             <ArrowUpRight size={18} className="md:w-6 md:h-6" />
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
           <div className="flex items-center gap-2 bg-white border px-3 py-2 rounded-lg w-full md:w-72 focus-within:ring-2 ring-indigo-500 ring-offset-1">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="flex-1 text-sm outline-none"
                value={searchTerm}
                onChange={e => actions.setSearch(e.target.value)}
              />
           </div>
            <Button onClick={() => setAddModalOpen(true)} className="w-full md:w-auto font-bold py-2.5">
              <Plus size={18} className="mr-2" /> Record Sale
            </Button>
        </div>

        {/* Table/Card View */}
        <div className="flex-1 overflow-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3">Products</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(r => {
                const firstItem = r.items[0];
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded border overflow-hidden bg-slate-50 relative shrink-0">
                           {firstItem?.primaryImage ? (
                             <img src={`${IMG_BASE_URL}${firstItem.primaryImage}`} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><ImageIcon size={16}/></div>
                           )}
                           {r.items.length > 1 && (
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">
                                +{r.items.length - 1}
                             </div>
                           )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[180px]">
                            {firstItem?.productName || 'Unknown Product'}
                            {r.items.length > 1 && <span className="text-slate-400 ml-1">...</span>}
                          </p>
                          <p className="text-xs text-slate-500">
                             {r.items.length} {r.items.length === 1 ? 'product' : 'products'} 
                             <span className="mx-1 text-slate-300">•</span> 
                             {r.items.reduce((sum, i) => sum + i.quantity, 0)} qty
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{r.customerName}</span>
                        <span className="text-xs text-slate-400">{r.customerMobile}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${r.paymentType === 'cash' ? 'bg-emerald-100 text-emerald-700' : 
                          r.paymentType === 'card' ? 'bg-blue-100 text-blue-700' :
                          r.paymentType === 'upi' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {r.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{r.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="secondary" size="sm" onClick={() => setEditingRecord(r)}>
                           Details
                         </Button>
                         <Button variant="secondary" size="sm" onClick={() => {
                           setAddModalOpen(true);
                           (window as any)._editRecord = r;
                         }}>
                           <Edit3 size={14} />
                         </Button>
                         <Button variant="secondary" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100" onClick={() => actions.deleteStockOutRecord(r.id)}>
                           <X size={14} />
                         </Button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredRecords.map(r => {
              const firstItem = r.items[0];
              return (
                <div key={r.id} className="p-5 space-y-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(r.date).toLocaleDateString()}</span>
                       <span className="text-[10px] font-bold text-indigo-600/60 uppercase">Inv: {r.billNumber || '---'}</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${r.paymentType === 'cash' ? 'bg-emerald-100 text-emerald-700' : 
                        r.paymentType === 'card' ? 'bg-blue-100 text-blue-700' :
                        r.paymentType === 'upi' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                      {r.paymentType}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl border border-slate-200 bg-white shrink-0 relative overflow-hidden shadow-sm">
                       {firstItem?.primaryImage ? (
                         <img src={`${IMG_BASE_URL}${firstItem.primaryImage}`} className="w-full h-full object-cover" alt="" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><ImageIcon size={20}/></div>
                       )}
                       {r.items.length > 1 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">
                             +{r.items.length - 1}
                          </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-base">{firstItem?.productName || 'Unknown Product'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.items.reduce((sum, i) => sum + i.quantity, 0)} items in total</p>
                      <p className="font-black text-indigo-600 text-lg mt-1">₹{r.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">{r.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{r.customerMobile}</span>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setEditingRecord(r)} 
                         className="h-9 px-3 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                       >
                         Details
                       </button>
                       <button 
                         onClick={() => {
                           setAddModalOpen(true);
                           (window as any)._editRecord = r;
                         }} 
                         className="h-9 w-9 flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                       >
                         <Edit3 size={14} />
                       </button>
                       <button 
                         className="h-9 w-9 flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors" 
                         onClick={() => {
                            if (window.confirm("Are you sure you want to delete this record?")) {
                               actions.deleteStockOutRecord(r.id);
                            }
                         }}
                       >
                         <X size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white">
              <Receipt size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg font-medium">No sales records found</p>
            </div>
          )}
        </div>
        <Pagination 
          currentPage={orderPage}
          totalItems={totalOrders}
          pageSize={pageSize}
          onPageChange={actions.setOrderPage}
          label="orders"
        />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <CreateStockOutModal 
          products={products} 
          onClose={() => {
            setAddModalOpen(false);
            (window as any)._editRecord = null;
          }} 
          onSubmit={(data: any) => {
            const editRecord = (window as any)._editRecord;
            if (editRecord) {
              actions.updateStockOutRecord(editRecord.id, data);
            } else {
              actions.addStockOut(data);
            }
          }}
          initialData={(window as any)._editRecord}
        />
      )}

      {/* Detail Modal */}
      {editingRecord && (
        <DetailStockOutModal 
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const CreateStockOutModal = ({ products, onClose, onSubmit, initialData }: any) => {
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [cart, setCart] = useState<any[]>(initialData?.items.map((i: any) => ({
    productId: i.productId,
    productName: i.productName,
    sku: i.sku,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    primaryImage: i.primaryImage,
    stockAvailable: products.find((p: any) => p.id === i.productId)?.stockQuantity || i.quantity // If editing, we assume current stock is available + what's already in order
  })) || []);
  const [search, setSearch] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerMobile, setCustomerMobile] = useState(initialData?.customerMobile || '');
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [paymentType, setPaymentType] = useState<PaymentType>(initialData?.paymentType || 'cash');
  const [billNumber, setBillNumber] = useState(initialData?.billNumber || `INV-${Date.now()}`);
  const [billImage, setBillImage] = useState(initialData?.billImage || '');
  const [additionalBillImage, setAdditionalBillImage] = useState(initialData?.additionalBillImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAdd, setIsUploadingAdd] = useState(false);
  const [manualTotal, setManualTotal] = useState<number | null>(initialData?.totalAmount || null);
  const [couponCode, setCouponCode] = useState(initialData?.couponCode || '');
  const [discountAmount, setDiscountAmount] = useState<number>(initialData?.discountAmount || 0);
  const [shippingFee, setShippingFee] = useState<number>(initialData?.shippingFee || 0);
  const [sessionUploadedFiles, setSessionUploadedFiles] = useState<string[]>([]);

  // Coupon Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(!!initialData?.couponCode);
  const { actions } = useData();

  const activeProducts = products.filter((p: Product) => p.isActive && p.stockQuantity > 0);
  const filteredProducts = activeProducts.filter((p: Product) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
       if (existing.quantity >= product.stockQuantity) return;
       setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
       setCart([...cart, {
         productId: product.id,
         productName: product.name,
         sku: product.sku,
         unitPrice: product.price,
         quantity: 1,
         primaryImage: product.primaryImage,
         stockAvailable: product.stockQuantity
       }]);
    }
    setManualTotal(null);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
    setManualTotal(null);
  };
  
  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, Math.min(item.stockAvailable, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
    setManualTotal(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAdditional = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      
      if (isAdditional) setIsUploadingAdd(true); else setIsUploading(true);
      try {
        const res = await uploadAPI.single(formData);
        if (res.data.success) {
          if (isAdditional) setAdditionalBillImage(res.data.url); else setBillImage(res.data.url);
          setSessionUploadedFiles(prev => [...prev, res.data.url]);
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload file : " + err.response.data.message);
      } finally {
        if (isAdditional) setIsUploadingAdd(false); else setIsUploading(false);
      }
    }
  };

  const removeInvoice = async (isAdditional = false) => {
    const url = isAdditional ? additionalBillImage : billImage;
    if (!url) return;

    if (isAdditional) setAdditionalBillImage(''); else setBillImage('');

    setSessionUploadedFiles(prev => prev.filter(u => u !== url));

    try {
      const pathParts = url.split('/uploads/');
      const fullRelativePath = pathParts.length > 1 ? pathParts[1] : url.split('/').pop();
      if (fullRelativePath) {
        await uploadAPI.delete(fullRelativePath, initialData?.id);
      }
    } catch (err) {
      console.error("Failed to delete invoice from server", err);
    }
  };


  const handleCleanupAndClose = async () => {
    if (sessionUploadedFiles.length > 0) {
      // Create a local copy to avoid race conditions with state updates
      const filesToDelete = [...sessionUploadedFiles];
      setSessionUploadedFiles([]); // Clear immediately so double-clicks don't trigger twice
      
      await Promise.all(filesToDelete.map(async (url) => {
        try {
          const pathParts = url.split('/uploads/');
          const fullRelativePath = pathParts.length > 1 ? pathParts[1] : url.split('/').pop();
          if (fullRelativePath) await uploadAPI.delete(fullRelativePath, initialData?.id);
        } catch (error) {
          console.warn(`Failed to cleanup orphaned invoice ${url}`, error);
        }
      }));
    }
    onClose();
  };

  const calculatedSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode) return;
    
    setIsValidating(true);
    setCouponError('');
    
    try {
      const response = await actions.validateCoupon(couponCode, calculatedSubtotal);
      setDiscountAmount(response.discountAmount);
      setCouponSuccess(true);
      setManualTotal(null); // Clear manual total override to show auto-calculated total
    } catch (error: any) {
      setCouponError(error.message || 'Failed to apply coupon');
      setCouponSuccess(false);
      setDiscountAmount(0);
    } finally {
      setIsValidating(false);
    }
  }, [couponCode, calculatedSubtotal, actions]);

  // Reactive Coupon Validation: Re-validate when cart changes
  useEffect(() => {
    if (couponSuccess && couponCode) {
      const timer = setTimeout(() => {
        handleApplyCoupon();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [calculatedSubtotal, couponSuccess, couponCode, handleApplyCoupon]);

  const finalTotal = manualTotal !== null ? manualTotal : (calculatedSubtotal - discountAmount + shippingFee);

  // Validation Logic
  const isMobileValid = /^[6-9]\d{9}$/.test(customerMobile);
  const isEmailValid = customerEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) : true;
  const isFormValid = cart.length > 0 && customerName && isMobileValid && isEmailValid && customerAddress;

  const handleSubmit = () => {
    if (isFormValid) {
      onSubmit({
        items: cart,
        customerName,
        customerMobile,
        customerEmail,
        customerAddress,
        paymentType,
        billNumber,
        billImage,
        additionalBillImage,
        totalAmount: finalTotal,
        couponCode,
        discountAmount,
        shippingFee,
        subtotal: calculatedSubtotal
      });
      setSessionUploadedFiles([]); // Clear session files so they are not deleted on unmount/close
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl text-slate-800">{initialData ? 'Edit Order' : 'Record New Sale'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Step {step} of 2</p>
          </div>
          <button onClick={handleCleanupAndClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {step === 1 ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Product Search */}
              <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r flex flex-col p-4 sm:p-5 bg-white h-1/2 lg:h-auto">
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all shadow-sm" 
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                   {filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        className="p-3 rounded-xl border flex items-center gap-3 sm:gap-4 cursor-pointer transition-all hover:border-indigo-200 hover:bg-slate-50 group bg-white"
                        onClick={() => addToCart(p)}
                      >
                        <div className="h-12 w-12 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                          <ImageWithFallback src={`${IMG_BASE_URL}${p.primaryImage}`} className="w-full h-full object-cover" alt="" fallbackText="" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-sm text-slate-800 truncate">{p.name}</p>
                           <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                             <span className="font-mono">{p.sku}</span>
                             <span className="h-1 w-1 rounded-full bg-slate-300" />
                             <span className={p.stockQuantity < 5 ? 'text-rose-500 font-bold' : ''}>Stock: {p.stockQuantity}</span>
                           </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-indigo-600 text-sm">₹{p.price.toLocaleString()}</p>
                          <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center ml-auto mt-1 group-hover:bg-indigo-600 transition-colors">
                             <Plus size={14} className="text-indigo-400 group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Cart / Selected List */}
              <div className="w-full lg:w-1/2 flex flex-col p-4 sm:p-5 bg-slate-50/50 h-1/2 lg:h-auto">
                 <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">
                       Cart ({cart.length}) 
                       <span className="mx-2 text-slate-300">|</span> 
                       Qty: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </h4>
                    <button onClick={() => setCart([])} className="text-[10px] font-bold text-rose-500 hover:underline">Clear</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {cart.map(item => (
                       <div key={item.productId} className="bg-white p-3 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 border rounded bg-slate-50 overflow-hidden shrink-0">
                             <ImageWithFallback src={`${IMG_BASE_URL}${item.primaryImage}`} className="w-full h-full object-cover" alt="" fallbackText="" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-xs truncate">{item.productName}</p>
                             <p className="text-[10px] text-slate-400">₹{item.unitPrice.toLocaleString()} / unit</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => updateQty(item.productId, -1)} className="h-7 w-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs font-bold transition-colors">-</button>
                             <span className="w-5 text-center font-bold text-xs text-slate-700">{item.quantity}</span>
                             <button onClick={() => updateQty(item.productId, 1)} className="h-7 w-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs font-bold transition-colors">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={16}/></button>
                       </div>
                    ))}
                    {cart.length === 0 && (
                       <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-10 lg:py-20">
                          <ClipboardList size={32} className="mb-2 opacity-10" />
                          <p className="text-xs font-medium uppercase tracking-widest">Cart is empty</p>
                       </div>
                    )}
                 </div>

                  <div className="mt-auto pt-4 border-t space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="font-bold text-slate-500 text-sm">Subtotal:</span>
                       <span className="font-black text-slate-900 text-xl tracking-tight">₹{calculatedSubtotal.toLocaleString()}</span>
                    </div>
                    <Button className="w-full py-4 rounded-xl font-bold tracking-tight shadow-lg shadow-indigo-600/10" disabled={cart.length === 0} onClick={() => setStep(2)}>
                       Confirm Items & Continue
                    </Button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto">
               <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-3/5 space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Customer Information</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name *</label>
                            <input 
                              className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all" 
                              placeholder="e.g. John Doe"
                              value={customerName}
                              onChange={e => setCustomerName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number *</label>
                            <input 
                              className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/10 outline-none shadow-sm transition-all ${customerMobile && !isMobileValid ? 'border-rose-500 focus:border-rose-500' : 'focus:border-indigo-500'}`} 
                              placeholder="10 digit number"
                              value={customerMobile}
                              onChange={e => setCustomerMobile(e.target.value)}
                              readOnly={initialData}
                            />
                            {customerMobile && !isMobileValid && <p className="text-[10px] text-rose-500 font-bold mt-1">Invalid 10-digit number</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email (Optional)</label>
                            <input 
                              className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/10 outline-none shadow-sm transition-all ${customerEmail && !isEmailValid ? 'border-rose-500 focus:border-rose-500' : 'focus:border-indigo-500'}`} 
                              placeholder="e.g. john@example.com"
                              value={customerEmail}
                              onChange={e => setCustomerEmail(e.target.value)}
                            />
                            {customerEmail && !isEmailValid && <p className="text-[10px] text-rose-500 font-bold mt-1">Invalid email address</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Address *</label>
                            <textarea 
                              className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all h-20 resize-none" 
                              placeholder="Complete address..."
                              value={customerAddress}
                              onChange={e => setCustomerAddress(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                     <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Billing & Payment</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</label>
                          <input 
                            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all" 
                            value={billNumber}
                            onChange={e => setBillNumber(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</label>
                          <select 
                            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all bg-white"
                            value={paymentType}
                            onChange={e => setPaymentType(e.target.value as PaymentType)}
                          >
                            <option value="cash">Cash</option>
                            <option value="upi">UPI / Online</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Coupon Code</label>
                          <div className="flex gap-2">
                            <input 
                              className="flex-1 border rounded-xl px-4 py-2 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none uppercase" 
                              placeholder="Enter coupon code" 
                              value={couponCode}
                              onChange={e => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError('');
                                setCouponSuccess(false);
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={!couponCode || isValidating}
                              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                couponSuccess 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:bg-slate-100 disabled:text-slate-400'
                              }`}
                            >
                              {isValidating ? 'Validating...' : (couponSuccess ? 'Applied' : 'Apply Coupon')}
                            </button>
                          </div>
                          {couponError && <p className="text-[10px] text-rose-500 font-bold mt-1 px-1">{couponError}</p>}
                          {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold mt-1 px-1">Coupon applied successfully!</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Amount (₹)</label>
                            <input 
                              type="number"
                              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all" 
                              value={discountAmount}
                              onChange={e => {
                                setDiscountAmount(Number(e.target.value));
                                setCouponSuccess(false);
                                setManualTotal(null); // Clear manual total override
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping Fee (₹)</label>
                            <input 
                              type="number"
                              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all" 
                              value={shippingFee}
                              onChange={e => setShippingFee(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase block">Invoice Attachment (Optional)</label>
                       <div className="flex items-center gap-4">
                          <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${billImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'}`}>
                             {isUploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                             ) : billImage ? (
                                <>
                                  <div className="flex items-center gap-2 text-emerald-600">
                                     {billImage.toLowerCase().endsWith('.pdf') ? <Receipt size={20}/> : <ImageIcon size={20}/>}
                                     <span className="text-sm font-bold truncate max-w-[150px]">File Uploaded</span>
                                  </div>
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeInvoice(false); }} className="text-[10px] text-rose-500 font-bold mt-1 hover:underline">Remove</button>
                                </>
                             ) : (
                                <>
                                  <Upload size={20} className="text-slate-400 mb-1" />
                                  <span className="text-xs text-slate-500 font-medium tracking-tight">Main Invoice</span>
                                </>
                             )}
                             {!billImage && <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={isUploading} />}
                          </label>

                          {/* <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${additionalBillImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'}`}>
                             {isUploadingAdd ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                             ) : additionalBillImage ? (
                                <>
                                  <div className="flex items-center gap-2 text-emerald-600">
                                     {additionalBillImage.toLowerCase().endsWith('.pdf') ? <Receipt size={20}/> : <ImageIcon size={20}/>}
                                     <span className="text-sm font-bold truncate max-w-[150px]">Extra Doc</span>
                                  </div>
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeInvoice(true); }} className="text-[10px] text-rose-500 font-bold mt-1 hover:underline">Remove</button>
                                </>
                             ) : (
                                <>
                                  <Upload size={20} className="text-slate-400 mb-1" />
                                  <span className="text-xs text-slate-500 font-medium tracking-tight">Extra Doc</span>
                                </>
                             )}
                             {!additionalBillImage && <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, true)} disabled={isUploadingAdd} />}
                          </label> */}
                       </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-2/5 bg-slate-50/50 rounded-2xl p-4 sm:p-6 flex flex-col border border-slate-100 h-fit lg:sticky lg:top-0">
                    <h4 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Order Summary</h4>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                           {cart.map(i => (
                              <div key={i.productId} className="flex justify-between items-center text-xs">
                                 <span className="text-slate-600">{i.productName} <span className="text-slate-400 font-mono text-[10px]">x{i.quantity}</span></span>
                                 <span className="font-medium text-slate-900">₹{(i.unitPrice * i.quantity).toLocaleString()}</span>
                              </div>
                           ))}
                        </div>
                                                 <div className="pt-4 border-t space-y-3">
                            <div className="flex justify-between text-base">
                               <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Order Summary</span>
                               <span className="font-bold text-slate-700">₹{calculatedSubtotal.toLocaleString()}</span>
                            </div>
                            {discountAmount > 0 && (
                             <div className="flex justify-between text-sm text-emerald-600 font-bold">
                                 <span className="flex items-center gap-2">
                                   Discount
                                 </span>
                                 <span>-₹{discountAmount.toLocaleString()}</span>
                             </div>
                            )}
                            {shippingFee > 0 && (
                             <div className="flex justify-between text-sm text-slate-600 font-bold">
                                 <span>Shipping</span>
                                 <span>+₹{shippingFee.toLocaleString()}</span>
                             </div>
                            )}
                           
                           <div className="bg-white p-4 rounded-xl border-2 border-indigo-600/20 shadow-sm relative overflow-hidden ring-4 ring-indigo-600/5">
                              <div className="absolute top-0 right-0 p-2 opacity-5"><Receipt size={40}/></div>
                              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Final Total Amount</label>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-slate-400">₹</span>
                                <input 
                                  type="number" 
                                  className="w-full text-4xl font-black text-indigo-600 outline-none bg-transparent"
                                  value={manualTotal !== null ? manualTotal : (calculatedSubtotal - discountAmount + shippingFee)}
                                  onChange={e => setManualTotal(parseFloat(e.target.value))}
                                />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 italic">You can manually adjust the total for discounts/rounding.</p>
                           </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                       <Button variant="secondary" className="px-8 rounded-xl w-full sm:w-auto order-2 sm:order-1" onClick={() => setStep(1)}>Back</Button>
                       <Button className="flex-1 py-4 rounded-xl text-lg font-bold shadow-lg shadow-indigo-500/20 order-1 sm:order-2" onClick={handleSubmit} disabled={!isFormValid || isUploading}>
                          Confirm & Record Sale
                       </Button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailStockOutModal = ({ record, onClose }: { record: StockOutRecord, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
      <div className="bg-white md:rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh] relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-slate-100 rounded-full transition-colors z-[60] shadow-sm border md:hidden"><X size={20}/></button>
        {/* Left Side: Order Items */}
        <div className="w-full md:w-1/2 flex flex-col border-r bg-slate-50 h-1/2 md:h-auto overflow-hidden">
           <div className="p-4 sm:p-6 border-b bg-white">
              <h3 className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight">Order Items ({record.items.length})</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">Invoice: <span className="font-mono font-bold">{record.billNumber}</span></p>
           </div>
           <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
              {record.items.map((item, idx) => (
                 <div key={idx} className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-200 transition-all">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg border border-slate-100 overflow-hidden bg-white shrink-0">
                       <ImageWithFallback src={`${IMG_BASE_URL}${item.primaryImage}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-xs sm:text-sm text-slate-800 truncate">{item.productName}</p>
                       <p className="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5 uppercase tracking-tighter">{item.sku}</p>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qty: <span className="text-slate-700 text-xs">{item.quantity}</span></span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-indigo-600 text-sm sm:text-base tracking-tight">₹{item.totalPrice.toLocaleString()}</p>
                       <p className="text-[9px] text-slate-400 font-bold">₹{item.unitPrice.toLocaleString()}/u</p>
                    </div>
                 </div>
              ))}
           </div>
            <div className="p-4 sm:p-6 bg-white border-t space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                 <span className="font-bold text-slate-700 text-sm">₹{(record.subtotal || record.items.reduce((sum, i) => sum + i.totalPrice, 0)).toLocaleString()}</span>
              </div>
              {record.discountAmount && record.discountAmount > 0 ? (
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-[10px] font-black uppercase tracking-widest">Discount</span>
                  <span className="font-bold text-sm">-₹{record.discountAmount.toLocaleString()}</span>
                </div>
              ) : null}
              {record.shippingFee && record.shippingFee > 0 ? (
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                  <span className="font-bold text-sm">+₹{record.shippingFee.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-1">
                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Final Amount</span>
                 <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">₹{record.totalAmount.toLocaleString()}</span>
              </div>
            </div>
        </div>

        {/* Right Side: Customer & Transaction Details */}
        <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-auto overflow-hidden">
                 <div className="flex justify-between items-center p-4 sm:p-8 md:pb-0 border-b md:border-b-0 bg-slate-50 md:bg-white">
                    <h3 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight uppercase">Customer & Transaction</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block"><X/></button>
                 </div>
           
           <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10 custom-scrollbar">
              <section className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={12}/> CUSTOMER DETAILS
                 </h4>
                 <div className="space-y-4">
                    <div>
                       <p className="text-2xl font-black text-slate-800">{record.customerName}</p>
                       <p className="text-lg font-bold text-indigo-600 mt-1">{record.customerMobile}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border">
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">{record.customerAddress || 'No address provided'}</p>
                    </div>
                 </div>
              </section>

               <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-slate-100/50 p-2 rounded w-fit">
                     <CreditCard size={12}/> TRANSACTION DETAILS
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                     <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Payment Mode</label>
                        <span className="capitalize font-black text-indigo-600 text-sm">{record.paymentType}</span>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Sale Date</label>
                        <span className="font-black text-slate-700 text-sm">{new Date(record.date).toLocaleDateString()}</span>
                     </div>
                     <div className="col-span-1 sm:col-span-2 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100">
                        <label className="text-[9px] font-bold text-indigo-400 block mb-1 uppercase tracking-wider">Invoice Number</label>
                        <span className="font-mono font-black text-slate-800 text-sm">{record.billNumber || 'N/A'}</span>
                     </div>
                  </div>
               </section>

               {record.billImage && (
                 <InvoiceView label="PRIMARY INVOICE" url={record.billImage} />
               )}

               {record.additionalBillImage && (
                 <InvoiceView label="ADDITIONAL DOCUMENT" url={record.additionalBillImage} />
               )}
            </div>

            <div className="p-4 sm:p-6 border-t bg-slate-50 flex flex-col sm:flex-row gap-3">
               <Button onClick={() => window.print()} variant="secondary" className="flex-1 rounded-xl hidden sm:flex">Print Details</Button>
               <Button onClick={onClose} className="flex-1 px-10 rounded-xl font-bold py-3">Close View</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
// --- Invoice Helper ---
const InvoiceView = ({ label, url }: { label: string, url: string }) => {
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const fullUrl = url.startsWith('http') ? url : `${IMG_BASE_URL}${url}`;
  
  return (
    <section className="space-y-4">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
         <ImageIcon size={12}/> {label}
      </h4>
      {isPdf ? (
         <div className="p-6 border-2 border-indigo-50 bg-indigo-50/20 rounded-2xl flex flex-col items-center gap-4 group">
            <div className="h-16 w-16 bg-white rounded-2xl shadow-indigo-100 shadow-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
               <Receipt size={32} />
            </div>
            <div className="text-center">
               <p className="text-sm font-black text-slate-800">Document.pdf</p>
               <p className="text-[10px] text-slate-400 uppercase mt-1">Ready to download</p>
            </div>
            <Button className="w-full rounded-xl" onClick={() => window.open(fullUrl)}>
               <Upload size={14} className="mr-2 rotate-180" /> Download PDF
            </Button>
         </div>
      ) : (
        <div className="rounded-xl border overflow-hidden shadow-lg group relative">
           <img src={fullUrl} alt="Invoice" className="w-full h-auto cursor-pointer" />
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" onClick={() => window.open(fullUrl)}>View Full Image</Button>
           </div>
        </div>
      )}
    </section>
  );
};
