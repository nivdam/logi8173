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
  DashboardSummary,
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
const mockOperatorProfileBindings = new Map<string, string>()
const mockOperatorPersonalIdClaims = new Map<string, string>()
const mockPinnedActivityClientSeq = new Map<string, number>()
const mockActivitySoldierIds = new Map<string, Set<string>>()
const mockActivityInventoryOverrides = new Map<string, Map<string, InventoryItem>>()
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
  "activityInventory.list": (body) => {
    const rawActivityId = body?.activityId
    const activityId = rawActivityId ? String(rawActivityId).trim() : ""
    if (!activityId) {
      throw new Error("activityId is required")
    }
    const activity = mockActivities.find((candidate) => candidate.activityId === activityId)
    if (!activity) {
      throw new Error("Activity not found: " + activityId)
    }
    const snapshotItemIds = activityItemIdsById[activityId] ?? []
    const overrides = mockActivityInventoryOverrides.get(activityId) ?? new Map<string, InventoryItem>()
    return snapshotItemIds.map((itemId) => {
      const override = overrides.get(itemId)
      if (override) return override
      const master = inventoryMock.find((candidate) => candidate.itemId === itemId)
      if (!master) {
        throw new Error("Item not found in master inventory: " + itemId)
      }
      return master
    })
  },
  "activityInventory.batchUpdate": (body) => {
    const rawActivityId = body?.activityId
    const activityId = rawActivityId ? String(rawActivityId).trim() : ""
    if (!activityId) {
      throw new Error("activityId is required")
    }
    const activity = mockActivities.find((candidate) => candidate.activityId === activityId)
    if (!activity) {
      throw new Error("Activity not found: " + activityId)
    }
    if (activity.status !== "active") {
      throw new Error("Activity is not active: " + activityId)
    }
    const overrides = mockActivityInventoryOverrides.get(activityId) ?? new Map<string, InventoryItem>()
    const modified = Array.isArray(body?.modified) ? body.modified : []
    const added = Array.isArray(body?.added) ? body.added : []
    const deleted = Array.isArray(body?.deleted) ? body.deleted : []
    const snapshotItemIds = activityItemIdsById[activityId] ?? []
    const nextItemIds = [...snapshotItemIds]
    modified.forEach((patch) => {
      const itemId = String(patch?.itemId || "")
      if (!itemId) return
      const base = overrides.get(itemId) ?? inventoryMock.find((candidate) => candidate.itemId === itemId)
      if (!base) return
      overrides.set(itemId, { ...base, ...(patch as Partial<InventoryItem>) })
    })
    added.forEach((item) => {
      if (!item?.itemId) return
      overrides.set(item.itemId, item)
      if (!nextItemIds.includes(item.itemId)) {
        nextItemIds.push(item.itemId)
      }
    })
    deleted.forEach((itemId) => {
      const id = String(itemId)
      overrides.delete(id)
      const index = nextItemIds.indexOf(id)
      if (index >= 0) nextItemIds.splice(index, 1)
    })
    mockActivityInventoryOverrides.set(activityId, overrides)
    activityItemIdsById[activityId] = nextItemIds
    return {
      modified: modified.length,
      added: added.length,
      deleted: deleted.length,
    }
  },
  "soldiers.list": () => soldiersMock,
  "activitySoldiers.list": (body) => {
    const rawActivityId = body?.activityId
    const activityId = rawActivityId ? String(rawActivityId).trim() : ""
    if (!activityId) {
      throw new Error("activityId is required")
    }
    const activity = mockActivities.find((candidate) => candidate.activityId === activityId)
    if (!activity) {
      throw new Error("Activity not found: " + activityId)
    }
    const soldierIds = mockActivitySoldierIds.get(activityId)
    if (!soldierIds) return []
    return soldiersMock.filter((soldier) => soldierIds.has(soldier.personalId))
  },
  "activitySoldiers.importFromMaster": (body) => {
    const rawActivityId = body?.activityId
    const activityId = rawActivityId ? String(rawActivityId).trim() : ""
    if (!activityId) {
      throw new Error("activityId is required")
    }
    const activity = mockActivities.find((candidate) => candidate.activityId === activityId)
    if (!activity) {
      throw new Error("Activity not found: " + activityId)
    }
    if (activity.status !== "active") {
      throw new Error("Activity is not active: " + activityId)
    }
    const rawPersonalIds = Array.isArray(body?.personalIds) ? body.personalIds : []
    const personalIds: string[] = []
    const seen = new Set<string>()
    rawPersonalIds.forEach((value) => {
      const personalId = String(value || "").trim()
      if (!personalId || seen.has(personalId)) return
      seen.add(personalId)
      personalIds.push(personalId)
    })
    if (personalIds.length === 0) {
      throw new Error("personalIds must contain at least one id")
    }
    const missing = personalIds.filter(
      (personalId) => !soldiersMock.some((soldier) => soldier.personalId === personalId),
    )
    if (missing.length > 0) {
      throw new Error("Soldiers not found in master: " + missing.join(", "))
    }
    const existingIds = mockActivitySoldierIds.get(activityId) ?? new Set<string>()
    let importedCount = 0
    let skippedCount = 0
    personalIds.forEach((personalId) => {
      if (existingIds.has(personalId)) {
        skippedCount++
        return
      }
      existingIds.add(personalId)
      importedCount++
    })
    mockActivitySoldierIds.set(activityId, existingIds)
    return {
      activityId,
      imported: importedCount,
      skipped: skippedCount,
      requested: personalIds.length,
    }
  },
  "activitySoldiers.upsert": (body) => {
    const rawActivityId = body?.activityId
    const activityId = rawActivityId ? String(rawActivityId).trim() : ""
    if (!activityId) {
      throw new Error("activityId is required")
    }
    const activity = mockActivities.find((candidate) => candidate.activityId === activityId)
    if (!activity) {
      throw new Error("Activity not found: " + activityId)
    }
    if (activity.status !== "active") {
      throw new Error("Activity is not active: " + activityId)
    }
    const personalId = String(body?.personalId || "").trim()
    const fullName = String(body?.fullName || "").trim()
    if (!personalId || !fullName) {
      throw new Error("personalId and fullName are required")
    }
    const existing = soldiersMock.find((soldier) => soldier.personalId === personalId)
    if (existing) {
      existing.fullName = fullName
      existing.rank = String(body?.rank || existing.rank)
      existing.company = String(body?.company || existing.company)
      existing.platoon = body?.platoon ? String(body.platoon) : existing.platoon
      existing.phone = body?.phone ? String(body.phone) : existing.phone
    } else {
      soldiersMock.push({
        personalId,
        fullName,
        rank: String(body?.rank || ""),
        company: String(body?.company || ""),
        platoon: body?.platoon ? String(body.platoon) : undefined,
        phone: body?.phone ? String(body.phone) : undefined,
        createdAt: new Date().toISOString(),
      })
    }
    const existingIds = mockActivitySoldierIds.get(activityId) ?? new Set<string>()
    existingIds.add(personalId)
    mockActivitySoldierIds.set(activityId, existingIds)
    return { personalId, fullName }
  },
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
    const isReturnType = transaction.txType === "return" || transaction.txType === "return_borrow"
    const items = transaction.items.map((item) => ({
      ...item,
      issuedQty: item.qty,
      returnedQty: isReturnType ? item.qty : 0,
      remainingQty: isReturnType ? 0 : item.qty,
      returnEvents: [],
    }))
    const fallbackParty = {
      fullName: "",
      personalId: "",
      rank: "",
      company: "",
      phone: "",
      role: "",
    }

    return {
      txId: transaction.txId,
      formNumber: transaction.formNumber,
      txType: transaction.txType,
      giverPersonalId: transaction.giverPersonalId,
      giverName: transaction.giverName,
      receiverPersonalId: transaction.receiverPersonalId,
      receiverName: transaction.receiverName,
      performedAt: transaction.performedAt,
      items,
      notes: transaction.notes,
      signatureBase64: "",
      giverSignatureBase64: "",
      activityName: activity?.name || "",
      soldier: soldier
        ? {
            personalId: soldier.personalId,
            fullName: soldier.fullName,
            rank: soldier.rank,
            company: soldier.company,
            phone: soldier.phone,
          }
        : null,
      operator: operator
        ? {
            fullName: operator.fullName,
            role: operator.role,
            personalId: "8004001",
            rank: "רס\"ר",
            phone: "0522442182",
            company: "מפקדה",
          }
        : null,
      giver: {
        ...fallbackParty,
        fullName: transaction.giverName,
        personalId: transaction.giverPersonalId,
        ...(transaction.giverPersonalId === "8004001"
          ? { rank: "רס\"ר", phone: "0522442182", company: "מפקדה", role: "warehouse_operator" }
          : {}),
      },
      receiver: {
        ...fallbackParty,
        fullName: transaction.receiverName,
        personalId: transaction.receiverPersonalId,
        ...(soldier
          ? {
              rank: soldier.rank,
              company: soldier.company,
              phone: soldier.phone ?? "",
            }
          : {}),
      },
    } satisfies PublicTransaction
  },
  "dashboard.summary": (body) => {
    const rawActivityId = body?.activityId
    const activityId = rawActivityId ? String(rawActivityId).trim() : ""
    if (!activityId) return dashboardMock
    const activity = mockActivities.find((candidate) => candidate.activityId === activityId)
    if (!activity) {
      throw new Error("Activity not found: " + activityId)
    }
    const snapshotItemIds = activityItemIdsById[activityId] ?? []
    const overrides = mockActivityInventoryOverrides.get(activityId) ?? new Map<string, InventoryItem>()
    const snapshotItems = snapshotItemIds
      .map((itemId) => overrides.get(itemId) ?? inventoryMock.find((candidate) => candidate.itemId === itemId))
      .filter((item): item is InventoryItem => !!item)
    const lowStockCount = snapshotItems.filter(
      (item) => item.currentQty > 0 && item.currentQty <= item.minThreshold,
    ).length
    const gapCount = snapshotItems.filter((item) => item.currentQty <= 0).length
    const scopedTransactions = mockTransactions.filter(
      (transaction) => mockTransactionActivityIds[transaction.txId] === activityId,
    )
    return {
      ...dashboardMock,
      totalItems: snapshotItems.length,
      lowStockCount,
      gapCount,
      activeActivities: activity.status === "active" ? 1 : 0,
      recentTransactions: scopedTransactions.slice(0, 5),
      companyBreakdown: [],
      damageBreakdown: [],
    } satisfies DashboardSummary
  },
  "auth.me": () => ({
    ...mockOperators[0],
  }),
  "operators.list": () => mockOperators,
  "operators.upsert": (body) => {
    const nextOperator: AuthenticatedOperator = {
      email: String(body?.email || "").toLowerCase(),
      fullName: String(body?.fullName || ""),
      role: String(body?.role || "viewer") as OperatorRole,
      googleSub: "",
      avatarUrl: undefined,
      savedSignatureUrl: body?.savedSignatureUrl ? String(body.savedSignatureUrl) : undefined,
      pinnedActivityId: undefined,
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
  "operators.syncMyProfile": (body) => {
    const personalId = String(body?.personalId || "")
    const operator = mockOperators[0]
    const operatorEmail = operator?.email ?? "dev@mock.local"
    const canSyncAny =
      operator?.role === "admin" || operator?.role === "warehouse_operator"
    const previousPersonalId = mockOperatorProfileBindings.get(operatorEmail)
    if (previousPersonalId && previousPersonalId !== personalId && !canSyncAny) {
      throw new Error("Personal ID is already bound to this operator")
    }

    const claimedBy = mockOperatorPersonalIdClaims.get(personalId)
    if (claimedBy && claimedBy !== operatorEmail) {
      throw new Error("Personal ID is already bound to another operator")
    }

    const existing = soldiersMock.find((soldier) => soldier.personalId === personalId)
    if (!canSyncAny && !previousPersonalId) {
      const normalize = (value: unknown) =>
        String(value || "").trim().replace(/\s+/g, " ").toLowerCase()
      if (!existing) {
        throw new Error("Personal ID must already exist before it can be bound to this operator")
      }
      if (
        normalize(existing.fullName) !== normalize(operator?.fullName) ||
        normalize(body?.fullName) !== normalize(operator?.fullName)
      ) {
        throw new Error("Personal ID does not match the authenticated operator")
      }
    }

    if (existing) {
      existing.fullName = String(body?.fullName || "")
      existing.rank = String(body?.rank || "")
      existing.company = String(body?.company || "")
      existing.platoon = body?.platoon ? String(body.platoon) : undefined
      existing.phone = body?.phone ? String(body.phone) : undefined
      mockOperatorProfileBindings.set(operatorEmail, personalId)
      mockOperatorPersonalIdClaims.set(personalId, operatorEmail)
      return {
        personalId: existing.personalId,
        fullName: existing.fullName,
        created: false,
      }
    }
    if (!canSyncAny) {
      throw new Error("Personal ID must already exist before it can be bound to this operator")
    }

    const nextSoldier = {
      personalId,
      fullName: String(body?.fullName || ""),
      rank: String(body?.rank || ""),
      company: String(body?.company || ""),
      platoon: body?.platoon ? String(body.platoon) : undefined,
      phone: body?.phone ? String(body.phone) : undefined,
      createdAt: new Date().toISOString(),
    }
    soldiersMock.push(nextSoldier)
    mockOperatorProfileBindings.set(operatorEmail, personalId)
    mockOperatorPersonalIdClaims.set(personalId, operatorEmail)
    return {
      personalId: nextSoldier.personalId,
      fullName: nextSoldier.fullName,
      created: true,
    }
  },
  "operators.setPinnedActivity": (body) => {
    const rawActivityId = body?.activityId
    const isEmptyActivityId =
      rawActivityId === null ||
      rawActivityId === undefined ||
      String(rawActivityId).trim() === ""
    const pinnedActivityId = isEmptyActivityId ? undefined : String(rawActivityId).trim()
    if (pinnedActivityId && pinnedActivityId.length > 128) {
      throw new Error("activityId is too long")
    }
    if (pinnedActivityId) {
      const existingActivity = mockActivities.find(
        (activity) => activity.activityId === pinnedActivityId,
      )
      if (!existingActivity) {
        throw new Error("Activity not found: " + pinnedActivityId)
      }
    }
    const operator = mockOperators[0]
    const rawClientSeq = Number(body?.clientSeq)
    const clientSeq = Number.isFinite(rawClientSeq) && rawClientSeq > 0 ? rawClientSeq : 0
    if (operator) {
      const appliedSeq = mockPinnedActivityClientSeq.get(operator.email) ?? 0
      if (clientSeq > 0 && clientSeq <= appliedSeq) {
        return {
          pinnedActivityId: operator.pinnedActivityId,
          accepted: false,
          appliedClientSeq: appliedSeq,
        }
      }
      operator.pinnedActivityId = pinnedActivityId
      if (clientSeq > 0) {
        mockPinnedActivityClientSeq.set(operator.email, clientSeq)
      }
      return {
        pinnedActivityId,
        accepted: true,
        appliedClientSeq: clientSeq > 0 ? clientSeq : appliedSeq,
      }
    }
    return { pinnedActivityId, accepted: true, appliedClientSeq: clientSeq }
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
