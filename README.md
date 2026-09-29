# LiteTalky

LiteTalky is a prototype AI chat application built around a server-side language-model integration. Users interact with the LiteTalky interface while provider requests are intended to pass through the Next.js server.

## Overview

The prototype provides a workspace for Chat sessions and a placeholder for SimGen. Chat requests are sent to a LiteTalky Route Handler, which calls the OpenAI API without exposing the API key to client-side code.

## Current Features

- LiteTalky blue-and-white workspace interface.
- CHAT and SimGen navigation; SimGen is a placeholder.
- Client-side session creation, selection, renaming, and deletion.
- Chat interface with per-session client-side conversation state.
- Server-side OpenAI integration prototype through a Next.js Route Handler.
- Environment-variable-based server configuration.

OpenAI requests require a valid local API credential. This prototype does not guarantee successful requests with development credentials.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Official OpenAI JavaScript SDK and OpenAI Responses API
- Git and GitHub

## Architecture

```text
User
  -> LiteTalky frontend
  -> Next.js server / Route Handler
  -> OpenAI API
  <- assistant response
```

The OpenAI API key is read by server-side code only. It is not a `NEXT_PUBLIC_` variable and is not sent to the browser.

## Environment Setup

Create `.env.local` using `.env.example` as a reference. Add your own valid OpenAI API key locally; never commit `.env.local` or share the credential.

```text
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

The API key value above is a placeholder, not a credential.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Current Limitations / Future Work

- Sessions and messages are held in client-side memory and are not persisted.
- SimGen, authentication, and real account/logout functionality are not implemented.
- Supabase/PostgreSQL persistence, usage metering, quotas, rate limiting, and billing are future work.
- Anthropic and Google integrations are not implemented.
- Production deployment and security hardening remain future work.
- The OpenAI integration is a prototype and requires a valid local credential for successful requests.

## Development Notes

The `study/` directory contains development and audit notes about implementation decisions, verification, and lessons learned.
