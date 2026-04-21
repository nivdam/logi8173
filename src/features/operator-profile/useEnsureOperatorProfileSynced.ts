import { useEffect, useMemo, useRef } from "react"
import { useSyncMyProfileSoldier } from "../../api"
import { isOperatorProfileComplete } from "../../lib/auth.types"
import { useAuth } from "../../lib/use-auth"
import { normalizeProfileForSave } from "./useSaveOperatorProfile"

export const useEnsureOperatorProfileSynced = () => {
  const { status, operator, operatorProfile } = useAuth()
  const { mutate, isPending } = useSyncMyProfileSoldier()
  const lastSyncKeyRef = useRef<string | undefined>(undefined)

  const syncInput = useMemo(() => {
    if (
      status !== "authenticated" ||
      !operator ||
      !isOperatorProfileComplete(operatorProfile)
    ) {
      return undefined
    }

    const normalized = normalizeProfileForSave(operatorProfile)
    return {
      email: operator.email,
      personalId: normalized.personalId,
      fullName: normalized.fullName,
      rank: normalized.rank,
      company: normalized.company,
      platoon: normalized.platoon,
      phone: normalized.phone === "" ? undefined : normalized.phone,
    }
  }, [operator, operatorProfile, status])

  const syncKey = syncInput
    ? [
        syncInput.email,
        syncInput.personalId,
        syncInput.fullName,
        syncInput.rank,
        syncInput.company,
        syncInput.platoon ?? "",
        syncInput.phone ?? "",
      ].join("\u001f")
    : undefined

  useEffect(() => {
    if (!syncInput || !syncKey || isPending) return
    if (lastSyncKeyRef.current === syncKey) return

    lastSyncKeyRef.current = syncKey
    mutate(
      {
        personalId: syncInput.personalId,
        fullName: syncInput.fullName,
        rank: syncInput.rank,
        company: syncInput.company,
        platoon: syncInput.platoon,
        phone: syncInput.phone,
      },
    )
  }, [isPending, mutate, syncInput, syncKey])
}
