import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { mockEventSlugs } from "@/lib/mock-data";

export default defineTool({
  name: "get_event",
  title: "Get event details",
  description:
    "Get full details for one event by its slug, including every volunteer role, its requirements and how many positions are still open.",
  inputSchema: {
    slug: z.string().describe("Event slug, e.g. rabat-coastal-marathon."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");

    const event = mockEventSlugs[slug];
    if (!event) throw new ToolError(`No event found with slug "${slug}".`);

    const detail = {
      ...event,
      event_roles: (event.event_roles ?? []).map((role) => ({
        name: role.name,
        description: role.description,
        responsibilities: role.responsibilities,
        requirements: role.requirements,
        skills: role.skills,
        positions: role.positions,
        open_positions: role.positions - role.filled_positions,
        min_age: role.min_age,
        mandatory_training: role.mandatory_training,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
      structuredContent: { event: detail },
    };
  },
});
