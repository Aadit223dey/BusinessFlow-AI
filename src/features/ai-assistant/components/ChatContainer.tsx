"use client";

import {
  MessageSquarePlus,
  AlertCircle,
  X,
  Download,
  Bot,
} from "lucide-react";
import { useAIChat } from "../hooks/useAIChat";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

/**
 * ChatContainer
 *
 * Professional conversational workspace:
 * - Real-time model status beacon (Gemini 3.5 Flash Lite)
 * - Markdown transcript export
 * - Session-persistent multi-turn dialogue
 * - Quick prompt chips and role-adaptive empty state
 */

interface ChatContainerProps {
  portalRole?: "BUSINESS_OWNER" | "CUSTOMER" | "STAFF" | "SUPER_ADMIN";
}

export function ChatContainer({
  portalRole = "BUSINESS_OWNER",
}: ChatContainerProps) {
  const {
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
  } = useAIChat({ portalRole });

  const hasMessages = messages.length > 0;
  const isCustomer = portalRole === "CUSTOMER";

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-premium backdrop-blur-md">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-card/60">
        {/* Title + Model Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-sm shadow-primary/25">
            <Bot className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                {isCustomer ? "Customer AI Assistant" : "BusinessFlow Assistant"}
              </h2>
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-primary">
                Live AI
              </span>
            </div>

            {/* Live Model Status Beacon */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[10px] text-foreground/80">
                Gemini 3.5 Flash Lite
              </span>
              {hasMessages && (
                <span className="text-[10px] text-muted-foreground/50">
                  • {messages.length} message{messages.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasMessages && (
            <>
              {/* Export Button */}
              <button
                onClick={exportConversation}
                title="Download transcript as Markdown"
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* New Chat Button */}
              <button
                onClick={clearChat}
                title="Clear current session"
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-95"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>New Chat</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 animate-fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="flex-1 text-xs font-medium text-destructive leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="shrink-0 rounded-md p-0.5 text-destructive/60 hover:text-destructive transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Message Area ────────────────────────────────────────────────── */}
      {hasMessages ? (
        <ChatMessageList
          messages={messages}
          isStreaming={isLoading}
          onRegenerate={regenerateLastResponse}
          onFeedback={setMessageFeedback}
        />
      ) : (
        <ChatEmptyState
          onSelectPrompt={(prompt) => sendMessage(prompt)}
          portalRole={portalRole}
        />
      )}

      {/* ── Input Dock ──────────────────────────────────────────────────── */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage()}
        onStop={stopGeneration}
        isLoading={isLoading}
      />
    </div>
  );
}
