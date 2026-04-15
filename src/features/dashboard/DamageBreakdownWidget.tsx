import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import { AlertTriangle } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { CompanyDamageBreakdown } from "../../types"

export const DamageBreakdownWidget = ({ damageBreakdown, animationDelay }: DamageBreakdownWidgetProps) => {
  const getCompanyDamagedQty = (company: CompanyDamageBreakdown) =>
    company.items.reduce((sum, item) => sum + item.qty, 0)

  const totalDamaged = damageBreakdown.reduce((sum, company) => sum + getCompanyDamagedQty(company), 0)

  if (totalDamaged === 0) {
    return (
      <Box
        bg="bg.card"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border"
        p={{ base: "5", md: "6" }}
        css={animations.delayedFadeInUp(animationDelay)}
      >
        <Heading size="md" fontWeight="600" mb="3">{t("dashboard.damageBreakdown")}</Heading>
        <Text textStyle="sm" color="fg.muted">{t("dashboard.noDamage")}</Text>
      </Box>
    )
  }

  return (
    <Box
      bg="bg.card"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border"
      p={{ base: "5", md: "6" }}
      css={animations.delayedFadeInUp(animationDelay)}
    >
      <Flex justify="space-between" align="center" mb="5">
        <Flex align="center" gap="2">
          <AlertTriangle size={18} />
          <Heading size="md" fontWeight="600">{t("dashboard.damageBreakdown")}</Heading>
        </Flex>
        <Flex
          px="2.5"
          py="1"
          borderRadius="full"
          bg="rose.50"
        >
          <Text textStyle="xs" fontWeight="600" color="red.600">
            {totalDamaged} {t("dashboard.totalDamaged")}
          </Text>
        </Flex>
      </Flex>

      <Flex direction="column" gap="0">
        {damageBreakdown.map((company, companyIndex) => (
          <Flex
            key={company.companyName}
            direction="column"
            gap="2"
            py="3.5"
            borderTopWidth={companyIndex > 0 ? "1px" : "0"}
            borderColor="border"
            css={animations.listItem(companyIndex)}
          >
            <Flex justify="space-between" align="center">
              <Text textStyle="sm" fontWeight="600">{company.companyName}</Text>
              <Text textStyle="sm" fontWeight="700" color="red.600">{getCompanyDamagedQty(company)}</Text>
            </Flex>
            <Flex gap="2" flexWrap="wrap">
              {company.items.map((item) => (
                <Flex
                  key={item.itemName}
                  px="2.5"
                  py="1"
                  borderRadius="lg"
                  bg="bg.muted"
                  gap="1.5"
                  align="center"
                >
                  <Text textStyle="xs" color="fg.muted">{item.itemName}</Text>
                  <Text textStyle="xs" fontWeight="600" color="red.600">{item.qty}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}

type DamageBreakdownWidgetProps = {
  damageBreakdown: CompanyDamageBreakdown[]
  animationDelay: number
}
