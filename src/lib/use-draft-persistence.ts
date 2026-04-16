import { useCallback, useEffect, useRef, useState } from "react"

const DEBOUNCE_MS = 1000

const readDraft = <T>(storageKey: string): T | null => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    return parsed
  } catch {
    localStorage.removeItem(storageKey)
    return null
  }
}

const writeDraft = <T>(storageKey: string, state: T) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch (error) {
    console.warn("[draft] localStorage write failed:", error)
  }
}

const removeDraft = (storageKey: string) => {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // ignore
  }
}

export const clearAllDrafts = () => {
  try {
    const keysToRemove = []
    for (const index of Array.from({ length: localStorage.length }, (_, i) => i)) {
      const key = localStorage.key(index)
      if (key && key.startsWith("draft:")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch {
    // ignore
  }
}

export const useDraftPersistence = <T, TSerialized = T>(
  storageKey: string,
  currentState: T,
  isDirty: boolean,
  isShowingSuccess: boolean,
  toSerializable?: (state: T) => TSerialized,
) => {
  const [savedDraft, setSavedDraft] = useState<TSerialized | null>(() => readDraft<TSerialized>(storageKey))
  const [draftDismissed, setDraftDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyRef = useRef(storageKey)
  keyRef.current = storageKey
  const serializerRef = useRef(toSerializable)
  serializerRef.current = toSerializable

  // Debounced save on state changes
  useEffect(() => {
    if (!isDirty || isShowingSuccess) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      const serializable = serializerRef.current
        ? serializerRef.current(currentState)
        : currentState
      writeDraft(keyRef.current, serializable)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentState, isDirty, isShowingSuccess])

  // Clean up draft when submission succeeds
  useEffect(() => {
    if (isShowingSuccess) {
      removeDraft(keyRef.current)
      setSavedDraft(null)
    }
  }, [isShowingSuccess])

  const clearDraft = useCallback(() => {
    removeDraft(keyRef.current)
    setSavedDraft(null)
    setDraftDismissed(true)
  }, [])

  const dismissDraft = useCallback(() => {
    setDraftDismissed(true)
  }, [])

  const hasDraft = savedDraft !== null && !draftDismissed

  return {
    savedDraft,
    hasDraft,
    clearDraft,
    dismissDraft,
  }
}
