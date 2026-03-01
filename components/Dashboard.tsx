import React from 'react';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { AlertTriangle, Package, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical, BellRing } from 'lucide-react';
import { IMG_BASE_URL } from '../utils/api';

interface DashboardProps {
  products: Product[];
  onNavigate?: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ products, onNavigate }) => {
  const totalProducts = products.length;
  // Dynamic threshold check
  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockLimit);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stockQuantity), 0);
  const activeCount = products.filter(p => p.isActive).length;

  const stockData = products
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '..' : p.name,
      stock: p.stockQuantity,
      status: p.stockStatus
    }));

  const StatCard = ({ title, value, icon: Icon, color, trend, trendUp }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative group overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-125 transition-transform duration-500 ${color}`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:rotate-12`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {/* <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical size={18} />
        </button> */}
      </div>
      <div className="relative z-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
        {/* <div className="flex items-center gap-2 mt-3">
          <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trendUp ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
            {trend}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vs last month</span>
        </div> */}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Overview</h2>
          <p className="text-slate-500 text-sm">Real-time inventory and catalog performance analytics</p>
        </div>
        {/* <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Export Report</button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Sync Data</button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Inventory Items" value={totalProducts} icon={Package} color="bg-indigo-600" trend="12.5%" trendUp />
        <StatCard title="Custom Threshold Alerts" value={lowStockProducts.length + outOfStockProducts.length} icon={BellRing} color="bg-rose-600" trend="2.4%" trendUp={false} />
        {/* <StatCard title="Projected Value" value={`₹${(totalValue/1000).toFixed(1)}k`} icon={DollarSign} color="bg-emerald-600" trend="8.1%" trendUp /> */}
        <StatCard title="Active Catalog" value={activeCount} icon={TrendingUp} color="bg-sky-600" trend="15.0%" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Stock Analysis</h3>
              <p className="text-slate-400 text-xs font-medium">Top performing products by inventory volume</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc', radius: 12}} contentStyle={{borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', padding: '12px 16px'}} />
                <Bar dataKey="stock" radius={[12, 12, 4, 4]} barSize={40}>
                  {stockData.map((entry, index) => {
                    const p = products.find(prod => prod.name.startsWith(entry.name.replace('..', '')));
                    const isLow = p ? entry.stock <= p.lowStockLimit : entry.stock < 10;
                    return (
                      <Cell key={`cell-${index}`} fill={isLow ? '#f43f5e' : '#6366f1'} fillOpacity={0.9} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Limit Reminders</h3>
              <span className="h-6 w-6 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                {outOfStockProducts.length + lowStockProducts.length}
              </span>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('stock-reminders')}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 group"
              >
                See all <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                   <Package size={32} />
                </div>
                <p className="text-slate-800 font-bold mb-1">Thresholds Safe</p>
                <p className="text-slate-400 text-xs px-8 leading-relaxed">All products are currently above your custom set limits.</p>
              </div>
            ) : (
              <>
                {outOfStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-rose-50/50 rounded-3xl border border-rose-100 group hover:shadow-lg hover:shadow-rose-500/5 transition-all">
                     <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white bg-white shrink-0 shadow-sm">
                        <img src={`${IMG_BASE_URL}${p.primaryImage}`} className="w-full h-full object-cover" alt="" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                          <AlertTriangle size={10} /> Completely Empty
                        </p>
                     </div>
                  </div>
                ))}
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-3xl border border-amber-100 group hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                     <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white bg-white shrink-0 shadow-sm">
                        <img src={`${IMG_BASE_URL}${p.primaryImage}`} className="w-full h-full object-cover" alt="" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-0.5">
                          At Limit ({p.stockQuantity} / {p.lowStockLimit})
                        </p>
                     </div>
                     <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};