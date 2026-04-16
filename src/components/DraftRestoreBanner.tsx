import { Button, Flex, Text } from "@chakra-ui/react"
import { RotateCcw, Trash2 } from "lucide-react"

export const DraftRestoreBanner = ({ onRestore, onDiscard }: DraftRestoreBannerProps) => (
  <Flex
    align="center"
    justify="space-between"
    gap="3"
    p="3"
    bg="blue.subtle"
    borderWidth="1px"
    borderColor="blue.muted"
    borderRadius="lg"
  >
    <Text textStyle="sm" fontWeight="500" color="fg">
      נמצאה טיוטה שמורה
    </Text>
    <Flex gap="2" flexShrink={0}>
      <Button
        size="xs"
        variant="solid"
        colorPalette="blue"
        onClick={onRestore}
      >
        <RotateCcw />
        שחזר טיוטה
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={onDiscard}
      >
        <Trash2 />
        התחל מחדש
      </Button>
    </Flex>
  </Flex>
)

type DraftRestoreBannerProps = {
  onRestore: () => void
  onDiscard: () => void
}
