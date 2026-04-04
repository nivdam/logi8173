import type { InventoryItem } from "../types"

export const inventoryMock: InventoryItem[] = [
  { itemId: "i1", itemNumber: "5001", name: "וסט מגן", category: "רספאי", tags: ["הגנה"], unitOfMeasure: "יחידה", currentQty: 120, minThreshold: 100, status: "ok", notes: "" },
  { itemId: "i2", itemNumber: "5002", name: "קסדה קרבית", category: "רספאי", tags: ["הגנה"], unitOfMeasure: "יחידה", currentQty: 95, minThreshold: 100, status: "low", notes: "הזמנה בדרך" },
  { itemId: "i3", itemNumber: "5003", name: "מכשיר קשר מוטורולה", category: "תקשורת", tags: ["קשר", "אלקטרוניקה"], unitOfMeasure: "יחידה", currentQty: 30, minThreshold: 25, status: "ok", notes: "" },
  { itemId: "i4", itemNumber: "5004", name: "סוללות CR123", category: "אנרגיה", tags: ["אנרגיה"], unitOfMeasure: "קופסה", currentQty: 8, minThreshold: 20, status: "gap", notes: "חוסר קריטי" },
  { itemId: "i5", itemNumber: "5005", name: "פנס טקטי", category: "ציוד_אישי", tags: ["תאורה"], unitOfMeasure: "יחידה", currentQty: 60, minThreshold: 50, status: "ok", notes: "" },
  { itemId: "i6", itemNumber: "5006", name: "שק שינה", category: "ציוד_אישי", tags: ["לינה"], unitOfMeasure: "יחידה", currentQty: 200, minThreshold: 150, status: "ok", notes: "" },
  { itemId: "i7", itemNumber: "5007", name: "מטען USB נייד", category: "אנרגיה", tags: ["אנרגיה", "אלקטרוניקה"], unitOfMeasure: "יחידה", currentQty: 15, minThreshold: 20, status: "low", notes: "" },
  { itemId: "i8", itemNumber: "5008", name: "ערכת עזרה ראשונה", category: "כללי", tags: ["רפואה"], unitOfMeasure: "ערכה", currentQty: 25, minThreshold: 20, status: "ok", notes: "" },
  { itemId: "i9", itemNumber: "5009", name: "משקפת לילה", category: "רספאי", tags: ["תצפית"], unitOfMeasure: "יחידה", currentQty: 5, minThreshold: 10, status: "gap", notes: "ממתין לאישור הזמנה" },
  { itemId: "i10", itemNumber: "5010", name: "חבל גרירה 10מ'", category: "כללי", tags: ["הנדסה"], unitOfMeasure: "יחידה", currentQty: 40, minThreshold: 30, status: "ok", notes: "" },
  { itemId: "i11", itemNumber: "5011", name: "אוזניות תקשורת", category: "תקשורת", tags: ["קשר"], unitOfMeasure: "זוג", currentQty: 18, minThreshold: 20, status: "low", notes: "" },
  { itemId: "i12", itemNumber: "5012", name: "כפפות עבודה", category: "ציוד_אישי", tags: ["הגנה"], unitOfMeasure: "זוג", currentQty: 300, minThreshold: 200, status: "ok", notes: "" },
  { itemId: "i13", itemNumber: "5013", name: "גנרטור שטח 2kW", category: "אנרגיה", tags: ["אנרגיה", "הנדסה"], unitOfMeasure: "יחידה", currentQty: 3, minThreshold: 2, status: "ok", notes: "" },
  { itemId: "i14", itemNumber: "5014", name: "אנטנה ניידת", category: "תקשורת", tags: ["קשר"], unitOfMeasure: "יחידה", currentQty: 10, minThreshold: 8, status: "ok", notes: "" },
  { itemId: "i15", itemNumber: "5015", name: "קבלר קרביות מלא", category: "קבלר_קרביות", tags: ["לחימה"], unitOfMeasure: "סט", currentQty: 0, minThreshold: 50, status: "gap", notes: "לא קיים במחסן" },
  { itemId: "i16", itemNumber: "5016", name: "מים — מיכל 20 ליטר", category: "כללי", tags: ["מים", "לוגיסטיקה"], unitOfMeasure: "יחידה", currentQty: 50, minThreshold: 40, status: "ok", notes: "" },
  { itemId: "i17", itemNumber: "5017", name: "מסור חשמלי", category: "כללי", tags: ["הנדסה", "כלי עבודה"], unitOfMeasure: "יחידה", currentQty: 4, minThreshold: 3, status: "ok", notes: "" },
  { itemId: "i18", itemNumber: "5018", name: "משקפי מגן", category: "ציוד_אישי", tags: ["הגנה"], unitOfMeasure: "יחידה", currentQty: 45, minThreshold: 50, status: "low", notes: "" },
]
