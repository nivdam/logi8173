import { Box, Flex, Grid, Text } from "@chakra-ui/react"
import { StatusBadge } from "../../components/StatusBadge"
import { SortableHeader, type SortConfig } from "../../components/SortableHeader"
import { getItemStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { InventoryItem } from "../../types"

export const InventoryTable = ({ items, sort, onSort }: Props) => (
  <>
    {/* Desktop: grid table */}
    <Grid gap="0" role="table" display={{ base: "none", md: "grid" }}>
      <Grid
        templateColumns="2fr 1fr 1fr 1fr 1fr"
        gap="3"
        py="2.5"
        px="4"
        role="row"
        bg="bg.muted"
        borderRadius="lg"
      >
        <SortableHeader label={t("inventory.name")} sortKey="name" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("inventory.itemNumber")} sortKey="itemNumber" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("inventory.category")} sortKey="category" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("inventory.qty")} sortKey="currentQty" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("inventory.status")} sortKey="status" currentSort={sort} onSort={onSort} />
      </Grid>
      {items.map((item, index) => (
        <Grid
          key={item.itemId}
          templateColumns="2fr 1fr 1fr 1fr 1fr"
          gap="3"
          py="3"
          px="4"
          borderBottomWidth="1px"
          borderColor="border"
          role="row"
          cursor="pointer"
          css={{
            ...animations.listItem(index),
            "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"],
            transition: "background 0.15s ease, transform 0.15s ease",
            "&:hover": { background: "var(--chakra-colors-bg-muted)", transform: "scale(1.005)" },
          }}
        >
          <Text textStyle="sm" fontWeight="500" role="cell">{item.name}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{item.itemNumber}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{item.category}</Text>
          <Text textStyle="sm" fontWeight="500" role="cell">{item.currentQty} {item.unitOfMeasure}</Text>
          <StatusBadge status={item.status} label={getItemStatusLabel(item.status)} />
        </Grid>
      ))}
    </Grid>

    {/* Mobile: card list */}
    <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
      {items.map((item, index) => (
        <Box
          key={item.itemId}
          p="4"
          bg="bg.card"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border"
          cursor="pointer"
          css={{
            ...animations.cardHover,
            ...animations.listItem(index),
            "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"],
          }}
        >
          <Flex justify="space-between" align="start" mb="2">
            <Text textStyle="sm" fontWeight="600">{item.name}</Text>
            <StatusBadge status={item.status} label={getItemStatusLabel(item.status)} />
          </Flex>
          <Flex gap="4" flexWrap="wrap">
            <Flex direction="column">
              <Text textStyle="xs" color="fg.muted">{t("inventory.itemNumber")}</Text>
              <Text textStyle="sm">{item.itemNumber}</Text>
            </Flex>
            <Flex direction="column">
              <Text textStyle="xs" color="fg.muted">{t("inventory.category")}</Text>
              <Text textStyle="sm">{item.category}</Text>
            </Flex>
            <Flex direction="column">
              <Text textStyle="xs" color="fg.muted">{t("inventory.qty")}</Text>
              <Text textStyle="sm" fontWeight="500">{item.currentQty} {item.unitOfMeasure}</Text>
            </Flex>
          </Flex>
        </Box>
      ))}
    </Flex>
  </>
)

type Props = {
  items: InventoryItem[]
  sort: SortConfig
  onSort: (sort: SortConfig) => void
}
