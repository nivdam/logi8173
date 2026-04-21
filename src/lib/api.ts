import {
  getGoogleIdTokenExpiresAt,
  getStoredSession,
  notifySessionLost,
  refreshSessionToken,
} from "./auth-helpers"
import { mockApiRequest } from "./mock-api"
import type { AuthenticatedOperator } from "./auth.types"

const API_BASE = import.meta.env.VITE_API_BASE || "/api/gas"
const USE_MOCK = import.meta.env.VITE_API_BASE === "mock"
const REQUEST_TIMEOUT_MS = 60_000
const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000
const SESSION_INVALID_CODES = ["TOKEN_EXPIRED", "INVALID_ID_TOKEN"]

const isInvalidSessionError = (error: unknown): boolean =>
  error instanceof ApiError && SESSION_INVALID_CODES.includes(error.code)

const isTokenExpiringSoon = (idToken: string, tokenExpiresAt: number | undefined): boolean => {
  const expiresAt = tokenExpiresAt ?? getGoogleIdTokenExpiresAt(idToken)
  if (!expiresAt) return true
  return expiresAt - Date.now() <= TOKEN_REFRESH_SKEW_MS
}

const isTokenExpired = (idToken: string, tokenExpiresAt: number | undefined): boolean => {
  const expiresAt = tokenExpiresAt ?? getGoogleIdTokenExpiresAt(idToken)
  if (!expiresAt) return true
  return expiresAt <= Date.now()
}

const getFreshStoredIdToken = async (): Promise<string | undefined> => {
  const session = getStoredSession()
  if (!session?.idToken) return undefined
  if (!isTokenExpiringSoon(session.idToken, session.tokenExpiresAt)) {
    return session.idToken
  }

  const refreshedIdToken = await refreshSessionToken()
  if (refreshedIdToken) return refreshedIdToken
  return isTokenExpired(session.idToken, session.tokenExpiresAt) ? undefined : session.idToken
}

const fetchAndParse = async <T>(
  action: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const url = `${API_BASE}?action=${encodeURIComponent(action)}`
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => {
    window.clearTimeout(timeoutId)
  })

  const rawResponse = await response.text()
  let json: { ok?: boolean; data?: T; error?: string; message?: string }

  try {
    json = JSON.parse(rawResponse)
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      response.ok
        ? "The server returned an invalid response"
        : `The server returned HTTP ${response.status}`,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      json.error || `HTTP_${response.status}`,
      json.message || `The server returned HTTP ${response.status}`,
    )
  }

  if (!json.ok) {
    throw new ApiError(
      json.error || "UNKNOWN_ERROR",
      json.message || "The server returned an error",
    )
  }

  return json.data as T
}

const handleNetworkError = <T>(action: string, body: Record<string, unknown>, error: unknown): T => {
  if (error instanceof ApiError) {
    throw error
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    throw new ApiError("NETWORK_TIMEOUT", "The server took too long to respond")
  }

  if (import.meta.env.DEV && error instanceof TypeError) {
    return mockApiRequest<T>(action, body) as T
  }
  throw new ApiError("NETWORK_ERROR", "Could not reach the server")
}

const appsScriptRequest = async <T>(
  action: string,
  body: Record<string, unknown> = {},
  explicitIdToken?: string,
): Promise<T> => {
  if (USE_MOCK) {
    return mockApiRequest<T>(action, body)
  }

  const idToken = explicitIdToken ?? await getFreshStoredIdToken()
  if (!idToken) {
    notifySessionLost()
    throw new ApiError("SESSION_EXPIRED", "Session expired")
  }

  try {
    return await fetchAndParse<T>(action, { ...body, idToken })
  } catch (error) {
    if (!explicitIdToken && isInvalidSessionError(error)) {
      const refreshedIdToken = await refreshSessionToken()
      if (refreshedIdToken) {
        try {
          return await fetchAndParse<T>(action, { ...body, idToken: refreshedIdToken })
        } catch (retryError) {
          if (!isInvalidSessionError(retryError)) {
            return handleNetworkError<T>(action, body, retryError)
          }
        }
      }
      notifySessionLost()
      throw new ApiError("SESSION_EXPIRED", "Session expired")
    }
    return handleNetworkError<T>(action, body, error)
  }
}

const publicRequest = async <T>(
  action: string,
  body: Record<string, unknown> = {},
): Promise<T> => {
  if (USE_MOCK) {
    return mockApiRequest<T>(action, body)
  }

  try {
    return await fetchAndParse<T>(action, body)
  } catch (error) {
    return handleNetworkError<T>(action, body, error)
  }
}

export const api = {
  get: <T>(action: string, params?: Record<string, unknown>) =>
    appsScriptRequest<T>(action, params ?? {}),
  post: <T>(action: string, body?: Record<string, unknown>) =>
    appsScriptRequest<T>(action, body ?? {}),
  publicPost: publicRequest,
  authenticateWithGoogleToken: (idToken: string) =>
    appsScriptRequest<AuthenticatedOperator>("auth.me", {}, idToken),
}

class ApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = "ApiError"
  }
}

export { ApiError }
