# Viewport Scroll Containment

## Date

2026-09-29

## Request

Fit the workspace to the screen and allow scrolling only in Sessions and chat interfaces.

## Context

The workspace content container could scroll, while the sessions list did not have a constrained height to make it an independent scroller.

## Plan

Lock the application shell and page to the dynamic viewport height, constrain the sessions list to its sidebar flex area, and make the conversation canvas the only scrollable part of the chat view.

## Changes Made

- Changed the root, workspace shell, sidebar, and main column to use bounded viewport heights with hidden outer overflow.
- Made the sessions list a flex-bounded vertical scroller.
- Made the conversation canvas independently scrollable and removed scrolling from the main content area.
- Added compact height rules so the sidebar and welcome screen fit shorter displays.
- Added this timeline entry.

## Why

Containing scrolling prevents the whole workspace from shifting while preserving access to long session lists and chat content.

## Verification

- `npm run lint` passed.
- `npm run build` passed, including TypeScript checks and static page generation.
- CSS inspection found only the sessions list and conversation canvas configured for scrolling.
- The development server on port 8080 returned HTTP 200.
- `git diff --check` passed.

## Problems Encountered

No significant problems encountered.

## Lessons / Concepts

An independently scrollable flex child needs a bounded parent and `min-height: 0`; otherwise it can expand the page instead of scrolling within its allocated space.

## Current State

The workspace is constrained to the dynamic viewport. Sessions and conversation content scroll independently; the page and surrounding workspace do not.

## Files Changed

- `app/globals.css`
- `study/20260929-004-viewport-scroll-containment.md`
