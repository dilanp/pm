import type { BoardData, Card, Column } from "@/lib/kanban";

export type ApiCard = {
  id: number;
  title: string;
  details: string;
  position: number;
};

export type ApiColumn = {
  id: number;
  title: string;
  position: number;
  cards: ApiCard[];
};

export type ApiBoard = {
  id: number;
  title: string;
  columns: ApiColumn[];
};

export type ApiBoardEnvelope = {
  board: ApiBoard;
};

export type ApiBoardUpdate = {
  board: {
    title: string;
    columns: Array<{
      title: string;
      position: number;
      cards: Array<{
        title: string;
        details: string;
        position: number;
      }>;
    }>;
  };
};

// Set NEXT_PUBLIC_API_BASE_URL when running frontend dev server against Docker backend
// e.g., NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const DEMO_AUTH = "user:password";

const encodeBasicAuth = (value: string): string => {
  if (typeof btoa === "function") {
    return btoa(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf-8").toString("base64");
  }
  return value;
};

export const getAuthHeaders = (): Record<string, string> => ({
  Authorization: `Basic ${encodeBasicAuth(DEMO_AUTH)}`,
});

const columnId = (id: number) => `col-${id}`;
const cardId = (id: number) => `card-${id}`;

export const toBoardData = (payload: ApiBoardEnvelope): BoardData => {
  const columns: Column[] = payload.board.columns
    .sort((a, b) => a.position - b.position)
    .map((column) => ({
      id: columnId(column.id),
      title: column.title,
      cardIds: column.cards
        .sort((a, b) => a.position - b.position)
        .map((card) => cardId(card.id)),
    }));

  const cards: Record<string, Card> = payload.board.columns
    .flatMap((column) => column.cards)
    .reduce<Record<string, Card>>((acc, card) => {
      acc[cardId(card.id)] = {
        id: cardId(card.id),
        title: card.title,
        details: card.details,
      };
      return acc;
    }, {});

  return {
    title: payload.board.title,
    columns,
    cards,
  };
};

export const toApiUpdate = (board: BoardData): ApiBoardUpdate => {
  return {
    board: {
      title: board.title,
      columns: board.columns.map((column, columnIndex) => ({
        title: column.title,
        position: columnIndex,
        cards: column.cardIds.map((id, cardIndex) => ({
          title: board.cards[id].title,
          details: board.cards[id].details,
          position: cardIndex,
        })),
      })),
    },
  };
};
