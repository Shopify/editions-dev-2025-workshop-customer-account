import {
  Button,
  Icon,
  Grid,
  InlineStack,
  Text,
} from "@shopify/ui-extensions-react/customer-account";
import type { Product } from "../../_shared/types";
import { ProductItem } from "../../_shared/components/ProductItem";

type Props = {
  product: Product;
  showRemoveButton: boolean;
  onRemoveClick: () => void;
  shopUrl: string;
};

export default function WishlistItem({
  product,
  showRemoveButton,
  onRemoveClick,
  shopUrl,
}: Props) {
  return (
    <ProductItem
      image={product.images.nodes[0]?.url}
      title={product.title}
      price={product.priceRange.minVariantPrice}
      actions={
        <Grid columns={["fill", "auto"]} spacing={"tight"}>
          <Button kind="secondary" to={`${shopUrl}/products/${product.handle}`}>
            <InlineStack spacing="extraTight" blockAlignment="center">
              <Icon source="cart"></Icon>
              <Text>Buy now</Text>
            </InlineStack>
          </Button>

          {showRemoveButton && (
            <Button
              kind="secondary"
              onPress={onRemoveClick}
              accessibilityLabel={"Remove"}
            >
              <Icon source="delete"></Icon>
            </Button>
          )}
        </Grid>
      }
    />
  );
}
