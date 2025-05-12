import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { Page, Card, Text, Layout } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useEffect, useState } from "react";
import { Step } from "app/components/Step";
import { TitleBar } from "@shopify/app-bridge-react";

const APP_ID = "242741477377";

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
     
    }`,
  );
  const responseJson = await response.json();

  const isUsingCustomerAccounts =
    responseJson.data?.shop?.customerAccountsV2?.customerAccountsVersion ===
    "NEW_CUSTOMER_ACCOUNTS";

  return {
    isUsingCustomerAccounts,
  };
};

export default function Index() {
  const { isUsingCustomerAccounts } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [completeOverrides, setCompleteOverrides] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const handleFocus = () => {
      revalidator.revalidate();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [revalidator]);

  const steps = [
    {
      handle: "new-customer-accounts",
      title: "Upgrade to new customer accounts",
      description:
        "You are still using legacy customer accounts. Please upgrade to the new version to use this app.",
      actionTitle: "Upgrade",
      actionLink: "shopify://admin/settings/customer_accounts",
      isComplete: isUsingCustomerAccounts,
      expandableWhenComplete: false,
    },
    {
      handle: "activated-extension",
      title: "Add to customer accounts",
      description:
        "Allow buyers to manage their whishlist. Add it now to customer accounts.",
      actionTitle: "Add",
      actionLink: `shopify://admin/settings/checkout/editor?page=order-list&context=apps&app=${APP_ID}&collection=wishlist-collection`,
      isComplete: completeOverrides["activated-extension"],
      onNavigate: () => {
        setCompleteOverrides((prev) => ({
          ...prev,
          "activated-extension": true,
        }));
      },
    },
  ];

  const [activeStep, setActiveStep] = useState(
    steps.find((step) => !step.isComplete)?.handle,
  );

  return (
    <Page title="Wishlist Onboarding">
      <TitleBar title="Customer Account Wishlist" />
      <Layout>
        <Layout.Section>
          <Card padding="500">
            {steps.map((step) => (
              <Step
                key={step.handle}
                {...step}
                onSetActive={() => setActiveStep(step.handle)}
                isActive={activeStep === step.handle}
                isComplete={step.isComplete}
              ></Step>
            ))}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
