type OperatorRole = "admin" | "warehouse_operator" | "commander" | "viewer"

type OperatorProfile = {
  fullName: string
  rank: string
  personalId: string
  phone: string
  company: string
  platoon: string | undefined
  savedSignature: string
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== ""

const isOperatorProfileComplete = (
  profile: Partial<OperatorProfile> | undefined,
): profile is OperatorProfile => {
  if (!profile) return false
  return (
    isNonEmptyString(profile.fullName) &&
    isNonEmptyString(profile.rank) &&
    isNonEmptyString(profile.personalId) &&
    isNonEmptyString(profile.phone) &&
    isNonEmptyString(profile.company) &&
    isNonEmptyString(profile.savedSignature)
  )
}

type AuthenticatedOperator = {
  email: string
  fullName: string
  role: OperatorRole
  avatarUrl: string | undefined
  googleSub: string
  savedSignatureUrl: string | undefined
  pinnedActivityId: string | undefined
}

type AuthState = {
  status: "unauthenticated" | "authenticated"
  operator: AuthenticatedOperator | undefined
  operatorProfile: OperatorProfile | undefined
  tokenExpiresAt: number | undefined
  isSessionExpiringSoon: boolean
  saveOperatorProfile: (profile: OperatorProfile) => void
  clearOperatorProfile: () => void
  setPinnedActivityId: (pinnedActivityId: string | undefined) => void
  resetSession: () => void
  logout: () => void
}

export type { OperatorRole, OperatorProfile, AuthenticatedOperator, AuthState }
export { isOperatorProfileComplete }
