export interface MainCategory {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
}

export interface SubCategory {
  id: string;
  mainCategoryId: string;
  name: string;
}

export interface SubSubCategory {
  id: string;
  subCategoryId: string;
  name: string;
}

export interface FilterValue {
  id: string;
  value: string;
}

export interface Filter {
  id: string;
  code: string; // Machine-readable identifier
  label: string; // e.g., "Size", "Color"
  values: FilterValue[];
  mappedMainCategoryIds: string[]; // Which main categories this filter applies to
  isActive: boolean;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number; // New field
  discountPrice?: number;
  lowStockLimit: number; // New field
  sku: string;
  shortDescription: string;
  longDescription: string;
  description: string;
  isActive: boolean; // Computed from status
  status: 'draft' | 'active' | 'inactive'; // Backend status

  // Hierarchy
  mainCategoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;

  // Media
  primaryImage: string; // URL or Base64
  additionalImages: string[];
  video?: string;

  // Selected Filters (e.g., Size: M, Color: Red)
  selectedFilters: Record<string, string[]>; // FilterID -> Array of ValueIDs

  // Extra Details
  extraDetails?: {
    careInstructions?: string;
    warranty?: string;
    dimensions?: string;
    weight?: string;
    customAttributes?: ProductAttribute[];
  };

  // Stock
  stockQuantity: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'backorder' | 'low_stock';
  lastStockUpdate: string; // ISO Date
}

export type PaymentType = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  primaryImage?: string;
}

export interface StockOutRecord {
  id: string;
  items: OrderItem[]; // Multi-item support
  customerName: string;
  customerMobile?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerDetails: string;
  paymentType: PaymentType;
  billNumber?: string;
  billImage?: string;
  additionalBillImage?: string;
  date: string;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  subtotal?: number;
}

export interface UserOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedFilters?: any;
  sku?: string;
  primaryImage?: string;
  product_image?: string;
  box_name?: string;
}

export interface UserOrder {
  id: string;
  invoiceNumber: string;
  customerId: string;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  customerEmail?: string;
  items: UserOrderItem[];
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  subtotal?: number;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minCartAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number | null;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  showInPromo?: boolean;
  comingSoon?: boolean;
  createdAt: string;
}

export interface BulkBaseMaster {
  id: number;
  type: 'size' | 'color' | 'shape';
  value: string;
  created_at: string;
}

export interface BulkUser {
  userID: string;
  fullName: string;
  emailID: string;
  mobileNo: string;
  user_role: string;
  isActive: boolean;
  outstanding_amount: number;
}

export interface BulkProduct {
  id: number;
  userID: number;
  product_type: 'box' | 'base';
  sr_no: string;
  box_name: string;
  size: string;
  paper: string;
  liner: string;
  sheet_size: string;
  no_sheet: string;
  die_no: string;
  plate_name: string;
  available_colors: string;
  available_shapes: string;
  product_image?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkMasterProduct {
  id: number;
  product_type: 'box' | 'base';
  sr_no: string;
  box_name: string;
  size: string;
  paper: string;
  liner: string;
  sheet_size: string;
  no_sheet: string;
  die_no: string;
  plate_name: string;
  available_colors: string;
  available_shapes: string;
  product_image?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkOrderItem {
  id: number;
  order_id: number;
  bulk_product_id: number;
  quantity: number;
  box_name: string;
  size: string;
  die_no: string;
  sr_no: string;
  paper: string;
  liner: string;
  sheet_size: string;
  no_sheet: string;
  plate_name: string;
  product_type: 'box' | 'base';
  selected_color?: string;
  selected_shape?: string;
  product_image?: string;
  created_at: string;
}

export interface BulkOrder {
  id: number;
  invoice_number: string;
  userID: number;
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  items: BulkOrderItem[];
}

export interface CouponValidationResponse {
  success: boolean;
  message: string;
  coupon: Partial<Coupon>;
  discountAmount: number;
  newTotal: number;
}

export type ViewState = 'dashboard' | 'products' | 'categories' | 'filters' | 'inventory' | 'product-wizard' | 'out-stock' | 'stock-thresholds' | 'stock-reminders' | 'contacts' | 'coupons' | 'orders' | 'bulk-users' | 'bulk-products' | 'bulk-orders' | 'bulk-test' | 'bulk-masters' | 'bulk-master-products';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'system';
  reference_id?: number;
  is_read: boolean;
  created_at: string;
}
