import type { SystemStyleObject } from "@chakra-ui/react"
import type { ActivityStatus, ItemStatus, TransactionType } from "../types"

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate)
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export const getItemStatusColor = (status: ItemStatus): string => {
  if (status === "ok") return "green.600"
  if (status === "low") return "yellow.600"
  return "red.600"
}

export const getItemStatusLabel = (status: ItemStatus): string => {
  if (status === "ok") return "תקין"
  if (status === "low") return "מלאי נמוך"
  return "חוסר"
}

export const getActivityStatusLabel = (status: ActivityStatus): string => {
  if (status === "draft") return "טיוטה"
  if (status === "active") return "פעיל"
  if (status === "credit") return "זיכוי"
  if (status === "reconciliation") return "התאמה"
  return "סגור"
}

export const getActivityStatusColor = (
  status: ActivityStatus,
): SystemStyleObject["color"] => {
  if (status === "active") return "green.600"
  if (status === "draft") return "gray.500"
  if (status === "closed") return "sky.600"
  if (status === "credit") return "yellow.600"
  return "orange.500"
}

export const getTransactionTypeLabel = (txType: TransactionType): string => {
  if (txType === "issue") return "הנפקה"
  if (txType === "return") return "החזרה"
  if (txType === "borrow_in") return "השאלה נכנסת"
  if (txType === "return_borrow") return "החזרת השאלה"
  if (txType === "count_adjustment") return "תיקון ספירה"
  return "מחיקה"
}
