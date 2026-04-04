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
  createdAt: string
  closedAt: string | undefined
}

export type { Activity, ActivityType, ActivityStatus }
