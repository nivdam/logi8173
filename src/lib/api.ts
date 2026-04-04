import { APPS_SCRIPT_URL } from "./config"

const appsScriptFetch = async <T>(
  action: string,
  params?: Record<string, string>,
): Promise<T> => {
  const url = new URL(APPS_SCRIPT_URL)
  url.searchParams.set("action", action)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

const appsScriptPost = async <T>(
  action: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const url = new URL(APPS_SCRIPT_URL)
  url.searchParams.set("action", action)

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  get: appsScriptFetch,
  post: appsScriptPost,
}
