import { expect, test } from "@playwright/test"
import { seedAuthenticatedSession } from "./support/auth"

test.describe("Activities", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
    await page.goto("/activities")
  })

  test("shows page header and actions", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /פעילויות|activities/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /פתח פעילות|open activity/i })).toBeVisible()
  })

  test("open activity dialog and cancel", async ({ page }) => {
    await page.getByRole("button", { name: /פתח פעילות|open activity/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/שם פעילות|activity name/i).fill("פעילות בדיקה")
    await dialog.getByRole("button", { name: /ביטול|cancel/i }).click()

    await expect(dialog).not.toBeVisible()
  })

  test("opens activity detail from a card", async ({ page }) => {
    const firstActivityCard = page.locator('[data-testid="activity-card"]').first()
    await expect(firstActivityCard).toBeVisible()

    await firstActivityCard.click()

    await expect(page.getByText(/חזרה לרשימת פעילויות|back to activities/i)).toBeVisible()
    await expect(page.getByText(/^סוג פעילות$|^Activity type$/i)).toBeVisible()
    await expect(page.getByText(/^סטטוס$|^Status$/i).first()).toBeVisible()
  })
})
