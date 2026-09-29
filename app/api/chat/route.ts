import { NextResponse } from "next/server";
import {
  createAssistantReply,
  OpenAIConfigurationError,
  OpenAIServiceError,
  type OpenAIConversationMessage,
} from "@/lib/server/openai-chat";

export const runtime = "nodejs";

const MAX_MESSAGES = 60;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_CONVERSATION_LENGTH = 48_000;
const MAX_REQUEST_BYTES = 64 * 1024;

function validateMessages(value: unknown): OpenAIConversationMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;

  const messages: OpenAIConversationMessage[] = [];
  let totalLength = 0;

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;

    const message = item as Record<string, unknown>;
    if (message.role !== "user" && message.role !== "assistant") return null;
    if (
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return null;
    }

    totalLength += message.content.length;
    if (totalLength > MAX_CONVERSATION_LENGTH) return null;

    messages.push({ role: message.role, content: message.content });
  }

  return messages[messages.length - 1]?.role === "user" ? messages : null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "The conversation is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const messages =
    body && typeof body === "object" && !Array.isArray(body)
      ? validateMessages((body as Record<string, unknown>).messages)
      : null;

  if (!messages) {
    return NextResponse.json(
      {
        error:
          "Send up to 60 non-empty user and assistant messages, ending with a user message.",
      },
      { status: 400 },
    );
  }

  try {
    const content = await createAssistantReply(messages);
    return NextResponse.json({ message: { role: "assistant", content } });
  } catch (error) {
    if (error instanceof OpenAIConfigurationError) {
      return NextResponse.json(
        { error: "OpenAI is not configured on the server. Add OPENAI_API_KEY to the server environment." },
        { status: 500 },
      );
    }

    if (error instanceof OpenAIServiceError) {
      return NextResponse.json(
        {
          error:
            error.status === 401 || error.status === 403
              ? "OpenAI rejected the server configuration. Verify OPENAI_API_KEY and model access."
              : "The assistant service is temporarily unavailable. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "The chat request could not be completed. Please try again." },
      { status: 500 },
    );
  }
}
