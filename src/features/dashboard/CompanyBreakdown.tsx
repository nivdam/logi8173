import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { CompanyBreakdown as CompanyBreakdownType } from "../../types"

const barColors = ["sage.400", "sky.400", "sunburst.400", "rose.300", "sage.600"]

export const CompanyBreakdown = ({ breakdown }: Props) => {
  const maxCount = Math.max(...breakdown.map((company) => company.issuedCount))

  return (
    <Box
      p={{ base: "5", md: "6" }}
      bg="bg.card"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border"
      h="full"
      css={animations.cardHover}
    >
      <Heading size="md" fontWeight="600" mb="5">
        {t("dashboard.companyBreakdown")}
      </Heading>
      <Grid gap="4">
        {breakdown.map((company, index) => (
          <Flex
            key={company.companyName}
            direction="column"
            gap="1.5"
            css={{
              ...animations.listItem(index),
              "@keyframes fadeInUp": animations.fadeInUp["@keyframes fadeInUp"],
            }}
          >
            <Flex justify="space-between" align="baseline">
              <Text textStyle="sm" fontWeight="500">{company.companyName}</Text>
              <Text textStyle="sm" fontWeight="700">{company.issuedCount}</Text>
            </Flex>
            <Box h="2" bg="bg.muted" borderRadius="full" overflow="hidden">
              <Box
                h="full"
                bg={barColors[index % barColors.length]}
                borderRadius="full"
                css={{
                  width: `${(company.issuedCount / maxCount) * 100}%`,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>
          </Flex>
        ))}
      </Grid>
    </Box>
  )
}

type Props = {
  breakdown: CompanyBreakdownType[]
}
