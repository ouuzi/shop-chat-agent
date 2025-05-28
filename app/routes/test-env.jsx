import { json } from "@remix-run/node";

export async function loader() {
  return json({
    claudeApiKey: process.env.CLAUDE_API_KEY ? "SET" : "NOT SET",
    claudeApiKeyLength: process.env.CLAUDE_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('CLAUDE'))
  });
}