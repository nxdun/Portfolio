import { createToolResponseDock } from "../ui/responseDock";
import { readClipboardText } from "../clipboard";
import type { ToolTeardown, YtdlpToolOptions } from "../types";
import { validateYtdlpActionInput } from "./validation";
import type { YtdlpApiClient, YtdlpBrowserDownloadProgress } from "./apiClient";
import { CaptchaManager } from "../../../utils/captchaManager";
import type { ApiErrorType, ApiResult } from "../../../utils/CoreApiClient";
import type { YtdlpDomRefs } from "./dom";
import { YtdlpUiController } from "./uiController";
import type { CaptchaDialogController } from "../ui/captchaDialog";
import { YtdlpSitesController } from "./sitesController";
import { YtdlpJobMonitor, type StreamMonitorResult } from "./jobMonitor";

const SERVICE_UNAVAILABLE_MESSAGE =
  "Download service is currently unavailable due to maintenance. Please try again later.";
const SERVICE_UNREACHABLE_MESSAGE =
  "Download service is currently unreachable. It may be under maintenance. Please try again later.";

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "0 B";
  }

  if (value < 1024) {
    return `${Math.round(value)} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatBrowserDownloadMeta(
  progress: YtdlpBrowserDownloadProgress
): string {
  const transferredText = `Transferred ${formatBytes(progress.loadedBytes)}`;
  const sizeText =
    typeof progress.totalBytes === "number"
      ? `${transferredText} of ${formatBytes(progress.totalBytes)}`
      : transferredText;
  const speedText =
    typeof progress.bytesPerSecond === "number" && progress.bytesPerSecond > 0
      ? `Speed ${formatBytes(progress.bytesPerSecond)}/s`
      : "Speed calculating...";

  return `${sizeText} • ${speedText}`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export type YtdlpControllerConfig = {
  refs: YtdlpDomRefs;
  responseHost: HTMLElement;
  toolViewPanel: HTMLElement | null;
  options?: YtdlpToolOptions;
  isCaptchaFeatureEnabled: boolean;
  disabledReason: string;
  backendUrl?: string;
  apiClient?: YtdlpApiClient;
  captchaManager?: CaptchaManager;
  captchaDialog: CaptchaDialogController;
};

export class YtdlpToolController {
  private readonly responseDock: ReturnType<typeof createToolResponseDock>;
  private readonly ui: YtdlpUiController;
  private readonly sitesController: YtdlpSitesController;
  private readonly jobMonitor: YtdlpJobMonitor;

  private readonly cleanupCallbacks: Array<() => void> = [];
  private activeAbortController: AbortController | null = null;

  private pendingUrl = "";
  private readyJobId: string | null = null;
  private serviceDisabledMessage: string | null = null;
  private disposed = false;

  private readonly refs: YtdlpDomRefs;
  private readonly responseHost: HTMLElement;
  private readonly toolViewPanel: HTMLElement | null;
  private readonly options?: YtdlpToolOptions;
  private readonly isCaptchaFeatureEnabled: boolean;
  private readonly disabledReason: string;
  private readonly backendUrl?: string;
  private readonly apiClient?: YtdlpApiClient;
  private readonly captchaManager?: CaptchaManager;
  private readonly captchaDialog: CaptchaDialogController;

  constructor(config: YtdlpControllerConfig) {
    this.refs = config.refs;
    this.responseHost = config.responseHost;
    this.toolViewPanel = config.toolViewPanel;
    this.options = config.options;
    this.isCaptchaFeatureEnabled = config.isCaptchaFeatureEnabled;
    this.disabledReason = config.disabledReason;
    this.backendUrl = config.backendUrl;
    this.apiClient = config.apiClient;
    this.captchaManager = config.captchaManager;
    this.captchaDialog = config.captchaDialog;

    this.responseDock = createToolResponseDock(this.responseHost, {
      title: "AIO Downloader Response",
      hiddenOnIdle: true,
      minStateDurationMs: 220,
      progressVariant: "bar",
      hideProgressBarStates: ["browser-downloading"],
      onStateChange: state => {
        if (this.toolViewPanel) {
          this.toolViewPanel.dataset.responseState = state;
        }
      },
    });

    this.ui = new YtdlpUiController(
      this.refs,
      this.captchaDialog.refs.verifyBtn,
      {
        setDockState: (state, message, options) => {
          this.responseDock.setState(state, message, options);
        },
        setDockProgress: (percent, meta) => {
          this.responseDock.setProgress(percent, meta);
        },
        setDockProgressMeta: meta => {
          this.responseDock.setProgressMeta(meta);
        },
        clearDockProgress: () => {
          this.responseDock.clearProgress();
        },
      },
      this.isCaptchaFeatureEnabled,
      () => (this.captchaManager?.getToken().trim().length ?? 0) > 0
    );

    this.sitesController = new YtdlpSitesController(this.refs, this.apiClient);

    this.jobMonitor = new YtdlpJobMonitor(
      this.apiClient,
      this.ui,
      this.handleApiFailure.bind(this)
    );
  }

  init(): ToolTeardown {
    this.bindEvents();
    this.sitesController.init();

    if (typeof this.options?.url === "string") {
      this.refs.inputEl.value = this.options.url;
    }

    this.ui.setPrimaryStage("submit");

    if (!this.isCaptchaFeatureEnabled) {
      this.ui.transition("DISABLED", this.disabledReason);
      return () => this.destroy();
    }

    this.ui.transition("IDLE", "Paste a video URL and click Submit Download.", {
      showWhenIdle: true,
    });

    void this.ensureServiceHealth();

    return () => this.destroy();
  }

  handleCaptchaSolved(): void {
    this.ui.transition(
      "AWAITING_CAPTCHA",
      "Verification completed. Click Verify and Continue to start processing.",
      {
        showWhenIdle: true,
      }
    );
  }

  handleCaptchaExpired(): void {
    this.ui.transition(
      "ERROR",
      "Verification expired. Please complete captcha again."
    );
  }

  handleCaptchaError(): void {
    this.ui.transition("ERROR", "Verification failed to load. Please retry.");
  }

  private bindEvents(): void {
    this.addEventListener(this.refs.submitBtn, "click", () => {
      void this.handleSubmitClick();
    });

    this.addEventListener(this.refs.pasteBtn, "click", () => {
      void this.handlePasteClick();
    });

    this.addEventListener(this.refs.clearBtn, "click", () => {
      this.clearForm();
    });

    this.addEventListener(this.captchaDialog.refs.verifyBtn, "click", () => {
      void this.handleVerifyCaptchaClick();
    });
  }

  private handleApiFailure<TData>(
    result: Extract<ApiResult<TData>, { ok: false }>,
    options?: { shouldResetCaptcha?: boolean }
  ): "silent" | "handled" {
    if (result.errorType === "ABORTED") {
      return "silent";
    }

    this.ui.setPrimaryStage("submit");

    switch (result.errorType) {
      case "NETWORK_DOWN":
      case "SERVER_ERROR":
        this.disableService(result.errorType);
        return "handled";

      case "RATE_LIMITED":
        this.ui.transition(
          "ERROR",
          "Too many requests right now. Please wait and try again."
        );
        return "handled";

      case "UNAUTHORIZED":
        if (options?.shouldResetCaptcha) {
          this.captchaManager?.reset();
        }

        this.ui.transition(
          "ERROR",
          "Verification was rejected. Complete captcha again and resubmit."
        );
        return "handled";

      case "BAD_REQUEST":
        this.ui.transition(
          "ERROR",
          result.message ||
            "The request is invalid. Check the URL and try again."
        );
        return "handled";

      case "UNKNOWN":
      default:
        this.ui.transition(
          "ERROR",
          result.message || "The request failed unexpectedly. Please try again."
        );
        return "handled";
    }
  }

  private async handleSubmitClick(): Promise<void> {
    const stage = this.ui.getPrimaryStage();

    if (stage === "pending") {
      return;
    }

    if (this.isServiceDisabled()) {
      return;
    }

    const urlValidation = validateYtdlpActionInput("enqueue", {
      backendUrl: this.backendUrl,
      url: this.refs.inputEl.value,
    });

    if (!urlValidation.isValid) {
      if (!this.isCaptchaFeatureEnabled) {
        this.ui.transition("DISABLED", this.disabledReason);
        return;
      }

      this.ui.transition("ERROR", urlValidation.message);
      return;
    }

    this.pendingUrl = urlValidation.normalized?.url ?? this.refs.inputEl.value;
    this.readyJobId = null;
    this.ui.setPrimaryStage("submit");

    await this.openCaptchaDialog();
  }

  private async openCaptchaDialog(): Promise<void> {
    if (
      !this.apiClient ||
      !this.captchaManager ||
      !this.isCaptchaFeatureEnabled
    ) {
      this.ui.transition("DISABLED", this.disabledReason);
      return;
    }

    if (this.isServiceDisabled()) {
      return;
    }

    this.captchaDialog.open();
    this.ui.transition("LOADING_CAPTCHA", "Loading verification challenge...");

    const signal = this.beginOperation();

    try {
      const loaded = await this.captchaManager.ensureRendered(signal);
      if (!loaded) {
        if (!signal.aborted) {
          this.ui.transition(
            "ERROR",
            "Unable to load verification. Refresh and try again."
          );
        }
        return;
      }

      this.ui.transition(
        "AWAITING_CAPTCHA",
        "Complete captcha, then click Verify and Continue.",
        {
          showWhenIdle: true,
        }
      );
    } catch (error) {
      if (!isAbortError(error)) {
        this.ui.transition(
          "ERROR",
          "Unable to load verification. Refresh and try again."
        );
      }
    }
  }

  private async handleVerifyCaptchaClick(): Promise<void> {
    if (
      !this.apiClient ||
      !this.captchaManager ||
      !this.isCaptchaFeatureEnabled
    ) {
      this.ui.transition("DISABLED", this.disabledReason);
      return;
    }

    if (this.isServiceDisabled()) {
      return;
    }

    const apiClient = this.apiClient;

    const captchaValidation = validateYtdlpActionInput("verify-captcha", {
      backendUrl: this.backendUrl,
      captchaToken: this.captchaManager.getToken(),
    });

    if (!captchaValidation.isValid) {
      this.ui.transition("ERROR", captchaValidation.message);
      return;
    }

    const urlValidation = validateYtdlpActionInput("enqueue", {
      backendUrl: this.backendUrl,
      url: this.pendingUrl,
    });

    if (!urlValidation.isValid) {
      this.ui.transition("ERROR", urlValidation.message);
      return;
    }

    const signal = this.beginOperation();
    const captchaToken = captchaValidation.normalized?.captchaToken ?? "";

    try {
      this.ui.transition("SUBMITTING", "Submitting URL to server...");

      const enqueueResult = await apiClient.enqueue(
        urlValidation.normalized?.url ?? "",
        captchaToken,
        signal
      );

      if (!enqueueResult.ok) {
        if (
          this.handleApiFailure(enqueueResult, {
            shouldResetCaptcha: true,
          }) === "silent"
        ) {
          return;
        }

        return;
      }

      const jobId = enqueueResult.data;

      this.refs.inputEl.value =
        urlValidation.normalized?.url ?? this.refs.inputEl.value;
      this.captchaManager.reset();
      this.captchaDialog.close();

      this.readyJobId = null;
      this.jobMonitor.resetProgressKey();
      this.ui.setPrimaryStage("pending");
      this.ui.setPendingProgress("Server queue", null);
      this.ui.transition(
        "SERVER_DOWNLOADING",
        "Server accepted your request. Preparing media..."
      );

      const result = await this.jobMonitor.monitorJob(jobId, signal);
      await this.applyMonitorResult(result, jobId);
    } catch (error) {
      if (!isAbortError(error)) {
        this.readyJobId = null;
        this.disableService("NETWORK_DOWN");
      }
    }
  }

  private async applyMonitorResult(
    result: StreamMonitorResult,
    jobId: string
  ): Promise<void> {
    this.jobMonitor.resetProgressKey();

    if (result === "success") {
      this.readyJobId = jobId;
      this.ui.setPrimaryStage("pending");
      this.ui.transition(
        "BROWSER_DOWNLOADING",
        "Server processing complete. Starting browser download..."
      );
      await this.handleDownloadClick();
      return;
    }

    if (result === "fail") {
      this.readyJobId = null;
      this.ui.setPrimaryStage("submit");
      this.ui.transition(
        "ERROR",
        "Server could not prepare this video. Try a different URL."
      );
      return;
    }

    if (result === "handled-error") {
      this.readyJobId = null;
      return;
    }

    this.readyJobId = null;
    this.ui.setPrimaryStage("submit");
    this.ui.transition(
      "ERROR",
      "Server processing is taking too long. Please try again later."
    );
  }

  private async handleDownloadClick(): Promise<void> {
    if (this.isServiceDisabled()) {
      this.ui.setPrimaryStage("submit");
      return;
    }

    if (!this.apiClient || !this.readyJobId) {
      this.ui.setPrimaryStage("submit");
      this.ui.transition(
        "ERROR",
        "Download session expired. Submit the URL again."
      );
      return;
    }

    const signal = this.beginOperation();

    this.ui.setPrimaryStage("pending");
    this.ui.transition("BROWSER_DOWNLOADING", "Saving file to your browser...");
    this.ui.setPendingProgress("Saving to browser", null);

    const downloadResult = await this.apiClient.downloadFile(
      this.readyJobId,
      signal,
      {
        onProgress: progress => {
          this.ui.setPendingDetails(formatBrowserDownloadMeta(progress));
        },
      }
    );

    if (!downloadResult.ok) {
      this.readyJobId = null;

      if (
        this.handleApiFailure(downloadResult, {
          shouldResetCaptcha: true,
        }) === "silent"
      ) {
        return;
      }

      return;
    }

    this.triggerBrowserDownload(
      downloadResult.data.blob,
      downloadResult.data.fileName
    );

    this.readyJobId = null;
    this.ui.setPrimaryStage("submit");
    this.ui.transition(
      "READY",
      "Download Complete! Paste another URL to download more media."
    );
  }

  private triggerBrowserDownload(blob: Blob, fileName: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";

    document.body.append(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 5000);
  }

  private async handlePasteClick(): Promise<void> {
    if (
      this.ui.getState() === "SUBMITTING" ||
      this.ui.getState() === "LOADING_CAPTCHA"
    ) {
      return;
    }

    const signal = this.beginOperation();

    this.ui.transition("SUBMITTING", "Reading URL from clipboard...");

    const result = await readClipboardText();
    if (signal.aborted || this.disposed) {
      return;
    }

    if (!result.ok) {
      if (result.reason === "unavailable") {
        this.refs.inputEl.focus();
        this.ui.transition(
          "ERROR",
          "Clipboard access is unavailable. URL field is focused. Press Ctrl+V to paste."
        );
        return;
      }

      this.ui.transition(
        "ERROR",
        "Could not read clipboard. Please paste manually."
      );
      return;
    }

    this.refs.inputEl.value = result.text;
    this.ui.transition("READY", "URL pasted from clipboard.");
  }

  private clearForm(): void {
    this.abortActiveOperation();
    this.refs.inputEl.value = "";
    this.pendingUrl = "";
    this.readyJobId = null;
    this.jobMonitor.resetProgressKey();
    this.ui.setPrimaryStage("submit");
    this.captchaDialog.close();
    this.captchaManager?.reset();
    this.ui.transition("READY", "Form reset. Ready for a new URL.");
  }

  private async ensureServiceHealth(): Promise<void> {
    if (this.disposed || !this.isCaptchaFeatureEnabled || !this.apiClient) {
      return;
    }

    const result = await this.apiClient.checkHealth("/health");

    if (this.disposed) {
      return;
    }

    if (!result.ok || !result.data) {
      this.disableService(result.ok ? undefined : result.errorType);
    }
  }

  private isServiceDisabled(): boolean {
    if (!this.serviceDisabledMessage) {
      return false;
    }

    this.ui.transition("DISABLED", this.serviceDisabledMessage);
    return true;
  }

  private disableService(errorType?: ApiErrorType): void {
    this.abortActiveOperation();

    this.serviceDisabledMessage =
      errorType === "NETWORK_DOWN"
        ? SERVICE_UNREACHABLE_MESSAGE
        : SERVICE_UNAVAILABLE_MESSAGE;

    this.ui.setPrimaryStage("submit");
    this.captchaDialog.close();
    this.captchaManager?.reset();
    this.ui.transition("DISABLED", this.serviceDisabledMessage);
  }

  private beginOperation(): AbortSignal {
    this.abortActiveOperation();
    this.activeAbortController = new AbortController();
    return this.activeAbortController.signal;
  }

  private abortActiveOperation(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    this.jobMonitor.closeActiveStream();
  }

  private addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    target.addEventListener(type, listener);
    this.cleanupCallbacks.push(() => {
      target.removeEventListener(type, listener);
    });
  }

  private destroy(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.abortActiveOperation();
    this.cleanupCallbacks.forEach(cleanup => cleanup());
    this.cleanupCallbacks.length = 0;
    this.captchaManager?.dispose();
    this.captchaDialog.close();
    this.captchaDialog.destroy();
    this.responseDock.clear();
    this.sitesController.destroy();

    if (this.toolViewPanel) {
      this.toolViewPanel.dataset.responseState = "idle";
    }

    this.responseHost.classList.add("hidden");
  }
}
