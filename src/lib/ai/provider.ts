// Central AI router — all AI calls go through here.
// To switch providers, update environment variables only.
import { GroqProvider } from "./groq";
import { OpenRouterProvider } from "./openrouter";
import { GeminiProvider } from "./gemini";
import { AIProvider, AIRequestOptions, AIResponse } from "./types";

const providers: AIProvider[] = [
  new GroqProvider(),
  new OpenRouterProvider(),
  new GeminiProvider(),
];

async function getActiveProvider(): Promise<AIProvider> {
  for (const provider of providers) {
    if (await provider.isAvailable()) {
      return provider;
    }
  }
  throw new Error(
    "No AI provider configured. Add GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY to your .env.local file."
  );
}

export async function generateAI(options: AIRequestOptions): Promise<AIResponse> {
  const provider = await getActiveProvider();
  return provider.generate(options);
}

export type { AIRequestOptions, AIResponse };
