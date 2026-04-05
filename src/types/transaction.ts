type TransactionType = "issue" | "return" | "borrow_in" | "return_borrow" | "count_adjustment" | "write_off"

type TransactionLineItem = {
  itemId: string
  name: string
  qty: number
  condition: "new" | "used" | "damaged"
  unitOfMeasure?: string
  notes?: string
  serialNumber?: string
  isCustom?: boolean
}

type Transaction = {
  txId: string
  txType: TransactionType
  giverName: string
  giverPersonalId: string
  receiverName: string
  receiverPersonalId: string
  performedBy: string
  performedAt: string
  items: TransactionLineItem[]
  notes: string
  signatureUrl: string
}

export type { Transaction, TransactionType, TransactionLineItem }
