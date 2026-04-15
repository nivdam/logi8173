import { describe, it, expect } from "vitest"
import { computeSoldierIssuedItems, createLineFromIssuedItem } from "./return.utils"
import type { Transaction } from "../../types"
import type { SoldierIssuedItem } from "./return.types"

const makeTransaction = (
  overrides: Partial<Transaction> & Pick<Transaction, "txType" | "items">,
): Transaction => ({
  txId: "tx-1",
  txType: overrides.txType,
  giverPersonalId: "",
  giverName: "",
  receiverPersonalId: "",
  receiverName: "",
  performedBy: "op@test.com",
  performedAt: "2026-04-15T10:00:00Z",
  items: overrides.items,
  notes: "",
  signatureUrl: "",
  ...overrides,
})

describe("computeSoldierIssuedItems", () => {
  const soldierPersonalId = "8001001"

  it("returns empty array when no transactions exist", () => {
    const result = computeSoldierIssuedItems([], soldierPersonalId)
    expect(result).toEqual([])
  })

  it("returns empty array when soldier has no issuances", () => {
    const transactions = [
      makeTransaction({
        txType: "issue",
        receiverPersonalId: "9999999",
        items: [{ itemId: "item-1", name: "Vest", qty: 2, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toEqual([])
  })

  it("returns issued items for a single issuance", () => {
    const transactions = [
      makeTransaction({
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [
          { itemId: "item-1", name: "Vest", qty: 3, condition: "new", unitOfMeasure: "יחידה" },
        ],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe("item-1")
    expect(result[0].issuedQty).toBe(3)
    expect(result[0].returnedQty).toBe(0)
    expect(result[0].remainingQty).toBe(3)
  })

  it("aggregates multiple issuances of the same item", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-1",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 2, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-2",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 1, condition: "used" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(1)
    expect(result[0].issuedQty).toBe(3)
    expect(result[0].remainingQty).toBe(3)
    expect(result[0].condition).toBe("used")
  })

  it("subtracts returned quantities", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-1",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 5, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-2",
        txType: "return",
        giverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 2, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(1)
    expect(result[0].issuedQty).toBe(5)
    expect(result[0].returnedQty).toBe(2)
    expect(result[0].remainingQty).toBe(3)
  })

  it("filters out fully returned items", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-1",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 2, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-2",
        txType: "return",
        giverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 2, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(0)
  })

  it("handles multiple items in one transaction", () => {
    const transactions = [
      makeTransaction({
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [
          { itemId: "item-1", name: "Vest", qty: 1, condition: "new" },
          { itemId: "item-2", name: "Helmet", qty: 2, condition: "new" },
        ],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(2)
    expect(result.find((item) => item.itemId === "item-1")?.remainingQty).toBe(1)
    expect(result.find((item) => item.itemId === "item-2")?.remainingQty).toBe(2)
  })

  it("ignores transactions for other soldiers", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-1",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 3, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-2",
        txType: "issue",
        receiverPersonalId: "other-soldier",
        items: [{ itemId: "item-1", name: "Vest", qty: 10, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(1)
    expect(result[0].issuedQty).toBe(3)
  })

  it("ignores non-issue/return transaction types", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-1",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 5, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-2",
        txType: "count_adjustment",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: -3, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(1)
    expect(result[0].remainingQty).toBe(5)
  })

  it("uses default condition and unit when not provided", () => {
    const transactions = [
      makeTransaction({
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Cable", qty: 1 }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result[0].condition).toBe("new")
    expect(result[0].unitOfMeasure).toBe("יחידה")
  })

  it("does not create entry from return-only transactions", () => {
    const transactions = [
      makeTransaction({
        txType: "return",
        giverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 2, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(0)
  })

  it("handles return transaction appearing before issue in array", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-return",
        txType: "return",
        giverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 1, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-issue",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 3, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(1)
    expect(result[0].issuedQty).toBe(3)
    expect(result[0].returnedQty).toBe(1)
    expect(result[0].remainingQty).toBe(2)
  })

  it("filters out items with negative remaining qty (over-return)", () => {
    const transactions = [
      makeTransaction({
        txId: "tx-1",
        txType: "issue",
        receiverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 1, condition: "new" }],
      }),
      makeTransaction({
        txId: "tx-2",
        txType: "return",
        giverPersonalId: soldierPersonalId,
        items: [{ itemId: "item-1", name: "Vest", qty: 3, condition: "new" }],
      }),
    ]
    const result = computeSoldierIssuedItems(transactions, soldierPersonalId)
    expect(result).toHaveLength(0)
  })
})

describe("createLineFromIssuedItem", () => {
  const issuedItem: SoldierIssuedItem = {
    itemId: "item-1",
    name: "Combat Vest",
    catalogNumber: "CV-100",
    unitOfMeasure: "יחידה",
    issuedQty: 5,
    returnedQty: 2,
    remainingQty: 3,
    condition: "used",
  }

  it("creates a line item with correct fields", () => {
    const line = createLineFromIssuedItem(issuedItem)
    expect(line.itemId).toBe("item-1")
    expect(line.name).toBe("Combat Vest")
    expect(line.catalogNumber).toBe("CV-100")
    expect(line.qty).toBe(3)
    expect(line.maxQty).toBe(3)
    expect(line.availableQty).toBe(3)
    expect(line.condition).toBe("used")
    expect(line.unitOfMeasure).toBe("יחידה")
    expect(line.isCustom).toBe(false)
    expect(line.notes).toBe("")
  })

  it("generates a unique lineId", () => {
    const line1 = createLineFromIssuedItem(issuedItem)
    const line2 = createLineFromIssuedItem(issuedItem)
    expect(line1.lineId).not.toBe(line2.lineId)
  })
})
