import { useMemo, useState } from "react";
import {
  Button,
  Combobox,
  createListCollection,
  Dialog,
  Field,
  Grid,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  useCompanies,
  useSoldiers,
  useUpsertCompany,
  useUpsertSoldier,
} from "../../api";
import { toaster } from "../../lib/toaster";
import { t } from "../../lib/i18n";
import type { Soldier } from "../../types";

const RANK_OPTIONS = [
  "טוראי",
  'רב"ט',
  "סמל",
  'סמ"ר',
  'רס"ל',
  'רס"מ',
  'רס"ב',
  'רנ"ג',
  "סגן",
  "סרן",
  'רס"ן',
  'סא"ל',
  'אל"מ',
];

const parseInitialQuery = (
  query: string,
): { fullName: string; personalId: string } => {
  const trimmed = query.trim();
  if (!trimmed) return { fullName: "", personalId: "" };
  if (/^\d+$/.test(trimmed)) return { fullName: "", personalId: trimmed };
  return { fullName: trimmed, personalId: "" };
};

export const AddSoldierDialog = ({
  open,
  initialQuery,
  onOpenChange,
  onCreated,
}: AddSoldierDialogProps) => {
  const { data: soldiers = [] } = useSoldiers();
  const { data: companies = [] } = useCompanies();
  const upsertCompany = useUpsertCompany();
  const createSoldier = useUpsertSoldier();

  const initial = parseInitialQuery(initialQuery);
  const [fullName, setFullName] = useState(initial.fullName);
  const [rank, setRank] = useState("");
  const [personalId, setPersonalId] = useState(initial.personalId);
  const [phone, setPhone] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [companyName, setCompanyName] = useState("");

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
    soldiers.some((soldier) => soldier.personalId === personalId.trim());

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
      company: companyValue,
      platoon: undefined,
      phone: phone.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!existingCompany) {
        await upsertCompany.mutateAsync({
          name: normalizedCompanyValue,
          isActive: true,
        });
      } else if (!existingCompany.isActive) {
        await upsertCompany.mutateAsync({
          companyId: existingCompany.companyId,
          name: existingCompany.name,
          isActive: true,
        });
      }

      await createSoldier.mutateAsync({
        fullName: nextSoldier.fullName,
        personalId: nextSoldier.personalId,
        rank: nextSoldier.rank,
        company: nextSoldier.company,
        phone: nextSoldier.phone,
      });
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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mx="4" maxW="lg" asChild>
            <form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>{t("issuance.addSoldierTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("issuance.addSoldierDescription")}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>{t("soldiers.fullName")}</Field.Label>
                    <Input
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.currentTarget.value)
                      }
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
                          onChange={(event) => setRank(event.target.value)}
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
                        value={personalId}
                        onChange={(event) =>
                          setPersonalId(event.currentTarget.value)
                        }
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
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.currentTarget.value)
                        }
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
                  loading={createSoldier.isPending || upsertCompany.isPending}
                  disabled={!isValid}
                >
                  {t("common.save")}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

type AddSoldierDialogProps = {
  open: boolean;
  initialQuery: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (soldier: Soldier) => void;
};
