import "server-only";
import OpenAI from "openai";

export type OpenAIConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export class OpenAIConfigurationError extends Error {
  constructor() {
    super("OpenAI server configuration is missing.");
    this.name = "OpenAIConfigurationError";
  }
}

export class OpenAIServiceError extends Error {
  constructor(readonly status?: number) {
    super("The OpenAI request failed.");
    this.name = "OpenAIServiceError";
  }
}

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export async function createAssistantReply(messages: OpenAIConversationMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new OpenAIConfigurationError();

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({ model, input: messages });
    const content = response.output_text.trim();
    if (!content) throw new OpenAIServiceError();
    return content;
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    throw new OpenAIServiceError(status);
  }
}
