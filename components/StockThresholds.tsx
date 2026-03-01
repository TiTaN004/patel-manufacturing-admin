import React from 'react';
import { Product, MainCategory } from '../types';
import { useData } from '../DataContext';
import { BellRing, Package, Save, TrendingDown, TrendingUp, AlertTriangle, Search, X } from 'lucide-react';
import { IMG_BASE_URL } from '../utils/api';
import { calculateDiscount } from '../utils/math';
import { Pagination } from './ui/Pagination';

export const StockThresholds: React.FC = () => {
  const { 
    allProducts,
    thresholdPage, 
    pageSize, 
    categories, 
    actions 
  } = useData();

  const [searchQuery, setSearchQuery] = React.useState('');

  // Handle search filtering
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  // Reset page ONLY when search query changes
  const lastSearchQuery = React.useRef(searchQuery);
  React.useEffect(() => {
    if (lastSearchQuery.current !== searchQuery) {
      actions.setThresholdPage(1);
      lastSearchQuery.current = searchQuery;
    }
  }, [searchQuery, actions]);

  // Calculate paginated products from filteredProducts
  const paginatedProducts = filteredProducts.slice(
    (thresholdPage - 1) * pageSize,
    thresholdPage * pageSize
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Stock & Alert Limits</h2>
          <p className="text-slate-500 text-sm">Configure threshold notifications for your entire catalog</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
           {/* Search Input */}
           <div className="relative group w-full md:w-72">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                 <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Search products or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-10 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <X size={14} />
                </button>
              )}
           </div>

           <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4 flex items-center gap-4">
           <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BellRing size={20} />
           </div>
           <div>
              <p className="text-xs font-black text-indigo-700 uppercase tracking-widest">Active Alerts</p>
              <p className="text-lg font-black text-indigo-900 leading-none">
                {allProducts.filter(p => p.stockQuantity <= p.lowStockLimit).length} Products
              </p>
           </div>
        </div>
      </div>
    </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-5 border-b border-slate-100">Product Particulars</th>
                <th className="px-8 py-5 border-b border-slate-100 text-center">Current Stock</th>
                <th className="px-8 py-5 border-b border-slate-100 text-center">Alert Limit</th>
                <th className="px-8 py-5 border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.map(p => {
                const mainCat = categories.main.find(c => c.id === p.mainCategoryId)?.name || 'General';
                const isUnderLimit = p.stockQuantity <= p.lowStockLimit;
                const discount = calculateDiscount(p.price, p.mrp);
                
                return (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-[1.25rem] border border-slate-100 overflow-hidden shadow-sm shrink-0 bg-white">
                          <img src={`${IMG_BASE_URL}${p.primaryImage}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-lg truncate leading-tight">{p.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mainCat}</span>
                             <div className="flex items-center gap-1.5">
                               <span className="text-rose-600 font-bold text-sm">-{discount}%</span>
                               <span className="font-black text-slate-900 text-base leading-none">₹{p.price.toLocaleString()}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                         <div className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm group-hover:border-indigo-100 transition-colors">
                            <button 
                              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                              onClick={() => actions.updateStock(p.id, Math.max(0, p.stockQuantity - 1))}
                            >
                               <TrendingDown size={14} />
                            </button>
                            <span className="font-black text-slate-800 text-lg w-10 text-center">{p.stockQuantity}</span>
                            <button 
                              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                              onClick={() => actions.updateStock(p.id, p.stockQuantity + 1)}
                            >
                               <TrendingUp size={14} />
                            </button>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <div className="relative group/limit">
                          <input 
                            type="number" 
                            className="bg-indigo-50 border-2 border-indigo-100 rounded-xl px-4 py-2 w-24 text-center font-black text-indigo-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            value={p.lowStockLimit}
                            onChange={(e) => actions.updateStockLimit(p.id, parseInt(e.target.value) || 0)}
                          />
                          <div className="absolute -top-1 -right-1 opacity-0 group-hover/limit:opacity-100 transition-opacity">
                             <div className="h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                <Save size={10} />
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${isUnderLimit ? 'bg-rose-500 shadow-lg shadow-rose-200 animate-pulse' : 'bg-emerald-500 shadow-lg shadow-emerald-200'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isUnderLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isUnderLimit ? 'Attention Needed' : 'Catalog Safe'}
                          </span>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={thresholdPage}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={actions.setThresholdPage}
          label="matching products"
        />
      </div>
    </div>
  );
};