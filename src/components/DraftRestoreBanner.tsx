import { Button, Flex, Text } from "@chakra-ui/react"
import { RotateCcw, Trash2 } from "lucide-react"
import { t } from "../lib/i18n"

export const DraftRestoreBanner = ({ onRestore, onDiscard }: DraftRestoreBannerProps) => (
  <Flex
    align="center"
    justify="space-between"
    gap="3"
    p="3"
    bg="bg.muted"
    borderWidth="1px"
    borderColor="border"
    borderRadius="lg"
  >
    <Text textStyle="sm" fontWeight="500" color="fg">
      {t("draft.title")}
    </Text>
    <Flex gap="2" flexShrink={0}>
      <Button
        size="xs"
        variant="solid"
        colorPalette="primary"
        onClick={onRestore}
      >
        <RotateCcw />
        {t("draft.restore")}
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={onDiscard}
      >
        <Trash2 />
        {t("draft.discard")}
      </Button>
    </Flex>
  </Flex>
)

type DraftRestoreBannerProps = {
  onRestore: () => void
  onDiscard: () => void
}
