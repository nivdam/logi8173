import type { ActivityType } from "../../types"

export type OpenActivityFormValues = {
  name: string
  activityType: ActivityType
  startDate: string
  itemIds: string[]
}
