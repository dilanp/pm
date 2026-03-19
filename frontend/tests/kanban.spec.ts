import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  let boardState = {
    id: 1,
    title: "Kanban Studio",
    columns: [
      {
        id: 1,
        title: "Backlog",
        position: 0,
        cards: [
          {
            id: 11,
            title: "Align roadmap themes",
            details: "Draft quarterly themes with impact statements and metrics.",
            position: 0,
          },
        ],
      },
      {
        id: 2,
        title: "Discovery",
        position: 1,
        cards: [
          {
            id: 21,
            title: "Prototype analytics view",
            details: "Sketch initial dashboard layout and key drill-downs.",
            position: 0,
          },
        ],
      },
      { id: 3, title: "In Progress", position: 2, cards: [] },
      { id: 4, title: "Review", position: 3, cards: [] },
      { id: 5, title: "Done", position: 4, cards: [] },
    ],
  };

  const buildBoardFromUpdate = (payload: any) => {
    return {
      id: 1,
      title: payload.board.title,
      columns: payload.board.columns.map((column: any, columnIndex: number) => ({
        id: columnIndex + 1,
        title: column.title,
        position: column.position ?? columnIndex,
        cards: column.cards.map((card: any, cardIndex: number) => ({
          id: (columnIndex + 1) * 100 + cardIndex + 1,
          title: card.title,
          details: card.details,
          position: card.position ?? cardIndex,
        })),
      })),
    };
  };

  await page.route("**/api/board", async (route) => {
    const request = route.request();
    if (request.method() === "PUT") {
      const payload = JSON.parse(request.postData() ?? "{}");
      boardState = buildBoardFromUpdate(payload);
      await route.fulfill({ json: { board: boardState } });
      return;
    }
    await route.fulfill({ json: { board: boardState } });
  });
});

const login = async (page: Page) => {
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();
};

test("loads the kanban board", async ({ page }) => {
  await page.goto("/");
  await login(page);
  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  await expect(page.locator('[data-testid^="column-"]')).toHaveCount(5);
});

test("adds a card to a column", async ({ page }) => {
  await page.goto("/");
  await login(page);
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  await firstColumn.getByRole("button", { name: /add a card/i }).click();
  await firstColumn.getByPlaceholder("Card title").fill("Playwright card");
  await firstColumn.getByPlaceholder("Details").fill("Added via e2e.");
  await firstColumn.getByRole("button", { name: /add card/i }).click();
  await expect(firstColumn.getByText("Playwright card")).toBeVisible();
});

test("moves a card between columns", async ({ page }) => {
  await page.goto("/");
  await login(page);
  const card = page.getByTestId("card-card-11");
  const targetColumn = page.getByTestId("column-col-4");
  await card.scrollIntoViewIfNeeded();
  await targetColumn.scrollIntoViewIfNeeded();
  const cardBox = await card.boundingBox();
  const columnBox = await targetColumn.boundingBox();
  if (!cardBox || !columnBox) {
    throw new Error("Unable to resolve drag coordinates.");
  }

  await page.mouse.move(
    cardBox.x + cardBox.width / 2,
    cardBox.y + cardBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    columnBox.x + columnBox.width / 2,
    columnBox.y + columnBox.height / 2,
    { steps: 12 }
  );
  await page.mouse.up();
  await expect(targetColumn.getByText("Align roadmap themes")).toBeVisible();
});

test("rejects invalid credentials", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Username").fill("wrong");
  await page.getByLabel("Password").fill("creds");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});

test("logs out back to login screen", async ({ page }) => {
  await page.goto("/");
  await login(page);
  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});
