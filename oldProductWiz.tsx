// import React, { useState, useEffect } from 'react';
// import { MainCategory, SubCategory, SubSubCategory, Filter, Product } from '../types';
// import { Button } from './ui/Button';
// import { ChevronRight, ChevronLeft, Upload, CheckCircle, AlertCircle, Wand2, Plus, X } from 'lucide-react';
// import { analyzeProductImage, fileToGenerativePart } from '../services/geminiService';

// interface ProductWizardProps {
//   categories: {
//     main: MainCategory[];
//     sub: SubCategory[];
//     subSub: SubSubCategory[];
//   };
//   filters: Filter[];
//   initialData?: Product; // Added for editing mode
//   onComplete: (product: Omit<Product, 'id' | 'lastStockUpdate'>) => void;
//   onCancel: () => void;
// }

// const STEPS = ['Category', 'Filters', 'Media (AI)', 'Details', 'Extra', 'Stock', 'Review'];

// export const ProductWizard: React.FC<ProductWizardProps> = ({ categories, filters, initialData, onComplete, onCancel }) => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   // Form State
//   const [formData, setFormData] = useState<Partial<Product>>({
//     name: '',
//     price: 0,
//     sku: `SKU-${Date.now()}`,
//     stockQuantity: 100,
//     stockStatus: 'in_stock',
//     selectedFilters: {},
//     primaryImage: '',
//     additionalImages: [],
//     isActive: true,
//     extraDetails: { customAttributes: [] }
//   });

//   // Pre-fill form if editing
//   useEffect(() => {
//     if (initialData) {
//       setFormData({ ...initialData });
//     }
//   }, [initialData]);

//   const [aiAnalysis, setAiAnalysis] = useState<{ suggestedName?: string, keywords?: string[] } | null>(null);

//   // Helper getters
//   const selectedMainCatName = categories.main.find(c => c.id === formData.mainCategoryId)?.name || '...';
//   const relevantSubs = categories.sub.filter(s => s.mainCategoryId === formData.mainCategoryId);
//   const relevantSubSubs = categories.subSub.filter(ss => ss.subCategoryId === formData.subCategoryId);
//   const relevantFilters = filters.filter(f => formData.mainCategoryId && f.mappedMainCategoryIds.includes(formData.mainCategoryId));

//   // Handlers
//   const updateField = (field: keyof Product, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const updateExtra = (field: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       extraDetails: { ...prev.extraDetails, [field]: value }
//     }));
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const objectUrl = URL.createObjectURL(file);

//       if (isPrimary) {
//         updateField('primaryImage', objectUrl);
//         // AI Analysis Trigger
//         setIsAnalyzing(true);
//         try {
//           const base64 = await fileToGenerativePart(file);
//           const result = await analyzeProductImage(base64, file.type);

//           if (result) {
//             setFormData(prev => ({
//               ...prev,
//               name: result.productName || prev.name,
//               shortDescription: result.shortDescription || prev.shortDescription,
//               price: result.estimatedPrice || prev.price,
//             }));
//             setAiAnalysis({ suggestedName: result.productName, keywords: result.keywords });
//           }
//         } catch (err) {
//           console.error("AI Error", err);
//         } finally {
//           setIsAnalyzing(false);
//         }
//       } else {
//         const currentImages = formData.additionalImages || [];
//         if (currentImages.length < 5) {
//           updateField('additionalImages', [...currentImages, objectUrl]);
//         }
//       }
//     }
//   };

//   const toggleFilterValue = (filterId: string, valueId: string) => {
//     const currentSelected = formData.selectedFilters?.[filterId] || [];
//     const newSelected = currentSelected.includes(valueId)
//       ? currentSelected.filter(v => v !== valueId)
//       : [...currentSelected, valueId];

//     setFormData(prev => ({
//       ...prev,
//       selectedFilters: { ...prev.selectedFilters, [filterId]: newSelected }
//     }));
//   };

//   const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length - 1));
//   const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

//   const validateStep = () => {
//     switch (currentStep) {
//       case 0: return formData.mainCategoryId && formData.subCategoryId;
//       case 3: return formData.name && formData.price && formData.sku;
//       case 2: return !!formData.primaryImage;
//       default: return true;
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 0: // Categories
//         return (
//           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//             <h3 className="text-lg font-medium">Select Category Hierarchy</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Main Category</label>
//                 <select
//                   className="w-full border rounded p-2"
//                   value={formData.mainCategoryId || ''}
//                   onChange={e => updateField('mainCategoryId', e.target.value)}
//                 >
//                   <option value="">Select Main Category</option>
//                   {categories.main.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Sub Category</label>
//                 <select
//                   className="w-full border rounded p-2"
//                   value={formData.subCategoryId || ''}
//                   onChange={e => updateField('subCategoryId', e.target.value)}
//                   disabled={!formData.mainCategoryId}
//                 >
//                   <option value="">Select Sub Category</option>
//                   {relevantSubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Sub-Sub Category (Optional)</label>
//                 <select
//                   className="w-full border rounded p-2"
//                   value={formData.subSubCategoryId || ''}
//                   onChange={e => updateField('subSubCategoryId', e.target.value)}
//                   disabled={!formData.subCategoryId}
//                 >
//                   <option value="">Select Leaf Category</option>
//                   {relevantSubSubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>
//             </div>
//           </div>
//         );

