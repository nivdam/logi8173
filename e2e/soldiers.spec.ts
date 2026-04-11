import { expect, test } from "@playwright/test"
import { seedAuthenticatedSession } from "./support/auth"

test.describe("Soldiers", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
    await page.goto("/soldiers")
  })

  test("shows page header and filters", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /חיילים|soldiers/i })).toBeVisible()
    await expect(page.getByPlaceholder(/חיפוש|search/i)).toBeVisible()
    await expect(page.locator("select").first()).toBeVisible()
    await expect(page.locator("select").nth(1)).toBeVisible()
  })

  test("search filters results", async ({ page }) => {
    await page.getByPlaceholder(/חיפוש|search/i).fill("xxxxnotfound")
    await expect(page.getByRole("heading", { name: /לא נמצאו תוצאות|no results/i })).toBeVisible()
  })

  test("company filter keeps platoon filter available", async ({ page }) => {
    await page.locator("select").first().selectOption({ index: 1 })
    await expect(page.locator("select").nth(1)).toBeVisible()
  })
})
