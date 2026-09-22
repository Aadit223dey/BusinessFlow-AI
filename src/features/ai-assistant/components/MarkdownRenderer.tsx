"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Terminal } from "lucide-react";

/**
 * MarkdownRenderer
 *
 * Professional assistant Markdown renderer:
 * - High-contrast syntax code blocks with persistent header, language badge, and copy button
 * - Responsive zebra-styled tables
 * - Elegant blockquotes and inline code pills
 * - Crisp typography and formatting
 */

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming = false }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        children={content}
        components={{
          // ── Headings ────────────────────────────────────────────────
          h1({ children }) {
            return (
              <h1 className="text-lg font-bold tracking-tight text-foreground mt-4 mb-2 pb-1 border-b border-border/40">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-base font-semibold tracking-tight text-foreground mt-3 mb-1.5">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-sm font-semibold text-foreground mt-2.5 mb-1">
                {children}
              </h3>
            );
          },

          // ── Lists ───────────────────────────────────────────────────
          ul({ children }) {
            return <ul className="my-2 ml-4 list-disc space-y-1 text-sm">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-2 ml-4 list-decimal space-y-1 text-sm">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm leading-relaxed text-foreground/90">{children}</li>;
          },

          // ── Fenced Code Blocks ──────────────────────────────────────
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
              const lang = match[1];
              return (
                <div className="not-prose my-3.5 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0d1117] shadow-lg">
                  {/* Header bar */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 bg-[#161b22] px-3.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                        {lang}
                      </span>
                    </div>
                    <CopyButton code={codeString} />
                  </div>
                  {/* Code content */}
                  <pre className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed selection:bg-indigo-500/30">
                    <code className="text-slate-200">{codeString}</code>
                  </pre>
                </div>
              );
            }

            // Inline code
            return (
              <code
                className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground border border-border/50"
                {...props}
              >
                {children}
              </code>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          // ── Tables ──────────────────────────────────────────────────
          table({ children }) {
            return (
              <div className="my-3.5 overflow-x-auto rounded-xl border border-border bg-card/50 shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/70">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-border/40">{children}</tbody>;
          },
          th({ children }) {
            return (
              <th className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-foreground">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3.5 py-2 text-xs text-foreground/90 whitespace-nowrap">
                {children}
              </td>
            );
          },

          // ── Links ───────────────────────────────────────────────────
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
              >
                {children}
              </a>
            );
          },

          // ── Block quotes ────────────────────────────────────────────
          blockquote({ children }) {
            return (
              <blockquote className="my-2.5 rounded-r-xl border-l-4 border-primary bg-primary/5 px-4 py-2 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
        }}
      />

      {/* Streaming blinking cursor */}
      {isStreaming && (
        <span className="inline-block h-3.5 w-1.5 ml-0.5 align-middle bg-primary animate-pulse" />
      )}
    </div>
  );
}
