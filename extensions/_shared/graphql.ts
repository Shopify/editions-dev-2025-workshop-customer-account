import { METAFIELD_NAMESPACE } from "./constants";

import { METAFIELD_KEY } from "./constants";

export const productFragment = `
  fragment ProductFields on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        url
      }
    }
  }
`;

export function getShopDataQuery() {
  return {
    query: `query shopData {
      shop {
        url
      }
    }`,
  };
}

export function getWishlistQuery() {
  return {
    query: `query wishlistedItems($key: String!, $namespace: String!) {
      customer {
        metafield(namespace: $namespace, key: $key) {
          value
        }
      }
    }`,
    variables: {
      key: METAFIELD_KEY,
      namespace: METAFIELD_NAMESPACE,
    },
  };
}

export const getFirst3ProductsQuery = () => {
  return {
    query: `
      ${productFragment}
      query {
        products(first: 3) {
          nodes {
            ... on Product {
              ...ProductFields
            }
          }
        }
      }`,
  };
};

export const getProductsQuery = (productIds: string[]) => {
  return {
    query: `
      ${productFragment}
      query Products($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            ...ProductFields
          }
        }
      }`,
    variables: {
      ids: productIds,
    },
  };
};

export function setWishlistItemsMutation(
  customerId: string,
  newValue: string[],
) {
  return {
    query: `mutation removeItemFromWishlist($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
          }
        }
      }`,
    variables: {
      metafields: [
        {
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          ownerId: `gid://shopify/Customer/${customerId}`,
          value: JSON.stringify(newValue),
        },
      ],
    },
  };
}

export const getProductsByTagQuery = (tag: string) => {
  return {
    query: `
      ${productFragment}
      query Products($query: String!) {
        products(first: 5, query: $query) {
          nodes {
            ... on Product {
              ...ProductFields
            }
          }
        }
      }`,
    variables: {
      query: `tag:${tag}`,
    },
  };
};

export async function fetchWishlistedProductIds() {
  const response = await fetch(
    "shopify://customer-account/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getWishlistQuery()),
    },
  );

  const data = await response.json();
  const value = data?.data?.customer?.metafield?.value;
  return value ? JSON.parse(value) : [];
}

export async function updateWishlistItems(
  customerId: string,
  wishlist: string[],
) {
  const result = await fetch(
    "shopify://customer-account/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(setWishlistItemsMutation(customerId, wishlist)),
    },
  );

  return result.json();
}
