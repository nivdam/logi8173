import { inventoryMock } from "../mocks/inventory.mock"
import { soldiersMock } from "../mocks/soldiers.mock"
import { companiesMock } from "../mocks/companies.mock"
import { activitiesMock } from "../mocks/activities.mock"
import { transactionsMock } from "../mocks/transactions.mock"
import { dashboardMock } from "../mocks/dashboard.mock"
import type { AuthenticatedOperator, OperatorRole } from "./auth.types"
import type { Transaction, TransactionLineItem, TransactionType } from "../types"

const MOCK_DELAY_MS = 400

type MockBody = Record<string, unknown>

const mockCompanies = [...companiesMock]
const mockTransactions = [...transactionsMock]
const mockOperators: AuthenticatedOperator[] = [
  {
    email: "dev@mock.local",
    fullName: "Dev User",
    role: "admin",
    googleSub: "mock_sub",
    avatarUrl: undefined,
    savedSignatureUrl: undefined,
  },
]

const mockHandlers: Record<string, (body?: MockBody) => unknown> = {
  "setup.status": () => ({ initialized: true, folderUrl: "https://drive.google.com/mock" }),
  "inventory.list": () => inventoryMock,
  "soldiers.list": () => soldiersMock,
  "companies.list": () => mockCompanies,
  "activities.list": () => activitiesMock,
  "activities.get": (body) => {
    const activityId = String(body?.activityId || activitiesMock[0]?.activityId || "")
    const activity = activitiesMock.find((item) => item.activityId === activityId) ?? activitiesMock[0]
    return {
      activity,
      snapshotItems: inventoryMock.slice(0, activity?.selectedItemCount || 0),
    }
  },
  "tx.list": (body) => {
    const activityId = body?.activityId ? String(body.activityId) : undefined
    if (!activityId) return mockTransactions
    return mockTransactions.filter((transaction) => transaction.activityId === activityId)
  },
  "dashboard.summary": () => dashboardMock,
  "auth.me": () => ({
    ...mockOperators[0],
  }),
  "operators.list": () => mockOperators,
  "operators.upsert": (body) => {
    const nextOperator = {
      email: String(body?.email || "").toLowerCase(),
      fullName: String(body?.fullName || ""),
      role: String(body?.role || "viewer") as OperatorRole,
      googleSub: "",
      avatarUrl: undefined,
      savedSignatureUrl: body?.savedSignatureUrl ? String(body.savedSignatureUrl) : undefined,
    }
    const existingIndex = mockOperators.findIndex((operator) => operator.email === nextOperator.email)

    if (existingIndex >= 0) {
      mockOperators[existingIndex] = {
        ...mockOperators[existingIndex],
        ...nextOperator,
      }
    } else {
      mockOperators.push(nextOperator)
    }

    return {
      email: nextOperator.email,
      fullName: nextOperator.fullName,
      role: nextOperator.role,
    }
  },
  "operators.delete": (body) => {
    const targetEmail = String(body?.email || "").toLowerCase()
    const existingIndex = mockOperators.findIndex((operator) => operator.email === targetEmail)

    if (existingIndex === -1) {
      throw new Error("Operator not found")
    }

    mockOperators.splice(existingIndex, 1)
    return { email: targetEmail }
  },
  "companies.upsert": (body) => {
    const companyId = body?.companyId ? String(body.companyId) : "comp_mock_" + Date.now()
    const nextCompany = {
      companyId,
      name: String(body?.name || ""),
      isActive: body?.isActive !== false,
    }
    const existingIndex = mockCompanies.findIndex((company) => company.companyId === companyId)

    if (existingIndex >= 0) {
      mockCompanies[existingIndex] = nextCompany
    } else {
      mockCompanies.push(nextCompany)
    }

    return { companyId: nextCompany.companyId, name: nextCompany.name }
  },
  "tx.create": (body) => {
    const nextTransaction: Transaction = {
      txId: "tx_mock_" + Date.now(),
      txType: String(body?.txType || "issue") as TransactionType,
      giverName: String(body?.giverName || ""),
      giverPersonalId: String(body?.giverPersonalId || ""),
      receiverName: String(body?.receiverName || ""),
      receiverPersonalId: String(body?.receiverPersonalId || ""),
      performedBy: "dev@mock.local",
      performedAt: String(body?.performedAt || new Date().toISOString()),
      items: (Array.isArray(body?.items) ? body.items : []) as TransactionLineItem[],
      notes: String(body?.notes || ""),
      signatureUrl: "",
    }

    mockTransactions.unshift(nextTransaction)

    return {
      txId: nextTransaction.txId,
      txType: nextTransaction.txType,
      performedBy: nextTransaction.performedBy,
      performedAt: nextTransaction.performedAt,
      items: nextTransaction.items,
      signatureUrl: nextTransaction.signatureUrl,
    }
  },
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
