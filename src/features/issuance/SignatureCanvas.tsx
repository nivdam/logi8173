import { useRef } from "react"
import { Box, Button, Flex, Text } from "@chakra-ui/react"
import ReactSignatureCanvas from "react-signature-canvas"
import { Eraser } from "lucide-react"
import { t } from "../../lib/i18n"

export const SignatureCanvas = ({ onSign, signatureData }: Props) => {
  const canvasRef = useRef<ReactSignatureCanvas>(null)

  const handleEnd = () => {
    if (!canvasRef.current) return

    if (canvasRef.current.isEmpty()) {
      onSign("")
      return
    }

    const base64 = canvasRef.current.toDataURL("image/png")
    onSign(base64)
  }

  const handleClear = () => {
    if (!canvasRef.current) return
    canvasRef.current.clear()
    onSign("")
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="2">
        <Text textStyle="sm" fontWeight="500">
          {t("issuance.signHere")}
        </Text>
        {signatureData && (
          <Button
            variant="ghost"
            size="xs"
            color="fg.muted"
            onClick={handleClear}
          >
            <Eraser size={14} />
            {t("issuance.clearSignature")}
          </Button>
        )}
      </Flex>
      <Box
        borderWidth="2px"
        borderColor={signatureData ? "sage.300" : "border"}
        borderStyle="dashed"
        borderRadius="xl"
        overflow="hidden"
        bg="white"
        role="img"
        aria-label={t("issuance.signHere")}
        css={{ transition: "border-color 0.2s ease", touchAction: "none" }}
      >
        <ReactSignatureCanvas
          ref={canvasRef}
          penColor="var(--chakra-colors-sage-800)"
          canvasProps={{
            width: 500,
            height: 200,
            style: {
              width: "100%",
              height: "160px",
              cursor: "crosshair",
            },
          }}
          onEnd={handleEnd}
        />
      </Box>
      {!signatureData && (
        <Text textStyle="xs" color="fg.muted" mt="1">
          {t("issuance.signatureRequired")}
        </Text>
      )}
    </Box>
  )
}

type Props = {
  onSign: (base64: string) => void
  signatureData: string
}
