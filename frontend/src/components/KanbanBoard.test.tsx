import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

const buildApiBoard = () => ({
  board: {
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
          {
            id: 12,
            title: "Gather customer signals",
            details: "Review support tags, sales notes, and churn feedback.",
            position: 1,
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
  },
});

const buildApiFromUpdate = (payload: any) => {
  const board = payload.board;
  return {
    board: {
      id: 1,
      title: board.title,
      columns: board.columns.map((column: any, columnIndex: number) => ({
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
    },
  };
};

const createResponse = (data: any) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);

beforeEach(() => {
  let boardState = buildApiBoard();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_input, init) => {
      if (init?.method === "PUT") {
        const payload = init?.body ? JSON.parse(init.body as string) : {};
        boardState = buildApiFromUpdate(payload);
        return createResponse(boardState);
      }
      return createResponse(boardState);
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KanbanBoard", () => {
  it("renders five columns", async () => {
    render(<KanbanBoard />);
    expect(await screen.findAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    render(<KanbanBoard />);
    await screen.findAllByTestId(/column-/i);
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
  });

  it("adds and removes a card", async () => {
    render(<KanbanBoard />);
    await screen.findAllByTestId(/column-/i);
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    expect(within(column).getByText("New card")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("New card")).not.toBeInTheDocument();
  });
});
