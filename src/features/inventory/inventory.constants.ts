export const CATEGORY_OPTIONS = [
  { value: "רספאי", label: "רספאי" },
  { value: "קבלר_קרביות", label: "קבלר קרביות" },
  { value: "ציוד_אישי", label: "ציוד אישי" },
  { value: "אנרגיה", label: "אנרגיה" },
  { value: "תקשורת", label: "תקשורת" },
  { value: "כללי", label: "כללי" },
]

export const UNIT_OPTIONS = [
  { value: "יחידה", label: "יחידה" },
  { value: "זוג", label: "זוג" },
  { value: "קופסה", label: "קופסה" },
  { value: "ערכה", label: "ערכה" },
  { value: "סט", label: "סט" },
]

export const CATEGORY_VALUES = CATEGORY_OPTIONS.map((option) => option.value)

export const getCategoryLabel = (value: string): string => {
  const match = CATEGORY_OPTIONS.find((option) => option.value === value)
  if (match) return match.label
  return value.replace(/_/g, " ")
}
