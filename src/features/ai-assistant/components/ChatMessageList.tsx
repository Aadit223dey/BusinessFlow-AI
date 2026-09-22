"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import type { ChatMessage } from "@/types/ai";
import { ChatMessageItem } from "./ChatMessageItem";

/**
 * ChatMessageList
 *
 * Auto-scrolling message container with:
 * - Smart scroll-pause detection when user is reading past messages
 * - Floating "Jump to bottom" button when user scrolls up
 * - Streaming thinking indicator with animated pulse dots
 */

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, feedback: "helpful" | "unhelpful") => void;
}

export function ChatMessageList({
  messages,
  isStreaming,
  onRegenerate,
  onFeedback,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Identify index of the last assistant message
  const lastAssistantIndex = messages.reduce((acc, m, idx) => {
    return m.role === "assistant" ? idx : acc;
  }, -1);

  // Detect manual scroll-up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setUserScrolledUp(distanceFromBottom > 100);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolledUp(false);
  }, []);

  // Auto-scroll to bottom when new messages arrive (unless user scrolled up)
  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolledUp]);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        {messages.map((message, idx) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            isLastAssistant={idx === lastAssistantIndex}
            isStreaming={isStreaming && idx === lastAssistantIndex}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
          />
        ))}

        {/* Streaming Thinking Indicator */}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11 animate-fade-in">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft [animation-delay:0.4s]" />
            </span>
            <span>Gemini is thinking…</span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Floating Jump-to-Bottom Pill */}
      {userScrolledUp && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 flex items-center gap-1.5 rounded-full border border-border/70 bg-card/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-muted hover:scale-105 active:scale-95 animate-scale-in"
        >
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
          <span>Latest messages</span>
        </button>
      )}
    </div>
  );
}
