import {
  useSettings,
  useExtension,
  useAuthenticatedAccountCustomer,
} from "@shopify/ui-extensions/customer-account/preact";

import { ProductsGrid } from "../../_shared/components/ProductsGrid";
import { ProductItem } from "../../_shared/components/ProductItem";
import { useEffect, useState, useRef } from "preact/hooks";
import {
  fetchWishlistedProductIds,
  getProductsByTagQuery,
  updateWishlistItems,
} from "../../_shared/graphql";
import type { Product } from "../../_shared/types";
import { render } from "preact";

export default async function () {
  const { product_tag: productTag } = shopify.settings.current;

  const products = productTag
    ? await fetchProductsByTag(productTag as string)
    : [];

  render(<OrderListPageExtension initialProducts={products} />, document.body);
}

function OrderListPageExtension({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const { id: customerId } = useAuthenticatedAccountCustomer();
  const [suggestedProducts, setSuggestedProducts] =
    useState<Product[]>(initialProducts);
  const isInEditor = useExtension().editor?.type === "checkout";
  const isFirstRender = useRef(true);

  const { product_tag: productTag } = useSettings();

  useEffect(() => {
    // since we have initial products, we don't need to fetch them the first time
    // only if the product tag changes
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // this could be debounced in the editor because it is being called on every keystroke
    async function run() {
      if (!productTag) {
        setSuggestedProducts([]);
        return;
      }
      const products = await fetchProductsByTag(productTag as string);
      setSuggestedProducts(products);
    }
    run();
  }, [productTag]);

  async function addToWishlist(productId: string) {
    const wishlist = await fetchWishlistedProductIds();
    const newWishlist = Array.from(new Set([productId, ...wishlist]));

    await updateWishlistItems(customerId, newWishlist);

    shopify.ui.toast.show("Product added to wishlist");
  }

  if (isInEditor && !productTag) {
    return (
      <s-banner tone="critical">
        Please set a product tag in the extension settings to display products.
        This message will only be shown in the editor.
      </s-banner>
    );
  }

  if (suggestedProducts.length === 0 && isInEditor && productTag) {
    return (
      <s-banner tone="warning">
        No products found for the selected tag. This message will only be shown
        in the editor.
      </s-banner>
    );
  }

  if (suggestedProducts.length === 0) {
    return null;
  }
  return (
    <s-stack direction="block" gap="base">
      <s-heading>Products we think you'll love</s-heading>
      <ProductsGrid>
        {suggestedProducts.map((product) => (
          <ProductItem
            key={product.id}
            image={product.images.nodes[0].url}
            title={product.title}
            price={product.priceRange.minVariantPrice}
            actions={
              <s-box inlineSize="100%">
                <s-button
                  inlineSize="fill"
                  variant="secondary"
                  onClick={() => {
                    if (isInEditor) {
                      return;
                    }
                    addToWishlist(product.id);
                  }}
                >
                  Add to Wishlist
                </s-button>
              </s-box>
            }
          />
        ))}
      </ProductsGrid>
    </s-stack>
  );
}

async function fetchProductsByTag(tag: string) {
  const response = await fetch(
    "shopify://storefront/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getProductsByTagQuery(tag)),
    },
  );

  const data = await response.json();
  return data.data.products.nodes;
}
