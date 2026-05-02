// Subset of Shopify Storefront customer types used by the runtime.

import type { Money } from "../shopify/types";

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string; // ISO
}

export interface Customer {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  phone: string | null;
}

export interface CustomerOrderLineItem {
  title: string;
  quantity: number;
  variant: {
    product: {
      handle: string;
    };
  } | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: Money;
  lineItems: CustomerOrderLineItem[];
}

export interface UserError {
  field?: string[] | null;
  message: string;
  code?: string | null;
}
