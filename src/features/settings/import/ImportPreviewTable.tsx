import { Box, Flex, Text } from "@chakra-ui/react"
import { t } from "../../../lib/i18n"
import type { ImportRow, ImportRowStatus } from "./import-types"

export const ImportPreviewTable = <T,>({ rows, columns, showErrorsOnly }: ImportPreviewTableProps<T>) => {
  const visibleRows = showErrorsOnly
    ? rows.filter((row) => row.status === "invalid" || row.status === "duplicate_in_file" || row.status === "failed")
    : rows

  if (visibleRows.length === 0) {
    return (
      <Text textStyle="sm" color="fg.muted" textAlign="center" py="6">
        {showErrorsOnly ? t("common.noResults") : t("settings.import.noData")}
      </Text>
    )
  }

  return (
    <Box overflowX="auto" borderWidth="1px" borderColor="border" borderRadius="xl">
      {/* Header */}
      <Flex
        bg="bg.muted"
        borderBottomWidth="1px"
        borderColor="border"
        px="3"
        py="2"
        gap="2"
        minW="fit-content"
      >
        <Text textStyle="xs" fontWeight="600" color="fg.muted" w="12" flexShrink={0}>
          {t("settings.import.rowNumber")}
        </Text>
        {columns.map((column) => (
          <Text key={column.key} textStyle="xs" fontWeight="600" color="fg.muted" w={column.width} flexShrink={0}>
            {column.label}
          </Text>
        ))}
        <Text textStyle="xs" fontWeight="600" color="fg.muted" w="20" flexShrink={0}>
          {t("settings.import.status")}
        </Text>
        <Text textStyle="xs" fontWeight="600" color="fg.muted" flex="1" minW="32">
          {t("settings.import.errors")}
        </Text>
      </Flex>

      {/* Rows */}
      {visibleRows.map((row) => (
        <Flex
          key={row.index}
          px="3"
          py="2"
          gap="2"
          borderBottomWidth="1px"
          borderColor="border"
          bg={getRowBackground(row.status)}
          minW="fit-content"
          _last={{ borderBottomWidth: "0" }}
        >
          <Text textStyle="xs" color="fg.muted" w="12" flexShrink={0}>
            {row.index + 1}
          </Text>
          {columns.map((column) => (
            <Text key={column.key} textStyle="xs" w={column.width} flexShrink={0} truncate>
              {column.getValue(row)}
            </Text>
          ))}
          <Flex w="20" flexShrink={0}>
            <ImportStatusBadge status={row.status} />
          </Flex>
          <Text textStyle="xs" color="red.600" flex="1" minW="32">
            {row.errors.join(", ")}
          </Text>
        </Flex>
      ))}
    </Box>
  )
}

const ImportStatusBadge = ({ status }: { status: ImportRowStatus }) => {
  const { label, bg, color } = getStatusStyle(status)

  return (
    <Flex px="2" py="0.5" borderRadius="full" bg={bg} aria-label={label}>
      <Text textStyle="xs" fontWeight="500" color={color}>
        {label}
      </Text>
    </Flex>
  )
}

const getStatusStyle = (status: ImportRowStatus): { label: string; bg: string; color: string } => {
  if (status === "will_create") return { label: "חדש", bg: "forest.50", color: "forest.700" }
  if (status === "will_update") return { label: "עדכון", bg: "sky.50", color: "sky.700" }
  if (status === "invalid") return { label: "שגיאה", bg: "rose.50", color: "red.600" }
  if (status === "duplicate_in_file") return { label: "כפול", bg: "sunburst.400/10", color: "sunburst.400" }
  if (status === "importing") return { label: "מייבא...", bg: "sky.50", color: "sky.600" }
  if (status === "imported") return { label: "הושלם", bg: "forest.50", color: "forest.700" }
  return { label: "נכשל", bg: "rose.50", color: "red.600" }
}

const getRowBackground = (status: ImportRowStatus): string => {
  if (status === "invalid" || status === "failed") return "rose.50/30"
  if (status === "duplicate_in_file") return "sunburst.400/5"
  if (status === "imported") return "forest.50/30"
  return "transparent"
}

type PreviewColumn<T> = {
  key: string
  label: string
  width: string
  getValue: (row: ImportRow<T>) => string
}

type ImportPreviewTableProps<T> = {
  rows: ImportRow<T>[]
  columns: PreviewColumn<T>[]
  showErrorsOnly: boolean
}

export type { PreviewColumn }
