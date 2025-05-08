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
  Spinner,
  Icon,
} from "@shopify/polaris";

import { CheckCircleIcon, AlertCircleIcon } from "@shopify/polaris-icons";
import { useState } from "react";

import styles from "./Step.module.css";

export function Step({
  handle,
  title,
  description,
  actionTitle,
  actionLink,
  codeBlock,
  isComplete,
  onSetComplete,
  isActive,
  isLoading,
  isDisabled,
  onSetActive,
  onNavigate,
}: any) {
  const [isCompleted, setIsCompleted] = useState(isComplete);

  const handleClick = () => {
    setIsCompleted(!isCompleted);
  };

  const tooltipContent = isCompleted ? "Completed" : "Not Completed";

  console.log({ isCompleted, isLoading });

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
              <UnstyledButton
                onClick={() => handleClick()}
                className={styles.UnstyledButton}
                disabled={isDisabled}
              >
                {isLoading ? (
                  <div className={styles.SpinnerContainer}>
                    <Spinner size="small" />
                  </div>
                ) : isCompleted ? (
                  <Icon source={CheckCircleIcon} tone="base" />
                ) : (
                  <Icon source={AlertCircleIcon} tone="base" />
                )}
              </UnstyledButton>
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
                <Collapsible id="create" open={isActive}>
                  <BlockStack gap="400">
                    <Text as="p" variant="bodyMd">
                      {description}
                    </Text>
                    {codeBlock && (
                      <Box
                        background="bg-fill-active"
                        padding="400"
                        borderRadius="400"
                        borderWidth="0165"
                        borderColor="border"
                      >
                        <Text as="span" variant="bodyMd">
                          {codeBlock}
                        </Text>
                      </Box>
                    )}
                    <InlineStack>
                      {handle && (
                        <Button
                          submit
                          variant="primary"
                          url={actionLink}
                          onClick={actionLink ? undefined : () => onNavigate()}
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
