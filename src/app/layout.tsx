import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GlobalProviders } from "@/providers/global-providers";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

/**
 * Root Application Shell Template Wrapper
 *
 * Configures server-side font properties, sets hydration configuration tags,
 * and mounts the base provider stack. Next.js Server Component only.
 *
 * Inner structure is wrapped inside the global ErrorBoundary layout layer.
 */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "BusinessFlow AI",
    template: "%s | BusinessFlow AI",
  },
  description:
    "Modern AI-Powered Business Management Platform built with Next.js, TypeScript, Supabase and modern SaaS architecture.",
  applicationName: "BusinessFlow AI",
  authors: [{ name: "Aadit Dey", url: "https://github.com/Aadit223dey" }],
  creator: "Aadit Dey",
  publisher: "Aadit Dey",
  keywords: ["business", "automation", "AI", "operations", "SaaS", "multi-tenant", "scheduler"],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/Aadit223dey/BusinessFlow-AI",
    title: "BusinessFlow AI",
    description:
      "Modern AI-Powered Business Management Platform built with Next.js, TypeScript, Supabase and modern SaaS architecture.",
    siteName: "BusinessFlow AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "BusinessFlow AI",
    description:
      "Modern AI-Powered Business Management Platform built with Next.js, TypeScript, Supabase and modern SaaS architecture.",
  },
};

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center h-16 w-16 mx-auto rounded-2xl bg-destructive/10 text-destructive">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          An unexpected error occurred. Please refresh the page to try again.
        </p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <GlobalProviders>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <Footer />
            </div>
          </GlobalProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
