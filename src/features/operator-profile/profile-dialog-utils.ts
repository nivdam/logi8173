import { t } from "../../lib/i18n";
import type { Soldier } from "../../types";

export const validateFullName = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  if (/\d/.test(trimmed)) return t("auth.errors.fullNameHasDigits");
  if (trimmed.replace(/\s/g, "").length < 3)
    return t("auth.errors.fullNameTooShort");
  return undefined;
};

export const validatePersonalId = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  if (!/^\d+$/.test(trimmed)) return t("auth.errors.personalIdDigitsOnly");
  if (trimmed.length < 6 || trimmed.length > 9)
    return t("auth.errors.personalIdLength");
  return undefined;
};

export const validatePhone = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  if (!/^05\d-?\d{7}$/.test(trimmed)) return t("auth.errors.phoneInvalid");
  return undefined;
};

export const findPersonalIdConflict = (
  enteredPersonalId: string,
  soldiers: Soldier[],
  ownPersonalId: string | undefined,
): string | undefined => {
  const trimmed = enteredPersonalId.trim();
  if (trimmed === "") return undefined;
  if (ownPersonalId && trimmed === ownPersonalId) return undefined;
  const existing = soldiers.find((soldier) => soldier.personalId === trimmed);
  if (!existing) return undefined;
  return t("auth.errors.personalIdTaken");
};

export const filterSoldiersForProfile = (
  query: string,
  soldiers: Soldier[],
): Soldier[] => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return soldiers.slice(0, 20);

  return soldiers
    .filter(
      (soldier) =>
        soldier.fullName.toLowerCase().includes(trimmed) ||
        String(soldier.personalId).includes(trimmed),
    )
    .slice(0, 20);
};

export const getCompanyOptions = (
  companies: { name: string; isActive: boolean }[],
  selectedCompany: string,
): string[] => {
  const options = companies
    .filter((company) => company.isActive)
    .map((company) => company.name);
  const trimmedSelected = selectedCompany.trim();

  if (trimmedSelected && !options.includes(trimmedSelected)) {
    return [trimmedSelected, ...options];
  }

  return options;
};
