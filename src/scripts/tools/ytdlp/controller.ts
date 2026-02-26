import { createToolResponseDock } from "../ui/responseDock";
import { readClipboardText } from "../clipboard";
import type { ToolTeardown, YtdlpToolOptions } from "../types";
import { validateYtdlpActionInput } from "./validation";
import { asyncPoll } from "../../../utils/asyncPoll";
import { YtdlpApiClient } from "./apiClient";
import { CaptchaManager } from "../../../utils/captchaManager";
import type { ApiResult } from "../../../utils/CoreApiClient";
import type { YtdlpDomRefs } from "./dom";
import { YtdlpUiController } from "./uiController";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

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
};

export class YtdlpToolController {
  private readonly responseDock: ReturnType<typeof createToolResponseDock>;
  private readonly ui: YtdlpUiController;

  private readonly cleanupCallbacks: Array<() => void> = [];
  private activeAbortController: AbortController | null = null;

  private pendingUrl = "";
  private readyDownloadUrl: string | null = null;
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

    this.responseDock = createToolResponseDock(this.responseHost, {
      title: "YouTube Downloader Response",
      hiddenOnIdle: true,
      minStateDurationMs: 220,
      onStateChange: state => {
        if (this.toolViewPanel) {
          this.toolViewPanel.dataset.responseState = state;
        }
      },
    });

