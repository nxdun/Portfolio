type RequestMethod = "GET" | "POST";

type RequestJsonOptions = {
  method: RequestMethod;
  path: string;
  body?: unknown;
  signal?: AbortSignal;
};

export type CoreApiResponse<TData = unknown> = {
  ok: boolean;
  status: number;
  data: TData | null;
  error?: string;
};

const CAPTCHA_VERIFY_PATH = "/api/v1/captcha/verify";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function readErrorMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const objectValue = payload as Record<string, unknown>;
  const message = objectValue.message;
  if (typeof message !== "string") {
    return undefined;
  }

  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 240) : undefined;
}

export class CoreApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  protected async getJson<TData = unknown>(
    path: string,
    signal?: AbortSignal
  ): Promise<CoreApiResponse<TData>> {
    return this.requestJson<TData>({
      method: "GET",
      path,
      signal,
    });
  }

  protected async postJson<TData = unknown>(
    path: string,
    body: unknown,
    signal?: AbortSignal
  ): Promise<CoreApiResponse<TData>> {
    return this.requestJson<TData>({
      method: "POST",
      path,
      body,
      signal,
    });
  }

  async verifyCaptcha(
    captchaToken: string,
    signal?: AbortSignal
  ): Promise<boolean> {
    const response = await this.postJson(
      CAPTCHA_VERIFY_PATH,
      {
        captcha: captchaToken,
      },
      signal
    );

    if (!response.ok) {
      return false;
    }

    const payload = this.asObject(response.data);
    return payload?.success === true;
  }

  protected asObject(value: unknown): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  protected resolveUrl(path: string): string {
    return this.getUrl(path);
  }

  private getUrl(path: string): string {
    return `${this.baseUrl}${normalizePath(path)}`;
  }

  private async requestJson<TData = unknown>(
    options: RequestJsonOptions
  ): Promise<CoreApiResponse<TData>> {
    try {
      const response = await fetch(this.getUrl(options.path), {
        method: options.method,
        headers:
          options.method === "POST"
            ? {
                "Content-Type": "application/json",
              }
            : undefined,
        body:
          options.method === "POST" && options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
        signal: options.signal,
      });

      const data = await this.parseJsonSafe(response);
      return {
        ok: response.ok,
        status: response.status,
        data: data as TData | null,
        error: response.ok
          ? undefined
          : (readErrorMessage(data) ?? "Request failed."),
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      return {
        ok: false,
        status: 0,
        data: null,
        error: "Network request failed.",
      };
    }
  }

  private async parseJsonSafe(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}
