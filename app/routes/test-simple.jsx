import { json } from "@remix-run/node";

export async function loader() {
  try {
    console.log("Testing simple Claude API call...");
    
    // Import Claude service
    const { createClaudeService } = await import("../services/claude.server");
    const claudeService = createClaudeService();
    
    console.log("Claude service created");
    
    // Simple test message
    const testMessages = [{ role: "user", content: "Hello" }];
    
    console.log("Calling Claude API...");
    
    // Try the most basic streaming call
    const result = await claudeService.streamConversation(
      {
        messages: testMessages,
        promptType: 'standardAssistant',
        tools: []
      },
      {
        onText: (text) => {
          console.log("Received text:", text);
        },
        onMessage: (message) => {
          console.log("Received message:", message);
        }
      }
    );

    console.log("Claude API call completed:", result);

    return json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error("Detailed error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error cause:", error.cause);
    
    return json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    }, { status: 500 });
  }
}