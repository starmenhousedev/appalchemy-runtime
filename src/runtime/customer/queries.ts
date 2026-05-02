// Storefront Customer API queries + mutations.

export const CUSTOMER_ACCESS_TOKEN_CREATE = `#graphql
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { field message code }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_RENEW = `#graphql
  mutation CustomerAccessTokenRenew($customerAccessToken: String!) {
    customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
      customerAccessToken { accessToken expiresAt }
      userErrors { field message }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_DELETE = `#graphql
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      userErrors { field message }
    }
  }
`;

export const CUSTOMER_CREATE = `#graphql
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email firstName lastName displayName phone }
      customerUserErrors { field message code }
    }
  }
`;

export const CUSTOMER_RECOVER = `#graphql
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { field message code }
    }
  }
`;

export const CUSTOMER_QUERY = `#graphql
  query CustomerQuery($accessToken: String!) {
    customer(customerAccessToken: $accessToken) {
      id
      email
      firstName
      lastName
      displayName
      phone
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders($accessToken: String!, $first: Int!) {
    customer(customerAccessToken: $accessToken) {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice { amount currencyCode }
          lineItems(first: 25) {
            nodes {
              title
              quantity
              variant {
                product { handle }
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE = `#graphql
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { id }
      userErrors { field message }
    }
  }
`;
