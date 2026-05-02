// GraphQL fragments + queries for product fetching and cart management.

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    handle
    title
    description
    vendor
    productType
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 1) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
  }
`;

export const PRODUCTS_BY_COLLECTION = `
  ${PRODUCT_FRAGMENT}
  query ProductsByCollection($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        nodes { ...Product }
      }
    }
  }
`;

export const PRODUCTS_BY_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductsByQuery($query: String!, $first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...Product }
    }
  }
`;

export const PRODUCTS_BY_HANDLES = `
  ${PRODUCT_FRAGMENT}
  query ProductsByHandles($handles: [String!]!) {
    nodes: products(first: 100, query: $handles) {
      nodes { ...Product }
    }
  }
`;

export const PRODUCT_BY_HANDLE = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      vendor
      productType
      tags
      featuredImage { url altText width height }
      images(first: 10) { nodes { url altText width height } }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
  }
`;

const CART_FRAGMENT = `#graphql
  fragment Cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url altText width height }
            product { id handle title }
          }
        }
      }
    }
  }
`;

export const CART_GET = `
  ${CART_FRAGMENT}
  query CartGet($id: ID!) {
    cart(id: $id) { ...Cart }
  }
`;

export const CART_CREATE = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...Cart }
      userErrors { field message code }
    }
  }
`;

export const CART_LINES_ADD = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
      userErrors { field message code }
    }
  }
`;

export const CART_LINES_UPDATE = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
      userErrors { field message code }
    }
  }
`;

export const CART_LINES_REMOVE = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...Cart }
      userErrors { field message code }
    }
  }
`;
