import { createContext, useContext, useState, useCallback } from "react"
import { googleLogout } from "@react-oauth/google"
import type { AuthState, AuthenticatedOperator } from "./auth.types"
import {
  getStoredSession,
  storeSession,
  clearSession,
} from "./auth-helpers"
import type { StoredSession } from "./auth-helpers"

const AuthContext = createContext<AuthState | undefined>(undefined)
const AuthLoginContext = createContext<((session: StoredSession) => void) | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthState["status"]>(() => {
    const stored = getStoredSession()
    return stored ? "authenticated" : "unauthenticated"
  })
  const [operator, setOperator] = useState<AuthenticatedOperator | undefined>(
    () => getStoredSession()?.operator,
  )

  const handleLoginSuccess = useCallback((session: StoredSession) => {
    storeSession(session)
    setOperator(session.operator)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(() => {
    clearSession()
    googleLogout()
    setOperator(undefined)
    setStatus("unauthenticated")
  }, [])

  return (
    <AuthContext.Provider value={{ status, operator, logout }}>
      <AuthLoginContext.Provider value={handleLoginSuccess}>
        {children}
      </AuthLoginContext.Provider>
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export const useAuthLogin = () => {
  const context = useContext(AuthLoginContext)
  if (!context) throw new Error("useAuthLogin must be used within AuthProvider")
  return context
}
