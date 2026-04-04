import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { CompanyBreakdown as CompanyBreakdownType } from "../../types"

const barColors = ["sage.400", "sky.400", "sunburst.400", "rose.300", "sage.600"]

export const CompanyBreakdown = ({ breakdown }: Props) => {
  const maxCount = Math.max(...breakdown.map((company) => company.issuedCount))

  return (
    <Box
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border"
      p={{ base: "4", md: "5" }}
      css={{
        ...animations.fadeInUp,
        animationDelay: "0.3s",
        opacity: 0,
      }}
    >
      <Heading size="md" fontWeight="600" mb="4">
        {t("dashboard.companyBreakdown")}
      </Heading>
      <Grid gap="3">
        {breakdown.map((company, index) => (
          <Flex key={company.companyName} align="center" gap="3">
            <Text textStyle="sm" w={{ base: "16", md: "20" }} flexShrink={0}>
              {company.companyName}
            </Text>
            <Box flex="1" h="7" bg="bg.muted" borderRadius="md" overflow="hidden">
              <Box
                h="full"
                bg={barColors[index % barColors.length]}
                borderRadius="md"
                css={{
                  width: `${(company.issuedCount / maxCount) * 100}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </Box>
            <Text textStyle="sm" fontWeight="600" w="8" textAlign="start">
              {company.issuedCount}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  )
}

type Props = {
  breakdown: CompanyBreakdownType[]
}
