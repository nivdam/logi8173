import { test, expect } from "@playwright/test"
import { seedAuth } from "./auth.setup"

test.beforeEach(async ({ page }) => {
  await seedAuth(page)
  await page.goto("/settings")
  await page.getByRole("heading", { name: "הגדרות" }).waitFor()
})

test.describe("Settings page — layout", () => {
  test("renders operators and companies sections", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "מפעילים" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "פלוגות" })).toBeVisible()
  })

  test("shows the mock admin operator", async ({ page }) => {
    const main = page.getByRole("main")
    await expect(main.getByText("Dev User")).toBeVisible()
    await expect(main.getByText("dev@mock.local")).toBeVisible()
  })
})

test.describe("Operators — add", () => {
  test("can add a new operator via dialog", async ({ page }) => {
    await page.getByRole("button", { name: "הוסף מפעיל" }).click()

    const dialog = page.getByRole("dialog", { name: "הוספת מפעיל" })
    await expect(dialog).toBeVisible()

    await dialog.getByLabel("אימייל חשבון Google").fill("new@test.com")
    await dialog.getByLabel("שם מלא").fill("Test Operator")
    await dialog.getByRole("button", { name: "שמור" }).click()

    await expect(dialog).not.toBeVisible()
    await expect(page.getByText("Test Operator")).toBeVisible()
    await expect(page.getByText("new@test.com")).toBeVisible()
  })
})

test.describe("Operators — edit", () => {
  test("can edit an existing operator", async ({ page }) => {
    // Add an operator first
    await page.getByRole("button", { name: "הוסף מפעיל" }).click()
    const addDialog = page.getByRole("dialog", { name: "הוספת מפעיל" })
    await addDialog.getByLabel("אימייל חשבון Google").fill("edit@test.com")
    await addDialog.getByLabel("שם מלא").fill("Before Edit")
    await addDialog.getByRole("button", { name: "שמור" }).click()
    await expect(addDialog).not.toBeVisible()

    // Find the row and click edit
    const operatorRow = page.locator("text=edit@test.com").locator("..")
    await operatorRow.locator("..").getByRole("button", { name: "ערוך" }).click()

    const editDialog = page.getByRole("dialog", { name: "עריכת מפעיל" })
    await expect(editDialog).toBeVisible()
    await editDialog.getByLabel("שם מלא").clear()
    await editDialog.getByLabel("שם מלא").fill("After Edit")
    await editDialog.getByRole("button", { name: "שמור" }).click()

    await expect(editDialog).not.toBeVisible()
    await expect(page.getByText("After Edit")).toBeVisible()
  })
})

test.describe("Operators — delete", () => {
  test("shows confirmation dialog before deleting", async ({ page }) => {
    // Add an operator to delete
    await page.getByRole("button", { name: "הוסף מפעיל" }).click()
    const addDialog = page.getByRole("dialog", { name: "הוספת מפעיל" })
    await addDialog.getByLabel("אימייל חשבון Google").fill("delete@test.com")
    await addDialog.getByLabel("שם מלא").fill("To Delete")
    await addDialog.getByRole("button", { name: "שמור" }).click()
    await expect(addDialog).not.toBeVisible()

    // Click delete on the new operator
    const deleteButton = page
      .getByText("delete@test.com")
      .locator("../..")
      .getByRole("button", { name: "הסר" })
    await deleteButton.click()

    // Confirmation dialog appears
    const confirmDialog = page.getByRole("dialog", { name: "להסיר את המפעיל" })
    await expect(confirmDialog).toBeVisible()
    await expect(confirmDialog.getByText("To Delete")).toBeVisible()

    // Confirm deletion
    await confirmDialog.getByRole("button", { name: "הסר" }).click()
    await expect(confirmDialog).not.toBeVisible()
    await expect(page.getByText("delete@test.com")).not.toBeVisible()
  })

  test("can cancel deletion", async ({ page }) => {
    await page.getByRole("button", { name: "הוסף מפעיל" }).click()
    const addDialog = page.getByRole("dialog", { name: "הוספת מפעיל" })
    await addDialog.getByLabel("אימייל חשבון Google").fill("keep@test.com")
    await addDialog.getByLabel("שם מלא").fill("Keep Me")
    await addDialog.getByRole("button", { name: "שמור" }).click()
    await expect(addDialog).not.toBeVisible()

    const deleteButton = page
      .getByText("keep@test.com")
      .locator("../..")
      .getByRole("button", { name: "הסר" })
    await deleteButton.click()

    const confirmDialog = page.getByRole("dialog", { name: "להסיר את המפעיל" })
    await confirmDialog.getByRole("button", { name: "ביטול" }).click()
    await expect(confirmDialog).not.toBeVisible()

    // Operator still visible
    await expect(page.getByText("Keep Me")).toBeVisible()
  })
})

