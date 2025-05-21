import type { ComponentChildren } from "preact";

type Props = {
  image: string;
  title: string;
  price?: { amount: number; currencyCode: string };
  actions?: ComponentChildren;
};

export function ProductItem({ image, title, price, actions }: Props) {
  return (
    <s-section>
      <s-stack
        direction="block"
        minInlineSize="250px"
        maxInlineSize="250px"
        gap="base"
      >
        {image ? (
          <s-image
            borderRadius="small"
            // todo placeholder image if no image is available
            src={image}
            objectFit="cover"
            aspectRatio={"1"}
          />
        ) : null}

        <s-box minBlockSize="45px">
          <s-text>{title}</s-text>
        </s-box>
        <s-text>
          {price
            ? shopify.i18n.formatCurrency(Number(price.amount), {
                currency: price.currencyCode,
                currencyDisplay: "narrowSymbol",
              })
            : null}
        </s-text>
        {actions}
      </s-stack>
    </s-section>
  );
}
