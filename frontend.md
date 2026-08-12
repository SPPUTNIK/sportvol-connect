# Frontend Implementation Task

You are working on an existing MVP frontend for a sports-event volunteer platform.

Your task is to implement and complete the **FRONTEND ONLY**.

## Critical Scope Rule

For this task:

**DO NOT implement backend functionality.**

**DO NOT create or modify Supabase database schema.**

**DO NOT create migrations.**

**DO NOT create RLS policies.**

**DO NOT modify Supabase tables.**

**DO NOT implement server-side authorization.**

You may create temporary typed mock/service interfaces where necessary, but keep them clearly separated so they can later be connected to the real backend.

The goal is to make the frontend complete, polished, responsive, and ready to connect to the backend.

---

# 1. Inspect Existing MVP First

Before changing anything, inspect:

* Existing pages
* Existing routes
* Components
* Layouts
* Design system
* Navigation
* Forms
* Dashboard
* Existing mock data
* Existing authentication UI
* Existing event pages
* Existing admin pages
* Existing responsive behavior

Do NOT rebuild the application from scratch.

Reuse the existing design and components whenever possible.

---

# 2. Product Structure

There are ONLY two user roles:

### Volunteer

Volunteer can:

* Register
* Login
* Complete profile
* Browse sports events
* Search/filter events
* View event details
* View available volunteer roles
* Apply
* Track applications
* View accepted events
* View schedule
* View training
* View accreditation
* View attendance
* View volunteer hours
* View certificates
* View notifications
* Manage profile/settings

### Admin

Admin manages the entire platform.

Admin can:

* Create events
* Edit events
* Publish events
* Manage event roles
* Manage applications
* Manage volunteers
* Create shifts
* Assign volunteers
* Manage training
* Manage accreditation
* Manage attendance
* Manage hours
* Generate certificates
* Send notifications
* View reports
* View analytics

There is NO organizer dashboard.

There are NO organizer accounts.

---

# 3. Public Pages

Complete the frontend for:

* Home
* Events
* Event Details
* Sports/categories
* About
* Login
* Register
* Forgot Password
* Reset Password

---

# 4. Home Page

The homepage should immediately communicate:

> Find your next sports volunteering opportunity.

Include:

* Hero
* Event search
* Sport categories
* Upcoming events
* Featured events
* How volunteering works
* Volunteer impact/statistics
* CTA to browse events

Use the existing MVP visual identity.

---

# 5. Events Page

Implement:

### Search

* Event name
* Sport
* City
* Venue

### Filters

* Sport
* City
* Date
* Availability

### Sorting

* Upcoming
* Newest
* Most available positions

Include:

* Event cards
* Loading state
* Empty state
* Error state
* Pagination/infinite loading if appropriate

For now, use the project's existing data/service abstraction rather than implementing database logic.

---

# 6. Event Details

Create a complete event details experience.

Show:

* Event cover
* Event title
* Sport
* Date
* Time
* Venue
* Location
* Description
* Requirements
* Volunteer capacity
* Available positions
* Application deadline

### Volunteer Roles

Each role card should show:

* Role name
* Description
* Responsibilities
* Requirements
* Capacity
* Remaining positions

CTA:

**Apply for this role**

---

# 7. Application UI

Create the complete application UX.

Flow:

```text
Event
→ Select Role
→ Application Form
→ Review
→ Submit
→ Success
```

Application form can include:

* Availability
* Experience
* Motivation
* Relevant skills
* Additional information

Show clear validation.

---

# 8. Application Status

Volunteer should see:

* Pending
* Accepted
* Rejected
* Waitlisted
* Withdrawn

Use clear status components.

---

# 9. Volunteer Dashboard

Create/complete:

### Overview

Show:

* Upcoming event
* Next shift
* Application status
* Volunteer hours
* Completed events
* Certificates
* Training progress
* Notifications

---

# 10. My Applications

Create a complete page containing:

* Event
* Role
* Date
* Application date
* Status
* View details

---

# 11. My Events

Show accepted events.

Each event should show:

* Event information
* Assigned role
* Shift
* Training
* Accreditation
* Attendance status

---

# 12. Schedule

Create a schedule interface.

Show:

* Event
* Date
* Shift
* Role
* Location
* Start time
* End time
* Instructions

Optimize this page for mobile because volunteers may use it during event days.

---

# 13. Training

Create:

* Training list
* Training details
* Video UI
* PDF/resource UI
* Completion state
* Progress indicator

Example:

```text
Training Progress
2 / 3 completed
```

