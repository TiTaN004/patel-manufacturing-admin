import React from 'react';
import { useData } from '../DataContext';
import { BellRing, AlertTriangle, TrendingDown, TrendingUp, Save, PackageSearch, Search, X } from 'lucide-react';
import { IMG_BASE_URL } from '../utils/api';
import { Pagination } from './ui/Pagination';

export const StockReminders: React.FC = () => {
  const { allProducts, categories, pageSize, reminderPage, actions } = useData();

  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter only products that are at or below their limit
  const alertProducts = React.useMemo(() => {
    return allProducts.filter(p => 
      p.stockQuantity <= p.lowStockLimit && 
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allProducts, searchQuery]);

  const outOfStockCount = React.useMemo(() => 
    allProducts.filter(p => p.stockQuantity === 0).length, 
  [allProducts]);
  
  const lowStockCount = React.useMemo(() => 
    allProducts.filter(p => p.stockQuantity <= p.lowStockLimit && p.stockQuantity > 0).length, 
  [allProducts]);

  // Reset page ONLY when search query changes
  const lastSearchQuery = React.useRef(searchQuery);
  React.useEffect(() => {
    if (lastSearchQuery.current !== searchQuery) {
      actions.setReminderPage(1);
      lastSearchQuery.current = searchQuery;
    }
  }, [searchQuery, actions]);

  // Paginated list from filtered alertProducts
  const paginatedAlerts = alertProducts.slice(
    (reminderPage - 1) * pageSize,
    reminderPage * pageSize
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Priority Reminders</h2>
          <p className="text-slate-500 text-sm">Action required for items at or below threshold limits.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Search Input */}
          <div className="relative group w-full md:w-72">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
             </div>
             <input 
               type="text"
               placeholder="Search alerts by name or SKU..."
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

          <div className="flex gap-4">
          <div className="bg-rose-50 border border-rose-100 rounded-3xl px-6 py-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest leading-tight">Out of Stock</p>
              <p className="text-xl font-black text-rose-900 leading-none">{outOfStockCount}</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-3xl px-6 py-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <BellRing size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-tight">Low Stock</p>
              <p className="text-xl font-black text-amber-900 leading-none">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {alertProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-8 py-5 border-b border-slate-100">Product Info</th>
                    <th className="px-8 py-5 border-b border-slate-100 text-center">Remaining Stock</th>
                    <th className="px-8 py-5 border-b border-slate-100 text-center">Alert Threshold</th>
                    <th className="px-8 py-5 border-b border-slate-100">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAlerts.map(p => {
                    const mainCat = categories.main.find(c => c.id === p.mainCategoryId)?.name || 'General';
                    const isEmpty = p.stockQuantity === 0;
                    
                    return (
                      <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`h-16 w-16 rounded-[1.25rem] border-2 overflow-hidden shadow-sm shrink-0 bg-white ${isEmpty ? 'border-rose-200' : 'border-amber-200'}`}>
                              <img src={`${IMG_BASE_URL}${p.primaryImage}`} className="w-full h-full object-cover grayscale-[0.5]" alt="" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 text-lg truncate leading-tight">{p.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{mainCat} • {p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-center gap-2">
                             <div className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                                <button 
                                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                  onClick={() => actions.updateStock(p.id, Math.max(0, p.stockQuantity - 1))}
                                >
                                   <TrendingDown size={14} />
                                </button>
                                <span className={`font-black text-lg w-10 text-center ${isEmpty ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {p.stockQuantity}
                                </span>
                                <button 
                                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                  onClick={() => actions.updateStock(p.id, p.stockQuantity + 1)}
                                >
                                   <TrendingUp size={14} />
                                </button>
                             </div>
                             <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${isEmpty ? 'bg-rose-500' : 'bg-amber-500'}`}
                                  style={{ width: `${Math.min(100, (p.stockQuantity / (p.lowStockLimit || 1)) * 100)}%` }}
                                />
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
                              <div className={`h-3 w-3 rounded-full animate-pulse ${isEmpty ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-amber-500 shadow-lg shadow-amber-200'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${isEmpty ? 'text-rose-600' : 'text-amber-600'}`}>
                                {isEmpty ? 'Immediate Restock' : 'Approaching Limit'}
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
              currentPage={reminderPage}
              totalItems={alertProducts.length}
              pageSize={pageSize}
              onPageChange={actions.setReminderPage}
              label="priority reminders"
            />
          </>
        ) : (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <PackageSearch size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800">All Stock Healthy</h3>
            <p className="text-slate-500 mt-2 max-w-sm">No products are currently at or below their notification limits. Great job managing inventory!</p>
          </div>
        )}
      </div>
    </div>
  );
};