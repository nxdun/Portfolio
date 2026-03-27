import { sanitizeText } from "../validation";
import { CoreApiClient, type ApiResult } from "../../../utils/CoreApiClient";
import {
  toYtdlpTerminalState,
  normalizeYtdlpJobStatus,
} from "../../../utils/ytdlpStatus";

const YTDLP_ENQUEUE_PATH = "/api/v1/ytdlp";
const YTDLP_JOB_PATH = "/api/v1/ytdlp/jobs";
const YTDLP_STREAM_SUFFIX = "/stream";
const YTDLP_DOWNLOAD_PATH = "/api/v1/ytdlp/download";
const YTDLP_SITES_PATH = "/api/v1/ytdlp/sites";

export type YtdlpJobState = "pending" | "success" | "fail" | "unknown";

export type YtdlpDownloadFile = {
  blob: Blob;
  fileName: string;
};

export type YtdlpBrowserDownloadProgress = {
  loadedBytes: number;
  totalBytes: number | null;
  percent: number | null;
  bytesPerSecond: number | null;
};

type YtdlpDownloadOptions = {
  onProgress?: (progress: YtdlpBrowserDownloadProgress) => void;
};

export type YtdlpJobSnapshot = {
  status: string;
  progressPercent: number | null;
  progressTotal: string | null;
  progressSpeed: string | null;
  progressEta: string | null;
  progressMessage: string | null;
  updatedAtUnix: number | null;
};

export type YtdlpStreamProgress = YtdlpJobSnapshot;

export type YtdlpStreamError = {
  errorType: "NETWORK_DOWN" | "BAD_REQUEST" | "UNKNOWN";
  message: string;
  shouldFallbackToPolling: boolean;
};

export type YtdlpStreamSubscription = {
  close: () => void;
};

type YtdlpStreamCallbacks = {
  onProgress: (progress: YtdlpStreamProgress) => void;
  onDone: () => void;
  onError: (error: YtdlpStreamError) => void;
};

function readStatus(job: Record<string, unknown>): string {
  return (
    sanitizeText(typeof job.status === "string" ? job.status : null, {
      maxLength: 80,
      preserveWhitespace: false,
    }) ?? ""
  ).toLowerCase();
}

function readOptionalText(value: unknown, maxLength = 256): string | null {
  return (
    sanitizeText(typeof value === "string" ? value : null, {
      maxLength,
      preserveWhitespace: false,
    }) ?? null
  );
}

function readOptionalPercent(value: unknown): number | null {
  const numberValue = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(numberValue)) {
    return null;
  }

  const clamped = Math.max(0, Math.min(100, numberValue));
  return Math.round(clamped * 10) / 10;
}

function readOptionalUnix(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.trunc(value);
}

function toSnapshot(job: Record<string, unknown>): YtdlpJobSnapshot {
  return {
    status: normalizeYtdlpJobStatus(readStatus(job)),
    progressPercent: readOptionalPercent(job.progress_percent),
    progressTotal: readOptionalText(job.progress_total, 64),
    progressSpeed: readOptionalText(job.progress_speed, 64),
    progressEta: readOptionalText(job.progress_eta, 64),
    progressMessage: readOptionalText(job.progress_message, 512),
    updatedAtUnix: readOptionalUnix(job.updated_at_unix),
  };
}

function readJobId(job: Record<string, unknown>): string | null {
  return (
    sanitizeText(typeof job.id === "string" ? job.id : null, {
      maxLength: 128,
      preserveWhitespace: false,
    }) ?? null
  );
}

function resolveJobPayload(
  payload: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!payload) {
    return null;
  }

  // Support both SSE/API shapes: { job: {...} } and flat { status, progress_* }.
  const wrapped =
    payload && typeof payload === "object" ? (payload.job as unknown) : null;
  if (wrapped && typeof wrapped === "object") {
    return wrapped as Record<string, unknown>;
  }

  if (typeof payload.status === "string") {
    return payload;
  }

  return null;
}

