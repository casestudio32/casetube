import { AIProvider, AIRequestOptions, AIResponse } from "./types";

const MODEL = "meta-llama/llama-3.3-70b-instruct";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export class OpenRouterProvider implements AIProvider {
  name = "openrouter";

  async isAvailable(): Promise<boolean> {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async generate(options: AIRequestOptions): Promise<AIResponse> {
    const messages = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...options.messages]
      : options.messages;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "CaseTube",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });

    const data = await res.json();

    return {
      content: data.choices[0]?.message?.content ?? "",
      provider: this.name,
      model: MODEL,
    };
  }
}
