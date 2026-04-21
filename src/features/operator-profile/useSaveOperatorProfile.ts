import { useSyncMyProfileSoldier } from "../../api"
import { useAuth } from "../../lib/use-auth"
import type { OperatorProfile } from "../../lib/auth.types"

const FALLBACK_OPERATOR_COMPANY = "פלס״ם"

export const useSaveOperatorProfile = () => {
  const { saveOperatorProfile } = useAuth()
  const syncMyProfileSoldier = useSyncMyProfileSoldier()

  const saveProfile = async (profile: OperatorProfile) => {
    const normalized = normalizeProfileForSave(profile)
    await syncMyProfileSoldier.mutateAsync({
      personalId: normalized.personalId,
      fullName: normalized.fullName,
      rank: normalized.rank,
      company: normalized.company,
      platoon: normalized.platoon,
      phone: normalized.phone === "" ? undefined : normalized.phone,
    })

    saveOperatorProfile(normalized)
  }

  return { saveProfile, isSaving: syncMyProfileSoldier.isPending }
}

export const normalizeProfileForSave = (
  profile: OperatorProfile,
): OperatorProfile => {
  const trimmedCompany = profile.company.trim()
  const trimmedPlatoon = profile.platoon?.trim() ?? ""
  return {
    fullName: profile.fullName.trim(),
    rank: profile.rank.trim(),
    personalId: profile.personalId.trim(),
    phone: profile.phone.trim(),
    company: trimmedCompany === "" ? FALLBACK_OPERATOR_COMPANY : trimmedCompany,
    platoon: trimmedPlatoon === "" ? undefined : trimmedPlatoon,
    savedSignature: profile.savedSignature,
  }
}
