import {
  Button,
  Combobox,
  createListCollection,
  Field,
  Flex,
  Image,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { t } from "../../lib/i18n";
import { RANK_OPTIONS } from "../../lib/rank-options";
import type { Soldier } from "../../types";
import { SignatureCanvas } from "../../components/SignatureCanvas";

export const OperatorProfileFormFields = ({
  fullName,
  rank,
  personalId,
  phone,
  company,
  savedSignature,
  isEditingSignature,
  filteredSoldiers,
  companyOptions,
  fullNameError,
  personalIdError,
  personalIdConflict,
  phoneError,
  onFullNameChange,
  onSoldierSelect,
  onRankChange,
  onPersonalIdChange,
  onPhoneChange,
  onCompanyChange,
  onEditSignature,
  onSignatureChange,
}: OperatorProfileFormFieldsProps) => {
  const soldierCollection = useMemo(
    () =>
      createListCollection({
        items: filteredSoldiers,
        itemToValue: (soldier) => soldier.personalId,
        itemToString: (soldier) => soldier.fullName,
      }),
    [filteredSoldiers],
  );
  const showFullNameError = fullName.length > 0 && fullNameError !== undefined;
  const showPersonalIdError =
    personalId.length > 0 && personalIdError !== undefined;
  const showPersonalIdConflict =
    !showPersonalIdError &&
    personalId.length > 0 &&
    personalIdConflict !== undefined;
  const showPhoneError = phone.length > 0 && phoneError !== undefined;

  return (
    <Stack gap="4">
      <Text textStyle="sm" color="fg.muted">
        {t("auth.profileDeviceOnly")}
      </Text>

      <Field.Root required invalid={showFullNameError}>
        <Field.Label>{t("soldiers.fullName")}</Field.Label>
        <Combobox.Root
          collection={soldierCollection}
          inputValue={fullName}
          onInputValueChange={onFullNameChange}
          onValueChange={onSoldierSelect}
          openOnClick
        >
          <Combobox.Control>
            <Combobox.Input />
            <Combobox.Trigger />
          </Combobox.Control>
          <Portal>
            <Combobox.Positioner>
              <Combobox.Content>
                <Combobox.List>
                  {filteredSoldiers.map((soldier) => (
                    <Combobox.Item key={soldier.personalId} item={soldier}>
                      <Combobox.ItemText>
                        <Flex direction="column" gap="0.5">
                          <Text textStyle="sm" fontWeight="500">
                            {soldier.fullName}
                          </Text>
                          <Text textStyle="xs" color="fg.muted">
                            {soldier.personalId}
                            {soldier.company && ` · ${soldier.company}`}
                            {soldier.phone && ` · ${soldier.phone}`}
                          </Text>
                        </Flex>
                      </Combobox.ItemText>
                    </Combobox.Item>
                  ))}
                </Combobox.List>
                <Combobox.Empty>
                  <Text textStyle="sm" color="fg.muted" p="3">
                    {t("issuance.noSoldiersFound")}
                  </Text>
                </Combobox.Empty>
              </Combobox.Content>
            </Combobox.Positioner>
          </Portal>
        </Combobox.Root>
        {showFullNameError ? (
          <Field.ErrorText>{fullNameError}</Field.ErrorText>
        ) : null}
      </Field.Root>

      <Flex gap="4" direction={{ base: "column", md: "row" }}>
        <Field.Root required flex="1">
          <Field.Label>{t("auth.rank")}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field value={rank} onChange={onRankChange}>
              <option value="">{t("auth.selectRank")}</option>
              {RANK_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root required flex="1" invalid={showPersonalIdError}>
          <Field.Label>{t("soldiers.personalId")}</Field.Label>
          <Input
            type="tel"
            value={personalId}
            onChange={onPersonalIdChange}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={9}
          />
          {showPersonalIdError ? (
            <Field.ErrorText>{personalIdError}</Field.ErrorText>
          ) : null}
          {showPersonalIdConflict ? (
            <Text textStyle="xs" color="orange.600">
              {personalIdConflict}
            </Text>
          ) : null}
        </Field.Root>
      </Flex>

      <Flex gap="4" direction={{ base: "column", md: "row" }}>
        <Field.Root required flex="1" invalid={showPhoneError}>
          <Field.Label>{t("soldiers.phone")}</Field.Label>
          <Input
            type="tel"
            value={phone}
            onChange={onPhoneChange}
            inputMode="tel"
            maxLength={11}
          />
          {showPhoneError ? (
            <Field.ErrorText>{phoneError}</Field.ErrorText>
          ) : null}
        </Field.Root>

        <Field.Root required flex="1">
          <Field.Label>{t("auth.company")}</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field value={company} onChange={onCompanyChange}>
              <option value="">{t("auth.selectCompany")}</option>
              {companyOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </Flex>

      <Field.Root required>
        <Field.Label>{t("issuance.savedSignature")}</Field.Label>
        {savedSignature !== "" && !isEditingSignature ? (
          <Stack gap="3">
            <Flex
              borderWidth="2px"
              borderColor="sage.300"
              borderStyle="dashed"
              borderRadius="xl"
              overflow="hidden"
              bg="white"
              p="2"
              justify="center"
            >
              <Image
                src={savedSignature}
                alt={t("issuance.savedSignature")}
                maxH="160px"
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Text textStyle="xs" color="fg.muted">
                {t("issuance.savedSignature")}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                color="fg.muted"
                onClick={onEditSignature}
              >
                <RefreshCw size={12} />
                {t("auth.editSignature")}
              </Button>
            </Flex>
          </Stack>
        ) : (
          <SignatureCanvas
            signatureData={savedSignature}
            onSign={onSignatureChange}
          />
        )}
      </Field.Root>
    </Stack>
  );
};

type OperatorProfileFormFieldsProps = {
  fullName: string;
  rank: string;
  personalId: string;
  phone: string;
  company: string;
  savedSignature: string;
  isEditingSignature: boolean;
  filteredSoldiers: Soldier[];
  companyOptions: string[];
  fullNameError: string | undefined;
  personalIdError: string | undefined;
  personalIdConflict: string | undefined;
  phoneError: string | undefined;
  onFullNameChange: (details: { inputValue: string }) => void;
  onSoldierSelect: (details: { value: string[] }) => void;
  onRankChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onPersonalIdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCompanyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onEditSignature: () => void;
  onSignatureChange: (signatureData: string) => void;
};
