import {
  Button,
  Icon,
  Grid,
  InlineStack,
  Image,
  useApi,
  Text,
} from "@shopify/ui-extensions-react/customer-account";
import type { Product } from "./types";

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
  const { i18n } = useApi();

  return (
    <Grid
      rows={["auto", "fill", "auto", "auto"]}
      cornerRadius={"base"}
      padding={"base"}
      background={"subdued"}
      spacing={"base"}
    >
      {product.images.nodes[0]?.url ? (
        <Image
          cornerRadius={"tight"}
          // todo placeholder image if no image is available
          source={product.images.nodes[0]?.url}
          fit="cover"
          aspectRatio={1}
        />
      ) : null}

      <Text>{product.title}</Text>
      <Text>
        {product.priceRange
          ? i18n.formatCurrency(
              Number(product.priceRange.minVariantPrice.amount),
              {
                currency: product.priceRange.minVariantPrice.currencyCode,
                currencyDisplay: "narrowSymbol",
              },
            )
          : null}
      </Text>
      <Grid columns={["fill", "auto"]} spacing={"tight"}>
        <Button kind="secondary" to={`${shopUrl}/products/${product.handle}`}>
          <InlineStack spacing="extraTight" blockAlignment="center">
            <Icon source="cart"></Icon>
            <Text>{i18n.translate("buyNow")}</Text>
          </InlineStack>
        </Button>

        {showRemoveButton && (
          <Button
            kind="secondary"
            onPress={onRemoveClick}
            accessibilityLabel={i18n.translate("remove")}
          >
            <Icon source="delete"></Icon>
          </Button>
        )}
      </Grid>
    </Grid>
  );
}
