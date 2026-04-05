import { OperatorProfileDialog } from "./OperatorProfileDialog"
import { useAuth } from "../lib/use-auth"
import type { OperatorProfile } from "../lib/auth.types"

export const RequireOperatorProfile = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { status, operator, operatorProfile, saveOperatorProfile } = useAuth()

  const isMissingProfile =
    status === "authenticated" && operator !== undefined && operatorProfile === undefined

  const handleSaveProfile = (profile: OperatorProfile) => {
    saveOperatorProfile(profile)
  }

  return (
    <>
      {children}
      {isMissingProfile ? (
        <OperatorProfileDialog
          open
          isBlocking
          defaultFullName={operator.fullName}
          defaultSavedSignature={operator.savedSignatureUrl}
          initialProfile={undefined}
          isSaving={false}
          onSubmit={handleSaveProfile}
        />
      ) : null}
    </>
  )
}
