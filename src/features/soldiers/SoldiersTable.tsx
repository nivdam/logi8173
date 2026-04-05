import { Box, Flex, Grid, Text } from "@chakra-ui/react"
import { SortableHeader, type SortConfig } from "../../components/SortableHeader"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { PhoneActions } from "./PhoneActions"
import type { Soldier } from "../../types"

export const SoldiersTable = ({ soldiers, sort, onSort }: Props) => (
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
        <SortableHeader label={t("soldiers.fullName")} sortKey="fullName" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("soldiers.personalId")} sortKey="personalId" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("soldiers.company")} sortKey="company" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("soldiers.platoon")} sortKey="platoon" currentSort={sort} onSort={onSort} />
        <SortableHeader label={t("soldiers.phone")} sortKey="phone" currentSort={sort} onSort={onSort} />
      </Grid>
      {soldiers.map((soldier, index) => (
        <Grid
          key={soldier.personalId}
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
            
            transition: "background 0.15s ease, transform 0.15s ease",
            "&:hover": { background: "var(--chakra-colors-bg-muted)", transform: "scale(1.005)" },
          }}
        >
          <Text textStyle="sm" fontWeight="500" role="cell">{soldier.fullName}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{soldier.personalId}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{soldier.company}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{soldier.platoon ?? "—"}</Text>
          {soldier.phone ? (
            <PhoneActions phone={soldier.phone} />
          ) : (
            <Text textStyle="sm" color="fg.muted" role="cell">—</Text>
          )}
        </Grid>
      ))}
    </Grid>

    {/* Mobile: card list */}
    <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
      {soldiers.map((soldier, index) => (
        <Box
          key={soldier.personalId}
          p="4"
          bg="bg.card"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border"
          cursor="pointer"
          css={{
            ...animations.cardHover,
            ...animations.listItem(index),
            
          }}
        >
          <Flex justify="space-between" align="center" mb="2">
            <Text textStyle="sm" fontWeight="600">{soldier.fullName}</Text>
            <Text textStyle="xs" color="fg.muted">{soldier.personalId}</Text>
          </Flex>
          <Flex gap="4" flexWrap="wrap">
            <Flex direction="column">
              <Text textStyle="xs" color="fg.muted">{t("soldiers.company")}</Text>
              <Text textStyle="sm">{soldier.company}</Text>
            </Flex>
            {soldier.platoon ? (
              <Flex direction="column">
                <Text textStyle="xs" color="fg.muted">{t("soldiers.platoon")}</Text>
                <Text textStyle="sm">{soldier.platoon}</Text>
              </Flex>
            ) : null}
            {soldier.phone ? (
              <Flex direction="column">
                <Text textStyle="xs" color="fg.muted">{t("soldiers.phone")}</Text>
                <PhoneActions phone={soldier.phone} />
              </Flex>
            ) : null}
          </Flex>
        </Box>
      ))}
    </Flex>
  </>
)

type Props = {
  soldiers: Soldier[]
  sort: SortConfig
  onSort: (sort: SortConfig) => void
}
