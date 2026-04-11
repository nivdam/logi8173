import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { t } from "../../lib/i18n";

export const EmptySnapshotWarning = ({
  onChooseAnother,
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
    <Button variant="outline" size="sm" onClick={onChooseAnother}>
      <ArrowLeft size={16} />
      {t("issuance.chooseAnother")}
    </Button>
  </Box>
);

type EmptySnapshotWarningProps = {
  onChooseAnother: () => void;
};
