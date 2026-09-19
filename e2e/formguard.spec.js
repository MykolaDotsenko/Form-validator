import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoAccessibilityViolations(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.flatMap((node) => node.target),
  }));

  expect(
    violations,
    "Expected the rendered state to have no automated axe violations.",
  ).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("initial experience is accessible and quiet", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Helpful feedback before frustration.",
  );
  await expect(page.locator(".field-error")).toHaveText(["", "", "", ""]);
  await expectNoAccessibilityViolations(page);
});

test("touched-field validation recovers while the user corrects input", async ({
  page,
}) => {
  const username = page.getByLabel("Username");

  await username.fill("ab");
  await username.blur();

  await expect(username).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#username-error")).toHaveText(
    "Username must be at least 3 characters.",
  );

  await username.fill("mykola.dev");

  await expect(username).toHaveAttribute("aria-invalid", "false");
  await expect(page.locator("#username-error")).toBeEmpty();
});

test("invalid submit announces a summary and focuses the first invalid field", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.locator("#form-summary")).toHaveText(
    "4 fields need your attention.",
  );
  await expect(page.getByLabel("Username")).toBeFocused();
  await expectNoAccessibilityViolations(page);
});

test("password validation follows username changes", async ({ page }) => {
  await page.getByLabel("Username").fill("alice");
  await page.getByLabel("Email").fill("team@example.com");

  const password = page.getByLabel("Password", { exact: true });
  await password.fill("Alice-Secure-2026");
  await password.blur();

  await expect(page.locator("#password-error")).toHaveText(
    "Password should not contain your username.",
  );

  await password.fill("Signal-Bridge-2026");
  await expect(page.locator("#password-error")).toBeEmpty();
  await expect(password).toHaveAttribute("aria-invalid", "false");
});

test("password visibility control updates both password fields", async ({
  page,
}) => {
  const password = page.getByLabel("Password", { exact: true });
  const confirmation = page.getByLabel("Confirm password");
  const toggle = page.locator("#password-toggle");

  await expect(password).toHaveAttribute("type", "password");
  await expect(confirmation).toHaveAttribute("type", "password");

  await toggle.click();

  await expect(password).toHaveAttribute("type", "text");
  await expect(confirmation).toHaveAttribute("type", "text");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Hide passwords" }).click();

  await expect(password).toHaveAttribute("type", "password");
  await expect(confirmation).toHaveAttribute("type", "password");
});

test("valid registration reaches an accessible success state and resets cleanly", async ({
  page,
}) => {
  await page.getByLabel("Username").fill("niko.dev");
  await page.getByLabel("Email").fill("niko@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Signal-Bridge-2026");
  await page.getByLabel("Confirm password").fill("Signal-Bridge-2026");

  await page.getByRole("button", { name: "Create account" }).click();

  const success = page.locator("#success-panel");
  await expect(success).toBeVisible();
  await expect(success).toBeFocused();
  await expect(success).toContainText("niko@example.com");
  await expectNoAccessibilityViolations(page);

  await page
    .getByRole("button", { name: "Test another registration" })
    .click();

  await expect(page.getByLabel("Username")).toBeFocused();
  await expect(page.getByLabel("Username")).toHaveValue("");
  await expect(page.locator("#registration-form")).toBeVisible();
});

test("portfolio view remains presentable at the configured viewport", async ({
  page,
}, testInfo) => {
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.getByText("0", { exact: true })).toBeVisible();
  await expect(page.getByText("runtime dependencies")).toBeVisible();

  if (testInfo.project.name === "chromium-desktop") {
    await page.screenshot({
      path: testInfo.outputPath("formguard-home.png"),
      fullPage: true,
    });
  }
});
