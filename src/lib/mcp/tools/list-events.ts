import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { mockEvents } from "@/lib/mock-data";

export default defineTool({
  name: "list_events",
  title: "List volunteer events",
  description:
    "List upcoming sporting events on the platform that are looking for volunteers, optionally filtered by city or sport.",
  inputSchema: {
    city: z.string().optional().describe("Filter by city, e.g. Rabat or Casablanca."),
    sport: z.string().optional().describe("Filter by sport, e.g. Running or Football."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ city, sport }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");

    const events = mockEvents
      .filter((event) => !city || event.city.toLowerCase() === city.toLowerCase())
      .filter((event) => !sport || event.sport.toLowerCase() === sport.toLowerCase())
      .map((event) => ({
        slug: event.slug,
        title: event.title,
        sport: event.sport,
        city: event.city,
        venue: event.venue,
        start_date: event.start_date,
        end_date: event.end_date,
        application_deadline: event.application_deadline,
        volunteers_needed: event.total_volunteers_needed,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
      structuredContent: { events },
    };
  },
});
