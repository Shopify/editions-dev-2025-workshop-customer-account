import {
  Grid,
  Image,
  useApi,
  Text,
} from "@shopify/ui-extensions-react/customer-account";

type Props = {
  image: string;
  title: string;
  price?: { amount: number; currencyCode: string };
  actions?: React.ReactNode;
};

export function ProductItem({ image, title, price, actions }: Props) {
  const { i18n } = useApi();

  return (
    <Grid
      rows={["auto", "fill", "auto", "auto"]}
      cornerRadius="base"
      padding="base"
      spacing="base"
      background="subdued"
    >
      {image ? (
        <Image
          cornerRadius="tight"
          // todo placeholder image if no image is available
          source={image}
          fit="cover"
          aspectRatio={1}
        />
      ) : null}

      <Text>{title}</Text>
      <Text>
        {price
          ? i18n.formatCurrency(Number(price.amount), {
              currency: price.currencyCode,
              currencyDisplay: "narrowSymbol",
            })
          : null}
      </Text>
      {actions}
    </Grid>
  );
}
