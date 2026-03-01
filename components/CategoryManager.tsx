import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Plus, Trash2, ChevronRight, ChevronLeft, FolderTree, Image as ImageIcon, Upload, ArrowLeft } from 'lucide-react';
import { IMG_BASE_URL } from '../utils/api';
import { Button } from './ui/Button';
import { Pagination } from './ui/Pagination';



export const CategoryManager: React.FC = () => {
  const { 
    categories, 
    totalCategories, 
    categoryPage, 
    pageSize, 
    actions 
  } = useData();

  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const [newMainName, setNewMainName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubSubName, setNewSubSubName] = useState('');

  const filteredSubs = categories.sub.filter(s => s.mainCategoryId === selectedMainId);
  const filteredSubSubs = categories.subSub.filter(ss => ss.subCategoryId === selectedSubId);

  const handleAddMain = async () => {
    if (newMainName.trim()) {
      await actions.addMainCat(newMainName);
      setNewMainName('');
      setSelectedSubId(null);
    }
  };

  const handleAddSub = async () => {
    if (newSubName.trim() && selectedMainId) {
      await actions.addSubCat(selectedMainId, newSubName);
      setNewSubName('');
    }
  };

  const handleAddSubSub = async () => {
    if (newSubSubName.trim() && selectedSubId) {
      await actions.addSubSubCat(selectedSubId, newSubSubName);
      setNewSubSubName('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedMainId) {
      await actions.uploadCategoryImg(selectedMainId, e.target.files[0]);
    }
  };

  const handleDeleteImage = async () => {
    if (selectedMainId && window.confirm("Are you sure you want to remove this category image?")) {
      await actions.deleteCategoryImg(selectedMainId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-indigo-600" />
          Category Hierarchy Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">Manage your 3-level catalog structure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Level 1: Main Category */}
        <div className={`flex flex-col border rounded-lg overflow-hidden bg-slate-50 h-[450px] lg:h-[600px] ${selectedMainId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3 bg-slate-100 border-b font-semibold text-slate-700 flex items-center justify-between">
            <span>1. Main Categories</span>
            <span className="text-xs font-normal text-slate-500 lg:hidden">Select to continue</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {categories.main.map(cat => (
              <div 
                key={cat.id}
                onClick={() => { setSelectedMainId(cat.id); setSelectedSubId(null); }}
                className={`p-3 rounded-md cursor-pointer flex justify-between items-center group transition-all ${
                  selectedMainId === cat.id ? 'bg-indigo-50 border-indigo-200 border text-indigo-700' : 'bg-white border hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold">
                    {categories.sub.filter(s => s.mainCategoryId === cat.id).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (window.confirm(`Are you sure you want to delete the main category "${cat.name}"? This will also remove all its sub-categories and products.`)) {
                        actions.deleteMainCat(cat.id); 
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={14} />
                   </button>
                   <ChevronRight size={16} className={selectedMainId === cat.id ? 'text-indigo-600' : 'text-slate-300'} />
                </div>
              </div>
            ))}
          </div>
          {/* <Pagination 
            currentPage={categoryPage}
            totalItems={totalCategories}
            pageSize={pageSize}
            onPageChange={actions.setCategoryPage}
            label="categories"
          /> */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newMainName}
                onChange={e => setNewMainName(e.target.value)}
                placeholder="New Main Category"
                className="flex-1 text-sm border rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button size="sm" onClick={handleAddMain} disabled={!newMainName.trim()}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Level 2: Sub Category */}
        <div className={`flex flex-col border rounded-lg overflow-hidden bg-slate-50 h-[450px] lg:h-[600px] ${(!selectedMainId || selectedSubId) ? 'hidden lg:flex' : 'flex'} ${!selectedMainId ? 'lg:opacity-50 lg:pointer-events-none' : ''}`}>
          <div className="p-3 bg-slate-100 border-b font-semibold text-slate-700 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedMainId(null)}
                  className="p-1 -ml-1 hover:bg-slate-200 rounded lg:hidden"
                >
                  <ArrowLeft size={18} />
                </button>
                <span>2. Sub Categories</span>
              </div>
              {selectedMainId && <span className="text-[10px] font-normal px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full max-w-[120px] truncate">For: {categories.main.find(m => m.id === selectedMainId)?.name}</span>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {!selectedMainId && <div className="text-center text-slate-400 mt-10 text-sm hidden lg:block">Select a Main Category first</div>}
             {filteredSubs.map(sub => (
              <div 
                key={sub.id}
                onClick={() => setSelectedSubId(sub.id)}
                className={`p-3 rounded-md cursor-pointer flex justify-between items-center group transition-all ${
                  selectedSubId === sub.id ? 'bg-indigo-50 border-indigo-200 border text-indigo-700' : 'bg-white border hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{sub.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold">
                    {categories.subSub.filter(ss => ss.subCategoryId === sub.id).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (window.confirm(`Are you sure you want to delete the sub-category "${sub.name}"?`)) {
                        actions.deleteSubCat(sub.id); 
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={14} />
                   </button>
                   <ChevronRight size={16} className={selectedSubId === sub.id ? 'text-indigo-600' : 'text-slate-300'} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input 
                 type="text" 
                 value={newSubName}
                 onChange={e => setNewSubName(e.target.value)}
                 placeholder="New Sub Category"
                 className="flex-1 text-sm border rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button size="sm" onClick={handleAddSub} disabled={!newSubName.trim()}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Level 3: Sub-Sub Category */}
        <div className={`flex flex-col border rounded-lg overflow-hidden bg-slate-50 h-[450px] lg:h-[600px] ${!selectedSubId ? 'hidden lg:flex' : 'flex'} ${!selectedSubId ? 'lg:opacity-50 lg:pointer-events-none' : ''}`}>
           <div className="p-3 bg-slate-100 border-b font-semibold text-slate-700 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedSubId(null)}
                  className="p-1 -ml-1 hover:bg-slate-200 rounded lg:hidden"
                >
                  <ArrowLeft size={18} />
                </button>
                <span>3. Sub-Sub Categories</span>
              </div>
               {selectedSubId && <span className="text-[10px] font-normal px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full max-w-[120px] truncate">For: {categories.sub.find(s => s.id === selectedSubId)?.name}</span>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {!selectedSubId && <div className="text-center text-slate-400 mt-10 text-sm hidden lg:block">Select a Sub Category first</div>}
            {filteredSubSubs.map(ss => (
              <div 
                key={ss.id}
                className="p-3 rounded-md bg-white border hover:border-indigo-300 flex justify-between items-center group"
              >
                <span className="font-medium text-slate-700">{ss.name}</span>
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the sub-sub-category "${ss.name}"?`)) {
                      actions.deleteSubSubCat(ss.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input 
                 type="text" 
                 value={newSubSubName}
                 onChange={e => setNewSubSubName(e.target.value)}
                 placeholder="New Sub-Sub Category"
                 className="flex-1 text-sm border rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button size="sm" onClick={handleAddSubSub} disabled={!newSubSubName.trim()}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Main Category Preview & Image Upload */}
        <div className="lg:col-span-3 bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4">
          {selectedMainId ? (
            <>
              <div className="h-24 w-24 sm:h-32 sm:w-32 bg-white rounded-2xl border-2 border-indigo-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0 relative group">
                {categories.main.find(m => m.id === selectedMainId)?.imageUrl ? (
                  <>
                    <img 
                      src={`${IMG_BASE_URL}${categories.main.find(m => m.id === selectedMainId)?.imageUrl}`} 
                      alt="Category" 
                      className="h-full w-full object-cover"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteImage(); }}
                      className="absolute top-1 right-1 bg-rose-600/90 text-white p-1 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg z-10"
                      title="Remove Image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-200" />
                )}
                <label className="absolute inset-0 bg-indigo-600/60 text-white flex flex-col items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold">
                  <Upload size={16} className="mb-1" />
                  {categories.main.find(m => m.id === selectedMainId)?.imageUrl ? 'CHANGE' : 'UPLOAD'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight truncate max-w-[250px] sm:max-w-none mx-auto sm:mx-0">
                  {categories.main.find(m => m.id === selectedMainId)?.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Category Assets</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                   <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white border border-indigo-100 rounded-full text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                     ID: {selectedMainId.padStart(4, '0')}
                   </span>
                   <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white border border-indigo-100 rounded-full text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                     {filteredSubs.length} Subs
                   </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 text-center py-2 sm:py-4 flex flex-col items-center gap-2">
               <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm animate-bounce">
                 <ChevronRight className="text-indigo-400 rotate-90 lg:rotate-0" />
               </div>
               <p className="text-[10px] sm:text-sm font-bold text-indigo-400 uppercase tracking-widest leading-none">Select a category to manage assets</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};