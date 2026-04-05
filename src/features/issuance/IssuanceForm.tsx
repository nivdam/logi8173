import { useState } from "react";
import { Accordion, Flex, Heading } from "@chakra-ui/react"
import { User, Package, FileSignature } from "lucide-react";
import { useAuth } from "../../lib/use-auth";
import { t } from "../../lib/i18n";
import { animations } from "../../theme/animations";
import { useIssuanceForm } from "./hooks/useIssuanceForm";
import { IssuanceAccordionSection } from "./IssuanceAccordionSection";
import { IssuanceHeader } from "./IssuanceHeader";
import { ItemsSection } from "./ItemsSection";
import { IssuanceFooter } from "./IssuanceFooter";
import { IssuanceSuccess } from "./IssuanceSuccess";

export const IssuanceForm = () => {
  const { operator, operatorProfile } = useAuth();
  const form = useIssuanceForm();
  const [activeSection, setActiveSection] = useState<string[]>(["receiver"]);

  if (form.state.showSuccess && form.state.receiver) {
    return (
      <IssuanceSuccess
        formId={form.state.formId}
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
    </Flex>
  );
};
