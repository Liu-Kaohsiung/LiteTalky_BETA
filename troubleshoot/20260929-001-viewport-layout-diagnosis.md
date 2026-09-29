# Viewport Layout Diagnosis

## Date

2026-09-29

## Scope

Investigate why the LiteTalky development page was reported to appear at the bottom-left and require page scrolling. No application code was changed during this diagnosis.

## Inspected Structure

- `app/layout.tsx` renders `<html><body>{children}</body></html>` without a dedicated full-screen app wrapper.
- `app/page.tsx` renders `.workspace-shell` directly under the body. It contains the sidebar and the main column; the main column contains the top bar and `.workspace-content`.
- `app/globals.css` owns the viewport and overflow rules. The current `.workspace-shell` is fixed to the viewport with `height: 100dvh`; `.main-column` fills its height; `.workspace-content` uses flex centering.
- The only vertical scrolling rules are on `.session-list` and `.empty-conversation`.
- No separate components, Tailwind configuration, or PostCSS configuration are present. `next.config.ts` is empty.

## Live Server Checks

- The Next.js development server is running from `/home/coder/LiteTalky` on port 8080.
- The page returned HTTP 200 and included the expected workspace DOM markers.
- Its linked stylesheet contained the fixed viewport shell, centered flex canvas, and the expected two scrollable regions.

## Diagnosis

The checked-in page structure and the CSS served by the local development server do not contain a rule that positions the interface at the bottom-left. They instead specify a viewport-sized shell and centered main content. Therefore, the reported rendering cannot be explained by the inspected source alone. A stale or different preview, or a difference in the browser's effective viewport/layout context, is possible but was not confirmed because browser-computed styles or a screenshot were unavailable.

## Proposed Structure

Add an explicit full-screen app frame in the root layout. Use a two-column grid for the sidebar and main area, with a top-bar row and a constrained content row in the main area. Give Sessions a bounded `min-height: 0` region with vertical scrolling, and allow scrolling within the conversation canvas only. Keep the frame at `100dvh` with outer overflow hidden.

At the time of this diagnosis, implementation was waiting for user approval. The user subsequently approved the root app frame and grid layout; see `study/20260929-007-root-app-frame-grid.md` for the implementation record.

## Verification Limits

The HTTP response and stylesheet were inspected from the development server, but this environment did not provide browser-computed layout measurements or a screenshot of the user's displayed preview. The precise visual mismatch remains unverified.
