import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { t } from "../../lib/i18n";

export const EmptySnapshotWarning = ({
  onAddInventory,
}: EmptySnapshotWarningProps) => (
  <Box
    mt="3"
    p="4"
    bg="orange.50"
    borderWidth="1px"
    borderColor="orange.200"
    borderRadius="xl"
  >
    <Flex align="center" gap="3" mb="3">
      <AlertTriangle size={20} color="var(--chakra-colors-orange-500)" />
      <Text textStyle="sm" fontWeight="600" color="orange.700">
        {t("issuance.emptySnapshot")}
      </Text>
    </Flex>
    <Flex gap="2" wrap="wrap">
      <Button size="sm" colorPalette="sage" onClick={onAddInventory}>
        {t("activities.addInventoryAction")}
      </Button>
    </Flex>
  </Box>
);

type EmptySnapshotWarningProps = {
  onAddInventory: () => void;
};
