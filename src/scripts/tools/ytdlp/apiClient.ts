import { sanitizeText } from "../validation";
import { CoreApiClient, type ApiResult } from "../../../utils/CoreApiClient";

const YTDLP_ENQUEUE_PATH = "/api/v1/ytdlp";
const YTDLP_JOB_PATH = "/api/v1/ytdlp/jobs";
const YTDLP_DOWNLOAD_PATH = "/api/v1/ytdlp/download";

export type YtdlpJobState = "pending" | "success" | "fail" | "unknown";

function readStatus(job: Record<string, unknown>): string {
  return (
    sanitizeText(typeof job.status === "string" ? job.status : null, {
      maxLength: 80,
      preserveWhitespace: false,
    }) ?? ""
  ).toLowerCase();
}

export class YtdlpApiClient extends CoreApiClient {
  async enqueue(url: string, signal?: AbortSignal): Promise<ApiResult<string>> {
    const response = await this.postJson(
      YTDLP_ENQUEUE_PATH,
      {
        url,
        quality: "best",
        format: "mp4",
      },
      signal
    );

    if (!response.ok) {
      return response;
    }

    const payload = this.asObject(response.data);
    const job = this.asObject(payload?.job);
    const jobId = sanitizeText(typeof job?.id === "string" ? job.id : null, {
      maxLength: 128,
      preserveWhitespace: false,
    });

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

  async checkJobStatus(
    jobId: string,
    signal?: AbortSignal
  ): Promise<ApiResult<YtdlpJobState>> {
    const response = await this.getJson(
      `${YTDLP_JOB_PATH}/${encodeURIComponent(jobId)}`,
      signal
    );

    if (!response.ok) {
      return response;
    }

    const payload = this.asObject(response.data);
    const job = this.asObject(payload?.job);

    if (!job) {
      return {
        ok: false,
        errorType: "UNKNOWN",
        message: "Unexpected status response.",
      };
    }

    const status = readStatus(job);

    if (["failed", "error", "cancelled", "canceled"].includes(status)) {
      return { ok: true, data: "fail" };
    }

    if (
      ["completed", "complete", "done", "finished", "success"].includes(status)
    ) {
      return { ok: true, data: "success" };
    }

    return { ok: true, data: "pending" };
  }

  getDownloadUrl(jobId: string): string {
    return this.resolveUrl(
      `${YTDLP_DOWNLOAD_PATH}/${encodeURIComponent(jobId)}`
    );
  }
}
