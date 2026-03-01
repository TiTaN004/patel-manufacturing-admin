import React, { useState, useEffect } from 'react';
import { MainCategory, SubCategory, SubSubCategory, Filter, Product } from '../types';
import { Button } from './ui/Button';
import { ChevronRight, ChevronLeft, ChevronDown, Upload, CheckCircle, AlertCircle, Wand2, Plus, X, BellRing, Loader2 } from 'lucide-react';
import { analyzeProductImage, fileToGenerativePart } from '../services/geminiService';
import { IMG_BASE_URL, uploadAPI, productAPI } from '../utils/api';
import { calculateDiscount } from '../utils/math';

interface ProductWizardProps {
  categories: {
    main: MainCategory[];
    sub: SubCategory[];
    subSub: SubSubCategory[];
  };
  filters: Filter[];
  initialData?: Product;
  onComplete: (product: Omit<Product, 'id' | 'lastStockUpdate'>) => void;
  onCancel: () => void;
}

const STEPS = ['Category', 'Filters', 'Media (AI)', 'Details', 'Extra', 'Stock', 'Review'];

export const ProductWizard: React.FC<ProductWizardProps> = ({ categories, filters, initialData, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    price: 0,
    mrp: 0,
    sku: `SKU-${Date.now()}`,
    stockQuantity: 100,
    lowStockLimit: 10,
    stockStatus: 'in_stock',
    selectedFilters: {},
    primaryImage: '',
    additionalImages: [],
    isActive: true,
    extraDetails: { customAttributes: [] }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  // Real-time Slug Validation
  useEffect(() => {
    if (!formData.slug) {
      setIsSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const response = await productAPI.checkSlug(formData.slug, initialData?.id);
        setIsSlugAvailable(!response.data.exists);
      } catch (error) {
        console.error("Error checking slug:", error);
        setIsSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug, initialData?.id]);

  // const [aiAnalysis, setAiAnalysis] = useState<{ suggestedName?: string, keywords?: string[] } | null>(null);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const selectedMainCatName = categories.main.find(c => c.id === formData.mainCategoryId)?.name || '...';
  const relevantSubs = categories.sub.filter(s => s.mainCategoryId === formData.mainCategoryId);
  const relevantSubSubs = categories.subSub.filter(ss => ss.subCategoryId === formData.subCategoryId);
  const relevantFilters = filters.filter(f => formData.mainCategoryId && f.mappedMainCategoryIds.includes(formData.mainCategoryId));

  const updateField = (field: keyof Product, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate slug if name changes and slug is empty or was auto-generated
      if (field === 'name' && (!prev.slug || prev.slug === slugify(prev.name || ''))) {
        newData.slug = slugify(value);
      }
      
      return newData;
    });
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const updateExtra = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      extraDetails: { ...prev.extraDetails, [field]: value }
    }));
  };

  const handlePrimaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      const response = await uploadAPI.single(uploadFormData);
      const data = response.data;
      
      if (data.success && data.data) {
        setUploadedFiles(prev => [...prev, data.data.url]);
        updateField("primaryImage", data.data.url);
        
        // Start AI Analysis after successful upload
        setIsAnalyzing(true);
        // try {
        //   const base64 = await fileToGenerativePart(file);
        //   const result = await analyzeProductImage(base64, file.type);
          
        //   if (result) {
        //     setFormData(prev => ({
        //       ...prev,
        //       name: result.productName || prev.name,
        //       shortDescription: result.shortDescription || prev.shortDescription,
        //       mrp: result.estimatedPrice || prev.mrp,
        //       price: result.estimatedPrice ? Math.floor(result.estimatedPrice * 0.8) : prev.price,
        //     }));
        //     // setAiAnalysis({ suggestedName: result.productName, keywords: result.keywords });
        //   }
        // } catch (err) {
        //   console.error("AI Error", err);
        // } finally {
        //   setIsAnalyzing(false);
        // }
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred during upload";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files) as File[];
    const currentImages = formData.additionalImages || [];
    
    if (currentImages.length + files.length > 5) {
      alert("Maximum 5 gallery images allowed");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      files.forEach((file) => {
        uploadFormData.append("images[]", file);
      });
      const response = await uploadAPI.multiple(uploadFormData);
      const data = response.data;
      
      if (data.success && Array.isArray(data.data)) {
        const newUrls = data.data.map((f: any) => f.url);
        if (newUrls.length > 0) {
          setUploadedFiles(prev => [...prev, ...newUrls]);
          updateField("additionalImages", [...currentImages, ...newUrls]);
        }
      } else if (!data.success) {
        alert(data.message || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const removePrimaryImage = async () => {
    if (!window.confirm("Are you sure you want to remove the primary image?")) return;
    const imageToRemove = formData.primaryImage;
    updateField("primaryImage", "");
    
    if (imageToRemove) {
      setUploadedFiles(prev => prev.filter(url => url !== imageToRemove));
      try {
        const pathParts = imageToRemove.split('/uploads/');
        const fullRelativePath = pathParts.length > 1 ? pathParts[1] : imageToRemove.split('/').pop();
        if (fullRelativePath) {
          await uploadAPI.delete(fullRelativePath, initialData?.id);
        }
      } catch (error) {
        console.error("Failed to delete primary image from server", error);
      }
    }
  };

  const removeGalleryImage = async (index: number) => {
    if (!window.confirm("Are you sure you want to remove this gallery image?")) return;
    const currentImages = formData.additionalImages || [];
    const imageToRemove = currentImages[index];
    updateField("additionalImages", currentImages.filter((_, i) => i !== index));
    
    if (imageToRemove) {
      setUploadedFiles(prev => prev.filter(url => url !== imageToRemove));
      try {
        const pathParts = imageToRemove.split('/uploads/');
        const fullRelativePath = pathParts.length > 1 ? pathParts[1] : imageToRemove.split('/').pop();
        if (fullRelativePath) {
          await uploadAPI.delete(fullRelativePath, initialData?.id);
        }
      } catch (error) {
        console.error("Failed to delete file from server", error);
      }
    }
  };

  const handleClose = async () => {
    // Check if any newly uploaded images are still in the gallery
    const hasUnsavedGalleryImages = (formData.additionalImages || []).some(img => 
      uploadedFiles.includes(img) && !initialData?.additionalImages?.includes(img)
    );

    if (hasUnsavedGalleryImages) {
      alert("You have uploaded new gallery images. Please either submit the product to save them, or delete the images manually before closing.");
      return;
    }

    if (uploadedFiles.length > 0) {
      // console.log("Cleaning up orphaned files:", uploadedFiles);
      await Promise.all(uploadedFiles.map(async (url) => {
        try {
          // If the file is NOT currently in the form (orphaned), clean it up from server
          const isInForm = formData.primaryImage === url || formData.additionalImages?.includes(url);
          
          if (!isInForm) {
            const pathParts = url.split('/uploads/');
            const fullRelativePath = pathParts.length > 1 ? pathParts[1] : url.split('/').pop();
            if (fullRelativePath) await uploadAPI.delete(fullRelativePath, initialData?.id);
          }
        } catch (error) {
          console.warn(`Failed to cleanup file ${url}`, error);
        }
      }));
    }
    onCancel();
  };

  const toggleFilterValue = (filterId: string, valueId: string) => {
    const currentSelected = formData.selectedFilters?.[filterId] || [];
    const newSelected = currentSelected.includes(valueId)
      ? currentSelected.filter(v => v !== valueId)
      : [...currentSelected, valueId];
    
    setFormData(prev => ({
      ...prev,
      selectedFilters: { ...prev.selectedFilters, [filterId]: newSelected }
    }));
  };

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  const validateStep = () => {
    switch (currentStep) {
      case 0: return formData.mainCategoryId && formData.subCategoryId;
      case 3: return formData.name && formData.slug && formData.price && formData.mrp && isSlugAvailable !== false;
      case 2: return !!formData.primaryImage;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Category
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800">Assign Hierarchy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Main Category</label>
                <div className="relative group">
                  <select 
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 pr-12 focus:border-indigo-500 outline-none transition-all appearance-none bg-slate-50 text-base"
                    value={formData.mainCategoryId || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        mainCategoryId: val,
                        subCategoryId: '',
                        subSubCategoryId: '',
                        selectedFilters: {} // Filters are often category-dependent
                      }));
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.main.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" size={20} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sub Category</label>
                <div className="relative group">
                  <select 
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 pr-12 focus:border-indigo-500 outline-none transition-all appearance-none bg-slate-50 text-base disabled:opacity-50"
                    value={formData.subCategoryId || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        subCategoryId: val,
                        subSubCategoryId: ''
                      }));
                    }}
                    disabled={!formData.mainCategoryId}
                  >
                    <option value="">Select Sub</option>
                    {relevantSubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" size={20} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Leaf Category</label>
                <div className="relative group">
                  <select 
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 pr-12 focus:border-indigo-500 outline-none transition-all appearance-none bg-slate-50 text-base disabled:opacity-50"
                    value={formData.subSubCategoryId || ''}
                    onChange={e => updateField('subSubCategoryId', e.target.value)}
                    disabled={!formData.subCategoryId}
                  >
                    <option value="">Select Leaf</option>
                    {relevantSubSubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 pointer-events-none transition-colors" size={20} />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Filters
        return (
          <div className="space-y-6">
            {/* {console.log(selectedMainCatName)} */}
            <h3 className="text-lg font-bold text-slate-800">Smart Filters <span className="text-indigo-600 font-normal">for {selectedMainCatName}</span></h3>
            {relevantFilters.length === 0 ? (
               <div className="p-8 bg-slate-50 text-slate-400 rounded-3xl border-2 border-dashed border-slate-200 text-center">No filters configured for this path.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {relevantFilters.map(filter => (
                  <div key={filter.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <label className="font-bold text-slate-700 block mb-4 uppercase text-[10px] tracking-widest">{filter.label}</label>
                    <div className="flex flex-wrap gap-2">
                      {filter.values.map(val => {
                        const isSelected = formData.selectedFilters?.[filter.id]?.includes(val.id);
                        return (
                          <button
                            key={val.id}
                            onClick={() => toggleFilterValue(filter.id, val.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                            }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2: // Media
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              Media & Assets
              {isAnalyzing && <span className="text-xs font-black text-indigo-600 animate-pulse bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1.5"><Wand2 size={12}/> AI Identifying...</span>}
              {uploading && <span className="text-xs font-black text-slate-500 animate-pulse bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Uploading...</span>}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-3">Main Cover</label>
                <div className="border-4 border-dashed border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-4 flex flex-col items-center justify-center h-48 sm:h-64 md:h-80 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all relative overflow-hidden group">
                  {formData.primaryImage ? (
                     <div className="relative w-full h-full group">
                        <img src={`${IMG_BASE_URL}${formData.primaryImage}`} alt="Primary" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />
                        <button 
                          className="absolute top-4 right-4 bg-rose-600/90 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePrimaryImage(); }}
                          title="Remove Image"
                        >
                          <X size={20} />
                        </button>
                     </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 mx-auto mb-4 group-hover:rotate-12 transition-transform">
                        <Upload className="h-8 w-8 text-indigo-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">Drag or browse image</p>
                    </div>
                  )}
                  {!formData.primaryImage && <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePrimaryImageUpload} disabled={uploading} />}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-3">Gallery (Max 5)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {formData.additionalImages?.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 relative group shadow-sm">
                       <img src={`${IMG_BASE_URL}${img}`} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                       <button 
                        className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(idx)}
                       >
                         <X size={20} />
                       </button>
                    </div>
                  ))}
                  {(formData.additionalImages?.length || 0) < 5 && (
                    <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 relative cursor-pointer group">
                      <Plus className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" multiple onChange={handleGalleryUpload} disabled={uploading} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Details
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Product Particulars</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Formal Name</label>
                <input 
                  type="text" 
                  placeholder="Enter formal name"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 text-base"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">URL Slug (Customizable)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <span className="flex items-center px-4 py-3 sm:py-0 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-400 text-xs font-mono">/product/</span>
                  <input 
                    type="text" 
                    className="flex-1 border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-mono text-base"
                    value={formData.slug}
                    onChange={e => updateField('slug', slugify(e.target.value))}
                    placeholder="e.g. apple-iphone-15-pro"
                  />
                </div>
                <p className="text-[10px] text-slate-400 px-2 font-medium italic">Used for SEO-friendly web addresses.</p>
                {formData.slug && (
                  <div className="px-2 mt-1 flex items-center gap-2">
                    {checkingSlug ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Checking availability...
                      </span>
                    ) : isSlugAvailable === true ? (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold italic">
                        <CheckCircle size={10} /> Slug is available
                      </span>
                    ) : isSlugAvailable === false ? (
                      <span className="text-[10px] text-rose-600 flex items-center gap-1 font-bold italic">
                        <AlertCircle size={10} /> This slug is already taken
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Original Price (M.R.P.)</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold text-base"
                  value={formData.mrp}
                  onChange={e => updateField('mrp', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Offer Price (Sale)</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold text-indigo-600 text-base"
                  value={formData.price}
                  onChange={e => updateField('price', parseFloat(e.target.value))}
                />
                {formData.mrp && formData.price && (
                   <p className="text-xs font-black text-rose-500 uppercase tracking-widest px-2">
                     Total Discount: {calculateDiscount(formData.price, formData.mrp)}%
                   </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Internal SKU</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-100 font-mono text-base"
                  value={formData.sku}
                  onChange={e => updateField('sku', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Short Catchphrase</label>
                <textarea 
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all bg-slate-50 h-32"
                  value={formData.shortDescription || ''}
                  onChange={e => updateField('shortDescription', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Extra
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Additional Specs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Care Instructions</label>
                <input type="text" className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none bg-slate-50 text-base" 
                  value={formData.extraDetails?.careInstructions || ''}
                  onChange={e => updateExtra('careInstructions', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Warranty Period</label>
                <input type="text" className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none bg-slate-50 text-base" 
                  value={formData.extraDetails?.warranty || ''}
                  onChange={e => updateExtra('warranty', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Physical Dimensions</label>
                <input type="text" className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none bg-slate-50 text-base" 
                  value={formData.extraDetails?.dimensions || ''}
                  onChange={e => updateExtra('dimensions', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Item Mass (Weight)</label>
                <input type="text" className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-indigo-500 outline-none bg-slate-50 text-base" 
                  value={formData.extraDetails?.weight || ''}
                  onChange={e => updateExtra('weight', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5: // Stock
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Inventory Configuration</h3>
              <p className="text-sm text-slate-500">Set quantities and smart alert thresholds.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              <div className="p-6 md:p-8 rounded-[2rem] bg-slate-50 border-2 border-slate-100 shadow-sm space-y-4">
                 <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <Plus size={20} className="bg-indigo-100 p-1 rounded-lg" />
                    <label className="text-xs font-black uppercase tracking-widest">Opening Stock</label>
                 </div>
                 <input 
                  type="number" 
                  className="w-full border-none bg-white shadow-inner rounded-2xl p-4 sm:p-6 text-xl sm:text-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={formData.stockQuantity}
                  onChange={e => updateField('stockQuantity', parseInt(e.target.value))}
                 />
                 <p className="text-xs text-slate-400 font-medium">Initial quantity available for purchase.</p>
              </div>

              <div className="p-6 md:p-8 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 shadow-sm space-y-4">
                 <div className="flex items-center gap-3 text-indigo-700 mb-2">
                    <BellRing size={20} className="bg-indigo-200 p-1 rounded-lg" />
                    <label className="text-xs font-black uppercase tracking-widest">Alert Threshold</label>
                 </div>
                 <input 
                  type="number" 
                  className="w-full border-none bg-white shadow-inner rounded-2xl p-4 sm:p-6 text-xl sm:text-3xl font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={formData.lowStockLimit}
                  onChange={e => updateField('lowStockLimit', parseInt(e.target.value))}
                 />
                 <p className="text-xs text-indigo-400 font-medium">System will notify when stock reaches or drops below this value.</p>
              </div>

              <div className="md:col-span-2 space-y-4">
                 <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100">
                   <input 
                      type="checkbox" 
                      id="active-toggle"
                      checked={formData.isActive}
                      onChange={e => updateField('isActive', e.target.checked)}
                      className="h-6 w-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                    />
                    <label htmlFor="active-toggle" className="cursor-pointer">
                      <p className="font-bold text-slate-800">Publish Immediately</p>
                      <p className="text-xs text-slate-400">If disabled, the product will be hidden from the storefront and sales dashboard.</p>
                    </label>
                 </div>
              </div>
            </div>
          </div>
        );
        
      case 6: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Final Audit</h3>
            <div className="bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 flex flex-col lg:flex-row gap-6 md:gap-8">
              <div className="h-48 w-48 md:h-64 md:w-64 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl shadow-slate-200/50 bg-white shrink-0 mx-auto lg:mx-0">
                 {formData.primaryImage ? <img src={`${IMG_BASE_URL}${formData.primaryImage}`} className="w-full h-full object-contain p-4" /> : <div className="h-full w-full bg-slate-100" />}
              </div>
              <div className="flex-1 space-y-6">
                 <div>
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block ${formData.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                      {formData.isActive ? 'Status: Active' : 'Status: Hidden'}
                   </span>
                   <h4 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">{formData.name}</h4>
                   <div className="flex items-baseline gap-3 mt-2">
                     <span className="text-rose-600 font-bold text-xl sm:text-3xl">-{calculateDiscount(formData.price, formData.mrp)}%</span>
                     <div className="flex flex-col">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">₹{formData.price?.toLocaleString()}</span>
                        <span className="text-xs font-medium text-slate-400 line-through">M.R.P.: ₹{formData.mrp?.toLocaleString()}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
                       <p className="font-black text-slate-700">{formData.stockQuantity} Units</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alert Limit</p>
                       <p className="font-black text-indigo-600">{formData.lowStockLimit} Units</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col h-full sm:h-[95vh] md:h-[90vh] md:max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-5 py-4 md:px-10 md:py-8 border-b flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-lg md:text-2xl font-black tracking-tight">{initialData ? 'Update Product' : 'Configure New Item'}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Step {currentStep + 1} of {STEPS.length}</p>
          </div>
          <button onClick={handleClose} className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white rounded-xl md:rounded-2xl transition-all"><X size={20} /></button>
        </div>

        <div className="px-4 py-3 md:px-10 bg-slate-50 border-b shrink-0">
          {/* Mobile Dot Indicator */}
          <div className="flex sm:hidden justify-between items-center gap-2">
            <div className="flex gap-1.5">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-indigo-600' : 
                    idx < currentStep ? 'w-2 bg-indigo-400' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{STEPS[currentStep]}</span>
          </div>

          {/* Tablet/Desktop Indicator */}
          <div className="hidden sm:flex justify-between items-center w-full relative">
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -z-0 rounded-full"></div>
            {STEPS.map((step, idx) => (
               <div key={idx} className={`flex flex-col items-center gap-2 relative z-10 ${idx <= currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                    idx < currentStep ? 'bg-indigo-600 text-white scale-90' : 
                    idx === currentStep ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-110 ring-8 ring-indigo-600/10' : 'bg-white border-2 border-slate-200 text-slate-300'
                  }`}>
                    {idx < currentStep ? <CheckCircle size={18} strokeWidth={3} /> : idx + 1}
                  </div>
                  <span className="text-[10px] uppercase tracking-tighter font-black hidden sm:block whitespace-nowrap">{step}</span>
               </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 bg-white">
          <div className="max-w-4xl mx-auto">
            {renderStepContent()}
          </div>
        </div>

        <div className="p-4 md:p-10 border-t bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between shrink-0">
          <Button 
            variant="secondary" 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="rounded-2xl px-8 h-12 md:h-14 font-black text-slate-500 uppercase tracking-widest border-2 w-full sm:w-auto order-2 sm:order-1"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={() => onComplete(formData as Product)} className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-12 h-12 md:h-14 font-black shadow-xl shadow-indigo-600/30 w-full sm:w-auto order-1 sm:order-2">
              {initialData ? 'Update Record' : 'Confirm & Publish'} <CheckCircle className="ml-3 h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={!validateStep()} className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-12 h-12 md:h-14 font-black shadow-xl shadow-indigo-600/30 w-full sm:w-auto order-1 sm:order-2">
              Continue <ChevronRight className="ml-3 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};