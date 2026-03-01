type RequestMethod = "GET" | "POST";

export const CAPTCHA_TOKEN_HEADER = "x-captcha-token";

type RequestJsonOptions = {
  method: RequestMethod;
  path: string;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export type ApiErrorType =
  | "NETWORK_DOWN"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "BAD_REQUEST"
  | "SERVER_ERROR"
  | "ABORTED"
  | "UNKNOWN";

export type ApiResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; errorType: ApiErrorType; message: string };

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function mapHttpStatusToErrorType(status: number): ApiErrorType {
  if (status === 429) {
    return "RATE_LIMITED";
  }

  if (status === 401 || status === 403) {
    return "UNAUTHORIZED";
  }

  if (status === 400 || status === 422) {
    return "BAD_REQUEST";
  }

  if (status >= 500) {
    return "SERVER_ERROR";
  }

  return "UNKNOWN";
}

function getErrorMessage(errorType: ApiErrorType): string {
  switch (errorType) {
    case "NETWORK_DOWN":
      return "Service unreachable.";
    case "RATE_LIMITED":
      return "Too many requests. Please try again later.";
    case "UNAUTHORIZED":
      return "Authorization failed.";
    case "BAD_REQUEST":
      return "The request was invalid.";
    case "SERVER_ERROR":
      return "Server error. Please try again later.";
    case "ABORTED":
      return "Request was canceled.";
    case "UNKNOWN":
    default:
      return "Request failed.";
  }
}

export class CoreApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  protected async getJson<TData = unknown>(
    path: string,
    signal?: AbortSignal,
    headers?: Record<string, string>
  ): Promise<ApiResult<TData>> {
    return this.requestJson<TData>({
      method: "GET",
      path,
      signal,
      headers,
    });
  }

  protected async postJson<TData = unknown>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
    headers?: Record<string, string>
  ): Promise<ApiResult<TData>> {
    return this.requestJson<TData>({
      method: "POST",
      path,
      body,
      signal,
      headers,
    });
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

  protected getCaptchaHeaders(captchaToken: string): Record<string, string> {
    return {
      [CAPTCHA_TOKEN_HEADER]: captchaToken,
    };
  }

  protected errorResultFromStatus<TData = never>(
    status: number
  ): Extract<ApiResult<TData>, { ok: false }> {
    const errorType = mapHttpStatusToErrorType(status);
    return {
      ok: false,
      errorType,
      message: getErrorMessage(errorType),
    };
  }

  private getUrl(path: string): string {
    return `${this.baseUrl}${normalizePath(path)}`;
  }

  private async requestJson<TData = unknown>(
    options: RequestJsonOptions
  ): Promise<ApiResult<TData>> {
    try {
      const headers: Record<string, string> = {
        ...(options.method === "POST"
          ? {
              "Content-Type": "application/json",
            }
          : {}),
        ...(options.headers ?? {}),
      };

      const response = await fetch(this.getUrl(options.path), {
        method: options.method,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body:
          options.method === "POST" && options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
        signal: options.signal,
      });

      if (!response.ok) {
        return this.errorResultFromStatus(response.status);
      }

      const data = await this.parseJsonSafe(response);
      return {
        ok: true,
        data: data as TData,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false,
          errorType: "ABORTED",
          message: getErrorMessage("ABORTED"),
        };
      }

      if (error instanceof TypeError) {
        return {
          ok: false,
          errorType: "NETWORK_DOWN",
          message: getErrorMessage("NETWORK_DOWN"),
        };
      }

      return {
        ok: false,
        errorType: "UNKNOWN",
        message: getErrorMessage("UNKNOWN"),
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
