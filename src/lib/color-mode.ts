const COLOR_MODE_STORAGE_KEY = "logi8173_color_mode"
const DEFAULT_COLOR_MODE: ColorMode = "light"
const VALID_MODES: readonly ColorMode[] = ["light", "dark", "combat"]

const isValidMode = (value: string | null): value is ColorMode => {
  if (value === null) return false
  return VALID_MODES.some((mode) => mode === value)
}

export const readStoredColorMode = (): ColorMode => {
  try {
    const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)
    if (isValidMode(stored)) return stored
    return DEFAULT_COLOR_MODE
  } catch {
    return DEFAULT_COLOR_MODE
  }
}

export const writeStoredColorMode = (mode: ColorMode): void => {
  try {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode)
  } catch {
    // storage unavailable — in-memory state still correct for this session
  }
}

export const applyColorMode = (mode: ColorMode): void => {
  document.documentElement.dataset.theme = mode
}

export type ColorMode = "light" | "dark" | "combat"