//       case 1: // Filters
//         return (
//           <div className="space-y-6">
//             <h3 className="text-lg font-medium">Apply Filters for <span className="text-indigo-600">{selectedMainCatName}</span></h3>
//             {relevantFilters.length === 0 ? (
//                <div className="p-4 bg-yellow-50 text-yellow-800 rounded">No specific filters configured for this category. You can skip this step.</div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {relevantFilters.map(filter => (
//                   <div key={filter.id} className="border p-4 rounded-lg bg-slate-50">
//                     <label className="font-semibold block mb-2">{filter.label}</label>
//                     <div className="flex flex-wrap gap-2">
//                       {filter.values.map(val => {
//                         const isSelected = formData.selectedFilters?.[filter.id]?.includes(val.id);
//                         return (
//                           <button
//                             key={val.id}
//                             onClick={() => toggleFilterValue(filter.id, val.id)}
//                             className={`px-3 py-1 rounded text-sm transition-colors ${
//                               isSelected
//                                 ? 'bg-indigo-600 text-white shadow-md'
//                                 : 'bg-white border text-slate-700 hover:bg-indigo-50'
//                             }`}
//                           >
//                             {val.value}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         );

//       case 2: // Media
//         return (
//           <div className="space-y-6">
//             <h3 className="text-lg font-medium flex items-center gap-2">
//               Product Media
//               {isAnalyzing && <span className="text-xs font-normal text-indigo-600 animate-pulse flex items-center gap-1"><Wand2 size={12}/> AI Analyzing...</span>}
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Primary Image */}
//               <div>
//                 <label className="block text-sm font-medium mb-2">Primary Image (Auto-detects details)</label>
//                 <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center h-48 md:h-64 bg-slate-50 hover:bg-slate-100 transition relative overflow-hidden">
//                   {formData.primaryImage ? (
//                      <img src={formData.primaryImage} alt="Primary" className="absolute inset-0 w-full h-full object-contain p-2" />
//                   ) : (
//                     <div className="text-center text-slate-500">
//                       <Upload className="mx-auto h-10 w-10 md:h-12 md:w-12 text-slate-400 mb-2" />
//                       <p>Click to upload main image</p>
//                     </div>
//                   )}
//                   <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, true)} />
//                 </div>
//               </div>

