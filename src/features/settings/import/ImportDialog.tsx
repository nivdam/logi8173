import { useState, useCallback, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Box, Dialog, Flex, Portal, Tabs, Text } from "@chakra-ui/react"
import { FileSpreadsheet, Package, Users } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useInventory, useSoldiers } from "../../../api"
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
import type { ImportRow, ImportEntity } from "./import-types"
import type { InventoryUpsertData, SoldierUpsertData } from "./import-parsers"

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const [activeTab, setActiveTab] = useState<ImportEntity>("inventory")
  const [inventoryRows, setInventoryRows] = useState<ImportRow<InventoryUpsertData>[] | null>(null)
  const [soldierRows, setSoldierRows] = useState<ImportRow<SoldierUpsertData>[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const cancelledRef = useRef(false)

  const queryClient = useQueryClient()
  const { data: existingInventory = [] } = useInventory()
  const { data: existingSoldiers = [] } = useSoldiers()

  const handleReset = () => {
    setInventoryRows(null)
    setSoldierRows(null)
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
    setParseError(null)
    const allRows = parseSpreadsheetText(text)
    if (allRows.length < 2) {
      setParseError(t("settings.import.noData"))
      return
    }

    const headerRow = allRows[0]
    const dataRows = allRows.slice(1)
    const mapping = detectColumnMapping(headerRow, INVENTORY_HEADER_ALIASES)

    if (!hasRequiredInventoryColumns(mapping)) {
      const missing = getMissingColumns(mapping, ["name", "category"])
      setParseError(`${t("settings.import.missingColumns")} ${missing.join(", ")}`)
      return
    }

    const validated = validateInventoryRows(dataRows, mapping, existingInventory)
    setInventoryRows(validated)
  }

  const handleParseSoldiers = (text: string) => {
    setParseError(null)
    const allRows = parseSpreadsheetText(text)
    if (allRows.length < 2) {
      setParseError(t("settings.import.noData"))
      return
    }

    const headerRow = allRows[0]
    const dataRows = allRows.slice(1)
    const mapping = detectColumnMapping(headerRow, SOLDIER_HEADER_ALIASES)

    if (!hasRequiredSoldierColumns(mapping)) {
      const missing = getMissingColumns(mapping, ["personalId", "fullName", "rank", "company"])
      setParseError(`${t("settings.import.missingColumns")} ${missing.join(", ")}`)
      return
    }

    const validated = validateSoldierRows(dataRows, mapping, existingSoldiers)
    setSoldierRows(validated)
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
                    <ImportPasteStep entity="inventory" onParse={handleParseInventory} />
                  )}
                  {isInventoryReview && (
                    <ImportReviewStep
                      endpoint="inventory.upsert"
                      rows={inventoryRows}
                      columns={INVENTORY_COLUMNS}
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
                    <ImportPasteStep entity="soldiers" onParse={handleParseSoldiers} />
                  )}
                  {isSoldierReview && (
                    <ImportReviewStep
                      endpoint="soldiers.upsert"
                      rows={soldierRows}
                      columns={SOLDIER_COLUMNS}
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

const getRawCell = (row: ImportRow<unknown>, index: number): string => row.raw[index] ?? ""

const INVENTORY_COLUMNS: PreviewColumn<InventoryUpsertData>[] = [
  { key: "name", label: "שם פריט", width: "36", getValue: (row) => row.data?.name ?? getRawCell(row, 0) },
  { key: "itemNumber", label: "מק\"ט", width: "20", getValue: (row) => row.data?.itemNumber ?? getRawCell(row, 1) },
  { key: "category", label: "קטגוריה", width: "24", getValue: (row) => row.data?.category ?? getRawCell(row, 2) },
  { key: "initialQty", label: "כמות", width: "16", getValue: (row) => row.data?.initialQty !== undefined ? String(row.data.initialQty) : getRawCell(row, 4) },
]

const SOLDIER_COLUMNS: PreviewColumn<SoldierUpsertData>[] = [
  { key: "personalId", label: "מ.א.", width: "20", getValue: (row) => row.data?.personalId ?? getRawCell(row, 0) },
  { key: "fullName", label: "שם מלא", width: "32", getValue: (row) => row.data?.fullName ?? getRawCell(row, 1) },
  { key: "rank", label: "דרגה", width: "16", getValue: (row) => row.data?.rank ?? getRawCell(row, 2) },
  { key: "company", label: "פלוגה", width: "24", getValue: (row) => row.data?.company ?? getRawCell(row, 3) },
]

type ImportDialogProps = {
  open: boolean
  onOpenChange: (details: { open: boolean }) => void
}
