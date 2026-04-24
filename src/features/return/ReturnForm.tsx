import { useState } from "react"
import { Accordion, Flex, Heading } from "@chakra-ui/react"
import { RotateCcw, PackageCheck, Package, FileSignature } from "lucide-react"
import { useActivity } from "../../api"
import { t } from "../../lib/i18n"
import { toaster } from "../../lib/toaster"
import { animations } from "../../theme/animations"
import { useActiveActivity } from "../../lib/active-activity-context"
import { useActivityClosedGuard } from "../../lib/use-activity-closed-guard"
import { useDirtyFormRegistration } from "../../lib/dirty-form-registry"
import { DraftRestoreBanner } from "../../components/DraftRestoreBanner"
import { ActivityContextCard } from "../issuance/ActivityContextCard"
import { IssuanceAccordionSection } from "../issuance/IssuanceAccordionSection"
import { ItemsSection } from "../issuance/ItemsSection"
import { useReturnForm } from "./hooks/useReturnForm"
import { ReturnHeader } from "./ReturnHeader"
import { ReturnFooter } from "./ReturnFooter"
import { ReturnSuccess } from "./ReturnSuccess"
import { IssuedItemsChecklist } from "./IssuedItemsChecklist"

const FORM_REGISTRATION_ID = "return"

export const ReturnForm = () => {
  const { activeActivityId, activeActivity, isResolving, setActiveActivity } = useActiveActivity()
  const form = useReturnForm(activeActivityId)
  const [activeSection, setActiveSection] = useState<string[]>(["giver", "issuedItems"])

  const {
    data: activityData,
    isLoading: isLoadingSnapshot,
    isError: isSnapshotError,
    refetch: refetchActivity,
  } = useActivity(activeActivityId, { poll: true })
  const snapshotItems = activityData?.snapshotItems ?? []

  useDirtyFormRegistration(FORM_REGISTRATION_ID, form.isFormDirty && !form.state.showSuccess)

  const isActivityClosed = !!activeActivityId && activeActivity?.status !== "active"

  const handleActivityClosedReset = () => {
    toaster.create({
      title: t("returns.activityClosedMidForm"),
      type: "warning",
      duration: 6000,
    })
    form.handleNewReturn()
    setActiveActivity(undefined)
  }

  useActivityClosedGuard({
    isActivityClosed,
    skip: form.state.showSuccess,
    onReset: handleActivityClosedReset,
  })

  const isActivityReady =
    activeActivityId !== undefined &&
    !isLoadingSnapshot &&
    !isSnapshotError &&
    snapshotItems.length > 0

  if (form.state.showSuccess && form.state.giver) {
    return (
      <ReturnSuccess
        formId={form.state.formId}
        activityId={activeActivityId || ""}
        txId={form.state.serverTxId || ""}
        giver={form.state.giver}
        lines={form.state.lines}
        itemCount={form.totalItemCount}
        onNewReturn={form.handleNewReturn}
        onBackToDashboard={form.handleBackToDashboard}
      />
    )
  }

  const handleSectionChange = (details: { value: string[] }) => {
    setActiveSection(details.value)
  }

  const handleAddManualItem = () => {
    form.handleAddEmptyLine()
    setActiveSection((current) => current.includes("items") ? current : [...current, "items"])
  }

  const handleRetrySnapshot = () => {
    void refetchActivity()
  }

  return (
    <Flex direction="column" gap="5" css={animations.fadeInUp}>
      <Heading size="lg" fontWeight="700">
        {t("returns.formTitle")}
      </Heading>

      {form.hasDraft && (
        <DraftRestoreBanner
          onRestore={form.handleRestoreDraft}
          onDiscard={form.handleDiscardDraft}
        />
      )}

      <ActivityContextCard
        activity={activeActivity}
        isResolving={isResolving}
        snapshotItemCount={snapshotItems.length}
        isLoadingSnapshot={isLoadingSnapshot}
        isSnapshotError={isSnapshotError}
        onRetrySnapshot={handleRetrySnapshot}
      />

      {isActivityReady && (
        <Accordion.Root
          multiple
          collapsible
          value={activeSection}
          onValueChange={handleSectionChange}
        >
          <Flex direction="column" gap="3">
            <IssuanceAccordionSection
              value="giver"
              icon={RotateCcw}
              label={t("returns.giverSection")}
              overflowVisible
            >
              <ReturnHeader
                activityId={activeActivityId}
                giver={form.state.giver}
                performedAt={form.state.performedAt}
                onSelectGiver={form.handleSelectGiver}
                onClearGiver={form.handleClearGiver}
                onSetPerformedAt={form.handleSetPerformedAt}
              />
            </IssuanceAccordionSection>

            {form.state.giver && (
              <IssuanceAccordionSection
                value="issuedItems"
                icon={PackageCheck}
                label={t("returns.issuedItemsTitle")}
              >
                <IssuedItemsChecklist
                  issuedItems={form.soldierIssuedItems}
                  selectedItemIds={form.state.selectedIssuedItemIds}
                  isLoading={form.isLoadingIssuedItems}
                  onToggleItem={form.handleToggleIssuedItem}
                  onSelectAll={form.handleSelectAllIssued}
                  onDeselectAll={form.handleDeselectAllIssued}
                  onAddManualItem={handleAddManualItem}
                />
              </IssuanceAccordionSection>
            )}

            <IssuanceAccordionSection
              value="items"
              icon={Package}
              label={t("returns.itemsSection")}
            >
              <ItemsSection
                lines={form.state.lines}
                inventoryItems={snapshotItems}
                onAddEmptyLine={form.handleAddEmptyLine}
                onUpdateField={form.handleUpdateLineField}
                onBindToItem={form.handleBindLineToItem}
                onDuplicate={form.handleDuplicateLine}
                onRemove={form.handleRemoveLine}
                expandedItems={form.state.expandedLineIds}
                onExpandedItemsChange={form.handleExpandedLineIdsChange}
              />
            </IssuanceAccordionSection>

            <IssuanceAccordionSection
              value="signature"
              icon={FileSignature}
              label={t("issuance.signaturesSection")}
            >
              <ReturnFooter
                globalNotes={form.state.globalNotes}
                giverSignature={form.state.giverSignature}
                receiverSignature={form.state.receiverSignature}
                savedSignatureUrl={form.savedSignature}
                isFormValid={form.isFormValid}
                totalItemCount={form.totalItemCount}
                isSubmitting={form.isSubmitting}
                onSetGlobalNotes={form.handleSetGlobalNotes}
                onSetGiverSignature={form.handleSetGiverSignature}
                onSetReceiverSignature={form.handleSetReceiverSignature}
                onSubmit={form.handleSubmit}
              />
            </IssuanceAccordionSection>
          </Flex>
        </Accordion.Root>
      )}
    </Flex>
  )
}
