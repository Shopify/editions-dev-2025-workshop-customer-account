import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import {
  Page,
  Text,
  Link,
  Button,
  UnstyledButton,
  Card,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useEffect, useState, useCallback } from "react";
import { Step } from "app/components/Step";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {};
};

export default function Index() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Page title="Welcome!">
      <Card>
        <Step
          handle="step-1"
          title="Upgrade to new customer accounts"
          description="You are still using legacy customer accounts. Please upgrade to the new version to use this app."
          actionTitle="Upgrade"
          actionLink="/step-2"
          isActive={activeStep === 0}
          onSetActive={() => setActiveStep(0)}
        ></Step>
        <Step
          handle="step-2"
          title="Add to customer accounts"
          description="Add the app to your customer accounts"
          actionTitle="Add"
          actionLink="/step-3"
          isActive={activeStep === 1}
          isComplete={true}
          onSetActive={() => setActiveStep(1)}
        ></Step>
      </Card>
    </Page>
  );
}
