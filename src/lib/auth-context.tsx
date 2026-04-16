import { useCallback, useState } from "react"
import { googleLogout } from "@react-oauth/google"
import type { AuthState, AuthenticatedOperator, OperatorProfile } from "./auth.types"
import {
  getStoredSession,
  getStoredOperatorProfile,
  storeOperatorProfile,
  clearStoredOperatorProfile,
  storeSession,
  clearSession,
  updateStoredSessionProfile,
} from "./auth-helpers"
import { clearAllDrafts } from "./use-draft-persistence"
import type { StoredSession } from "./auth-helpers"
import { AuthContext, AuthLoginContext } from "./auth-store"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
    setOperator(undefined)
    setOperatorProfile(undefined)
    setStatus("unauthenticated")
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
