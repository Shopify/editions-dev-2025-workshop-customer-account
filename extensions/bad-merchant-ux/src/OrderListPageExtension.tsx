import {
  BlockStack,
  reactExtension,
  View,
  Heading,
  Grid,
  Style,
  Card,
  Text,
  Button,
  BlockSpacer,
  Banner,
  useExtension,
  useSettings,
  useAuthenticatedAccountCustomer,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";
import type { Product, Shop } from "./types";
import WishlistItem from "./WishlistItem";
import {
  getWishlistQuery,
  getProductsQuery,
  removeItemFromWishlistMutation,
  getFirst3ProductsQuery,
  getShopDataQuery,
} from "./graphql";

export default reactExtension(
  "customer-account.order-index.block.render",
  async (api) => {
    const isInEditor = api.extension.editor?.type === "checkout";
    const {
      metafield_namespace: metaFieldNamespace = "custom",
      metafield_key: metaFieldKey = "wishlist",
    } = api.settings.current;

    const shopDataPromise = fetchShopData();

    const products = isInEditor
      ? await fetchPreviewProducts()
      : await fetchProducts(
          await fetchWishlistedProductIds(
            metaFieldNamespace as string,
            metaFieldKey as string,
          ),
        );
    const shopData = await shopDataPromise;

    return <WishlistedItems initialWishlist={products} shopData={shopData} />;
  },
);

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

async function fetchWishlistedProductIds(
  metaFieldNamespace: string,
  metaFieldKey: string,
) {
  const response = await fetch(
    "shopify://customer-account/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getWishlistQuery(metaFieldNamespace, metaFieldKey)),
    },
  );

  const data = await response.json();
  const value = data?.data?.customer?.metafield?.value;
  return value ? JSON.parse(value) : [];
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

function WishlistedItems({
  initialWishlist,
  shopData,
}: {
  initialWishlist: Product[];
  shopData: Shop;
}) {
  let {
    metafield_namespace: metaFieldNamespace,
    metafield_key: metaFieldKey,
    show_remove_button: showRemoveButton,
    show_full_page_button: showFullPageButton,
  } = useSettings();

  showRemoveButton = showRemoveButton ?? true;
  showFullPageButton = showFullPageButton ?? true;

  const { editor } = useExtension();
  const { id: customerId } = useAuthenticatedAccountCustomer();
  const { i18n } = useApi();
  const [wishlist, setWishlist] = useState<Product[]>(initialWishlist);
  const wishlistedProductIds = wishlist.map((product) => product.id);

  const isInEditor = editor?.type === "checkout";

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
      await fetch("shopify://customer-account/api/unstable/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          removeItemFromWishlistMutation(
            metaFieldNamespace as string,
            metaFieldKey as string,
            customerId,
            newWishlistItems,
          ),
        ),
      });

      const newWishlist = await fetchProducts(newWishlistItems);
      setWishlist(newWishlist);
    } catch (error) {
      console.error(error);
    }
  }

  // Bad UX - doesn't show any preview at all in the editor
  // if (!isLoading && wishlist.length === 0) return null;

  if (!metaFieldNamespace || !metaFieldKey) {
    if (!isInEditor) return null;
  }

  return (
    <View>
      <Grid columns={["fill", "auto"]}>
        <Heading level={1}>{i18n.translate("heading")}</Heading>
        {showFullPageButton && (
          <Button kind="secondary" to="extension:full-page/">
            {i18n.translate("goToWishlist")}
          </Button>
        )}
      </Grid>
      <BlockSpacer spacing="loose" />
      {wishlist.length === 0 && (
        <Card padding>
          <BlockStack inlineAlignment="center">
            <Heading level={2}>{i18n.translate("wishlistEmpty.title")}</Heading>
            <Text>{i18n.translate("wishlistEmpty.description")}</Text>
          </BlockStack>
        </Card>
      )}
      <Card padding>
        {/* Good UX - tells merchants in the editor when there is a missing required setting */}
        {isInEditor && (!metaFieldNamespace || !metaFieldKey) && (
          <>
            <Banner status="warning">
              <Text>
                Missing required settings. Please provide a metafield namespace
                and key in the app block settings. The following is a preview -
                this app block will not be visible to customers until you
                provide the required settings.
              </Text>
            </Banner>
            <BlockSpacer spacing="loose" />
          </>
        )}
        <Grid
          columns={Style.default(["fill"])
            .when({ viewportInlineSize: { min: "extraSmall" } }, [
              "fill",
              "fill",
            ])
            .when({ viewportInlineSize: { min: "small" } }, [
              "fill",
              "fill",
              "fill",
            ])
            .when({ viewportInlineSize: { min: "medium" } }, [
              "fill",
              "fill",
              "fill",
              "fill",
            ])}
          spacing="loose"
          overflow="visible"
          rows="auto"
        >
          {wishlist.map((product) => (
            <WishlistItem
              key={product.id}
              product={product}
              shopUrl={shopData.url}
              showRemoveButton={showRemoveButton as boolean}
              onRemoveClick={() => {
                removeItemFromWishlist(wishlistedProductIds, product.id);
              }}
            />
          ))}
        </Grid>
      </Card>
    </View>
  );
}
