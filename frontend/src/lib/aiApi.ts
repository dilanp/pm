import type { BoardData } from "@/lib/kanban";
import { API_BASE_URL, toApiUpdate, toBoardData, type ApiBoard } from "@/lib/boardApi";

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatResponse = {
  message: string;
  board: ApiBoard | null;
};

const DEMO_AUTH = "user:password";

const encodeBasicAuth = (value: string) => {
  if (typeof btoa === "function") {
    return btoa(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf-8").toString("base64");
  }
  return value;
};

export const sendAiChat = async (
  board: BoardData,
  prompt: string,
  history: AiChatMessage[]
): Promise<{ message: string; board: BoardData | null }> => {
  const payload = {
    prompt,
    board: toApiUpdate(board).board,
    history,
  };

  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodeBasicAuth(DEMO_AUTH)}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to reach the AI service");
  }

  const data = (await response.json()) as AiChatResponse;

  return {
    message: data.message,
    board: data.board ? toBoardData({ board: data.board }) : null,
  };
};
