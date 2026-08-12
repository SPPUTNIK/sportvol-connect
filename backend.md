# Backend Implementation Task

You are implementing the **BACKEND ONLY** for an existing sports-event volunteer platform.

The frontend already exists.

The Supabase database/schema will be handled separately.

Your responsibility is to implement the backend/service/business logic layer and connect it to the existing frontend where appropriate.

---

# Critical Scope

Do NOT redesign the frontend.

Do NOT rebuild frontend pages.

Do NOT create an Organizer system.

There are ONLY:

```text
Volunteer
Admin
```

The backend must support the complete sports-event volunteer lifecycle.

---

# 1. Inspect Existing Project

Before implementing:

* Inspect frontend
* Inspect existing Supabase client
* Inspect existing services
* Inspect existing types
* Inspect routes
* Inspect authentication
* Inspect existing API/service functions
* Inspect existing mock data

Reuse existing architecture where possible.

Do not duplicate existing functionality.

---

# 2. Backend Responsibilities

Implement secure business logic for:

* Authentication integration
* Profiles
* Events
* Event roles
* Applications
* Volunteer assignments
* Shifts
* Training
* Accreditation
* Attendance
* Volunteer hours
* Certificates
* Notifications
* Admin operations

---

# 3. Authentication

Integrate with Supabase Auth.

Support:

* Sign up
* Login
* Logout
* Password reset
* Session handling
* Auth state

Do not expose service-role credentials to the client.

---

# 4. Authorization

There are two roles:

```text
volunteer
admin
```

Implement secure authorization.

Volunteer:

* Own profile
* Published events
* Own applications
* Own schedule
* Own training
* Own accreditation
* Own attendance
* Own hours
* Own certificates
* Own notifications

Admin:

* Full platform management

Never trust a client-supplied role.

---

# 5. Profiles

Implement services for:

* Get profile
* Create profile
* Update profile
* Upload avatar
* Update skills
* Update sports interests
* Update languages

Handle missing profiles gracefully.

---

# 6. Events

Implement:

* List published events
* Get event
* Search
* Filter
* Get event roles
* Get event availability

Admin:

* Create event
* Update event
* Delete event
* Publish
* Unpublish
* Close
* Complete
* Cancel

Validate all inputs.

---

# 7. Event Roles

Implement:

* Create role
* Update role
* Delete role
* Get roles
* Capacity validation
* Remaining positions

Prevent capacity from being exceeded.

---

# 8. Applications

Implement:

* Create application
* Get volunteer applications
* Get application details
* Withdraw application
* Admin list applications
* Accept
* Reject
* Waitlist
* Assign/reassign role

Enforce:

* No duplicate application
* No application after deadline
* No application to closed event
* No application if role is full

Do not rely only on frontend validation.

---

# 9. Scheduling

Implement:

* Create shift
* Update shift
* Delete shift
* Assign volunteer
* Remove assignment
* Get volunteer schedule
* Get event schedule

Prevent overbooking.

---

# 10. Training

Implement:

* Create training
* Update training
* Delete training
* Assign training
* Mark completed
* Track progress

Support:

* Video
* PDF
* Text/resource

---

# 11. Accreditation

Implement:

* Create accreditation
* Update accreditation
* Get volunteer accreditation
* Generate unique volunteer/event identification
* QR code data if required

---

# 12. Attendance

Implement:

* Check-in
* Check-out
* Manual admin correction
* Attendance status
* Late/no-show handling

Validate:

* Correct event
* Correct shift
* Authorized volunteer
* Valid event timing where applicable

---

# 13. Volunteer Hours

Calculate hours from attendance.

Support:

* Total hours
* Event hours
* Sport hours
* Current year hours

Admin must be able to correct official hours.

Volunteers cannot directly modify official hours.

---

# 14. Certificates

Implement certificate generation logic.

Certificate should contain:

* Volunteer
* Event
* Role
* Hours
* Event date
* Certificate ID
* Issue date

Support:

* Generate
* Bulk generate
* Retrieve
* Download

---

# 15. Notifications

Implement notification creation and retrieval.

Triggers should include:

* Application submitted
* Application accepted
* Application rejected
* Role changed
* Shift assigned
* Training assigned
* Accreditation approved
* Event reminder
* Certificate issued

Support read/unread state.

---

# 16. Password Recovery

Implement the backend integration required for:

```text
Forgot password
→ Email
→ Reset link
→ Reset password
```

Ensure redirect URLs are documented.

---

# 17. Error Handling

Use consistent backend errors.

Handle:

* Authentication errors
* Authorization errors
* Validation errors
* Not found
* Capacity errors
* Duplicate applications
* Database errors
* Storage errors

Do not leak sensitive database details.

---

# 18. Validation

Validate all important operations server-side/backend-side.

Examples:

* Event date
* Application deadline
* Role capacity
* User permissions
* Application state
* Shift capacity
* Attendance
* Certificate eligibility

---

# 19. Backend ↔ Frontend Integration

Connect the existing frontend to real backend services.

Replace mock service calls where appropriate.

Do not redesign UI.

For every major frontend action verify:

```text
UI
→ Backend/service
→ Supabase
→ Result
→ UI update
```

---

# 20. Security

Do NOT rely on:

* localStorage role
* frontend-only route protection
* client-provided admin role
* hidden buttons

Use secure authorization and database policies.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

---

# 21. Testing

Test important workflows:

### Volunteer

```text
Register
→ Profile
→ Browse event
→ Apply
→ View application
```

### Admin

```text
Login
→ Create event
→ Create role
→ View application
→ Accept volunteer
→ Assign shift
```

### Event Day

```text
Check-in
→ Check-out
→ Hours
→ Certificate
```

---

# 22. Final Verification

Run available:

* build
* lint
* typecheck
* tests

Fix backend-related errors.

Do not redesign frontend.

At the end create/update:

```text
BACKEND_IMPLEMENTED.md
BACKEND_REMAINING.md
```

Document:

* Completed backend features
* Remaining backend features
* Known issues
* Verification results

Only mark something DONE after verifying the actual behavior.

# Final Rule

**Inspect → Implement Backend → Connect → Verify → Document.**

Do not create an Organizer system.
