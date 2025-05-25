import '@shopify/ui-extension';

//@ts-ignore
declare module './src/FullPageExtension.tsx' {
  const shopify: import('@shopify/ui-extensions/customer-account.page.render').Api;
  const globalThis: { shopify: typeof shopify };
}
