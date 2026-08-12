import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listEventsTool from "./tools/list-events";
import getEventTool from "./tools/get-event";
import listMyApplicationsTool from "./tools/list-my-applications";
import whoAmITool from "./tools/whoami";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "sportvol-connect",
  title: "SportVol Connect",
  version: "0.1.0",
  instructions:
    "Tools for VolunSport / SportVol Morocco, a sports volunteering platform. Use `list_events` and `get_event` to browse volunteer opportunities across Morocco, `list_my_applications` to see the signed-in volunteer's applications, and `whoami` to confirm the connected account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listEventsTool, getEventTool, listMyApplicationsTool, whoAmITool],
});
