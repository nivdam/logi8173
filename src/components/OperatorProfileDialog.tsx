import {
  Button,
  chakra,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useCompanies, useSoldiers } from "../api";
import { OperatorProfileFormFields } from "../features/operator-profile/OperatorProfileFormFields";
import {
  filterSoldiersForProfile,
  findPersonalIdConflict,
  getCompanyOptions,
  validateFullName,
  validatePersonalId,
  validatePhone,
} from "../features/operator-profile/profile-dialog-utils";
import type { OperatorProfile } from "../lib/auth.types";
import { t } from "../lib/i18n";

export const OperatorProfileDialog = ({
  open,
  onOpenChange,
  defaultFullName,
  defaultSavedSignature,
  initialProfile,
  isSaving,
  isBlocking = false,
  showReset = false,
  onReset,
  onSubmit,
}: OperatorProfileDialogProps) => {
  const { data: companies = [] } = useCompanies();
  const { data: soldiers = [] } = useSoldiers();
  const [fullName, setFullName] = useState(defaultFullName);
  const [rank, setRank] = useState(initialProfile?.rank ?? "");
  const [personalId, setPersonalId] = useState(
    initialProfile?.personalId ?? "",
  );
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [company, setCompany] = useState(initialProfile?.company ?? "");
  const [platoon, setPlatoon] = useState(initialProfile?.platoon);
  const [savedSignature, setSavedSignature] = useState(
    initialProfile?.savedSignature ?? defaultSavedSignature ?? "",
  );
  const [isEditingSignature, setIsEditingSignature] = useState(
    (initialProfile?.savedSignature ?? defaultSavedSignature ?? "") === "",
  );

  useEffect(() => {
    if (!open) return;
    setFullName(defaultFullName);
    setRank(initialProfile?.rank ?? "");
    setPersonalId(initialProfile?.personalId ?? "");
    setPhone(initialProfile?.phone ?? "");
    setCompany(initialProfile?.company ?? "");
    setPlatoon(initialProfile?.platoon);
    const sig = initialProfile?.savedSignature ?? defaultSavedSignature ?? "";
    setSavedSignature(sig);
    setIsEditingSignature(sig === "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset state only when dialog opens
  }, [open]);

  const fullNameError = validateFullName(fullName);
  const personalIdError = validatePersonalId(personalId);
  const phoneError = validatePhone(phone);
  const personalIdConflict = findPersonalIdConflict(
    personalId,
    soldiers,
    initialProfile?.personalId,
  );
  const filteredSoldiers = useMemo(
    () => filterSoldiersForProfile(fullName, soldiers),
    [fullName, soldiers],
  );
  const companyOptions = useMemo(
    () => getCompanyOptions(companies, company),
    [companies, company],
  );

  const isValid =
    fullName.trim() !== "" &&
    rank.trim() !== "" &&
    personalId.trim() !== "" &&
    phone.trim() !== "" &&
    company.trim() !== "" &&
    savedSignature !== "" &&
    fullNameError === undefined &&
    personalIdError === undefined &&
    phoneError === undefined;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    onSubmit({
      fullName: fullName.trim(),
      rank: rank.trim(),
      personalId: personalId.trim(),
      phone: phone.trim(),
      company: company.trim(),
      platoon,
      savedSignature,
    });
  };

  const handleFullNameChange = (details: { inputValue: string }) => {
    setFullName(details.inputValue);
  };

  const handleSoldierSelect = (details: { value: string[] }) => {
    const selectedPersonalId = details.value[0];
    const soldier = soldiers.find(
      (item) => item.personalId === selectedPersonalId,
    );
    if (!soldier) return;

    setFullName(soldier.fullName);
    setRank(soldier.rank);
    setPersonalId(soldier.personalId);
    setPhone(String(soldier.phone || ""));
    setCompany(soldier.company);
    setPlatoon(soldier.platoon);
  };

  const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRank(event.target.value);
  };

  const handlePersonalIdChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digitsOnly = event.currentTarget.value.replace(/\D/g, "");
    setPersonalId(digitsOnly);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.currentTarget.value.replace(/[^\d-]/g, "");
    setPhone(sanitized);
  };

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCompany(event.target.value);
  };

  const handleEditSignature = () => {
    setIsEditingSignature(true);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      closeOnEscape={!isBlocking}
      closeOnInteractOutside={!isBlocking}
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            mx="4"
            maxW="2xl"
            maxH="90vh"
            display="flex"
            flexDirection="column"
            asChild
          >
            <chakra.form onSubmit={handleSubmit}>
              <Dialog.Header flexShrink={0}>
                <Dialog.Title>{t("auth.profileTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("auth.profileDescription")}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body overflowY="auto" flex="1">
                <OperatorProfileFormFields
                  fullName={fullName}
                  rank={rank}
                  personalId={personalId}
                  phone={phone}
                  company={company}
                  savedSignature={savedSignature}
                  isEditingSignature={isEditingSignature}
                  filteredSoldiers={filteredSoldiers}
                  companyOptions={companyOptions}
                  fullNameError={fullNameError}
                  personalIdError={personalIdError}
                  personalIdConflict={personalIdConflict}
                  phoneError={phoneError}
                  onFullNameChange={handleFullNameChange}
                  onSoldierSelect={handleSoldierSelect}
                  onRankChange={handleRankChange}
                  onPersonalIdChange={handlePersonalIdChange}
                  onPhoneChange={handlePhoneChange}
                  onCompanyChange={handleCompanyChange}
                  onEditSignature={handleEditSignature}
                  onSignatureChange={setSavedSignature}
                />
              </Dialog.Body>

              <Dialog.Footer flexShrink={0}>
                {!isBlocking && (
                  <Dialog.ActionTrigger asChild>
                    <Button type="button" variant="ghost">
                      {t("common.cancel")}
                    </Button>
                  </Dialog.ActionTrigger>
                )}
                {showReset && onReset && (
                  <Button
                    type="button"
                    variant="outline"
                    colorPalette="red"
                    onClick={onReset}
                  >
                    {t("auth.clearProfile")}
                  </Button>
                )}
                <Button
                  type="submit"
                  colorPalette="sage"
                  loading={isSaving}
                  disabled={!isValid}
                >
                  {t("common.save")}
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

type OperatorProfileDialogProps = {
  open: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  defaultFullName: string;
  defaultSavedSignature?: string;
  initialProfile: OperatorProfile | undefined;
  isSaving: boolean;
  isBlocking?: boolean;
  showReset?: boolean;
  onReset?: () => void;
  onSubmit: (profile: OperatorProfile) => void;
};