---

# 14. Accreditation

Create an accreditation page.

Show:

* Volunteer name
* Volunteer ID
* Event
* Role
* Zone
* Status
* QR code placeholder if backend is not yet connected

Make the design suitable for mobile.

---

# 15. Attendance

Create UI for:

* Check-in state
* Check-out state
* Attendance status
* Event day information

Backend functionality is NOT required in this frontend task.

---

# 16. Volunteer Hours

Create:

* Total hours
* Current-year hours
* Hours by sport
* Hours by event
* Completed events

Use charts/cards where appropriate.

---

# 17. Certificates

Create:

* Certificate list
* Certificate preview
* Certificate details
* Download button UI
* Certificate ID
* Event
* Role
* Hours
* Date

Actual PDF generation is not required in this frontend-only phase unless it already exists.

---

# 18. Notifications

Create:

* Notification dropdown
* Notifications page
* Read/unread state
* Notification categories
* Timestamp
* Related event

---

# 19. Profile

Create a complete profile experience.

Fields:

* First name
* Last name
* Avatar
* Bio
* Phone
* City
* Country
* Sports interests
* Skills
* Languages

Also show:

* Events completed
* Volunteer hours
* Certificates
* Attendance

---

# 20. Admin Dashboard

There is ONLY an Admin Dashboard.

Do NOT create an Organizer Dashboard.

Admin frontend should contain:

### Overview

* Total volunteers
* Upcoming events
* Applications
* Accepted volunteers
* Volunteer hours
* Attendance

### Events

* Event list
* Create event
* Edit event
* Event details
* Event roles
* Event shifts

### Applications

* Application list
* Filters
* Application details
* Accept
* Reject
* Waitlist
* Assign role

### Volunteers

* Volunteer list
* Search
* Filters
* Volunteer details
* History
* Hours
* Certificates

### Training

* Training list
* Create training
* Training progress

### Attendance

* Attendance dashboard
* Check-in
* Check-out
* Attendance status

### Certificates

* Generate UI
* Certificate list
* Certificate details

### Notifications

* Create announcement
* Send notification

### Reports

* Applications
* Attendance
* Hours
* Training

### Analytics

* Volunteers
* Events
* Sports
* Roles
* Attendance
* Hours

---

# 21. Responsive Design

Everything must work on:

* Desktop
* Tablet
* Mobile

Pay special attention to:

* Event details
* Application forms
* Volunteer dashboard
* Schedule
* Accreditation
* Check-in
* Admin tables

---

# 22. UX States

Every major frontend operation needs:

* Loading
* Empty
* Error
* Success
* Disabled
* Confirmation

Examples:

```text
No upcoming events.
No applications yet.
No certificates yet.
No notifications.
```

---

# 23. Frontend Architecture

Keep the existing project architecture when reasonable.

Create reusable components for:

* EventCard
* EventStatus
* RoleCard
* ApplicationStatus
* VolunteerStats
* ShiftCard
* TrainingCard
* CertificateCard
* NotificationItem
* DataTable
* EmptyState
* LoadingState
* ErrorState
* Modal
* Form components

Avoid duplicated UI.

---

# 24. Mock Data

If backend is not connected yet:

Create a clearly separated mock/data layer.

Do NOT scatter hardcoded arrays throughout components.

For example:

```text
src/mocks/
src/services/
src/types/
```

The structure should make replacing mock data with real backend calls easy.

---

# 25. Types

Create proper frontend types for:

* Volunteer
* Event
* Sport
* EventRole
* Application
* Shift
* Training
* Accreditation
* Attendance
* VolunteerHours
* Certificate
* Notification

Keep them reusable.

---

# 26. Password Recovery UI

Complete:

```text
Forgot Password
→ Email
→ Success
→ Reset Password
→ New Password
→ Confirm Password
→ Success
```

Do not implement the Supabase backend here.

---

# 27. Final Frontend Verification

Run available:

* build
* lint
* typecheck

Fix frontend errors.

Do NOT implement backend functionality during this task.

At the end create/update:

```text
FRONTEND_IMPLEMENTED.md
FRONTEND_REMAINING.md
```

`FRONTEND_IMPLEMENTED.md` must contain everything completed.

`FRONTEND_REMAINING.md` must contain everything still missing from the frontend.

Only mark a feature as DONE when it actually exists and works in the frontend.

Do not modify Supabase schema or backend.

# Final Rule

**Inspect → Build Frontend → Verify → Document.**

Do not touch backend/database architecture.
