import { memo } from "react"
import { Box, Button, Flex, Grid, Input, Text } from "@chakra-ui/react"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { StatusBadge } from "../../components/StatusBadge"
import { FilterSelect } from "../../components/FilterSelect"
import { getItemStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { CATEGORY_OPTIONS, UNIT_OPTIONS, getCategoryLabel } from "./inventory.constants"
import { useInventoryRowHandlers } from "./useInventoryRowHandlers"
import type { EditableRow, EditableField } from "./useEditableInventory"

const getCardColors = (
  changeType: EditableRow["changeType"],
  isExpanded: boolean,
): CardColors => {
  if (changeType === "modified") return { bg: "orange.50", borderColor: "orange.300" }
  if (changeType === "added") return { bg: "green.50", borderColor: "green.300" }
  return { bg: "bg.card", borderColor: isExpanded ? "forest.300" : "border" }
}

export const EditableInventoryCard = memo(function EditableInventoryCard({
  row,
  index,
  isExpanded,
  isReadOnly = false,
  onToggleExpand,
  onFieldChange,
  onDelete,
}: EditableInventoryCardProps) {
  const {
    handleToggle,
    handleNameChange,
    handleItemNumberChange,
    handleCategoryChange,
    handleQtyChange,
    handleUnitChange,
    handleMinThresholdChange,
    handleNotesChange,
    handleDeleteClick,
    stopPropagation,
  } = useInventoryRowHandlers({
    itemId: row.itemId,
    isReadOnly,
    onFieldChange,
    onDelete,
    onToggleExpand,
  })

  const compactColors = getCardColors(row.changeType, false)
  const expandedColors = getCardColors(row.changeType, true)

  if (!isExpanded) {
    return (
      <Box
        p="4"
        bg={compactColors.bg}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={compactColors.borderColor}
        cursor={isReadOnly ? "default" : "pointer"}
        onClick={handleToggle}
        css={{
          ...(isReadOnly ? {} : animations.cardHover),
          ...animations.listItem(index),
        }}
      >
        <Flex justify="space-between" align="start" mb="2">
          <Text textStyle="sm" fontWeight="600">{row.name}</Text>
          <Flex gap="2" align="center">
            <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
            {isReadOnly ? null : <ChevronDown size={14} color="var(--chakra-colors-fg-muted)" />}
          </Flex>
        </Flex>
        <Flex gap="4" flexWrap="wrap">
          <Flex direction="column">
            <Text textStyle="xs" color="fg.muted">{t("inventory.itemNumber")}</Text>
            <Text textStyle="sm">{row.itemNumber}</Text>
          </Flex>
          <Flex direction="column">
            <Text textStyle="xs" color="fg.muted">{t("inventory.category")}</Text>
            <Text textStyle="sm">{getCategoryLabel(row.category)}</Text>
          </Flex>
          <Flex direction="column">
            <Text textStyle="xs" color="fg.muted">{t("inventory.qty")}</Text>
            <Text textStyle="sm" fontWeight="500">{row.currentQty} {row.unitOfMeasure}</Text>
          </Flex>
        </Flex>
        {row.notes ? (
          <Flex direction="column" mt="3">
            <Text textStyle="xs" color="fg.muted">{t("inventory.notes")}</Text>
            <Text textStyle="sm">{row.notes}</Text>
          </Flex>
        ) : null}
      </Box>
    )
  }

  return (
    <Box
      p="4"
      bg={expandedColors.bg}
      borderRadius="xl"
      borderWidth="2px"
      borderColor={expandedColors.borderColor}
      css={{ transition: "border-color 0.2s ease" }}
    >
      <Flex justify="space-between" align="center" mb="3">
        <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
        <Flex gap="1">
          <Button
            size="xs"
            variant="ghost"
            color="red.500"
            minW="10"
            minH="10"
            onClick={handleDeleteClick}
            aria-label={t("inventory.deleteRow")}
          >
            <Trash2 size={16} />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color="fg.muted"
            minW="10"
            minH="10"
            onClick={handleToggle}
            aria-label={t("inventory.collapseRow")}
          >
            <ChevronUp size={16} />
          </Button>
        </Flex>
      </Flex>

      <Flex direction="column" gap="3" onClick={stopPropagation}>
        <Grid templateColumns="1fr 2fr" gap="3">
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.itemNumber")}</Text>
            <Input
              size="sm"
              borderRadius="md"
              bg="bg.card"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={row.itemNumber}
              onChange={handleItemNumberChange}
              placeholder={t("inventory.itemNumber")}
            />
          </Box>
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.name")}</Text>
            <Input
              size="sm"
              borderRadius="md"
              bg="bg.card"
              value={row.name}
              onChange={handleNameChange}
              placeholder={t("inventory.name")}
              autoFocus
            />
          </Box>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap="3">
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.qty")}</Text>
            <Input
              size="sm"
              borderRadius="md"
              bg="bg.card"
              type="number"
              inputMode="numeric"
              value={row.currentQty}
              onChange={handleQtyChange}
              min={0}
            />
          </Box>
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.minThreshold")}</Text>
            <Input
              size="sm"
              borderRadius="md"
              bg="bg.card"
              type="number"
              inputMode="numeric"
              value={row.minThreshold}
              onChange={handleMinThresholdChange}
              min={0}
            />
          </Box>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap="3">
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.unit")}</Text>
            <FilterSelect
              label={t("inventory.unit")}
              value={row.unitOfMeasure}
              options={UNIT_OPTIONS}
              onChange={handleUnitChange}
            />
          </Box>
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.category")}</Text>
            <FilterSelect
              label={t("inventory.category")}
              value={row.category}
              options={CATEGORY_OPTIONS}
              onChange={handleCategoryChange}
            />
          </Box>
        </Grid>

        <Box>
          <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.notes")}</Text>
          <Input
            size="sm"
            borderRadius="md"
            bg="bg.card"
            value={row.notes ?? ""}
            onChange={handleNotesChange}
            placeholder={t("inventory.notesPlaceholder")}
          />
        </Box>
      </Flex>
    </Box>
  )
})

type EditableInventoryCardProps = {
  row: EditableRow
  index: number
  isExpanded: boolean
  isReadOnly?: boolean
  onToggleExpand: (itemId: string) => void
  onFieldChange: (itemId: string, field: EditableField, value: string | number) => void
  onDelete: (itemId: string) => void
}

type CardColors = {
  bg: string
  borderColor: string
}
