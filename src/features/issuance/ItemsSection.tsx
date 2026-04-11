import { Accordion, Badge, Box, Button, Flex, Grid, Heading, ScrollArea, Text } from "@chakra-ui/react"
import { Plus } from "lucide-react"
import { t } from "../../lib/i18n"
import { ItemRow } from "./ItemRow"
import { ItemCardMobile } from "./ItemCardMobile"
import type { InventoryItem } from "../../types/inventory"
import type { IssuanceLineItem } from "./issuance.types"

export const ItemsSection = ({
  lines,
  inventoryItems,
  onAddEmptyLine,
  onUpdateField,
  onBindToItem,
  onDuplicate,
  onRemove,
  expandedItems,
  onExpandedItemsChange,
}: ItemsSectionProps) => {
  return (
    <Box>
      <Flex align="center" justify="space-between" mb="3">
        <Heading size="sm" fontWeight="600">
          {t("issuance.itemsSection")}
        </Heading>
        {lines.length > 0 && (
          <Badge colorPalette="sage" size="sm">
            {lines.length} {t("issuance.reviewItems")}
          </Badge>
        )}
      </Flex>

      {/* Desktop table */}
      <Box display={{ base: "none", md: "block" }}>
        <Grid
          templateColumns="24px 24px 100px 1fr 120px 1fr 32px"
          gap="2"
          px="3"
          py="2"
          bg="bg.muted"
          borderRadius="lg"
          mb="1"
          role="row"
        >
          <Text textStyle="xs" fontWeight="600" color="fg.muted"></Text>
          <Text textStyle="xs" fontWeight="600" color="fg.muted">#</Text>
          <Text textStyle="xs" fontWeight="600" color="fg.muted">מק״ט / מסט״ב</Text>
          <Text textStyle="xs" fontWeight="600" color="fg.muted">שם פריט</Text>
          <Text textStyle="xs" fontWeight="600" color="fg.muted">{t("issuance.quantity")}</Text>
          <Text textStyle="xs" fontWeight="600" color="fg.muted">{t("issuance.itemNotes")}</Text>
          <Text textStyle="xs" fontWeight="600" color="fg.muted"></Text>
        </Grid>
        <ScrollArea.Root maxH="400px">
          <ScrollArea.Viewport>
            {lines.map((line, index) => (
              <ItemRow
                key={line.lineId}
                line={line}
                rowNumber={index + 1}
                inventoryItems={inventoryItems}
                onUpdateField={onUpdateField}
                onBindToItem={onBindToItem}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
              />
            ))}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </Box>

      {/* Mobile accordion */}
      <Box display={{ base: "block", md: "none" }}>
        <Accordion.Root
          collapsible
          multiple
          value={expandedItems}
          onValueChange={(details) => onExpandedItemsChange(details.value)}
        >
          {lines.map((line, index) => (
            <ItemCardMobile
              key={line.lineId}
              line={line}
              rowNumber={index + 1}
              inventoryItems={inventoryItems}
              onUpdateField={onUpdateField}
              onBindToItem={onBindToItem}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
            />
          ))}
        </Accordion.Root>
      </Box>

      {/* Add row button */}
      <Flex justify="center" mt="3">
        <Button
          variant="outline"
          size="sm"
          borderRadius="lg"
          onClick={onAddEmptyLine}
          color="sage.600"
          borderColor="sage.300"
        >
          <Plus size={16} />
          {t("issuance.addRow")}
        </Button>
      </Flex>
    </Box>
  )
}

type ItemsSectionProps = {
  lines: IssuanceLineItem[]
  inventoryItems: InventoryItem[]
  onAddEmptyLine: () => void
  onUpdateField: (lineId: string, field: keyof IssuanceLineItem, value: string | number | boolean) => void
  onBindToItem: (lineId: string, item: InventoryItem) => void
  onDuplicate: (lineId: string) => void
  onRemove: (lineId: string) => void
  expandedItems: string[]
  onExpandedItemsChange: (expandedItems: string[]) => void
}
