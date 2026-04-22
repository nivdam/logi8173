import { useEffect } from "react"

const dirtyFormIds = new Set<string>()
const listeners = new Set<(hasDirty: boolean) => void>()

const emit = (): void => {
  const hasDirty = dirtyFormIds.size > 0
  listeners.forEach((listener) => {
    listener(hasDirty)
  })
}

export const registerDirtyForm = (id: string): void => {
  if (dirtyFormIds.has(id)) return
  dirtyFormIds.add(id)
  emit()
}

export const unregisterDirtyForm = (id: string): void => {
  if (!dirtyFormIds.has(id)) return
  dirtyFormIds.delete(id)
  emit()
}

export const hasDirtyForms = (): boolean => dirtyFormIds.size > 0

export const onDirtyFormsChange = (
  listener: (hasDirty: boolean) => void,
): (() => void) => {
  listeners.add(listener)
  listener(dirtyFormIds.size > 0)
  return () => {
    listeners.delete(listener)
  }
}

export const useDirtyFormRegistration = (id: string, isDirty: boolean): void => {
  useEffect(() => {
    if (!isDirty) {
      unregisterDirtyForm(id)
      return
    }
    registerDirtyForm(id)
    return () => {
      unregisterDirtyForm(id)
    }
  }, [id, isDirty])
}
