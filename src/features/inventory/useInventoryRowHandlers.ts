import type { EditableField } from "./useEditableInventory"

export const useInventoryRowHandlers = ({
  itemId,
  onFieldChange,
  onDelete,
  onToggleExpand,
  isReadOnly,
}: UseInventoryRowHandlersArgs) => {
  const handleToggle = () => {
    if (isReadOnly) return
    onToggleExpand(itemId)
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(itemId, "name", event.currentTarget.value)
  }

  const handleItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.currentTarget.value.replace(/\D/g, "")
    onFieldChange(itemId, "itemNumber", digitsOnly)
  }

  const handleCategoryChange = (value: string | undefined) => {
    if (!value) return
    onFieldChange(itemId, "category", value)
  }

  const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value
    if (rawValue === "") {
      onFieldChange(itemId, "currentQty", 0)
      return
    }
    const parsedQuantity = parseInt(rawValue, 10)
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) return
    onFieldChange(itemId, "currentQty", parsedQuantity)
  }

  const handleUnitChange = (value: string | undefined) => {
    if (!value) return
    onFieldChange(itemId, "unitOfMeasure", value)
  }

  const handleMinThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value
    if (rawValue === "") {
      onFieldChange(itemId, "minThreshold", 0)
      return
    }
    const parsed = parseInt(rawValue, 10)
    if (Number.isNaN(parsed) || parsed < 0) return
    onFieldChange(itemId, "minThreshold", parsed)
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(itemId, "notes", event.currentTarget.value)
  }

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onDelete(itemId)
  }

  const stopPropagation = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation()
  }

  return {
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
  }
}

type UseInventoryRowHandlersArgs = {
  itemId: string
  isReadOnly: boolean
  onFieldChange: (itemId: string, field: EditableField, value: string | number) => void
  onDelete: (itemId: string) => void
  onToggleExpand: (itemId: string) => void
}
