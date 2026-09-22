"use client";

import {
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { Send, Square, Sparkles } from "lucide-react";

/**
 * ChatInput
 *
 * Professional conversational input bar with:
 * - Auto-growing textarea
 * - Quick prompt modifier pills (Summarize, Simplify, Key takeaways, Code)
 * - Enter-to-send / Shift+Enter newline
 * - Animated Send vs Stop state toggle
 * - Keyboard shortcut hint
 */

const promptModifiers = [
  { label: "⚡ Summarize", text: "Please provide a concise summary of this: " },
  { label: "💡 Explain simply", text: "Explain this in simple, clear terms: " },
  { label: "🎯 Key action items", text: "What are the most important actionable steps for: " },
  { label: "🔍 In-depth analysis", text: "Provide a detailed step-by-step analysis of: " },
];

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      adjustHeight();
    },
    [onChange, adjustHeight]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isLoading) {
          onSend();
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        }
      }
    },
    [value, isLoading, onSend]
  );

  const applyModifier = useCallback(
    (prefix: string) => {
      if (textareaRef.current) {
        const nextVal = value ? `${prefix}${value}` : prefix;
        onChange(nextVal);
        textareaRef.current.focus();
        setTimeout(adjustHeight, 0);
      }
    },
    [value, onChange, adjustHeight]
  );

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="border-t border-border/50 bg-card/75 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto max-w-3xl space-y-2">
        {/* ── Quick Modifier Pills ────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-muted-foreground scrollbar-none">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mr-1 shrink-0">
            <Sparkles className="h-3 w-3 text-primary" />
            Quick:
          </span>
          {promptModifiers.map((mod) => (
            <button
              key={mod.label}
              type="button"
              onClick={() => applyModifier(mod.text)}
              disabled={isLoading || disabled}
              className="shrink-0 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 font-medium transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-95 disabled:opacity-40"
            >
              {mod.label}
            </button>
          ))}
        </div>

        {/* ── Textarea Dock ───────────────────────────────────────────────── */}
        <div className="flex items-end gap-2.5">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or request guidance… (Enter to send)"
              rows={1}
              disabled={disabled}
              className="w-full resize-none rounded-xl border border-border/60 bg-background px-4 py-3 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all max-h-32 shadow-inner"
            />
          </div>

          {/* Send / Stop Button */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-sm transition-all hover:bg-destructive-dark hover:shadow-md active:scale-95 animate-pulse"
              aria-label="Stop generation"
              title="Stop generating"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!canSend}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              aria-label="Send message"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Subtitle Shortcut Hint ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground/60">
          <span>Press <kbd className="font-mono font-semibold text-foreground/70">Enter</kbd> to send, <kbd className="font-mono font-semibold text-foreground/70">Shift + Enter</kbd> for newline</span>
          <span className="font-mono">Gemini 3.5 Flash Lite</span>
        </div>
      </div>
    </div>
  );
}
