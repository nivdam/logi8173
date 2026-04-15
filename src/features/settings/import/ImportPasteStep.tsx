import { Box, Button, Flex, Text, Textarea } from "@chakra-ui/react"
import { ClipboardPaste } from "lucide-react"
import { useState } from "react"
import { t } from "../../../lib/i18n"
import type { ImportEntity } from "./import-types"

export const ImportPasteStep = ({ entity, onParse }: ImportPasteStepProps) => {
  const [rawText, setRawText] = useState("")

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("text/plain")
    if (pastedText.trim()) {
      setRawText(pastedText)
      onParse(pastedText)
    }
  }

  const handleParseClick = () => {
    if (rawText.trim()) {
      onParse(rawText)
    }
  }

  const hintKey = entity === "inventory"
    ? "settings.import.pasteInventoryHint"
    : "settings.import.pasteSoldiersHint"

  return (
    <Flex direction="column" gap="4">
      <Box>
        <Text textStyle="sm" color="fg.muted" mb="2">
          {t(hintKey)}
        </Text>
        <Textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          onPaste={handlePaste}
          placeholder={t("settings.import.pasteHint")}
          aria-label={t("settings.import.pasteHint")}
          rows={10}
          fontFamily="mono"
          textStyle="sm"
          dir="auto"
        />
      </Box>

      <Flex justify="space-between" align="center">
        <Text textStyle="xs" color="fg.muted">
          {rawText.trim() ? `${Math.max(0, rawText.trim().split(/\r?\n/).length - 1)} ${t("settings.import.rowsParsed")}` : ""}
        </Text>
        <Button
          size="sm"
          bg="sage.600"
          color="white"
          _hover={{ bg: "sage.700" }}
          disabled={!rawText.trim()}
          onClick={handleParseClick}
        >
          <ClipboardPaste size={16} />
          {t("settings.import.parseAction")}
        </Button>
      </Flex>
    </Flex>
  )
}

type ImportPasteStepProps = {
  entity: ImportEntity
  onParse: (text: string) => void
}
