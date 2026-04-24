import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  applyColorMode,
  readStoredColorMode,
  writeStoredColorMode,
} from "./color-mode"

const STORAGE_KEY = "logi8173_color_mode"

describe("color-mode", () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe("readStoredColorMode", () => {
    it("returns 'light' when nothing is stored", () => {
      expect(readStoredColorMode()).toBe("light")
    })

    it("returns 'dark' when 'dark' is stored", () => {
      window.localStorage.setItem(STORAGE_KEY, "dark")
      expect(readStoredColorMode()).toBe("dark")
    })

    it("returns 'combat' when 'combat' is stored", () => {
      window.localStorage.setItem(STORAGE_KEY, "combat")
      expect(readStoredColorMode()).toBe("combat")
    })

    it("falls back to 'light' for an invalid stored value", () => {
      window.localStorage.setItem(STORAGE_KEY, "neon")
      expect(readStoredColorMode()).toBe("light")
    })

    it("falls back to 'light' for an empty string", () => {
      window.localStorage.setItem(STORAGE_KEY, "")
      expect(readStoredColorMode()).toBe("light")
    })
  })

  describe("writeStoredColorMode", () => {
    it("persists each valid mode", () => {
      writeStoredColorMode("dark")
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark")

      writeStoredColorMode("combat")
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("combat")

      writeStoredColorMode("light")
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("light")
    })
  })

  describe("applyColorMode", () => {
    it("writes the mode to document.documentElement.dataset.theme", () => {
      applyColorMode("dark")
      expect(document.documentElement.dataset.theme).toBe("dark")

      applyColorMode("combat")
      expect(document.documentElement.dataset.theme).toBe("combat")

      applyColorMode("light")
      expect(document.documentElement.dataset.theme).toBe("light")
    })
  })
})
