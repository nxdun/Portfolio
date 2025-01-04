import Groq from 'groq-sdk';

// * ChatService class
// * This class is responsible for handling the communication with the Groq API
export class ChatService {
  constructor(apiKey, options = {}) {
    this.client = new Groq({
      apiKey,
      timeout: options.timeout || 60000,
      maxRetries: options.maxRetries || 2,
      dangerouslyAllowBrowser: true
    });

    this.models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "llama-3.2-3b-preview",
      "llama3-groq-8b-8192-tool-use-preview"
    ];
    
    this.currentModelIndex = 0;
    this.retryDelay = 1000; // Initial retry delay in ms
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createChatCompletion(userMessage, systemInstruction) {
    let attempts = 0;
    const maxAttempts = this.client._options.maxRetries + 1;

    while (attempts < maxAttempts) {
      try {
        const params = {
          messages: [
            {
              role: "system",
              content: systemInstruction
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          model: this.models[this.currentModelIndex]
        };

        const completion = await this.client.chat.completions.create(params);
        return {
          success: true,
          content: completion.choices[0]?.message?.content,
          model: this.models[this.currentModelIndex]
        };

      } catch (error) {
        attempts++;
        
        // Handle different error types
        if (error instanceof Groq.RateLimitError) {
          this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length;
          return {
            success: false,
            content: `Rate limit reached. Switching to ${this.models[this.currentModelIndex]}...`,
            model: this.models[this.currentModelIndex]
          };
        }
        
        if (error instanceof Groq.APIConnectionTimeoutError) {
          if (attempts < maxAttempts) {
            await this.sleep(this.retryDelay * attempts);
            continue;
          }
          return {
            success: false,
            content: "Request timed out. Please try again.",
            error: error
          };
        }

        if (error instanceof Groq.AuthenticationError) {
          return {
            success: false,
            content: "API key is invalid or not provided.",
            error: error
          };
        }

        if (error instanceof Groq.BadRequestError) {
          return {
            success: false,
            content: "Invalid request format.",
            error: error
          };
        }

        if (error instanceof Groq.APIConnectionError) {
          if (attempts < maxAttempts) {
            await this.sleep(this.retryDelay * attempts);
            continue;
          }
          return {
            success: false,
            content: "Connection error. Please check your internet connection.",
            error: error
          };
        }

        // Handle any other errors
        return {
          success: false,
          content: "An unexpected error occurred.",
          error: error
        };
      }
    }

    return {
      success: false,
      content: "Maximum retry attempts reached.",
      error: new Error("Max retries exceeded")
    };
  }
}
