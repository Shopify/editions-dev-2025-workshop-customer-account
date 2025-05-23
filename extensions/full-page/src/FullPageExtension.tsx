import { render } from "preact";
import { useState, useEffect, useReducer } from "preact/hooks";
import { Router, Route } from "preact-router";
import {
  useExtension,
  useApi,
  useNavigationCurrentEntry,
  useAuthenticatedAccountCustomer,
} from "@shopify/ui-extensions/customer-account/preact";

import { ProductsGrid } from "../../_shared/components/ProductsGrid";

import {
  fetchWishlistedProductIds,
  getProductsQuery,
  getFirst3ProductsQuery,
  getShopDataQuery,
  updateWishlistItems,
} from "../../_shared/graphql";
import { WishlistItem } from "./WishlistItem";

import type { Product, Shop } from "../../_shared/types";

addEventListener("popstate", (event) => {
  console.log("global popstate", event);
});

window.addEventListener("popstate", (event) => {
  console.log("window popstate", event);
});

console.log("### same?", window, globalThis, self);

export default function () {
  render(<WishlistedItems />, document.body);
}

function WishlistedItems() {
  const { editor } = useExtension();
  const { id: customerId } = useAuthenticatedAccountCustomer();
  const currentEntry = useNavigationCurrentEntry();

  console.log("currentEntry updated", currentEntry);
  // console.log("history", history);

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

    setWishlist(wishlist.filter((item) => item.id !== productIdToRemove));

    if (isInEditor) {
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

  const url = new URL(currentEntry?.url);
  const path = url.pathname;

  return (
    <s-page heading="Your Wishlist">
      {!loading && wishlist.length === 0 ? (
        <s-section>
          <s-stack alignItems="center">
            <s-heading>Your wishlist is empty</s-heading>
            <s-text>No items in your wishlist</s-text>
          </s-stack>
        </s-section>
      ) : (
        <>
          <Router>
            <Route path="/" component={HomeComponent} />
            <Route path="/test" component={TestComponent} />
          </Router>
          {loading ? (
            <s-stack gap="large" direction="inline" justifyContent="center">
              <s-spinner size="large" />
            </s-stack>
          ) : (
            <ProductsGrid>
              {wishlist.map((product) => (
                <WishlistItem
                  key={product.id}
                  product={product}
                  shopUrl={shopData.url}
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
          <s-link href="/test">Test</s-link>
          <s-link href="/foo">Foo</s-link>
          <s-link href="/">Home</s-link>
        </>
      )}
    </s-page>
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

function HomeComponent() {
  return <s-heading>Home</s-heading>;
}

function TestComponent() {
  return <s-heading>Test</s-heading>;
}
