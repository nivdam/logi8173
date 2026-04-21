import { Button, Grid, Input, Text } from "@chakra-ui/react"
import { Trash2 } from "lucide-react"
import { StatusBadge } from "../../components/StatusBadge"
import { FilterSelect } from "../../components/FilterSelect"
import { getItemStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { CATEGORY_OPTIONS, getCategoryLabel } from "./inventory.constants"
import type { EditableRow, EditableField } from "./useEditableInventory"

const getRowBackground = (changeType: EditableRow["changeType"]): string | undefined => {
  if (changeType === "modified") return "orange.50"
  if (changeType === "added") return "green.50"
  return undefined
}

export const EditableInventoryRow = ({
  row,
  index,
  isEditing,
  onFieldChange,
  onDelete,
}: EditableInventoryRowProps) => {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(row.itemId, "name", event.currentTarget.value)
  }

  const handleItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(row.itemId, "itemNumber", event.currentTarget.value)
  }

  const handleCategoryChange = (value: string | undefined) => {
    if (value) {
      onFieldChange(row.itemId, "category", value)
    }
  }

  const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsedQuantity = parseInt(event.currentTarget.value, 10)
    if (!Number.isNaN(parsedQuantity) && parsedQuantity >= 0) {
      onFieldChange(row.itemId, "currentQty", parsedQuantity)
    }
  }

  const handleDeleteClick = () => {
    onDelete(row.itemId)
  }

  if (!isEditing) {
    return (
      <Grid
        templateColumns="2fr 1fr 1fr 1fr 1fr"
        gap="3"
        py="3"
        px="4"
        borderBottomWidth="1px"
        borderColor="border"
        role="row"
        cursor="pointer"
        css={{
          ...animations.listItem(index),
          transition: "background 0.15s ease, transform 0.15s ease",
          "&:hover": { background: "var(--chakra-colors-bg-muted)", transform: "scale(1.005)" },
        }}
      >
        <Text textStyle="sm" fontWeight="500" role="cell">{row.name}</Text>
        <Text textStyle="sm" color="fg.muted" role="cell">{row.itemNumber}</Text>
        <Text textStyle="sm" color="fg.muted" role="cell">{getCategoryLabel(row.category)}</Text>
        <Text textStyle="sm" fontWeight="500" role="cell">{row.currentQty} {row.unitOfMeasure}</Text>
        <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
      </Grid>
    )
  }

  return (
    <Grid
      templateColumns="2fr 1fr 1fr 1fr 1fr auto"
      gap="2"
      py="2"
      px="4"
      borderBottomWidth="1px"
      borderColor="border"
      role="row"
      alignItems="center"
      bg={getRowBackground(row.changeType)}
      css={{
        transition: "background 0.2s ease",
      }}
    >
      <Input
        size="sm"
        borderRadius="md"
        value={row.name}
        onChange={handleNameChange}
        placeholder="שם הפריט"
      />
      <Input
        size="sm"
        borderRadius="md"
        value={row.itemNumber}
        onChange={handleItemNumberChange}
        placeholder="מק״ט"
      />
      <FilterSelect
        label="קטגוריה"
        value={row.category}
        options={CATEGORY_OPTIONS}
        onChange={handleCategoryChange}
      />
      <Input
        size="sm"
        borderRadius="md"
        type="number"
        inputMode="numeric"
        value={row.currentQty}
        onChange={handleQtyChange}
        min={0}
      />
      <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
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
    </Grid>
  )
}

type EditableInventoryRowProps = {
  row: EditableRow
  index: number
  isEditing: boolean
  onFieldChange: (itemId: string, field: EditableField, value: string | number) => void
  onDelete: (itemId: string) => void
}
