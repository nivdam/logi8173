const ACTIVE_ACTIVITY_STORAGE_KEY = "logi8173_active_activity_id"
const LEGACY_ACTIVITY_STORAGE_KEY = "logi8173_last_activity_id"

export const readStoredActiveActivityId = (): string | undefined => {
  try {
    const current = window.localStorage.getItem(ACTIVE_ACTIVITY_STORAGE_KEY)
    if (current && current.trim() !== "") return current

    const legacy = window.localStorage.getItem(LEGACY_ACTIVITY_STORAGE_KEY)
    if (legacy && legacy.trim() !== "") {
      window.localStorage.setItem(ACTIVE_ACTIVITY_STORAGE_KEY, legacy)
      window.localStorage.removeItem(LEGACY_ACTIVITY_STORAGE_KEY)
      return legacy
    }
    return undefined
  } catch {
    return undefined
  }
}

export const writeStoredActiveActivityId = (activityId: string | undefined): void => {
  try {
    if (activityId === undefined) {
      window.localStorage.removeItem(ACTIVE_ACTIVITY_STORAGE_KEY)
      window.localStorage.removeItem(LEGACY_ACTIVITY_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(ACTIVE_ACTIVITY_STORAGE_KEY, activityId)
  } catch {
    // storage unavailable — accepted, in-memory state is still correct
  }
}
