import { expect, test } from "@playwright/test";

test("Coffee School opens first and all primary destinations are interactive", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const externalRequests: string[] = [];
  page.on("request", (r) => {
    if (
      /^https?:/.test(r.url()) &&
      !r.url().startsWith("http://127.0.0.1:4173")
    )
      externalRequests.push(r.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Coffee School", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Washed vs natural?", exact: true })
    .click();
  await expect(
    page.getByText("Start with the bag, then your observations", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("SAMPLE LESSON · NOT A RESEARCH ANSWER"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Take it to Brew Lab" }).click();
  await expect(
    page.getByRole("heading", { name: "Brew Lab", exact: true }),
  ).toBeVisible();
  await page.getByText("Roast Lab", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Roast Lab", exact: true }),
  ).toBeVisible();
  await page.getByText("Lab Journal", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Lab Journal", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Settings & equipment", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test("brew plan captures inputs and saves notes and named timer markers", async ({
  page,
}) => {
  await page.goto("/brew");
  await page
    .getByLabel("Coffee name", { exact: true })
    .fill("Test morning coffee");
  await page.getByRole("button", { name: "Create sample brew plan" }).click();
  await page
    .getByLabel("Coffee name", { exact: true })
    .fill("Changed after generation");
  await page.getByRole("button", { name: "Start timer", exact: true }).click();
  await page.getByLabel("Marker name", { exact: true }).fill("First pour");
  await page.getByRole("button", { name: "Add marker", exact: true }).click();
  await page
    .getByLabel("Session notes", { exact: true })
    .fill("Sweet peach finish");
  await page
    .getByRole("button", { name: "Save to Lab Journal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View saved sessions", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Brew Lab", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Search sessions", { exact: true })
    .fill("Test morning");
  await expect(
    page
      .getByText("Sweet peach finish", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open session", exact: true }).click();
  await expect(
    page.getByText("First pour", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Test morning coffee", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Changed after generation", { exact: true })
      .filter({ visible: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Edit session notes", { exact: true })
    .fill("Updated tasting note");
  await page.getByRole("button", { name: "Save notes", exact: true }).click();
  await expect(
    page.getByText("Notes saved for this preview session."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expect(
    page
      .getByText("Updated tasting note", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
});

test("equipment management rejects duplicates and makes custom gear selectable", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Your equipment", exact: true })
    .click();
  await page.getByLabel("Equipment name", { exact: true }).fill("Chemex");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await expect(
    page.getByText("That equipment is already in your collection."),
  ).toBeVisible();
  await page.getByLabel("Equipment name", { exact: true }).fill("My V60");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Favorite My V60", exact: true })
    .click();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await page.getByText("Brew Lab", { exact: true }).click();
  await page.getByRole("button", { name: "My V60", exact: true }).click();
  await page
    .getByRole("button", { name: "Create sample brew plan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Guji morning cup · My V60",
      exact: true,
    }),
  ).toBeVisible();
});

test("journal search, favorites and empty states work", async ({ page }) => {
  await page.goto("/journal");
  await page.getByRole("button", { name: "Roasts", exact: true }).click();
  await expect(
    page.getByText("A slower Sunday cup", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Huila observation session", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Favorites", exact: true }).click();
  await expect(
    page.getByText("A slower Sunday cup", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Search sessions", { exact: true })
    .fill("No matching coffee");
  await expect(
    page.getByText("No matching experiments yet", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(
    page.getByText("2 sessions · Preview data stays in memory"),
  ).toBeVisible();
});

test("roast prototype withholds machine settings and saves an observation", async ({
  page,
}) => {
  await page.goto("/roast");
  await page
    .getByRole("button", { name: "Create observation plan", exact: true })
    .click();
  await expect(
    page.getByText(
      /This prototype supplies no button, power, or temperature instructions/,
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mark first crack", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save to Lab Journal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View saved sessions", exact: true })
    .click();
  await expect(
    page.getByText("3 sessions · Preview data stays in memory"),
  ).toBeVisible();
});

test("phone screenshots cover all screens without horizontal overflow", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/brew", "/journal", "/roast", "/settings"]) {
    await page.goto(route);
    await expect(
      page.getByRole("button", {
        name: route === "/settings" ? "Go back" : "Open settings",
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, `Horizontal overflow at ${route}`).toBe(false);
    const path = testInfo.outputPath(
      `${route.replaceAll("/", "") || "school"}.png`,
    );
    await page.screenshot({ path, fullPage: true, animations: "disabled" });
    await testInfo.attach(`Screenshot ${route}`, {
      path,
      contentType: "image/png",
    });
  }
});
