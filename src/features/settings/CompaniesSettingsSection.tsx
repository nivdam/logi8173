import { useState } from "react"
import { Badge, Box, Flex, IconButton, Spinner, Text, Tooltip, VStack } from "@chakra-ui/react"
import { Building2, Pencil, Power, Trash2 } from "lucide-react"
import { useUpsertCompany } from "../../api"
import { ApiErrorState } from "../../components/ApiErrorState"
import { EmptyState } from "../../components/EmptyState"
import { showApiErrorToast } from "../../lib/api-error"
import { t } from "../../lib/i18n"
import { toaster } from "../../lib/toaster"
import type { Company } from "../../types"
import { CompanyDialog } from "./CompanyDialog"
import { SettingsSectionCard } from "./SettingsSectionCard"
import { sortCompanies } from "./settings-helpers"
import { animations } from "../../theme/animations"

export const CompaniesSettingsSection = ({
  companies,
  isLoading,
  error,
  onRetry,
}: CompaniesSettingsSectionProps) => {
  const upsertCompany = useUpsertCompany()
  const sortedCompanies = sortCompanies(companies)
  const [dialogTarget, setDialogTarget] = useState<Company | "add" | null>(null)
  const [dialogSessionKey, setDialogSessionKey] = useState(0)

  const isDialogOpen = dialogTarget !== null
  const selectedCompany = dialogTarget !== null && dialogTarget !== "add" ? dialogTarget : undefined

  const openAddDialog = () => {
    setDialogTarget("add")
    setDialogSessionKey((current) => current + 1)
  }

  const openEditDialog = (company: Company) => {
    setDialogTarget(company)
    setDialogSessionKey((current) => current + 1)
  }

  const handleDialogClose = (details: { open: boolean }) => {
    if (!details.open) {
      setDialogTarget(null)
    }
  }

  const handleSubmit = async (values: {
    companyId?: string
    name: string
    isActive: boolean
  }) => {
    try {
      await upsertCompany.mutateAsync(values)
      setDialogTarget(null)
      toaster.create({
        title: t("common.success"),
        description: selectedCompany
          ? t("settings.companies.updated")
          : t("settings.companies.created"),
        type: "success",
      })
    } catch (submitError) {
      showApiErrorToast({
        actionLabel: t("settings.companies.saveAction"),
        error: submitError,
        fallbackMessage: t("settings.companies.saveError"),
      })
    }
  }

  const handleToggleCompany = async (company: Company) => {
    const nextIsActive = !company.isActive
    const actionLabel = nextIsActive
      ? t("settings.companies.activateAction")
      : t("settings.companies.deleteAction")

    try {
      await upsertCompany.mutateAsync({
        companyId: company.companyId,
        name: company.name,
        isActive: nextIsActive,
      })
      toaster.create({
        title: t("common.success"),
        description: nextIsActive
          ? t("settings.companies.activated")
          : t("settings.companies.deleted"),
        type: "success",
      })
    } catch (submitError) {
      showApiErrorToast({
        actionLabel,
        error: submitError,
        fallbackMessage: t("settings.companies.saveError"),
      })
    }
  }

  return (
    <>
      <SettingsSectionCard
        title={t("settings.companies.title")}
        description={t("settings.companies.description")}
        actionLabel={t("settings.companies.addAction")}
        animationDelay={0.2}
        onAction={openAddDialog}
      >
        {isLoading ? (
          <Flex align="center" justify="center" py="12">
            <Spinner size="sm" />
          </Flex>
        ) : error ? (
          <ApiErrorState
            error={error}
            title={t("settings.companies.loadErrorTitle")}
            fallbackMessage={t("settings.companies.loadErrorDescription")}
            actionLabel={t("common.retry")}
            onAction={onRetry}
          />
        ) : sortedCompanies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t("settings.companies.emptyTitle")}
            description={t("settings.companies.emptyDescription")}
            actionLabel={t("settings.companies.addAction")}
            onAction={openAddDialog}
          />
        ) : (
          <VStack gap="2" align="stretch">
            {sortedCompanies.map((company, index) => (
              <Flex
                key={company.companyId}
                align="center"
                gap={{ base: "2", md: "3" }}
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                p={{ base: "2.5", md: "3" }}
                css={animations.listItem(index)}
              >
                <Box flex="1" minW="0">
                  <Flex align="center" gap="2">
                    <Text fontWeight="600" textStyle="sm" lineClamp={1}>
                      {company.name}
                    </Text>
                    <Badge
                      colorPalette={company.isActive ? "green" : "gray"}
                      variant="subtle"
                      flexShrink={0}
                    >
                      {company.isActive
                        ? t("settings.companies.active")
                        : t("settings.companies.inactive")}
                    </Badge>
                  </Flex>
                </Box>

                <Flex gap="1" flexShrink={0}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={t("common.edit")}
                    onClick={() => openEditDialog(company)}
                  >
                    <Pencil size={14} />
                  </IconButton>

                  <Tooltip.Root positioning={{ placement: "top" }}>
                    <Tooltip.Trigger asChild>
                      <IconButton
                        variant="ghost"
                        colorPalette={company.isActive ? "red" : "green"}
                        size="sm"
                        aria-label={
                          company.isActive
                            ? t("settings.companies.deleteAction")
                            : t("settings.companies.activateAction")
                        }
                        loading={upsertCompany.isPending}
                        onClick={() => {
                          void handleToggleCompany(company)
                        }}
                      >
                        {company.isActive ? <Trash2 size={14} /> : <Power size={14} />}
                      </IconButton>
                    </Tooltip.Trigger>
                    <Tooltip.Positioner>
                      <Tooltip.Content>
                        {company.isActive
                          ? t("settings.companies.deleteAction")
                          : t("settings.companies.activateAction")}
                      </Tooltip.Content>
                    </Tooltip.Positioner>
                  </Tooltip.Root>
                </Flex>
              </Flex>
            ))}
          </VStack>
        )}
      </SettingsSectionCard>

      <CompanyDialog
        open={isDialogOpen}
        company={selectedCompany}
        isSaving={upsertCompany.isPending}
        resetKey={dialogSessionKey}
        onOpenChange={handleDialogClose}
        onSubmit={handleSubmit}
      />
    </>
  )
}

type CompaniesSettingsSectionProps = {
  companies: Company[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}
