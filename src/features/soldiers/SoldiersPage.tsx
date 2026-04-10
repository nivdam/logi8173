import { useState } from "react"
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react"
import { UserSearch } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { ApiErrorState } from "../../components/ApiErrorState"
import { SearchInput } from "../../components/SearchInput"
import { FilterSelect } from "../../components/FilterSelect"
import { EmptyState } from "../../components/EmptyState"
import { t } from "../../lib/i18n"
import { filterSoldiers, sortSoldiers, getUniquePlatoons } from "../../lib/filters"
import { useSoldiers, useCompanies } from "../../api"
import { SoldiersTable } from "./SoldiersTable"
import type { SortConfig } from "../../components/SortableHeader"

export const SoldiersPage = () => {
  const {
    data: soldiers = [],
    error: soldiersError,
    isPending: isSoldiersPending,
    refetch: refetchSoldiers,
  } = useSoldiers()
  const {
    data: companies = [],
    error: companiesError,
    isPending: isCompaniesPending,
    refetch: refetchCompanies,
  } = useCompanies()
  const isLoading = isSoldiersPending || isCompaniesPending
  const [searchQuery, setSearchQuery] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string | undefined>(undefined)
  const [platoonFilter, setPlatoonFilter] = useState<string | undefined>(undefined)
  const [sort, setSort] = useState<SortConfig>({ key: "fullName", direction: "asc" })

  const companyOptions = companies.map((company) => ({
    value: company.name,
    label: company.name,
  }))

  const platoonOptions = getUniquePlatoons(soldiers, companyFilter).map((platoon) => ({
    value: platoon,
    label: platoon,
  }))

  const filtered = filterSoldiers(soldiers, searchQuery, companyFilter, platoonFilter)
  const sortedSoldiers = sortSoldiers(filtered, sort)

  const hasActiveFilters = searchQuery || companyFilter || platoonFilter

  const handleCompanyChange = (value: string | undefined) => {
    setCompanyFilter(value)
    setPlatoonFilter(undefined)
  }

  const clearAll = () => {
    setSearchQuery("")
    setCompanyFilter(undefined)
    setPlatoonFilter(undefined)
  }

  return (
    <VStack align="stretch" gap={{ base: "5", md: "7" }}>
      <PageHeader title={t("soldiers.title")} description={t("soldiers.description")} />

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
            color="sage.600"
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
          <Spinner size="lg" color="sage.400" />
        </Flex>
      ) : soldiersError || companiesError ? (
        <ApiErrorState
          title={t("soldiers.title")}
          error={soldiersError ?? companiesError}
          fallbackMessage={t("common.error")}
          actionLabel={t("common.retry")}
          onAction={() => {
            void refetchSoldiers()
            void refetchCompanies()
          }}
        />
      ) : sortedSoldiers.length > 0 ? (
        <SoldiersTable soldiers={sortedSoldiers} sort={sort} onSort={setSort} />
      ) : (
        <EmptyState
          icon={UserSearch}
          title={t("common.noResults")}
          description={t("soldiers.noResultsDescription")}
          actionLabel={t("soldiers.clearSearch")}
          onAction={clearAll}
        />
      )}
    </VStack>
  )
}
