import { AdminGate } from "../components/AdminGate";
import { AdminForm } from "../components/AdminForm";

export function AdminEventCreatePage() {
  return (
    <AdminGate title="Create event">
      <AdminForm
        title="Create an event"
        eyebrow="Event management"
        description="Prepare the core event information before adding roles and shifts."
        submitLabel="Create event"
      />
    </AdminGate>
  );
}