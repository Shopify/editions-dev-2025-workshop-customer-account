import {
  Button,
  Icon,
  Grid,
  View,
  BlockStack,
  InlineStack,
  Image,
  useApi,
  Card,
  SkeletonImage,
  SkeletonTextBlock,
  Text,
} from "@shopify/ui-extensions-react/customer-account";
import type { Product } from "./types";

type Props = {
  isLoading: boolean;
  product?: Product;
  showRemoveButton: boolean;
  onRemoveClick: () => void;
};

export default function WishlistItem({
  product,
  isLoading,
  showRemoveButton,
  onRemoveClick,
}: Props) {
  const { i18n } = useApi();

  if (isLoading || !product) {
    return (
      <View data-testid="loading-state">
        <Card padding>
          <BlockStack>
            <SkeletonTextBlock lines={2} size="extraLarge" />
            <SkeletonImage inlineSize="fill" blockSize={250} />
            <SkeletonTextBlock lines={3} />
            <SkeletonTextBlock lines={1} emphasis="bold" size="extraLarge" />
          </BlockStack>
        </Card>
      </View>
    );
  }

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
        <Button kind="secondary">
          <InlineStack spacing="extraTight" blockAlignment="center">
            <Icon source="cart"></Icon>
            <Text>Buy now</Text>
          </InlineStack>
        </Button>

        <Button
          kind="secondary"
          onPress={onRemoveClick}
          accessibilityLabel="Remove"
        >
          <Icon source="delete"></Icon>
        </Button>
      </Grid>
    </Grid>
  );
}
