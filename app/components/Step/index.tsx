import {
  Box,
  Bleed,
  Button,
  Collapsible,
  InlineStack,
  Text,
  Tooltip,
  UnstyledButton,
  BlockStack,
} from "@shopify/polaris";

import { useState } from "react";

import styles from "./Step.module.css";
import { Unchecked } from "../Unchecked";
import { Checked } from "../Checked";

export type StepProps = {
  handle: string;
  title: string;
  description: string;
  actionTitle: string;
  actionLink: string;
  isComplete: boolean;
  isActive: boolean;
  onSetActive: (handle: string) => void;
  onNavigate?: () => void;
  expandableWhenComplete?: boolean;
};

export function Step({
  handle,
  title,
  description,
  actionTitle,
  actionLink,
  isComplete,
  isActive,
  onSetActive,
  onNavigate,
  expandableWhenComplete = true,
}: StepProps) {
  const tooltipContent = isComplete ? "Completed" : "Not Completed";

  return (
    <Bleed marginInline="200">
      <div
        className={`${styles.TaskContainer} ${
          isActive ? styles.TaskContainerActive : null
        }`}
      >
        <Box
          width="100%"
          padding="200"
          paddingBlockEnd={isActive ? "300" : "200"}
        >
          <InlineStack wrap={false} align="start" blockAlign="start" gap="200">
            <Tooltip
              activatorWrapper="span"
              preferredPosition="above"
              content={tooltipContent}
            >
              {isComplete ? <Checked /> : <Unchecked />}
            </Tooltip>
            <Box width="100%">
              <BlockStack gap="200">
                <UnstyledButton
                  onClick={() => onSetActive(handle)}
                  className={styles.UnstyledButton}
                >
                  <Text
                    as="p"
                    variant="bodyMd"
                    fontWeight={isActive ? "bold" : "regular"}
                  >
                    {title}
                  </Text>
                </UnstyledButton>
                <Collapsible
                  id="create"
                  open={isActive && (expandableWhenComplete || !isComplete)}
                >
                  <BlockStack gap="400">
                    <Text as="p" variant="bodyMd">
                      {description}
                    </Text>
                    <InlineStack>
                      {handle && (
                        <Button
                          submit
                          variant="primary"
                          url={actionLink}
                          onClick={() => onNavigate?.()}
                        >
                          {actionTitle}
                        </Button>
                      )}
                    </InlineStack>
                  </BlockStack>
                </Collapsible>
              </BlockStack>
            </Box>
          </InlineStack>
        </Box>
      </div>
    </Bleed>
  );
}
