# VolunSport Frontend Data Architecture

## Purpose

VolunSport now separates **domain models**, **data sources**, **service contracts**, and **UI components**. The current implementation continues to support the existing Supabase-backed read adapters and frontend demo states, while giving the UI a stable boundary that can later be backed by Supabase repositories without changing page components.

> UI components depend on service interfaces. They do not depend directly on mock arrays, Supabase queries, or database response shapes.

## Directory structure

| Location | Responsibility |
|---|---|
| `src/types/domain.ts` | Canonical frontend domain models for volunteers, admins, events, roles, applications, shifts, training, attendance, certificates, achievements, notifications, and admin summaries |
| `src/types/index.ts` | Public barrel export for canonical frontend types |
| `src/lib/types.ts` | Existing Supabase-compatible response types retained for compatibility with current adapters and routes |
| `src/mocks/frontendDemo.ts` | Volunteer presentation/demo fixtures used by the volunteer content adapter |
| `src/mocks/adminDemo.ts` | Admin workspace presentation/demo fixtures used by the admin adapter |
| `src/services/contracts.ts` | Typed service interfaces and input/filter contracts |
| `src/services/eventService.ts` | Event discovery and event-detail service |
| `src/services/applicationService.ts` | Application listing and application submission service |
| `src/services/volunteerService.ts` | Volunteer profile, accepted events, hours, and statistics service |
| `src/services/trainingService.ts` | Training list and training-detail service |
| `src/services/attendanceService.ts` | Attendance service |
| `src/services/certificateService.ts` | Certificate list and certificate-detail service |
| `src/services/notificationService.ts` | Notification listing and read-state service |
| `src/services/scheduleService.ts` | Volunteer shift/schedule service |
| `src/services/adminService.ts` | Admin workspace snapshot service |
| `src/services/volunteerContentService.ts` | Synchronous adapter for dashboard and volunteer presentation fixtures |
| `src/services/index.ts` | Stable service barrel for UI imports |
| `src/services/mockService.ts` | Existing Supabase-compatible implementation used as the current data adapter by the new services |

## Domain models

The canonical frontend model layer includes `Volunteer`, `Admin`, `Event`, `Sport`, `EventRole`, `Application`, `Shift`, `Training`, `TrainingProgress`, `Accreditation`, `Attendance`, `VolunteerHours`, `Certificate`, `Achievement`, and `Notification`. The domain module also defines status unions and admin summary models used by the administrative workspace.

The existing `src/lib/types.ts` remains available because the current Supabase adapter and several presentation routes use database-shaped snake_case fields such as `event_title`, `start_date`, and `check_in_time`. New service contracts explicitly import those compatible response types where preserving the existing adapter shape avoids unnecessary UI churn. The canonical `src/types` layer is the forward-looking domain vocabulary for new code and future normalization work.

## Service contracts

The service interfaces are declared independently from their implementations:

| Interface | Main operations |
|---|---|
| `EventService` | `getEvents`, `getEventBySlug`, `getSports` |
| `ApplicationService` | `getApplications`, `applyForRole` |
| `VolunteerService` | `getCurrentVolunteer`, `getAcceptedEvents`, `getVolunteerHours`, `getVolunteerStats` |
| `TrainingService` | `getTraining`, `getTrainingById` |
| `AttendanceService` | `getAttendance` |
| `CertificateService` | `getCertificates`, `getCertificateById` |
| `NotificationService` | `getNotifications`, `markAsRead` |
| `AdminService` | typed admin profile, statistics, management lists, reporting data, and analytics data |

The interfaces are intentionally small and task-oriented. They return frontend models rather than exposing Supabase query builders, row-level filters, database table names, or transport-specific errors to components.

## Current adapter strategy

The current service objects are thin adapters over the existing `src/services/mockService.ts` Supabase-compatible implementation or over isolated mock repositories. This means the application can continue to render with demo data where backend support is incomplete, while the UI already calls named services such as:

```ts
const events = await eventService.getEvents({ search, city });
const applications = await applicationService.getApplications();
const certificates = await certificateService.getCertificates();
```

For presentation-heavy volunteer pages, `volunteerContentService` exposes the existing dashboard, schedule, achievements, notification, certificate, and profile fixtures without allowing components to import `frontendDemo.ts` directly. Similarly, `adminService` exposes admin fixture collections without allowing admin pages to import `adminDemo.ts` directly.

## UI consumption rules

Pages and components should import from a named service module or from `src/services/index.ts`. They should manage loading, empty, error, and success states around service calls, but they should not construct large fixture arrays, import mock repositories, or issue Supabase queries directly.

Service calls should be made inside effects, route loaders, or a future query hook layer. Components should receive typed results and render them. Mutations should remain explicit and should report whether they are currently mock-only or connected to a secure backend operation.

## Replacing mocks with Supabase

The replacement path is intentionally adapter-oriented:

| Current stage | Replacement action |
|---|---|
| Demo/mock adapter | Keep fixtures in `src/mocks` and return them through service objects |
| Supabase read adapter | Implement the same interface using the existing Supabase client and normalize rows into service return types |
| Supabase mutation adapter | Implement secure application, notification, attendance, certificate, and profile mutations behind the same service contract |
| Production UI | Change the service composition/import, not the page rendering code |

No schema, migration, RLS policy, trigger, or backend authorization was changed for this task. Any future Supabase implementation must continue to enforce the existing two-role model and must not move authorization decisions into the client.

## Example composition point

A future environment-specific composition module can select the adapter once:

```ts
export const services = {
  events: eventService,
  applications: applicationService,
  volunteers: volunteerService,
  training: trainingService,
  attendance: attendanceService,
  certificates: certificateService,
  notifications: notificationService,
};
```

Pages then depend on `services.events` or the named service modules and remain independent of whether the implementation is a mock repository, a Supabase repository, or a test double.

## Verification

The service abstraction passed `npx tsc --noEmit --pretty false`. A production build should be run after formatting the touched files; no backend or Supabase schema changes are part of this architecture task.
