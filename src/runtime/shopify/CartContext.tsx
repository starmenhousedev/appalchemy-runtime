import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { storefrontQuery } from "./client";
import {
  CART_CREATE,
  CART_GET,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
} from "./queries";
import { CART_BUYER_IDENTITY_UPDATE } from "../customer/queries";
import type { Cart, CartLine } from "./types";
import { track } from "../analytics";
import { useCustomer } from "../customer/CustomerContext";

interface RawCart extends Omit<Cart, "lines"> {
  lines: { nodes: CartLine[] };
}

const CART_ID_KEY = "@appalchemy/cart_id";

function unwrap(raw: RawCart | null | undefined): Cart | null {
  if (!raw) return null;
  return { ...raw, lines: raw.lines.nodes };
}

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: Error | null;
  addLine: (variantId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const Context = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { accessToken } = useCustomer();

  // Whenever the customer access token changes (login / logout / token
  // refresh), push the new identity to the cart so checkout pre-fills the
  // logged-in customer's email + addresses and the order is attributed.
  useEffect(() => {
    if (!cart) return;
    storefrontQuery(CART_BUYER_IDENTITY_UPDATE, {
      cartId: cart.id,
      buyerIdentity: { customerAccessToken: accessToken ?? null },
    }).catch(() => {
      /* non-fatal; cart still works without identity */
    });
  }, [accessToken, cart?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore saved cart on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await AsyncStorage.getItem(CART_ID_KEY);
        if (!id) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = await storefrontQuery<{ cart: RawCart | null }>(CART_GET, {
          id,
        });
        if (cancelled) return;
        if (data.cart) {
          setCart(unwrap(data.cart));
        } else {
          // Cart expired or invalidated server-side.
          await AsyncStorage.removeItem(CART_ID_KEY);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureCart = useCallback(async (): Promise<Cart> => {
    if (cart) return cart;
    const data = await storefrontQuery<{
      cartCreate: { cart: RawCart | null; userErrors: { message: string }[] };
    }>(CART_CREATE, { input: {} });
    const created = unwrap(data.cartCreate.cart);
    if (!created) {
      throw new Error(
        data.cartCreate.userErrors.map((e) => e.message).join("; ") ||
          "cartCreate failed",
      );
    }
    await AsyncStorage.setItem(CART_ID_KEY, created.id);
    setCart(created);
    return created;
  }, [cart]);

  const addLine = useCallback(
    async (variantId: string, quantity = 1) => {
      const c = await ensureCart();
      const data = await storefrontQuery<{
        cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] };
      }>(CART_LINES_ADD, {
        cartId: c.id,
        lines: [{ merchandiseId: variantId, quantity }],
      });
      const next = unwrap(data.cartLinesAdd.cart);
      if (next) {
        setCart(next);
        track("add_to_cart", {
          variant_id: variantId,
          quantity,
          cart_id: next.id,
          subtotal: next.cost.subtotalAmount.amount,
          currency: next.cost.subtotalAmount.currencyCode,
        });
      }
    },
    [ensureCart],
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      const data = await storefrontQuery<{
        cartLinesUpdate: { cart: RawCart | null };
      }>(CART_LINES_UPDATE, {
        cartId: cart.id,
        lines: [{ id: lineId, quantity }],
      });
      const next = unwrap(data.cartLinesUpdate.cart);
      if (next) setCart(next);
    },
    [cart],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      const data = await storefrontQuery<{
        cartLinesRemove: { cart: RawCart | null };
      }>(CART_LINES_REMOVE, { cartId: cart.id, lineIds: [lineId] });
      const next = unwrap(data.cartLinesRemove.cart);
      if (next) setCart(next);
    },
    [cart],
  );

  const refresh = useCallback(async () => {
    if (!cart) return;
    const data = await storefrontQuery<{ cart: RawCart | null }>(CART_GET, {
      id: cart.id,
    });
    const next = unwrap(data.cart);
    if (next) setCart(next);
  }, [cart]);

  return (
    <Context.Provider
      value={{ cart, loading, error, addLine, updateLine, removeLine, refresh }}
    >
      {children}
    </Context.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useCart must be called inside <CartProvider>");
  }
  return ctx;
}
