# Client Project Board

## Build
- Replace the placeholder at `/` with a focused, responsive three-column task board.
- Add task creation and editing with required title, client, and deadline fields; optional notes; inline validation; and preserved form values on errors.
- Add card actions to edit, confirm deletion, and move tasks among To Do, In Progress, and Done without changing other task data.
- Add empty states, readable deadlines, overdue/upcoming/completed indicators, and a confirmed clean-board reset.
- Create a compact, dark, Apple-like visual system with semantic tokens, clear keyboard focus, and layouts that adapt to narrow screens.

## Data and structure
- Keep the app client-side and use browser `localStorage`; do not add authentication, a backend, a database, or external services.
- Define the task model and safe storage parsing/writing in `src/lib/tasks.ts`; validate every persisted record before rendering it.
- Keep board rendering, task forms, and user actions in the `/` page, using the project's existing accessible UI controls.
- Record the chosen structure and persistence boundary in the root `AGENTS.md`.

## Edge cases and verification
- Safely handle unavailable storage, absent data, malformed JSON, invalid records, and failed writes without crashing.
- Test required-field validation, persisted-data validation, storage failure handling, and status-only updates in focused unit tests.
- Run the project's test and lint commands, then verify create/edit/delete/move/reset, refresh persistence, empty columns, overdue dates, and desktop/mobile layouts in the preview.