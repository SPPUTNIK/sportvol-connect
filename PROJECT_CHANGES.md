# Project Changes

## 2026-09-03 — Project baseline audit

### Goal
Document the current repository state and verify the app still builds before any future feature work.

### Added
- Created `PROJECT_CHANGES.md` to track all changes and compatibility notes.

### Modified
- None yet; this is a baseline check before any feature work.

### Database Changes
- No database changes were made.
- Existing Supabase schema, policies, and triggers were not modified.

### Security
- No RLS or auth changes were made.
- Existing profile protections and admin-role patterns were left untouched.

### UI
- No UI changes were made.

### Testing
- Build validation pending.

### Intentionally Unchanged
- Existing auth flow
- Existing profile role model
- Existing Supabase integration
- Existing route structure
- Existing service layer
- Existing project architecture

### Pending
- No feature work was requested in this session.
- Future task-specific implementation should be added here once a concrete requirement is provided.

### Notes
- The current workspace appears to have no committee-specific implementation files or routes at this time.
- Because there was no explicit feature request or bug report in the current task, no unrelated functionality was added or modified.

## 2026-09-03 — Add Committee feature (scaffold)

### Goal
Add a complete, minimal, production-ready committee feature: DB schema, RLS, helper functions, service layer, and types — implemented additively and without modifying existing authentication or other services.

### Added
- Supabase schema: `committees`, `committee_members`, `committee_feedback` (see `supabase/schema.sql`)
- DB helper functions: `is_committee_member`, `is_committee_leader`, `leads_committee_with_member` (in `supabase/schema.sql`)
- `src/services/committeeService.ts` — service layer for committees, members, feedback
- Types:
	- Added DB-shaped types to `src/lib/types.ts` (`Committee`, `CommitteeMember`, `CommitteeFeedback`)
	- Added domain types to `src/types/domain.ts`

### Modified
- `supabase/schema.sql` — appended committee tables, helpers, RLS policies, and triggers
- `src/services/index.ts` — exported `committeeService`

### Database
- Added `committees` table with unique constraint `(event_id, name)`
- Added `committee_members` table with unique `(committee_id, profile_id)`
- Added `committee_feedback` table
- Added indexes on foreign keys and common lookup columns

### Security
- RLS enabled for new tables
- Policies:
	- `committees`: read for admin, committee leader, or active member; write (insert/update/delete) for admin only
	- `committee_members`: read for admin, committee leader, or member themselves; writes for admin only
	- `committee_feedback`: read for admin, committee leader, or feedback subject; insert for admin or authorized committee leader (author must be `auth.uid()`); updates/deletes for admin only
- Helper functions implemented: `is_committee_member`, `is_committee_leader`, `leads_committee_with_member`

### UI
- No UI changes were added. Use existing design patterns and components when building UI on top of the new service.

### Testing
- Build: Will run after applying changes (see run commands below)
- Typecheck: Project does not have `npm run typecheck`; `npx tsc --noEmit` is available and will be used.

### Intentionally Unchanged
- Existing authentication flow (`profiles`, `is_admin()`) was not modified.
- No Supabase secrets or service role keys added to the repo.
- No existing tables or triggers were removed or altered.

### Pending
- Add optional frontend pages/components under `/admin/committees` and `/my-committee` to match existing routes (not included in this change).
- Consider adding unit/integration tests for service methods in a separate task.

### Commands run
- `npm run build` — executed to validate build (see logs)
- `npx tsc --noEmit` — recommended for type checking (run below)

