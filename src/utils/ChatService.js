import Groq from 'groq-sdk';

/**
 * ChatService - Handles API communication with the chat model
 */
export class ChatService {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.modelURL = import.meta.env.VITE_MODEL_SERVER_URL;
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * Processes response content to ensure proper formatting
   * @param {string} content - Raw content from API
   * @returns {string} - Properly formatted content
   */
  processResponseContent(content) {
    // Fix malformed image markdown patterns first
    let processedContent = content
      // Fix duplicate image markdown syntax
      .replace(/!\[Project Screenshot\s*\n*\s*.*?\]\(!\[Project Screenshot/g, '![Project Screenshot')
      // Fix closing parentheses issues
      .replace(/\)\s*\n*\s*\)/g, ')')
      // Clean up any remaining malformed markdown
      .replace(/\]\(!\[(.*?)\]\((.*?)\)/g, '](http:$2)')
      .replace(/\]\(!\[(.*?)\]\[(.*?)\]/g, ']($2)');

    // Then process plain URLs into proper markdown
    processedContent = processedContent.replace(
      /(https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp))/gi,
      (match) => {
        // Only convert to markdown if not already part of markdown syntax
        if (!content.includes(`[`) && !content.includes(`](${match})`)) {
          return `![Project Screenshot](${match})`;
        }
        return match;
      }
    );

    // Ensure special URL format is consistent
    return processedContent.replace(
      /\$\$\$ "([^"]+)": "([^"]+)" \$\$\$/g,
      '$$$ $1: $2 $$$'
    );
  }

  /**
   * Creates a chat completion by calling the API
   * @param {string} userMessage - The user message
   * @param {string} systemInstructions - The system instructions
   * @returns {Promise<Object>} - The API response
   */
  async createChatCompletion(userMessage, systemInstructions) {
    let retries = 0;
    
    while (retries <= this.maxRetries) {
      try {
        const response = await fetch(this.modelURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content: systemInstructions,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "I couldn't generate a response.";
        
        // Process the content to ensure proper formatting
        const processedContent = this.processResponseContent(content);
        
        return {
          success: true,
          content: processedContent,
        };
      } catch (error) {
        retries++;
        if (retries > this.maxRetries) {
          console.error("Chat API error:", error);
          return {
            success: false,
            content: "Sorry, I'm having trouble connecting to my brain. Please try again later.",
          };
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}
