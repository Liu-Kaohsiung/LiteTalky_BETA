# OpenAI Environment Variable Name

## Date

2026-09-29

## Request

Rename `OPEN_API_KEY` to `OPENAI_API_KEY` in `.env.example` and `.env.local`.

## Context

The project contains environment files but no application code yet. `.env.local` contains credentials and was not opened or displayed.

## Plan

Change only the variable-name prefix in both files, preserve the local value, and verify the new assignment without printing its value.

## Changes Made

- Renamed the variable in `.env.example` and `.env.local`.
- Added this timeline entry. No credential values were included.

## Why

The example and local environment need to use the same OpenAI variable name.

## Verification

- Confirmed `.env.local` has one `OPENAI_API_KEY` assignment and no remaining `OPEN_API_KEY` assignment, without displaying values.
- Confirmed Git ignores `.env.local`.

## Problems Encountered

No significant problems encountered.

## Lessons / Concepts

An environment variable can be renamed by changing its key while preserving its value; the value should not be exposed during verification.

## Current State

Both environment files use `OPENAI_API_KEY`. No application features or Next.js scaffold were added.

## Files Changed

- `.env.example`
- `.env.local`
- `study/20260929-001-openai-env-name.md`
