# Supabase Database Schema Implementation

Your responsibility is to implement the **Supabase PostgreSQL database layer** for an existing sports-event volunteer platform.

The frontend and backend exist separately.

Your task is ONLY:

* PostgreSQL schema
* Supabase migrations
* Relationships
* Constraints
* Indexes
* RLS
* Database functions/triggers where necessary
* Storage policies if required

Do NOT redesign the frontend.

Do NOT implement frontend pages.

Do NOT create an Organizer system.

---

# 1. User Roles

There are only:

```text
volunteer
admin
```

There is NO:

```text
organizer
organization
organization dashboard
```

Admin manages all events.

---

# 2. Core Tables

Implement a clean relational schema supporting:

```text
profiles
sports
skills
languages

events
event_roles
event_shifts
shift_assignments

applications

training
training_progress

accreditations

attendance
volunteer_hours

certificates

notifications

reports
```

Add supporting junction tables where necessary.

---

# 3. profiles

Create a profile linked to:

```text
auth.users.id
```

Fields:

* id
* first_name
* last_name
* avatar
* bio
* phone
* city
* country
* date_of_birth if required
* role
* status
* created_at
* updated_at

Role:

```text
volunteer
admin
```

Add appropriate constraints.

---

# 4. Sports

Create sports/categories.

Initial data:

* Football
* Basketball
* Tennis
* Athletics
* Marathon
* Cycling
* Swimming
* Motorsport
* Other

Make the system extensible.

---

# 5. Skills

Create a reusable skills table.

Examples:

* Communication
* Photography
* First Aid
* Event Management
* Logistics
* IT
* Social Media

Use a junction table between profiles and skills.

---

# 6. Languages

Create languages and profile-language relationships.

---

# 7. Events

Create:

* id
* title
* slug
* description
* sport_id or appropriate sport reference
* cover_image
* venue
* address
* city
* country
* start_date
* end_date
* start_time
* end_time
* application_deadline
* volunteer_capacity
* status
* created_at
* updated_at

Statuses:

```text
draft
published
closed
completed
cancelled
```

Add indexes for common queries.

---

# 8. Event Roles

Each event can have multiple roles.

Fields:

* id
* event_id
* name
* description
* responsibilities
* requirements
* capacity
* created_at
* updated_at

Add foreign keys.

Prevent invalid capacity values.

---

# 9. Applications

Fields:

* id
* volunteer_id
* event_id
* role_id
* status
* experience
* availability
* motivation if needed
* admin_notes if needed
* created_at
* updated_at

Statuses:

```text
pending
accepted
rejected
waitlisted
withdrawn
```

Create a unique constraint preventing duplicate applications for the same volunteer/event/role.

---

# 10. Shifts

Create:

```text
event_shifts
```

Fields:

* id
* event_id
* role_id
* title
* location
* start_time
* end_time
* capacity
* instructions
* created_at
* updated_at

Create:

```text
shift_assignments
```

connecting:

```text
volunteer
+
shift
```

Prevent duplicate assignments.

---

# 11. Training

Create:

```text
training
training_progress
```

Training should support:

* Event-specific training
* Role-specific training
* Required/optional
* Video
* PDF
* Text/resource

Track completion per volunteer.

---

# 12. Accreditation

Create accreditation records.

Support:

* volunteer
* event
* role
* volunteer ID
* zone
* QR/token data
* status
* created_at
* updated_at

---

# 13. Attendance

Create attendance records.

Support:

* volunteer
* event
* shift
* check_in
* check_out
* status
* notes
* created_at
* updated_at

Statuses:

```text
scheduled
checked_in
checked_out
absent
late
```

Prevent duplicate attendance records for the same volunteer/shift.

---

# 14. Volunteer Hours

Create official volunteer hour records.

Support:

* volunteer
* event
* shift
* attendance reference
* hours
* approved_by
* created_at

Volunteers must not be able to modify official hours.

---

# 15. Certificates

Create certificate records.

Support:

* volunteer
* event
* role
* hours
* certificate_id
* issued_at
* file/path if applicable

Certificate IDs must be unique.

---

# 16. Notifications

