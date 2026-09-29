# OpenAI Chat Integration

## Date

2026-09-29

## Request

Connect the existing client-side CHAT sessions to OpenAI through a server-side Next.js Route Handler, keeping provider credentials out of the browser.

## Context

CHAT sessions were stored in the workspace reducer, but their content was empty and the selected-session view was a placeholder. `.env.example` already documented `OPENAI_API_KEY`; the OpenAI SDK was not installed. `.env.local` was not opened or modified.

## Plan

Add a server-only OpenAI integration using the official SDK and Responses API, validate conversation history at `POST /api/chat`, and extend each in-memory session with messages, generation state, and safe error state.

## Changes Made

- Added `lib/server/openai-chat.ts`, which reads `OPENAI_API_KEY` only in server code and uses `OPENAI_MODEL` with `gpt-4.1-mini` as its default.
- Added `app/api/chat/route.ts` with JSON, role, message-count, content-size, and final-user-message validation plus sanitized errors.
- Connected the existing Chat session view to `POST /api/chat`, including message history, loading/disabled-send feedback, assistant replies, and per-session errors.
- Extended the existing workspace reducer to retain messages and request state independently per session.
- Installed `openai` 7.23.0 and `server-only` 0.0.1.
- Added `OPENAI_MODEL=gpt-4.1-mini` to `.env.example`; the existing `OPENAI_API_KEY` name remains documented.
- Added this timeline entry.

## Why

The client sends only conversation messages to LiteTalky. The server-only module reads the provider credential, calls the Responses API, and returns only assistant text. This keeps the key outside client code and responses.

## Verification

- `npm run lint` passed.
- `npm run build` passed, including TypeScript checks and the `/api/chat` route.
- Route validation returned HTTP 400 for malformed JSON, empty content, unsupported roles, and histories ending with an assistant message.
- An isolated missing-key check raised the expected configuration error without printing a key.
- Client event tests with a mocked successful API response verified loading state, per-session message history, assistant rendering, and session isolation.
- The real server-side provider request reached OpenAI, which returned HTTP 401 `invalid_api_key`. The route returned a sanitized HTTP 502 response. No successful assistant response could be verified until the local credential is corrected.
- Confirmed the client bundle and rendered HTML do not contain `OPENAI_API_KEY`, the configured model, or the OpenAI SDK; confirmed `.env.local` remains ignored and untracked.
- `.env.local` was not opened, displayed, modified, or logged by this work.

## Problems Encountered

The configured server-side credential was rejected by OpenAI with `invalid_api_key`. Its value was not inspected or exposed. The user must replace or correct it locally in `.env.local` before successful provider responses can be verified.

## Lessons / Concepts

Server-only imports and Route Handlers create a clear credential boundary. Client-side session history can provide conversation context without introducing persistence, while validation and sanitized errors keep the API boundary predictable.

## Current State

The UI and server endpoint are connected, but a successful OpenAI assistant response remains blocked by the rejected local credential. No database, persistence, authentication, metering, or additional provider integration was added.

## Files Changed

- `.env.example`
- `app/globals.css`
- `app/api/chat/route.ts`
- `app/page.tsx`
- `app/workspace-state.ts`
- `lib/server/openai-chat.ts`
- `package.json`
- `package-lock.json`
- `study/20260929-009-openai-chat-integration.md`
