/**
 * AI Assistant — Shared Type Definitions
 *
 * Universal message interfaces that decouple the client UI
 * from any specific backend model/provider format.
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  feedback?: 'helpful' | 'unhelpful' | null;
}

export interface ChatCompletionPayload {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatErrorResponse {
  error: string;
  code?: string;
}
