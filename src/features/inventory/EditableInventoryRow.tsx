import { Box, Button, Flex, Grid, Input, Stack, Text } from "@chakra-ui/react"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { StatusBadge } from "../../components/StatusBadge"
import { FilterSelect } from "../../components/FilterSelect"
import { getItemStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { CATEGORY_OPTIONS, UNIT_OPTIONS, getCategoryLabel } from "./inventory.constants"
import { useInventoryRowHandlers } from "./useInventoryRowHandlers"
import type { EditableRow, EditableField } from "./useEditableInventory"

const getRowBackground = (changeType: EditableRow["changeType"]): string | undefined => {
  if (changeType === "modified") return "orange.50"
  if (changeType === "added") return "green.50"
  return undefined
}

export const EditableInventoryRow = ({
  row,
  index,
  isExpanded,
  isReadOnly = false,
  onToggleExpand,
  onFieldChange,
  onDelete,
}: EditableInventoryRowProps) => {
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

  const rowBackground = getRowBackground(row.changeType)

  if (!isExpanded) {
    return (
      <Grid
        templateColumns="2fr 1fr 1fr 1fr 1fr auto"
        gap="3"
        py="3"
        px="4"
        borderBottomWidth="1px"
        borderColor="border"
        role="row"
        cursor={isReadOnly ? "default" : "pointer"}
        bg={rowBackground}
        onClick={handleToggle}
        alignItems="center"
        css={{
          ...animations.listItem(index),
          transition: "background 0.15s ease",
          "&:hover": isReadOnly
            ? undefined
            : { background: rowBackground ?? "var(--chakra-colors-bg-muted)" },
        }}
      >
        <Text textStyle="sm" fontWeight="500" role="cell">{row.name}</Text>
        <Text
          textStyle="sm"
          color="fg.muted"
          role="cell"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {row.notes}
        </Text>
        <Text textStyle="sm" color="fg.muted" role="cell">{getCategoryLabel(row.category)}</Text>
        <Text textStyle="sm" fontWeight="500" role="cell">{row.currentQty} {row.unitOfMeasure}</Text>
        <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
        {isReadOnly ? <span /> : <ChevronDown size={14} color="var(--chakra-colors-fg-muted)" />}
      </Grid>
    )
  }

  return (
    <Stack
      gap="2"
      py="2"
      px="4"
      borderBottomWidth="1px"
      borderColor="border"
      role="row"
      bg={rowBackground}
      css={{ transition: "background 0.2s ease" }}
    >
      <Grid
        templateColumns="2fr 1fr 1fr 1.2fr 1fr auto"
        gap="2"
        alignItems="center"
      >
        <Input
          size="sm"
          borderRadius="md"
          value={row.name}
          onChange={handleNameChange}
          onClick={stopPropagation}
          placeholder={t("inventory.name")}
          autoFocus
        />
        <Input
          size="sm"
          borderRadius="md"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={row.itemNumber}
          onChange={handleItemNumberChange}
          onClick={stopPropagation}
          placeholder={t("inventory.itemNumber")}
        />
        <Box onClick={stopPropagation}>
          <FilterSelect
            label={t("inventory.category")}
            value={row.category}
            options={CATEGORY_OPTIONS}
            onChange={handleCategoryChange}
          />
        </Box>
        <Flex gap="1" onClick={stopPropagation}>
          <Input
            size="sm"
            borderRadius="md"
            type="number"
            inputMode="numeric"
            value={row.currentQty}
            onChange={handleQtyChange}
            min={0}
            flex="1"
          />
          <Box minW="24">
            <FilterSelect
              label={t("inventory.unit")}
              value={row.unitOfMeasure}
              options={UNIT_OPTIONS}
              onChange={handleUnitChange}
            />
          </Box>
        </Flex>
        <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
        <Flex gap="1">
          <Button
            size="xs"
            variant="ghost"
            color="red.500"
            minW="8"
            minH="8"
            p="0"
            onClick={handleDeleteClick}
            aria-label={t("inventory.deleteRow")}
          >
            <Trash2 size={14} />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color="fg.muted"
            minW="8"
            minH="8"
            p="0"
            onClick={handleToggle}
            aria-label={t("inventory.collapseRow")}
          >
            <ChevronUp size={14} />
          </Button>
        </Flex>
      </Grid>

      <Flex gap="3" align="center" pl="1" flexWrap="wrap" onClick={stopPropagation}>
        <Flex gap="2" align="center">
          <Text textStyle="xs" color="fg.muted" whiteSpace="nowrap">
            {t("inventory.minThreshold")}
          </Text>
          <Input
            size="sm"
            borderRadius="md"
            type="number"
            inputMode="numeric"
            value={row.minThreshold}
            onChange={handleMinThresholdChange}
            min={0}
            w="20"
          />
        </Flex>
        <Flex gap="2" align="center" flex="1" minW="48">
          <Text textStyle="xs" color="fg.muted" whiteSpace="nowrap">
            {t("inventory.notes")}
          </Text>
          <Input
            size="sm"
            borderRadius="md"
            value={row.notes ?? ""}
            onChange={handleNotesChange}
            placeholder={t("inventory.notesPlaceholder")}
          />
        </Flex>
      </Flex>
    </Stack>
  )
}

type EditableInventoryRowProps = {
  row: EditableRow
  index: number
  isExpanded: boolean
  isReadOnly?: boolean
  onToggleExpand: (itemId: string) => void
  onFieldChange: (itemId: string, field: EditableField, value: string | number) => void
  onDelete: (itemId: string) => void
}
