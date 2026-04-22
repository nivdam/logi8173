import { useEffect, useRef } from "react"
import { activeProtectedRequestCount, onProtectedRequestCountChange } from "./auth-helpers"

export const useActivityClosedGuard = ({
  isActivityClosed,
  skip,
  onReset,
}: UseActivityClosedGuardInput): void => {
  const hasHandledRef = useRef(false)
  const onResetRef = useRef(onReset)
  onResetRef.current = onReset

  useEffect(() => {
    if (!isActivityClosed) {
      hasHandledRef.current = false
      return
    }
    if (hasHandledRef.current) return
    if (skip) return
    hasHandledRef.current = true

    const runReset = () => {
      window.setTimeout(() => onResetRef.current(), 0)
    }

    if (activeProtectedRequestCount() === 0) {
      runReset()
      return
    }

    const unsubscribe = onProtectedRequestCountChange((count) => {
      if (count !== 0) return
      unsubscribe()
      runReset()
    })
    return unsubscribe
  }, [isActivityClosed, skip])
}

type UseActivityClosedGuardInput = {
  isActivityClosed: boolean
  skip?: boolean
  onReset: () => void
}
