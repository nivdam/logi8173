import { jwtDecode } from "../lib/auth-helpers"

export const decodeGoogleIdToken = (token: string): GoogleIdTokenPayload =>
  jwtDecode<GoogleIdTokenPayload>(token)

type GoogleIdTokenPayload = {
  sub: string
  email: string
  name: string
  picture: string | undefined
  email_verified: boolean
  exp: number
}

export type { GoogleIdTokenPayload }
