# Frontend Remaining

The current frontend already contains the principal public and volunteer routes, and the new admin dashboard provides a responsive overview and management entry point. The following work remains for a complete production-grade frontend matching the full specification.

## Remaining

The admin workspace needs dedicated CRUD screens for events, event roles, shifts, applications, volunteers, training, attendance, certificates, notifications, reports, and analytics rather than the current management overview cards.

The admin action forms should be wired to dedicated backend mutations for publishing events, accepting applications, assigning shifts, correcting attendance, issuing certificates, and sending notifications.

The volunteer dashboard can be expanded with richer upcoming-event, next-shift, training-progress, certificate, and notification summaries instead of relying on the current route-level cards.

The remaining polish pass should include full mobile visual QA for event details, schedule, accreditation, attendance, and admin data tables, followed by full-repository lint cleanup and authenticated browser-flow tests.
