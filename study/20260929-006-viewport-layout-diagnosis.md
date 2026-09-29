# Viewport Layout Diagnosis

## Date

2026-09-29

## Request

Record the viewport layout diagnosis in a new `troubleshoot/` directory without implementing the proposed changes.

## Context

The user reported that the app appeared at the bottom-left and required scrolling. The latest source used a viewport-fixed shell and flex-centered main canvas, and the dev server on port 8080 served those current styles.

## Plan

Document the inspected DOM/layout structure, current CSS behavior, live-server checks, diagnosis limits, and a proposed root-level app frame. Do not modify application code.

## Changes Made

- Added `troubleshoot/20260929-001-viewport-layout-diagnosis.md`.
- Added this study entry.
- No application source or configuration files were changed.

## Why

The diagnosis should be recorded for later troubleshooting while preserving the user's approval gate for layout implementation.

## Verification

- Confirmed the root layout, page DOM structure, global CSS, package configuration, and absence of Tailwind/PostCSS configuration or separate components.
- Confirmed the local development page returned HTTP 200 and served the expected viewport and scroll rules.
- `.env.local` was not opened.

## Problems Encountered

The source and local HTTP response did not reproduce the reported bottom-left placement. Browser-computed styles and a screenshot of the user's preview were unavailable, so the exact displayed-state cause remains unconfirmed.

## Lessons / Concepts

When the live source specifies full-viewport sizing but the observed preview disagrees, verify the actual browser's loaded stylesheet and computed dimensions before changing layout rules.

## Current State

The diagnosis and proposed structure are documented. No implementation changes were made; the proposed root-level app frame still requires user approval.

## Files Changed

- `troubleshoot/20260929-001-viewport-layout-diagnosis.md`
- `study/20260929-006-viewport-layout-diagnosis.md`
