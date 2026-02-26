import { sanitizeText } from "../validation";
import { CoreApiClient } from "../../utils/CoreApiClient";

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
  async enqueue(url: string, signal?: AbortSignal): Promise<string | null> {
    const response = await this.postJson(
      YTDLP_ENQUEUE_PATH,
      {
        url,
        quality: "best",
        format: "mp4",
      },
      signal
    );

    const payload = this.asObject(response.data);
    const job = this.asObject(payload?.job);
    const jobId = sanitizeText(typeof job?.id === "string" ? job.id : null, {
      maxLength: 128,
      preserveWhitespace: false,
    });

    if (response.status !== 202 || !jobId) {
      return null;
    }

    return jobId;
  }

  async checkJobStatus(
    jobId: string,
    signal?: AbortSignal
  ): Promise<YtdlpJobState> {
    const response = await this.getJson(
      `${YTDLP_JOB_PATH}/${encodeURIComponent(jobId)}`,
      signal
    );

    const payload = this.asObject(response.data);
    const job = this.asObject(payload?.job);

    if (!response.ok || !job) {
      return "unknown";
    }

    const status = readStatus(job);

    if (["failed", "error", "cancelled", "canceled"].includes(status)) {
      return "fail";
    }

    if (
      ["completed", "complete", "done", "finished", "success"].includes(status)
    ) {
      return "success";
    }

    return "pending";
  }

  getDownloadUrl(jobId: string): string {
    return this.resolveUrl(
      `${YTDLP_DOWNLOAD_PATH}/${encodeURIComponent(jobId)}`
    );
  }
}
