import { json } from "@remix-run/node";

export async function loader() {
  try {
    // Test environment variables
    const claudeKeyExists = !!process.env.CLAUDE_API_KEY;
    const claudeKeyLength = process.env.CLAUDE_API_KEY?.length;
    
    // Test database connection
    let dbStatus = "unknown";
    try {
      const { db } = await import("../db.server");
      // Try a simple query
      await db.$connect();
      dbStatus = "connected";
    } catch (dbError) {
      dbStatus = `error: ${dbError.message}`;
    }
    
    // Test Claude service
    let claudeStatus = "unknown";
    try {
      const { createClaudeService } = await import("../services/claude.server");
      const service = createClaudeService();
      claudeStatus = "service_created";
    } catch (claudeError) {
      claudeStatus = `error: ${claudeError.message}`;
    }

    return json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        claudeKeyExists,
        claudeKeyLength,
      },
      database: {
        status: dbStatus
      },
      claude: {
        status: claudeStatus
      }
    });
  } catch (error) {
    return json({
      status: "error",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}