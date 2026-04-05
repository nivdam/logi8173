import type { AuthenticatedOperator, OperatorProfile, OperatorRole } from "./auth.types"

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
const PROFILE_KEY = "logi8173_operator_profiles"

export const getStoredSession = (): StoredSession | undefined => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return undefined
    const session = JSON.parse(raw) as StoredSession
    return {
      ...session,
      operatorProfile:
        session.operatorProfile ?? getStoredOperatorProfile(session.operator.email),
    }
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

const getStoredProfiles = (): Record<string, OperatorProfile> => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, OperatorProfile>
  } catch {
    return {}
  }
}

export const getStoredOperatorProfile = (
  email: string | undefined,
): OperatorProfile | undefined => {
  if (!email) return undefined
  const profiles = getStoredProfiles()
  return profiles[email]
}

export const storeOperatorProfile = (
  email: string,
  profile: OperatorProfile,
): void => {
  const profiles = getStoredProfiles()
  const updated = { ...profiles, [email]: profile }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
}

export const clearStoredOperatorProfile = (email: string): void => {
  const profiles = getStoredProfiles()
  const updated = Object.fromEntries(
    Object.entries(profiles).filter(([key]) => key !== email),
  )
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
}

export const updateStoredSessionProfile = (
  profile: OperatorProfile | undefined,
): void => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    const session = JSON.parse(raw) as StoredSession
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, operatorProfile: profile }))
  } catch {
    // noop — session corrupted
  }
}

type StoredSession = {
  operator: AuthenticatedOperator
  idToken: string
  operatorProfile?: OperatorProfile
}

export type { StoredSession }
