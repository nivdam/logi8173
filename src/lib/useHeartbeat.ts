import { useEffect, useRef } from "react"
import { api } from "./api"

const HEARTBEAT_INTERVAL_MS = 45_000

export const useHeartbeat = () => {
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const sendHeartbeat = () => {
      api.post("presence.heartbeat").catch(() => {
        // Silent failure — heartbeat errors should not disrupt the user
      })
    }

    // Send immediately on mount
    sendHeartbeat()

    intervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)

    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])
}
