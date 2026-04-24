import { useSyncExternalStore } from "react"
import {
  applyColorMode,
  readStoredColorMode,
  writeStoredColorMode,
} from "./color-mode"
import type { ColorMode } from "./color-mode"

// Module-level singleton so every useColorMode() consumer observes the same
// state. Without this, each hook call had its own useState and toggling from
// the header did not re-render components that read the mode in their render
// output (e.g. SignatureCanvas picking pen/background colors).
let currentMode: ColorMode = readStoredColorMode()
applyColorMode(currentMode)

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => currentMode

const setColorMode = (nextMode: ColorMode) => {
  if (nextMode === currentMode) return
  currentMode = nextMode
  writeStoredColorMode(nextMode)
  applyColorMode(nextMode)
  listeners.forEach((listener) => listener())
}

export const useColorMode = () => {
  const colorMode = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { colorMode, setColorMode }
}
