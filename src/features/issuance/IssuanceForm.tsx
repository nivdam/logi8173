import { useState } from "react";
import { Accordion, Box, Flex, Heading, Text } from "@chakra-ui/react"
import { User, Package, FileSignature } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { t } from "../../lib/i18n";
import { animations } from "../../theme/animations";
import { useIssuanceForm } from "./hooks/useIssuanceForm";
import { IssuanceHeader } from "./IssuanceHeader";
import { ItemsSection } from "./ItemsSection";
import { IssuanceFooter } from "./IssuanceFooter";
import { IssuanceSuccess } from "./IssuanceSuccess";

export const IssuanceForm = () => {
  const { operator } = useAuth();
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
          {/* Section 1: פרטי המקבל והמנפק */}
          <Accordion.Item
            value="receiver"
            bg="bg.card"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            overflow="visible"
            _open={{ boxShadow: "md" }}
          >
            <Accordion.ItemTrigger
              px="4"
              py="3"
              _open={{
                position: "relative",
                _before: {
                  position: "absolute",
                  content: "''",
                  top: "-3px",
                  insetInline: 5,
                  h: 1.5,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  bgColor: "sunburst.400",
                  boxShadow: "sm",
                },
              }}
            >
              <Flex align="center" gap="2" flex="1">
                <Flex
                  align="center"
                  justify="center"
                  w="7"
                  h="7"
                  borderRadius="full"
                  bg="sage.100"
                  color="sage.700"
                >
                  <User size={14} />
                </Flex>
                <Text fontWeight="600">{t("issuance.receiverSection")}</Text>
              </Flex>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>

            <Accordion.ItemContent>
              <Box px="4" pb="4" overflow="visible">
                <IssuanceHeader
                  receiver={form.state.receiver}
                  onSelectReceiver={form.handleSelectReceiver}
                  onClearReceiver={form.handleClearReceiver}
                />
              </Box>
            </Accordion.ItemContent>
          </Accordion.Item>

          {/* Section 2: טבלת הפריטים */}
          <Accordion.Item
            value="items"
            bg="bg.card"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            _open={{ boxShadow: "md" }}
          >
            <Accordion.ItemTrigger
              px="4"
              py="3"
              _open={{
                position: "relative",
                _before: {
                  position: "absolute",
                  content: "''",
                  top: "-3px",
                  insetInline: 5,
                  h: 1.5,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  bgColor: "sunburst.400",
                  boxShadow: "sm",
                },
              }}
            >
              <Flex align="center" gap="2" flex="1">
                <Flex
                  align="center"
                  justify="center"
                  w="7"
                  h="7"
                  borderRadius="full"
                  bg="sage.100"
                  color="sage.700"
                >
                  <Package size={14} />
                </Flex>
                <Text fontWeight="600">{t("issuance.itemsSection")}</Text>
              </Flex>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Box px="4" pb="4">
                <ItemsSection
                  lines={form.state.lines}
                  onAddEmptyLine={form.handleAddEmptyLine}
                  onUpdateField={form.handleUpdateLineField}
                  onBindToItem={form.handleBindLineToItem}
                  onDuplicate={form.handleDuplicateLine}
                  onRemove={form.handleRemoveLine}
                />
              </Box>
            </Accordion.ItemContent>
          </Accordion.Item>

          {/* Section 3: חתימות ואישור */}
          <Accordion.Item
            value="signature"
            bg="bg.card"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            _open={{ boxShadow: "md" }}
          >
            <Accordion.ItemTrigger
              px="4"
              py="3"
              _open={{
                position: "relative",
                _before: {
                  position: "absolute",
                  content: "''",
                  top: "-3px",
                  insetInline: 5,
                  h: 1.5,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  bgColor: "sunburst.400",
                  boxShadow: "sm",
                },
              }}
            >
              <Flex align="center" gap="2" flex="1">
                <Flex
                  align="center"
                  justify="center"
                  w="7"
                  h="7"
                  borderRadius="full"
                  bg="sage.100"
                  color="sage.700"
                >
                  <FileSignature size={14} />
                </Flex>
                <Text fontWeight="600">{t("issuance.signaturesSection")}</Text>
              </Flex>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Box px="4" pb="4">
                <IssuanceFooter
                  globalNotes={form.state.globalNotes}
                  receiverSignature={form.state.receiverSignature}
                  giverSignature={form.state.giverSignature}
                  savedSignatureUrl={operator?.savedSignatureUrl}
                  isFormValid={form.isFormValid}
                  totalItemCount={form.totalItemCount}
                  isSubmitting={form.isSubmitting}
                  onSetGlobalNotes={form.handleSetGlobalNotes}
                  onSetReceiverSignature={form.handleSetReceiverSignature}
                  onSetGiverSignature={form.handleSetGiverSignature}
                  onSubmit={form.handleSubmit}
                />
              </Box>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Flex>
      </Accordion.Root>
    </Flex>
  );
};
