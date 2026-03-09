import React, { useState } from 'react';
import { DataProvider, useData } from './DataContext';
import { ViewState, Product } from './types';
import { Pagination } from './components/ui/Pagination';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Filter as FilterIcon,
  BarChart3,
  Menu,
  Plus,
  TrendingDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  User,
  Users,
  Settings,
  LogOut,
  BellRing,
  AlertCircle,
  Mail,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Box,
  Package,
  ShoppingCart,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CategoryManager } from './components/CategoryManager';
import { FilterManager } from './components/FilterManager';
import { ProductWizard } from './components/ProductWizard';
import { StockOutManager } from './components/StockOutManager';
import { StockThresholds } from './components/StockThresholds';
import { StockReminders } from './components/StockReminders';
import ContactManager from './components/ContactManager';
import CouponManager from './components/CouponManager';
import { OrderManager } from './components/OrderManager';
import BulkUserManager from './components/BulkUserManager';
import { BulkProductManager } from './components/BulkProductManager';
import { BulkOrderManager } from './components/BulkOrderManager';
import { BaseMasterManager } from './components/BaseMasterManager';
import { BulkMasterProductManager } from './components/BulkMasterProductManager';
import AdminUserManager from './components/AdminUserManager';
import { NotificationDropdown } from './components/NotificationDropdown';
import { Button } from './components/ui/Button';
import { IMG_BASE_URL } from './utils/api';
import { calculateDiscount } from './utils/math';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './components/Login';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const {
    categories,
    filters,
    allFilters,
    products,
    allProducts,
    totalProducts,
    currentPage,
    pageSize,
    stockOutRecords,
    contacts,
    coupons,
    bulkProducts,
    actions
  } = useData();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Calculate reminder count for sidebar badge
  const reminderCount = allProducts.filter(p => p.stockQuantity <= p.lowStockLimit).length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'filters', label: 'Smart Filters', icon: FilterIcon },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'out-stock', label: 'Sales / Out Stock', icon: TrendingDown },
    { id: 'orders', label: 'User Orders', icon: ShoppingBag },
    {
      id: 'bulk-group',
      label: 'Bulk Operations',
      icon: Users,
      children: [
        { id: 'bulk-users', label: 'Bulk Users', icon: Users },
        { id: 'bulk-products', label: 'Bulk Specs', icon: Box },
        { id: 'bulk-orders', label: 'Bulk Orders', icon: Package },
        { id: 'bulk-masters', label: 'Base Master', icon: Layers },
        { id: 'bulk-master-products', label: 'Product Masters', icon: Layers },
      ]
    },
    { id: 'stock-reminders', label: 'Reminders', icon: AlertCircle, badge: reminderCount },
    { id: 'stock-thresholds', label: 'Thresholds', icon: BellRing },
    { id: 'contacts', label: 'Contacts', icon: Mail },
    { id: 'admin-management', label: 'Admin Management', icon: ShieldCheck },
  ];

  const filteredProducts = products;

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setWizardOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setWizardOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-[#1a2e38]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1a2e38]/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1a2e38] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800
        md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-center gap-3">
            <img src="/logo.png" alt="Patel Box" className="h-[100px] rounded-lg object-contain" />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            if (item.children) {
              const isChildActive = item.children.some(child => currentView === child.id);
              const isOpen = isBulkOpen || isChildActive;

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (isChildActive) {
                        setIsBulkOpen(!isOpen);
                      } else {
                        setIsBulkOpen(!isBulkOpen);
                      }
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${isChildActive ? 'text-white' : 'hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <item.icon size={18} strokeWidth={isChildActive ? 2.5 : 2} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="pl-4 space-y-1 ml-4 border-l border-slate-700 animate-in slide-in-from-top-2 duration-200">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => handleNavClick(child.id as ViewState)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative group ${currentView === child.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1'
                            : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                          <child.icon size={14} />
                          <span className="flex-1 text-left">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as ViewState)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group ${currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1'
                  : 'hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <item.icon size={18} strokeWidth={currentView === item.id ? 2.5 : 2} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${currentView === item.id ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-indigo-400">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.emailID || 'Store Manager'}</p>
            </div>
            {/* <button className="text-slate-500 hover:text-white transition-colors">
              <Settings size={18} />
            </button> */}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b h-18 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize leading-tight">
                {currentView.replace('-', ' ')}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">Manage your store operations seamlessly</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentView === 'products' && (
              <Button onClick={handleAddProduct} size="md" className="rounded-xl shadow-md">
                <Plus size={18} className="md:mr-2" />
                <span className="hidden md:inline">Create Product</span>
                <span className="md:hidden">New</span>
              </Button>
            )}
            <div className="h-9 w-px bg-slate-200 mx-1 hidden sm:block" />
            <NotificationDropdown />
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8">
          {currentView === 'dashboard' && <Dashboard products={allProducts} onNavigate={handleNavClick} />}

          {currentView === 'stock-thresholds' && <StockThresholds />}

          {currentView === 'stock-reminders' && <StockReminders />}

          {currentView === 'contacts' && <ContactManager />}

          {currentView === 'coupons' && <CouponManager />}

          {currentView === 'orders' && <OrderManager />}

          {currentView === 'bulk-users' && <BulkUserManager />}

          {currentView === 'bulk-products' && <BulkProductManager />}

          {currentView === 'bulk-orders' && <BulkOrderManager />}

          {currentView === 'bulk-masters' && <BaseMasterManager />}

          {currentView === 'bulk-master-products' && <BulkMasterProductManager />}

          {currentView === 'admin-management' && <AdminUserManager />}

          {currentView === 'categories' && <CategoryManager />}

          {currentView === 'filters' && <FilterManager />}

          {currentView === 'out-stock' && <StockOutManager />}

          {(currentView === 'products' || currentView === 'inventory') && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full md:h-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="p-5 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                <div className="w-full md:w-auto relative group">
                  <input
                    type="text"
                    className="border border-slate-200 rounded-2xl px-5 py-2.5 w-full md:w-80 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
                    placeholder="Search items..."
                    onChange={e => actions.setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>{totalProducts} Total Items</span>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                  <thead className="bg-white text-slate-500 font-bold uppercase text-[10px] tracking-widest sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 border-b">Status</th>
                      <th className="px-6 py-4 border-b">Product Name</th>
                      <th className="px-6 py-4 border-b hidden lg:table-cell">Category</th>
                      <th className="px-6 py-4 border-b">Price & Offers</th>
                      <th className="px-6 py-4 border-b text-center">In Stock</th>
                      <th className="px-6 py-4 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredProducts.map(p => {
                      const main = categories.main.find(c => c.id === p.mainCategoryId)?.name;
                      const sub = categories.sub.find(c => c.id === p.subCategoryId)?.name;
                      const discount = calculateDiscount(p.price, p.mrp);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 group transition-colors">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => actions.toggleProductStatus(p.id)}
                              className={`p-2 rounded-xl transition-all shadow-sm ${p.isActive
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100'
                                : 'text-slate-400 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                                }`}
                            >
                              {p.isActive ? <Eye size={18} strokeWidth={2.5} /> : <EyeOff size={18} strokeWidth={2.5} />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                <img src={`${IMG_BASE_URL}${p.primaryImage}`} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[#1a2e38] truncate max-w-[200px] text-base">{p.name}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{p.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 hidden lg:table-cell">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{main}</span>
                              <span className="text-sm font-medium">{sub}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-start gap-1.5">
                                {discount > 0 && <span className="text-rose-600 font-medium text-2xl">-{discount}%</span>}
                                <div className="flex items-start">
                                  <span className="text-xs font-bold mt-1.5 mr-0.5">₹</span>
                                  <span className="font-bold text-[#1a2e38] text-3xl leading-none">{p.price.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="mt-1">
                                <span className="text-xs font-medium text-slate-500">M.R.P.: <span className="line-through">₹{p.mrp?.toLocaleString()}</span></span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-1.5">
                              {currentView === 'inventory' ? (
                                <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
                                  <button
                                    className="h-7 w-7 flex items-center justify-center bg-white hover:bg-indigo-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all"
                                    onClick={() => actions.updateStock(p.id, Math.max(0, p.stockQuantity - 1))}
                                  >-</button>
                                  <span className="w-10 text-center font-bold text-slate-700">{p.stockQuantity}</span>
                                  <button
                                    className="h-7 w-7 flex items-center justify-center bg-white hover:bg-indigo-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all"
                                    onClick={() => actions.updateStock(p.id, p.stockQuantity + 1)}
                                  >+</button>
                                </div>
                              ) : (
                                <span className="font-bold text-slate-700 text-lg">{p.stockQuantity}</span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${p.stockStatus === 'in_stock' ? 'bg-emerald-100 text-emerald-700' :
                                p.stockStatus === 'low_stock' ? 'bg-amber-100 text-amber-700' :
                                  'bg-rose-100 text-rose-700'
                                }`}>
                                {p.stockStatus.replace('_', ' ').replace('out of', 'Empty')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${p.name}"? This action cannot be undone.`)) {
                                    actions.deleteProduct(p.id);
                                  }
                                }}
                                className="h-10 w-10 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="p-16 text-center text-slate-400 bg-white">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={totalProducts}
                pageSize={pageSize}
                onPageChange={actions.setPage}
                label="products"
              />
            </div>
          )}
        </div>
      </main>

      {/* Product Wizard Overlay */}
      {isWizardOpen && (
        <ProductWizard
          categories={categories}
          filters={allFilters}
          initialData={editingProduct}
          onComplete={(newProduct) => {
            if (editingProduct) {
              actions.updateProduct(editingProduct.id, newProduct);
            } else {
              actions.addProduct(newProduct);
            }
            setWizardOpen(false);
          }}
          onCancel={() => setWizardOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}