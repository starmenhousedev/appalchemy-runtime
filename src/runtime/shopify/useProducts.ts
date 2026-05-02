import { useEffect, useState } from "react";
import type { ProductSortKey, ProductSource } from "../types";
import { storefrontQuery } from "./client";
import {
  PRODUCTS_BY_COLLECTION,
  PRODUCTS_BY_HANDLES,
  PRODUCTS_BY_QUERY,
} from "./queries";
import type { Product } from "./types";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface RawProduct extends Omit<Product, "variants"> {
  variants: { nodes: Product["variants"] };
}

function unwrapNodes(raw: RawProduct[]): Product[] {
  return raw.map((p) => ({ ...p, variants: p.variants?.nodes ?? [] }));
}

// Map our ProductSortKey to Storefront's sort enum + reverse flag.
// Returns null when the source is a query-by-handle (sort is implicit).
interface CollectionSort {
  sortKey:
    | "MANUAL"
    | "BEST_SELLING"
    | "CREATED"
    | "PRICE"
    | "TITLE"
    | "RELEVANCE";
  reverse: boolean;
}
interface ProductsSort {
  sortKey: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE" | "RELEVANCE";
  reverse: boolean;
}

function collectionSort(sort: ProductSortKey): CollectionSort {
  switch (sort) {
    case "default":
      return { sortKey: "MANUAL", reverse: false };
    case "relevance":
      return { sortKey: "RELEVANCE", reverse: false };
    case "just_launched":
      return { sortKey: "CREATED", reverse: true };
    case "best_selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "price_high_low":
      return { sortKey: "PRICE", reverse: true };
    case "price_low_high":
      return { sortKey: "PRICE", reverse: false };
    case "alpha_az":
      return { sortKey: "TITLE", reverse: false };
    case "alpha_za":
      return { sortKey: "TITLE", reverse: true };
  }
}

function productsSort(sort: ProductSortKey): ProductsSort {
  switch (sort) {
    case "default":
    case "relevance":
      return { sortKey: "RELEVANCE", reverse: false };
    case "just_launched":
      return { sortKey: "CREATED_AT", reverse: true };
    case "best_selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "price_high_low":
      return { sortKey: "PRICE", reverse: true };
    case "price_low_high":
      return { sortKey: "PRICE", reverse: false };
    case "alpha_az":
      return { sortKey: "TITLE", reverse: false };
    case "alpha_za":
      return { sortKey: "TITLE", reverse: true };
  }
}

export function useProducts(
  source: ProductSource,
  limit: number,
  sort: ProductSortKey = "default",
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  // Stable string key so the effect re-runs only when inputs change.
  const sourceKey = JSON.stringify(source);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        let next: Product[] = [];

        if (source.kind === "collection") {
          const { sortKey, reverse } = collectionSort(sort);
          const data = await storefrontQuery<{
            collection: { products: { nodes: RawProduct[] } } | null;
          }>(PRODUCTS_BY_COLLECTION, {
            handle: source.handle,
            first: limit,
            sortKey,
            reverse,
          });
          next = unwrapNodes(data.collection?.products.nodes ?? []);
        } else if (source.kind === "tag") {
          const { sortKey, reverse } = productsSort(sort);
          const data = await storefrontQuery<{
            products: { nodes: RawProduct[] };
          }>(PRODUCTS_BY_QUERY, {
            query: `tag:${source.tag}`,
            first: limit,
            sortKey,
            reverse,
          });
          next = unwrapNodes(data.products.nodes);
        } else {
          const handlesQuery = source.productHandles
            .map((h) => `handle:${h}`)
            .join(" OR ");
          const data = await storefrontQuery<{
            nodes: { nodes: RawProduct[] };
          }>(PRODUCTS_BY_HANDLES, { handles: handlesQuery });
          next = unwrapNodes(data.nodes.nodes);
          // Preserve the merchant-specified order for manual selections.
          const order = new Map(source.productHandles.map((h, i) => [h, i]));
          next.sort(
            (a, b) =>
              (order.get(a.handle) ?? 999) - (order.get(b.handle) ?? 999),
          );
        }

        if (!cancelled) {
          setProducts(next.slice(0, limit));
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, limit, sort, tick]);

  return {
    products,
    loading,
    error,
    refetch: () => setTick((n) => n + 1),
  };
}
