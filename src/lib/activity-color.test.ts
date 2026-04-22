import { describe, it, expect } from "vitest"
import { getActivityBorderColor } from "./activity-color"

describe("getActivityBorderColor", () => {
  it("returns the border semantic token when no activityId is given", () => {
    expect(getActivityBorderColor(undefined)).toBe("var(--chakra-colors-border)")
  })

  it("returns the border semantic token when activityId is an empty string", () => {
    expect(getActivityBorderColor("")).toBe("var(--chakra-colors-border)")
  })

  it("returns an oklch color for a real activityId", () => {
    const color = getActivityBorderColor("act_abc123")
    expect(color).toMatch(/^oklch\(\d+(\.\d+)?% \d+(\.\d+)? \d+(\.\d+)?\)$/)
  })

  it("returns the same color for the same activityId across calls", () => {
    const first = getActivityBorderColor("act_stable")
    const second = getActivityBorderColor("act_stable")
    expect(first).toBe(second)
  })

  it("returns different colors for different activityIds", () => {
    const colorA = getActivityBorderColor("act_a")
    const colorB = getActivityBorderColor("act_b")
    expect(colorA).not.toBe(colorB)
  })
})
