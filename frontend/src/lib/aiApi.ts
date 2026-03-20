import type { BoardData } from "@/lib/kanban";
import { API_BASE_URL, getAuthHeaders, toApiUpdate, toBoardData, type ApiBoard } from "@/lib/boardApi";

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiChatResponse = {
  message: string;
  board: ApiBoard | null;
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
      ...getAuthHeaders(),
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
