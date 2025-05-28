import { json } from "@remix-run/node";
import { createClaudeService } from "../services/claude.server";
import AppConfig from "../services/config.server";

export async function loader({ request }) {
  try {
    // Test Claude service creation
    const claudeService = createClaudeService();
    
    // Test basic Claude API call
    const testMessages = [
      { role: "user", content: "Hello" }
    ];

    console.log("Testing Claude API with messages:", testMessages);
    console.log("API Key available:", !!process.env.CLAUDE_API_KEY);
    console.log("API Key length:", process.env.CLAUDE_API_KEY?.length);

    const response = await claudeService.streamConversation(
      {
        messages: testMessages,
        promptType: AppConfig.api.defaultPromptType,
        tools: []
      },
      {
        onText: (text) => console.log("Text chunk:", text),
        onMessage: (msg) => console.log("Message:", msg)
      }
    );

    return json({
      success: true,
      response: response,
      config: {
        model: AppConfig.api.defaultModel,
        promptType: AppConfig.api.defaultPromptType
      }
    });

  } catch (error) {
    console.error("Debug chat error:", error);
    return json({
      success: false,
      error: error.message,
      stack: error.stack,
      apiKeySet: !!process.env.CLAUDE_API_KEY
    }, { status: 500 });
  }
}