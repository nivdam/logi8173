import { expect, test } from "@playwright/test"

test.describe("Login", () => {
  test("unauthenticated user sees login page", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole("button", { name: /google|התחבר|sign in/i }),
    ).toBeVisible()
  })

  test("login page has correct branding", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByText(/8173/)).toBeVisible()
    await expect(page.getByText(/לוגיסטיקה|logistics/i)).toBeVisible()
  })
})
