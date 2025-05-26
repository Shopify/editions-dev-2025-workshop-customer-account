import type { Product } from "../../_shared/types";
import { ProductItem } from "../../_shared/components/ProductItem";

type Props = {
  product: Product;
  onRemoveClick: () => void;
  shopUrl: string;
};

export function WishlistItem({ product, onRemoveClick, shopUrl }: Props) {
  return (
    <ProductItem
      image={product.images.nodes[0]?.url}
      title={product.title}
      price={product.priceRange.minVariantPrice}
      actions={
        <s-stack direction="block" gap="base">
          <s-button
            variant="primary"
            target="_blank"
            href={`${shopUrl}/products/${product.handle}`}
            inlineSize="fill"
          >
            Buy now
          </s-button>
          <s-button
            variant="secondary"
            onClick={onRemoveClick}
            inlineSize="fill"
          >
            Remove
          </s-button>
        </s-stack>
      }
    ></ProductItem>
  );
}
