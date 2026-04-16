import { useState } from "react"
import { Accordion, Flex, Heading, Text } from "@chakra-ui/react"
import { RotateCcw, PackageCheck, Package, FileSignature } from "lucide-react"
import { useActivity } from "../../api"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { DraftRestoreBanner } from "../../components/DraftRestoreBanner"
import { ActivityContextCard } from "../issuance/ActivityContextCard"
import { IssuanceAccordionSection } from "../issuance/IssuanceAccordionSection"
import { ItemsSection } from "../issuance/ItemsSection"
import { useReturnForm } from "./hooks/useReturnForm"
import { ReturnHeader } from "./ReturnHeader"
import { ReturnFooter } from "./ReturnFooter"
import { ReturnSuccess } from "./ReturnSuccess"
import { IssuedItemsChecklist } from "./IssuedItemsChecklist"

export const ReturnForm = () => {
  const form = useReturnForm()
  const [activeSection, setActiveSection] = useState<string[]>(["giver", "issuedItems"])

  const { data: activityData, isLoading: isLoadingSnapshot, isError: isSnapshotError } = useActivity(form.state.activityId)
  const snapshotItems = activityData?.snapshotItems ?? []

  const isActivityReady =
    form.state.activityId !== undefined &&
    !isLoadingSnapshot &&
    !isSnapshotError &&
    snapshotItems.length > 0

  if (form.state.showSuccess && form.state.giver) {
    return (
      <ReturnSuccess
        formId={form.state.formId}
        activityId={form.state.activityId || ""}
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
        selectedActivityId={form.state.activityId}
        snapshotItemCount={snapshotItems.length}
        isLoadingSnapshot={isLoadingSnapshot}
        isSnapshotError={isSnapshotError}
        isFormDirty={form.isFormDirty}
        isSubmitting={form.isSubmitting}
        onSelect={form.handleSelectActivity}
      />

      {!form.state.activityId && (
        <Flex align="center" justify="center" py="8">
          <Text textStyle="sm" color="fg.muted" textAlign="center">
            {t("returns.selectActivityPrompt")}
          </Text>
        </Flex>
      )}

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
