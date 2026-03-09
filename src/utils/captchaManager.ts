type CaptchaApi = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: CaptchaApi;
  }
}

type CaptchaManagerOptions = {
  host: HTMLElement;
  siteKey: string;
  timeoutMs?: number;
  onSolved?: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function getTheme(): "light" | "dark" {
  return document.firstElementChild?.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export class CaptchaManager {
  private readonly host: HTMLElement;
  private readonly siteKey: string;
  private readonly timeoutMs: number;
  private readonly onSolved?: (token: string) => void;
  private readonly onExpired?: () => void;
  private readonly onError?: () => void;

  private widgetId: number | null = null;
  private rendered = false;
  private token = "";
  private disposed = false;
  private readonly pendingTimeouts = new Set<number>();

  constructor(options: CaptchaManagerOptions) {
    this.host = options.host;
    this.siteKey = options.siteKey;
    this.timeoutMs = options.timeoutMs ?? 12000;
    this.onSolved = options.onSolved;
    this.onExpired = options.onExpired;
    this.onError = options.onError;
  }

  getToken(): string {
    return this.token;
  }

  reset(): void {
    this.token = "";

    if (window.grecaptcha && this.widgetId !== null) {
      window.grecaptcha.reset(this.widgetId);
    }
  }

  async ensureReady(signal?: AbortSignal): Promise<boolean> {
    if (this.disposed) {
      return false;
    }

    if (window.grecaptcha?.render) {
      return true;
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt <= this.timeoutMs) {
      if (signal?.aborted || this.disposed) {
        return false;
      }

      if (window.grecaptcha?.render) {
        return true;
      }

      try {
        await this.sleep(180, signal);
      } catch (error) {
        if (isAbortError(error)) {
          return false;
        }

        throw error;
      }
    }

    return false;
  }

  async ensureRendered(signal?: AbortSignal): Promise<boolean> {
    const ready = await this.ensureReady(signal);
    if (!ready || !window.grecaptcha || this.disposed) {
      return false;
    }

    if (this.rendered) {
      this.reset();
      return true;
    }

    await new Promise<void>(resolve => {
      window.grecaptcha?.ready(() => {
        if (this.disposed || !window.grecaptcha) {
          resolve();
          return;
        }

        this.widgetId = window.grecaptcha.render(this.host, {
          sitekey: this.siteKey,
          theme: getTheme(),
          callback: token => {
            this.token = token;
            this.onSolved?.(token);
          },
          "expired-callback": () => {
            this.token = "";
            this.onExpired?.();
          },
          "error-callback": () => {
            this.token = "";
            this.onError?.();
          },
        });

        this.rendered = true;
        resolve();
      });
    });

    return this.rendered;
  }

  dispose(): void {
    this.disposed = true;
    this.reset();
    this.pendingTimeouts.forEach(timeoutId => {
      window.clearTimeout(timeoutId);
    });
    this.pendingTimeouts.clear();
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted || this.disposed) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      const timeoutId = window.setTimeout(() => {
        this.pendingTimeouts.delete(timeoutId);
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);

      this.pendingTimeouts.add(timeoutId);

      const onAbort = () => {
        this.pendingTimeouts.delete(timeoutId);
        window.clearTimeout(timeoutId);
        signal?.removeEventListener("abort", onAbort);
        reject(new DOMException("Aborted", "AbortError"));
      };

      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }
}
