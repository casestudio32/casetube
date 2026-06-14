import Groq from "groq-sdk";
import { AIProvider, AIRequestOptions, AIResponse } from "./types";

const MODEL = "llama-3.3-70b-versatile";

export class GroqProvider implements AIProvider {
  name = "groq";
  private client: Groq | null = null;

  private getClient(): Groq {
    if (!this.client) {
      this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return this.client;
  }

  async isAvailable(): Promise<boolean> {
    return !!process.env.GROQ_API_KEY;
  }

  async generate(options: AIRequestOptions): Promise<AIResponse> {
    const client = this.getClient();
    const messages = options.systemPrompt
      ? [{ role: "system" as const, content: options.systemPrompt }, ...options.messages]
      : options.messages;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
      provider: this.name,
      model: MODEL,
    };
  }
}
