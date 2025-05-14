import { useApi } from "@shopify/ui-extensions/customer-account/preact";
import type { Product } from "../../_shared/types";
import { ProductItem } from "../../_shared/components/ProductItem";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

type Props = {
  product: Product;
  showRemoveButton: boolean;
  onRemoveClick: () => void;
  shopUrl: string;
};

export function WishlistItem({
  product,
  showRemoveButton,
  onRemoveClick,
  shopUrl,
}: Props) {
  const { i18n } = useApi();

  return (
    <ProductItem
      image={product.images.nodes[0]?.url}
      title={product.title}
      price={product.priceRange.minVariantPrice}
      actions={
        <s-stack direction="inline" justifyContent="center" gap="base">
          <s-button
            variant="secondary"
            href={`${shopUrl}/products/${product.handle}`}
          >
            Buy now
          </s-button>
          {showRemoveButton ? (
            <s-button variant="secondary" onClick={onRemoveClick}>
              Remove
            </s-button>
          ) : null}
        </s-stack>
      }
    ></ProductItem>
  );
}
