import { useMemo, useState } from "react";
import {
  Button,
  chakra,
  Combobox,
  createListCollection,
  Dialog,
  Field,
  Grid,
  Input,
  NativeSelect,
  Portal,
  SegmentGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  useActivitySoldiers,
  useCompanies,
  useSoldiers,
  useUpsertActivitySoldier,
  useUpsertCompany,
  useUpsertSoldier,
} from "../../api";
import { useActiveActivity } from "../../lib/active-activity-context";
import { toaster } from "../../lib/toaster";
import { t } from "../../lib/i18n";
import { RANK_OPTIONS } from "../../lib/rank-options";
import type { Soldier } from "../../types";

const parseInitialQuery = (
  query: string,
): { fullName: string; personalId: string } => {
  const trimmed = query.trim();
  if (!trimmed) return { fullName: "", personalId: "" };
  if (/^\d+$/.test(trimmed)) return { fullName: "", personalId: trimmed };
  return { fullName: trimmed, personalId: "" };
};

export const AddSoldierDialog = ({
  activityId,
  open,
  initialQuery,
  onOpenChange,
  onCreated,
}: AddSoldierDialogProps) => {
  const { isResolving } = useActiveActivity();
  const { data: globalSoldiers = [] } = useSoldiers({ enabled: !isResolving });
  const { data: activitySoldiers = [] } = useActivitySoldiers(activityId, { enabled: !isResolving });
  const { data: companies = [] } = useCompanies();
  const upsertCompany = useUpsertCompany();
  const upsertGlobalSoldier = useUpsertSoldier();
  const upsertActivitySoldier = useUpsertActivitySoldier();

  const initial = parseInitialQuery(initialQuery);
  const [fullName, setFullName] = useState(initial.fullName);
  const [rank, setRank] = useState("");
  const [personalId, setPersonalId] = useState(initial.personalId);
  const [phone, setPhone] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saveScope, setSaveScope] = useState<SoldierSaveScope>(
    activityId ? "activity" : "global",
  );

  const activeCompanies = companies.filter((company) => company.isActive);
  const companyValue = companyName.trim() || companyInput.trim();
  const normalizedCompanyValue = companyValue.trim();
  const existingCompany = companies.find(
    (company) => company.name.trim() === normalizedCompanyValue,
  );

  const collection = useMemo(
    () =>
      createListCollection({
        items: activeCompanies,
        itemToValue: (company) => company.name,
        itemToString: (company) => company.name,
      }),
    [activeCompanies],
  );

  const isDuplicatePersonalId =
    personalId.trim() !== "" &&
    getDuplicateSource(
      activityId ? saveScope : "global",
      personalId.trim(),
      activitySoldiers,
      globalSoldiers,
    ) !== undefined;

  const isActivityScope = saveScope === "activity" && activityId !== undefined;

  const isValid =
    fullName.trim() !== "" &&
    rank.trim() !== "" &&
    personalId.trim() !== "" &&
    !isDuplicatePersonalId &&
    companyValue !== "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const nextSoldier: Soldier = {
      fullName: fullName.trim(),
      personalId: personalId.trim(),
      rank: rank.trim(),
      company: normalizedCompanyValue,
      platoon: undefined,
      phone: phone.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const companyInput = buildCompanyUpsertInput_(
        existingCompany,
        normalizedCompanyValue,
      );

      if (saveScope === "global" && companyInput) {
        await upsertCompany.mutateAsync(companyInput);
      }

      const upsertInput = {
        fullName: nextSoldier.fullName,
        personalId: nextSoldier.personalId,
        rank: nextSoldier.rank,
        company: nextSoldier.company,
        phone: nextSoldier.phone,
      }

      if (isActivityScope) {
        await upsertActivitySoldier.mutateAsync({
          ...upsertInput,
          activityId,
        });
      } else {
        await upsertGlobalSoldier.mutateAsync(upsertInput);
      }

      onCreated(nextSoldier);
      onOpenChange(false);
    } catch {
      toaster.create({
        title: t("common.error"),
        description: t("issuance.addSoldierError"),
        type: "error",
      });
    }
  };

  const handleCompanyInputChange = (details: { inputValue: string }) => {
    setCompanyInput(details.inputValue);
    setCompanyName("");
  };

  const handleCompanySelect = (details: { value: string[] }) => {
    const selected = details.value[0] ?? "";
    setCompanyName(selected);
    setCompanyInput(selected);
  };

  const handleDialogOpenChange = (details: { open: boolean }) => {
    onOpenChange(details.open)
  }

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.currentTarget.value)
  }

  const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRank(event.target.value)
  }

  const handlePersonalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalId(event.currentTarget.value)
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.currentTarget.value)
  }

  const handleSaveScopeChange = (details: { value: string | null }) => {
    const nextScope = details.value === "global" ? "global" : "activity"
    setSaveScope(activityId ? nextScope : "global")
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleDialogOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mx="4" maxW="lg" asChild>
            <chakra.form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>{t("issuance.addSoldierTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("issuance.addSoldierDescription")}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap="4">
                  {activityId ? (
                    <Field.Root>
                      <Field.Label>{t("issuance.addSoldierScopeLabel")}</Field.Label>
                      <SegmentGroup.Root
                        value={saveScope}
                        onValueChange={handleSaveScopeChange}
                      >
                        <SegmentGroup.Indicator bg="sage.600" borderRadius="md" />
                        <SegmentGroup.Item value="activity">
                          <SegmentGroup.ItemText>
                            {t("issuance.addSoldierScopeActivity")}
                          </SegmentGroup.ItemText>
                          <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>
                        <SegmentGroup.Item value="global">
                          <SegmentGroup.ItemText>
                            {t("issuance.addSoldierScopeGlobal")}
                          </SegmentGroup.ItemText>
                          <SegmentGroup.ItemHiddenInput />
                        </SegmentGroup.Item>
                      </SegmentGroup.Root>
                    </Field.Root>
                  ) : null}

                  <Field.Root required>
                    <Field.Label>{t("soldiers.fullName")}</Field.Label>
                    <Input
                      value={fullName}
                      onChange={handleFullNameChange}
                    />
                  </Field.Root>

                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap="4"
                  >
                    <Field.Root required>
                      <Field.Label>{t("auth.rank")}</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={rank}
                          onChange={handleRankChange}
                        >
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

                    <Field.Root required>
                      <Field.Label>{t("soldiers.company")}</Field.Label>
                      <Combobox.Root
                        collection={collection}
                        inputValue={companyInput}
                        value={companyName ? [companyName] : []}
                        onInputValueChange={handleCompanyInputChange}
                        onValueChange={handleCompanySelect}
                        openOnClick
                        allowCustomValue
                      >
                        <Combobox.Control>
                          <Combobox.Input
                            placeholder={t("issuance.companyPlaceholder")}
                            aria-label={t("soldiers.company")}
                          />
                          <Combobox.Trigger />
                        </Combobox.Control>
                        <Portal>
                          <Combobox.Positioner>
                            <Combobox.Content>
                              <Combobox.List>
                                {activeCompanies.map((company) => (
                                  <Combobox.Item
                                    key={company.companyId}
                                    item={company}
                                  >
                                    <Combobox.ItemText>
                                      {company.name}
                                    </Combobox.ItemText>
                                  </Combobox.Item>
                                ))}
                              </Combobox.List>
                              <Combobox.Empty>
                                <Text textStyle="sm" color="fg.muted" p="3">
                                  {t("issuance.noCompaniesFound")}
                                </Text>
                              </Combobox.Empty>
                            </Combobox.Content>
                          </Combobox.Positioner>
                        </Portal>
                      </Combobox.Root>
                    </Field.Root>
                  </Grid>

                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap="4"
                  >
                    <Field.Root required invalid={isDuplicatePersonalId}>
                      <Field.Label>{t("soldiers.personalId")}</Field.Label>
                      <Input
                        type="tel"
                        value={personalId}
                        onChange={handlePersonalIdChange}
                        inputMode="numeric"
                      />
                      {isDuplicatePersonalId ? (
                        <Field.ErrorText>
                          {t("issuance.duplicatePersonalId")}
                        </Field.ErrorText>
                      ) : null}
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>{t("soldiers.phone")}</Field.Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        inputMode="tel"
                      />
                    </Field.Root>
                  </Grid>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost">{t("common.cancel")}</Button>
                </Dialog.ActionTrigger>
                <Button
                  type="submit"
                  colorPalette="sage"
                  loading={
                    upsertActivitySoldier.isPending ||
                    upsertGlobalSoldier.isPending ||
                    upsertCompany.isPending
                  }
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

type AddSoldierDialogProps = {
  activityId: string | undefined;
  open: boolean;
  initialQuery: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (soldier: Soldier) => void;
};

type SoldierSaveScope = "activity" | "global";

const getDuplicateSource = (
  saveScope: SoldierSaveScope,
  personalId: string,
  activitySoldiers: Soldier[],
  globalSoldiers: Soldier[],
): Soldier | undefined => {
  const source = saveScope === "activity" ? activitySoldiers : globalSoldiers
  return source.find((soldier) => soldier.personalId === personalId)
}

function buildCompanyUpsertInput_(
  existingCompany: {
    companyId: string;
    name: string;
    isActive: boolean;
  } | undefined,
  normalizedCompanyValue: string,
) {
  if (!existingCompany) {
    return {
      name: normalizedCompanyValue,
      isActive: true,
    };
  }

  if (!existingCompany.isActive) {
    return {
      companyId: existingCompany.companyId,
      name: existingCompany.name,
      isActive: true,
    };
  }

  return undefined;
}
