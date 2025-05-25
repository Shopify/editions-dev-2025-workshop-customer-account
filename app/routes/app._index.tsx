import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { Page, Card, Layout } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { Step } from "app/components/Step";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

const APP_ID = "YOU_APP_ID_HERE";

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
        "Allow buyers to manage their wishlist. Add it now to customer accounts.",
      actionTitle: "Add in the editor",
      actionLink: `shopify://admin/settings/checkout/editor`,
      isComplete: completeOverrides["activated-extension"],
      onNavigate: () => {
        // To do: update this with a check for the extension being installed, once that's available
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
              ></Step>
            ))}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
