import type { SessionView, TrackingResult, CartView, UserProfile, SessionProfileResponse } from "./store";

export interface MaleeClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ChatRequest {
  message: string;
  session_id: string | null;
  language_mode: "auto" | "english" | "sinhala" | "mixed";
}

export interface ActionRequest {
  session_id: string;
  action:
    | "add_to_cart"
    | "remove_from_cart"
    | "set_quantity"
    | "clear_cart"
    | "set_delivery_city"
    | "set_delivery_date"
    | "set_gift_note"
    | "set_language";
  payload: Record<string, unknown>;
}

export interface ActionResponse {
  session?: SessionView;
  cart?: CartView;
}

export class MaleeClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: MaleeClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };
  }

  async streamChat(
    req: ChatRequest,
    onEvent: (event: { type: string; [key: string]: unknown }) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): Promise<AbortController> {
    const controller = new AbortController();

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          ...this.headers,
          Accept: "text/event-stream",
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;

        if (line.startsWith("data: ")) {
          const dataStr = line.substring(6);
          try {
            const event = JSON.parse(dataStr);
            onEvent(event);
          } catch (e) {
            console.error("Failed to parse SSE event JSON:", dataStr, e);
          }
        } else if (line.startsWith("id: ")) {
          // You could store the ID if needed, but per requirements we just parse and ignore for now
        }
      };

      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (buffer) {
                processLine(buffer);
              }
              onDone();
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? ""; // keep the last incomplete line in buffer

            for (const line of lines) {
              processLine(line);
            }
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.name === "AbortError") {
            onDone();
          } else {
            onError(e instanceof Error ? e : new Error(String(e)));
          }
        }
      };

      pump();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") {
        onDone();
      } else {
        onError(e instanceof Error ? e : new Error(String(e)));
      }
    }

    return controller;
  }

  async sendAction(req: ActionRequest): Promise<ActionResponse> {
    const response = await fetch(`${this.baseUrl}/action`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSession(sessionId: string): Promise<SessionView> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async trackOrder(orderNumber: string): Promise<TrackingResult> {
    const response = await fetch(`${this.baseUrl}/track`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ order_number: orderNumber }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
  async getUserProfile(sessionId: string): Promise<SessionProfileResponse> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/profile`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateUserProfile(sessionId: string, profile: UserProfile): Promise<SessionProfileResponse> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/profile`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify({ profile }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
