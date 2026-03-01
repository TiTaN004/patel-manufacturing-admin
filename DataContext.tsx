import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MainCategory, SubCategory, SubSubCategory, Filter, Product, StockOutRecord, PaymentType, Contact, Coupon, UserOrder, UserOrderItem, CouponValidationResponse, BulkUser, BulkProduct, BulkOrder, BulkBaseMaster, BulkMasterProduct, Notification } from './types';
import { productAPI, categoriesAPI, filterAPI, orderAPI, contactsAPI, couponAPI, userOrderAPI, userAPI, authAPI, bulkProductAPI, bulkOrderAPI, bulkMasterAPI, bulkMasterProductAPI, notificationAPI } from './utils/api';

interface DataContextType {
  categories: {
    main: MainCategory[];
    sub: SubCategory[];
    subSub: SubSubCategory[];
  };
  allMainCategories: MainCategory[];
  filters: Filter[];
  allFilters: Filter[];
  products: Product[];
  allProducts: Product[];
  orders: UserOrder[];
  totalProducts: number;
  totalCategories: number;
  totalFilters: number;
  totalOrders: number;
  totalContacts: number;
  totalCoupons: number;
  totalBulkOrders: number;
  currentPage: number;
  categoryPage: number;
  filterPage: number;
  thresholdPage: number;
  reminderPage: number;
  orderPage: number;
  contactPage: number;
  couponPage: number;
  bulkOrderPage: number;
  pageSize: number;
  searchTerm: string;
  loading: boolean;
  stockOutRecords: StockOutRecord[];
  contacts: Contact[];
  coupons: Coupon[];
  userTypeFilter: 'both' | 'retail' | 'bulk';
  bulkUsers: BulkUser[];
  bulkProducts: BulkProduct[];
  bulkOrders: BulkOrder[];
  bulkMasters: BulkBaseMaster[];
  bulkMasterProducts: BulkMasterProduct[];
  notifications: Notification[];
  totalNotifications: number;
  actions: {
    setPage: (page: number) => void;
    setCategoryPage: (page: number) => void;
    setFilterPage: (page: number) => void;
    setThresholdPage: (page: number) => void;
    setReminderPage: (page: number) => void;
    setOrderPage: (page: number) => void;
    setContactPage: (page: number) => void;
    setCouponPage: (page: number) => void;
    setBulkOrderPage: (page: number) => void;
    setSearch: (query: string) => void;
    bulkUpdateUsers: (users: any[]) => Promise<void>;
    addMainCat: (name: string) => Promise<void>;
    deleteMainCat: (id: string) => Promise<void>;
    addSubCat: (mainId: string, name: string) => Promise<void>;
    deleteSubCat: (id: string) => Promise<void>;
    addSubSubCat: (subId: string, name: string) => Promise<void>;
    deleteSubSubCat: (id: string) => Promise<void>;
    addFilter: (f: Omit<Filter, 'id'>) => Promise<void>;
    updateFilter: (id: string, f: Partial<Filter>) => Promise<void>;
    deleteFilter: (id: string) => Promise<void>;
    addProduct: (p: Omit<Product, 'id' | 'lastStockUpdate'>) => Promise<void>;
    updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateStock: (id: string, qty: number) => Promise<void>;
    updateStockLimit: (id: string, limit: number) => Promise<void>;
    toggleProductStatus: (id: string) => Promise<void>;

    // Stock Out Actions
    addStockOut: (record: { items: any[], customerName: string, customerMobile: string, customerEmail?: string, customerAddress: string, paymentType: PaymentType, billNumber: string, billImage?: string, additionalBillImage?: string, totalAmount: number }) => Promise<void>;
    updateStockOutRecord: (id: string, updates: Partial<StockOutRecord>) => Promise<void>;
    deleteStockOutRecord: (id: string) => Promise<void>;

    // Contact Actions
    deleteContact: (id: string) => Promise<void>;

    // Coupon Actions
    addCoupon: (c: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => Promise<void>;
    updateCoupon: (id: string, c: Partial<Coupon>) => Promise<void>;
    deleteCoupon: (id: string) => Promise<void>;
    validateCoupon: (code: string, amount: number) => Promise<CouponValidationResponse>;
    uploadCategoryImg: (id: string, file: File) => Promise<void>;
    deleteCategoryImg: (id: string) => Promise<void>;
    deleteUserOrder: (id: string) => Promise<void>;
    upsertBulkOutstanding: (userID: string, amount: number) => Promise<void>;
    assignProductsToBulkUser: (userID: string, productIDs: string[]) => Promise<void>;
    setUserTypeFilter: (filter: 'both' | 'retail' | 'bulk') => void;
    createBulkUser: (userData: any) => Promise<void>;
    fetchBulkProducts: (userID: number) => Promise<void>;
    addBulkProduct: (data: any) => Promise<void>;
    updateBulkProduct: (id: number, data: any) => Promise<void>;
    deleteBulkProduct: (id: number, userID: number) => Promise<void>;
    fetchBulkMasters: () => Promise<void>;
    addBulkMaster: (data: any) => Promise<void>;
    deleteBulkMaster: (id: number) => Promise<void>;
    updateBulkOrderStatus: (id: number, status: string) => Promise<void>;
    addBulkMasterProduct: (data: any) => Promise<void>;
    updateBulkMasterProduct: (id: number, data: any) => Promise<void>;
    deleteBulkMasterProduct: (id: number) => Promise<void>;
    bulkAssignMasterProducts: (userID: number, masterProductIds: number[]) => Promise<void>;
    markNotificationAsRead: (id: number) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    deleteAllNotifications: () => Promise<void>;
    fetchData: () => Promise<void>;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mainCats, setMainCats] = useState<MainCategory[]>([]);
  const [subCats, setSubCats] = useState<SubCategory[]>([]);
  const [subSubCats, setSubSubCats] = useState<SubSubCategory[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [allFilters, setAllFilters] = useState<Filter[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [stockOutRecords, setStockOutRecords] = useState<StockOutRecord[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [allMainCats, setAllMainCats] = useState<MainCategory[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [bulkUsers, setBulkUsers] = useState<BulkUser[]>([]);
  const [bulkProducts, setBulkProducts] = useState<BulkProduct[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [bulkMasters, setBulkMasters] = useState<BulkBaseMaster[]>([]);
  const [bulkMasterProducts, setBulkMasterProducts] = useState<BulkMasterProduct[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Pagination States
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalFilters, setTotalFilters] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [totalBulkOrders, setTotalBulkOrders] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [filterPage, setFilterPage] = useState(1);
  const [thresholdPage, setThresholdPage] = useState(1);
  const [reminderPage, setReminderPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [bulkOrderPage, setBulkOrderPage] = useState(1);

  const [pageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'both' | 'retail' | 'bulk'>('both');
  const [loading, setLoading] = useState(false);

  const getStatus = useCallback((qty: number, threshold: number = 10): 'out_of_stock' | 'in_stock' | 'backorder' | 'low_stock' => {
    if (qty === 0) return 'out_of_stock';
    if (qty <= threshold) return 'low_stock';
    return 'in_stock';
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        productAPI.getAll({ limit: pageSize, offset: (currentPage - 1) * pageSize, search: searchTerm }),
        categoriesAPI.getAll({ limit: pageSize, offset: (categoryPage - 1) * pageSize, search: searchTerm }),
        filterAPI.getAll({ limit: pageSize, offset: (filterPage - 1) * pageSize, search: searchTerm }),
        orderAPI.getAll({ limit: pageSize, offset: (orderPage - 1) * pageSize, search: searchTerm }),
        contactsAPI.getAll({ limit: pageSize, offset: (contactPage - 1) * pageSize, search: searchTerm }),
        couponAPI.getAll({ limit: pageSize, offset: (couponPage - 1) * pageSize, search: searchTerm }),
        categoriesAPI.getAll(), // Fetch all for mapping
        productAPI.getAll({ limit: 2000 }), // Fetch all for stats
        filterAPI.getAll(), // Fetch all for wizards
        userOrderAPI.getAll({ limit: pageSize, offset: (orderPage - 1) * pageSize, search: searchTerm, user_type: userTypeFilter }),
        userAPI.getBulkUsers(),
        bulkOrderAPI.getAll({ limit: pageSize, offset: (bulkOrderPage - 1) * pageSize }),
        bulkMasterAPI.getAll(),
        bulkMasterProductAPI.getAll(),
        notificationAPI.getAll({ limit: 10 })
      ]);

      const [
        resProducts, resCats, resFilters, resOrders, resContacts, resCoupons,
        resAllCats, resAllProducts, resAllFilters, resUserOrders, resBulkUsers,
        resBulkOrders, resBulkMasters, resBulkMasterProducts, resNotifications
      ] = responses;

      const categoryMap = new Map<string, any>();
      const allCats: any[] = [];

      // Process Categories first to use for product mapping
      if (resAllCats.data.statusCode === 200) {
        const all = resAllCats.data.data || resAllCats.data.categories || [];
        setAllMainCats(all.filter((c: any) => c.level === 0).map((c: any) => ({
          id: String(c.id),
          name: c.name,
          status: c.is_active ? 'active' : 'inactive',
          imageUrl: c.img_url || undefined
        })));

        all.forEach((c: any) => {
          const cat = { ...c, id: String(c.id), parent_id: c.parent_id ? String(c.parent_id) : null };
          allCats.push(cat);
          categoryMap.set(cat.id, cat);
        });
      }

      const mapProductData = (p: any): Product => {
        let mainId = '';
        let subId = '';
        let subSubId = '';

        // Derive hierarchy from category_id or category object
        const catId = p.category_id || (p.category && p.category.id);
        if (catId) {
          const path: string[] = [];
          let currentId = String(catId);
          while (currentId) {
            const cat = categoryMap.get(currentId);
            if (!cat) break;
            path.unshift(String(cat.id));
            currentId = cat.parent_id ? String(cat.parent_id) : '';
          }

          path.forEach(id => {
            const cat = categoryMap.get(id);
            if (cat) {
              const level = parseInt(cat.level || 0);
              if (level === 0) mainId = id;
              else if (level === 1) subId = id;
              else if (level === 2) subSubId = id;
            }
          });
        }

        return {
          id: String(p.product_id || p.id),
          name: p.name || '',
          slug: p.slug || '',
          sku: p.sku || '',
          price: typeof p.selling_price === 'string' ? parseFloat(p.selling_price) : (p.selling_price || 0),
          mrp: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || p.selling_price || 0),
          stockQuantity: parseInt(p.stock_quantity || 0),
          lowStockLimit: parseInt(p.stock_threshold || p.lowStockLimit || 10),
          stockStatus: p.stock_status || getStatus(parseInt(p.stock_quantity || 0), parseInt(p.stock_threshold || p.lowStockLimit || 10)),
          shortDescription: p.description ? p.description.substring(0, 100) : '',
          description: p.description || '',
          status: p.status || 'draft',
          isActive: p.status === 'active',
          mainCategoryId: mainId,
          subCategoryId: subId,
          subSubCategoryId: subSubId,
          primaryImage: p.primary_image || '',
          additionalImages: Array.isArray(p.images) ? p.images : [],
          selectedFilters: Array.isArray(p.filters) ? p.filters.reduce((acc: any, f: any) => {
            acc[String(f.filter_id)] = Array.isArray(f.values) ? f.values.map((v: any) => String(v.value_id)) : [];
            return acc;
          }, {}) : (typeof p.filters === 'string' ? JSON.parse(p.filters) : (p.filters || {})),
          longDescription: p.description || '',
          extraDetails: {
            careInstructions: p.care_instructions || '',
            warranty: p.warrenty_period || p.warranty || '',
            dimensions: p.dimension || '',
            weight: p.weight || ''
          },
          lastStockUpdate: p.created_at || new Date().toISOString()
        };
      };

      if (resAllProducts.data.statusCode === 200) {
        const fullList = resAllProducts.data.data || [];
        setAllProducts(fullList.map(mapProductData));
      }

      if (resCats.data.statusCode === 200) {
        setTotalCategories(resCats.data.total || resCats.data.count || 0);
        setMainCats(allCats.filter(c => c.level === 0).map(c => ({
          id: c.id,
          name: c.name,
          status: c.is_active ? 'active' : 'inactive',
          imageUrl: c.img_url || undefined
        })));

        setSubCats(allCats.filter(c => c.level === 1).map(c => ({
          id: c.id,
          mainCategoryId: c.parent_id,
          name: c.name
        })));

        setSubSubCats(allCats.filter(c => c.level === 2).map(c => ({
          id: c.id,
          subCategoryId: c.parent_id,
          name: c.name
        })));
      }

      if (resUserOrders.data.statusCode === 200) {
        setTotalOrders(resUserOrders.data.data?.pagination?.total || resUserOrders.data.total || 0);
        const ordersData = resUserOrders.data.data?.orders || resUserOrders.data.data || [];
        setOrders(ordersData.map((o: any) => ({
          id: String(o.id),
          invoiceNumber: o.invoice_number || '',
          customerId: String(o.customer_id || ''),
          totalAmount: typeof o.total_amount === 'string' ? parseFloat(o.total_amount) : (o.total_amount || 0),
          paymentMode: o.payment_mode || '',
          paymentStatus: o.payment_status || '',
          orderStatus: o.order_status || '',
          createdAt: o.created_at || '',
          customerName: o.customer_name || '',
          customerAddress: o.customer_address || o.address || '',
          customerMobile: o.customer_phone || o.mobile || '',
          customerEmail: o.customer_email || '',
          items: Array.isArray(o.items) ? o.items.map((item: any) => ({
            id: String(item.id),
            orderId: String(item.order_id),
            productId: String(item.product_id),
            productName: item.product_name || '',
            unitPrice: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : (item.unit_price || 0),
            quantity: parseInt(item.quantity || 0),
            totalPrice: typeof item.total_price === 'string' ? parseFloat(item.total_price) : (item.total_price || 0),
            selectedFilters: item.selected_filters,
            sku: item.sku || '',
            primaryImage: item.primary_image || ''
          })) : [],
          couponCode: o.coupon_code || null,
          discountAmount: typeof o.discount_amount === 'string' ? parseFloat(o.discount_amount) : (o.discount_amount || 0),
          shippingFee: typeof o.shipping_fee === 'string' ? parseFloat(o.shipping_fee) : (o.shipping_fee || 0),
          subtotal: typeof o.subtotal === 'string' ? parseFloat(o.subtotal) : (o.subtotal || 0)
        })));
      }

      if (resFilters.data.statusCode === 200) {
        setTotalFilters(resFilters.data.total || resFilters.data.count || 0);
        const filtersData = resFilters.data.data || resFilters.data.filters || [];
        setFilters(filtersData.map((f: any) => ({
          id: String(f.id),
          code: f.code || '',
          label: f.name || f.label,
          values: Array.isArray(f.values) ? f.values.map((v: any) => ({ id: String(v.id), value: v.value })) : [],
          mappedMainCategoryIds: Array.isArray(f.categoryIds) ? f.categoryIds.map(String) : [],
          isActive: Boolean(f.is_active)
        })));
      }

      if (resAllFilters.data.statusCode === 200) {
        const fullFilters = resAllFilters.data.data || resAllFilters.data.filters || [];
        setAllFilters(fullFilters.map((f: any) => ({
          id: String(f.id),
          code: f.code || '',
          label: f.name || f.label,
          values: Array.isArray(f.values) ? f.values.map((v: any) => ({ id: String(v.id), value: v.value })) : [],
          mappedMainCategoryIds: Array.isArray(f.categoryIds) ? f.categoryIds.map(String) : [],
          isActive: Boolean(f.is_active)
        })));
      }

      if (resProducts.data.statusCode === 200) {
        setTotalProducts(resProducts.data.total || resProducts.data.count || 0);
        const productsList = resProducts.data.data || resProducts.data.products || [];
        setProducts(productsList.map(mapProductData));
      }

      if (resOrders.data.statusCode === 200) {
        const ordersList = resOrders.data.data || resOrders.data.orders || [];
        setStockOutRecords(ordersList.map((o: any) => ({
          id: String(o.id),
          billNumber: o.invoice_number,
          billImage: o.invoice_url,
          additionalBillImage: o.additional_invoice_url,
          totalAmount: parseFloat(o.total_amount),
          paymentType: o.payment_mode,
          customerName: o.customer_name,
          customerMobile: o.customer_mobile,
          customerEmail: o.customer_email,
          customerAddress: o.customer_address,
          customerDetails: `${o.customer_mobile || ''} ${o.customer_address || ''}`,
          date: o.created_at,
          items: Array.isArray(o.items) ? o.items.map((i: any) => ({
            productId: String(i.product_id),
            productName: i.product_name,
            sku: i.sku || '',
            unitPrice: parseFloat(i.unit_price),
            quantity: parseInt(i.quantity || 0),
            totalPrice: parseFloat(i.total_price || (parseFloat(i.unit_price) * parseInt(i.quantity)).toString()),
            primaryImage: i.primary_image
          })) : [],
          couponCode: o.coupon_code || null,
          discountAmount: typeof o.discount_amount === 'string' ? parseFloat(o.discount_amount) : (o.discount_amount || 0),
          shippingFee: typeof o.shipping_fee === 'string' ? parseFloat(o.shipping_fee) : (o.shipping_fee || 0),
          subtotal: typeof o.subtotal === 'string' ? parseFloat(o.subtotal) : (o.subtotal || 0)
        })));
      }

      if (resContacts.data.statusCode === 200) {
        setTotalContacts(resContacts.data.total || resContacts.data.count || 0);
        const contactsList = resContacts.data.data || resContacts.data.contacts || [];
        setContacts(contactsList.map((c: any) => ({
          id: String(c.id),
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          mobile: c.mobile,
          subject: c.subject,
          message: c.message,
          createdAt: c.created_at
        })));
      }

      if (resCoupons.data.statusCode === 200 && (resCoupons.data.data || resCoupons.data.coupons)) {
        setTotalCoupons(resCoupons.data.total || resCoupons.data.count || 0);
        const couponsList = resCoupons.data.data || resCoupons.data.coupons || [];
        setCoupons(couponsList.map((c: any) => ({
          id: String(c.id),
          code: c.code,
          discountType: c.discount_type,
          discountValue: Number(c.discount_value),
          minCartAmount: Number(c.min_cart_amount),
          maxDiscountAmount: c.max_discount_amount ? Number(c.max_discount_amount) : undefined,
          usageLimit: c.usage_limit ? Number(c.usage_limit) : null,
          usedCount: Number(c.used_count || 0),
          startDate: c.start_date,
          endDate: c.end_date,
          isActive: Boolean(Number(c.is_active)),
          showInPromo: Boolean(Number(c.show_in_promo)),
          comingSoon: Boolean(Number(c.coming_soon)),
          createdAt: c.created_at
        })));
      }

      if (resBulkUsers.data.statusCode === 200) {
        setBulkUsers(resBulkUsers.data.data || []);
      }

      if (resBulkOrders.data.statusCode === 200) {
        setBulkOrders(resBulkOrders.data.data?.orders || resBulkOrders.data.data || []);
        setTotalBulkOrders(resBulkOrders.data.data?.pagination?.total || resBulkOrders.data.total || 0);
      }

      if (resBulkMasters.data.statusCode === 200) {
        setBulkMasters(resBulkMasters.data.data || []);
      }

      if (resBulkMasterProducts.data.statusCode === 200) {
        setBulkMasterProducts(resBulkMasterProducts.data.data || []);
      }

      if (resNotifications.data.statusCode === 200) {
        setNotifications(resNotifications.data.data || []);
        setTotalNotifications(resNotifications.data.total || 0);
      }
    } catch (error) {
      console.error("Data fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, categoryPage, filterPage, orderPage, contactPage, couponPage, searchTerm, pageSize, getStatus, userTypeFilter, bulkOrderPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const actions: DataContextType['actions'] = useMemo(() => ({
    addMainCat: async (name: string) => {
      try {
        await categoriesAPI.create({ name, level: 0 });
        await fetchData();
      } catch (e) { console.error(e); }
    },
    deleteMainCat: async (id: string) => {
      try {
        await categoriesAPI.delete(id);
        await fetchData();
      } catch (e) { console.error(e); }
    },
    addSubCat: async (mainId: string, name: string) => {
      try {
        await categoriesAPI.create({ name, level: 1, parent_id: mainId });
        await fetchData();
      } catch (e) { console.error(e); }
    },
    deleteSubCat: async (id: string) => {
      try {
        await categoriesAPI.delete(id);
        await fetchData();
      } catch (e) { console.error(e); }
    },
    addSubSubCat: async (subId: string, name: string) => {
      try {
        await categoriesAPI.create({ name, level: 2, parent_id: subId });
        await fetchData();
      } catch (e) { console.error(e); }
    },
    deleteSubSubCat: async (id: string) => {
      try {
        await categoriesAPI.delete(id);
        await fetchData();
      } catch (e) { console.error(e); }
    },
    addFilter: async (f: Omit<Filter, 'id'>) => {
      try {
        await filterAPI.create({
          name: f.label,
          code: f.code,
          values: f.values.map(v => v.value),
          categoryIds: f.mappedMainCategoryIds
        });
        await fetchData();
      } catch (e) { console.error(e); }
    },
    updateFilter: async (id: string, f: Partial<Filter>) => {
      try {
        const payload: any = {};
        if (f.label) payload.name = f.label;
        if (f.code) payload.code = f.code;
        if (f.values) payload.values = f.values.map(v => v.value);
        if (f.mappedMainCategoryIds) payload.categoryIds = f.mappedMainCategoryIds;

        await filterAPI.update(id, payload);
        await fetchData();
      } catch (e) { console.error(e); }
    },
    deleteFilter: async (id: string) => {
      try {
        await filterAPI.delete(id);
        await fetchData();
      } catch (e) { console.error(e); }
    },
    addProduct: async (p: Omit<Product, 'id' | 'lastStockUpdate'>) => {
      try {
        const categoryId = p.subSubCategoryId || p.subCategoryId || p.mainCategoryId;
        const filtersPayload = Object.entries(p.selectedFilters).map(([filterId, valueIds]) => ({
          filter_id: filterId,
          value_ids: valueIds
        }));

        const payload = {
          category_id: categoryId,
          sku: p.sku,
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          selling_price: p.price,
          price: p.mrp,
          status: p.status || 'draft',
          stock_quantity: p.stockQuantity,
          stock_threshold: p.lowStockLimit,
          stock_status: p.stockStatus,
          description: p.longDescription || p.shortDescription || p.description || '',
          primary_image: p.primaryImage,
          images: p.additionalImages,
          care_instructions: p.extraDetails?.careInstructions || '',
          warrenty_period: p.extraDetails?.warranty || '',
          dimension: p.extraDetails?.dimensions || '',
          weight: p.extraDetails?.weight || '',
          filters: filtersPayload
        };

        await productAPI.create(payload);
        await fetchData();
      } catch (error) {
        console.error("Failed to create product", error);
        alert("Failed to create product");
      }
    },
    updateProduct: async (id: string, updates: Partial<Product>) => {
      try {
        // Correctly determine which category ID to send
        // If it's a new sub-sub, use it. If not, use sub. If not, use main.
        // Importantly, if we are in the wizard, we know which ones are selected.
        const categoryId = updates.subSubCategoryId || updates.subCategoryId || updates.mainCategoryId;

        const payload: any = {};
        if (categoryId) payload.category_id = categoryId;

        if (updates.sku !== undefined) payload.sku = updates.sku;
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;

        if (updates.price !== undefined) payload.selling_price = updates.price;
        if (updates.mrp !== undefined) payload.price = updates.mrp;

        // Prioritize isActive toggle over raw status if both present
        if (updates.isActive !== undefined) {
          payload.status = updates.isActive ? 'active' : 'inactive';
        } else if (updates.status !== undefined) {
          payload.status = updates.status;
        }

        if (updates.stockQuantity !== undefined) {
          payload.stock_quantity = updates.stockQuantity;
          const product = products.find(p => p.id === id);
          const threshold = updates.lowStockLimit || product?.lowStockLimit || 10;
          payload.stock_status = getStatus(updates.stockQuantity, threshold);
        }
        if (updates.lowStockLimit !== undefined) {
          payload.stock_threshold = updates.lowStockLimit;
        }

        // Prioritize shortDescription/longDescription if they were edited
        // In the wizard, shortDescription is the primary field
        if (updates.shortDescription !== undefined || updates.longDescription !== undefined || updates.description !== undefined) {
          payload.description = updates.shortDescription || updates.longDescription || updates.description || '';
        }

        if (updates.primaryImage !== undefined) payload.primary_image = updates.primaryImage;
        if (updates.additionalImages !== undefined) payload.images = updates.additionalImages;

        if (updates.selectedFilters) {
          payload.filters = Object.entries(updates.selectedFilters).map(([filterId, valueIds]) => ({
            filter_id: filterId,
            value_ids: valueIds
          }));
        }

        if (updates.extraDetails) {
          payload.care_instructions = updates.extraDetails.careInstructions || '';
          payload.warrenty_period = updates.extraDetails.warranty || '';
          payload.dimension = updates.extraDetails.dimensions || '';
          payload.weight = updates.extraDetails.weight || '';
        }

        await productAPI.update(id, payload);
        await fetchData();
      } catch (error) {
        console.error("Failed to update product", error);
        alert("Failed to update product");
      }
    },
    deleteProduct: async (id: string) => {
      try {
        await productAPI.delete(id);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product");
      }
    },
    updateStock: async (id: string, qty: number) => {
      try {
        const product = products.find(p => p.id === id);
        const threshold = product?.lowStockLimit || 10;
        const status = getStatus(qty, threshold);
        await productAPI.update(id, { stock_quantity: qty, stock_status: status });

        // Optimistic update
        const updateFn = (p: Product): Product => {
          if (p.id === id) {
            return { ...p, stockQuantity: qty, stockStatus: status, lastStockUpdate: new Date().toISOString() };
          }
          return p;
        };
        setProducts(prev => prev.map(updateFn));
        setAllProducts(prev => prev.map(updateFn));
      } catch (error) {
        console.error("Failed to update stock", error);
        fetchData(); // Revert on error
      }
    },
    uploadCategoryImg: async (id: string, file: File) => {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await categoriesAPI.uploadImage(id, formData);
        if (res.data.success) {
          const imgUrl = res.data.url;
          setMainCats(prev => prev.map(c => c.id === id ? { ...c, imageUrl: imgUrl } : c));
          setAllMainCats(prev => prev.map(c => c.id === id ? { ...c, imageUrl: imgUrl } : c));
        }
      } catch (error) {
        console.error("Failed to upload category image", error);
      }
    },
    deleteCategoryImg: async (id: string) => {
      try {
        const res = await categoriesAPI.deleteImage(id);
        if (res.data.success) {
          setMainCats(prev => prev.map(c => c.id === id ? { ...c, imageUrl: undefined } : c));
          setAllMainCats(prev => prev.map(c => c.id === id ? { ...c, imageUrl: undefined } : c));
        }
      } catch (error) {
        console.error("Failed to delete category image", error);
      }
    },
    toggleProductStatus: async (id: string) => {
      const product = products.find(p => p.id === id);
      if (!product) return;
      try {
        const newStatus = !product.isActive;
        await productAPI.update(id, { status: newStatus ? 'active' : 'inactive' });

        const updateFn = (p: Product): Product => p.id === id ? { ...p, isActive: newStatus, status: (newStatus ? 'active' : 'inactive') as 'active' | 'inactive' | 'draft' } : p;
        setProducts(prev => prev.map(updateFn));
        setAllProducts(prev => prev.map(updateFn));
      } catch (error) {
        console.error("Failed to toggle status", error);
      }
    },
    updateStockLimit: async (id: string, limit: number) => {
      try {
        await productAPI.update(id, { stock_threshold: limit });
        const updateFn = (p: Product) => p.id === id ? { ...p, lowStockLimit: limit } : p;
        setProducts(prev => prev.map(updateFn));
        setAllProducts(prev => prev.map(updateFn));
      } catch (error) {
        console.error("Failed to update stock limit", error);
      }
    },
    addStockOut: async (record: { items: any[], customerName: string, customerMobile: string, customerEmail?: string, customerAddress: string, paymentType: PaymentType, billNumber: string, billImage?: string, additionalBillImage?: string, totalAmount: number, couponCode?: string, discountAmount?: number, shippingFee?: number, subtotal?: number }) => {
      try {
        const payload = {
          invoice_number: record.billNumber,
          invoice_url: record.billImage,
          additional_invoice_url: record.additionalBillImage,
          total_amount: record.totalAmount,
          payment_mode: record.paymentType,
          customer_name: record.customerName,
          customer_mobile: record.customerMobile,
          customer_email: record.customerEmail,
          customer_address: record.customerAddress,
          coupon_code: record.couponCode,
          discount_amount: record.discountAmount,
          shipping_fee: record.shippingFee,
          subtotal: record.subtotal,
          items: record.items.map(item => ({
            product_id: item.productId,
            product_name: item.productName,
            unit_price: item.unitPrice,
            quantity: item.quantity
          }))
        };

        await orderAPI.create(payload);
        await fetchData();
      } catch (error) {
        console.error("Failed to create order", error);
        alert("Failed to record sale");
      }
    },
    updateStockOutRecord: async (id: string, updates: Partial<StockOutRecord>) => {
      try {
        const existing = stockOutRecords.find(r => r.id === id);
        if (!existing) return;

        const payload: any = {};

        if (updates.billNumber !== undefined && updates.billNumber !== existing.billNumber) payload.invoice_number = updates.billNumber;
        if (updates.billImage !== undefined && updates.billImage !== existing.billImage) payload.invoice_url = updates.billImage;
        if (updates.additionalBillImage !== undefined && updates.additionalBillImage !== existing.additionalBillImage) payload.additional_invoice_url = updates.additionalBillImage;
        if (updates.totalAmount !== undefined && updates.totalAmount !== existing.totalAmount) payload.total_amount = updates.totalAmount;
        if (updates.paymentType !== undefined && updates.paymentType !== existing.paymentType) payload.payment_mode = updates.paymentType;
        if (updates.customerName !== undefined && updates.customerName !== existing.customerName) payload.customer_name = updates.customerName;
        if (updates.customerMobile !== undefined && updates.customerMobile !== existing.customerMobile) payload.customer_mobile = updates.customerMobile;
        if (updates.customerEmail !== undefined && updates.customerEmail !== existing.customerEmail) payload.customer_email = updates.customerEmail;
        if (updates.customerAddress !== undefined && updates.customerAddress !== existing.customerAddress) payload.customer_address = updates.customerAddress;
        if (updates.couponCode !== undefined && updates.couponCode !== existing.couponCode) payload.coupon_code = updates.couponCode;
        if (updates.discountAmount !== undefined && updates.discountAmount !== existing.discountAmount) payload.discount_amount = updates.discountAmount;
        if (updates.shippingFee !== undefined && updates.shippingFee !== existing.shippingFee) payload.shipping_fee = updates.shippingFee;
        if (updates.subtotal !== undefined && updates.subtotal !== existing.subtotal) payload.subtotal = updates.subtotal;

        if (updates.items) {
          const itemsChanged = JSON.stringify(updates.items.map(i => ({ pid: i.productId, qty: i.quantity }))) !==
            JSON.stringify(existing.items.map(i => ({ pid: i.productId, qty: i.quantity })));

          if (itemsChanged) {
            payload.items = updates.items.map(item => ({
              product_id: item.productId,
              product_name: item.productName,
              unit_price: item.unitPrice,
              quantity: item.quantity
            }));
          }
        }

        if (Object.keys(payload).length === 0) {
          console.log("No changes detected, skipping update");
          return;
        }

        await orderAPI.update(id, payload);
        await fetchData();
      } catch (error) {
        console.error("Failed to update stock out record", error);
        alert("Failed to update record");
      }
    },
    deleteStockOutRecord: async (id: string) => {
      try {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        const shouldRestock = window.confirm("Do you want to restore the stock for these items?");
        const restoreFlag = shouldRestock ? 'true' : 'false';

        await orderAPI.delete(id, restoreFlag);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete stock out record", error);
        alert("Failed to delete record");
      }
    },
    deleteContact: async (id: string) => {
      try {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;
        await contactsAPI.delete(id);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete contact", error);
        alert("Failed to delete contact entry");
      }
    },
    addCoupon: async (c: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => {
      try {
        const payload = {
          code: c.code,
          discount_type: c.discountType,
          discount_value: c.discountValue,
          min_cart_amount: c.minCartAmount,
          max_discount_amount: c.maxDiscountAmount,
          usage_limit: c.usageLimit,
          start_date: c.startDate,
          end_date: c.endDate,
          is_active: c.isActive ? 1 : 0,
          show_in_promo: c.showInPromo ? 1 : 0,
          coming_soon: c.comingSoon ? 1 : 0
        };
        await couponAPI.create(payload);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to create coupon");
      }
    },
    updateCoupon: async (id: string, c: Partial<Coupon>) => {
      try {
        const payload: any = {};
        if (c.code) payload.code = c.code;
        if (c.discountType) payload.discount_type = c.discountType;
        if (c.discountValue !== undefined) payload.discount_value = c.discountValue;
        if (c.minCartAmount !== undefined) payload.min_cart_amount = c.minCartAmount;
        if (c.maxDiscountAmount !== undefined) payload.max_discount_amount = c.maxDiscountAmount;
        if (c.usageLimit !== undefined) payload.usage_limit = c.usageLimit;
        if (c.startDate !== undefined) payload.start_date = c.startDate;
        if (c.endDate !== undefined) payload.end_date = c.endDate;
        if (c.isActive !== undefined) payload.is_active = c.isActive ? 1 : 0;
        if (c.showInPromo !== undefined) payload.show_in_promo = c.showInPromo ? 1 : 0;
        if (c.comingSoon !== undefined) payload.coming_soon = c.comingSoon ? 1 : 0;

        await couponAPI.update(id, payload);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to update coupon");
      }
    },
    deleteCoupon: async (id: string) => {
      try {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        await couponAPI.delete(id);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to delete coupon");
      }
    },
    deleteUserOrder: async (id: string) => {
      try {
        if (!window.confirm("Are you sure you want to delete this user order?")) return;
        const shouldRestock = window.confirm("Do you want to restore the stock for these items?");
        const restoreFlag = shouldRestock ? 'true' : 'false';
        await userOrderAPI.delete(id, restoreFlag);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete user order", error);
        alert("Failed to delete order");
      }
    },
    upsertBulkOutstanding: async (userID: string, amount: number) => {
      try {
        await userAPI.upsertBulkOutstanding({ userID, amount });
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to update outstanding amount");
      }
    },
    assignProductsToBulkUser: async (userID: string, productIDs: string[]) => {
      try {
        await userAPI.assignProductsToBulkUser({ userID, productIDs });
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to assign products");
      }
    },
    createBulkUser: async (userData: any) => {
      try {
        const payload = {
          ...userData,
          user_role: 'bulk',
          isAdmin: 0 // Bulk users are not admins in the admin panel context usually
        };
        await authAPI.register(payload);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to create bulk user");
        throw e;
      }
    },
    bulkUpdateUsers: async (users: any[]) => {
      try {
        await userAPI.bulkUpdate({ users });
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to update users");
        throw e;
      }
    },

    validateCoupon: async (code: string, amount: number) => {
      try {
        const response = await couponAPI.validate({ code, cartTotal: amount });
        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Coupon applied successfully",
            coupon: response.data.coupon,
            discountAmount: parseFloat(response.data.discount_amount || 0),
            newTotal: parseFloat(response.data.new_total || 0)
          };
        } else {
          throw new Error(response.data.message || "Invalid coupon");
        }
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to validate coupon";
        throw new Error(message);
      }
    },
    setPage: setCurrentPage,
    setCategoryPage: setCategoryPage,
    setFilterPage: setFilterPage,
    setThresholdPage: setThresholdPage,
    setReminderPage: setReminderPage,
    setOrderPage: setOrderPage,
    setContactPage: setContactPage,
    setCouponPage: setCouponPage,
    setBulkOrderPage: setBulkOrderPage,
    setSearch: (query: string) => {
      setSearchTerm(query);
      setCurrentPage(1);
      setCategoryPage(1);
      setFilterPage(1);
      setOrderPage(1);
      setContactPage(1);
      setCouponPage(1);
      setBulkOrderPage(1);
    },
    fetchBulkProducts: async (userID: number) => {
      try {
        const res = await bulkProductAPI.getByUser(userID);
        setBulkProducts(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    },
    addBulkProduct: async (data: any) => {
      try {
        await bulkProductAPI.create(data);
        const res = await bulkProductAPI.getByUser(data.userID);
        setBulkProducts(res.data.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to create bulk product");
      }
    },
    updateBulkProduct: async (id: number, data: any) => {
      try {
        await bulkProductAPI.update(id, data);
        if (data.userID) {
          const res = await bulkProductAPI.getByUser(data.userID);
          setBulkProducts(res.data.data || []);
        }
      } catch (e) {
        console.error(e);
        alert("Failed to update bulk product");
      }
    },
    deleteBulkProduct: async (id: number, userID: number) => {
      try {
        await bulkProductAPI.delete(id);
        const res = await bulkProductAPI.getByUser(userID);
        setBulkProducts(res.data.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to delete bulk product");
      }
    },
    fetchBulkMasters: async () => {
      try {
        const res = await bulkMasterAPI.getAll();
        setBulkMasters(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    },
    addBulkMaster: async (data: any) => {
      try {
        await bulkMasterAPI.create(data);
        const res = await bulkMasterAPI.getAll();
        setBulkMasters(res.data.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to create master");
      }
    },
    deleteBulkMaster: async (id: number) => {
      try {
        await bulkMasterAPI.delete(id);
        const res = await bulkMasterAPI.getAll();
        setBulkMasters(res.data.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to delete master");
      }
    },
    setUserTypeFilter: (filter: 'both' | 'retail' | 'bulk') => {
      setUserTypeFilter(filter);
      setOrderPage(1); // Reset order page when filter changes
    },
    addBulkMasterProduct: async (data: any) => {
      try {
        await bulkMasterProductAPI.create(data);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to create master product");
      }
    },
    updateBulkMasterProduct: async (id: number, data: any) => {
      try {
        await bulkMasterProductAPI.update(id, data);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to update master product");
      }
    },
    deleteBulkMasterProduct: async (id: number) => {
      try {
        await bulkMasterProductAPI.delete(id);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to delete master product");
      }
    },
    bulkAssignMasterProducts: async (userID: number, masterProductIds: number[]) => {
      try {
        await bulkMasterProductAPI.assign({ userID, masterProductIds });
        // Refresh products for the user
        const res = await bulkProductAPI.getByUser(userID);
        setBulkProducts(res.data.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to assign products");
      }
    },
    updateBulkOrderStatus: async (id: number, status: string) => {
      try {
        await bulkOrderAPI.updateStatus(id, status);
        await fetchData();
      } catch (e) {
        console.error(e);
        alert("Failed to update bulk order status");
      }
    },
    markNotificationAsRead: async (id: number) => {
      try {
        await notificationAPI.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      } catch (e) { console.error(e); }
    },
    markAllNotificationsAsRead: async () => {
      try {
        await notificationAPI.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (e) { console.error(e); }
    },
    deleteNotification: async (id: number) => {
      try {
        await notificationAPI.deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
      } catch (e) { console.error(e); }
    },
    deleteAllNotifications: async () => {
      try {
        await notificationAPI.deleteAllNotifications();
        setNotifications([]);
      } catch (e) { console.error(e); }
    },
    fetchData
  }), [fetchData, products, allProducts, stockOutRecords, contacts, coupons, mainCats, allMainCats, subCats, subSubCats, filters, allFilters, bulkUsers, userTypeFilter, bulkOrders, totalBulkOrders, bulkOrderPage, bulkMasterProducts, notifications, totalNotifications]);

  return (
    <DataContext.Provider value={{
      categories: { main: mainCats, sub: subCats, subSub: subSubCats },
      allMainCategories: allMainCats,
      filters,
      allFilters,
      products,
      allProducts,
      totalProducts,
      totalCategories,
      totalFilters,
      totalOrders,
      totalContacts,
      totalCoupons,
      totalBulkOrders,
      currentPage,
      categoryPage,
      filterPage,
      thresholdPage,
      reminderPage,
      orderPage,
      contactPage,
      couponPage,
      bulkOrderPage,
      pageSize,
      searchTerm,
      stockOutRecords,
      contacts,
      coupons,
      orders,
      userTypeFilter,
      bulkUsers,
      bulkProducts,
      bulkOrders,
      bulkMasters,
      bulkMasterProducts,
      notifications,
      totalNotifications,
      loading,
      actions
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
