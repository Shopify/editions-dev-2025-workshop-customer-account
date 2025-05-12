import "@shopify/shopify-app-remix/adapters/node";
import {
  AdminApiContext,
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { ShopifyRestResources } from "node_modules/@shopify/shopify-api/dist/ts/rest/types";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  hooks: {
    afterAuth: async ({ admin, session }) => {
      console.log("###afterAuth");
      await shopify.registerWebhooks({ session });

      try {
        const metafield = await getMetafield(admin);

        if (metafield == null) {
          await createMetafield(admin);
        }
      } catch (error: any) {
        if ("graphQLErrors" in error) {
          console.error(error.graphQLErrors);
        } else {
          console.error(error);
        }

        throw error;
      }
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

async function getMetafield(admin: AdminApiContext<ShopifyRestResources>) {
  const response = await admin.graphql(getMetafieldQuery, {
    variables: {
      key: "items",
      namespace: "$app:wishlist",
      ownerType: "CUSTOMER",
    },
  });

  const json = await response.json();
  return json.data?.metafieldDefinitions.nodes[0];
}

const getMetafieldQuery = `#graphql
query getMetafieldDefinition($key: String!, $namespace: String!, $ownerType: MetafieldOwnerType!) {
  metafieldDefinitions(first: 1, key: $key, namespace: $namespace, ownerType: $ownerType) {
    nodes {
      id
    }
  }
}
`;

async function createMetafield(admin: AdminApiContext<ShopifyRestResources>) {
  const response = await admin.graphql(createMetafieldMutation, {
    variables: {
      definition: {
        access: {
          customerAccount: "READ_WRITE",
        },
        key: "items",
        name: "Wishlist items",
        namespace: "$app:wishlist",
        ownerType: "CUSTOMER",
        type: "list.product_reference",
      },
    },
  });

  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

const createMetafieldMutation = `#graphql
mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      key
      namespace
    }
    userErrors {
      field
      message
    }
  }
}
`;

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
