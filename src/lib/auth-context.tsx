import { useCallback, useEffect, useRef, useState } from "react"
import { googleLogout, type CredentialResponse } from "@react-oauth/google"
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
  onSessionRefresh,
  notifySessionLost,
  markSessionActive,
  markSessionDispatched,
  SESSION_KEY,
} from "./auth-helpers"
import { clearAllDrafts } from "./use-draft-persistence"
import type { StoredSession } from "./auth-helpers"
import { AuthContext, AuthLoginContext } from "./auth-store"
import { api } from "./api"
import { GOOGLE_CLIENT_ID } from "./config"
import { toaster } from "./toaster"
import { t } from "./i18n"

const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000
const TOKEN_REFRESH_TIMEOUT_MS = 15 * 1000
const GOOGLE_ID_LOAD_TIMEOUT_MS = 15 * 1000
const GOOGLE_ID_LOAD_POLL_MS = 100

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const initialSession = getStoredSession()
  const sessionRef = useRef<StoredSession | undefined>(initialSession)
  const refreshPromiseRef = useRef<Promise<string | undefined> | undefined>(undefined)
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

  const handleLoginSuccess = useCallback((session: StoredSession) => {
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
    setStatus("authenticated")
  }, [])

  const handleRefreshCredential = useCallback(async (
    credentialResponse: CredentialResponse,
  ): Promise<string | undefined> => {
    const idToken = credentialResponse.credential
    if (!idToken) return undefined

    const operator = await api.authenticateWithGoogleToken(idToken)
    const currentSession = sessionRef.current
    const nextProfile =
      currentSession?.operatorProfile ?? getStoredOperatorProfile(operator.email)
    const nextSession = {
      operator: {
        ...operator,
        avatarUrl: operator.avatarUrl || currentSession?.operator.avatarUrl,
      },
      idToken,
      tokenExpiresAt: getGoogleIdTokenExpiresAt(idToken),
      operatorProfile: nextProfile,
    }

    storeSession(nextSession)
    sessionRef.current = nextSession
    markSessionActive()
    setOperator(nextSession.operator)
    setOperatorProfile(nextProfile)
    setTokenExpiresAt(nextSession.tokenExpiresAt)
    setStatus("authenticated")
    return idToken
  }, [])

  const refreshGoogleSession = useCallback((): Promise<string | undefined> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current
    const refreshPromise = waitForGoogleId_().then((googleId) => {
      if (!googleId) return undefined
      return new Promise<string | undefined>((resolve) => {
        let settled = false
        const settle = (idToken: string | undefined) => {
          if (settled) return
          settled = true
          window.clearTimeout(timeoutId)
          resolve(idToken)
        }
        const timeoutId = window.setTimeout(() => settle(undefined), TOKEN_REFRESH_TIMEOUT_MS)

        googleId.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: true,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true,
          callback: (credentialResponse) => {
            void handleRefreshCredential(credentialResponse)
              .then(settle)
              .catch(() => settle(undefined))
          },
        })

        googleId.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            settle(undefined)
          }
          if (
            notification.isDismissedMoment() &&
            notification.getDismissedReason() !== "credential_returned"
          ) {
            settle(undefined)
          }
        })
      })
    }).finally(() => {
      refreshPromiseRef.current = undefined
    })

    refreshPromiseRef.current = refreshPromise
    return refreshPromiseRef.current
  }, [handleRefreshCredential])

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
    setStatus("unauthenticated")
  }, [])

  useEffect(() => {
    return onSessionRefresh(refreshGoogleSession)
  }, [refreshGoogleSession])

  useEffect(() => {
    if (status !== "authenticated" || !tokenExpiresAt) return undefined

    const refreshDelay = Math.max(tokenExpiresAt - Date.now() - TOKEN_REFRESH_SKEW_MS, 0)
    const timeoutId = window.setTimeout(() => {
      void refreshGoogleSession()
    }, refreshDelay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [refreshGoogleSession, status, tokenExpiresAt])

  useEffect(() => {
    return onSessionLost(() => {
      void queryClient.cancelQueries()
      queryClient.clear()
      clearAllDrafts()
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
    clearAllDrafts()
    resetSession()
    googleLogout()
  }, [resetSession])

  return (
    <AuthContext.Provider
      value={{
        status,
        operator,
        operatorProfile,
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

const waitForGoogleId_ = (): Promise<GoogleIdApi | undefined> =>
  new Promise((resolve) => {
    const startedAt = Date.now()
    const check = () => {
      const googleId = window.google?.accounts?.id
      if (googleId) {
        resolve(googleId)
        return
      }
      if (Date.now() - startedAt >= GOOGLE_ID_LOAD_TIMEOUT_MS) {
        resolve(undefined)
        return
      }
      window.setTimeout(check, GOOGLE_ID_LOAD_POLL_MS)
    }
    check()
  })

type GoogleIdApi = NonNullable<Window["google"]>["accounts"]["id"]
