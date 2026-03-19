import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AIChatSidebar } from "@/components/AIChatSidebar";
import type { BoardData } from "@/lib/kanban";

const sampleBoard: BoardData = {
  title: "Kanban Studio",
  columns: [{ id: "col-1", title: "Todo", cardIds: ["card-1"] }],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Task A",
      details: "Details",
    },
  },
};

const createResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);

beforeEach(() => {
  if (typeof globalThis.btoa !== "function") {
    globalThis.btoa = (value: string) =>
      Buffer.from(value, "utf-8").toString("base64");
  }

  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      createResponse({
        message: "Updated the board title.",
        board: {
          id: 1,
          title: "Launch Plan",
          columns: [
            {
              id: 1,
              title: "Todo",
              position: 0,
              cards: [
                {
                  id: 11,
                  title: "Task A",
                  details: "Details",
                  position: 0,
                },
              ],
            },
          ],
        },
      })
    )
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AIChatSidebar", () => {
  it("sends a prompt and applies board updates", async () => {
    const onBoardUpdate = vi.fn();
    render(<AIChatSidebar board={sampleBoard} onBoardUpdate={onBoardUpdate} />);

    await userEvent.type(
      screen.getByPlaceholderText(/move the top backlog/i),
      "Rename the board"
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    const responses = await screen.findAllByText(/updated the board title/i);
    expect(responses.length).toBeGreaterThan(0);
    expect(onBoardUpdate).toHaveBeenCalled();
  });
});
