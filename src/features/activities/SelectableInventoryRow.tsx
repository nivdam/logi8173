import { Badge, Grid, Stack, Text, chakra } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import type { InventoryItem } from "../../types"

export const SelectableInventoryRow = ({
  item,
  isSelected,
  onToggle,
}: SelectableInventoryRowProps) => {
  const handleClick = () => {
    onToggle(item.itemId)
  }

  return (
    <chakra.button
      type="button"
      width="full"
      textAlign="start"
      p="3"
      borderWidth="1px"
      borderColor={isSelected ? "forest.400" : "border"}
      bg={isSelected ? "forest.50" : "transparent"}
      borderRadius="lg"
      cursor="pointer"
      onClick={handleClick}
    >
      <Grid templateColumns="1fr auto" gap="3" alignItems="center">
        <Stack gap="0.5">
          <Text textStyle="sm" fontWeight="600">{item.name}</Text>
          <Text textStyle="xs" color="fg.muted">
            {item.itemNumber} · {item.currentQty} {item.unitOfMeasure}
          </Text>
        </Stack>
        <Badge colorPalette={isSelected ? "sage" : "gray"} variant="subtle">
          {isSelected ? t("activities.selected") : t("activities.select")}
        </Badge>
      </Grid>
    </chakra.button>
  )
}

type SelectableInventoryRowProps = {
  item: InventoryItem
  isSelected: boolean
  onToggle: (itemId: string) => void
}
