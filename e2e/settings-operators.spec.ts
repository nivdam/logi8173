import { expect, test, type Page } from "@playwright/test"
import { seedAuthenticatedSession } from "./support/auth"

const getOperatorCard = (page: Page, text: string) =>
  page.locator('[data-testid="operator-card"]').filter({ hasText: text }).first()

const getCompanyCard = (page: Page, text: string) =>
  page.locator('[data-testid="company-card"]').filter({ hasText: text }).first()

test.describe("Settings — Operators", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
    await page.goto("/settings")
  })

  test("shows operators list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /מפעילים|operators/i })).toBeVisible()
    await expect(getOperatorCard(page, "dev@mock.local")).toBeVisible()
  })

  test("add operator", async ({ page }) => {
    await page.getByRole("button", { name: /הוסף מפעיל|add operator/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/אימייל|email/i).fill("test@example.com")
    await dialog.getByLabel(/שם מלא|full name/i).fill("מפעיל בדיקה")
    await dialog.locator("select").selectOption("warehouse_operator")
    await dialog.getByRole("button", { name: /שמור|save/i }).click()

    await expect(getOperatorCard(page, "test@example.com")).toBeVisible()
    await expect(getOperatorCard(page, "מפעיל בדיקה")).toBeVisible()
  })

  test("edit operator role", async ({ page }) => {
    const operatorCard = getOperatorCard(page, "dev@mock.local")
    await operatorCard.getByRole("button", { name: /ערוך|edit/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    await dialog.locator("select").selectOption("viewer")
    await dialog.getByRole("button", { name: /שמור|save/i }).click()

    await expect(operatorCard).toContainText(/צופה|viewer/i)
  })

  test("remove newly added operator", async ({ page }) => {
    await page.getByRole("button", { name: /הוסף מפעיל|add operator/i }).click()

    const dialog = page.getByRole("dialog")
    await dialog.getByLabel(/אימייל|email/i).fill("remove.me@example.com")
    await dialog.getByLabel(/שם מלא|full name/i).fill("למחיקה")
    await dialog.locator("select").selectOption("viewer")
    await dialog.getByRole("button", { name: /שמור|save/i }).click()

    const operatorCard = getOperatorCard(page, "remove.me@example.com")
    await expect(operatorCard).toBeVisible()

    await operatorCard.getByRole("button", { name: /הסר|delete/i }).click()

    const confirmDialog = page.getByRole("dialog")
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole("button", { name: /הסר|delete/i }).click()

    await expect(getOperatorCard(page, "remove.me@example.com")).toHaveCount(0)
  })
})

test.describe("Settings — Companies", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedSession(page)
    await page.goto("/settings")
  })

  test("shows companies list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /פלוגות|companies/i })).toBeVisible()
    await expect(getCompanyCard(page, "פלוגה א'")).toBeVisible()
  })

  test("add company", async ({ page }) => {
    await page.getByRole("button", { name: /הוסף פלוגה|add company/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/שם|name/i).fill("פלוגת בדיקה")
    await dialog.getByRole("button", { name: /שמור|save/i }).click()

    await expect(getCompanyCard(page, "פלוגת בדיקה")).toBeVisible()
  })

  test("edit company", async ({ page }) => {
    const companyCard = getCompanyCard(page, "פלוגה ב'")
    await companyCard.getByRole("button", { name: /ערוך|edit/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/שם|name/i).fill("פלוגה ב מעודכן")
    await dialog.getByRole("button", { name: /שמור|save/i }).click()

    await expect(getCompanyCard(page, "פלוגה ב מעודכן")).toBeVisible()
  })

  test("deactivate company", async ({ page }) => {
    const companyCard = getCompanyCard(page, "פלוגה ג'")
    await companyCard.getByRole("button", { name: /הסר|delete/i }).click()

    await expect(companyCard).toContainText(/לא פעילה|inactive/i)
  })
})
