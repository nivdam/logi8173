type OperatorRole = "admin" | "warehouse_operator" | "commander" | "viewer"

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
  logout: () => void
}

export type { OperatorRole, AuthenticatedOperator, AuthState }
