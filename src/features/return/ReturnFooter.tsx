import { useState } from "react"
import { Box, Button, Flex, Grid, Heading, Text, Textarea } from "@chakra-ui/react"
import { RefreshCw } from "lucide-react"
import { t } from "../../lib/i18n"
import { SignatureCanvas } from "../../components/SignatureCanvas"
import { SignatureImage } from "../../components/SignatureImage"

export const ReturnFooter = ({
  globalNotes,
  giverSignature,
  receiverSignature,
  savedSignatureUrl,
  isFormValid,
  totalItemCount,
  isSubmitting,
  onSetGlobalNotes,
  onSetGiverSignature,
  onSetReceiverSignature,
  onSubmit,
}: ReturnFooterProps) => {
  const [showReceiverCanvas, setShowReceiverCanvas] = useState(false)

  const hasSavedSignature =
    savedSignatureUrl !== undefined && savedSignatureUrl !== ""
  const showSavedReceiverSignature =
    hasSavedSignature && !showReceiverCanvas && receiverSignature === ""

  const handleReceiverResign = () => {
    setShowReceiverCanvas(true)
    onSetReceiverSignature("")
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSetGlobalNotes(event.target.value)
  }

  return (
    <Box>
      <Box mb="5">
        <Heading size="sm" fontWeight="600" mb="2">
          {t("issuance.globalNotes")}
        </Heading>
        <Textarea
          value={globalNotes}
          onChange={handleNotesChange}
          placeholder={t("returns.globalNotesPlaceholder")}
          size="sm"
          borderRadius="lg"
          rows={3}
          resize="vertical"
        />
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="5">
        <Box>
          <Heading size="sm" fontWeight="600" mb="2">
            {t("returns.giverSignature")}
          </Heading>
          <SignatureCanvas
            onSign={onSetGiverSignature}
            signatureData={giverSignature}
          />
        </Box>

        <Box>
          <Heading size="sm" fontWeight="600" mb="2">
            {t("returns.receiverSignature")}
          </Heading>

          {showSavedReceiverSignature ? (
            <Box>
              <Box
                borderWidth="2px"
                borderColor="forest.300"
                borderStyle="dashed"
                borderRadius="xl"
                overflow="hidden"
                bg="bg.card"
                p="2"
              >
                <SignatureImage
                  src={savedSignatureUrl}
                  alt={t("returns.receiverSignature")}
                  maxH="120px"
                />
              </Box>
              <Flex justify="space-between" align="center" mt="2">
                <Text textStyle="xs" color="fg.muted">
                  {t("issuance.savedSignature")}
                </Text>
                <Button
                  variant="ghost"
                  size="xs"
                  color="fg.muted"
                  onClick={handleReceiverResign}
                >
                  <RefreshCw size={12} />
                  {t("issuance.resignButton")}
                </Button>
              </Flex>
            </Box>
          ) : (
            <SignatureCanvas
              onSign={onSetReceiverSignature}
              signatureData={receiverSignature}
            />
          )}
        </Box>
      </Grid>

      <Box
        position="sticky"
        bottom="0"
        mt="6"
        p="4"
        bg="bg.card"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Button
          w="100%"
          size="lg"
          bg="sky.600"
          color="white"
          borderRadius="xl"
          _hover={{ bg: "sky.700" }}
          onClick={onSubmit}
          loading={isSubmitting}
          loadingText={t("returns.submitting")}
          disabled={!isFormValid || isSubmitting}
        >
          {t("returns.submitReturn")} ({totalItemCount} {t("issuance.reviewItems")})
        </Button>
      </Box>
    </Box>
  )
}

type ReturnFooterProps = {
  globalNotes: string
  giverSignature: string
  receiverSignature: string
  savedSignatureUrl: string | undefined
  isFormValid: boolean
  totalItemCount: number
  isSubmitting: boolean
  onSetGlobalNotes: (notes: string) => void
  onSetGiverSignature: (base64: string) => void
  onSetReceiverSignature: (base64: string) => void
  onSubmit: () => void
}
