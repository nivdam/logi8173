import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { AlertTriangle } from "lucide-react"
import { t } from "../../lib/i18n"

export const SnapshotErrorState = ({ onRetry, onChooseAnother }: SnapshotErrorStateProps) => (
  <Box
    mt="3"
    p="4"
    bg="red.50"
    borderWidth="1px"
    borderColor="red.200"
    borderRadius="xl"
  >
    <Flex align="center" gap="3" mb="3">
      <AlertTriangle size={20} color="var(--chakra-colors-red-500)" />
      <Text textStyle="sm" fontWeight="600" color="red.700">
        {t("issuance.snapshotLoadError")}
      </Text>
    </Flex>
    <Flex gap="2">
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t("common.retry")}
      </Button>
      <Button variant="ghost" size="sm" onClick={onChooseAnother}>
        {t("issuance.chooseAnother")}
      </Button>
    </Flex>
  </Box>
)

type SnapshotErrorStateProps = {
  onRetry: () => void
  onChooseAnother: () => void
}
