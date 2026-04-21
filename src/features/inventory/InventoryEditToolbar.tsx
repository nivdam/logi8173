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
        size="md"
        borderRadius="lg"
        bg="sage.600"
        color="white"
        _hover={{ bg: "sage.700" }}
        onClick={onStartEditing}
      >
        <Pencil size={16} />
        {t("inventory.editMode")}
      </Button>
    )
  }

  return (
    <Flex gap="2" flexWrap="wrap" align="center">
      <Button
        size="md"
        borderRadius="lg"
        bg="sage.600"
        color="white"
        _hover={{ bg: "sage.700" }}
        onClick={onAddRow}
      >
        <Plus size={16} />
        {t("inventory.addRow")}
      </Button>
      <Button
        size="md"
        borderRadius="lg"
        bg="blue.600"
        color="white"
        _hover={{ bg: "blue.700" }}
        disabled={!canSave}
        loading={isSaving}
        onClick={onSave}
      >
        <Save size={16} />
        {t("inventory.saveChanges")}
        {changeCount > 0 ? (
          <Text as="span" fontSize="xs" opacity={0.8}>
            ({changeCount})
          </Text>
        ) : null}
      </Button>
      <Button
        size="md"
        variant="outline"
        borderRadius="lg"
        onClick={onCancelEditing}
      >
        <X size={16} />
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
