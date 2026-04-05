import { Flex, Box, Text } from "@chakra-ui/react"
import { Check } from "lucide-react"
import { t } from "../../lib/i18n"

const STEPS = [
  { key: "soldier", label: () => t("issuance.stepSoldier") },
  { key: "items", label: () => t("issuance.stepItems") },
  { key: "review", label: () => t("issuance.stepReview") },
] as const

export const StepProgressBar = ({ currentStep }: Props) => {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep)

  return (
    <Flex align="center" gap="2" w="100%">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        const stepBg = isActive ? "sage.600" : isCompleted ? "sage.200" : "bg.muted"
        const stepColor = isActive ? "white" : isCompleted ? "sage.700" : "fg.muted"

        return (
          <Flex key={step.key} align="center" gap="2" flex="1">
            <Flex
              align="center"
              justify="center"
              w="7"
              h="7"
              borderRadius="full"
              flexShrink={0}
              bg={stepBg}
              color={stepColor}
              fontWeight="600"
              textStyle="xs"
              css={{ transition: "all 0.2s ease" }}
            >
              {isCompleted ? <Check size={14} /> : index + 1}
            </Flex>
            <Text
              textStyle="xs"
              fontWeight={isActive ? "600" : "400"}
              color={isActive ? "fg" : "fg.muted"}
              display={{ base: isActive ? "block" : "none", md: "block" }}
              css={{ transition: "all 0.2s ease" }}
            >
              {step.label()}
            </Text>
            {index < STEPS.length - 1 && (
              <Box
                flex="1"
                h="1px"
                bg={isCompleted ? "sage.300" : "border"}
                display={{ base: "none", md: "block" }}
              />
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

type Props = {
  currentStep: "soldier" | "items" | "review"
}
