type ActivityType = "training" | "operation" | "war" | "other"

type ActivityStatus = "draft" | "active" | "credit" | "reconciliation" | "closed"

type Activity = {
  activityId: string
  name: string
  activityType: ActivityType
  status: ActivityStatus
  openedBy: string
  startDate: string
  endDate: string | undefined
  folderId: string
  folderUrl: string
  createdAt: string
  closedAt: string | undefined
  selectedItemCount: number
}

type ActivityDetails = {
  activity: Activity
  snapshotItems: import("./inventory").InventoryItem[]
}

export type { Activity, ActivityType, ActivityStatus, ActivityDetails }
