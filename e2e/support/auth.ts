import type { Page } from "@playwright/test"

const SESSION_KEY = "logi8173_session"
const PROFILE_KEY = "logi8173_operator_profiles"

type TestOperatorRole = "admin" | "warehouse_operator" | "commander" | "viewer"

type SessionSeedOptions = {
  email?: string
  fullName?: string
  role?: TestOperatorRole
}

const DEFAULT_OPERATOR_PROFILE = {
  fullName: "מפעיל בדיקות",
  rank: "רס\"ל",
  personalId: "1234567",
  phone: "0501234567",
  savedSignature: "",
}

export const seedAuthenticatedSession = async (
  page: Page,
  options: SessionSeedOptions = {},
) => {
  const email = options.email ?? "dev@mock.local"
  const fullName = options.fullName ?? "Dev User"
  const role = options.role ?? "admin"

  await page.addInitScript(
    ({ sessionKey, profileKey, seedEmail, seedFullName, seedRole, operatorProfile }) => {
      const session = {
        idToken: "mock-id-token",
        operator: {
          email: seedEmail,
          fullName: seedFullName,
          role: seedRole,
          googleSub: "mock_sub",
          avatarUrl: undefined,
          savedSignatureUrl: undefined,
        },
        operatorProfile,
      }

      localStorage.setItem(sessionKey, JSON.stringify(session))
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          [seedEmail]: operatorProfile,
        }),
      )
    },
    {
      sessionKey: SESSION_KEY,
      profileKey: PROFILE_KEY,
      seedEmail: email,
      seedFullName: fullName,
      seedRole: role,
      operatorProfile: {
        ...DEFAULT_OPERATOR_PROFILE,
        fullName,
      },
    },
  )
}