    this.ui = new YtdlpUiController(
      this.refs,
      {
        setDockState: (state, message, options) => {
          this.responseDock.setState(state, message, options);
        },
      },
      this.isCaptchaFeatureEnabled,
      () => (this.captchaManager?.getToken().trim().length ?? 0) > 0
    );
  }

  init(): ToolTeardown {
    this.bindEvents();

    if (typeof this.options?.url === "string") {
      this.refs.inputEl.value = this.options.url;
    }

    this.ui.setPrimaryStage("submit");

    if (!this.isCaptchaFeatureEnabled) {
      this.ui.transition("DISABLED", this.disabledReason);
      return () => this.destroy();
    }

    this.ui.transition(
      "IDLE",
      "Paste a YouTube URL and click Submit Download.",
      {
        showWhenIdle: true,
      }
    );

    return () => this.destroy();
  }

  handleCaptchaSolved(): void {
    this.ui.transition(
      "AWAITING_CAPTCHA",
      "Captcha solved. Click Verify and Continue.",
      {
        showWhenIdle: true,
      }
    );
  }

  handleCaptchaExpired(): void {
    this.ui.transition("ERROR", "Captcha expired. Please solve it again.");
  }

  handleCaptchaError(): void {
    this.ui.transition("ERROR", "Captcha error. Please try again.");
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

    this.addEventListener(this.refs.verifyCaptchaBtn, "click", () => {
      void this.handleVerifyCaptchaClick();
    });

    this.addEventListener(this.refs.closeDialogBtn, "click", () => {
      this.ui.closeCaptchaModal();
    });

    this.addEventListener(this.refs.captchaModal, "click", event => {
      if (event.target === this.refs.captchaModal) {
        this.ui.closeCaptchaModal();
      }
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
        this.ui.transition(
          "DISABLED",
          "Service unreachable. Please try later."
        );
        return "handled";

      case "RATE_LIMITED":
        this.ui.transition(
          "ERROR",
          "Too many requests. Please wait before trying again."
        );
        return "handled";

      case "UNAUTHORIZED":
        if (options?.shouldResetCaptcha) {
          this.captchaManager?.reset();
        }

        this.ui.transition(
          "ERROR",
          "Verification failed. Please retry captcha and submit again."
        );
        return "handled";

      case "BAD_REQUEST":
        this.ui.transition(
          "ERROR",
          result.message ||
            "Invalid request. Please check the input and try again."
        );
        return "handled";

      case "UNKNOWN":
      default:
        this.ui.transition(
          "ERROR",
          result.message || "Request failed. Please try again."
        );
        return "handled";
    }
  }

  private async handleSubmitClick(): Promise<void> {
    const stage = this.ui.getPrimaryStage();

    if (stage === "pending") {
      return;
    }

    if (stage === "download" && this.readyDownloadUrl) {
      window.open(this.readyDownloadUrl, "_blank", "noopener,noreferrer");
      this.ui.transition("READY", "Download started.");
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
    this.readyDownloadUrl = null;
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

    this.ui.openCaptchaModal();

    const signal = this.beginOperation();

    try {
      const loaded = await this.captchaManager.ensureRendered(signal);
      if (!loaded) {
        if (!signal.aborted) {
          this.ui.transition(
            "ERROR",
            "Verification failed to load. Refresh and try again."
          );
        }
        return;
      }

      this.ui.transition(
        "AWAITING_CAPTCHA",
        "Solve captcha and verify to continue.",
        {
          showWhenIdle: true,
        }
      );
    } catch (error) {
      if (!isAbortError(error)) {
        this.ui.transition(
          "ERROR",
          "Verification failed to load. Refresh and try again."
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

    try {
      this.ui.transition("SUBMITTING", "Verifying...");
      const verifiedResult = await apiClient.verifyCaptcha(
        captchaValidation.normalized?.captchaToken ?? "",
        signal
      );

      if (!verifiedResult.ok) {
        if (
          this.handleApiFailure(verifiedResult, {
            shouldResetCaptcha: true,
          }) === "silent"
        ) {
          return;
        }

        return;
      }

      this.ui.transition("SUBMITTING", "Starting download...");

      const enqueueResult = await apiClient.enqueue(
        urlValidation.normalized?.url ?? "",
        signal
      );

      if (!enqueueResult.ok) {
        if (this.handleApiFailure(enqueueResult) === "silent") {
          return;
        }

        return;
      }

      const jobId = enqueueResult.data;

      this.refs.inputEl.value =
        urlValidation.normalized?.url ?? this.refs.inputEl.value;
      this.captchaManager.reset();
      this.ui.closeCaptchaModal();

      this.readyDownloadUrl = null;
      this.ui.setPrimaryStage("pending");
      this.ui.transition("POLLING", "Downloading... Please wait.");

      const result = await asyncPoll<"success" | "fail" | "handled-error">({
        intervalMs: POLL_INTERVAL_MS,
        maxAttempts: MAX_POLL_ATTEMPTS,
        signal,
        step: async () => {
          const statusResult = await apiClient.checkJobStatus(jobId, signal);

          if (!statusResult.ok) {
            if (this.handleApiFailure(statusResult) === "silent") {
              return { done: true, value: "handled-error" };
            }

            return { done: true, value: "handled-error" };
          }

          if (statusResult.data === "fail") {
            return { done: true, value: "fail" };
          }

          if (statusResult.data === "success") {
            return { done: true, value: "success" };
          }

          return { done: false };
        },
      });

      if (result === "success") {
        this.readyDownloadUrl = apiClient.getDownloadUrl(jobId);
        this.ui.setPrimaryStage("download");
        this.ui.transition("READY", "Download is ready.");
        return;
      }

      if (result === "fail") {
        this.ui.setPrimaryStage("submit");
        this.ui.transition("ERROR", "Download failed. Try another URL.");
        return;
      }

      if (result === "handled-error") {
        return;
      }

      this.ui.setPrimaryStage("submit");
      this.ui.transition(
        "ERROR",
        "Download is taking longer than expected. Please try again."
      );
    } catch (error) {
      if (!isAbortError(error)) {
        this.ui.setPrimaryStage("submit");
        this.ui.transition(
          "DISABLED",
          "Service unreachable. Please try later."
        );
      }
    }
  }

  private async handlePasteClick(): Promise<void> {
    if (
      this.ui.getState() === "SUBMITTING" ||
      this.ui.getState() === "LOADING_CAPTCHA"
    ) {
      return;
    }

    const signal = this.beginOperation();

    this.ui.transition("SUBMITTING", "Reading from clipboard...");

    const result = await readClipboardText();
    if (signal.aborted || this.disposed) {
      return;
    }

    if (!result.ok) {
      if (result.reason === "unavailable") {
        this.refs.inputEl.focus();
        this.ui.transition(
          "ERROR",
          "Clipboard access is unavailable. Focused URL field—press Ctrl+V to paste."
        );
        return;
      }

      this.ui.transition("ERROR", "Clipboard read failed.");
      return;
    }

    this.refs.inputEl.value = result.text;
    this.ui.transition("READY", "Pasted from clipboard.");
  }

  private clearForm(): void {
    this.abortActiveOperation();
    this.refs.inputEl.value = "";
    this.pendingUrl = "";
    this.readyDownloadUrl = null;
    this.ui.setPrimaryStage("submit");
    this.ui.closeCaptchaModal();
    this.captchaManager?.reset();
    this.ui.transition("READY", "Fields cleared.");
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
    this.ui.closeCaptchaModal();
    this.responseDock.clear();

    if (this.toolViewPanel) {
      this.toolViewPanel.dataset.responseState = "idle";
    }

    this.responseHost.classList.add("hidden");
  }
}
