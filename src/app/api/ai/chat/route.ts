import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { env } from '@/config/env';
import { createAIProvider } from '@/lib/ai/provider';

/**
 * POST /api/ai/chat
 *
 * Authenticated streaming chat endpoint.
 * Validates session, parses messages, streams Gemini response.
 */

// ── Request Schema ───────────────────────────────────────────────────────────
const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1, 'Message cannot be empty').max(8000),
      })
    )
    .min(1, 'At least one message is required'),
});

export async function POST(request: NextRequest) {
  try {
    // ── 1. Authentication Check ────────────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server route handler cookie setting can fail silently
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to use the AI assistant.' },
        { status: 401 }
      );
    }

    // ── 2. API Key Validation ──────────────────────────────────────────────
    const apiKey = env.AI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        {
          error:
            'AI service is not configured yet. Please supply a valid Gemini API key in .env.local.',
        },
        { status: 503 }
      );
    }

    // ── 3. Request Body Validation ─────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid request.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { messages } = parsed.data;

    // ── 4. Stream Response from AI Provider ────────────────────────────────
    const provider = createAIProvider(
      env.AI_PROVIDER ?? 'gemini',
      apiKey,
      env.AI_MODEL ?? 'gemini-3.5-flash-lite'
    );

    const stream = await provider.generateStream(messages);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: unknown) {
    // ── Error Classification & Sanitization ──────────────────────────────
    console.error('[AI Chat API Error]', error);

    // Check for known API error patterns without leaking details
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return NextResponse.json(
        {
          error:
            'The AI assistant is experiencing high demand. Please try again in a moment.',
        },
        { status: 429 }
      );
    }

    if (
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.includes('API key')
    ) {
      return NextResponse.json(
        {
          error:
            'Unable to connect to AI provider. Please verify the API key configuration.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          'The AI assistant is temporarily unavailable. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
