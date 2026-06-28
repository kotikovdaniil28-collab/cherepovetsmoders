import { expect, test } from "@playwright/test";

test("opens the learning app landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учебная платформа/i })).toBeVisible();
});

test("opens roadmap", async ({ page }) => {
  await page.goto("/roadmap");
  await expect(page.getByRole("heading", { name: /Frontend Developer/i })).toBeVisible();
});

test("opens an interactive challenge", async ({ page }) => {
  await page.goto("/learn/start/web-developer-role");
  await expect(page.getByRole("heading", { name: /Создай первый смысловой блок/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Run tests/i })).toBeVisible();
});

test("opens auth pages", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();

  await page.goto("/sign-up");
  await expect(page.getByRole("heading", { name: "Регистрация" })).toBeVisible();
});

test("opens auto checks page", async ({ page }) => {
  await page.goto("/checks");
  await expect(page.getByRole("heading", { name: /Автопроверки проектов/i })).toBeVisible();
});

test("opens today plan", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: /Что делать сегодня/i })).toBeVisible();
});
