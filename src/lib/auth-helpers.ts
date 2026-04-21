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

export const SESSION_KEY = "logi8173_session"
const PROFILE_KEY = "logi8173_operator_profiles"

const sessionLostListeners = new Set<() => void>()
let sessionLostDispatched = false
let sessionLostPendingFlush = false

export const onSessionLost = (listener: () => void): (() => void) => {
  sessionLostListeners.add(listener)
  if (sessionLostPendingFlush) {
    sessionLostPendingFlush = false
    listener()
  }
  return () => {
    sessionLostListeners.delete(listener)
  }
}

export const notifySessionLost = (): void => {
  if (sessionLostDispatched) return
  sessionLostDispatched = true
  clearSession()
  if (sessionLostListeners.size === 0) {
    sessionLostPendingFlush = true
    return
  }
  sessionLostListeners.forEach((listener) => {
    listener()
  })
}

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
  safeLocalStorageWrite(SESSION_KEY, JSON.stringify(session))
}

export const markSessionActive = (): void => {
  sessionLostDispatched = false
}

export const markSessionDispatched = (): void => {
  sessionLostDispatched = true
}

export const clearSession = (): void => {
  safeLocalStorageRemove(SESSION_KEY)
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
  safeLocalStorageWrite(PROFILE_KEY, JSON.stringify(updated))
}

export const clearStoredOperatorProfile = (email: string): void => {
  const profiles = getStoredProfiles()
  const updated = Object.fromEntries(
    Object.entries(profiles).filter(([key]) => key !== email),
  )
  safeLocalStorageWrite(PROFILE_KEY, JSON.stringify(updated))
}

export const updateStoredSessionProfile = (
  profile: OperatorProfile | undefined,
): void => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    const session = JSON.parse(raw) as StoredSession
    safeLocalStorageWrite(SESSION_KEY, JSON.stringify({ ...session, operatorProfile: profile }))
  } catch {
    // noop — session corrupted
  }
}

const safeLocalStorageWrite = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn(`[auth-helpers] localStorage write failed for ${key}:`, error)
  }
}

const safeLocalStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`[auth-helpers] localStorage remove failed for ${key}:`, error)
  }
}

type StoredSession = {
  operator: AuthenticatedOperator
  idToken: string
  operatorProfile?: OperatorProfile
}

export type { StoredSession }
