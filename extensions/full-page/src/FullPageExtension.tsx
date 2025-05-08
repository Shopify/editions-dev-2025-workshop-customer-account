import {
  BlockStack,
  reactExtension,
  Page,
  Heading,
  Card,
  Text,
  Spinner,
  View,
  useExtension,
  useSettings,
  useAuthenticatedAccountCustomer,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";
import type { Product, Shop } from "../../_shared/types";
import WishlistItem from "./WishlistItem";
import { ProductsGrid } from "../../_shared/components/ProductsGrid";
import {
  fetchWishlistedProductIds,
  getProductsQuery,
  getFirst3ProductsQuery,
  getShopDataQuery,
  updateWishlistItems,
} from "../../_shared/graphql";
export default reactExtension("customer-account.page.render", async (api) => {
  return <WishlistedItems />;
});

function WishlistedItems() {
  let { show_remove_button: showRemoveButton } = useSettings();

  showRemoveButton = showRemoveButton ?? true;

  const { editor } = useExtension();
  const { id: customerId } = useAuthenticatedAccountCustomer();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const wishlistedProductIds = wishlist.map((product) => product.id);

  const isInEditor = editor?.type === "checkout";

  useEffect(() => {
    async function run() {
      const shopDataPromise = fetchShopData();

      const products = isInEditor
        ? await fetchPreviewProducts()
        : await fetchProducts(await fetchWishlistedProductIds());
      const shopData = await shopDataPromise;

      setShopData(shopData);
      setWishlist(products);
      setLoading(false);
    }
    run();
  }, [isInEditor]);

  async function removeItemFromWishlist(
    wishlistItems: string[],
    productIdToRemove: string,
  ) {
    const newWishlistItems = wishlistItems.filter(
      (item) => item !== productIdToRemove,
    );

    if (isInEditor) {
      console.log(
        "CLICKED REMOVE ITEM FROM WISHLIST",
        productIdToRemove,
        newWishlistItems,
      );
      const newWishlist = await fetchProducts(newWishlistItems);
      setWishlist(newWishlist);
    }

    try {
      await updateWishlistItems(customerId, newWishlistItems);

      const newWishlist = await fetchProducts(newWishlistItems);
      setWishlist(newWishlist);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Page title="Wishlist">
      {!loading && wishlist.length === 0 ? (
        <Card padding>
          <BlockStack inlineAlignment="center">
            <Heading level={2}>Your wishlist is empty</Heading>
            <Text>No items in your wishlist</Text>
          </BlockStack>
        </Card>
      ) : (
        <>
          {loading ? (
            <Card padding>
              <View inlineAlignment="center">
                <Spinner size="large" />
              </View>
            </Card>
          ) : (
            <ProductsGrid>
              {wishlist.map((product) => (
                <WishlistItem
                  key={product.id}
                  product={product}
                  shopUrl={shopData.url}
                  showRemoveButton={showRemoveButton as boolean}
                  onRemoveClick={() => {
                    if (isInEditor) {
                      return;
                    }
                    removeItemFromWishlist(wishlistedProductIds, product.id);
                  }}
                />
              ))}
            </ProductsGrid>
          )}
        </>
      )}
    </Page>
  );
}

async function fetchShopData() {
  const response = await fetch(
    "shopify://customer-account/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getShopDataQuery()),
    },
  );

  const data = await response.json();
  return data?.data?.shop;
}

async function fetchPreviewProducts() {
  const response = await fetch(
    "shopify://storefront/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getFirst3ProductsQuery()),
    },
  );

  const data = await response.json();
  return data?.data?.products?.nodes.filter((node) => node !== null);
}

async function fetchProducts(productIds?: string[]) {
  const response = await fetch(
    "shopify://storefront/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getProductsQuery(productIds)),
    },
  );

  const data = await response.json();

  return data?.data?.nodes.filter((node) => node !== null);
}
