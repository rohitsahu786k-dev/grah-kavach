export type CartItem = {
  productId: number;
  quantity: number;
};

export type ValidatedLineItem = {
  productId: number;
  name: string;
  slug: string;
  sku: string;
  image: string;
  unitPriceMinor: number;
  regularPriceMinor?: number;
  quantity: number;
  lineSubtotalMinor: number;
  lineTotalMinor: number;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  stockQuantity: number | null;
  error?: string;
};

export type ValidatedCoupon = {
  code: string;
  discountType: "percent" | "fixed_cart" | "fixed_product" | string;
  amount: string;
  discountMinor: number;
  description?: string;
};

export type ValidatedCart = {
  items: ValidatedLineItem[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  shippingNotice?: string;
  taxMinor: number;
  taxNotice?: string;
  totalMinor: number;
  currency: string;
  coupon?: ValidatedCoupon;
  hasErrors: boolean;
  errorMessages: string[];
};

export type CartContextType = {
  items: CartItem[];
  totalItemCount: number;
  /** False until browser storage has been read, so badges avoid a flash of "0". */
  isReady: boolean;
  /** Set briefly after an add, so the drawer can highlight the row that changed. */
  lastAddedProductId: number | null;
  addItem: (productId: number, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
};
