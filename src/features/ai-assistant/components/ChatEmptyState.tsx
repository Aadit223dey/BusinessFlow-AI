"use client";

import { useState } from "react";
import { Sparkles, Briefcase, Code, Lightbulb, PenTool, Calendar, HelpCircle, ShoppingBag } from "lucide-react";

/**
 * ChatEmptyState
 *
 * Professional Welcome Canvas with:
 * - Role-adaptive suggestion categories (Business Owner vs Customer)
 * - Category tabs (Strategy, Code, Marketing, Operations / Booking, Orders, Support)
 * - Interactive suggestion cards with hover micro-interactions
 */

interface PromptCategory {
  id: string;
  label: string;
  icon: typeof Sparkles;
  prompts: string[];
}

const businessCategories: PromptCategory[] = [
  {
    id: "strategy",
    label: "Strategy & Growth",
    icon: Briefcase,
    prompts: [
      "What are 5 high-impact customer retention strategies for local service businesses?",
      "How do I structure tiered service packages to maximize average order value?",
      "Draft a 30-day marketing plan to launch a new premium consultation service.",
      "Calculate optimal pricing margins for staff hourly rates versus fixed packages.",
    ],
  },
  {
    id: "tech",
    label: "Code & Automation",
    icon: Code,
    prompts: [
      "Write a Python script to parse customer feedback CSVs and score sentiment.",
      "Create a TypeScript function to calculate appointment slot availability with buffer times.",
      "Draft a Supabase database trigger to log audit records on invoice status changes.",
      "Explain how to implement webhook signature verification in Node.js.",
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Copy",
    icon: PenTool,
    prompts: [
      "Draft an engaging re-engagement email for customers inactive for over 90 days.",
      "Write 3 compelling Google Ad headlines and descriptions for our appointment booking.",
      "Create a professional post-appointment review request SMS template.",
      "Compose an announcement introducing our extended weekend operating hours.",
    ],
  },
  {
    id: "ideas",
    label: "Fast Ideation",
    icon: Lightbulb,
    prompts: [
      "Explain quantum computing in simple terms for a non-technical audience.",
      "What are 5 innovative automation tools every modern small business should use?",
      "Give me a checklist for conducting effective weekly team standups.",
      "What are key metrics to track when evaluating business employee utilization?",
    ],
  },
];

const customerCategories: PromptCategory[] = [
  {
    id: "booking",
    label: "Booking & Services",
    icon: Calendar,
    prompts: [
      "What is the best way to reschedule or cancel an existing appointment?",
      "How do I select the right service tier for my company's specific needs?",
      "Can you explain what is typically included in a business consultation session?",
      "What details should I prepare before our scheduled service kickoff?",
    ],
  },
  {
    id: "orders",
    label: "Orders & Invoices",
    icon: ShoppingBag,
    prompts: [
      "How do I view and download past payment receipts or tax invoices?",
      "What payment methods are supported for recurring service subscriptions?",
      "How does invoice milestone billing work for multi-phase projects?",
      "Can you explain how refund or cancellation policies apply to prepaid orders?",
    ],
  },
  {
    id: "support",
    label: "Support & Help",
    icon: HelpCircle,
    prompts: [
      "How do I submit an inquiry or support ticket through the Customer Desk?",
      "What are the typical response times for urgent service requests?",
      "How do I invite team members to access our shared customer portal?",
      "Where can I update my organization profile and billing notification email?",
    ],
  },
  {
    id: "general",
    label: "General & Creative",
    icon: Sparkles,
    prompts: [
      "Draft a concise summary of our project goals to share with our service team.",
      "Help me write a professional project brief describing our requirements.",
      "Explain cloud security best practices for collaborative customer portals.",
      "What are key questions to ask our service specialist during our upcoming call?",
    ],
  },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  portalRole?: "BUSINESS_OWNER" | "CUSTOMER" | "STAFF" | "SUPER_ADMIN";
}

export function ChatEmptyState({
  onSelectPrompt,
  portalRole = "BUSINESS_OWNER",
}: ChatEmptyStateProps) {
  const isCustomer = portalRole === "CUSTOMER";
  const categories = isCustomer ? customerCategories : businessCategories;
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14 animate-fade-in">
      {/* ── Hero Branding ────────────────────────────────────────────────── */}
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-brand-electric shadow-lg shadow-primary/25">
        <Sparkles className="h-7 w-7 text-white" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-center">
        {isCustomer
          ? "Customer Service AI Assistant"
          : "BusinessFlow AI Partner"}
      </h1>
      <p className="mt-1.5 mb-6 max-w-md text-center text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {isCustomer
          ? "Ask questions about your services, appointments, billing, or get intelligent assistance anytime."
          : "Your general-purpose AI partner powered by Gemini 3.5 Flash Lite for ideation, strategy, code, and daily problem solving."}
      </p>

      {/* ── Category Tabs ────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border/60 bg-muted/40 p-1 backdrop-blur-sm max-w-xl">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-card text-foreground shadow-sm shadow-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : ""}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Suggestion Prompt Grid ───────────────────────────────────────── */}
      <div className="grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
        {activeCategory.prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card/80 p-3.5 text-left transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
          >
            <p className="text-xs font-medium text-foreground/90 leading-relaxed group-hover:text-primary transition-colors line-clamp-3">
              "{prompt}"
            </p>
            <span className="mt-2 text-[10px] font-semibold text-muted-foreground/60 group-hover:text-primary transition-colors flex items-center gap-1">
              <span>Ask assistant</span>
              <span>→</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
