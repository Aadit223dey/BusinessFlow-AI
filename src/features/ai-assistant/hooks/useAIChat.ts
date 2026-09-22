"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/ai";

/**
 * useAIChat
 *
 * Professional-grade AI Chat client state hook managing:
 * - Session-based conversation persistence (sessionStorage)
 * - Multi-turn context payload assembly (last 10 turns)
 * - Token stream processing via ReadableStream
 * - Request cancellation via AbortController
 * - Response regeneration & retry
 * - Message feedback tracking (helpful / unhelpful)
 * - Conversation export to Markdown
 */

const MAX_CONTEXT_TURNS = 10;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface UseAIChatOptions {
  portalRole?: "BUSINESS_OWNER" | "CUSTOMER" | "STAFF" | "SUPER_ADMIN";
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { portalRole = "BUSINESS_OWNER" } = options;
  const storageKey = `businessflow_ai_chat_${portalRole.toLowerCase()}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ── 1. Restore from Session Storage ───────────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  // ── 2. Persist to Session Storage ─────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage write quota errors
    }
  }, [messages, isHydrated, storageKey]);

  // ── 3. Send Message Core ───────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content?: string, customHistory?: ChatMessage[]) => {
      const text = (content ?? input).trim();
      if (!text || isLoading) return;

      setError(null);
      setInput("");

      // Create user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      // Create placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const baseMessages = customHistory ?? messages;
      const updatedMessages = [...baseMessages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      // Assemble context payload (last N turns)
      const contextMessages = [...baseMessages, userMessage]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-MAX_CONTEXT_TURNS)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      // Create abort controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: contextMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let errorMsg = "The AI assistant is temporarily unavailable.";
          try {
            const errBody = await response.json();
            if (errBody.error) errorMsg = errBody.error;
          } catch {
            // Default error
          }
          throw new Error(errorMsg);
        }

        // Stream the response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream available.");
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: accumulated }
                : m
            )
          );
        }

        if (!accumulated.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? {
                    ...m,
                    content:
                      "I received your request, but could not generate a response. Please try again.",
                  }
                : m
            )
          );
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setMessages((prev) => {
            const last = prev.find((m) => m.id === assistantMessage.id);
            if (last && !last.content.trim()) {
              return prev.filter((m) => m.id !== assistantMessage.id);
            }
            return prev;
          });
        } else {
          const errorMsg =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.";
          setError(errorMsg);
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantMessage.id)
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [input, isLoading, messages]
  );

  // ── 4. Regenerate Last Assistant Message ────────────────────────────────────
  const regenerateLastResponse = useCallback(async () => {
    if (isLoading || messages.length === 0) return;

    // Find the last assistant message
    let lastAssistantIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        lastAssistantIdx = i;
        break;
      }
    }

    if (lastAssistantIdx === -1) return;

    // Find the preceding user message
    const precedingUserMsg = messages[lastAssistantIdx - 1];
    if (!precedingUserMsg || precedingUserMsg.role !== "user") return;

    // History before the user message
    const historyBeforeUser = messages.slice(0, lastAssistantIdx - 1);

    await sendMessage(precedingUserMsg.content, historyBeforeUser);
  }, [isLoading, messages, sendMessage]);

  // ── 5. Feedback Toggle ─────────────────────────────────────────────────────
  const setMessageFeedback = useCallback(
    (messageId: string, feedback: "helpful" | "unhelpful") => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          // Toggle off if clicking the same feedback
          const newFeedback = msg.feedback === feedback ? null : feedback;
          return { ...msg, feedback: newFeedback };
        })
      );
    },
    []
  );

  // ── 6. Export Conversation as Markdown ──────────────────────────────────────
  const exportConversation = useCallback(() => {
    if (messages.length === 0) return;

    const lines: string[] = [
      `# BusinessFlow AI — Conversation Export`,
      `**Date:** ${new Date().toLocaleString()}`,
      `**Model:** Gemini 3.5 Flash Lite`,
      `**Total Messages:** ${messages.length}`,
      `\n---\n`,
    ];

    messages.forEach((m) => {
      const sender = m.role === "user" ? "👤 You" : "✨ BusinessFlow AI";
      const time = new Date(m.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      lines.push(`### ${sender} (${time})\n\n${m.content}\n\n---\n`);
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `businessflow-ai-chat-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [messages]);

  // ── 7. Controls ────────────────────────────────────────────────────────────
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setIsLoading(false);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    setError,
    sendMessage,
    regenerateLastResponse,
    setMessageFeedback,
    exportConversation,
    stopGeneration,
    clearChat,
  };
}
