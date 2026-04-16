import { Button, Flex, Text } from "@chakra-ui/react"
import { Pencil, Plus, Save, X } from "lucide-react"
import { t } from "../../lib/i18n"

export const InventoryEditToolbar = ({
  isEditing,
  changeCount,
  canSave,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onAddRow,
  onSave,
}: InventoryEditToolbarProps) => {
  if (!isEditing) {
    return (
      <Button
        size="sm"
        variant="outline"
        borderRadius="lg"
        onClick={onStartEditing}
      >
        <Pencil size={14} />
        {t("inventory.editMode")}
      </Button>
    )
  }

  return (
    <Flex gap="2" flexWrap="wrap" align="center">
      <Button
        size="sm"
        borderRadius="lg"
        bg="sage.600"
        color="white"
        _hover={{ bg: "sage.700" }}
        onClick={onAddRow}
      >
        <Plus size={14} />
        {t("inventory.addRow")}
      </Button>
      <Button
        size="sm"
        borderRadius="lg"
        bg="blue.600"
        color="white"
        _hover={{ bg: "blue.700" }}
        disabled={!canSave}
        loading={isSaving}
        onClick={onSave}
      >
        <Save size={14} />
        {t("inventory.saveChanges")}
        {changeCount > 0 ? (
          <Text as="span" fontSize="xs" opacity={0.8}>
            ({changeCount})
          </Text>
        ) : null}
      </Button>
      <Button
        size="sm"
        variant="outline"
        borderRadius="lg"
        onClick={onCancelEditing}
      >
        <X size={14} />
        {t("inventory.cancelEdit")}
      </Button>
    </Flex>
  )
}

type InventoryEditToolbarProps = {
  isEditing: boolean
  changeCount: number
  canSave: boolean
  isSaving: boolean
  onStartEditing: () => void
  onCancelEditing: () => void
  onAddRow: () => void
  onSave: () => void
}
