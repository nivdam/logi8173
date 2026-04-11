import { expect, test } from "@playwright/test"
import { seedAuthenticatedSession } from "./support/auth"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
    await page.goto("/")
  })

  test("shows stat cards", async ({ page }) => {
    await expect(page.getByText(/^סה"כ פריטים$|^Total Items$/i)).toBeVisible()
    await expect(page.getByText(/^מלאי נמוך$|^Low Stock$/i)).toBeVisible()
    await expect(page.getByText(/^חוסרים$|^Gaps$/i)).toBeVisible()
    await expect(page.getByText(/^פעילויות פעילות$|^Active Activities$/i)).toBeVisible()
  })

  test("shows summary sections", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /טרנזקציות אחרונות|recent transactions/i })).toBeVisible()
    await expect(page.getByRole("heading", { name: /פעילויות|activities/i })).toBeVisible()
    await expect(page.getByRole("heading", { name: /הנפקות לפי פלוגה|issuance by company/i })).toBeVisible()
  })
})
