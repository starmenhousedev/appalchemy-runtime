// Subset of Shopify Storefront API types used by the runtime. Keeps the
// runtime independent of any Shopify SDK and lets us shape data however
// the section components need.

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ProductOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions?: ProductOption[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage: ProductImage | null;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange: {
    minVariantPrice: Money | null;
    maxVariantPrice: Money | null;
  } | null;
  variants: ProductVariant[];
}

export interface ProductDetail extends Product {
  descriptionHtml: string;
  images: ProductImage[];
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image: ProductImage | null;
    product: {
      id: string;
      handle: string;
      title: string;
    };
  };
  cost: {
    totalAmount: Money;
  };
}
