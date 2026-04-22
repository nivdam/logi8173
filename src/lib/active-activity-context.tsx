import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useActivities } from "../api/useActivities"
import { useSetPinnedActivity } from "../api/useOperators"
import { useAuth } from "./use-auth"
import { readStoredActiveActivityId, writeStoredActiveActivityId } from "./active-activity-storage"
import { showApiErrorToast } from "./api-error"
import { activeProtectedRequestCount, onProtectedRequestCountChange } from "./auth-helpers"
import { t } from "./i18n"
import type { Activity } from "../types"

type ActiveActivityContextValue = {
  activeActivityId: string | undefined
  activeActivity: Activity | undefined
  isResolving: boolean
  isProtectedRequestActive: boolean
  openActivities: Activity[]
  setActiveActivity: (activityId: string | undefined) => void
}

const ActiveActivityContext = createContext<ActiveActivityContextValue | undefined>(undefined)

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
  const { operator, setPinnedActivityId } = useAuth()
  const { data: activities, isSuccess: activitiesLoaded, isError: activitiesFailed } = useActivities()
  const { mutateAsync: persistPinnedActivity } = useSetPinnedActivity()

  const [activeActivityId, setActiveActivityIdState] = useState<string | undefined>(undefined)
  const [hasResolved, setHasResolved] = useState(false)
  const [protectedRequestCount, setProtectedRequestCount] = useState(activeProtectedRequestCount())
  // Pin-write serialization: setActiveActivity enqueues the latest target via
  // pendingPinActivityIdRef; persistLatestPin drains it sequentially so only one
  // request is in-flight at a time. pinRequestSeqRef is a monotonic counter
  // passed to the BE so out-of-order or cross-tab responses can be rejected;
  // we use Date.now() so the counter survives reloads and is unique across tabs.
  // lastAppliedPinSeqRef drops stale client-side resolves. lastPersistedPin-
  // ActivityIdRef is the last confirmed server state — used for error fallback.
  const pendingPinActivityIdRef = useRef<string | undefined>(undefined)
  const lastPersistedPinActivityIdRef = useRef<string | undefined>(operator?.pinnedActivityId)
  const isPersistingPinRef = useRef(false)
  const pinRequestSeqRef = useRef(0)
  const lastAppliedPinSeqRef = useRef(0)

  useEffect(() => {
    const unsubscribe = onProtectedRequestCountChange((count) => {
      setProtectedRequestCount(count)
    })
    return unsubscribe
  }, [])

  const openActivities = useMemo(() => {
    if (!activities) return []
    return activities
      .filter((activity) => activity.status === "active")
      .sort((first, second) => (second.createdAt ?? "").localeCompare(first.createdAt ?? ""))
  }, [activities])

  const isOpenActivity = useCallback(
    (activityId: string | undefined): boolean => {
      if (!activityId) return false
      return openActivities.some((activity) => activity.activityId === activityId)
    },
    [openActivities],
  )

  useEffect(() => {
    if (hasResolved) return
    if (!activitiesLoaded) return

    const pinnedActivityId = operator?.pinnedActivityId
    const storedActivityId = readStoredActiveActivityId()

    if (pinnedActivityId && isOpenActivity(pinnedActivityId)) {
      setActiveActivityIdState(pinnedActivityId)
      writeStoredActiveActivityId(pinnedActivityId)
    } else if (storedActivityId && isOpenActivity(storedActivityId)) {
      setActiveActivityIdState(storedActivityId)
    } else {
      setActiveActivityIdState(undefined)
      writeStoredActiveActivityId(undefined)
    }

    setHasResolved(true)
  }, [activitiesLoaded, hasResolved, operator?.pinnedActivityId, isOpenActivity])

  useEffect(() => {
    if (!hasResolved) return
    if (!activeActivityId) return
    if (!activitiesLoaded) return
    const activityExists = activities?.some((activity) => activity.activityId === activeActivityId) ?? false
    if (activityExists) return
    setActiveActivityIdState(undefined)
    writeStoredActiveActivityId(undefined)
  }, [activeActivityId, activities, activitiesLoaded, hasResolved])

  const persistLatestPin = useCallback(async () => {
    if (isPersistingPinRef.current) return
    isPersistingPinRef.current = true
    try {
      while (true) {
        const targetActivityId = pendingPinActivityIdRef.current
        const seqAtStart = pinRequestSeqRef.current
        try {
          const result = await persistPinnedActivity({
            activityId: targetActivityId,
            clientSeq: seqAtStart,
          })
          const isStaleResolve = seqAtStart < lastAppliedPinSeqRef.current
          if (isStaleResolve) {
            if (pendingPinActivityIdRef.current === targetActivityId) return
            continue
          }
          if (result.accepted) {
            lastAppliedPinSeqRef.current = seqAtStart
            lastPersistedPinActivityIdRef.current = targetActivityId
          }
        } catch (error) {
          const hasNewerRequest = pinRequestSeqRef.current !== seqAtStart
          if (!hasNewerRequest) {
            const fallbackActivityId = lastPersistedPinActivityIdRef.current
            setActiveActivityIdState(fallbackActivityId)
            writeStoredActiveActivityId(fallbackActivityId)
            setPinnedActivityId(fallbackActivityId)
            pendingPinActivityIdRef.current = fallbackActivityId
            showApiErrorToast({
              actionLabel: t("activitySelector.pinError"),
              error,
            })
            return
          }
        }
        if (pendingPinActivityIdRef.current === targetActivityId) return
      }
    } finally {
      isPersistingPinRef.current = false
    }
  }, [persistPinnedActivity, setPinnedActivityId])

  const setActiveActivity = useCallback(
    (nextActivityId: string | undefined) => {
      if (!hasResolved) return
      if (activeProtectedRequestCount() > 0) return
      if (activeActivityId === nextActivityId) return

      setActiveActivityIdState(nextActivityId)
      writeStoredActiveActivityId(nextActivityId)
      setPinnedActivityId(nextActivityId)

      pinRequestSeqRef.current = Math.max(pinRequestSeqRef.current + 1, Date.now())
      pendingPinActivityIdRef.current = nextActivityId
      void persistLatestPin()
    },
    [activeActivityId, hasResolved, persistLatestPin, setPinnedActivityId],
  )

  const activeActivity = useMemo(() => {
    if (!activeActivityId) return undefined
    return activities?.find((activity) => activity.activityId === activeActivityId)
  }, [activeActivityId, activities])

  const isResolving = !hasResolved && !activitiesFailed
  const isProtectedRequestActive = protectedRequestCount > 0

  const value = useMemo<ActiveActivityContextValue>(
    () => ({
      activeActivityId,
      activeActivity,
      isResolving,
      isProtectedRequestActive,
      openActivities,
      setActiveActivity,
    }),
    [activeActivityId, activeActivity, isResolving, isProtectedRequestActive, openActivities, setActiveActivity],
  )

  return <ActiveActivityContext.Provider value={value}>{children}</ActiveActivityContext.Provider>
}

export const useActiveActivity = (): ActiveActivityContextValue => {
  const context = useContext(ActiveActivityContext)
  if (!context) {
    throw new Error("useActiveActivity must be used within an ActivityProvider")
  }
  return context
}
