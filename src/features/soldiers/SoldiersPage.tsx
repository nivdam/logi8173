import { useState } from "react"
import { Flex, VStack } from "@chakra-ui/react"
import { UserSearch } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { SearchInput } from "../../components/SearchInput"
import { EmptyState } from "../../components/EmptyState"
import { t } from "../../lib/i18n"
import { filterSoldiers } from "../../lib/filters"
import { soldiersMock } from "../../mocks/soldiers.mock"
import { SoldiersTable } from "./SoldiersTable"

export const SoldiersPage = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSoldiers = filterSoldiers(soldiersMock, searchQuery, undefined)

  return (
    <VStack align="stretch" gap="5">
      <PageHeader title={t("soldiers.title")} description={t("soldiers.description")} />
      <Flex gap="3" flexWrap="wrap">
        <SearchInput placeholder={t("soldiers.searchPlaceholder")} onSearch={setSearchQuery} />
      </Flex>
      {filteredSoldiers.length > 0 ? (
        <SoldiersTable soldiers={filteredSoldiers} />
      ) : (
        <EmptyState
          icon={UserSearch}
          title={t("common.noResults")}
          description={t("soldiers.noResultsDescription")}
          actionLabel={t("soldiers.clearSearch")}
          onAction={() => setSearchQuery("")}
        />
      )}
    </VStack>
  )
}
