import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/leader/")({
  beforeLoad: () => {
    throw redirect({ to: "/leader/dashboard" });
  },
});
