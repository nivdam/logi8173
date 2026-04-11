import type { Page } from "@playwright/test"

const MOCK_SESSION = {
  operator: {
    email: "dev@mock.local",
    fullName: "Dev User",
    role: "admin",
    googleSub: "mock_sub",
    avatarUrl: undefined,
    savedSignatureUrl: undefined,
  },
  idToken: "mock_id_token",
  operatorProfile: {
    fullName: "Dev User",
    rank: "סמל",
    personalId: "1234567",
    phone: "0501234567",
    savedSignature: "",
  },
}

export const seedAuth = async (page: Page) => {
  await page.addInitScript((session) => {
    localStorage.setItem("logi8173_session", JSON.stringify(session))
  }, MOCK_SESSION)
}
