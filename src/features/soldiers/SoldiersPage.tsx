import { useMemo, useState } from "react"
import { Button, Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { Download, UserSearch, Users } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { ApiErrorState } from "../../components/ApiErrorState"
import { SearchInput } from "../../components/SearchInput"
import { FilterSelect } from "../../components/FilterSelect"
import { EmptyState } from "../../components/EmptyState"
import { t } from "../../lib/i18n"
import { filterSoldiers, sortSoldiers, getUniquePlatoons } from "../../lib/filters"
import { useActiveActivity } from "../../lib/active-activity-context"
import { canWrite } from "../../lib/auth-helpers"
import { useAuth } from "../../lib/use-auth"
import { useSoldiers, useActivitySoldiers, useCompanies } from "../../api"
import { SoldiersTable } from "./SoldiersTable"
import { ImportFromMasterDialog } from "./ImportFromMasterDialog"
import type { SortConfig } from "../../components/SortableHeader"

export const SoldiersPage = () => {
  const { operator } = useAuth()
  const { activeActivityId, activeActivity, isResolving } = useActiveActivity()
  const masterSoldiersQuery = useSoldiers({ enabled: !isResolving && !activeActivityId })
  const activitySoldiersQuery = useActivitySoldiers(activeActivityId, { enabled: !isResolving })
  const soldiersQuery = activeActivityId ? activitySoldiersQuery : masterSoldiersQuery
  const {
    data: soldiers = [],
    error: soldiersError,
    isPending: isSoldiersPending,
    refetch: refetchSoldiers,
  } = soldiersQuery
  const {
    data: companies = [],
    error: companiesError,
    isPending: isCompaniesPending,
    refetch: refetchCompanies,
  } = useCompanies()
  const isLoading = isResolving || isSoldiersPending || isCompaniesPending
  const [searchQuery, setSearchQuery] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string | undefined>(undefined)
  const [platoonFilter, setPlatoonFilter] = useState<string | undefined>(undefined)
  const [sort, setSort] = useState<SortConfig>({ key: "fullName", direction: "asc" })
  const [isImportOpen, setIsImportOpen] = useState(false)

  const isActivityMode = !!activeActivityId
  const isActivityOpen = activeActivity?.status === "active"
  const canImportFromMaster = !!operator && canWrite(operator.role) && isActivityMode && isActivityOpen

  const existingPersonalIds = useMemo(
    () => new Set(soldiers.map((soldier) => soldier.personalId)),
    [soldiers],
  )

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.name,
        label: company.name,
      })),
    [companies],
  )

  const platoonOptions = useMemo(
    () =>
      getUniquePlatoons(soldiers, companyFilter).map((platoon) => ({
        value: platoon,
        label: platoon,
      })),
    [soldiers, companyFilter],
  )

  const filtered = useMemo(
    () => filterSoldiers(soldiers, searchQuery, companyFilter, platoonFilter),
    [soldiers, searchQuery, companyFilter, platoonFilter],
  )
  const sortedSoldiers = useMemo(
    () => sortSoldiers(filtered, sort),
    [filtered, sort],
  )

  const hasActiveFilters = searchQuery || companyFilter || platoonFilter

  const handleCompanyChange = (value: string | undefined) => {
    setCompanyFilter(value)
    setPlatoonFilter(undefined)
  }

  const handleRetry = () => {
    void refetchSoldiers()
    void refetchCompanies()
  }

  const clearAll = () => {
    setSearchQuery("")
    setCompanyFilter(undefined)
    setPlatoonFilter(undefined)
  }

  const handleOpenImport = () => {
    setIsImportOpen(true)
  }

  const handleImportOpenChange = (open: boolean) => {
    setIsImportOpen(open)
  }

  const isEmptyActivityState =
    isActivityMode && !hasActiveFilters && soldiers.length === 0

  return (
    <VStack align="stretch" gap={{ base: "5", md: "7" }}>
      <Flex justify="space-between" align="start" flexWrap="wrap" gap="3">
        <PageHeader title={t("soldiers.title")} description={t("soldiers.description")} />
        {canImportFromMaster && soldiers.length > 0 ? (
          <Button
            size="sm"
            variant="outline"
            borderRadius="lg"
            onClick={handleOpenImport}
          >
            <Download size={14} />
            {t("soldiers.importAction")}
          </Button>
        ) : null}
      </Flex>

      <Flex gap="3" flexWrap="wrap" align="center">
        <SearchInput placeholder={t("soldiers.searchPlaceholder")} onSearch={setSearchQuery} />
        <FilterSelect
          label={t("soldiers.allCompanies")}
          value={companyFilter}
          options={companyOptions}
          onChange={handleCompanyChange}
        />
        <FilterSelect
          label={t("soldiers.allPlatoons")}
          value={platoonFilter}
          options={platoonOptions}
          onChange={setPlatoonFilter}
        />
        {hasActiveFilters ? (
          <Text
            textStyle="xs"
            color="forest.600"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={clearAll}
          >
            {t("soldiers.clearSearch")}
          </Text>
        ) : null}
      </Flex>

      {isLoading ? (
        <Flex justify="center" py="16">
          <Spinner size="lg" color="forest.400" />
        </Flex>
      ) : soldiersError || companiesError ? (
        <ApiErrorState
          title={t("soldiers.title")}
          error={soldiersError ?? companiesError}
          fallbackMessage={t("common.error")}
          actionLabel={t("common.retry")}
          onAction={handleRetry}
        />
      ) : sortedSoldiers.length > 0 ? (
        <SoldiersTable soldiers={sortedSoldiers} sort={sort} onSort={setSort} />
      ) : isEmptyActivityState ? (
        <EmptyState
          icon={Users}
          title={t("soldiers.activityEmptyTitle")}
          description={t("soldiers.activityEmptyDescription")}
          actionLabel={canImportFromMaster ? t("soldiers.importAction") : undefined}
          onAction={canImportFromMaster ? handleOpenImport : undefined}
        />
      ) : (
        <EmptyState
          icon={UserSearch}
          title={t("common.noResults")}
          description={t("soldiers.noResultsDescription")}
          actionLabel={t("soldiers.clearSearch")}
          onAction={clearAll}
        />
      )}

      {activeActivityId ? (
        <ImportFromMasterDialog
          open={isImportOpen}
          activityId={activeActivityId}
          existingPersonalIds={existingPersonalIds}
          onOpenChange={handleImportOpenChange}
        />
      ) : null}
    </VStack>
  )
}
