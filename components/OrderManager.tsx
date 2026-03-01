import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Search, ShoppingBag, User, Phone, MapPin, Calendar, CreditCard, ChevronDown, ChevronUp, Package, Hash, ExternalLink, Mail, Trash2 } from 'lucide-react';
import { Pagination } from './ui/Pagination';
import { IMG_BASE_URL } from '../utils/api';

export const OrderManager: React.FC = () => {
  const { 
    orders, 
    totalOrders, 
    orderPage, 
    pageSize, 
    searchTerm, 
    userTypeFilter,
    loading,
    actions 
  } = useData();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-8 border-b bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 md:gap-3">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              Order Management
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Track and manage customer orders and deliveries.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Role Filter */}
            <div className="flex bg-white border-2 border-slate-100 p-1 rounded-2xl shadow-sm">
                {[
                  { id: 'both', label: 'All Orders' },
                  { id: 'retail', label: 'Retail' },
                  { id: 'bulk', label: 'Bulk' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => actions.setUserTypeFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      userTypeFilter === tab.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search invoice, customer..."
                className="pl-11 pr-5 py-3 md:pl-12 md:pr-6 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl focus:border-indigo-500 outline-none w-full md:w-80 transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => actions.setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No orders found</h3>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="group bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] overflow-hidden hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-600/5">
                {/* Order Summary Line */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 md:p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6"
                >
                  <div className="flex items-center justify-between lg:justify-start gap-4 min-w-0 lg:min-w-[200px]">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                        <Hash size={18} className="font-black" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight truncate">{order.invoiceNumber}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> {formatDate(order.createdAt).split(',')[0]}
                        </p>
                      </div>
                    </div>
                    <div className="lg:hidden">
                       <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                  {/* {console.log(order)} */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg md:rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{order.customerName}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{order.customerMobile}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg md:rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Amount Paid</p>
                        <p className="text-sm font-black text-indigo-600 mt-1">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.deleteUserOrder(order.id);
                        }}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                      <span className={`hidden lg:inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      {expandedId === order.id ? <ChevronUp size={20} className="text-slate-400 shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="p-4 md:px-6 md:pb-6 md:pt-2 border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Customer Info */}
                      <div className="space-y-4">
                        <h5 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Shipment Info</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <MapPin size={14} className="text-slate-400 mt-1 shrink-0" />
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {order.customerAddress}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone size={14} className="text-slate-400 shrink-0" />
                              <p className="text-xs text-slate-600 font-bold">{order.customerMobile}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail size={14} className="text-slate-400 shrink-0" />
                              <p className="text-xs text-slate-600 font-bold truncate">{order.customerEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="lg:col-span-2 space-y-4">
                        <h5 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Purchased Items ({order.items.length})</h5>
                        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                          {order.items.map((item) => (
                            <div key={item.id} className="p-4 flex items-start gap-3 md:gap-4">
                              <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                {item.primaryImage || item.product_image ? (
                                  <img src={`${IMG_BASE_URL}${item.primaryImage || item.product_image}`} alt={item.productName || item.box_name} className="h-full w-full object-contain p-2" />
                                ) : (
                                  <Package size={24} className="h-full w-full p-4 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <h6 className="text-xs font-black text-slate-800 truncate leading-tight">{item.productName}</h6>
                                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SKU: {item.sku || 'N/A'}</p>
                                  {item.selectedFilters && Object.keys(item.selectedFilters).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5 ">
                                      {Object.entries(item.selectedFilters).map(([k, v]) => (
                                        <span key={k} className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] md:text-[9px] font-bold text-slate-500 whitespace-nowrap">
                                          {k}: {v as string}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                  <p className="text-[10px] md:text-xs font-black text-slate-800 leading-none">₹{item.unitPrice.toLocaleString()} x {item.quantity}</p>
                                  <p className="text-xs md:text-sm font-black text-indigo-600 mt-1">₹{item.totalPrice.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary Footer */}
                        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 p-4 md:p-6 space-y-4 shadow-sm">
                          <div className="space-y-2 pb-4 border-b border-slate-50">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium">Subtotal</span>
                              <span className="font-bold text-slate-800">₹{order.subtotal?.toLocaleString() || order.totalAmount.toLocaleString()}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between items-center text-sm text-emerald-600">
                                <span className="font-medium flex items-center gap-2">
                                  Discount {order.couponCode && <span className="px-2 py-0.5 bg-emerald-50 text-[10px] rounded-md border border-emerald-100 uppercase tracking-wider">{order.couponCode}</span>}
                                </span>
                                <span className="font-bold">-₹{order.discountAmount.toLocaleString()}</span>
                              </div>
                            )}
                            {order.shippingFee > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Shipping Fee</span>
                                <span className="font-bold text-slate-800">+₹{order.shippingFee.toLocaleString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 md:p-6 bg-indigo-600 rounded-xl md:rounded-2xl text-white shadow-lg shadow-indigo-600/20 gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Payment Method</p>
                              <p className="text-sm font-black capitalize mt-0.5 flex items-center gap-2">
                                {order.paymentMode} <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-black uppercase">{order.paymentStatus}</span>
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80">Grand Total</p>
                              <p className="text-xl md:text-2xl font-black mt-0.5">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Pagination */}
      <div className="p-6 border-t bg-slate-50/50">
        <Pagination 
          currentPage={orderPage}
          totalItems={totalOrders}
          pageSize={pageSize}
          onPageChange={actions.setOrderPage}
          label="orders"
        />
      </div>
    </div>
  );
};
