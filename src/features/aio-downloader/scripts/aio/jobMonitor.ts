import { asyncPoll } from "@/utils/asyncPoll";
import type {
  AioApiClient,
  AioJobSnapshot,
  AioStreamSubscription,
} from "./apiClient";
import type { ApiResult } from "@/utils/CoreApiClient";
import { AioUiController } from "./uiController";
import { toAioTerminalState } from "../../utils/aioStatus";
import {
  createAioProgressKey,
  buildAioProgressMessage,
  buildAioProgressMeta,
} from "../../utils/aioProgress";
import { getAioProgressLabel } from "../../utils/aioStatus";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

export type StreamMonitorResult =
  | "success"
  | "fail"
  | "fallback"
  | "handled-error"
  | "timeout";

export class AioJobMonitor {
  private activeStream: AioStreamSubscription | null = null;
  private lastProgressKey = "";

  constructor(
    private readonly apiClient: AioApiClient | undefined,
    private readonly ui: AioUiController,
    private readonly onApiFailure: (
      result: Extract<ApiResult<unknown>, { ok: false }>,
      options?: { shouldResetCaptcha?: boolean }
    ) => "silent" | "handled"
  ) {}

  public async monitorJob(
    jobId: string,
    signal: AbortSignal
  ): Promise<StreamMonitorResult> {
    let result = await this.monitorJobWithStream(jobId, signal);
    if (result === "fallback") {
      result = await this.monitorJobWithPolling(jobId, signal);
    }
    return result;
  }

  public closeActiveStream(): void {
    if (!this.activeStream) return;
    this.activeStream.close();
    this.activeStream = null;
  }

  public resetProgressKey(): void {
    this.lastProgressKey = "";
  }

  private applyProgressUpdate(snapshot: AioJobSnapshot): void {
    const nextKey = createAioProgressKey(snapshot);

    if (nextKey === this.lastProgressKey) {
      return;
    }

    this.lastProgressKey = nextKey;

    const label = getAioProgressLabel(snapshot.status);
    const message = buildAioProgressMessage(snapshot);

    this.ui.setPendingProgress(label, snapshot.progressPercent);
    this.ui.setPendingDetails(buildAioProgressMeta(snapshot));
    this.ui.transition("SERVER_DOWNLOADING", message);
  }

  private async monitorJobWithStream(
    jobId: string,
    signal: AbortSignal
  ): Promise<StreamMonitorResult> {
    if (!this.apiClient) return "handled-error";

    const apiClient = this.apiClient;

    return await new Promise<StreamMonitorResult>(resolve => {
      let lastSnapshot: AioJobSnapshot | null = null;
      let settled = false;

      const settle = (value: StreamMonitorResult): void => {
        if (settled) return;
        settled = true;
        this.closeActiveStream();
        resolve(value);
      };

      const streamResult = apiClient.openJobStream(jobId, {
        onProgress: snapshot => {
          if (settled || signal.aborted) return;
          lastSnapshot = snapshot;
          this.applyProgressUpdate(snapshot);
        },
        onDone: () => {
          if (settled || signal.aborted) return;
          void this.resolveFinalStatus(jobId, lastSnapshot, signal).then(
            settle,
            () => settle("handled-error")
          );
        },
        onError: error => {
          if (settled || signal.aborted) return;
          if (error.shouldFallbackToPolling) {
            this.ui.transition(
              "SERVER_DOWNLOADING",
              "Live server updates were interrupted. Switching to status checks..."
            );
            settle("fallback");
            return;
          }
          this.ui.setPrimaryStage("submit");
          this.ui.transition("ERROR", error.message);
          settle("handled-error");
        },
      });

      if (!streamResult.ok) {
        if (
          this.onApiFailure(streamResult, {
            shouldResetCaptcha: true,
          }) === "silent"
        ) {
          settle("handled-error");
          return;
        }
        settle("handled-error");
        return;
      }

      this.activeStream = streamResult.data;

      signal.addEventListener(
        "abort",
        () => {
          settle("handled-error");
        },
        { once: true }
      );
    });
  }

  private async monitorJobWithPolling(
    jobId: string,
    signal: AbortSignal
  ): Promise<StreamMonitorResult> {
    if (!this.apiClient) return "handled-error";

    const apiClient = this.apiClient;
    this.ui.setPendingProgress("Server status", null);
    this.ui.setPendingDetails(
      "Live progress is unavailable. Checking server status every few seconds."
    );
    this.ui.transition(
      "SERVER_DOWNLOADING",
      "Checking server processing status..."
    );

    const result = await asyncPoll<"success" | "fail" | "handled-error">({
      intervalMs: POLL_INTERVAL_MS,
      maxAttempts: MAX_POLL_ATTEMPTS,
      signal,
      step: async () => {
        const statusResult = await apiClient.checkJobStatus(jobId, signal);

        if (!statusResult.ok) {
          if (
            this.onApiFailure(statusResult, {
              shouldResetCaptcha: true,
            }) === "silent"
          ) {
            return { done: true, value: "handled-error" };
          }
          return { done: true, value: "handled-error" };
        }

        if (statusResult.data === "fail") return { done: true, value: "fail" };
        if (statusResult.data === "success")
          return { done: true, value: "success" };

        return { done: false };
      },
    });

    if (!result) return "timeout";
    return result;
  }

  private async resolveFinalStatus(
    jobId: string,
    lastSnapshot: AioJobSnapshot | null,
    signal: AbortSignal
  ): Promise<StreamMonitorResult> {
    if (!this.apiClient) return "handled-error";

    const snapshotResult = await this.apiClient.getJobSnapshot(jobId, signal);
    if (!snapshotResult.ok) {
      if (
        this.onApiFailure(snapshotResult, {
          shouldResetCaptcha: true,
        }) === "silent"
      ) {
        return "handled-error";
      }
      return "handled-error";
    }

    const terminal = toAioTerminalState(snapshotResult.data.status);
    if (terminal) return terminal;

    const fallbackTerminal = toAioTerminalState(lastSnapshot?.status ?? "");
    if (fallbackTerminal) return fallbackTerminal;

    return "timeout";
  }
}
