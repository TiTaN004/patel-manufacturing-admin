import React, { useState } from 'react';
import { useData } from '../DataContext';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Palette, 
  Maximize, 
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import { Button } from './ui/Button';

export const BaseMasterManager: React.FC = () => {
  const { bulkMasters, actions, loading } = useData();
  const [activeTab, setActiveTab] = useState<'size' | 'color' | 'shape'>('size');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredMasters = bulkMasters.filter(m => m.type === activeTab);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setIsAdding(true);
    try {
      await actions.addBulkMaster({ type: activeTab, value: newValue.trim() });
      setNewValue('');
    } finally {
      setIsAdding(false);
    }
  };

  const tabs = [
    { id: 'size', label: 'Base Sizes', icon: Maximize, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'color', label: 'Available Colors', icon: Palette, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'shape', label: 'Standard Shapes', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-8 border-b bg-white">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Layers className="h-6 w-6 text-indigo-600" />
            Base Specification Masters
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Normalize the attributes used for base products globally.</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Tab Sidebar */}
        <div className="w-80 border-r bg-white flex flex-col p-4 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Attribute Groups</p>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between group ${
                        activeTab === tab.id ? `${tab.bg} shadow-sm` : 'hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            activeTab === tab.id ? 'bg-white shadow-sm' : 'bg-slate-50'
                        }`}>
                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? tab.color : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <p className={`font-black text-sm ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>{tab.label}</p>
                            <p className="text-[10px] font-bold text-slate-400">Total: {bulkMasters.filter(m => m.type === tab.id).length}</p>
                        </div>
                    </div>
                    {activeTab === tab.id && <ChevronRight size={16} className={tab.color} />}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* New Entry Form */}
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       {(() => {
                         const Icon = tabs.find(t => t.id === activeTab)?.icon;
                         return Icon ? <Icon size={120} /> : null;
                       })()}
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="text-indigo-600" size={20} />
                        Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h3>
                    
                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder={`Enter ${activeTab} value (e.g. ${activeTab === 'size' ? '10x10x5' : activeTab === 'color' ? 'Royal Blue' : 'Round'})`}
                            className="flex-1 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold"
                            value={newValue}
                            onChange={e => setNewValue(e.target.value)}
                        />
                        <Button 
                            disabled={isAdding || !newValue.trim()}
                            className="rounded-2xl px-8 font-black shadow-lg shadow-indigo-200"
                        >
                            {isAdding ? <Loader2 className="animate-spin" /> : 'Register Value'}
                        </Button>
                    </form>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMasters.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Maximize className="text-slate-200" size={32} />
                             </div>
                             <p className="font-bold text-slate-400">No {activeTab}s defined yet.</p>
                        </div>
                    ) : (
                        filteredMasters.map(master => (
                            <div key={master.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400">
                                        #{master.id}
                                    </div>
                                    <span className="font-black text-slate-700">{master.value}</span>
                                </div>
                                <button 
                                    onClick={() => { if(window.confirm('Delete this master value?')) actions.deleteBulkMaster(master.id) }}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
