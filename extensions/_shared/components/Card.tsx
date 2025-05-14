import type { ComponentChildren } from "preact";

export function Card({ children }: { children: ComponentChildren }) {
  return (
    <s-section>
      <s-box
        borderRadius="small"
        maxInlineSize="400px"
        borderWidth="base"
        borderStyle="solid"
        padding="base"
        background="subdued"
      >
        {children}
      </s-box>
    </s-section>
  );
}
