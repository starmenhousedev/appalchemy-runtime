// Minimal GraphQL client for Shopify Storefront API. Avoids depending on
// an external Storefront SDK — POSTs queries with the merchant's
// Storefront access token (baked into the build at compile time).

import { RUNTIME_CONFIG } from "../config";

const STOREFRONT_API_VERSION = "2024-10";

interface GraphQLError {
  message: string;
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export class StorefrontError extends Error {
  errors: GraphQLError[];
  constructor(errors: GraphQLError[]) {
    super(errors.map((e) => e.message).join("; ") || "Storefront query failed");
    this.errors = errors;
  }
}

export async function storefrontQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!RUNTIME_CONFIG.shopDomain) {
    throw new Error("RUNTIME_CONFIG.shopDomain is not set");
  }
  if (!RUNTIME_CONFIG.storefrontToken) {
    throw new Error("RUNTIME_CONFIG.storefrontToken is not set");
  }

  const url = `https://${RUNTIME_CONFIG.shopDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": RUNTIME_CONFIG.storefrontToken,
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(
      `Storefront HTTP ${res.status} ${res.statusText}`,
    );
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new StorefrontError(json.errors);
  }
  if (!json.data) {
    throw new Error("Storefront response had no data");
  }
  return json.data;
}
