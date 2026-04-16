import { getStoredSession, clearSession } from "./auth-helpers"
import { mockApiRequest } from "./mock-api"
import type { AuthenticatedOperator } from "./auth.types"

const API_BASE = import.meta.env.VITE_API_BASE || "/api/gas"
const USE_MOCK = import.meta.env.VITE_API_BASE === "mock"
const REQUEST_TIMEOUT_MS = 60_000

const getIdToken = (): string => {
  const session = getStoredSession()
  if (!session) throw new Error("Not authenticated")
  return session.idToken
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
  idToken?: string,
): Promise<T> => {
  if (USE_MOCK) {
    return mockApiRequest<T>(action, body)
  }

  try {
    const result = await fetchAndParse<T>(action, {
      ...body,
      idToken: idToken ?? getIdToken(),
    })
    return result
  } catch (error) {
    if (error instanceof ApiError && error.code === "TOKEN_EXPIRED") {
      return handleTokenExpired(() => appsScriptRequest<T>(action, body))
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

let refreshAttemptInProgress = false

const handleTokenExpired = async <T>(retryFn: () => Promise<T>): Promise<T> => {
  if (refreshAttemptInProgress) {
    clearSession()
    window.location.reload()
    throw new ApiError("TOKEN_EXPIRED", "Session expired")
  }

  refreshAttemptInProgress = true

  try {
    const newToken = await silentReAuth()
    if (!newToken) {
      throw new Error("No token received")
    }
    refreshAttemptInProgress = false
    return retryFn()
  } catch {
    refreshAttemptInProgress = false
    clearSession()
    window.location.reload()
    throw new ApiError("TOKEN_EXPIRED", "Session expired")
  }
}

const silentReAuth = (): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google Identity Services not loaded"))
      return
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Silent re-auth timed out"))
    }, 5000)

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        clearTimeout(timeoutId)
        reject(new Error("Silent re-auth failed"))
      }
      clearTimeout(timeoutId)
      const session = getStoredSession()
      resolve(session?.idToken)
    })
  })
}

export const api = {
  get: <T>(action: string, params?: Record<string, unknown>) =>
    appsScriptRequest<T>(action, params ?? {}),
  post: appsScriptRequest,
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
