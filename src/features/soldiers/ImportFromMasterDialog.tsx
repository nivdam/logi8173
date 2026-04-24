import { useEffect, useMemo, useState } from "react"
import { Box, Button, Checkbox, Dialog, Flex, Portal, Spinner, Stack, Text } from "@chakra-ui/react"
import { SearchInput } from "../../components/SearchInput"
import { EmptyState } from "../../components/EmptyState"
import { ApiErrorState } from "../../components/ApiErrorState"
import { useImportSoldiersFromMaster, useSoldiers } from "../../api"
import { showApiErrorToast } from "../../lib/api-error"
import { toaster } from "../../lib/toaster"
import { t } from "../../lib/i18n"
import type { Soldier } from "../../types"
import { UserSearch } from "lucide-react"

export const ImportFromMasterDialog = ({
  open,
  activityId,
  existingPersonalIds,
  onOpenChange,
}: ImportFromMasterDialogProps) => {
  const {
    data: masterSoldiers = [],
    isPending: isMasterLoading,
    error: masterError,
    refetch: refetchMaster,
  } = useSoldiers({ enabled: open })
  const importMutation = useImportSoldiersFromMaster()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPersonalIds, setSelectedPersonalIds] = useState<Set<string>>(
    () => new Set<string>(),
  )

  useEffect(() => {
    if (open) return
    setSearchQuery("")
    setSelectedPersonalIds(new Set<string>())
  }, [open])

  const importableSoldiers = useMemo(
    () => masterSoldiers.filter((soldier) => !existingPersonalIds.has(soldier.personalId)),
    [masterSoldiers, existingPersonalIds],
  )

  const visibleSoldiers = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return importableSoldiers
    return importableSoldiers.filter((soldier) =>
      matchesQuery(soldier, normalized),
    )
  }, [importableSoldiers, searchQuery])

  const selectedVisibleCount = useMemo(
    () =>
      visibleSoldiers.reduce(
        (count, soldier) => (selectedPersonalIds.has(soldier.personalId) ? count + 1 : count),
        0,
      ),
    [visibleSoldiers, selectedPersonalIds],
  )

  const areAllVisibleSelected =
    visibleSoldiers.length > 0 && selectedVisibleCount === visibleSoldiers.length

  const handleToggleSoldier = (personalId: string) => {
    setSelectedPersonalIds((current) => {
      const next = new Set(current)
      if (next.has(personalId)) {
        next.delete(personalId)
      } else {
        next.add(personalId)
      }
      return next
    })
  }

  const handleToggleSelectAllVisible = () => {
    setSelectedPersonalIds((current) => {
      const next = new Set(current)
      if (areAllVisibleSelected) {
        visibleSoldiers.forEach((soldier) => next.delete(soldier.personalId))
      } else {
        visibleSoldiers.forEach((soldier) => next.add(soldier.personalId))
      }
      return next
    })
  }

  const handleClearSelection = () => {
    setSelectedPersonalIds(new Set<string>())
  }

  const handleRetryMaster = () => {
    void refetchMaster()
  }

  const handleDialogOpenChange = (details: { open: boolean }) => {
    if (importMutation.isPending) return
    onOpenChange(details.open)
  }

  const handleClose = () => {
    if (importMutation.isPending) return
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (importMutation.isPending) return
    if (selectedPersonalIds.size === 0) return

    importMutation.mutate(
      {
        activityId,
        personalIds: Array.from(selectedPersonalIds),
      },
      {
        onSuccess: (result) => {
          toaster.create({
            title: t("soldiers.importSuccessTitle"),
            description: t("soldiers.importSuccessDescription")
              .replace("{imported}", String(result.imported))
              .replace("{skipped}", String(result.skipped)),
            type: "success",
            duration: 4000,
          })
          onOpenChange(false)
        },
        onError: (error) => {
          showApiErrorToast({
            actionLabel: t("soldiers.importActionLabel"),
            error,
          })
          if (isActivityStateError(error)) {
            onOpenChange(false)
          }
        },
      },
    )
  }

  const selectedCount = selectedPersonalIds.size
  const hasSelection = selectedCount > 0
  const isLoading = isMasterLoading && importableSoldiers.length === 0

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleDialogOpenChange}
      closeOnEscape={!importMutation.isPending}
      closeOnInteractOutside={!importMutation.isPending}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mx="4" maxW="xl" maxH="90vh" display="flex" flexDirection="column">
            <Dialog.Header flexShrink={0}>
              <Dialog.Title>{t("soldiers.importDialogTitle")}</Dialog.Title>
              <Dialog.Description>
                {t("soldiers.importDialogDescription")}
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body display="flex" flexDirection="column" gap="3" flex="1" overflow="hidden">
              <SearchInput
                key={open ? "open" : "closed"}
                placeholder={t("soldiers.importSearchPlaceholder")}
                onSearch={setSearchQuery}
              />

              <Flex align="center" justify="space-between" gap="2" wrap="wrap">
                <Text textStyle="xs" color="fg.muted">
                  {t("soldiers.importSelectedCount").replace(
                    "{count}",
                    String(selectedCount),
                  )}
                </Text>
                <Flex gap="2">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={handleToggleSelectAllVisible}
                    disabled={visibleSoldiers.length === 0}
                  >
                    {areAllVisibleSelected
                      ? t("soldiers.importDeselectVisible")
                      : t("soldiers.importSelectVisible")}
                  </Button>
                  {hasSelection ? (
                    <Button size="xs" variant="ghost" onClick={handleClearSelection}>
                      {t("soldiers.importClearSelection")}
                    </Button>
                  ) : null}
                </Flex>
              </Flex>

              <Box flex="1" overflowY="auto" borderWidth="1px" borderColor="border" borderRadius="lg">
                {isLoading ? (
                  <Flex justify="center" py="10">
                    <Spinner size="md" color="forest.400" />
                  </Flex>
                ) : masterError ? (
                  <ApiErrorState
                    title={t("soldiers.importDialogTitle")}
                    error={masterError}
                    fallbackMessage={t("common.error")}
                    actionLabel={t("common.retry")}
                    onAction={handleRetryMaster}
                  />
                ) : visibleSoldiers.length === 0 ? (
                  <EmptyState
                    icon={UserSearch}
                    title={t("soldiers.importEmptyTitle")}
                    description={
                      importableSoldiers.length === 0
                        ? t("soldiers.importAllAlreadyImported")
                        : t("soldiers.importNoSearchResults")
                    }
                  />
                ) : (
                  <Stack gap="0" divideY="1px">
                    {visibleSoldiers.map((soldier) => (
                      <SoldierRow
                        key={soldier.personalId}
                        soldier={soldier}
                        isSelected={selectedPersonalIds.has(soldier.personalId)}
                        onToggle={handleToggleSoldier}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Dialog.Body>

            <Dialog.Footer flexShrink={0}>
              <Button variant="ghost" onClick={handleClose} disabled={importMutation.isPending}>
                {t("common.cancel")}
              </Button>
              <Button
                colorPalette="primary"
                onClick={handleSubmit}
                loading={importMutation.isPending}
                disabled={!hasSelection}
              >
                {t("soldiers.importSubmit").replace("{count}", String(selectedCount))}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

const SoldierRow = ({ soldier, isSelected, onToggle }: SoldierRowProps) => {
  const handleCheckedChange = () => {
    onToggle(soldier.personalId)
  }

  const detailLine = [soldier.rank, soldier.company, soldier.platoon]
    .filter((value) => value && value.length > 0)
    .join(" · ")

  return (
    <Flex
      as="label"
      align="center"
      gap="3"
      px="3"
      py="2.5"
      minH="44px"
      cursor="pointer"
      _hover={{ bg: "bg.muted" }}
    >
      <Checkbox.Root checked={isSelected} onCheckedChange={handleCheckedChange}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
      <Flex direction="column" gap="0.5" flex="1" minW="0">
        <Text textStyle="sm" fontWeight="500" truncate>
          {soldier.fullName}
        </Text>
        <Text textStyle="xs" color="fg.muted" truncate>
          {soldier.personalId}
          {detailLine ? ` · ${detailLine}` : ""}
        </Text>
      </Flex>
    </Flex>
  )
}

const isActivityStateError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes("activity is not active") || message.includes("activity not found")
}

const matchesQuery = (soldier: Soldier, normalizedQuery: string): boolean => {
  const fields = [
    soldier.fullName,
    soldier.personalId,
    soldier.company,
    soldier.platoon ?? "",
  ]
  return fields.some((field) => field.toLowerCase().includes(normalizedQuery))
}

type ImportFromMasterDialogProps = {
  open: boolean
  activityId: string
  existingPersonalIds: Set<string>
  onOpenChange: (open: boolean) => void
}

type SoldierRowProps = {
  soldier: Soldier
  isSelected: boolean
  onToggle: (personalId: string) => void
}
