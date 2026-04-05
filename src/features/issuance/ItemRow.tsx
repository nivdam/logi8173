import { Box, Button, Editable, Flex, Grid, Input, SegmentGroup, Text } from "@chakra-ui/react"
import { CopyPlus, Trash2 } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { useLineItemEditor } from "./hooks/useLineItemEditor"
import { InventoryCombobox } from "./InventoryCombobox"
import type { IssuanceLineItem } from "./issuance.types"
import type { InventoryItem } from "../../types/inventory"

export const ItemRow = ({
  line,
  rowNumber,
  onUpdateField,
  onBindToItem,
  onDuplicate,
  onRemove,
}: ItemRowProps) => {
  const editor = useLineItemEditor(line, onUpdateField, onBindToItem)

  const handleDuplicate = () => {
    onDuplicate(line.lineId)
  }

  const handleRemove = () => {
    onRemove(line.lineId)
  }

  return (
    <Box borderBottomWidth="1px" borderColor="border" _hover={{ bg: "bg.muted" }} css={animations.fadeInUp}>
      <Grid
        templateColumns="24px 24px 100px 1fr 120px 1fr 32px"
        gap="2"
        alignItems="center"
        px="3"
        py="2"
        role="row"
      >
        {/* שכפול */}
        <Button
          variant="outline"
          size="xs"
          onClick={handleDuplicate}
          aria-label={`${t("issuance.duplicateLine")} שורה ${rowNumber}`}
          p="0"
          minW="6"
          h="6"
          borderRadius="full"
          borderColor="sage.300"
          color="sage.600"
          _hover={{ bg: "sage.50", borderColor: "sage.500" }}
        >
          <CopyPlus size={12} />
        </Button>

        {/* מספר שורה */}
        <Text textStyle="xs" color="fg.muted" fontWeight="600" textAlign="center">
          {rowNumber}
        </Text>

        {/* מק"ט / מסט"ב */}
        <Editable.Root
          value={line.catalogNumber}
          onValueChange={editor.handleCatalogChange}
          placeholder="מק״ט / מסט״ב"
          activationMode="focus"
        >
          <Editable.Preview textStyle="xs" color="fg.muted" cursor="text" />
          <Editable.Input textStyle="xs" aria-label={`מק״ט שורה ${rowNumber}`} />
        </Editable.Root>

        {/* שם פריט */}
        <InventoryCombobox
          collection={editor.collection}
          filtered={editor.filtered}
          inputValue={editor.nameInput}
          onInputValueChange={editor.handleItemInputChange}
          onValueChange={editor.handleItemSelect}
          placeholder="שם פריט..."
          ariaLabel={`שם פריט שורה ${rowNumber}`}
        />

        {/* כמות + יחידה */}
        <Flex align="center" gap="1">
          <Input
            type="number"
            inputMode="numeric"
            step={1}
            value={line.qty}
            onChange={editor.handleQtyChange}
            min={0}
            max={line.isCustom ? undefined : line.availableQty > 0 ? line.availableQty : undefined}
            size="xs"
            borderRadius="md"
            textAlign="center"
            w="50px"
            borderColor={editor.qtyError ? "red.500" : undefined}
            aria-label={`${t("issuance.quantity")} שורה ${rowNumber}`}
            aria-invalid={editor.qtyError !== undefined}
          />
          <SegmentGroup.Root
            size="xs"
            value={line.unitOfMeasure}
            onValueChange={editor.handleUnitChange}
            bg="sunburst.300/20"
            borderRadius="md"
          >
            <SegmentGroup.Indicator bg="sunburst.400" borderRadius="md" />
            <SegmentGroup.Item value="יחידה" color="sunburst.500" _checked={{ color: "white" }}>
              <SegmentGroup.ItemText>יח׳</SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
            <SegmentGroup.Item value="זוג" color="sunburst.500" _checked={{ color: "white" }}>
              <SegmentGroup.ItemText>זוג</SegmentGroup.ItemText>
              <SegmentGroup.ItemHiddenInput />
            </SegmentGroup.Item>
          </SegmentGroup.Root>
        </Flex>

        {/* הערות */}
        <Editable.Root
          value={line.notes}
          onValueChange={(details) => onUpdateField(line.lineId, "notes", details.value)}
          placeholder="הערות..."
          activationMode="focus"
        >
          <Editable.Preview textStyle="xs" color={line.notes ? "fg" : "fg.muted"} cursor="text" />
          <Editable.Input textStyle="xs" aria-label={`הערות שורה ${rowNumber}`} />
        </Editable.Root>

        {/* מחיקה */}
        <Button
          variant="ghost"
          size="xs"
          color="fg.muted"
          onClick={handleRemove}
          aria-label={`${t("issuance.removeLine")} שורה ${rowNumber}`}
          p="0"
          minW="auto"
        >
          <Trash2 size={14} />
        </Button>
      </Grid>
    </Box>
  )
}

type ItemRowProps = {
  line: IssuanceLineItem
  rowNumber: number
  onUpdateField: (lineId: string, field: keyof IssuanceLineItem, value: string | number | boolean) => void
  onBindToItem: (lineId: string, item: InventoryItem) => void
  onDuplicate: (lineId: string) => void
  onRemove: (lineId: string) => void
}
