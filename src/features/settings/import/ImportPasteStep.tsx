import { Box, Button, Flex, Input, Text, Textarea } from "@chakra-ui/react"
import { ClipboardPaste, FileInput, Link as LinkIcon, Upload } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { t } from "../../../lib/i18n"
import type { ImportEntity } from "./import-types"

export const ImportPasteStep = ({ entity, onParse, onImportFromUrl }: ImportPasteStepProps) => {
  const [rawText, setRawText] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawText(event.target.value)
  }

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

  const handleLoadFromUrl = async () => {
    if (!sourceUrl.trim()) return

    setIsLoadingUrl(true)

    try {
      const importedText = await onImportFromUrl(sourceUrl.trim())
      setRawText(importedText)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const handleFileSelection = async (file: File | null) => {
    if (!file) return
    const fileText = await file.text()
    setRawText(fileText)
    onParse(fileText)
  }

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileSelection(event.target.files?.[0] ?? null)
    event.target.value = ""
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingFile(false)
    await handleFileSelection(event.dataTransfer.files?.[0] ?? null)
  }

  const parsedRowCount = useMemo(() => {
    if (!rawText.trim()) return ""
    return `${Math.max(0, rawText.trim().split(/\r?\n/).length - 1)} ${t("settings.import.rowsParsed")}`
  }, [rawText])

  const hintKey = entity === "inventory"
    ? "settings.import.pasteInventoryHint"
    : "settings.import.pasteSoldiersHint"

  return (
    <Flex direction="column" gap="4">
      <Box>
        <Text textStyle="sm" color="fg.muted" mb="2">
          {t("settings.import.googleSheetHint")}
        </Text>
        <Flex gap="2" direction={{ base: "column", md: "row" }}>
          <Input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder={t("settings.import.googleSheetPlaceholder")}
            aria-label={t("settings.import.googleSheetPlaceholder")}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={!sourceUrl.trim() || isLoadingUrl}
            loading={isLoadingUrl}
            onClick={handleLoadFromUrl}
          >
            <LinkIcon size={16} />
            {t("settings.import.importFromUrl")}
          </Button>
        </Flex>
      </Box>

      <Box>
        <Text textStyle="sm" color="fg.muted" mb="2">
          {t("settings.import.fileHint")}
        </Text>
        <Box
          borderWidth="1px"
          borderStyle="dashed"
          borderColor={isDraggingFile ? "forest.500" : "border"}
          borderRadius="xl"
          p="4"
          bg={isDraggingFile ? "forest.50" : "bg.subtle"}
          transition="all 0.2s"
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDraggingFile(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDraggingFile(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDraggingFile(false)
          }}
          onDrop={handleDrop}
        >
          <Flex direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "center" }} justify="space-between" gap="3">
            <Flex align="center" gap="2">
              <Upload size={16} />
              <Text textStyle="sm">{t("settings.import.fileTitle")}</Text>
            </Flex>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileInput size={16} />
              {t("settings.import.chooseFile")}
            </Button>
          </Flex>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            hidden
            onChange={handleFileInputChange}
          />
        </Box>
      </Box>

      <Box>
        <Text textStyle="sm" color="fg.muted" mb="2">
          {t(hintKey)}
        </Text>
        <Textarea
          value={rawText}
          onChange={handleTextChange}
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
          {parsedRowCount}
        </Text>
        <Button
          size="sm"
          bg="interactive"
          color="fg.onPrimary"
          _hover={{ bg: "interactive.hover" }}
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
  onImportFromUrl: (url: string) => Promise<string>
}
