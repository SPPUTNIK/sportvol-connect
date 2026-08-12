import { defineTool, ToolError } from "@lovable.dev/mcp-js";

import { mockApplications } from "@/lib/mock-data";

export default defineTool({
  name: "list_my_applications",
  title: "List my volunteer applications",
  description:
    "List the volunteer applications belonging to the signed-in user, with their current status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");

    const applications = mockApplications.map((application) => ({
      event_title: application.event_title,
      role_name: application.role_name,
      submitted_at: application.submitted_at,
      status: application.status,
      message: application.message,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(applications, null, 2) }],
      structuredContent: { applications },
    };
  },
});
