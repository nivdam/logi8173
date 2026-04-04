import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import type { CompanyBreakdown as CompanyBreakdownType } from "../../types"

export const CompanyBreakdown = ({ breakdown }: Props) => {
  const maxCount = Math.max(...breakdown.map((company) => company.issuedCount))

  return (
    <Box
      bg="bg.card"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border"
      p="5"
    >
      <Heading size="md" fontWeight="600" mb="4">
        {t("dashboard.companyBreakdown")}
      </Heading>
      <Grid gap="3">
        {breakdown.map((company) => (
          <Flex key={company.companyName} align="center" gap="3">
            <Text textStyle="sm" w="20" flexShrink={0}>
              {company.companyName}
            </Text>
            <Box flex="1" h="6" bg="bg.muted" borderRadius="md" overflow="hidden">
              <Box
                h="full"
                bg="sage.400"
                borderRadius="md"
                css={{
                  width: `${(company.issuedCount / maxCount) * 100}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </Box>
            <Text textStyle="sm" fontWeight="500" w="8" textAlign="start">
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