test.describe("Companies — add and toggle", () => {
  test("can add a new company", async ({ page }) => {
    await page.getByRole("button", { name: "הוסף פלוגה" }).click()

    const dialog = page.getByRole("dialog", { name: "הוספת פלוגה" })
    await expect(dialog).toBeVisible()

    await dialog.getByLabel("שם פלוגה").fill("פלוגה חדשה")
    await dialog.getByRole("button", { name: "שמור" }).click()

    await expect(dialog).not.toBeVisible()
    await expect(page.getByText("פלוגה חדשה", { exact: true })).toBeVisible()
  })

  test("can deactivate and reactivate a company", async ({ page }) => {
    // Find the first company deactivate button (aria-label "הסר")
    // The operators section also has "הסר" buttons but they are disabled (last admin) or
    // in a different section. The companies "הסר" buttons are enabled and clickable.
    // Use the last "הסר" button on the page — companies section comes after operators.
    const deactivateButtons = page.getByRole("button", { name: "הסר" })
    const lastDeactivateButton = deactivateButtons.last()
    await lastDeactivateButton.click()

    // Should now show "לא פעילה" badge
    await expect(page.getByText("לא פעילה")).toBeVisible()

    // Reactivate — the button should now be "הפעל"
    const activateButton = page.getByRole("button", { name: "הפעל" })
    await activateButton.click()
    await expect(page.getByText("לא פעילה")).not.toBeVisible()
  })
})

test.describe("Dialog — scroll lock cleanup", () => {
  test("body styles are clean after opening and closing a dialog", async ({ page }) => {
    // Open and close operator dialog
    await page.getByRole("button", { name: "הוסף מפעיל" }).click()
    await expect(page.getByRole("dialog", { name: "הוספת מפעיל" })).toBeVisible()
    await page.getByRole("button", { name: "ביטול" }).click()
    await expect(page.getByRole("dialog", { name: "הוספת מפעיל" })).not.toBeVisible()

    // Verify body is clean
    const bodyState = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      pointerEvents: document.body.style.pointerEvents,
      hasScrollLock: document.body.hasAttribute("data-scroll-lock"),
    }))

    expect(bodyState.overflow).toBe("")
    expect(bodyState.pointerEvents).toBe("")
    expect(bodyState.hasScrollLock).toBe(false)
  })

  test("body stays clean after multiple open/close cycles", async ({ page }) => {
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "הוסף מפעיל" }).click()
      await expect(page.getByRole("dialog", { name: "הוספת מפעיל" })).toBeVisible()
      await page.getByRole("button", { name: "ביטול" }).click()
      await expect(page.getByRole("dialog", { name: "הוספת מפעיל" })).not.toBeVisible()
    }

    const bodyState = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      pointerEvents: document.body.style.pointerEvents,
      hasScrollLock: document.body.hasAttribute("data-scroll-lock"),
    }))

    expect(bodyState.overflow).toBe("")
    expect(bodyState.pointerEvents).toBe("")
    expect(bodyState.hasScrollLock).toBe(false)
  })
})
