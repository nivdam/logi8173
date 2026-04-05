import { useState, useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

const ACTIVE_INTERVAL = 10_000
const IDLE_INTERVAL = 30_000
const DEEP_IDLE_INTERVAL = 60_000

const IDLE_THRESHOLD = 2 * 60_000
const DEEP_IDLE_THRESHOLD = 5 * 60_000

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "touchstart", "scroll"]

export const useAdaptivePolling = () => {
  const queryClient = useQueryClient()
  const [lastActivityAt, setLastActivityAt] = useState(Date.now)

  const handleActivity = useCallback(() => {
    setLastActivityAt(Date.now())
  }, [])

  useEffect(() => {
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true })
    }

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity)
      }
    }
  }, [handleActivity])

  useEffect(() => {
    const checkIdleStatus = () => {
      const idleTime = Date.now() - lastActivityAt
      let interval = ACTIVE_INTERVAL

      if (idleTime >= DEEP_IDLE_THRESHOLD) {
        interval = DEEP_IDLE_INTERVAL
      } else if (idleTime >= IDLE_THRESHOLD) {
        interval = IDLE_INTERVAL
      }

      queryClient.setDefaultOptions({
        queries: {
          staleTime: interval,
          refetchInterval: interval,
        },
      })
    }

    const timerId = window.setInterval(checkIdleStatus, 10_000)
    checkIdleStatus()

    return () => {
      window.clearInterval(timerId)
    }
  }, [lastActivityAt, queryClient])
}
