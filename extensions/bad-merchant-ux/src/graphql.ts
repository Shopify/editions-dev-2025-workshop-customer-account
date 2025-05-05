export const productFragment = `
  fragment ProductFields on Product {
    id
    title
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

export function getWishlistQuery(namespace: string, key: string) {
  return {
    query: `query wishlistedItems($key: String!, $namespace: String!) {
      customer {
        metafield(namespace: $namespace, key: $key) {
          value
        }
      }
    }`,
    variables: {
      namespace,
      key,
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

export function removeItemFromWishlistMutation(
  namespace: string,
  key: string,
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
          namespace,
          key,
          ownerId: customerId,
          value: newValue,
        },
      ],
    },
  };
}
