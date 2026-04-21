import { useUpsertSoldier } from "../../api"
import { useAuth } from "../../lib/use-auth"
import type { OperatorProfile } from "../../lib/auth.types"

const DEFAULT_COMPANY = "פלס״ם"

export const useSaveOperatorProfile = () => {
  const { saveOperatorProfile } = useAuth()
  const upsertSoldier = useUpsertSoldier()

  const save = async (profile: OperatorProfile) => {
    const normalized = normalizeProfileForSave(profile)
    await upsertSoldier.mutateAsync({
      personalId: normalized.personalId,
      fullName: normalized.fullName,
      rank: normalized.rank,
      company: normalized.company,
      platoon: normalized.platoon,
      phone: normalized.phone || undefined,
    })
    saveOperatorProfile(normalized)
  }

  return { save, isSaving: upsertSoldier.isPending }
}

const normalizeProfileForSave = (profile: OperatorProfile): OperatorProfile => ({
  fullName: profile.fullName.trim(),
  rank: profile.rank.trim(),
  personalId: profile.personalId.trim(),
  phone: profile.phone.trim(),
  company: profile.company.trim() || DEFAULT_COMPANY,
  platoon: profile.platoon?.trim() || undefined,
  savedSignature: profile.savedSignature,
})
