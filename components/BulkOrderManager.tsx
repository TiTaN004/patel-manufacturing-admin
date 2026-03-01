import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Search, ShoppingBag, User, Phone, MapPin, Calendar, CreditCard, ChevronDown, ChevronUp, Package, Hash, Mail, Image as ImageIcon } from 'lucide-react';
import { Pagination } from './ui/Pagination';
import { IMG_BASE_URL } from '../utils/api';
import { formatTime12h } from '../utils/time';

export const BulkOrderManager: React.FC = () => {
  const {
    bulkOrders,
    totalBulkOrders,
    bulkOrderPage,
    pageSize,
    searchTerm,
    loading,
    actions
  } = useData();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    return `${datePart}, ${formatTime12h(date)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
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
              Bulk Order Management
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Monitor and process specialized orders from bulk users.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search invoice, user..."
              className="pl-11 pr-5 py-3 md:pl-12 md:pr-6 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl focus:border-indigo-500 outline-none w-full md:w-80 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => actions.setSearch(e.target.value)}
            />
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
          ) : bulkOrders.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No bulk orders found</h3>
              <p className="text-slate-400 text-sm mt-1">Bulk orders will appear here once placed by users.</p>
            </div>
          ) : (
            bulkOrders.map((order) => (
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
                        <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight truncate">{order.invoice_number}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> {formatDate(order.created_at).split(',')[0]}
                        </p>
                      </div>
                    </div>
                    <div className="lg:hidden">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>

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

                    <div className="flex items-center justify-end gap-3">
                      <span className={`hidden lg:inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
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
                        <h5 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">User Details</h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User size={14} className="text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-600 font-bold">{order.customerName}</p>
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

                      {/* Items List */}
                      <div className="lg:col-span-2 space-y-4">
                        <h5 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ordered Products ({order.items.length})</h5>
                        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                          {order.items.map((item) => (
                            <div key={item.id} className="p-4 flex items-start gap-4">
                              <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                                {item.product_image ? (
                                  <img src={`${IMG_BASE_URL}${item.product_image}`} alt={item.box_name} className="h-full w-full object-cover" />
                                ) : (
                                  <Package size={20} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-tighter border border-indigo-100">{item.sr_no || 'No SR#'}</span>
                                    <h6 className="text-sm font-black text-slate-800 truncate leading-tight">
                                      {item.product_type === 'base' ? `Size: ${item.size}` : item.box_name}
                                    </h6>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {item.product_type === 'box' && <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-200">Size: {item.size}</span>}
                                    {item.die_no && <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-200">Die: {item.die_no}</span>}
                                    {item.sheet_size && <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-200">Sheet Size: {item.sheet_size}</span>}
                                    {item.no_sheet && <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase border border-slate-200">No. Sheet: {item.no_sheet}</span>}
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                    {item.product_type === 'base' ? (
                                      <>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Color:</span>
                                          <span className="text-[10px] font-black text-indigo-600">{item.selected_color || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Shape:</span>
                                          <span className="text-[10px] font-black text-indigo-600">{item.selected_shape || '-'}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Paper/Liner:</span>
                                          <span className="text-[10px] font-bold text-slate-600">{item.paper || '-'} / {item.liner || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Plate:</span>
                                          <span className="text-[10px] font-bold text-slate-600">{item.plate_name || '-'}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</span>
                                    <span className="text-lg font-black text-indigo-600 mt-0.5">{item.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary Footer & Status Update */}
                        <div className="bg-indigo-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-indigo-600/20 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="w-full md:w-auto">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Order Status</p>
                            <select
                              value={order.order_status}
                              onChange={(e) => actions.updateBulkOrderStatus(order.id, e.target.value)}
                              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm font-black outline-none focus:bg-white/20 transition-all cursor-pointer w-full md:w-auto"
                            >
                              <option value="pending" className="text-slate-800">Pending</option>
                              <option value="processing" className="text-slate-800">Processing</option>
                              <option value="completed" className="text-slate-800">Completed</option>
                              <option value="cancelled" className="text-slate-800">Cancelled</option>
                            </select>
                          </div>
                          <div className="text-center md:text-right w-full md:w-auto">
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80">Total Items</p>
                            <p className="text-xl md:text-2xl font-black mt-0.5">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
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
          currentPage={bulkOrderPage}
          totalItems={totalBulkOrders}
          pageSize={pageSize}
          onPageChange={actions.setBulkOrderPage}
          label="bulk orders"
        />
      </div>
    </div>
  );
};
