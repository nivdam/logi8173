import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  readStoredActiveActivityId,
  writeStoredActiveActivityId,
} from "./active-activity-storage"

const ACTIVE_KEY = "logi8173_active_activity_id"
const LEGACY_KEY = "logi8173_last_activity_id"

describe("active-activity-storage", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe("readStoredActiveActivityId", () => {
    it("returns undefined when no value is stored", () => {
      expect(readStoredActiveActivityId()).toBeUndefined()
    })

    it("returns the stored value when present", () => {
      window.localStorage.setItem(ACTIVE_KEY, "act_123")
      expect(readStoredActiveActivityId()).toBe("act_123")
    })

    it("ignores empty and whitespace-only stored values", () => {
      window.localStorage.setItem(ACTIVE_KEY, "   ")
      expect(readStoredActiveActivityId()).toBeUndefined()
    })

    it("migrates the legacy key when only legacy is present", () => {
      window.localStorage.setItem(LEGACY_KEY, "act_legacy")
      expect(readStoredActiveActivityId()).toBe("act_legacy")
      expect(window.localStorage.getItem(ACTIVE_KEY)).toBe("act_legacy")
      expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull()
    })

    it("prefers the current key over the legacy key when both exist", () => {
      window.localStorage.setItem(ACTIVE_KEY, "act_current")
      window.localStorage.setItem(LEGACY_KEY, "act_legacy")
      expect(readStoredActiveActivityId()).toBe("act_current")
      expect(window.localStorage.getItem(LEGACY_KEY)).toBe("act_legacy")
    })
  })

  describe("writeStoredActiveActivityId", () => {
    it("stores the given activityId", () => {
      writeStoredActiveActivityId("act_new")
      expect(window.localStorage.getItem(ACTIVE_KEY)).toBe("act_new")
    })

    it("removes both current and legacy keys when given undefined", () => {
      window.localStorage.setItem(ACTIVE_KEY, "act_current")
      window.localStorage.setItem(LEGACY_KEY, "act_legacy")
      writeStoredActiveActivityId(undefined)
      expect(window.localStorage.getItem(ACTIVE_KEY)).toBeNull()
      expect(window.localStorage.getItem(LEGACY_KEY)).toBeNull()
    })

    it("overwrites a previously stored activityId", () => {
      writeStoredActiveActivityId("act_first")
      writeStoredActiveActivityId("act_second")
      expect(window.localStorage.getItem(ACTIVE_KEY)).toBe("act_second")
    })
  })
})
