"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage } from "@/types/ai";

/**
 * ChatMessageItem
 *
 * Professional chat message bubble with:
 * - Differentiated user vs assistant card aesthetics
 * - Response toolbar: Copy message, Regenerate, Thumbs up / down
 * - Timestamp and word count metadata
 * - Streaming blinking cursor indicator
 */

interface ChatMessageItemProps {
  message: ChatMessage;
  isLastAssistant?: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, feedback: "helpful" | "unhelpful") => void;
}

export function ChatMessageItem({
  message,
  isLastAssistant = false,
  isStreaming = false,
  onRegenerate,
  onFeedback,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [message.content]);

  const wordCount = message.content.trim().split(/\s+/).filter(Boolean).length;
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`group flex gap-3.5 transition-all ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* ── Avatar ────────────────────────────────────────────────────────── */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          isUser
            ? "bg-gradient-to-tr from-primary to-indigo-600 text-primary-foreground shadow-sm shadow-primary/30"
            : "border border-border/60 bg-gradient-to-tr from-card to-muted text-primary shadow-sm"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* ── Content Shell ─────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col ${
          isUser ? "items-end max-w-[85%] sm:max-w-[75%]" : "items-start max-w-[92%] sm:max-w-[85%]"
        }`}
      >
        {/* Sender Label & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-semibold text-muted-foreground">
            {isUser ? "You" : "BusinessFlow Assistant"}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {formattedTime}
          </span>
          {!isUser && wordCount > 0 && (
            <span className="text-[10px] text-muted-foreground/50">
              • {wordCount} words
            </span>
          )}
        </div>

        {/* Bubble Surface */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm transition-all ${
            isUser
              ? "bg-primary text-primary-foreground shadow-primary/10"
              : "border border-border/50 bg-card/90 backdrop-blur-sm shadow-premium"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap selection:bg-white/20">
              {message.content}
            </p>
          ) : (
            <MarkdownRenderer
              content={message.content}
              isStreaming={isStreaming && isLastAssistant}
            />
          )}
        </div>

        {/* ── Assistant Response Action Toolbar ────────────────────────────── */}
        {!isUser && !isStreaming && message.content.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 px-1 text-muted-foreground">
            {/* Copy Response Button */}
            <button
              onClick={handleCopy}
              title="Copy response"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium hover:bg-muted hover:text-foreground transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>

            {/* Regenerate Button (last message only) */}
            {isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium hover:bg-muted hover:text-foreground transition-all active:scale-95"
              >
                <RotateCw className="h-3 w-3" />
                <span className="text-[10px]">Regenerate</span>
              </button>
            )}

            {/* Thumbs Up Feedback */}
            {onFeedback && (
              <>
                <button
                  onClick={() => onFeedback(message.id, "helpful")}
                  title="Good response"
                  className={`rounded-md p-1 transition-all active:scale-90 ${
                    message.feedback === "helpful"
                      ? "bg-primary/15 text-primary"
                      : "hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>

                {/* Thumbs Down Feedback */}
                <button
                  onClick={() => onFeedback(message.id, "unhelpful")}
                  title="Bad response"
                  className={`rounded-md p-1 transition-all active:scale-90 ${
                    message.feedback === "unhelpful"
                      ? "bg-destructive/15 text-destructive"
                      : "hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
