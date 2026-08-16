import { AdminGate } from "./components/AdminGate";
import { formatStatus } from "./components/adminHelpers";

import {
  VSButton,
  VSEmptyState,
  VSPageHeader,
  VSStatusBadge,
} from "@/components/design-system";

import { adminService } from "@/services/adminService";

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-foreground">
        {value ?? "—"}
      </p>
    </div>
  );
}

export function AdminAttendancePage() {
  const attendance = adminService.getAttendance();

  return (
    <AdminGate title="Attendance">
      <div className="mx-auto max-w-7xl">
        <VSPageHeader
          eyebrow="Operations"
          title="Attendance"
          description="Verify check-ins and check-outs for every event shift."
        />

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-border bg-card">
          {attendance.length === 0 ? (
            <div className="p-8">
              <VSEmptyState
                title="No attendance records"
                description="Attendance records will appear here once shifts are scheduled."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {attendance.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_0.6fr_0.6fr_auto] md:items-center md:p-6"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.volunteer}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.event}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {item.shift}
                  </p>

                  <Info
                    label="Check-in"
                    value={item.checkIn}
                  />

                  <Info
                    label="Check-out"
                    value={item.checkOut}
                  />

                  <VSStatusBadge
                    status={formatStatus(item.status)}
                  />

                  <VSButton
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </VSButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}