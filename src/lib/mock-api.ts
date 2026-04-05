import { inventoryMock } from "../mocks/inventory.mock"
import { soldiersMock } from "../mocks/soldiers.mock"
import { companiesMock } from "../mocks/companies.mock"
import { activitiesMock } from "../mocks/activities.mock"
import { transactionsMock } from "../mocks/transactions.mock"
import { dashboardMock } from "../mocks/dashboard.mock"

const MOCK_DELAY_MS = 400

const mockHandlers: Record<string, () => unknown> = {
  "setup.status": () => ({ initialized: true, folderUrl: "https://drive.google.com/mock" }),
  "inventory.list": () => inventoryMock,
  "soldiers.list": () => soldiersMock,
  "companies.list": () => companiesMock,
  "activities.list": () => activitiesMock,
  "tx.list": () => transactionsMock,
  "dashboard.summary": () => dashboardMock,
  "auth.me": () => ({
    email: "dev@mock.local",
    fullName: "Dev User",
    role: "admin",
    googleSub: "mock_sub",
    avatarUrl: undefined,
    savedSignatureUrl: undefined,
  }),
  "operators.list": () => [],
  "tx.create": () => ({
    txId: "tx_mock_" + Date.now(),
    txType: "issue",
    performedBy: "dev@mock.local",
    performedAt: new Date().toISOString(),
    items: [],
    signatureUrl: "",
  }),
}

export const mockApiRequest = <T>(action: string): Promise<T> => {
  const handler = mockHandlers[action]

  if (!handler) {
    return Promise.reject(new Error("No mock handler for action: " + action))
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(handler() as T)
    }, MOCK_DELAY_MS)
  })
}
