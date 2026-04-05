import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { Minus, Plus } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { getConditionLabel, CONDITION_COLOR, ITEM_CONDITIONS } from "./issuance.constants"
import type { ItemCondition } from "./issuance.types"

export const ItemSelectorRow = ({
  itemId,
  name,
  availableQty,
  selectedQty,
  condition,
  index,
  onUpdateQty,
  onChangeCondition,
}: Props) => {
  const isOutOfStock = availableQty <= 0
  const isSelected = selectedQty > 0

  const handleIncrement = () => {
    if (selectedQty < availableQty) {
      onUpdateQty(itemId, selectedQty + 1)
    }
  }

  const handleDecrement = () => {
    if (selectedQty > 0) {
      onUpdateQty(itemId, selectedQty - 1)
    }
  }

  const handleCycleCondition = () => {
    const currentIndex = ITEM_CONDITIONS.indexOf(condition)
    const nextCondition = ITEM_CONDITIONS[(currentIndex + 1) % ITEM_CONDITIONS.length]
    onChangeCondition(itemId, nextCondition)
  }

  return (
    <Flex
      align="center"
      gap="3"
      py="3"
      px="3"
      borderRadius="xl"
      bg={isSelected ? "sage.50" : undefined}
      opacity={isOutOfStock ? 0.5 : 1}
      css={{
        ...animations.listItem(index),
        transition: "background 0.15s ease",
      }}
    >
      <Box flex="1" minW="0">
        <Text textStyle="sm" fontWeight={isSelected ? "600" : "400"}>
          {name}
        </Text>
        <Flex gap="2" align="center">
          <Text textStyle="xs" color="fg.muted">
            {isOutOfStock
              ? t("issuance.outOfStock")
              : `${t("issuance.availableStock")}: ${availableQty}`}
          </Text>
          {isSelected && (
            <Button
              variant="ghost"
              size="xs"
              px="1.5"
              h="5"
              borderRadius="full"
              color={CONDITION_COLOR[condition]}
              onClick={handleCycleCondition}
              css={{ transition: "all 0.15s ease" }}
            >
              <Text textStyle="xs">{getConditionLabel(condition)}</Text>
            </Button>
          )}
        </Flex>
      </Box>

      <Flex align="center" gap="1">
        <Button
          aria-label={`${t("common.delete")} ${name}`}
          variant="ghost"
          size="xs"
          borderRadius="full"
          w="8"
          h="8"
          minW="8"
          onClick={handleDecrement}
          disabled={selectedQty <= 0}
        >
          <Minus size={14} />
        </Button>
        <Flex
          align="center"
          justify="center"
          w="8"
          h="8"
          borderRadius="lg"
          bg={isSelected ? "sage.600" : "bg.muted"}
          color={isSelected ? "white" : "fg.muted"}
          fontWeight="600"
          textStyle="sm"
          css={{ transition: "all 0.15s ease" }}
        >
          {selectedQty}
        </Flex>
        <Button
          aria-label={`${t("common.add")} ${name}`}
          variant="ghost"
          size="xs"
          borderRadius="full"
          w="8"
          h="8"
          minW="8"
          onClick={handleIncrement}
          disabled={isOutOfStock || selectedQty >= availableQty}
        >
          <Plus size={14} />
        </Button>
      </Flex>
    </Flex>
  )
}

type Props = {
  itemId: string
  name: string
  availableQty: number
  selectedQty: number
  condition: ItemCondition
  index: number
  onUpdateQty: (itemId: string, qty: number) => void
  onChangeCondition: (itemId: string, condition: ItemCondition) => void
}
