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

const isOperatorProfileComplete = (
  profile: OperatorProfile | undefined,
): profile is OperatorProfile => {
  if (!profile) return false
  return (
    profile.fullName.trim() !== "" &&
    profile.rank.trim() !== "" &&
    profile.personalId.trim() !== "" &&
    profile.phone.trim() !== "" &&
    profile.company.trim() !== "" &&
    profile.savedSignature !== ""
  )
}

type AuthenticatedOperator = {
  email: string
  fullName: string
  role: OperatorRole
  avatarUrl: string | undefined
  googleSub: string
  savedSignatureUrl: string | undefined
}

type AuthState = {
  status: "unauthenticated" | "authenticated"
  operator: AuthenticatedOperator | undefined
  operatorProfile: OperatorProfile | undefined
  saveOperatorProfile: (profile: OperatorProfile) => void
  clearOperatorProfile: () => void
  resetSession: () => void
  logout: () => void
}

export type { OperatorRole, OperatorProfile, AuthenticatedOperator, AuthState }
export { isOperatorProfileComplete }
