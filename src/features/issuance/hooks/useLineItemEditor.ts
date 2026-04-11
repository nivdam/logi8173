import { useMemo, useRef, useState } from "react"
import { createListCollection } from "@chakra-ui/react"
import { validateLine } from "../issuance.utils"
import type { IssuanceLineItem } from "../issuance.types"
import type { InventoryItem } from "../../../types/inventory"

const FILTER_DEBOUNCE_MS = 150

export const useLineItemEditor = (
  line: IssuanceLineItem,
  onUpdateField: (lineId: string, field: keyof IssuanceLineItem, value: string | number | boolean) => void,
  onBindToItem: (lineId: string, item: InventoryItem) => void,
  inventoryItems: InventoryItem[],
) => {
  const [nameInput, setNameInput] = useState(line.name)
  const [debouncedQuery, setDebouncedQuery] = useState(line.name)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const filtered = useMemo(() => {
    if (!debouncedQuery) return inventoryItems
    const query = debouncedQuery.toLowerCase()
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.itemNumber.toLowerCase().includes(query),
    )
  }, [debouncedQuery, inventoryItems])

  const collection = useMemo(
    () =>
      createListCollection({
        items: filtered,
        itemToValue: (item) => item.itemId,
        itemToString: (item) => item.name,
      }),
    [filtered],
  )

  const errors = useMemo(() => validateLine(line), [line])
  const qtyError = errors.find((error) => error.field === "qty")

  const handleItemInputChange = (details: { inputValue: string }) => {
    setNameInput(details.inputValue)
    onUpdateField(line.lineId, "name", details.inputValue)

    clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(details.inputValue)
    }, FILTER_DEBOUNCE_MS)
  }

  const handleItemSelect = (details: { value: string[] }) => {
    const selectedItemId = details.value[0]
    if (!selectedItemId) return
    const item = inventoryItems.find((inventoryItem) => inventoryItem.itemId === selectedItemId)
    if (!item) return
    onBindToItem(line.lineId, item)
    setNameInput(item.name)
    setDebouncedQuery(item.name)
  }

  const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    if (Number.isNaN(value) || value < 0) return
    onUpdateField(line.lineId, "qty", value)
  }

  const handleUnitChange = (details: { value: string | null }) => {
    if (details.value) {
      onUpdateField(line.lineId, "unitOfMeasure", details.value)
    }
  }

  const handleCatalogChange = (details: { value: string }) => {
    onUpdateField(line.lineId, "catalogNumber", details.value)
  }

  return {
    nameInput,
    filtered,
    collection,
    qtyError,
    handleItemInputChange,
    handleItemSelect,
    handleQtyChange,
    handleUnitChange,
    handleCatalogChange,
  }
}
