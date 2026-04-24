const SVG_DATA_URL_PREFIX = "data:image/svg+xml;base64,"

// Reduces a base64-encoded SVG signature to a safe inline string: only <path>
// elements survive (stripping <script>, event handlers, <foreignObject>, etc.),
// and every stroke is rewritten to currentColor so the theme can recolor the
// signature at render time. Returns undefined for non-SVG data URLs, malformed
// base64, or SVGs that contain no path elements.
export const sanitizeSignatureSvg = (src: string): string | undefined => {
  if (!src.startsWith(SVG_DATA_URL_PREFIX)) return undefined

  const decoded = decodeBase64(src.slice(SVG_DATA_URL_PREFIX.length))
  if (decoded === undefined) return undefined

  const doc = new DOMParser().parseFromString(decoded, "image/svg+xml")
  if (doc.querySelector("parsererror") !== null) return undefined

  const sourceSvg = doc.querySelector("svg")
  if (sourceSvg === null) return undefined

  const width = sourceSvg.getAttribute("width") ?? "100%"
  const height = sourceSvg.getAttribute("height") ?? "100%"
  const viewBox = sourceSvg.getAttribute("viewBox") ?? ""

  const rebuiltPaths = Array.from(sourceSvg.querySelectorAll("path"))
    .map((pathEl) => {
      const d = pathEl.getAttribute("d")
      if (d === null || d === "") return undefined
      const strokeWidth = pathEl.getAttribute("stroke-width") ?? "2"
      const linecap = pathEl.getAttribute("stroke-linecap") ?? "round"
      const linejoin = pathEl.getAttribute("stroke-linejoin") ?? "round"
      return `<path d="${escapeAttribute(d)}" stroke="currentColor" stroke-width="${escapeAttribute(strokeWidth)}" stroke-linecap="${escapeAttribute(linecap)}" stroke-linejoin="${escapeAttribute(linejoin)}" fill="none"/>`
    })
    .filter((path): path is string => path !== undefined)

  if (rebuiltPaths.length === 0) return undefined

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${escapeAttribute(width)}" height="${escapeAttribute(height)}" viewBox="${escapeAttribute(viewBox)}">${rebuiltPaths.join("")}</svg>`
}

const decodeBase64 = (encoded: string): string | undefined => {
  try {
    return atob(encoded)
  } catch {
    return undefined
  }
}

const escapeAttribute = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
