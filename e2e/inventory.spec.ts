import { expect, test } from "@playwright/test"
import { seedAuthenticatedSession } from "./support/auth"

test.describe("Inventory", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
    await page.goto("/inventory")
  })

  test("shows page header and controls", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /מלאי|inventory/i })).toBeVisible()
    await expect(page.getByPlaceholder(/חיפוש|search/i)).toBeVisible()
    await expect(page.locator("select").first()).toBeVisible()
    await expect(page.locator("select").nth(1)).toBeVisible()
  })

  test("search filters results", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/חיפוש|search/i)
    await searchInput.fill("xxxxnotfound")

    await expect(page.getByRole("heading", { name: /לא נמצאו תוצאות|no results/i })).toBeVisible()
  })

  test("category filter works and can be cleared", async ({ page }) => {
    await page.locator("select").first().selectOption({ index: 1 })
    await expect(page.getByText(/נקה סינון|clear filters/i)).toBeVisible()

    await page.getByText(/נקה סינון|clear filters/i).click()
    await expect(page.getByPlaceholder(/חיפוש|search/i)).toHaveValue("")
  })
})
