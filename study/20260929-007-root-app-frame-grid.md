# Root App Frame and Grid Layout

## Date

2026-09-29

## Request

Implement the approved full-screen app frame and two-column application shell, retaining the LiteTalky blue-and-white UI and avoiding page-level scrolling.

## Context

The root layout rendered the page directly in `body`; the page owned a fixed-position flex shell. The user approved moving viewport ownership to the root layout and using an explicit grid.

## Plan

Add a root `.app-frame`, make `.workspace-shell` a two-column grid, give the main column explicit header/content rows, and keep scrolling limited to Sessions and conversation content. Preserve the existing frontend interactions and add no backend features.

## Changes Made

- Wrapped page content in `.app-frame` in `app/layout.tsx` and updated its description to LiteTalky workspace.
- Changed `.workspace-shell` to a normal-flow two-column grid with a fixed-width sidebar and flexible main column.
- Changed `.main-column` to a grid with a top-bar row and a `minmax(0, 1fr)` content row.
- Kept the mobile navigation drawer and bounded Sessions/conversation scrollers.
- Replaced earlier height-breakpoint spacing patches with viewport-aware sizing.
- Updated the diagnosis document to clarify that its approval-pending note was historical.
- Added this timeline entry.

## Why

An explicit root frame and grid define the available viewport space and the sidebar/main relationship structurally, rather than relying on a page-level fixed element and nested percentage heights.

## Verification

- `npm run lint` passed.
- `npm run build` passed, including TypeScript checks and static page generation.
- The development server on port 8080 returned HTTP 200.
- Programmatic inspection of the live DOM and stylesheet confirmed the app frame, two-column shell, main grid rows, and Sessions/conversation scrolling rules.
- `git diff --check` passed after the documentation changes.
- Browser-computed geometry and visual appearance were not manually verified because no browser automation/rendering tool is available in this environment.

## Problems Encountered

The first detached dev-server restart exited after its initial probe. Restarting with captured startup logs resulted in a stable server, and the page and stylesheet checks passed.

## Lessons / Concepts

For viewport applications, define the available area once at the root and use explicit grid tracks with `minmax(0, 1fr)` so nested content can shrink while designated children scroll independently.

## Current State

The root owns a `100dvh` frame; the sidebar and main area occupy two grid columns. Sessions and conversation content remain the only designated vertical scrollers. Visual confirmation in the user's browser is still required.

## Files Changed

- `app/layout.tsx`
- `app/globals.css`
- `troubleshoot/20260929-001-viewport-layout-diagnosis.md`
- `study/20260929-007-root-app-frame-grid.md`
