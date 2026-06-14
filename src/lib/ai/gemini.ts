import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIRequestOptions, AIResponse } from "./types";

const MODEL = "gemini-1.5-flash";

export class GeminiProvider implements AIProvider {
  name = "gemini";

  async isAvailable(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
  }

  async generate(options: AIRequestOptions): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const systemPart = options.systemPrompt ? `${options.systemPrompt}\n\n` : "";
    const userMessage = options.messages.at(-1)?.content ?? "";
    const prompt = systemPart + userMessage;

    const result = await model.generateContent(prompt);

    return {
      content: result.response.text(),
      provider: this.name,
      model: MODEL,
    };
  }
}
