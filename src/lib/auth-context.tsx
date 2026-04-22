import { useCallback, useEffect, useRef, useState } from "react"
import { googleLogout } from "@react-oauth/google"
import { useQueryClient } from "@tanstack/react-query"
import type { AuthState, AuthenticatedOperator, OperatorProfile } from "./auth.types"
import {
  getGoogleIdTokenExpiresAt,
  getStoredSession,
  getStoredOperatorProfile,
  storeOperatorProfile,
  clearStoredOperatorProfile,
  storeSession,
  clearSession,
  updateStoredSessionProfile,
  onSessionLost,
  notifySessionLost,
  notifySessionLostWhenIdle,
  markSessionActive,
  markSessionDispatched,
  SESSION_KEY,
} from "./auth-helpers"
import { clearAllDrafts, clearDraftsForOwner } from "./use-draft-persistence"
import type { StoredSession } from "./auth-helpers"
import { AuthContext, AuthLoginContext } from "./auth-store"
import { toaster } from "./toaster"
import { t } from "./i18n"

const SESSION_EXPIRY_WARNING_MS = 2 * 60 * 1000

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const initialSession = getStoredSession()
  const sessionRef = useRef<StoredSession | undefined>(initialSession)
  const [status, setStatus] = useState<AuthState["status"]>(() => {
    return initialSession ? "authenticated" : "unauthenticated"
  })
  const [operator, setOperator] = useState<AuthenticatedOperator | undefined>(
    () => initialSession?.operator,
  )
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile | undefined>(
    () => initialSession?.operatorProfile,
  )
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | undefined>(
    () => initialSession?.tokenExpiresAt ?? getGoogleIdTokenExpiresAt(initialSession?.idToken ?? ""),
  )
  const [isSessionExpiringSoon, setIsSessionExpiringSoon] = useState(false)

  const handleLoginSuccess = useCallback((session: StoredSession) => {
    const previousEmail = sessionRef.current?.operator.email
    const nextEmail = session.operator.email
    if (previousEmail && previousEmail !== nextEmail) {
      clearDraftsForOwner(previousEmail)
    }

    const nextProfile =
      session.operatorProfile ?? getStoredOperatorProfile(session.operator.email)
    const nextSession = {
      ...session,
      tokenExpiresAt: session.tokenExpiresAt ?? getGoogleIdTokenExpiresAt(session.idToken),
      operatorProfile: nextProfile,
    }
    storeSession(nextSession)
    sessionRef.current = nextSession
    markSessionActive()
    setOperator(session.operator)
    setOperatorProfile(nextProfile)
    setTokenExpiresAt(nextSession.tokenExpiresAt)
    setIsSessionExpiringSoon(false)
    setStatus("authenticated")
  }, [])

  const saveOperatorProfile = useCallback(
    (profile: OperatorProfile) => {
      if (!operator) return
      storeOperatorProfile(operator.email, profile)
      updateStoredSessionProfile(profile)
      if (sessionRef.current) {
        sessionRef.current = { ...sessionRef.current, operatorProfile: profile }
      }
      setOperatorProfile(profile)
    },
    [operator],
  )

  const clearOperatorProfile = useCallback(() => {
    if (!operator) return
    clearStoredOperatorProfile(operator.email)
    updateStoredSessionProfile(undefined)
    if (sessionRef.current) {
      sessionRef.current = { ...sessionRef.current, operatorProfile: undefined }
    }
    setOperatorProfile(undefined)
  }, [operator])

  const resetSession = useCallback(() => {
    clearSession()
    markSessionDispatched()
    sessionRef.current = undefined
    setOperator(undefined)
    setOperatorProfile(undefined)
    setTokenExpiresAt(undefined)
    setIsSessionExpiringSoon(false)
    setStatus("unauthenticated")
  }, [])

  useEffect(() => {
    if (status !== "authenticated" || !tokenExpiresAt) {
      setIsSessionExpiringSoon(false)
      return undefined
    }

    const now = Date.now()
    const warningAt = tokenExpiresAt - SESSION_EXPIRY_WARNING_MS
    const expiredAt = tokenExpiresAt

    if (now >= expiredAt) {
      notifySessionLost()
      return undefined
    }

    setIsSessionExpiringSoon(now >= warningAt)

    const warningDelay = Math.max(warningAt - now, 0)
    const expiryDelay = Math.max(expiredAt - now, 0)

    const warningTimeoutId = window.setTimeout(() => {
      setIsSessionExpiringSoon(true)
    }, warningDelay)
    const expiryTimeoutId = window.setTimeout(() => {
      notifySessionLostWhenIdle()
    }, expiryDelay)

    return () => {
      window.clearTimeout(warningTimeoutId)
      window.clearTimeout(expiryTimeoutId)
    }
  }, [status, tokenExpiresAt])

  useEffect(() => {
    return onSessionLost(() => {
      void queryClient.cancelQueries()
      queryClient.clear()
      resetSession()
      toaster.create({
        title: t("auth.sessionExpiredTitle"),
        description: t("auth.sessionExpiredDescription"),
        type: "info",
        duration: 4000,
      })
    })
  }, [queryClient, resetSession])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY && event.newValue === null) {
        notifySessionLost()
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const logout = useCallback(() => {
    const email = sessionRef.current?.operator.email
    if (email) {
      clearDraftsForOwner(email)
    } else {
      clearAllDrafts()
    }
    resetSession()
    googleLogout()
  }, [resetSession])

  return (
    <AuthContext.Provider
      value={{
        status,
        operator,
        operatorProfile,
        tokenExpiresAt,
        isSessionExpiringSoon,
        saveOperatorProfile,
        clearOperatorProfile,
        resetSession,
        logout,
      }}
    >
      <AuthLoginContext.Provider value={handleLoginSuccess}>
        {children}
      </AuthLoginContext.Provider>
    </AuthContext.Provider>
  )
}
