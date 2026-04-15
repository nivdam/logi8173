import { useState, useCallback, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Box, Dialog, Flex, Portal, Tabs, Text } from "@chakra-ui/react"
import { FileSpreadsheet, Package, Users } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useInventory, useSoldiers } from "../../../api"
import { api } from "../../../lib/api"
import { t } from "../../../lib/i18n"
import { ImportPasteStep } from "./ImportPasteStep"
import { ImportReviewStep } from "./ImportReviewStep"
import {
  parseSpreadsheetText,
  detectColumnMapping,
  validateInventoryRows,
  validateSoldierRows,
  hasRequiredInventoryColumns,
  hasRequiredSoldierColumns,
  getMissingColumns,
  INVENTORY_HEADER_ALIASES,
  SOLDIER_HEADER_ALIASES,
} from "./import-parsers"
import type { PreviewColumn } from "./ImportPreviewTable"
import type { ImportRow, ImportEntity, ColumnMapping } from "./import-types"
import type { InventoryUpsertData, SoldierUpsertData } from "./import-parsers"

const MAX_IMPORT_ROWS = 500

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const [activeTab, setActiveTab] = useState<ImportEntity>("inventory")
  const [inventoryRows, setInventoryRows] = useState<ImportRow<InventoryUpsertData>[] | null>(null)
  const [soldierRows, setSoldierRows] = useState<ImportRow<SoldierUpsertData>[] | null>(null)
  const [inventoryMapping, setInventoryMapping] = useState<ColumnMapping | null>(null)
  const [soldierMapping, setSoldierMapping] = useState<ColumnMapping | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const cancelledRef = useRef(false)

  const queryClient = useQueryClient()
  const { data: existingInventory = [] } = useInventory()
  const { data: existingSoldiers = [] } = useSoldiers()

  const handleReset = () => {
    setInventoryRows(null)
    setSoldierRows(null)
    setInventoryMapping(null)
    setSoldierMapping(null)
    setParseError(null)
  }

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open && isImporting) return
    onOpenChange(details)
    if (!details.open) {
      cancelledRef.current = true
      handleReset()
      setActiveTab("inventory")
    }
  }

  const handleTabChange = (details: { value: string }) => {
    if (isImporting) return
    const nextTab = details.value === "soldiers" ? "soldiers" : "inventory"
    setActiveTab(nextTab)
    handleReset()
  }

  const handleImportStart = () => {
    cancelledRef.current = false
    setIsImporting(true)
  }

  const handleImportEnd = () => {
    setIsImporting(false)
    const invalidateKey = activeTab === "inventory" ? "inventory" : "soldiers"
    queryClient.invalidateQueries({ queryKey: [invalidateKey] })
    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  const handleParseInventory = (text: string) => {
    parseImportText({
      text,
      aliases: INVENTORY_HEADER_ALIASES,
      requiredFields: ["name", "category"],
      hasRequiredColumns: hasRequiredInventoryColumns,
      validateRows: (rows, mapping) => validateInventoryRows(rows, mapping, existingInventory),
      setMapping: setInventoryMapping,
      setRows: setInventoryRows,
      setParseError,
    })
  }

  const handleParseSoldiers = (text: string) => {
    parseImportText({
      text,
      aliases: SOLDIER_HEADER_ALIASES,
      requiredFields: ["personalId", "fullName", "rank", "company"],
      hasRequiredColumns: hasRequiredSoldierColumns,
      validateRows: (rows, mapping) => validateSoldierRows(rows, mapping, existingSoldiers),
      setMapping: setSoldierMapping,
      setRows: setSoldierRows,
      setParseError,
    })
  }

  const handleImportFromUrl = async (sourceUrl: string) => {
    setParseError(null)

    try {
      const response = await api.post<ImportSheetTextResponse>("imports.fetchSheetText", { sourceUrl })
      return response.text
    } catch {
      setParseError(t("settings.import.sourceLoadError"))
      throw new Error("Failed to load import source")
    }
  }

  const handleInventoryRowUpdate = useCallback(
    (index: number, status: "importing" | "imported" | "failed", error?: string) =>
      updateRowStatus(setInventoryRows, index, status, error),
    [],
  )

  const handleSoldierRowUpdate = useCallback(
    (index: number, status: "importing" | "imported" | "failed", error?: string) =>
      updateRowStatus(setSoldierRows, index, status, error),
    [],
  )

  const shouldCancel = useCallback(() => cancelledRef.current, [])

  const isInventoryReview = inventoryRows !== null
  const isSoldierReview = soldierRows !== null

  const inventoryColumns = inventoryMapping ? getInventoryColumns(inventoryMapping) : []
  const soldierColumns = soldierMapping ? getSoldierColumns(soldierMapping) : []

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} size="xl" closeOnInteractOutside={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mx="4" maxW="4xl" borderRadius="2xl" maxH="85vh" overflow="hidden">
            <Dialog.Header borderBottomWidth="1px" borderColor="border" pb="0">
              <Flex align="center" gap="2" pb="3">
                <FileSpreadsheet size={20} />
                <Dialog.Title>{t("settings.import.dialogTitle")}</Dialog.Title>
              </Flex>

              <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
                <Tabs.List>
                  <Tabs.Trigger value="inventory" disabled={isImporting}>
                    <Package size={14} />
                    {t("settings.import.tabInventory")}
                  </Tabs.Trigger>
                  <Tabs.Trigger value="soldiers" disabled={isImporting}>
                    <Users size={14} />
                    {t("settings.import.tabSoldiers")}
                  </Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>
            </Dialog.Header>

            <Dialog.Body overflowY="auto" py="4">
              {parseError && (
                <Box mb="4" p="3" bg="rose.50" borderRadius="lg">
                  <Text textStyle="sm" color="red.600">{parseError}</Text>
                </Box>
              )}

              {activeTab === "inventory" && (
                <>
                  {!isInventoryReview && (
                    <ImportPasteStep
                      entity="inventory"
                      onParse={handleParseInventory}
                      onImportFromUrl={handleImportFromUrl}
                    />
                  )}
                  {isInventoryReview && (
                    <ImportReviewStep
                      endpoint="inventory.upsert"
                      rows={inventoryRows}
                      columns={inventoryColumns}
                      onRowUpdate={handleInventoryRowUpdate}
                      onImportStart={handleImportStart}
                      onImportEnd={handleImportEnd}
                      shouldCancel={shouldCancel}
                      onBack={handleReset}
                    />
                  )}
                </>
              )}

              {activeTab === "soldiers" && (
                <>
                  {!isSoldierReview && (
                    <ImportPasteStep
                      entity="soldiers"
                      onParse={handleParseSoldiers}
                      onImportFromUrl={handleImportFromUrl}
                    />
                  )}
                  {isSoldierReview && (
                    <ImportReviewStep
                      endpoint="soldiers.upsert"
                      rows={soldierRows}
                      columns={soldierColumns}
                      onRowUpdate={handleSoldierRowUpdate}
                      onImportStart={handleImportStart}
                      onImportEnd={handleImportEnd}
                      shouldCancel={shouldCancel}
                      onBack={handleReset}
                    />
                  )}
                </>
              )}
            </Dialog.Body>

            {!isImporting && <Dialog.CloseTrigger />}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

const updateRowStatus = <T,>(
  setter: Dispatch<SetStateAction<ImportRow<T>[] | null>>,
  index: number,
  status: "importing" | "imported" | "failed",
  error?: string,
) => {
  setter((previous) => {
    if (!previous) return previous
    return previous.map((row) => {
      if (row.index !== index) return row
      return { ...row, status, errors: error ? [...row.errors, error] : row.errors }
    })
  })
}

const getRawCellByField = (row: ImportRow<unknown>, mapping: ColumnMapping, field: string): string => {
  const index = mapping[field]
  if (index === undefined) return ""
  return row.raw[index] ?? ""
}

const getInventoryColumns = (mapping: ColumnMapping): PreviewColumn<InventoryUpsertData>[] => [
  { key: "name", label: "שם פריט", width: "36", getValue: (row) => row.data?.name ?? getRawCellByField(row, mapping, "name") },
  { key: "itemNumber", label: "מק\"ט", width: "20", getValue: (row) => row.data?.itemNumber ?? getRawCellByField(row, mapping, "itemNumber") },
  { key: "category", label: "קטגוריה", width: "24", getValue: (row) => row.data?.category ?? getRawCellByField(row, mapping, "category") },
  { key: "initialQty", label: "כמות", width: "16", getValue: (row) => row.data?.initialQty !== undefined ? String(row.data.initialQty) : getRawCellByField(row, mapping, "initialQty") },
]

const getSoldierColumns = (mapping: ColumnMapping): PreviewColumn<SoldierUpsertData>[] => [
  { key: "personalId", label: "מ.א.", width: "20", getValue: (row) => row.data?.personalId ?? getRawCellByField(row, mapping, "personalId") },
  { key: "fullName", label: "שם מלא", width: "32", getValue: (row) => row.data?.fullName ?? getRawCellByField(row, mapping, "fullName") },
  { key: "rank", label: "דרגה", width: "16", getValue: (row) => row.data?.rank ?? getRawCellByField(row, mapping, "rank") },
  { key: "company", label: "פלוגה", width: "24", getValue: (row) => row.data?.company ?? getRawCellByField(row, mapping, "company") },
]

type ImportDialogProps = {
  open: boolean
  onOpenChange: (details: { open: boolean }) => void
}

type ImportSheetTextResponse = {
  text: string
  sheetName: string
  rowCount: number
}

type ParseImportTextParams<T> = {
  text: string
  aliases: Record<string, string[]>
  requiredFields: string[]
  hasRequiredColumns: (mapping: ColumnMapping) => boolean
  validateRows: (rows: string[][], mapping: ColumnMapping) => ImportRow<T>[]
  setMapping: Dispatch<SetStateAction<ColumnMapping | null>>
  setRows: Dispatch<SetStateAction<ImportRow<T>[] | null>>
  setParseError: Dispatch<SetStateAction<string | null>>
}

const parseImportText = <T,>({
  text,
  aliases,
  requiredFields,
  hasRequiredColumns,
  validateRows,
  setMapping,
  setRows,
  setParseError,
}: ParseImportTextParams<T>) => {
  setParseError(null)
  const allRows = parseSpreadsheetText(text)

  if (allRows.length < 2) {
    setParseError(t("settings.import.noData"))
    return
  }

  const dataRows = allRows.slice(1)
  if (dataRows.length > MAX_IMPORT_ROWS) {
    setParseError(`${t("settings.import.tooManyRows")} ${MAX_IMPORT_ROWS}`)
    return
  }

  const headerRow = allRows[0]
  const mapping = detectColumnMapping(headerRow, aliases)

  if (!hasRequiredColumns(mapping)) {
    const missing = getMissingColumns(mapping, requiredFields)
    setParseError(`${t("settings.import.missingColumns")} ${missing.join(", ")}`)
    return
  }

  setMapping(mapping)
  setRows(validateRows(dataRows, mapping))
}
