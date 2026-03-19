"use client";

import { useMemo, useState, type FormEvent } from "react";
import clsx from "clsx";
import type { BoardData } from "@/lib/kanban";
import { sendAiChat, type AiChatMessage } from "@/lib/aiApi";

const initialMessages: AiChatMessage[] = [
  {
    role: "assistant",
    content: "Ask me to update the board, move cards, or summarize progress.",
  },
];

type AIChatSidebarProps = {
  board: BoardData;
  onBoardUpdate: (board: BoardData) => void;
};

export const AIChatSidebar = ({ board, onBoardUpdate }: AIChatSidebarProps) => {
  const [messages, setMessages] = useState<AiChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isSending) {
      return;
    }

    setInput("");
    setError(null);
    setUpdateNote(null);
    const history = messages;
    const nextMessages: AiChatMessage[] = [
      ...messages,
      { role: "user", content: prompt },
    ];
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await sendAiChat(board, prompt, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
      if (response.board) {
        onBoardUpdate(response.board);
        setUpdateNote("Board updated");
      }
    } catch {
      setError("Unable to reach the AI service. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);

  return (
    <aside className="rounded-[32px] border border-[var(--stroke)] bg-white/80 p-6 shadow-[var(--shadow)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
            AI Copilot
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--navy-dark)]">
            Board updates
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--gray-text)]">
            Describe changes and get instant updates applied to your Kanban.
          </p>
        </div>
        <div className="rounded-full border border-[var(--stroke)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary-blue)]">
          Live
        </div>
      </div>

      <div className="mt-6 flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-2">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={clsx(
              "rounded-2xl px-4 py-3 text-sm leading-6",
              message.role === "assistant"
                ? "bg-[var(--surface)] text-[var(--navy-dark)]"
                : "bg-[rgba(117,57,145,0.12)] text-[var(--navy-dark)]"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
              {message.role === "assistant" ? "Assistant" : "You"}
            </p>
            <p className="mt-2">{message.content}</p>
          </div>
        ))}
        {isSending ? (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
            Thinking...
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
          Your request
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={4}
          placeholder="Move the top backlog card to In Progress and rename the board."
          className="resize-none rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm text-[var(--navy-dark)] outline-none"
        />
        {error ? (
          <p className="text-sm text-[var(--secondary-purple)]">{error}</p>
        ) : null}
        {updateNote ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--primary-blue)]">
            {updateNote}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSending || input.trim().length === 0}
          className="rounded-full bg-[var(--secondary-purple)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>

      {lastMessage?.role === "assistant" ? (
        <p className="mt-4 text-xs text-[var(--gray-text)]">
          Latest: {lastMessage.content}
        </p>
      ) : null}
    </aside>
  );
};
