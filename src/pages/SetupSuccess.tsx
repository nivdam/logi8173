import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"
import { t } from "../lib/i18n"
import { animations } from "../theme/animations"

export const SetupSuccess = ({ folderUrl, onContinue }: Props) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="100dvh"
    bg="bg"
    p={{ base: "6", md: "8" }}
  >
    <Box
      bg="bg.card"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border"
      p={{ base: "6", md: "10" }}
      maxW="520px"
      w="100%"
      css={animations.fadeInUp}
    >
      <VStack gap="6" align="center">
        <Flex
          align="center"
          justify="center"
          w="16"
          h="16"
          borderRadius="full"
          bg="green.50"
        >
          <CheckCircle2 size={32} color="var(--chakra-colors-green-600)" />
        </Flex>

        <VStack gap="2">
          <Heading size="xl" fontWeight="700" textAlign="center">
            {t("setup.successTitle")}
          </Heading>
          <Text color="fg.muted" textAlign="center" textStyle="sm">
            {t("setup.successDescription")}
          </Text>
        </VStack>

        <VStack w="100%" gap="3">
          <Button
            w="100%"
            size="lg"
            bg="interactive"
            color="white"
            borderRadius="xl"
            _hover={{ bg: "interactive.hover" }}
            onClick={onContinue}
          >
            <ArrowLeft size={18} />
            {t("setup.continueToApp")}
          </Button>

          <Button
            w="100%"
            size="lg"
            variant="outline"
            borderRadius="xl"
            onClick={() => window.open(folderUrl, "_blank")}
          >
            <ExternalLink size={18} />
            {t("setup.openDrive")}
          </Button>
        </VStack>
      </VStack>
    </Box>
  </Flex>
)

type Props = {
  folderUrl: string
  onContinue: () => void
}
