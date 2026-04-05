import { createContext } from "react"
import type { AuthState } from "./auth.types"
import type { StoredSession } from "./auth-helpers"

export const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthLoginContext = createContext<
  ((session: StoredSession) => void) | undefined
>(undefined)
