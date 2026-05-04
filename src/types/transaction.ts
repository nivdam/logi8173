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

type PublicTransactionReturnEvent = {
  qty: number
  formNumber: string
  performedAt: string
  txId: string
}

type PublicTransactionLineItem = TransactionLineItem & {
  issuedQty: number
  returnedQty: number
  remainingQty: number
  returnEvents: PublicTransactionReturnEvent[]
}

type Transaction = {
  txId: string
  formNumber: string
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

type PublicTransactionSoldier = {
  personalId: string
  fullName: string
  rank: string
  company: string
  phone?: string
}

type PublicTransactionOperator = {
  fullName: string
  role: string
  personalId?: string
  rank?: string
  company?: string
  phone?: string
}

type PublicTransactionParty = {
  personalId: string
  fullName: string
  rank: string
  company: string
  phone: string
  role?: string
}

type PublicTransaction = {
  txId: string
  formNumber: string
  txType: TransactionType
  giverPersonalId: string
  giverName: string
  receiverPersonalId: string
  receiverName: string
  performedAt: string
  items: PublicTransactionLineItem[]
  notes: string
  signatureBase64: string
  giverSignatureBase64: string
  activityName: string
  soldier: PublicTransactionSoldier | null
  operator: PublicTransactionOperator | null
  giver: PublicTransactionParty
  receiver: PublicTransactionParty
}

export type {
  Transaction,
  TransactionType,
  TransactionLineItem,
  PublicTransactionLineItem,
  PublicTransactionReturnEvent,
  PublicTransaction,
}
