import type { ToolResponseState } from "../ui/responseDock";
import type { YtdlpDomRefs } from "./dom";

export type YtdlpUiState =
  | "IDLE"
  | "AWAITING_CAPTCHA"
  | "LOADING_CAPTCHA"
  | "SUBMITTING"
  | "POLLING"
  | "READY"
  | "ERROR"
  | "DISABLED";

export type PrimaryStage = "submit" | "pending" | "download";

type ResponseBridge = {
  setDockState: (
    state: ToolResponseState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ) => void;
  setDockProgress: (percent: number | null, meta: string) => void;
  clearDockProgress: () => void;
};

export class YtdlpUiController {
  private state: YtdlpUiState = "IDLE";
  private primaryStage: PrimaryStage = "submit";
  private pendingPercent: number | null = null;

  private readonly responseToneClasses = [
    "border-accent",
    "bg-accent/5",
    "text-accent",
    "hover:bg-accent",
    "hover:text-white",
    "border-amber-500",
    "bg-amber-500/10",
    "text-amber-300",
    "hover:bg-amber-500",
    "border-green-600",
    "bg-green-600",
    "text-white",
    "hover:bg-green-700",
    "border-rose-500",
    "bg-rose-500/10",
    "text-rose-300",
    "hover:bg-rose-500",
    "border-slate-500",
    "bg-slate-500/10",
    "text-slate-300",
    "hover:bg-slate-500",
  ] as const;

  constructor(
    private readonly refs: YtdlpDomRefs,
    private readonly verifyCaptchaBtn: HTMLButtonElement,
    private readonly responseState: ResponseBridge,
    private readonly isCaptchaEnabled: boolean,
    private readonly hasCaptchaToken: () => boolean
  ) {}

  private hideProgress(): void {
    this.pendingPercent = null;
    this.responseState.clearDockProgress();
  }

  private renderProgressBar(percent: number | null, meta: string): void {
    this.pendingPercent = percent;
    this.responseState.setDockProgress(percent, meta);
  }

  private applySubmitButtonTone(state: ToolResponseState): void {
    const submitBtn = this.refs.submitBtn;
    submitBtn.classList.remove(...this.responseToneClasses);

    if (state === "idle") {
      submitBtn.classList.add(
        "border-accent",
        "bg-accent/5",
        "text-accent",
        "hover:bg-accent",
        "hover:text-white"
      );
      return;
    }

    if (state === "pending" || state === "downloading") {
      submitBtn.classList.add(
        "border-amber-500",
        "bg-amber-500/10",
        "text-amber-300",
        "hover:bg-amber-500",
        "hover:text-white"
      );
      return;
    }

    if (state === "success") {
      submitBtn.classList.add(
        "border-green-600",
        "bg-green-600",
        "text-white",
        "hover:bg-green-700"
      );
      return;
    }

    if (state === "fail") {
      submitBtn.classList.add(
        "border-rose-500",
        "bg-rose-500/10",
        "text-rose-300",
        "hover:bg-rose-500",
        "hover:text-white"
      );
      return;
    }

    submitBtn.classList.add(
      "border-slate-500",
      "bg-slate-500/10",
      "text-slate-300",
      "hover:bg-slate-500",
      "hover:text-white"
    );
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

    this.renderProgressBar(this.pendingPercent, details);
  }

  setPrimaryStage(stage: PrimaryStage): void {
    this.primaryStage = stage;

    const { submitBtn } = this.refs;

    if (stage === "submit") {
      this.hideProgress();
      submitBtn.textContent = "Submit Download";
      submitBtn.classList.remove(
        "bg-green-600",
        "border-green-600",
        "text-white",
        "hover:bg-green-700"
      );
      submitBtn.classList.add(
        "border-accent",
        "bg-accent/5",
        "text-accent",
        "hover:bg-accent",
        "hover:text-white"
      );
      return;
    }

    if (stage === "pending") {
      submitBtn.textContent = "Please wait";
      this.renderProgressBar(null, "Waiting for progress...");
      return;
    }

    submitBtn.textContent = "Save File";
    this.hideProgress();
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
    } else if (nextState === "POLLING") {
      dockState = "downloading";
    } else if (nextState === "READY") {
      dockState = "success";
    } else if (nextState === "ERROR") {
      dockState = "fail";
    } else if (nextState === "DISABLED") {
      dockState = "disabled";
    }

    this.responseState.setDockState(dockState, message, options);
    this.applySubmitButtonTone(dockState);
    this.syncInteractiveState();
  }

  getState(): YtdlpUiState {
    return this.state;
  }

  syncInteractiveState(): void {
    const isBusy =
      this.state === "LOADING_CAPTCHA" || this.state === "SUBMITTING";
    const isPolling = this.state === "POLLING";
    const isDisabled = this.state === "DISABLED";

    this.refs.pasteBtn.disabled = isBusy;
    this.refs.clearBtn.disabled = isBusy;

    this.refs.submitBtn.disabled =
      isDisabled || isBusy || isPolling || !this.isCaptchaEnabled;

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
