import type { ToolResponseState } from "../ui/responseDock";
import type { YtdlpDomRefs } from "./dom";

export type YtdlpUiState =
  | "IDLE"
  | "AWAITING_CAPTCHA"
  | "LOADING_CAPTCHA"
  | "SUBMITTING"
  | "SERVER_DOWNLOADING"
  | "BROWSER_DOWNLOADING"
  | "READY"
  | "ERROR"
  | "DISABLED";

export type PrimaryStage = "submit" | "pending";

type ResponseBridge = {
  setDockState: (
    state: ToolResponseState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ) => void;
  setDockProgress: (percent: number | null, meta: string) => void;
  setDockProgressMeta: (meta: string) => void;
  clearDockProgress: () => void;
};

export class YtdlpUiController {
  private state: YtdlpUiState = "IDLE";
  private primaryStage: PrimaryStage = "submit";

  constructor(
    private readonly refs: YtdlpDomRefs,
    private readonly verifyCaptchaBtn: HTMLButtonElement,
    private readonly responseState: ResponseBridge,
    private readonly isCaptchaEnabled: boolean,
    private readonly hasCaptchaToken: () => boolean
  ) {}

  private hideProgress(): void {
    this.responseState.clearDockProgress();
  }

  private renderProgressBar(percent: number | null, meta: string): void {
    this.responseState.setDockProgress(percent, meta);
  }

  setPendingProgress(label: string, percent: number | null): void {
    if (this.primaryStage !== "pending") {
      return;
    }

    const cleanedLabel = label.trim() || "Downloading";
    const percentText =
      typeof percent === "number" && Number.isFinite(percent)
        ? ` ${Math.round(percent)}%`
        : "";

    this.refs.submitBtn.textContent = "Please wait";
    this.renderProgressBar(percent, `${cleanedLabel}${percentText}`);
  }

  setPendingDetails(details: string): void {
    if (this.primaryStage !== "pending") {
      return;
    }

    this.responseState.setDockProgressMeta(details);
  }

  setPrimaryStage(stage: PrimaryStage): void {
    this.primaryStage = stage;

    const { submitBtn } = this.refs;

    if (stage === "submit") {
      this.hideProgress();
      submitBtn.textContent = "Submit Download";
      return;
    }

    if (stage === "pending") {
      submitBtn.textContent = "Please wait";
      this.renderProgressBar(null, "Waiting for progress...");
      return;
    }
  }

  getPrimaryStage(): PrimaryStage {
    return this.primaryStage;
  }

  transition(
    nextState: YtdlpUiState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ): void {
    this.state = nextState;

    let dockState: ToolResponseState = "idle";
    if (nextState === "LOADING_CAPTCHA" || nextState === "SUBMITTING") {
      dockState = "pending";
    } else if (nextState === "SERVER_DOWNLOADING") {
      dockState = "downloading";
    } else if (nextState === "BROWSER_DOWNLOADING") {
      dockState = "browser-downloading";
    } else if (nextState === "READY") {
      dockState = "success";
    } else if (nextState === "ERROR") {
      dockState = "fail";
    } else if (nextState === "DISABLED") {
      dockState = "disabled";
    }

    this.responseState.setDockState(dockState, message, options);
    this.syncInteractiveState();
  }

  getState(): YtdlpUiState {
    return this.state;
  }

  syncInteractiveState(): void {
    const isBusy =
      this.state === "LOADING_CAPTCHA" || this.state === "SUBMITTING";
    const isDownloading =
      this.state === "SERVER_DOWNLOADING" ||
      this.state === "BROWSER_DOWNLOADING";
    const isDisabled = this.state === "DISABLED";

    this.refs.pasteBtn.disabled = isBusy;
    this.refs.clearBtn.disabled = isBusy;

    this.refs.submitBtn.disabled =
      isDisabled || isBusy || isDownloading || !this.isCaptchaEnabled;

    if (this.primaryStage === "pending") {
      this.refs.submitBtn.disabled = true;
    }

    this.verifyCaptchaBtn.disabled =
      isDisabled || isBusy || !this.isCaptchaEnabled || !this.hasCaptchaToken();

    this.refs.inputEl.toggleAttribute(
      "readonly",
      isDisabled && this.isCaptchaEnabled
    );
  }
}
