import {
  isOperatorProfileComplete,
  type AuthenticatedOperator,
  type OperatorProfile,
  type OperatorRole,
} from "./auth.types"

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
const POST_LOGIN_REDIRECT_KEY = "logi8173_post_login_redirect"

const sessionLostListeners = new Set<() => void>()
const protectedRequestListeners = new Set<(count: number) => void>()
let sessionLostDispatched = false
let sessionLostPendingFlush = false
let sessionLostPendingUntilIdle = false
let activeProtectedRequestCount_ = 0

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
  sessionLostPendingUntilIdle = false
  clearSession()
  if (sessionLostListeners.size === 0) {
    sessionLostPendingFlush = true
    return
  }
  sessionLostListeners.forEach((listener) => {
    listener()
  })
}

const emitProtectedRequestCount_ = (): void => {
  protectedRequestListeners.forEach((listener) => {
    listener(activeProtectedRequestCount_)
  })
}

export const activeProtectedRequestCount = (): number => activeProtectedRequestCount_

export const onProtectedRequestCountChange = (
  listener: (count: number) => void,
): (() => void) => {
  protectedRequestListeners.add(listener)
  listener(activeProtectedRequestCount_)
  return () => {
    protectedRequestListeners.delete(listener)
  }
}

export const beginProtectedRequest = (): void => {
  activeProtectedRequestCount_ += 1
  emitProtectedRequestCount_()
}

export const endProtectedRequest = (): void => {
  activeProtectedRequestCount_ = Math.max(activeProtectedRequestCount_ - 1, 0)
  emitProtectedRequestCount_()
  if (activeProtectedRequestCount_ === 0 && sessionLostPendingUntilIdle) {
    window.setTimeout(() => {
      if (sessionLostPendingUntilIdle && activeProtectedRequestCount_ === 0) {
        notifySessionLost()
      }
    }, 0)
  }
}

export const notifySessionLostWhenIdle = (): void => {
  if (sessionLostDispatched) return
  if (activeProtectedRequestCount_ === 0) {
    notifySessionLost()
    return
  }
  sessionLostPendingUntilIdle = true
}

export const getStoredSession = (): StoredSession | undefined => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return undefined
    const session = JSON.parse(raw) as StoredSession
    const storedProfile =
      getValidOperatorProfile(session.operatorProfile) ??
      getStoredOperatorProfile(session.operator.email)
    return {
      ...session,
      operatorProfile: storedProfile,
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
  sessionLostPendingUntilIdle = false
}

export const markSessionDispatched = (): void => {
  sessionLostDispatched = true
  sessionLostPendingUntilIdle = false
}

export const clearSession = (): void => {
  safeLocalStorageRemove(SESSION_KEY)
}

const getStoredProfiles = (): Record<string, unknown> => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

export const getStoredOperatorProfile = (
  email: string | undefined,
): OperatorProfile | undefined => {
  if (!email) return undefined
  const profiles = getStoredProfiles()
  return getValidOperatorProfile(profiles[email])
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

export const getGoogleIdTokenExpiresAt = (token: string): number | undefined => {
  try {
    return jwtDecode<GoogleIdTokenPayload>(token).exp * 1000
  } catch {
    return undefined
  }
}

export const jwtDecode = <T>(token: string): T => {
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT format")
  const base64Url = parts[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )
  return JSON.parse(json) as T
}

export const savePostLoginRedirect = (path: string): void => {
  if (!path || path === "/login") return
  if (!path.startsWith("/") || path.startsWith("//")) return
  try {
    sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
  } catch {
    // ignore
  }
}

export const consumePostLoginRedirect = (): string | undefined => {
  try {
    const value = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
    if (!value) return undefined
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
    return value
  } catch {
    return undefined
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

const getValidOperatorProfile = (profile: unknown): OperatorProfile | undefined => {
  const candidate = profile as Partial<OperatorProfile> | undefined
  if (!isOperatorProfileComplete(candidate)) {
    return undefined
  }
  return {
    fullName: candidate.fullName,
    rank: candidate.rank,
    personalId: candidate.personalId,
    phone: candidate.phone,
    company: candidate.company,
    platoon: typeof candidate.platoon === "string" ? candidate.platoon : undefined,
    savedSignature: candidate.savedSignature,
  }
}

type StoredSession = {
  operator: AuthenticatedOperator
  idToken: string
  tokenExpiresAt?: number
  operatorProfile?: OperatorProfile
}

type GoogleIdTokenPayload = {
  exp: number
}

export type { StoredSession }
