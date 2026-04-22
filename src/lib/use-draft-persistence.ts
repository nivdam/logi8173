import { useCallback, useEffect, useRef, useState } from "react"
import { getStoredSession } from "./auth-helpers"

const DEBOUNCE_MS = 1000
const DRAFT_KEY_PREFIX = "draft:"

type StoredDraft<T> = {
  owner: string
  data: T
}

const getCurrentOwner = (): string | undefined =>
  getStoredSession()?.operator.email

const isStoredDraftPayload = <T>(value: unknown): value is Partial<StoredDraft<T>> =>
  !!value && typeof value === "object" && ("owner" in value || "data" in value)

const readDraftForOwner = <T>(storageKey: string, owner: string | undefined): T | null => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return null
    if (!isStoredDraftPayload<T>(parsed)) {
      if (!owner) return null
      writeDraft(storageKey, owner, parsed)
      return parsed as T
    }
    if (typeof parsed.owner !== "string") {
      if (!owner) return null
      const legacyData = parsed.data ?? parsed
      writeDraft(storageKey, owner, legacyData)
      return legacyData as T
    }
    if (!owner || parsed.owner !== owner) return null
    return parsed.data ?? null
  } catch {
    localStorage.removeItem(storageKey)
    return null
  }
}

const writeDraft = (storageKey: string, owner: string, data: unknown) => {
  const payload: StoredDraft<unknown> = { owner, data }
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload))
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

const forEachDraftKey = (callback: (key: string) => void) => {
  try {
    const keys: string[] = []
    for (const index of Array.from({ length: localStorage.length }, (_, i) => i)) {
      const key = localStorage.key(index)
      if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
        keys.push(key)
      }
    }
    keys.forEach(callback)
  } catch {
    // ignore
  }
}

export const clearAllDrafts = () => {
  forEachDraftKey((key) => localStorage.removeItem(key))
}

export const clearDraftsForOwner = (owner: string) => {
  forEachDraftKey((key) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const parsed: Partial<StoredDraft<unknown>> = JSON.parse(raw)
      if (parsed && parsed.owner === owner) {
        localStorage.removeItem(key)
      }
    } catch {
      localStorage.removeItem(key)
    }
  })
}

export const useDraftPersistence = <T, TSerialized = T>(
  storageKey: string,
  currentState: T,
  isDirty: boolean,
  isShowingSuccess: boolean,
  toSerializable?: (state: T) => TSerialized,
) => {
  const [savedDraft, setSavedDraft] = useState<TSerialized | null>(
    () => readDraftForOwner<TSerialized>(storageKey, getCurrentOwner()),
  )
  const [draftDismissed, setDraftDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyRef = useRef(storageKey)
  const serializerRef = useRef(toSerializable)
  serializerRef.current = toSerializable

  useEffect(() => {
    if (keyRef.current === storageKey) return
    keyRef.current = storageKey
    setSavedDraft(readDraftForOwner<TSerialized>(storageKey, getCurrentOwner()))
    setDraftDismissed(false)
  }, [storageKey])

  useEffect(() => {
    if (!isDirty || isShowingSuccess) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      const owner = getCurrentOwner()
      if (!owner) return
      const serializable = serializerRef.current
        ? serializerRef.current(currentState)
        : currentState
      writeDraft(keyRef.current, owner, serializable)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentState, isDirty, isShowingSuccess])

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
