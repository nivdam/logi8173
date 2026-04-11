import { useState } from "react"
import {
  Box,
  Button,
  chakra,
  Dialog,
  Field,
  Flex,
  Grid,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Package } from "lucide-react"
import { FilterSelect } from "../../components/FilterSelect"
import { t } from "../../lib/i18n"

const CATEGORY_OPTIONS = [
  { value: "רספאי", label: "רספאי" },
  { value: "קבלר_קרביות", label: "קבלר קרביות" },
  { value: "ציוד_אישי", label: "ציוד אישי" },
  { value: "אנרגיה", label: "אנרגיה" },
  { value: "תקשורת", label: "תקשורת" },
  { value: "כללי", label: "כללי" },
]

const UNIT_OPTIONS = [
  { value: "יחידה", label: "יחידה" },
  { value: "זוג", label: "זוג" },
  { value: "קופסה", label: "קופסה" },
  { value: "ערכה", label: "ערכה" },
  { value: "סט", label: "סט" },
]

export const AddInventoryItemDialog = ({
  open,
  isSaving,
  onOpenChange,
  onSubmit,
}: AddInventoryItemDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange} closeOnInteractOutside={false}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mx="4" maxW="md" borderRadius="2xl">
          {open ? (
            <AddInventoryItemForm isSaving={isSaving} onSubmit={onSubmit} />
          ) : null}
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
)

const AddInventoryItemForm = ({
  isSaving,
  onSubmit,
}: AddInventoryItemFormProps) => {
  const [name, setName] = useState("")
  const [itemNumber, setItemNumber] = useState("")
  const [category, setCategory] = useState("כללי")
  const [unitOfMeasure, setUnitOfMeasure] = useState("יחידה")
  const [initialQty, setInitialQty] = useState(0)
  const [notes, setNotes] = useState("")

  const isValid = name.trim() !== "" && category !== ""

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value)
  }

  const handleItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemNumber(event.currentTarget.value)
  }

  const handleCategoryChange = (value: string | undefined) => {
    if (value) setCategory(value)
  }

  const handleUnitChange = (value: string | undefined) => {
    if (value) setUnitOfMeasure(value)
  }

  const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.currentTarget.value, 10)
    if (!Number.isNaN(value) && value >= 0) setInitialQty(value)
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.currentTarget.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    onSubmit({
      name: name.trim(),
      itemNumber: itemNumber.trim() || undefined,
      category,
      unitOfMeasure,
      initialQty,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <chakra.form onSubmit={handleSubmit}>
      <Dialog.Header pt="6" pb="4">
        <Flex align="center" gap="3">
          <Flex
            align="center"
            justify="center"
            w="10"
            h="10"
            borderRadius="full"
            bg="sage.100"
            color="sage.700"
            flexShrink={0}
          >
            <Package size={20} />
          </Flex>
          <Box>
            <Dialog.Title fontSize="lg" fontWeight="700">
              {t("inventory.addItemTitle")}
            </Dialog.Title>
            <Text textStyle="sm" color="fg.muted" mt="0.5">
              {t("inventory.addItemDescription")}
            </Text>
          </Box>
        </Flex>
      </Dialog.Header>

      <Dialog.Body py="4">
        <Stack gap="4">
          <Field.Root required>
            <Field.Label fontWeight="500">{t("inventory.fields.name")}</Field.Label>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder={t("inventory.fields.namePlaceholder")}
              size="lg"
              borderRadius="lg"
              autoFocus
            />
          </Field.Root>

          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
            <Field.Root>
              <Field.Label fontWeight="500">{t("inventory.fields.itemNumber")}</Field.Label>
              <Input
                value={itemNumber}
                onChange={handleItemNumberChange}
                placeholder={t("inventory.fields.itemNumberPlaceholder")}
                borderRadius="lg"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontWeight="500">{t("inventory.fields.category")}</Field.Label>
              <FilterSelect
                label={t("inventory.fields.category")}
                value={category}
                options={CATEGORY_OPTIONS}
                onChange={handleCategoryChange}
              />
            </Field.Root>
          </Grid>

          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
            <Field.Root>
              <Field.Label fontWeight="500">{t("inventory.fields.initialQty")}</Field.Label>
              <Input
                type="number"
                inputMode="numeric"
                value={initialQty}
                onChange={handleQtyChange}
                min={0}
                borderRadius="lg"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label fontWeight="500">{t("inventory.fields.unit")}</Field.Label>
              <FilterSelect
                label={t("inventory.fields.unit")}
                value={unitOfMeasure}
                options={UNIT_OPTIONS}
                onChange={handleUnitChange}
              />
            </Field.Root>
          </Grid>

          <Field.Root>
            <Field.Label fontWeight="500">{t("inventory.fields.notes")}</Field.Label>
            <Input
              value={notes}
              onChange={handleNotesChange}
              placeholder={t("inventory.fields.notesPlaceholder")}
              borderRadius="lg"
            />
          </Field.Root>
        </Stack>
      </Dialog.Body>

      <Dialog.Footer pt="4" pb="6" gap="3" flexDirection={{ base: "column-reverse", sm: "row" }}>
        <Dialog.ActionTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="lg"
            borderRadius="lg"
            flex={{ sm: "1" }}
            w={{ base: "full", sm: "auto" }}
          >
            {t("common.cancel")}
          </Button>
        </Dialog.ActionTrigger>
        <Button
          type="submit"
          colorPalette="sage"
          size="lg"
          borderRadius="lg"
          flex={{ sm: "1" }}
          w={{ base: "full", sm: "auto" }}
          loading={isSaving}
          disabled={!isValid}
        >
          {t("inventory.addItemAction")}
        </Button>
      </Dialog.Footer>
    </chakra.form>
  )
}

type AddInventoryItemDialogProps = {
  open: boolean
  isSaving: boolean
  onOpenChange: (details: { open: boolean }) => void
  onSubmit: (values: AddInventoryItemInput) => void
}

type AddInventoryItemFormProps = {
  isSaving: boolean
  onSubmit: (values: AddInventoryItemInput) => void
}

type AddInventoryItemInput = {
  name: string
  itemNumber: string | undefined
  category: string
  unitOfMeasure: string
  initialQty: number
  notes: string | undefined
}
