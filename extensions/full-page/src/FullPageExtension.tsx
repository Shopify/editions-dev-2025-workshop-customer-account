import {
  reactExtension,
  Heading,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.page.render", () => (
  <FullPageExtension />
));

function FullPageExtension() {
  return <Heading level={1}>Full Page Extension</Heading>;
}
