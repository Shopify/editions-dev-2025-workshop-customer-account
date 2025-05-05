import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { Page, Text, Banner, Link } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useEffect } from "react";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query customerAccountSettings {
      shop {
        customerAccountsV2 {
          customerAccountsVersion
        }
      }
      checkoutProfiles(first: 1, query: "(is_published:true)") {
        nodes {
          id
          typOspPagesActive
        }
      }
    }`,
  );
  const responseJson = await response.json();

  const isUsingCustomerAccounts =
    responseJson.data?.shop?.customerAccountsV2?.customerAccountsVersion ===
    "NEW_CUSTOMER_ACCOUNTS";

  const isUsingNewTypOsp =
    responseJson.data?.checkoutProfiles?.nodes?.[0].typOspPagesActive;

  return {
    isUsingCustomerAccounts,
    isUsingNewTypOsp,
  };
};

export default function Index() {
  const { isUsingCustomerAccounts, isUsingNewTypOsp } =
    useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  useEffect(() => {
    const handleFocus = () => {
      revalidator.revalidate();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [revalidator]);

  return (
    <Page>
      <TitleBar title="Customer Account Wishlist" />
      {!isUsingCustomerAccounts && (
        <Banner
          tone="warning"
          title={`Upgrade to the new version of customer accounts`}
        >
          <Text as="p">
            You are still using legacy customer account. Please update to the{" "}
            <Link
              target="_blank"
              url="https://admin.shopify.com/settings/customer_accounts"
            >
              new version of customer accounts
            </Link>{" "}
            to use this app.
          </Text>
        </Banner>
      )}

      {!isUsingNewTypOsp && (
        <Banner
          tone="warning"
          title="You are still using the legacy Thank you and order status pages. Please update to the new version of these pages to use this app."
        />
      )}
    </Page>
  );
}
