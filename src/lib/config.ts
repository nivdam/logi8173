const requireEnv = (name: string): string => {
  const value = import.meta.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const GOOGLE_CLIENT_ID = requireEnv("VITE_GOOGLE_CLIENT_ID")

export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ""

// Only available in dev builds — tree-shaken from production
export const DEV_ADMIN_EMAIL = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_ADMIN_EMAIL
  : undefined
