import { defineTool, ToolError } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description: "Return the account this MCP connection is signed in as.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const account = { user_id: ctx.getUserId(), email: ctx.getUserEmail() };
    return {
      content: [{ type: "text", text: JSON.stringify(account, null, 2) }],
      structuredContent: account,
    };
  },
});
