import { useState } from "react"
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Portal,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import { Pencil, Trash2, Users } from "lucide-react"
import { useDeleteOperator, useUpsertOperator } from "../../api"
import { ApiErrorState } from "../../components/ApiErrorState"
import { EmptyState } from "../../components/EmptyState"
import { useAuth } from "../../lib/use-auth"
import { t } from "../../lib/i18n"
import { showApiErrorToast } from "../../lib/api-error"
import { toaster } from "../../lib/toaster"
import { animations } from "../../theme/animations"
import type { AuthenticatedOperator } from "../../lib/auth.types"
import { OperatorDialog } from "./OperatorDialog"
import { SettingsSectionCard } from "./SettingsSectionCard"
import { sortOperators } from "./settings-helpers"

export const OperatorsSettingsSection = ({
  operators,
  isLoading,
  error,
  onRetry,
}: OperatorsSettingsSectionProps) => {
  const { operator: currentOperator } = useAuth()
  const upsertOperator = useUpsertOperator()
  const deleteOperator = useDeleteOperator()
  const sortedOperators = sortOperators(operators)
  const adminCount = sortedOperators.filter((operator) => operator.role === "admin").length
  const [dialogTarget, setDialogTarget] = useState<AuthenticatedOperator | "add" | null>(null)
  const [dialogSessionKey, setDialogSessionKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<AuthenticatedOperator | null>(null)

  const isDialogOpen = dialogTarget !== null
  const selectedOperator = dialogTarget !== null && dialogTarget !== "add" ? dialogTarget : undefined

  const openAddDialog = () => {
    setDialogTarget("add")
    setDialogSessionKey((current) => current + 1)
  }

  const openEditDialog = (operator: AuthenticatedOperator) => {
    setDialogTarget(operator)
    setDialogSessionKey((current) => current + 1)
  }

  const handleDialogClose = (details: { open: boolean }) => {
    if (!details.open) {
      setDialogTarget(null)
    }
  }

  const handleSubmit = async (values: {
    email: string
    fullName: string
    role: AuthenticatedOperator["role"]
    savedSignatureUrl?: string
  }) => {
    try {
      await upsertOperator.mutateAsync(values)
      setDialogTarget(null)
      toaster.create({
        title: t("common.success"),
        description: selectedOperator
          ? t("settings.operators.updated")
          : t("settings.operators.created"),
        type: "success",
      })
    } catch (submitError) {
      showApiErrorToast({
        actionLabel: t("settings.operators.saveAction"),
        error: submitError,
        fallbackMessage: t("settings.operators.saveError"),
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await deleteOperator.mutateAsync(deleteTarget.email)
      setDeleteTarget(null)
      toaster.create({
        title: t("common.success"),
        description: t("settings.operators.deleted"),
        type: "success",
      })
    } catch (deleteError) {
      showApiErrorToast({
        actionLabel: t("settings.operators.deleteAction"),
        error: deleteError,
        fallbackMessage: t("settings.operators.deleteError"),
      })
    }
  }

  const handleDeleteDialogClose = (details: { open: boolean }) => {
    if (!details.open) {
      setDeleteTarget(null)
    }
  }

  const isCurrentOperator = (operator: AuthenticatedOperator) =>
    currentOperator?.email === operator.email

  const isLastAdmin = (operator: AuthenticatedOperator) =>
    operator.role === "admin" && adminCount <= 1

  const getDeleteTooltip = (operator: AuthenticatedOperator) => {
    if (isCurrentOperator(operator)) return t("settings.operators.deleteSelfHint")
    if (isLastAdmin(operator)) return t("settings.operators.deleteLastAdminHint")
    return undefined
  }

  return (
    <>
      <SettingsSectionCard
        title={t("settings.operators.title")}
        description={t("settings.operators.description")}
        actionLabel={t("settings.operators.addAction")}
        animationDelay={0.1}
        onAction={openAddDialog}
      >
        {isLoading ? (
          <Flex align="center" justify="center" py="12">
            <Spinner size="sm" />
          </Flex>
        ) : error ? (
          <ApiErrorState
            error={error}
            title={t("settings.operators.loadErrorTitle")}
            fallbackMessage={t("settings.operators.loadErrorDescription")}
            actionLabel={t("common.retry")}
            onAction={onRetry}
          />
        ) : sortedOperators.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t("settings.operators.emptyTitle")}
            description={t("settings.operators.emptyDescription")}
            actionLabel={t("settings.operators.addAction")}
            onAction={openAddDialog}
          />
        ) : (
          <VStack gap="2" align="stretch">
            {sortedOperators.map((operator, index) => {
              const isDeleteDisabled =
                deleteOperator.isPending ||
                isCurrentOperator(operator) ||
                isLastAdmin(operator)
              const deleteTooltipContent = getDeleteTooltip(operator)

              return (
                <Flex
                  key={operator.email}
                  data-testid="operator-card"
                  data-operator-email={operator.email}
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
                        {operator.fullName || operator.email}
                      </Text>
                      <Badge colorPalette="sage" variant="subtle" flexShrink={0}>
                        {t(`roles.${operator.role}`)}
                      </Badge>
                      {isCurrentOperator(operator) ? (
                        <Text textStyle="xs" color="fg.muted" flexShrink={0} display={{ base: "none", md: "block" }}>
                          {t("settings.operators.currentOperator")}
                        </Text>
                      ) : null}
                    </Flex>
                    <Text textStyle="xs" color="fg.muted" lineClamp={1}>
                      {operator.email}
                    </Text>
                  </Box>

                  <Flex gap="1" flexShrink={0}>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      aria-label={t("common.edit")}
                      onClick={() => openEditDialog(operator)}
                    >
                      <Pencil size={14} />
                    </IconButton>

                    {deleteTooltipContent ? (
                      <Tooltip.Root positioning={{ placement: "top" }}>
                        <Tooltip.Trigger asChild>
                          <IconButton
                            variant="ghost"
                            colorPalette="red"
                            size="sm"
                            aria-label={t("settings.operators.deleteAction")}
                            loading={deleteOperator.isPending}
                            disabled={isDeleteDisabled}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Tooltip.Trigger>
                        <Tooltip.Positioner>
                          <Tooltip.Content>{deleteTooltipContent}</Tooltip.Content>
                        </Tooltip.Positioner>
                      </Tooltip.Root>
                    ) : (
                      <IconButton
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        aria-label={t("settings.operators.deleteAction")}
                        loading={deleteOperator.isPending}
                        disabled={isDeleteDisabled}
                        onClick={() => setDeleteTarget(operator)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    )}
                  </Flex>
                </Flex>
              )
            })}
          </VStack>
        )}
      </SettingsSectionCard>

      <OperatorDialog
        open={isDialogOpen}
        operator={selectedOperator}
        isSaving={upsertOperator.isPending}
        resetKey={dialogSessionKey}
        onOpenChange={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <Dialog.Root open={deleteTarget !== null} onOpenChange={handleDeleteDialogClose}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mx="4" maxW="sm">
              <Dialog.Header>
                <Dialog.Title>{t("settings.operators.deleteConfirm")}</Dialog.Title>
                <Dialog.Description>
                  {deleteTarget?.fullName || deleteTarget?.email}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost">{t("common.cancel")}</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  loading={deleteOperator.isPending}
                  onClick={() => {
                    void handleDeleteConfirm()
                  }}
                >
                  {t("settings.operators.deleteAction")}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

type OperatorsSettingsSectionProps = {
  operators: AuthenticatedOperator[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}
