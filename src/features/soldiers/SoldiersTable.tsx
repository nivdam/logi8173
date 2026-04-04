import { Box, Flex, Grid, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import type { Soldier } from "../../types"

export const SoldiersTable = ({ soldiers }: Props) => (
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
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("soldiers.fullName")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("soldiers.personalId")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("soldiers.company")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("soldiers.platoon")}</Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" role="columnheader">{t("soldiers.phone")}</Text>
      </Grid>
      {soldiers.map((soldier) => (
        <Grid
          key={soldier.personalId}
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
          <Text textStyle="sm" fontWeight="500" role="cell">{soldier.fullName}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{soldier.personalId}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{soldier.company}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell">{soldier.platoon ?? "—"}</Text>
          <Text textStyle="sm" color="fg.muted" role="cell" dir="ltr">{soldier.phone ?? "—"}</Text>
        </Grid>
      ))}
    </Grid>

    {/* Mobile: card list */}
    <Flex direction="column" gap="3" display={{ base: "flex", md: "none" }}>
      {soldiers.map((soldier) => (
        <Box
          key={soldier.personalId}
          p="4"
          bg="bg.card"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border"
          cursor="pointer"
          _hover={{ shadow: "sm" }}
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
                <Text textStyle="sm" dir="ltr">{soldier.phone}</Text>
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
}
