# Radiology Report Assistant

Build a small, production-minded prototype of Bionic Flow, an AI-assisted radiology reporting workspace.

Goal

The user pastes a radiology dictation as text. The system converts it into a structured Findings + Impression report, preserves the information from the dictation, shows the source of every generated sentence, and validates the report for safety issues before sign-off.

Core workflow

Dictation → Structured Facts → LLM Report Generation → Deterministic Validation → Report + Warnings → Human Review

Requirements

Input

Text textarea for radiology dictation.

Include the 3 provided test cases as quick-load examples.

STT/microphone is optional and should only be added after the text workflow is complete.

Structured facts
Extract and represent important facts from the dictation, including:

Finding/entity

Anatomy/location

Laterality

Measurements and units

Negation

Basic importance/severity where useful

The structured facts should act as the source of truth for validation.

Report generation
Generate:

Findings

Impression

Every generated sentence must have provenance:

Dictation

Template

System inference

The model must not invent diagnoses, findings, measurements, laterality, or other unsupported information.

Validation
Use deterministic TypeScript validators rather than relying on the LLM to validate itself.

Check for:

Laterality inconsistencies

Negation inconsistencies

Measurement/unit inconsistencies

Unsupported findings or diagnoses in the report

Important findings missing from the impression

Each warning should show:

Warning type

What the dictation says

What the report says

Severity

Fix

Dismiss

After a deterministic fix, re-run validation.

Performance/error handling

Display generation time.

Handle empty input, model failures, malformed model output, and timeouts gracefully.

Validate all LLM output with Zod.

Support a mock mode so the application works without API credentials.

Tech stack

Frontend:

React

TypeScript

Vite

Tailwind CSS

Backend:

Node.js

TypeScript

Fastify

Zod

LLM:

Groq API for fast inference.

Abstract the LLM behind an interface so Groq can be replaced with a mock implementation.

Architecture

Keep the code modular:

frontend/
backend/

Backend services should include:

fact extraction

report generation

validation

Validators should be separated into:

laterality

negation

measurement

grounding

completeness

Do not over-engineer authentication, databases, streaming infrastructure, or other production features. Prioritize correctness, safety, explainability, and the three test cases.

Key design principle

The LLM is used for language transformation and structuring, but deterministic rules are responsible for safety-critical consistency checks.

Do not claim to completely prevent hallucinations. Instead, reduce hallucination risk through structured facts, constrained generation, provenance, deterministic validation, and human review.

UI

Build a clean, simple workspace with:

Dictation panel

Findings

Impression

Provenance badges

Validation warnings

Fix/Dismiss controls

Generation time

Test case buttons

Optimize for a clear demo rather than visual complexity.

Scope

First make the complete text-based workflow work reliably. Only add microphone/STT if the core application is finished and there is remaining time.

dont use anything which is lovable dont mention lovable anywhere

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e3ff90b-5e21-4e1c-a5c1-480183bc2f06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
