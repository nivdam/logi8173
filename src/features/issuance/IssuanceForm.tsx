import { useState } from "react";
import { Accordion, Flex, Heading } from "@chakra-ui/react";
import { User, Package, FileSignature } from "lucide-react";
import { useAuth } from "../../lib/use-auth";
import { useActiveActivity } from "../../lib/active-activity-context";
import { useActivityClosedGuard } from "../../lib/use-activity-closed-guard";
import { useDirtyFormRegistration } from "../../lib/dirty-form-registry";
import { useActivity } from "../../api";
import { t } from "../../lib/i18n";
import { toaster } from "../../lib/toaster";
import { animations } from "../../theme/animations";
import { useIssuanceForm } from "./hooks/useIssuanceForm";
import { DraftRestoreBanner } from "../../components/DraftRestoreBanner";
import { ActivityContextCard } from "./ActivityContextCard";
import { IssuanceAccordionSection } from "./IssuanceAccordionSection";
import { IssuanceHeader } from "./IssuanceHeader";
import { ItemsSection } from "./ItemsSection";
import { IssuanceFooter } from "./IssuanceFooter";
import { IssuanceSuccess } from "./IssuanceSuccess";

const FORM_REGISTRATION_ID = "issuance";

export const IssuanceForm = () => {
  const { operator, operatorProfile } = useAuth();
  const { activeActivityId, activeActivity, isResolving, setActiveActivity } = useActiveActivity();
  const form = useIssuanceForm(activeActivityId);
  const [activeSection, setActiveSection] = useState<string[]>(["receiver"]);

  const {
    data: activityData,
    isLoading: isLoadingSnapshot,
    isError: isSnapshotError,
    refetch: refetchActivity,
  } = useActivity(activeActivityId);
  const snapshotItems = activityData?.snapshotItems ?? [];

  useDirtyFormRegistration(FORM_REGISTRATION_ID, form.isFormDirty && !form.state.showSuccess);

  const isActivityClosed = !!activeActivityId && activeActivity?.status !== "active";

  const handleActivityClosedReset = () => {
    toaster.create({
      title: t("issuance.activityClosedMidForm"),
      type: "warning",
      duration: 6000,
    });
    form.handleNewIssuance();
    setActiveActivity(undefined);
  };

  useActivityClosedGuard({
    isActivityClosed,
    skip: form.state.showSuccess,
    onReset: handleActivityClosedReset,
  });

  const isActivityReady =
    activeActivityId !== undefined &&
    !isLoadingSnapshot &&
    !isSnapshotError &&
    snapshotItems.length > 0;

  if (form.state.showSuccess && form.state.receiver) {
    return (
      <IssuanceSuccess
        formId={form.state.formId}
        activityId={activeActivityId || ""}
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

  const handleRetrySnapshot = () => {
    void refetchActivity();
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
              value="receiver"
              icon={User}
              label={t("issuance.receiverSection")}
              overflowVisible
            >
              <IssuanceHeader
                activityId={activeActivityId}
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
