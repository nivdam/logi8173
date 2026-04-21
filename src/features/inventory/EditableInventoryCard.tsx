import { Box, Button, Flex, Grid, Input, Text } from "@chakra-ui/react"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { StatusBadge } from "../../components/StatusBadge"
import { FilterSelect } from "../../components/FilterSelect"
import { getItemStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { CATEGORY_OPTIONS, UNIT_OPTIONS, getCategoryLabel } from "./inventory.constants"
import type { EditableRow, EditableField } from "./useEditableInventory"

const getCardBg = (changeType: EditableRow["changeType"]): string => {
  if (changeType === "modified") return "orange.50"
  if (changeType === "added") return "green.50"
  return "bg.card"
}

const getCardBorderColor = (
  changeType: EditableRow["changeType"],
  isExpanded: boolean,
): string => {
  if (changeType === "modified") return "orange.300"
  if (changeType === "added") return "green.300"
  if (isExpanded) return "sage.300"
  return "border"
}

export const EditableInventoryCard = ({
  row,
  index,
  isExpanded,
  isReadOnly = false,
  onToggleExpand,
  onFieldChange,
  onDelete,
}: EditableInventoryCardProps) => {
  const handleToggle = () => {
    if (isReadOnly) return
    onToggleExpand(row.itemId)
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(row.itemId, "name", event.currentTarget.value)
  }

  const handleItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.currentTarget.value.replace(/\D/g, "")
    onFieldChange(row.itemId, "itemNumber", digitsOnly)
  }

  const handleCategoryChange = (value: string | undefined) => {
    if (value) {
      onFieldChange(row.itemId, "category", value)
    }
  }

  const handleQtyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsedQuantity = parseInt(event.currentTarget.value, 10)
    if (!Number.isNaN(parsedQuantity) && parsedQuantity >= 0) {
      onFieldChange(row.itemId, "currentQty", parsedQuantity)
    }
  }

  const handleUnitChange = (value: string | undefined) => {
    if (value) {
      onFieldChange(row.itemId, "unitOfMeasure", value)
    }
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(row.itemId, "notes", event.currentTarget.value)
  }

  const handleMinThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(event.currentTarget.value, 10)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onFieldChange(row.itemId, "minThreshold", parsed)
    }
  }

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onDelete(row.itemId)
  }

  const stopPropagation = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation()
  }

  if (!isExpanded) {
    return (
      <Box
        p="4"
        bg={getCardBg(row.changeType)}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={getCardBorderColor(row.changeType, false)}
        cursor={isReadOnly ? "default" : "pointer"}
        onClick={handleToggle}
        css={{
          ...(isReadOnly ? {} : animations.cardHover),
          ...animations.listItem(index),
        }}
      >
        <Flex justify="space-between" align="start" mb="2">
          <Text textStyle="sm" fontWeight="600">{row.name}</Text>
          <Flex gap="2" align="center">
            <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
            {isReadOnly ? null : <ChevronDown size={14} color="var(--chakra-colors-fg-muted)" />}
          </Flex>
        </Flex>
        <Flex gap="4" flexWrap="wrap">
          <Flex direction="column">
            <Text textStyle="xs" color="fg.muted">{t("inventory.itemNumber")}</Text>
            <Text textStyle="sm">{row.itemNumber}</Text>
          </Flex>
          <Flex direction="column">
            <Text textStyle="xs" color="fg.muted">{t("inventory.category")}</Text>
            <Text textStyle="sm">{getCategoryLabel(row.category)}</Text>
          </Flex>
          <Flex direction="column">
            <Text textStyle="xs" color="fg.muted">{t("inventory.qty")}</Text>
            <Text textStyle="sm" fontWeight="500">{row.currentQty} {row.unitOfMeasure}</Text>
          </Flex>
        </Flex>
        {row.notes ? (
          <Flex direction="column" mt="3">
            <Text textStyle="xs" color="fg.muted">{t("inventory.notes")}</Text>
            <Text textStyle="sm">{row.notes}</Text>
          </Flex>
        ) : null}
      </Box>
    )
  }

  return (
    <Box
      p="4"
      bg={getCardBg(row.changeType)}
      borderRadius="xl"
      borderWidth="2px"
      borderColor={getCardBorderColor(row.changeType, true)}
      css={{ transition: "border-color 0.2s ease" }}
    >
      <Flex justify="space-between" align="center" mb="3">
        <StatusBadge status={row.status} label={getItemStatusLabel(row.status)} />
        <Flex gap="1">
          <Button
            size="xs"
            variant="ghost"
            color="red.500"
            minW="10"
            minH="10"
            onClick={handleDeleteClick}
            aria-label={t("inventory.deleteRow")}
          >
            <Trash2 size={16} />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color="fg.muted"
            minW="10"
            minH="10"
            onClick={handleToggle}
            aria-label={t("inventory.collapseRow")}
          >
            <ChevronUp size={16} />
          </Button>
        </Flex>
      </Flex>

      <Flex direction="column" gap="3" onClick={stopPropagation}>
        <Box>
          <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.name")}</Text>
          <Input
            size="sm"
            borderRadius="md"
            value={row.name}
            onChange={handleNameChange}
            placeholder={t("inventory.name")}
            autoFocus
          />
        </Box>

        <Grid templateColumns="1fr 1fr" gap="3">
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.itemNumber")}</Text>
            <Input
              size="sm"
              borderRadius="md"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={row.itemNumber}
              onChange={handleItemNumberChange}
              placeholder={t("inventory.itemNumber")}
            />
          </Box>
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.category")}</Text>
            <FilterSelect
              label={t("inventory.category")}
              value={row.category}
              options={CATEGORY_OPTIONS}
              onChange={handleCategoryChange}
            />
          </Box>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap="3">
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.qty")}</Text>
            <Input
              size="sm"
              borderRadius="md"
              type="number"
              inputMode="numeric"
              value={row.currentQty}
              onChange={handleQtyChange}
              min={0}
            />
          </Box>
          <Box>
            <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.unit")}</Text>
            <FilterSelect
              label={t("inventory.unit")}
              value={row.unitOfMeasure}
              options={UNIT_OPTIONS}
              onChange={handleUnitChange}
            />
          </Box>
        </Grid>

        <Box>
          <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.minThreshold")}</Text>
          <Input
            size="sm"
            borderRadius="md"
            type="number"
            inputMode="numeric"
            value={row.minThreshold}
            onChange={handleMinThresholdChange}
            min={0}
          />
          <Text textStyle="xs" color="fg.muted" mt="1">{t("inventory.minThresholdHint")}</Text>
        </Box>

        <Box>
          <Text textStyle="xs" color="fg.muted" mb="1">{t("inventory.notes")}</Text>
          <Input
            size="sm"
            borderRadius="md"
            value={row.notes ?? ""}
            onChange={handleNotesChange}
            placeholder={t("inventory.notesPlaceholder")}
          />
        </Box>
      </Flex>
    </Box>
  )
}

type EditableInventoryCardProps = {
  row: EditableRow
  index: number
  isExpanded: boolean
  isReadOnly?: boolean
  onToggleExpand: (itemId: string) => void
  onFieldChange: (itemId: string, field: EditableField, value: string | number) => void
  onDelete: (itemId: string) => void
}
