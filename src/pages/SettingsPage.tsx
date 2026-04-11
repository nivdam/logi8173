import { SimpleGrid, VStack } from "@chakra-ui/react"
import { useCompanies, useOperators } from "../api"
import { PageHeader } from "../components/PageHeader"
import { CompaniesSettingsSection } from "../features/settings/CompaniesSettingsSection"
import { OperatorsSettingsSection } from "../features/settings/OperatorsSettingsSection"
import { t } from "../lib/i18n"

export const SettingsPage = () => {
  const operatorsQuery = useOperators()
  const companiesQuery = useCompanies()

  const handleRetryOperators = () => {
    void operatorsQuery.refetch()
  }

  const handleRetryCompanies = () => {
    void companiesQuery.refetch()
  }

  return (
    <VStack align="stretch" gap="6">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="6" alignItems="start">
        <OperatorsSettingsSection
          operators={operatorsQuery.data ?? []}
          isLoading={operatorsQuery.isPending}
          error={operatorsQuery.error}
          onRetry={handleRetryOperators}
        />
        <CompaniesSettingsSection
          companies={companiesQuery.data ?? []}
          isLoading={companiesQuery.isPending}
          error={companiesQuery.error}
          onRetry={handleRetryCompanies}
        />
      </SimpleGrid>
    </VStack>
  )
}
