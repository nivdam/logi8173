import { Flex, Grid } from "@chakra-ui/react"
import { SortableHeader, type SortConfig } from "../../components/SortableHeader"
import { t } from "../../lib/i18n"
import { EditableInventoryRow } from "./EditableInventoryRow"
import { EditableInventoryCard } from "./EditableInventoryCard"
import type { InventoryItem } from "../../types"
import type { EditableRow, EditableField } from "./useEditableInventory"

const toEditableRow = (item: InventoryItem): EditableRow => ({
  ...item,
  changeType: "unchanged",
})

export const InventoryTable = ({
  items,
  editableRows = [],
  isEditing = false,
  sort,
  onSort,
  onFieldChange = noopFieldChange,
  onDeleteRow = noop,
}: Props) => {
  const rows: EditableRow[] = isEditing
    ? editableRows
    : items.map(toEditableRow)

  return (
    <>
      {/* Desktop: grid table */}
      <Grid gap="0" role="table" display={{ base: "none", md: "grid" }}>
        <Grid
          templateColumns={isEditing ? "2fr 1fr 1fr 1fr 1fr auto" : "2fr 1fr 1fr 1fr 1fr"}
          gap={isEditing ? "2" : "3"}
          py="2.5"
          px="4"
          role="row"
          bg="bg.muted"
          borderRadius="lg"
        >
          <SortableHeader label={t("inventory.name")} sortKey="name" currentSort={sort} onSort={onSort} />
          <SortableHeader label={t("inventory.itemNumber")} sortKey="itemNumber" currentSort={sort} onSort={onSort} />
          <SortableHeader label={t("inventory.category")} sortKey="category" currentSort={sort} onSort={onSort} />
          <SortableHeader label={t("inventory.qty")} sortKey="currentQty" currentSort={sort} onSort={onSort} />
          <SortableHeader label={t("inventory.status")} sortKey="status" currentSort={sort} onSort={onSort} />
        </Grid>
        {rows.map((row, index) => (
          <EditableInventoryRow
            key={row.itemId}
            row={row}
            index={index}
            isEditing={isEditing}
            onFieldChange={onFieldChange}
            onDelete={onDeleteRow}
          />
        ))}
      </Grid>

      {/* Mobile: card list */}
      <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
        {rows.map((row, index) => (
          <EditableInventoryCard
            key={row.itemId}
            row={row}
            index={index}
            isEditing={isEditing}
            onFieldChange={onFieldChange}
            onDelete={onDeleteRow}
          />
        ))}
      </Flex>
    </>
  )
}

const noop = () => {}
const noopFieldChange = (_id: string, _field: EditableField, _value: string | number) => {}

type Props = {
  items: InventoryItem[]
  editableRows?: EditableRow[]
  isEditing?: boolean
  sort: SortConfig
  onSort: (sort: SortConfig) => void
  onFieldChange?: (itemId: string, field: EditableField, value: string | number) => void
  onDeleteRow?: (itemId: string) => void
}
