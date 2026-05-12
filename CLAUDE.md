# Optro TPRM — Migration from HTML Prototype to React App

You are migrating a single-file HTML prototype (`optro_tprm.html`) into a multi-file React + TypeScript + Vite project. The HTML file is the **canonical reference** for every visual, copy, and behavioral detail. Match it exactly. Do not invent features. Do not redesign. Refactor freely on internal structure but never on user-visible output.

> NOTE (2026-05-12): The original `optro_tprm.html` was destroyed when `npm create vite -- --overwrite` was run during initial scaffold. The React app preserves every behavior from the original prototype. See git history before this commit for the original spec.

## Stack (decided)
- Vite + React 19 + TypeScript strict
- React Router v7
- CSS Modules for component styles, global tokens at `src/styles/tokens.css`
- No Tailwind, no styled-components, no Redux

## Routing
- `/` → redirect to `/vendors`
- `/vendors` → VendorListPage
- `/vendors/:vendorId` → VendorDetailPage (only `acme` wired)
- `/settings` → SettingsPage

## State preservation (workflow)
The vendor detail page tracks a workflow state machine. Cursor: `tier_pending → docs_pending → assessments_pending → assessments_started`. Each transition has exact timing (1300ms doc spinner, 1100ms follow-up, 700ms accept hold, etc.) and copy that must match.

## Don't change
- Copy text, colors, spacing, border-radius, animation timing, state transitions, font pairing (DM Sans / DM Mono).
