import type { AuthenticatedOperator, OperatorRole } from "./auth.types"

export const canWrite = (role: OperatorRole): boolean =>
  role === "admin" || role === "warehouse_operator"

export const isAdmin = (role: OperatorRole): boolean =>
  role === "admin"

export const canAccessRoute = (
  role: OperatorRole,
  requiredRoles: OperatorRole[] | undefined,
): boolean => {
  if (!requiredRoles) return true
  return requiredRoles.includes(role)
}

const SESSION_KEY = "logi8173_session"

export const getStoredSession = (): StoredSession | undefined => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as StoredSession
  } catch {
    return undefined
  }
}

export const storeSession = (session: StoredSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY)
}

type StoredSession = {
  operator: AuthenticatedOperator
  idToken: string
}

export type { StoredSession }
