// Decode a Google ID token (JWT) without verification.
// Verification happens server-side in Apps Script.
export const jwtDecode = (token: string): GoogleIdTokenPayload => {
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Invalid JWT format")
  const base64Url = parts[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )
  return JSON.parse(json) as GoogleIdTokenPayload
}

type GoogleIdTokenPayload = {
  sub: string
  email: string
  name: string
  picture: string | undefined
  email_verified: boolean
}

export type { GoogleIdTokenPayload }
