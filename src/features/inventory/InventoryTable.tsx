import { Flex, Grid, Text } from "@chakra-ui/react"
import { SortableHeader, type SortConfig } from "../../components/SortableHeader"
import { t } from "../../lib/i18n"
import { EditableInventoryRow } from "./EditableInventoryRow"
import { EditableInventoryCard } from "./EditableInventoryCard"
import type { InventoryItem } from "../../types"
import type { EditableRow, EditableField } from "./useEditableInventory"

const noop = () => {}
const noopFieldChange = (_id: string, _field: EditableField, _value: string | number) => {}

const toUnchangedRow = (item: InventoryItem): EditableRow => ({
  ...item,
  changeType: "unchanged",
  changedFields: new Set<EditableField>(),
})

export const InventoryTable = ({
  rows,
  items,
  expandedRowId = null,
  onToggleExpand = noop,
  sort,
  onSort,
  onFieldChange = noopFieldChange,
  onDeleteRow = noop,
  readOnly = false,
}: Props) => {
  const displayRows: EditableRow[] = rows ?? (items ?? []).map(toUnchangedRow)

  return (
    <>
      {/* Desktop: grid table */}
      <Grid gap="0" role="table" display={{ base: "none", md: "grid" }}>
        <Grid
          templateColumns="2fr 1fr 1fr 1fr 1fr auto"
          gap="3"
          py="2.5"
          px="4"
          role="row"
          bg="bg.muted"
          borderRadius="lg"
        >
          <SortableHeader label={t("inventory.name")} sortKey="name" currentSort={sort} onSort={onSort} />
          <Text textStyle="xs" color="fg.muted" fontWeight="500">{t("inventory.notes")}</Text>
          <SortableHeader label={t("inventory.category")} sortKey="category" currentSort={sort} onSort={onSort} />
          <SortableHeader label={t("inventory.qty")} sortKey="currentQty" currentSort={sort} onSort={onSort} />
          <SortableHeader label={t("inventory.status")} sortKey="status" currentSort={sort} onSort={onSort} />
          <span />
        </Grid>
        {displayRows.map((row, index) => (
          <EditableInventoryRow
            key={row.itemId}
            row={row}
            index={index}
            isExpanded={!readOnly && row.itemId === expandedRowId}
            isReadOnly={readOnly}
            onToggleExpand={onToggleExpand}
            onFieldChange={onFieldChange}
            onDelete={onDeleteRow}
          />
        ))}
      </Grid>

      {/* Mobile: card list */}
      <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
        {displayRows.map((row, index) => (
          <EditableInventoryCard
            key={row.itemId}
            row={row}
            index={index}
            isExpanded={!readOnly && row.itemId === expandedRowId}
            isReadOnly={readOnly}
            onToggleExpand={onToggleExpand}
            onFieldChange={onFieldChange}
            onDelete={onDeleteRow}
          />
        ))}
      </Flex>
    </>
  )
}

type Props = {
  rows?: EditableRow[]
  items?: InventoryItem[]
  expandedRowId?: string | null
  onToggleExpand?: (itemId: string) => void
  sort: SortConfig
  onSort: (sort: SortConfig) => void
  onFieldChange?: (itemId: string, field: EditableField, value: string | number) => void
  onDeleteRow?: (itemId: string) => void
  readOnly?: boolean
}
