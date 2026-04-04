import { Box, Flex, Grid, Text } from "@chakra-ui/react"
import { StatusBadge } from "../../components/StatusBadge"
import { getItemStatusColor, getItemStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import type { InventoryItem } from "../../types"

export const InventoryTable = ({ items }: Props) => (
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
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("inventory.name")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("inventory.itemNumber")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("inventory.category")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("inventory.qty")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("inventory.status")}</Text>
      </Grid>
      {items.map((item) => (
        <Grid
          key={item.itemId}
          templateColumns="2fr 1fr 1fr 1fr 1fr"
          gap="3"
          py="3"
          px="4"
          borderBottomWidth="1px"
          borderColor="border"
          role="row"
          _hover={{ bg: "bg.muted" }}
          cursor="pointer"
          css={{ transition: "background 0.15s ease" }}
        >
          <Text textStyle="sm" fontWeight="500" role="cell">{item.name}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{item.itemNumber}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{item.category}</Text>
          <Text textStyle="sm" fontWeight="500" role="cell">{item.currentQty} {item.unitOfMeasure}</Text>
          <StatusBadge label={getItemStatusLabel(item.status)} color={getItemStatusColor(item.status)} />
        </Grid>
      ))}
    </Grid>

    {/* Mobile: card list */}
    <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
      {items.map((item) => (
        <Box
          key={item.itemId}
          p="4"
          bg="bg.card"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border"
          cursor="pointer"
          _hover={{ shadow: "sm" }}
        >
          <Flex justify="space-between" align="start" mb="2">
            <Text textStyle="sm" fontWeight="600">{item.name}</Text>
            <StatusBadge label={getItemStatusLabel(item.status)} color={getItemStatusColor(item.status)} />
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
}