Create:

* id
* recipient
* title
* message
* type
* related_event
* related_application
* read_at
* created_at

Add indexes for unread notifications.

---

# 17. Reports

Create reports for user-submitted issues.

Support:

* reporter
* target
* type
* reason
* description
* status
* created_at
* resolved_at

Statuses:

```text
open
reviewing
resolved
dismissed
```

---

# 18. Foreign Keys

Use proper foreign keys.

Important relationships:

```text
auth.users
    ↓
profiles

profiles
    ↓
applications

events
    ↓
event_roles

events
    ↓
event_shifts

applications
    ↓
event_roles

shift_assignments
    ↓
profiles
shift_assignments
    ↓
event_shifts

attendance
    ↓
profiles
attendance
    ↓
event_shifts

certificates
    ↓
profiles
certificates
    ↓
events
```

Use appropriate ON DELETE behavior.

Do not accidentally delete important historical volunteer records when an event is removed.

---

# 19. Indexes

Add useful indexes for:

* events.status
* events.start_date
* events.sport_id
* events.city
* applications.volunteer_id
* applications.event_id
* applications.status
* event_roles.event_id
* event_shifts.event_id
* notifications.recipient_id
* notifications.read_at
* attendance.volunteer_id
* certificates.volunteer_id

Do not create unnecessary indexes.

---

# 20. Constraints

Implement database-level constraints where appropriate.

Examples:

* Valid role capacity
* Valid event status
* Valid application status
* Unique certificate ID
* Unique application
* Unique shift assignment
* Unique attendance per shift
* Valid timestamps
* Valid hours

Business-critical constraints should not depend only on frontend validation.

---

# 21. RLS

Enable Row Level Security.

### Volunteer

Can access only their own private data.

They can read:

* Published events
* Event roles
* Their applications
* Their schedule
* Their training
* Their accreditation
* Their attendance
* Their hours
* Their certificates
* Their notifications

They can modify only allowed personal data.

### Admin

Can manage platform data.

Admin must be able to:

* Create/update/delete events
* Manage roles
* Manage applications
* Manage volunteers
* Manage shifts
* Manage training
* Manage attendance
* Manage hours
* Manage certificates
* Manage notifications
* Manage reports

Do not implement RLS by trusting a client-provided role.

Use authenticated database state.

---

# 22. Admin Authorization

Create a secure and maintainable method for identifying admins.

Do NOT use:

```text
localStorage
```

as the source of truth.

Do NOT expose service-role credentials.

Make sure RLS can distinguish:

```text
volunteer
admin
```

---

# 23. Storage

If required by the existing application, create Supabase Storage configuration for:

* avatars
* event images
* training files
* certificates

Apply proper policies.

Private volunteer data must not become publicly accessible accidentally.

---

# 24. Migrations

All schema changes must be represented as migration files.

Do not make undocumented manual database changes.

Migration files should be:

* Ordered
* Reproducible
* Safe
* Clear

---

# 25. Seed Data

If appropriate, create safe seed data for:

* sports
* skills
* languages

Do not create fake production volunteers or fake applications unless explicitly needed for development.

---

# 26. Verification

After implementation verify:

* Migrations
* Tables
* Foreign keys
* Constraints
* Indexes
* RLS
* Policies
* Storage policies
* Relationships

If the project supports local Supabase testing, use it.

Do not claim database verification if the database cannot actually be tested.

---

# 27. Documentation

Create/update:

```text
SUPABASE_SCHEMA.md
SUPABASE_REMAINING.md
```

`SUPABASE_SCHEMA.md` must document:

* Tables
* Columns
* Relationships
* Constraints
* Indexes
* RLS
* Storage
* Important database rules

`SUPABASE_REMAINING.md` must contain anything not implemented or not verified.

---

# 28. Final Rule

The database is the source of truth.

Do not depend on frontend validation for critical business rules.

Do not trust client-provided roles.

Do not expose service-role keys.

Do not create Organizer functionality.

The final result must provide a secure relational Supabase schema ready for the backend and frontend to consume.

**Inspect → Design → Migrate → RLS → Verify → Document.**
