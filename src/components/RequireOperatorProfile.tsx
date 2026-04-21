import { OperatorProfileDialog } from "./OperatorProfileDialog"
import { useAuth } from "../lib/use-auth"
import { showApiErrorToast } from "../lib/api-error"
import { t } from "../lib/i18n"
import { useSaveOperatorProfile } from "../features/operator-profile/useSaveOperatorProfile"
import { useEnsureOperatorProfileSynced } from "../features/operator-profile/useEnsureOperatorProfileSynced"
import { isOperatorProfileComplete } from "../lib/auth.types"
import type { OperatorProfile } from "../lib/auth.types"

export const RequireOperatorProfile = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { status, operator, operatorProfile } = useAuth()
  const { saveProfile, isSaving } = useSaveOperatorProfile()
  useEnsureOperatorProfileSynced()

  const isMissingProfile =
    status === "authenticated" &&
    operator !== undefined &&
    !isOperatorProfileComplete(operatorProfile)

  const handleSaveProfile = async (profile: OperatorProfile) => {
    try {
      await saveProfile(profile)
    } catch (error) {
      showApiErrorToast({
        actionLabel: t("settings.myProfile.saveError"),
        error,
      })
    }
  }

  return (
    <>
      {children}
      <OperatorProfileDialog
        open={isMissingProfile}
        isBlocking
        defaultFullName={operator?.fullName ?? ""}
        defaultSavedSignature={operator?.savedSignatureUrl}
        initialProfile={operatorProfile}
        isSaving={isSaving}
        onSubmit={handleSaveProfile}
      />
    </>
  )
}