//               {/* Additional Images */}
//               <div>
//                 <label className="block text-sm font-medium mb-2">Gallery (Max 5)</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {formData.additionalImages?.map((img, idx) => (
//                     <div key={idx} className="aspect-square border rounded overflow-hidden relative group">
//                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
//                        <button
//                         className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                         onClick={() => updateField('additionalImages', formData.additionalImages?.filter((_, i) => i !== idx))}
//                        >
//                          <X size={10} />
//                        </button>
//                     </div>
//                   ))}
//                   {(formData.additionalImages?.length || 0) < 5 && (
//                     <div className="aspect-square border-2 border-dashed border-slate-300 rounded flex items-center justify-center hover:bg-slate-50 relative cursor-pointer">
//                       <Plus className="text-slate-400" />
//                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, false)} />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 3: // Details
//         return (
//           <div className="space-y-6">
//             <h3 className="text-lg font-medium">Core Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium mb-1">Product Name</label>
//                 <input
//                   type="text"
//                   className="w-full border rounded p-2"
//                   value={formData.name}
//                   onChange={e => updateField('name', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Price ($)</label>
//                 <input
//                   type="number"
//                   className="w-full border rounded p-2"
//                   value={formData.price}
//                   onChange={e => updateField('price', parseFloat(e.target.value))}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">SKU</label>
//                 <input
//                   type="text"
//                   className="w-full border rounded p-2 bg-slate-50"
//                   value={formData.sku}
//                   onChange={e => updateField('sku', e.target.value)}
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium mb-1">Short Description</label>
//                 <textarea
//                   className="w-full border rounded p-2 h-20"
//                   value={formData.shortDescription || ''}
//                   onChange={e => updateField('shortDescription', e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 4: // Extra
//         return (
//           <div className="space-y-6">
//             <h3 className="text-lg font-medium">Extra Specification</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Care Instructions</label>
//                 <input type="text" className="w-full border rounded p-2"
//                   value={formData.extraDetails?.careInstructions || ''}
//                   onChange={e => updateExtra('careInstructions', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Warranty</label>
//                 <input type="text" className="w-full border rounded p-2"
//                   value={formData.extraDetails?.warranty || ''}
//                   onChange={e => updateExtra('warranty', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Dimensions</label>
//                 <input type="text" className="w-full border rounded p-2"
//                   value={formData.extraDetails?.dimensions || ''}
//                   onChange={e => updateExtra('dimensions', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Weight</label>
//                 <input type="text" className="w-full border rounded p-2"
//                   value={formData.extraDetails?.weight || ''}
//                   onChange={e => updateExtra('weight', e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 5: // Stock
//         return (
//           <div className="space-y-6">
//             <h3 className="text-lg font-medium">Inventory Setup</h3>
//             <div className="bg-slate-50 p-6 rounded-lg border">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                    <label className="block text-sm font-medium mb-1">Stock Quantity</label>
//                    <input
//                     type="number"
//                     className="w-full border rounded p-2 text-lg font-mono"
//                     value={formData.stockQuantity}
//                     onChange={e => updateField('stockQuantity', parseInt(e.target.value))}
//                    />
//                 </div>
//                 <div>
//                    <label className="block text-sm font-medium mb-1">Stock Status</label>
//                    <select
//                      className="w-full border rounded p-2"
//                      value={formData.stockStatus}
//                      onChange={e => updateField('stockStatus', e.target.value)}
//                    >
//                      <option value="in_stock">In Stock</option>
//                      <option value="low_stock">Low Stock</option>
//                      <option value="out_of_stock">Out of Stock</option>
//                    </select>
//                 </div>
//                 <div className="md:col-span-2">
//                    <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={formData.isActive}
//                         onChange={e => updateField('isActive', e.target.checked)}
//                         className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
//                       />
//                       <span className="text-sm font-medium text-slate-700">Set as Active Product (Visible in Sales)</span>
//                    </label>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 6: // Review
//         return (
//           <div className="space-y-6">
//             <h3 className="text-lg font-medium">Review Product</h3>
//             <div className="bg-slate-50 rounded-lg p-4 md:p-6 border space-y-4">
//               <div className="flex gap-4">
//                  {formData.primaryImage && <img src={formData.primaryImage} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded bg-white border" />}
//                  <div>
//                    <h4 className="font-bold text-lg">{formData.name}</h4>
//                    <p className="text-slate-600">${formData.price}</p>
//                    <p className="text-xs text-slate-500">SKU: {formData.sku}</p>
//                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
//                       {formData.isActive ? 'Active' : 'Inactive'}
//                    </span>
//                  </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-slate-500 block">Category</span>
//                   {selectedMainCatName} / {categories.sub.find(s => s.id === formData.subCategoryId)?.name}
//                 </div>
//                 <div>
//                   <span className="text-slate-500 block">Stock</span>
//                   {formData.stockQuantity} units ({formData.stockStatus})
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default: return null;
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60">
//       <div className="bg-white w-full md:rounded-xl shadow-lg flex flex-col h-full md:h-[90vh] md:max-w-4xl overflow-hidden">
//         {/* Header */}
//         <div className="px-4 py-3 md:px-6 md:py-4 border-b flex justify-between items-center bg-slate-900 text-white shrink-0">
//           <h2 className="text-lg md:text-xl font-bold">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
//           <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
//         </div>

//         {/* Progress Bar */}
//         <div className="px-2 py-3 md:px-6 md:py-4 bg-slate-50 border-b overflow-x-auto shrink-0">
//           <div className="flex justify-between relative min-w-[300px]">
//             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
//             {STEPS.map((step, idx) => (
//                <div key={idx} className={`flex flex-col items-center gap-1 bg-slate-50 px-2 ${idx <= currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>
//                   <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-colors ${
//                     idx < currentStep ? 'bg-indigo-600 text-white' :
//                     idx === currentStep ? 'bg-indigo-600 text-white ring-2 md:ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'
//                   }`}>
//                     {idx < currentStep ? <CheckCircle size={12}/> : idx + 1}
//                   </div>
//                   <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold hidden sm:block">{step}</span>
//                </div>
//             ))}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-4 md:p-8">
//           <div className="max-w-3xl mx-auto">
//             {renderStepContent()}
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="p-4 md:p-6 border-t bg-slate-50 flex justify-between shrink-0">
//           <Button
//             variant="secondary"
//             onClick={prevStep}
//             disabled={currentStep === 0}
//           >
//             <ChevronLeft className="mr-2 h-4 w-4" /> Back
//           </Button>

//           {currentStep === STEPS.length - 1 ? (
//             <Button onClick={() => onComplete(formData as Product)} className="bg-green-600 hover:bg-green-700">
//               {initialData ? 'Update' : 'Submit'} <span className="hidden sm:inline ml-1">Product</span> <CheckCircle className="ml-2 h-4 w-4" />
//             </Button>
//           ) : (
//             <Button onClick={nextStep} disabled={!validateStep()}>
//               Next <span className="hidden sm:inline ml-1">Step</span> <ChevronRight className="ml-2 h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };