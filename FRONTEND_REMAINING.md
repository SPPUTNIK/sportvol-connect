# VolunSport Frontend Remaining Work

## Current status

The specified public, volunteer, and admin route surfaces are implemented and the frontend passes lint, TypeScript, and production-build checks. The polish pass addressed visible keyboard focus, reduced motion, explicit button semantics, profile form submission, login redirect dependencies, and generated-type lint compatibility.

## Remaining QA

A full visual browser pass across desktop, tablet, and mobile widths remains recommended. The responsive shells and layouts are implemented, but final human inspection should verify drawer transitions, table overflow, filter drawers, long event titles, form validation messages, certificate previews, analytics cards, and report layouts at representative viewport widths.

The current lint result is successful but still reports advisory warnings from the existing Fast Refresh export pattern in shared components and from non-memoized functions in the authentication context. These warnings do not block the build. They can be removed in a later refactor by moving shared constants out of component modules and wrapping authentication actions in `useCallback`, but that is not required for the current frontend behavior.

Authenticated browser-flow testing should be completed with representative volunteer and admin accounts. This should cover route guards, Supabase login and registration, application submission, admin triage, profile saving, password recovery, and notification/read-state behavior using real environment configuration.

## Remaining integration work

Frontend-only service adapters should be replaced incrementally with secure Supabase-backed implementations wherever persistence is required. These replacements must preserve the current service contracts, normalize database rows into frontend types, and keep authorization decisions in the backend/RLS layer rather than the browser.

Accessibility should receive a final manual pass with keyboard-only navigation and a screen reader. Recommended checks include dialog and drawer focus containment, announcements for loading/error/success states, heading hierarchy, color contrast in dark ink panels, and reduced-motion behavior during route transitions.

## Explicitly out of scope

No organizer role should be added. No backend, database schema, migration, trigger, RLS policy, or authorization change is part of the remaining frontend polish work. No major product feature should be introduced under the current QA scope.
