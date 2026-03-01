import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Plus, X, Tag, ListFilter, Trash2, Search, Edit2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Pagination } from './ui/Pagination';



export const FilterManager: React.FC = () => {
  const { 
    filters, 
    allMainCategories, 
    totalFilters, 
    filterPage, 
    pageSize, 
    searchTerm,
    actions 
  } = useData();

  const mainCategories = allMainCategories;

  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (filter: any) => {
    setEditingId(filter.id);
    setLabel(filter.label);
    setCode(filter.code);
    setValues(filter.values.map((v: any) => v.value));
    setSelectedCats(filter.mappedMainCategoryIds);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLabel('');
    setCode('');
    setValues([]);
    setSelectedCats([]);
  };

  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (val: string) => {
    setValues(values.filter(v => v !== val));
  };

  const toggleCategory = (id: string) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (label && code && values.length > 0 && selectedCats.length > 0) {
      if (editingId) {
        await actions.updateFilter(editingId, {
          label,
          code,
          values: values.map((v, i) => ({ id: `fv-${Date.now()}-${i}`, value: v })),
          mappedMainCategoryIds: selectedCats
        });
      } else {
        await actions.addFilter({
          label,
          code,
          values: values.map((v, i) => ({ id: `fv-${Date.now()}-${i}`, value: v })),
          mappedMainCategoryIds: selectedCats,
          isActive: true
        });
      }
      // Reset
      cancelEdit();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-200px)] lg:min-h-[600px]">
      {/* Create Filter Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col overflow-hidden">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
          {editingId ? <Edit2 className="h-5 w-5 text-indigo-600" /> : <Plus className="h-5 w-5 text-indigo-600" />}
          {editingId ? 'Edit Filter' : 'Create New Filter'}
        </h2>

        <div className="space-y-4 flex-1 lg:overflow-y-auto lg:pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">1. Filter Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Size"
                className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border p-2 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">2. Filter Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="e.g. size"
                className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border p-2 text-sm transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">3. Filter Values</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                placeholder="Type value (e.g. Small)"
                className="flex-1 border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border p-2 text-sm transition-all"
              />
              <Button type="button" onClick={handleAddValue} variant="secondary" size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {values.map(val => (
                <span key={val} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-tight">
                  {val}
                  <button onClick={() => handleRemoveValue(val)} className="text-indigo-400 hover:text-indigo-600 ml-0.5"><X size={10} /></button>
                </span>
              ))}
              {values.length === 0 && <span className="text-[11px] text-slate-400 italic">No values addedyet</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">4. Map to Categories</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 max-h-40 overflow-y-auto">
              {mainCategories.map(cat => (
                <label key={cat.id} className="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all group">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-900 truncate font-medium">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t shrink-0 flex gap-2">
          {editingId && (
            <Button 
              onClick={cancelEdit} 
              variant="outline"
              className="flex-1 rounded-xl h-10"
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            disabled={!label || !code || values.length === 0 || selectedCats.length === 0}
            className="flex-[2] rounded-xl shadow-md h-10"
          >
            {editingId ? 'Update Filter' : 'Create Filter'}
          </Button>
        </div>
      </div>

      {/* Existing Filters List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-indigo-600" />
            Active Filters
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{totalFilters} Filters</span>
        </div>

        <div className="mb-4 relative group shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-600" />
          <input 
            type="text" 
            placeholder="Search filters..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs"
            value={searchTerm || ''}
            onChange={(e) => actions.setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex-1 lg:overflow-y-auto space-y-3 lg:pr-1 mb-4">
          {filters.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Tag size={40} className="mx-auto mb-3 opacity-10" />
              <p className="text-sm font-medium">No filters found</p>
            </div>
          ) : (
            filters.map(filter => (
              <div key={filter.id} className="border border-slate-100 rounded-xl p-3.5 hover:shadow-md transition-all bg-slate-50/30 group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm group-hover:text-indigo-600 transition-colors">
                      <Tag size={12} />
                    </div>
                    {filter.label}
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                      {filter.code}
                    </span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(filter)} 
                      className="h-7 w-7 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the filter "${filter.label}"?`)) {
                          actions.deleteFilter(filter.id);
                        }
                      }} 
                      className="h-7 w-7 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {filter.values.map(v => (
                      <span key={v.id} className="px-2 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-500 font-medium">
                        {v.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                  {filter.mappedMainCategoryIds.map(catId => {
                    const cat = mainCategories.find(c => c.id === catId);
                    return cat ? (
                      <span key={catId} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                        {cat.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="shrink-0 pt-2 border-t">
          <Pagination 
            currentPage={filterPage}
            totalItems={totalFilters}
            pageSize={pageSize}
            onPageChange={actions.setFilterPage}
            label="filters"
          />
        </div>
      </div>
    </div>
  );
};