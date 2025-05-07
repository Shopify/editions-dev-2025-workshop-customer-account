import {
  BlockStack,
  reactExtension,
  View,
  Heading,
  Grid,
  Style,
  Card,
  Text,
  BlockSpacer,
  Banner,
  useExtension,
  useSettings,
  useAuthenticatedAccountCustomer,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";
import { Product } from "./types";
import WishlistItem from "./WishlistItem";
import {
  getWishlistQuery,
  getProductsQuery,
  removeItemFromWishlistMutation,
  getFirst3ProductsQuery,
} from "./graphql";

export default reactExtension(
  "customer-account.order-index.block.render",
  () => <WishlistedItems />,
);

function WishlistedItems() {
  const {
    metafield_namespace: metaFieldNamespace = "custom",
    metafield_key: metaFieldKey = "wishlist",
    show_remove_button: showRemoveButton = true,
  } = useSettings();
  const { editor } = useExtension();
  const { id: customerId } = useAuthenticatedAccountCustomer();

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const wishlistedProductIds = wishlist.map((product) => product.id);

  const isInEditor = editor?.type === "checkout";

  useEffect(() => {
    if (isInEditor) {
      // Better UX - shows a preview in the editor, but hardcodes content that can still be queried in the context of the editor
      // setWishlist([
      //   {
      //     id: "123",
      //     title: "Product 1",
      //     priceRange: {
      //       minVariantPrice: {
      //         amount: 100,
      //         currencyCode: "USD",
      //       },
      //       maxVariantPrice: {
      //         amount: 100,
      //         currencyCode: "USD",
      //       },
      //     },
      //     images: {
      //       nodes: [
      //         {
      //           url: "https://placehold.co/400",
      //         },
      //       ],
      //     },
      //   },
      // ]);
      // setIsLoading(false);

      // Best UX - shows relevant preview using data from the merchant's store
      fetchProducts();
      return;
    }

    if (!metaFieldNamespace || !metaFieldKey) {
      setIsLoading(false);
      return;
    }

    fetch("shopify://customer-account/api/unstable/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        getWishlistQuery(metaFieldNamespace as string, metaFieldKey as string),
      ),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.data?.customer?.metafield?.value == null) {
          setIsLoading(false);
          return;
        }
        fetchProducts(JSON.parse(data.data.customer.metafield.value));
      })
      .catch(console.error);
  }, []);

  function fetchProducts(productIds?: string[]) {
    fetch("shopify://storefront/api/unstable/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: productIds
        ? JSON.stringify(getProductsQuery(productIds))
        : JSON.stringify(getFirst3ProductsQuery()),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!productIds) {
          if (!data?.data?.products?.nodes) {
            setIsLoading(false);
            return;
          }
          setWishlist(data.data.products.nodes);
          setIsLoading(false);
          return;
        }
        if (!data?.data?.nodes) {
          setIsLoading(false);
          return;
        }
        setWishlist(data.data.nodes);
        setIsLoading(false);
      })
      .catch(console.error);
  }

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
      await fetchProducts(newWishlistItems);
      return Promise.resolve();
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

      await fetchProducts(newWishlistItems);
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
      <Heading level={1}>Wishlist</Heading>
      <BlockSpacer spacing="loose" />
      {!isLoading && wishlist.length === 0 && (
        <Card padding>
          <BlockStack inlineAlignment="center">
            <Heading level={2}>Your wishlist is empty</Heading>
            <Text>No items in your wishlist</Text>
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
          {isLoading && (
            <WishlistItem
              product={null}
              isLoading={isLoading}
              showRemoveButton={showRemoveButton as boolean}
              onRemoveClick={() => {}}
            />
          )}
          {!isLoading &&
            wishlist.map((product) => (
              <WishlistItem
                key={product.id}
                product={product}
                isLoading={false}
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
