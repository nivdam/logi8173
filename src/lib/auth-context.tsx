import { useCallback, useEffect, useState } from "react"
import { googleLogout } from "@react-oauth/google"
import { useQueryClient } from "@tanstack/react-query"
import type { AuthState, AuthenticatedOperator, OperatorProfile } from "./auth.types"
import {
  getStoredSession,
  getStoredOperatorProfile,
  storeOperatorProfile,
  clearStoredOperatorProfile,
  storeSession,
  clearSession,
  updateStoredSessionProfile,
  onSessionLost,
  notifySessionLost,
  markSessionActive,
  markSessionDispatched,
  SESSION_KEY,
} from "./auth-helpers"
import { clearAllDrafts } from "./use-draft-persistence"
import type { StoredSession } from "./auth-helpers"
import { AuthContext, AuthLoginContext } from "./auth-store"
import { toaster } from "./toaster"
import { t } from "./i18n"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const initialSession = getStoredSession()
  const [status, setStatus] = useState<AuthState["status"]>(() => {
    return initialSession ? "authenticated" : "unauthenticated"
  })
  const [operator, setOperator] = useState<AuthenticatedOperator | undefined>(
    () => initialSession?.operator,
  )
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile | undefined>(
    () => initialSession?.operatorProfile,
  )

  const handleLoginSuccess = useCallback((session: StoredSession) => {
    const nextProfile =
      session.operatorProfile ?? getStoredOperatorProfile(session.operator.email)
    storeSession({ ...session, operatorProfile: nextProfile })
    markSessionActive()
    setOperator(session.operator)
    setOperatorProfile(nextProfile)
    setStatus("authenticated")
  }, [])

  const saveOperatorProfile = useCallback(
    (profile: OperatorProfile) => {
      if (!operator) return
      storeOperatorProfile(operator.email, profile)
      updateStoredSessionProfile(profile)
      setOperatorProfile(profile)
    },
    [operator],
  )

  const clearOperatorProfile = useCallback(() => {
    if (!operator) return
    clearStoredOperatorProfile(operator.email)
    updateStoredSessionProfile(undefined)
    setOperatorProfile(undefined)
  }, [operator])

  const resetSession = useCallback(() => {
    clearSession()
    markSessionDispatched()
    setOperator(undefined)
    setOperatorProfile(undefined)
    setStatus("unauthenticated")
  }, [])

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
