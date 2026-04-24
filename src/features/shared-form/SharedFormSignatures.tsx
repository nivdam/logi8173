import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { PenLine } from "lucide-react"
import { t } from "../../lib/i18n"
import { SignatureImage } from "../../components/SignatureImage"

export const SharedFormSignatures = ({ signatureBase64 }: Props) => {
  if (!signatureBase64) return null

  return (
    <Box
      bg="bg.muted"
      borderRadius="xl"
      p="4"
    >
      <Flex align="center" gap="2" mb="3">
        <PenLine size={16} color="var(--chakra-colors-fg-muted)" />
        <Text textStyle="xs" fontWeight="600" color="fg.muted" textTransform="uppercase">
          {t("sharedForm.signature")}
        </Text>
      </Flex>
      <VStack gap="3" align="stretch">
        <Box
          bg="bg.card"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border"
          p="3"
          textAlign="center"
        >
          <SignatureImage
            src={signatureBase64}
            alt={t("sharedForm.signature")}
            maxH="120px"
          />
        </Box>
      </VStack>
    </Box>
  )
}

type Props = {
  signatureBase64: string
}
