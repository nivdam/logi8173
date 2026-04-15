import { Button, Flex, Text } from "@chakra-ui/react"
import { ArrowRight, Check, Download, Filter } from "lucide-react"
import { useRef, useState } from "react"
import { t } from "../../../lib/i18n"
import { ImportPreviewTable } from "./ImportPreviewTable"
import type { PreviewColumn } from "./ImportPreviewTable"
import type { ImportRow, ImportResult, ImportEntity } from "./import-types"
import type { InventoryUpsertData, SoldierUpsertData } from "./import-parsers"
import { runInventoryImport, runSoldiersImport } from "./import-runner"

export const ImportReviewStep = <T extends InventoryUpsertData | SoldierUpsertData>({
  entity,
  rows,
  columns,
  onRowUpdate,
  onImportStart,
  onImportEnd,
  shouldCancel,
  onBack,
}: ImportReviewStepProps<T>) => {
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)
  const importStartedRef = useRef(false)

  const willCreateCount = rows.filter((row) => row.status === "will_create").length
  const willUpdateCount = rows.filter((row) => row.status === "will_update").length
  const invalidCount = rows.filter((row) => row.status === "invalid" || row.status === "duplicate_in_file").length
  const importableCount = willCreateCount + willUpdateCount
  const isImportDisabled = importableCount === 0 || isImporting

  const handleImport = async () => {
    if (importStartedRef.current) return
    importStartedRef.current = true
    setIsImporting(true)
    onImportStart()

    const handleRowUpdate = (index: number, status: "importing" | "imported" | "failed", error?: string) => {
      onRowUpdate(index, status, error)
    }

    const importResult = entity === "inventory"
      ? await runInventoryImport(rows as ImportRow<InventoryUpsertData>[], handleRowUpdate, shouldCancel)
      : await runSoldiersImport(rows as ImportRow<SoldierUpsertData>[], handleRowUpdate, shouldCancel)

    setResult(importResult)
    setIsImporting(false)
    onImportEnd()
  }

  const handleToggleErrorsOnly = () => {
    setShowErrorsOnly((previous) => !previous)
  }

  return (
    <Flex direction="column" gap="4">
      {/* Summary bar */}
      <Flex
        gap="4"
        p="3"
        bg="bg.muted"
        borderRadius="lg"
        flexWrap="wrap"
        align="center"
        justify="space-between"
      >
        <Flex gap="4" flexWrap="wrap">
          {willCreateCount > 0 && (
            <ImportSummaryBadge count={willCreateCount} label={t("settings.import.willCreate")} color="sage.700" bg="sage.50" />
          )}
          {willUpdateCount > 0 && (
            <ImportSummaryBadge count={willUpdateCount} label={t("settings.import.willUpdate")} color="sky.700" bg="sky.50" />
          )}
          {invalidCount > 0 && (
            <ImportSummaryBadge count={invalidCount} label={t("settings.import.invalid")} color="red.600" bg="rose.50" />
          )}
        </Flex>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleToggleErrorsOnly}
          aria-pressed={showErrorsOnly}
        >
          <Filter size={14} />
          {t("settings.import.showErrorsOnly")}
        </Button>
      </Flex>

      {/* Result banner */}
      {result && (
        <Flex
          p="3"
          borderRadius="lg"
          bg={result.failedCount > 0 ? "sunburst.400/10" : "sage.50"}
          gap="3"
          align="center"
          flexWrap="wrap"
        >
          <Check size={16} />
          <Text textStyle="sm" fontWeight="600">{t("settings.import.importComplete")}</Text>
          <Text textStyle="sm">
            {result.createdCount} {t("settings.import.created")},
            {" "}{result.updatedCount} {t("settings.import.updated")}
            {result.failedCount > 0 && `, ${result.failedCount} ${t("settings.import.failed")}`}
          </Text>
        </Flex>
      )}

      {/* Preview table */}
      <ImportPreviewTable rows={rows} columns={columns} showErrorsOnly={showErrorsOnly} />

      {/* Actions */}
      <Flex justify="space-between" align="center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isImporting}
        >
          <ArrowRight size={16} />
          {t("settings.import.backToPaste")}
        </Button>

        {!result && (
          <Button
            size="sm"
            bg="sage.600"
            color="white"
            _hover={{ bg: "sage.700" }}
            disabled={isImportDisabled}
            onClick={handleImport}
          >
            <Download size={16} />
            {isImporting ? t("settings.import.importing") : `${t("settings.import.importAction")} (${importableCount})`}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

const ImportSummaryBadge = ({ count, label, color, bg }: { count: number; label: string; color: string; bg: string }) => (
  <Flex px="2.5" py="1" borderRadius="full" bg={bg} gap="1.5" align="center">
    <Text textStyle="xs" fontWeight="700" color={color}>{count}</Text>
    <Text textStyle="xs" color={color}>{label}</Text>
  </Flex>
)

type ImportReviewStepProps<T> = {
  entity: ImportEntity
  rows: ImportRow<T>[]
  columns: PreviewColumn<T>[]
  onRowUpdate: (index: number, status: "importing" | "imported" | "failed", error?: string) => void
  onImportStart: () => void
  onImportEnd: () => void
  shouldCancel: () => boolean
  onBack: () => void
}
