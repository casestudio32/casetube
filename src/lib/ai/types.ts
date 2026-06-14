// Shared types for all AI providers
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

export interface AIProvider {
  name: string;
  generate(options: AIRequestOptions): Promise<AIResponse>;
  isAvailable(): Promise<boolean>;
}
