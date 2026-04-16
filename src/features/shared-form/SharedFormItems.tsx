import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { Package } from "lucide-react"
import { t } from "../../lib/i18n"
import type { TransactionLineItem } from "../../types"

const conditionLabel = (condition: TransactionLineItem["condition"]): string => {
  const labels: Record<TransactionLineItem["condition"], string> = {
    new: t("sharedForm.conditionNew"),
    used: t("sharedForm.conditionUsed"),
    damaged: t("sharedForm.conditionDamaged"),
  }
  return labels[condition]
}

export const SharedFormItems = ({ items }: Props) => (
  <Box
    bg="bg.card"
    borderRadius="xl"
    borderWidth="1px"
    borderColor="border"
    overflow="hidden"
  >
    <Flex align="center" gap="2" px="4" py="3" bg="bg.muted">
      <Package size={16} color="var(--chakra-colors-fg-muted)" />
      <Text textStyle="xs" fontWeight="600" color="fg.muted" textTransform="uppercase">
        {t("sharedForm.items")} ({items.length})
      </Text>
    </Flex>
    <VStack gap="0" align="stretch">
      {items.map((item, index) => (
        <Flex
          key={`${item.itemId}-${index}`}
          direction="column"
          px="4"
          py="3"
          borderBottomWidth={index < items.length - 1 ? "1px" : "0"}
          borderColor="border"
          gap="1"
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="2">
              <Text textStyle="xs" color="fg.muted" fontWeight="600">
                {index + 1}.
              </Text>
              <Text textStyle="sm" fontWeight="500">
                {item.name}
              </Text>
            </Flex>
            <Text textStyle="sm" fontWeight="600" color="sage.600">
              x{item.qty} {item.unitOfMeasure || ""}
            </Text>
          </Flex>
          <Flex gap="3" wrap="wrap">
            {item.condition && (
              <Text textStyle="xs" color="fg.muted">
                {t("sharedForm.condition")}: {conditionLabel(item.condition)}
              </Text>
            )}
            {item.serialNumber && (
              <Text textStyle="xs" color="fg.muted">
                {t("sharedForm.serialNumber")}: {item.serialNumber}
              </Text>
            )}
            {item.notes && (
              <Text textStyle="xs" color="fg.muted">
                {t("sharedForm.notes")}: {item.notes}
              </Text>
            )}
          </Flex>
        </Flex>
      ))}
    </VStack>
  </Box>
)

type Props = {
  items: TransactionLineItem[]
}
