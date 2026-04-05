import { useContext } from "react"
import { AuthContext, AuthLoginContext } from "./auth-store"

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export const useAuthLogin = () => {
  const context = useContext(AuthLoginContext)
  if (!context) throw new Error("useAuthLogin must be used within AuthProvider")
  return context
}
