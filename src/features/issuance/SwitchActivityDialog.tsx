import { Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { t } from "../../lib/i18n";

export const SwitchActivityDialog = ({
  open,
  onConfirm,
  onCancel,
}: SwitchActivityDialogProps) => {
  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open) onCancel();
  };

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
                bg="orange.100"
                color="orange.600"
                flexShrink={0}
              >
                <AlertTriangle size={20} />
              </Flex>
              <Dialog.Title fontSize="lg" fontWeight="600">
                {t("issuance.switchActivityTitle")}
              </Dialog.Title>
            </Flex>
            <Text textStyle="sm" color="fg.muted" mb="6">
              {t("issuance.switchActivityBody")}
            </Text>
            <Flex gap="3" direction={{ base: "column", sm: "row-reverse" }}>
              <Button
                colorPalette="red"
                size="lg"
                borderRadius="lg"
                flex="1"
                onClick={onConfirm}
              >
                {t("issuance.switchActivityConfirm")}
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
  );
};

type SwitchActivityDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
