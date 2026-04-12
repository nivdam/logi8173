import { useState } from "react"
import { Accordion, Flex, Heading, Text } from "@chakra-ui/react"
import { RotateCcw, Package, FileSignature } from "lucide-react"
import { useAuth } from "../../lib/use-auth"
import { useActivity } from "../../api"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { ActivityContextCard } from "../issuance/ActivityContextCard"
import { IssuanceAccordionSection } from "../issuance/IssuanceAccordionSection"
import { ItemsSection } from "../issuance/ItemsSection"
import { useReturnForm } from "./hooks/useReturnForm"
import { ReturnHeader } from "./ReturnHeader"
import { ReturnFooter } from "./ReturnFooter"
import { ReturnSuccess } from "./ReturnSuccess"

export const ReturnForm = () => {
  const { operator, operatorProfile } = useAuth()
  const form = useReturnForm()
  const [activeSection, setActiveSection] = useState<string[]>(["giver"])

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

  return (
    <Flex direction="column" gap="5" css={animations.fadeInUp}>
      <Heading size="lg" fontWeight="700">
        {t("returns.formTitle")}
      </Heading>

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
                savedSignatureUrl={operatorProfile?.savedSignature || operator?.savedSignatureUrl}
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
