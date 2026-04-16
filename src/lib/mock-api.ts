import { inventoryMock } from "../mocks/inventory.mock"
import { soldiersMock } from "../mocks/soldiers.mock"
import { companiesMock } from "../mocks/companies.mock"
import { activitiesMock } from "../mocks/activities.mock"
import { transactionsMock } from "../mocks/transactions.mock"
import { dashboardMock } from "../mocks/dashboard.mock"
import type { AuthenticatedOperator, OperatorRole } from "./auth.types"
import type {
  Activity,
  ActivityType,
  ActivityDetails,
  InventoryItem,
  PublicTransaction,
  Transaction,
  TransactionLineItem,
  TransactionType,
} from "../types"

const MOCK_DELAY_MS = 400

type MockBody = Record<string, unknown>

const mockCompanies = [...companiesMock]
const mockActivities: Activity[] = activitiesMock.map((activity) => ({ ...activity }))
const mockTransactions = [...transactionsMock]
let mockFormCounter = mockTransactions.length
const mockTransactionActivityIds: Record<string, string> = Object.fromEntries(
  mockTransactions.map((transaction) => [transaction.txId, "act1"]),
)
const activityItemIdsById = Object.fromEntries(
  activitiesMock.map((activity) => [
    activity.activityId,
    inventoryMock.slice(0, activity.selectedItemCount).map((item) => item.itemId),
  ]),
) as Record<string, string[]>
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
  "activities.list": () => mockActivities,
  "activities.get": (body) => {
    const activityId = String(body?.activityId || mockActivities[0]?.activityId || "")
    const activity = mockActivities.find((item) => item.activityId === activityId) ?? mockActivities[0]
    const snapshotItemIds = activity ? activityItemIdsById[activity.activityId] ?? [] : []

    return {
      activity,
      snapshotItems: inventoryMock.filter((item) => snapshotItemIds.includes(item.itemId)),
    }
  },
  "tx.list": (body) => {
    const activityId = body?.activityId ? String(body.activityId) : undefined
    if (!activityId) return mockTransactions
    return mockTransactions
  },
  "tx.getPublic": (body) => {
    const txId = String(body?.txId || "")
    const activityId = String(body?.activityId || "")
    const transaction = mockTransactions.find((item) => item.txId === txId)
    const transactionActivityId = mockTransactionActivityIds[txId]

    if (!transaction || transactionActivityId !== activityId) {
      throw new Error("Transaction not found")
    }

    const isIssuanceType = transaction.txType === "issue" || transaction.txType === "borrow_in"
    const soldierPersonalId = isIssuanceType
      ? transaction.receiverPersonalId
      : transaction.giverPersonalId
    const soldier = soldiersMock.find((item) => item.personalId === soldierPersonalId) ?? null
    const operator = mockOperators.find((item) => item.email === transaction.performedBy) ?? mockOperators[0] ?? null
    const activity = mockActivities.find((item) => item.activityId === activityId) ?? null

    return {
      txId: transaction.txId,
      formNumber: transaction.formNumber,
      txType: transaction.txType,
      giverPersonalId: transaction.giverPersonalId,
      giverName: transaction.giverName,
      receiverPersonalId: transaction.receiverPersonalId,
      receiverName: transaction.receiverName,
      performedAt: transaction.performedAt,
      items: transaction.items,
      notes: transaction.notes,
      signatureBase64: "",
      activityName: activity?.name || "",
      soldier: soldier
        ? {
            personalId: soldier.personalId,
            fullName: soldier.fullName,
            rank: soldier.rank,
            company: soldier.company,
          }
        : null,
      operator: operator
        ? {
            fullName: operator.fullName,
            role: operator.role,
          }
        : null,
    } satisfies PublicTransaction
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
    mockFormCounter++
    const formNumber = "1008-" + String(mockFormCounter).padStart(4, "0")
    const nextTransaction: Transaction = {
      txId: "tx_mock_" + Date.now(),
      formNumber,
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
    mockTransactionActivityIds[nextTransaction.txId] = String(body?.activityId || "")

    return {
      txId: nextTransaction.txId,
      formNumber,
      txType: nextTransaction.txType,
      performedBy: nextTransaction.performedBy,
      performedAt: nextTransaction.performedAt,
      items: nextTransaction.items,
      signatureUrl: nextTransaction.signatureUrl,
    }
  },
  "activities.open": (body) => {
    const activityId = "act_mock_" + Date.now()
    const itemIds = Array.isArray(body?.itemIds)
      ? body.itemIds
          .map((itemId) => String(itemId))
          .filter((itemId) => inventoryMock.some((item) => item.itemId === itemId))
      : []
    const nextActivity: Activity = {
      activityId,
      name: String(body?.name || "פעילות חדשה"),
      activityType: String(body?.activityType || "training") as ActivityType,
      status: "active",
      openedBy: "dev@mock.local",
      startDate: String(body?.startDate || new Date().toISOString().slice(0, 10)),
      endDate: undefined,
      folderId: "mock_folder_" + activityId,
      folderUrl: "https://drive.google.com/drive/folders/mock_folder_" + activityId,
      createdAt: new Date().toISOString(),
      closedAt: undefined,
      selectedItemCount: itemIds.length,
    }

    mockActivities.unshift(nextActivity)
    activityItemIdsById[activityId] = itemIds

    return nextActivity
  },
  "activities.addItems": (body) => {
    const activityId = String(body?.activityId || "")
    const activity = mockActivities.find((item) => item.activityId === activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    const nextItemIds = Array.isArray(body?.itemIds)
      ? body.itemIds
          .map((itemId) => String(itemId))
          .filter((itemId) => inventoryMock.some((item) => item.itemId === itemId))
      : []
    const mergedIds = [...new Set([...(activityItemIdsById[activityId] ?? []), ...nextItemIds])]

    activityItemIdsById[activityId] = mergedIds
    activity.selectedItemCount = mergedIds.length

    const snapshotItems = inventoryMock.filter((item) => mergedIds.includes(item.itemId))

    return {
      activity,
      snapshotItems,
    } satisfies ActivityDetails
  },
  "inventory.batchUpdate": (body) => {
    const modified = Array.isArray(body?.modified) ? body.modified : []
    const added = Array.isArray(body?.added) ? body.added : []
    const deleted = Array.isArray(body?.deleted) ? body.deleted : []

    const validModified = modified.filter((item) => {
      if (!item.itemId) return false
      const existingIndex = inventoryMock.findIndex(
        (existing) => existing.itemId === String(item.itemId),
      )
      if (existingIndex === -1) return false
      const existing = inventoryMock[existingIndex]
      inventoryMock[existingIndex] = {
        ...existing,
        ...(item.name !== undefined ? { name: String(item.name) } : {}),
        ...(item.itemNumber !== undefined ? { itemNumber: String(item.itemNumber) } : {}),
        ...(item.category !== undefined ? { category: String(item.category) as InventoryItem["category"] } : {}),
        ...(item.currentQty !== undefined ? { currentQty: Number(item.currentQty) } : {}),
        ...(item.unitOfMeasure !== undefined ? { unitOfMeasure: String(item.unitOfMeasure) as InventoryItem["unitOfMeasure"] } : {}),
        ...(item.notes !== undefined ? { notes: String(item.notes) } : {}),
        ...(item.minThreshold !== undefined ? { minThreshold: Number(item.minThreshold) } : {}),
      }
      return true
    })

    const validAdded = added.filter((item) => {
      if (!item.name || !item.category) return false
      const newItem: InventoryItem = {
        itemId: "i_mock_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        name: String(item.name),
        itemNumber: String(item.itemNumber || ""),
        category: String(item.category) as InventoryItem["category"],
        tags: [],
        unitOfMeasure: (String(item.unitOfMeasure || "יחידה")) as InventoryItem["unitOfMeasure"],
        currentQty: Number(item.currentQty) || 0,
        minThreshold: Number(item.minThreshold) || 0,
        status: "ok",
        notes: String(item.notes || ""),
      }
      inventoryMock.push(newItem)
      return true
    })

    const validDeleted = deleted.filter((itemId) => {
      const existingIndex = inventoryMock.findIndex(
        (existing) => existing.itemId === String(itemId),
      )
      if (existingIndex < 0) return false
      inventoryMock.splice(existingIndex, 1)
      return true
    })

    return {
      modified: validModified.length,
      added: validAdded.length,
      deleted: validDeleted.length,
    }
  },
  "activities.close": (body) => {
    const activityId = String(body?.activityId || "act1")
    const activity = mockActivities.find((item) => item.activityId === activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    if (activity.status === "closed") {
      throw new Error("Activity is already closed")
    }

    const closedAt = new Date().toISOString()
    activity.status = "closed"
    activity.closedAt = closedAt
    activity.endDate = closedAt

    return {
      activityId: activity.activityId,
      name: activity.name,
      status: "closed",
      closedAt,
    }
  },
  "activities.reopen": (body) => {
    const activityId = String(body?.activityId || "")
    const activity = mockActivities.find((item) => item.activityId === activityId)

    if (!activity) {
      throw new Error("Activity not found")
    }

    if (activity.status !== "closed") {
      throw new Error("Activity is not closed")
    }

    const reopenedAt = new Date().toISOString()
    activity.status = "active"
    activity.closedAt = undefined
    activity.endDate = undefined

    return {
      activityId: activity.activityId,
      name: activity.name,
      status: "active",
      reopenedAt,
    }
  },
  "presence.heartbeat": () => ({ ok: true }),
  "presence.getOnline": () => [
    {
      fullName: "Dev User",
      lastSeen: new Date().toISOString(),
    },
  ],
}

export const mockApiRequest = <T>(action: string, body?: MockBody): Promise<T> => {
  const handler = mockHandlers[action]

  if (!handler) {
    return Promise.reject(new Error("No mock handler for action: " + action))
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(handler(body) as T)
      } catch (error) {
        reject(error)
      }
    }, MOCK_DELAY_MS)
  })
}
