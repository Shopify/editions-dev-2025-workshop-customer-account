import "@shopify/ui-extension";

//@ts-ignore
declare module "./components/ProductItem.tsx" {
  const shopify: import("@shopify/ui-extensions/customer-account.order-index.block.render").Api;
  const globalThis: { shopify: typeof shopify };
}
