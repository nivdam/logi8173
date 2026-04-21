import { useState } from "react";
import { Accordion, Flex, Heading, Text } from "@chakra-ui/react"
import { User, Package, FileSignature } from "lucide-react";
import { useAuth } from "../../lib/use-auth";
import { useActivity } from "../../api";
import { t } from "../../lib/i18n";
import { animations } from "../../theme/animations";
import { useIssuanceForm } from "./hooks/useIssuanceForm";
import { DraftRestoreBanner } from "../../components/DraftRestoreBanner";
import { ActivityContextCard } from "./ActivityContextCard";
import { IssuanceAccordionSection } from "./IssuanceAccordionSection";
import { IssuanceHeader } from "./IssuanceHeader";
import { ItemsSection } from "./ItemsSection";
import { IssuanceFooter } from "./IssuanceFooter";
import { IssuanceSuccess } from "./IssuanceSuccess";

export const IssuanceForm = () => {
  const { operator, operatorProfile } = useAuth();
  const form = useIssuanceForm();
  const [activeSection, setActiveSection] = useState<string[]>(["receiver"]);

  const { data: activityData, isLoading: isLoadingSnapshot, isError: isSnapshotError } = useActivity(form.state.activityId)
  const snapshotItems = activityData?.snapshotItems ?? []

  const isActivityReady =
    form.state.activityId !== undefined &&
    !isLoadingSnapshot &&
    !isSnapshotError &&
    snapshotItems.length > 0

  if (form.state.showSuccess && form.state.receiver) {
    return (
      <IssuanceSuccess
        formId={form.state.formId}
        activityId={form.state.activityId || ""}
        txId={form.state.serverTxId || ""}
        receiver={form.state.receiver}
        lines={form.state.lines}
        itemCount={form.totalItemCount}
        onNewIssuance={form.handleNewIssuance}
        onBackToDashboard={form.handleBackToDashboard}
      />
    );
  }

  const handleSectionChange = (details: { value: string[] }) => {
    setActiveSection(details.value);
  };

  return (
    <Flex direction="column" gap="5" css={animations.fadeInUp}>
      <Heading size="lg" fontWeight="700">
        {t("issuance.formTitle")}
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
            {t("issuance.selectActivityPrompt")}
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
              value="receiver"
              icon={User}
              label={t("issuance.receiverSection")}
              overflowVisible
            >
              <IssuanceHeader
                activityId={form.state.activityId}
                receiver={form.state.receiver}
                performedAt={form.state.performedAt}
                onSelectReceiver={form.handleSelectReceiver}
                onClearReceiver={form.handleClearReceiver}
                onSetPerformedAt={form.handleSetPerformedAt}
              />
            </IssuanceAccordionSection>

            <IssuanceAccordionSection
              value="items"
              icon={Package}
              label={t("issuance.itemsSection")}
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
              <IssuanceFooter
                globalNotes={form.state.globalNotes}
                receiverSignature={form.state.receiverSignature}
                giverSignature={form.state.giverSignature}
                savedSignatureUrl={operatorProfile?.savedSignature || operator?.savedSignatureUrl}
                isFormValid={form.isFormValid}
                totalItemCount={form.totalItemCount}
                isSubmitting={form.isSubmitting}
                onSetGlobalNotes={form.handleSetGlobalNotes}
                onSetReceiverSignature={form.handleSetReceiverSignature}
                onSetGiverSignature={form.handleSetGiverSignature}
                onSubmit={form.handleSubmit}
              />
            </IssuanceAccordionSection>
          </Flex>
        </Accordion.Root>
      )}
    </Flex>
  );
};
