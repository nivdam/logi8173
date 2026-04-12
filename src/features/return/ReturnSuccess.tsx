import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CheckCircle2, ArrowLeft, RotateCcw, Package } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { Soldier } from "../../types"
import type { IssuanceLineItem } from "../issuance/issuance.types"

export const ReturnSuccess = ({ formId, giver, lines, itemCount, onNewReturn, onBackToDashboard }: Props) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="60dvh"
    css={animations.fadeInUp}
  >
    <VStack gap="6" align="center" maxW="450px" w="full">
      <Flex
        align="center"
        justify="center"
        w="20"
        h="20"
        borderRadius="full"
        bg="sky.50"
        css={animations.scaleIn}
      >
        <CheckCircle2 size={40} color="var(--chakra-colors-sky-600)" />
      </Flex>

      <VStack gap="2">
        <Heading size="xl" fontWeight="700" textAlign="center">
          {t("returns.successTitle")}
        </Heading>
        <Text color="fg.muted" textAlign="center" textStyle="md">
          {t("returns.successDescription")}
        </Text>
        {formId && (
          <Text textStyle="xs" color="fg.muted">
            #{formId}
          </Text>
        )}
      </VStack>

      <Box
        bg="bg.muted"
        borderRadius="xl"
        p="4"
        w="100%"
        textAlign="center"
      >
        <Text textStyle="xs" color="fg.muted" mb="1">{t("returns.returnedFrom")}</Text>
        <Text textStyle="lg" fontWeight="700">{giver.fullName}</Text>
        <Text textStyle="sm" color="fg.muted">
          {giver.personalId}
          {giver.company && ` · ${giver.company}`}
        </Text>
      </Box>

      {lines.length > 0 && (
        <Box w="100%" bg="bg.card" borderRadius="xl" borderWidth="1px" borderColor="border" overflow="hidden">
          <Flex align="center" gap="2" px="4" py="2" bg="bg.muted">
            <Package size={14} color="var(--chakra-colors-fg-muted)" />
            <Text textStyle="xs" fontWeight="600" color="fg.muted">
              {itemCount} {t("issuance.reviewItems")}
            </Text>
          </Flex>
          <VStack gap="0" align="stretch">
            {lines.filter((line) => line.name !== "").map((line, index) => (
              <Flex
                key={line.lineId}
                align="center"
                justify="space-between"
                px="4"
                py="2"
                borderBottomWidth={index < lines.length - 1 ? "1px" : "0"}
                borderColor="border"
                css={animations.listItem(index)}
              >
                <Flex align="center" gap="2">
                  <Text textStyle="xs" color="fg.muted" fontWeight="600">
                    {index + 1}.
                  </Text>
                  <Text textStyle="sm" fontWeight="500">
                    {line.name}
                  </Text>
                  {line.catalogNumber && (
                    <Text textStyle="xs" color="fg.muted">
                      ({line.catalogNumber})
                    </Text>
                  )}
                </Flex>
                <Text textStyle="sm" fontWeight="600" color="sky.600">
                  x{line.qty} {line.unitOfMeasure}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      <Flex w="100%" gap="3">
        <Button
          flex="2"
          size="lg"
          bg="sky.600"
          color="white"
          borderRadius="xl"
          _hover={{ bg: "sky.700" }}
          onClick={onNewReturn}
        >
          <RotateCcw size={18} />
          {t("returns.newReturn")}
        </Button>
        <Button
          flex="1"
          size="lg"
          variant="outline"
          borderRadius="xl"
          onClick={onBackToDashboard}
        >
          <ArrowLeft size={18} />
          {t("issuance.backToDashboard")}
        </Button>
      </Flex>
    </VStack>
  </Flex>
)

type Props = {
  formId: string | undefined
  giver: Soldier
  lines: IssuanceLineItem[]
  itemCount: number
  onNewReturn: () => void
  onBackToDashboard: () => void
}
