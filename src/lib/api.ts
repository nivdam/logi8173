import { APPS_SCRIPT_URL } from "./config"
import { getStoredSession, clearSession } from "./auth-helpers"
import { mockApiRequest } from "./mock-api"

const USE_MOCK = !APPS_SCRIPT_URL || APPS_SCRIPT_URL === "mock"

const getIdToken = (): string => {
  const session = getStoredSession()
  if (!session) throw new Error("Not authenticated")
  return session.idToken
}

const appsScriptRequest = async <T>(
  action: string,
  body: Record<string, unknown> = {},
): Promise<T> => {
  if (USE_MOCK) {
    return mockApiRequest<T>(action)
  }

  try {
    const url = new URL(APPS_SCRIPT_URL)
    url.searchParams.set("action", action)

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ ...body, idToken: getIdToken() }),
      redirect: "follow",
    })

    const json = await response.json()

    if (!json.ok) {
      if (json.error === "TOKEN_EXPIRED") {
        return handleTokenExpired(() => appsScriptRequest<T>(action, body))
      }
      throw new ApiError(json.error, json.message)
    }

    return json.data as T
  } catch {
    // API unreachable — fall back to mock data in dev mode
    if (import.meta.env.DEV) {
      return mockApiRequest<T>(action)
    }
    throw new ApiError("NETWORK_ERROR", "Could not reach the server")
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
