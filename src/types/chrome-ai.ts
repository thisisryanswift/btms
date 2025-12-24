/**
 * TypeScript types for Chrome Built-in AI (Gemini Nano)
 * 
 * API Documentation: https://developer.chrome.com/docs/ai
 */

export interface LanguageModelSession {
  inputUsage: number;
  inputQuota: number;
  topK: number;
  temperature: number;
  onquotaoverflow: (() => void) | null;
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): ReadableStream<string>;
  destroy(): void;
}

export interface LanguageModelCreateOptions {
  expectedInputLanguages?: string[];
  expectedOutputLanguages?: string[];
  topK?: number;
  temperature?: number;
}

export type LanguageModelAvailability = 'available' | 'readily' | 'downloadable' | 'no';

export interface LanguageModelAPI {
  availability(): Promise<LanguageModelAvailability>;
  create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
}

// Extend the global scope to include LanguageModel
declare global {
  const LanguageModel: LanguageModelAPI;
}