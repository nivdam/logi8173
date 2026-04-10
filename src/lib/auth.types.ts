type OperatorRole = "admin" | "warehouse_operator" | "commander" | "viewer"

type OperatorProfile = {
  fullName: string
  rank: string
  personalId: string
  phone: string
  savedSignature: string
}

type AuthenticatedOperator = {
  email: string
  fullName: string
  role: OperatorRole
  avatarUrl: string | undefined
  googleSub: string
  savedSignatureUrl?: string
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
