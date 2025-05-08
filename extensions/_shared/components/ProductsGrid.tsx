import React from "react";
import {
  Card,
  Grid,
  Style,
} from "@shopify/ui-extensions-react/customer-account";

export function ProductsGrid({ children }: { children: React.ReactNode }) {
  return (
    <Card padding>
      <Grid
        columns={Style.default(["fill"])
          .when({ viewportInlineSize: { min: "extraSmall" } }, ["fill", "fill"])
          .when({ viewportInlineSize: { min: "small" } }, [
            "fill",
            "fill",
            "fill",
          ])
          .when({ viewportInlineSize: { min: "medium" } }, [
            "fill",
            "fill",
            "fill",
            "fill",
          ])}
        spacing="loose"
        rows="auto"
      >
        {children}
      </Grid>
    </Card>
  );
}
