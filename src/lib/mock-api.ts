import { inventoryMock } from "../mocks/inventory.mock"
import { soldiersMock } from "../mocks/soldiers.mock"
import { companiesMock } from "../mocks/companies.mock"
import { activitiesMock } from "../mocks/activities.mock"
import { transactionsMock } from "../mocks/transactions.mock"
import { dashboardMock } from "../mocks/dashboard.mock"

const MOCK_DELAY_MS = 400

type MockBody = Record<string, unknown>

const mockHandlers: Record<string, (body?: MockBody) => unknown> = {
  "setup.status": () => ({ initialized: true, folderUrl: "https://drive.google.com/mock" }),
  "inventory.list": () => inventoryMock,
  "soldiers.list": () => soldiersMock,
  "companies.list": () => companiesMock,
  "activities.list": () => activitiesMock,
  "activities.get": (body) => {
    const activityId = String(body?.activityId || activitiesMock[0]?.activityId || "")
    const activity = activitiesMock.find((item) => item.activityId === activityId) ?? activitiesMock[0]
    return {
      activity,
      snapshotItems: inventoryMock.slice(0, activity?.selectedItemCount || 0),
    }
  },
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
  "activities.open": (body) => ({
    activityId: "act_mock_" + Date.now(),
    name: String(body?.name || "פעילות חדשה"),
    activityType: body?.activityType || "training",
    status: "active",
    openedBy: "dev@mock.local",
    startDate: String(body?.startDate || new Date().toISOString().slice(0, 10)),
    endDate: "",
    folderId: "mock_folder_new",
    folderUrl: "https://drive.google.com/drive/folders/mock_folder_new",
    createdAt: new Date().toISOString(),
    closedAt: "",
    selectedItemCount: Array.isArray(body?.itemIds) ? body.itemIds.length : 0,
  }),
  "activities.close": (body) => ({
    activityId: String(body?.activityId || "act1"),
    status: "closed",
    closedAt: new Date().toISOString(),
  }),
}

export const mockApiRequest = <T>(action: string, body?: MockBody): Promise<T> => {
  const handler = mockHandlers[action]

  if (!handler) {
    return Promise.reject(new Error("No mock handler for action: " + action))
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(handler(body) as T)
    }, MOCK_DELAY_MS)
  })
}
