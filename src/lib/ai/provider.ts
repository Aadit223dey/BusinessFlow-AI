import 'server-only';

import { GoogleGenAI } from '@google/genai';

/**
 * AI Provider Abstraction Layer
 *
 * Server-only module that handles communication with the configured
 * AI provider (Google Gemini by default). Never imported by client components.
 */

// ── System Instruction ──────────────────────────────────────────────────────
export const SYSTEM_INSTRUCTION =
  "You are the AI assistant integrated into BusinessFlow AI. Behave as a helpful, intelligent, general-purpose conversational AI. Answer clearly, accurately, and naturally across general knowledge, programming, business ideation, mathematics, and creative tasks. Format responses using Markdown when appropriate — use headings, bullet points, numbered lists, bold text, and fenced code blocks with language tags. Do not claim access to BusinessFlow AI internal database records, customer data, appointments, or administrative tools unless explicitly provided in the prompt.";

// ── Provider Interface ───────────────────────────────────────────────────────
export interface AIProviderAdapter {
  generateStream(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ReadableStream<Uint8Array>>;
}

// ── Gemini Provider ──────────────────────────────────────────────────────────
class GeminiProvider implements AIProviderAdapter {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generateStream(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ReadableStream<Uint8Array>> {
    // Map all messages into contents array with Gemini role format
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }));

    const response = await this.client.models.generateContentStream({
      model: this.model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      contents,
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text ?? '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}

// ── Provider Factory ─────────────────────────────────────────────────────────
export function createAIProvider(
  provider: string,
  apiKey: string,
  model: string
): AIProviderAdapter {
  switch (provider) {
    case 'gemini':
      return new GeminiProvider(apiKey, model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
