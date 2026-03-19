# Frontend Codebase Notes

## Overview

This is a Next.js app (App Router) that renders a single-page Kanban board demo. The UI is fully client-side and uses local React state for board data. There is no backend integration yet.

## Key Files

- src/app/layout.tsx: Root layout, Google fonts (Space Grotesk, Manrope), global styles.
- src/app/page.tsx: Home page that renders the Kanban board.
- src/app/globals.css: Tailwind v4 setup and CSS variables for the color system.
- src/lib/kanban.ts: Types, demo seed data, and card-move utilities.
- src/components/KanbanBoard.tsx: Main board state and drag-and-drop wiring.
- src/components/KanbanColumn.tsx: Column layout with rename and add card flows.
- src/components/KanbanCard.tsx: Card display and delete action.
- src/components/KanbanCardPreview.tsx: Drag overlay preview card.
- src/components/NewCardForm.tsx: Inline form to add new cards.

## Behavior

- Columns are editable (rename inline).
- Cards can be added and removed.
- Drag-and-drop uses @dnd-kit for reordering and moving across columns.
- Board data is stored in local React state with a seeded dataset.

## Styling

- Tailwind v4 is used with CSS variables for the project color palette.
- Fonts are set via next/font in the root layout.

## Tests

- Unit tests: Vitest with Testing Library.
- E2E tests: Playwright.

## NPM Scripts

- dev: next dev
- build: next build
- start: next start
- test:unit: vitest run
- test:e2e: playwright test
- test:all: runs unit tests then e2e tests
