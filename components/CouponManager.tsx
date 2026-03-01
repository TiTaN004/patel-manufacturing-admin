import React, { useState } from 'react';
import { useData } from '../DataContext';
import { 
  Ticket, 
  Plus, 
  Search, 
  Calendar, 
  Percent, 
  Hash, 
  Trash2, 
  Edit2, 
  Power, 
  PowerOff,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';
import { Coupon } from '../types';
import { Pagination } from './ui/Pagination';

const CouponManager: React.FC = () => {
  const { 
    coupons, 
    totalCoupons, 
    couponPage, 
    pageSize, 
    searchTerm,
    actions, 
    loading 
  } = useData();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minCartAmount: 0,
    isActive: true,
    showInPromo: false,
    comingSoon: false,
    usageLimit: null
  });

  const filteredCoupons = coupons; // Backend handles search now

  const activeCount = coupons.filter(c => c.isActive).length;
  const expiredCount = coupons.filter(c => c.endDate && new Date(c.endDate) < new Date()).length;

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData(coupon);
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minCartAmount: 0,
        maxDiscountAmount: undefined,
        usageLimit: null,
        startDate: undefined,
        endDate: undefined,
        isActive: true,
        showInPromo: false,
        comingSoon: false
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      await actions.updateCoupon(editingCoupon.id, formData);
    } else {
      await actions.addCoupon(formData as any);
    }
    setModalOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No limit';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Coupon Management</h1>
          <p className="text-slate-500 font-medium">Create and monitor discount campaigns</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by code..."
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-600 shadow-sm"
              value={searchTerm}
              onChange={(e) => actions.setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Coupons</p>
            <p className="text-2xl font-black text-slate-800">{activeCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Expired</p>
            <p className="text-2xl font-black text-slate-800">{expiredCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Uses</p>
            <p className="text-2xl font-black text-slate-800">
              {coupons.reduce((acc, curr) => acc + curr.usedCount, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl overflow-hidden group hover:border-indigo-100 transition-all">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                {/* Visual Representation */}
                <div className="w-full md:w-32 h-32 rounded-3xl bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-600/5 rounded-bl-[2rem]" />
                  <Ticket className="h-10 w-10 text-indigo-600 mb-1" />
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Coupon</p>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{coupon.code}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          coupon.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Paused'}
                        </span>
                        {coupon.showInPromo && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-600">
                            Promo
                          </span>
                        )}
                        {coupon.comingSoon && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-400">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenModal(coupon)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => actions.deleteCoupon(coupon.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-600">
                          {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-amber-500" />
                        {formatDate(coupon.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                      <Target className="h-3 w-3" />
                      Min: ₹{coupon.minCartAmount}
                    </div>
                    {coupon.maxDiscountAmount && (
                      <div className="px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                        <Plus className="h-3 w-3" />
                        Max Cap: ₹{coupon.maxDiscountAmount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-2 border-slate-50 p-20 flex flex-col items-center justify-center space-y-4">
             <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                <Ticket className="h-10 w-10" />
             </div>
             <div className="text-center">
               <p className="text-lg font-black text-slate-800">No Coupons Found</p>
               <p className="text-slate-400 font-medium">Get started by creating your first discount campaign</p>
             </div>
             <button 
               onClick={() => handleOpenModal()}
               className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
             >
               Launch Campaign
             </button>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={couponPage}
        totalItems={totalCoupons}
        pageSize={pageSize}
        onPageChange={actions.setCouponPage}
        label="coupons"
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingCoupon ? 'Update Coupon' : 'New Campaign'}
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">Configure your discount rules</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="p-2 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Code & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Coupon Code</label>
                    <input 
                      required
                      type="text"
                      placeholder="SUMMER20"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all uppercase"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discount Type</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all appearance-none"
                      value={formData.discountType}
                      onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discount Value</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-indigo-600">
                        {formData.discountType === 'percentage' ? '%' : '₹'}
                      </span>
                      <input 
                        required
                        type="number"
                        className="w-full pl-10 pr-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.discountValue}
                        onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Min Order Amount</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-indigo-600">₹</span>
                      <input 
                        type="number"
                        className="w-full pl-10 pr-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.minCartAmount}
                        onChange={e => setFormData({...formData, minCartAmount: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage Limit</label>
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                          checked={formData.usageLimit === null || formData.usageLimit === undefined}
                          onChange={e => setFormData({
                            ...formData, 
                            usageLimit: e.target.checked ? null : 0
                          })}
                        />
                        <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-tight transition-colors">No Limit</span>
                      </label>
                    </div>
                    <input 
                      type="number"
                      placeholder="e.g. 100"
                      disabled={formData.usageLimit === null || formData.usageLimit === undefined}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={formData.usageLimit ?? ''}
                      onChange={e => setFormData({...formData, usageLimit: e.target.value ? parseInt(e.target.value) : 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Max Cap (₹)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 500"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                      value={formData.maxDiscountAmount || ''}
                      onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined})}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                      value={formData.startDate?.split(' ')[0] || ''}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                    <input 
                      type="date"
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                      value={formData.endDate?.split(' ')[0] || ''}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer" onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${formData.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                      {formData.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Active Status</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Allow customers to use this code</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-all ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>

                {/* Promo & Coming Soon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer" onClick={() => {
                    const nextVal = !formData.showInPromo;
                    setFormData({
                      ...formData, 
                      showInPromo: nextVal,
                      comingSoon: nextVal ? false : formData.comingSoon
                    });
                  }}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${formData.showInPromo ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Promo List</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Show in website promo sections</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer" onClick={() => {
                    const nextVal = !formData.comingSoon;
                    setFormData({
                      ...formData, 
                      comingSoon: nextVal,
                      showInPromo: nextVal ? false : formData.showInPromo
                    });
                  }}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${formData.comingSoon ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Coming Soon</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Mark as upcoming campaign</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-600/20 shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