export class YtdlpApiClient extends CoreApiClient {
  private async fetchJob(
    jobId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<Record<string, unknown>>> {
    const response = await this.getJson(
      `${YTDLP_JOB_PATH}/${encodeURIComponent(jobId)}`,
      signal
    );

    if (!response.ok) {
      return response;
    }

    const payload = this.asObject(response.data);
    const job = resolveJobPayload(payload);

    if (!job) {
      return {
        ok: false,
        errorType: "UNKNOWN",
        message: "Unexpected status response.",
      };
    }

    return {
      ok: true,
      data: job,
    };
  }

  openJobStream(
    jobId: string,
    callbacks: YtdlpStreamCallbacks
  ): ApiResult<YtdlpStreamSubscription> {
    const target = `${YTDLP_JOB_PATH}/${encodeURIComponent(jobId)}${YTDLP_STREAM_SUFFIX}`;

    let eventSource: EventSource;

    try {
      eventSource = new EventSource(this.resolveUrl(target));
    } catch {
      return {
        ok: false,
        errorType: "UNKNOWN",
        message: "Could not start progress stream.",
      };
    }

    const close = (): void => {
      eventSource.close();
    };

    let handledCustomError = false;

    const onProgress = (event: MessageEvent): void => {
      try {
        const payload = this.asObject(JSON.parse(event.data));
        const job = resolveJobPayload(payload);
        if (!job) {
          return;
        }

        callbacks.onProgress(toSnapshot(job));
      } catch {
        callbacks.onError({
          errorType: "UNKNOWN",
          message: "Progress update was malformed.",
          shouldFallbackToPolling: true,
        });
      }
    };

    const onDone = (): void => {
      callbacks.onDone();
    };

    const onCustomError = (event: Event): void => {
      if (!(event instanceof MessageEvent)) {
        return;
      }

      handledCustomError = true;

      try {
        const payload = this.asObject(JSON.parse(event.data));
        const status =
          typeof payload?.status === "number" ? payload.status : undefined;
        const message =
          readOptionalText(payload?.message, 160) ??
          "Progress stream failed for this job.";

        callbacks.onError({
          errorType: status === 404 ? "BAD_REQUEST" : "UNKNOWN",
          message,
          shouldFallbackToPolling: false,
        });
      } catch {
        callbacks.onError({
          errorType: "UNKNOWN",
          message: "Progress stream failed for this job.",
          shouldFallbackToPolling: false,
        });
      }
    };

    const onTransportError = (): void => {
      if (handledCustomError) {
        return;
      }

      if (eventSource.readyState === EventSource.CONNECTING) {
        return;
      }

      callbacks.onError({
        errorType: "NETWORK_DOWN",
        message: "Live progress interrupted. Switching to backup checks.",
        shouldFallbackToPolling: true,
      });
    };

    eventSource.addEventListener("progress", onProgress as EventListener);
    eventSource.addEventListener("done", onDone as EventListener);
    eventSource.addEventListener("error", onCustomError as EventListener);
    eventSource.onerror = onTransportError;

    return {
      ok: true,
      data: {
        close,
      },
    };
  }

  async enqueue(
    url: string,
    captchaToken: string,
    signal?: AbortSignal
  ): Promise<ApiResult<string>> {
    const response = await this.postJson(
      YTDLP_ENQUEUE_PATH,
      {
        url,
        quality: "best",
        format: "mp4",
      },
      signal,
      this.getCaptchaHeaders(captchaToken)
    );

    if (!response.ok) {
      return response;
    }

    const payload = this.asObject(response.data);
    const job = this.asObject(payload?.job);
    const jobId = job ? readJobId(job) : null;

    if (!jobId) {
      return {
        ok: false,
        errorType: "BAD_REQUEST",
        message: "Could not start download.",
      };
    }

    return {
      ok: true,
      data: jobId,
    };
  }

  async getSites(signal?: AbortSignal): Promise<ApiResult<string[]>> {
    const response = await this.getJson(YTDLP_SITES_PATH, signal);

    if (!response.ok) {
      return response;
    }

    const payload = this.asObject(response.data);
    const sites = Array.isArray(payload?.sites) ? payload.sites : [];

    return {
      ok: true,
      data: sites.map(site => String(site)),
    };
  }

  async checkJobStatus(
    jobId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<YtdlpJobState>> {
    const jobResult = await this.fetchJob(jobId, signal);
    if (!jobResult.ok) {
      return jobResult;
    }

    const status = normalizeYtdlpJobStatus(readStatus(jobResult.data));
    const terminal = toYtdlpTerminalState(status);
    if (terminal === "fail") {
      return { ok: true, data: "fail" };
    }

    if (terminal === "success") {
      return { ok: true, data: "success" };
    }

    return { ok: true, data: "pending" };
  }

  async getJobSnapshot(
    jobId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<YtdlpJobSnapshot>> {
    const jobResult = await this.fetchJob(jobId, signal);
    if (!jobResult.ok) {
      return jobResult;
    }

    return {
      ok: true,
      data: toSnapshot(jobResult.data),
    };
  }

  async downloadFile(
    jobId: string,
    signal?: AbortSignal,
    options?: YtdlpDownloadOptions
  ): Promise<ApiResult<YtdlpDownloadFile>> {
    try {
      const response = await fetch(
        this.resolveUrl(`${YTDLP_DOWNLOAD_PATH}/${encodeURIComponent(jobId)}`),
        {
          method: "GET",
          signal,
        }
      );

      if (!response.ok) {
        return this.errorResultFromStatus(response.status);
      }

      const totalBytesHeader = response.headers.get("content-length");
      const parsedTotalBytes = totalBytesHeader
        ? Number.parseInt(totalBytesHeader, 10)
        : Number.NaN;
      const totalBytes =
        Number.isFinite(parsedTotalBytes) && parsedTotalBytes > 0
          ? parsedTotalBytes
          : null;

      const onProgress = options?.onProgress;
      const reader = response.body?.getReader();

      let blob: Blob;

      if (!reader) {
        blob = await response.blob();
        onProgress?.({
          loadedBytes: blob.size,
          totalBytes,
          percent:
            totalBytes && totalBytes > 0
              ? Math.max(0, Math.min(100, (blob.size / totalBytes) * 100))
              : null,
          bytesPerSecond: null,
        });
      } else {
        const contentType = response.headers.get("content-type") ?? undefined;
        const chunks: BlobPart[] = [];
        let loadedBytes = 0;
        const startedAt = performance.now();

        onProgress?.({
          loadedBytes,
          totalBytes,
          percent: totalBytes ? 0 : null,
          bytesPerSecond: null,
        });

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          if (!value) {
            continue;
          }

          const chunk = new Uint8Array(value.byteLength);
          chunk.set(value);
          chunks.push(chunk);
          loadedBytes += value.byteLength;

          const elapsedSeconds = Math.max(
            (performance.now() - startedAt) / 1000,
            0.001
          );
          const bytesPerSecond = loadedBytes / elapsedSeconds;

          onProgress?.({
            loadedBytes,
            totalBytes,
            percent:
              totalBytes && totalBytes > 0
                ? Math.max(0, Math.min(100, (loadedBytes / totalBytes) * 100))
                : null,
            bytesPerSecond: Number.isFinite(bytesPerSecond)
              ? bytesPerSecond
              : null,
          });
        }

        blob = new Blob(
          chunks,
          contentType ? { type: contentType } : undefined
        );
      }

      const contentDisposition = response.headers.get("content-disposition");
      const fileName =
        this.extractFileName(contentDisposition) ?? `${jobId}.mp4`;

      return {
        ok: true,
        data: {
          blob,
          fileName,
        },
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          ok: false,
          errorType: "ABORTED",
          message: "Request was canceled.",
        };
      }

      if (error instanceof TypeError) {
        return {
          ok: false,
          errorType: "NETWORK_DOWN",
          message: "Service unreachable.",
        };
      }

      return {
        ok: false,
        errorType: "UNKNOWN",
        message: "Request failed.",
      };
    }
  }
  private extractFileName(contentDisposition: string | null): string | null {
    const text = sanitizeText(contentDisposition, {
      maxLength: 512,
      preserveWhitespace: false,
    });

    if (!text) {
      return null;
    }

    const utf8Match = text.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const fileNameMatch = text.match(/filename="?([^";]+)"?/i);
    return fileNameMatch?.[1] ?? null;
  }
}
