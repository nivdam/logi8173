type TransactionType = "issue" | "return" | "borrow_in" | "return_borrow" | "count_adjustment" | "write_off"

type TransactionLineItem = {
  itemId: string
  name: string
  qty: number
  condition: "new" | "used" | "damaged"
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
}

export type { Transaction, TransactionType, TransactionLineItem }
