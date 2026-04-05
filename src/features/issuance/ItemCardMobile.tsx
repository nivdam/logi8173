import { Accordion, Badge, Box, Button, Editable, Flex, Input, SegmentGroup, Text, Textarea } from "@chakra-ui/react"
import { ChevronDown, Copy, Trash2 } from "lucide-react"
import { t } from "../../lib/i18n"
import { useLineItemEditor } from "./hooks/useLineItemEditor"
import { InventoryCombobox } from "./InventoryCombobox"
import type { IssuanceLineItem } from "./issuance.types"
import type { InventoryItem } from "../../types/inventory"

export const ItemCardMobile = ({
  line,
  rowNumber,
  onUpdateField,
  onBindToItem,
  onDuplicate,
  onRemove,
}: ItemCardMobileProps) => {
  const editor = useLineItemEditor(line, onUpdateField, onBindToItem)

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateField(line.lineId, "notes", event.target.value)
  }

  const handleDuplicate = (event: React.MouseEvent) => {
    event.stopPropagation()
    onDuplicate(line.lineId)
  }

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation()
    onRemove(line.lineId)
  }

  return (
    <Accordion.Item value={line.lineId}>
      <Accordion.ItemTrigger px="3" py="3" cursor="pointer">
        <Flex flex="1" align="center" gap="2" minW="0">
          <Text textStyle="xs" color="fg.muted" fontWeight="600">
            {rowNumber}.
          </Text>
          <Text textStyle="sm" fontWeight="500" truncate>
            {line.name || "פריט חדש"}
          </Text>
          {line.isCustom && (
            <Badge colorPalette="blue" size="sm" flexShrink={0}>
              {t("issuance.customItemBadge")}
            </Badge>
          )}
        </Flex>
        <Flex align="center" gap="2" flexShrink={0}>
          <Badge colorPalette="sage" size="sm" variant="solid">
            x{line.qty}
          </Badge>
          <Accordion.ItemIndicator>
            <ChevronDown size={16} />
          </Accordion.ItemIndicator>
        </Flex>
      </Accordion.ItemTrigger>

      <Accordion.ItemContent>
        <Box px="3" pb="3">
          <Flex direction="column" gap="3">
            {/* שם פריט */}
            <Box>
              <Text textStyle="xs" color="fg.muted" fontWeight="500" mb="1">
                שם פריט
              </Text>
              <InventoryCombobox
                collection={editor.collection}
                filtered={editor.filtered}
                inputValue={editor.nameInput}
                onInputValueChange={editor.handleItemInputChange}
                onValueChange={editor.handleItemSelect}
                placeholder="שם פריט..."
                ariaLabel={`שם פריט שורה ${rowNumber}`}
              />
            </Box>

            {/* כמות + יחידה */}
            <Flex align="center" justify="space-between">
              <Text textStyle="xs" color="fg.muted" fontWeight="500">
                {t("issuance.quantity")}
              </Text>
              <Flex align="center" gap="2">
                <Input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  value={line.qty}
                  onChange={editor.handleQtyChange}
                  min={0}
                  size="xs"
                  borderRadius="md"
                  textAlign="center"
                  w="60px"
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
            </Flex>

            {/* מק"ט / מסט"ב */}
            <Flex align="center" justify="space-between">
              <Text textStyle="xs" color="fg.muted" fontWeight="500">
                מק״ט / מסט״ב
              </Text>
              <Editable.Root
                value={line.catalogNumber}
                onValueChange={editor.handleCatalogChange}
                placeholder="מק״ט / מסט״ב"
                activationMode="focus"
              >
                <Editable.Preview textStyle="xs" cursor="text" w="140px" textAlign="end" />
                <Editable.Input textStyle="xs" w="140px" aria-label={`מק״ט שורה ${rowNumber}`} />
              </Editable.Root>
            </Flex>

            {/* הערות */}
            <Box>
              <Text textStyle="xs" color="fg.muted" fontWeight="500" mb="1">
                {t("issuance.itemNotes")}
              </Text>
              <Textarea
                value={line.notes}
                onChange={handleNotesChange}
                placeholder="הערות לפריט..."
                size="sm"
                borderRadius="md"
                rows={2}
                resize="vertical"
                aria-label={`הערות שורה ${rowNumber}`}
              />
            </Box>

            {/* פעולות */}
            <Flex gap="2" justify="flex-end" pt="1">
              <Button variant="outline" size="xs" borderRadius="md" onClick={handleDuplicate}>
                <Copy size={14} />
                {t("issuance.duplicateLine")}
              </Button>
              <Button variant="outline" size="xs" borderRadius="md" onClick={handleRemove}>
                <Trash2 size={14} />
                {t("issuance.removeLine")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Accordion.ItemContent>
    </Accordion.Item>
  )
}

type ItemCardMobileProps = {
  line: IssuanceLineItem
  rowNumber: number
  onUpdateField: (lineId: string, field: keyof IssuanceLineItem, value: string | number | boolean) => void
  onBindToItem: (lineId: string, item: InventoryItem) => void
  onDuplicate: (lineId: string) => void
  onRemove: (lineId: string) => void
}
