import {
  ResourceItem,
  ImageGroup,
  Button,
  View,
  BlockStack,
  Heading,
  InlineStack,
  Image,
  useApi,
  Card,
  SkeletonImage,
  SkeletonTextBlock,
} from "@shopify/ui-extensions-react/customer-account";
import { Product } from "./types";

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
    <ResourceItem
      key={product.id}
      accessibilityLabel={product.title}
      onPress={() => {}}
      actionLabel={showRemoveButton ? "Remove" : undefined}
      action={
        showRemoveButton && (
          <Button kind="primary" appearance="critical" onPress={onRemoveClick}>
            Remove
          </Button>
        )
      }
    >
      <ImageGroup totalItems={1}>
        {product.images.nodes[0]?.url ? (
          <Image source={product.images.nodes[0]?.url} />
        ) : null}
      </ImageGroup>
      <View padding={["tight", "none"]}>
        <BlockStack spacing="extraTight">
          <Heading level={3}>{product.title}</Heading>

          <InlineStack blockAlignment="center">
            {product?.priceRange ? (
              <Heading level={3}>
                {i18n.formatCurrency(
                  Number(product.priceRange.minVariantPrice.amount),
                  {
                    currency: product.priceRange.minVariantPrice.currencyCode,
                    currencyDisplay: "narrowSymbol",
                  },
                )}
              </Heading>
            ) : null}
          </InlineStack>
        </BlockStack>
      </View>
    </ResourceItem>
  );
}
