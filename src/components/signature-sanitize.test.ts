import { describe, expect, it } from "vitest"
import { sanitizeSignatureSvg } from "./signature-sanitize"

const encodeSvg = (svg: string): string =>
  `data:image/svg+xml;base64,${btoa(svg)}`

describe("sanitizeSignatureSvg", () => {
  it("preserves valid paths and rewrites stroke to currentColor", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50"><path d="M 1 1 L 10 10" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(svg))
    expect(output).toContain('stroke="currentColor"')
    expect(output).toContain('d="M 1 1 L 10 10"')
    expect(output).not.toContain("#1a1a1a")
  })

  it("strips <script> tags", () => {
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg"><script>window.__xss=true</script><path d="M 0 0 L 1 1"/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(malicious))
    expect(output).not.toContain("<script")
    expect(output).not.toContain("window.__xss")
    expect(output).toContain('d="M 0 0 L 1 1"')
  })

  it("strips onload and onclick event handler attributes", () => {
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 1 1" onload="alert(1)" onclick="alert(2)"/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(malicious))
    expect(output).not.toContain("onload")
    expect(output).not.toContain("onclick")
    expect(output).not.toContain("alert")
  })

  it("strips <foreignObject>, <iframe>, and <image> elements", () => {
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><iframe src="javascript:alert(1)"/></foreignObject><image href="javascript:alert(2)"/><path d="M 0 0 L 1 1"/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(malicious))
    expect(output).not.toContain("foreignObject")
    expect(output).not.toContain("iframe")
    expect(output).not.toContain("<image")
    expect(output).not.toContain("javascript:")
    expect(output).toContain('d="M 0 0 L 1 1"')
  })

  it("escapes quote characters in the d attribute", () => {
    const tricky = `<svg xmlns="http://www.w3.org/2000/svg"><path d='M 0 0&quot; onload=&quot;alert(1)'/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(tricky))
    expect(output).not.toContain("onload")
    // The quote should be encoded rather than closing the attribute
    expect(output).toContain("&quot;")
  })

  it("returns undefined for non-SVG data URLs", () => {
    const pngDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    expect(sanitizeSignatureSvg(pngDataUrl)).toBeUndefined()
  })

  it("returns undefined for malformed base64", () => {
    expect(sanitizeSignatureSvg("data:image/svg+xml;base64,!!!not-valid")).toBeUndefined()
  })

  it("returns undefined when the SVG has no path elements", () => {
    const empty = `<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>`
    expect(sanitizeSignatureSvg(encodeSvg(empty))).toBeUndefined()
  })

  it("returns undefined for empty input", () => {
    expect(sanitizeSignatureSvg("")).toBeUndefined()
  })

  it("preserves multiple path elements", () => {
    const multi = `<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 1 1"/><path d="M 5 5 L 6 6"/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(multi))
    expect(output).toContain('d="M 0 0 L 1 1"')
    expect(output).toContain('d="M 5 5 L 6 6"')
  })

  it("drops path elements that have no d attribute", () => {
    const mixed = `<svg xmlns="http://www.w3.org/2000/svg"><path/><path d="M 0 0 L 1 1"/></svg>`
    const output = sanitizeSignatureSvg(encodeSvg(mixed))
    const pathMatches = output?.match(/<path /g)
    expect(pathMatches?.length).toBe(1)
  })
})
