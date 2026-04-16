import { Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react"
import { AlertTriangle } from "lucide-react"
import { t } from "../../lib/i18n"

export const ConfirmActivityStatusDialog = ({
  open,
  variant,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmActivityStatusDialogProps) => {
  const variantConfig = variant === "close"
    ? {
        bg: "red.100",
        color: "red.600",
        colorPalette: "red",
        title: t("activities.closeConfirmTitle"),
        body: t("activities.closeConfirmBody"),
        action: t("activities.closeConfirmAction"),
      }
    : {
        bg: "green.100",
        color: "green.600",
        colorPalette: "green",
        title: t("activities.reopenConfirmTitle"),
        body: t("activities.reopenConfirmBody"),
        action: t("activities.reopenConfirmAction"),
      }

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open && !isLoading) {
      onCancel()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p="6" borderRadius="2xl" maxW="sm" mx="4">
            <Flex align="center" gap="3" mb="4">
              <Flex
                align="center"
                justify="center"
                w="10"
                h="10"
                borderRadius="full"
                bg={variantConfig.bg}
                color={variantConfig.color}
                flexShrink={0}
              >
                <AlertTriangle size={20} />
              </Flex>
              <Dialog.Title fontSize="lg" fontWeight="600">
                {variantConfig.title}
              </Dialog.Title>
            </Flex>
            <Text textStyle="sm" color="fg.muted" mb="6">
              {variantConfig.body}
            </Text>
            <Flex gap="3" direction={{ base: "column", sm: "row-reverse" }}>
              <Button
                colorPalette={variantConfig.colorPalette}
                size="lg"
                borderRadius="lg"
                flex="1"
                loading={isLoading}
                onClick={onConfirm}
              >
                {variantConfig.action}
              </Button>
              <Button
                variant="outline"
                size="lg"
                borderRadius="lg"
                flex="1"
                onClick={onCancel}
              >
                {t("common.cancel")}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

type ConfirmActivityStatusDialogProps = {
  open: boolean
  variant: "close" | "reopen"
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}
