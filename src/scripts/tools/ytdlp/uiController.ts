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
};

export class YtdlpUiController {
  private state: YtdlpUiState = "IDLE";
  private primaryStage: PrimaryStage = "submit";

  constructor(
    private readonly refs: YtdlpDomRefs,
    private readonly responseState: ResponseBridge,
    private readonly isCaptchaEnabled: boolean,
    private readonly hasCaptchaToken: () => boolean
  ) {}

  setPrimaryStage(stage: PrimaryStage): void {
    this.primaryStage = stage;

    const { submitBtn } = this.refs;

    if (stage === "submit") {
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
      submitBtn.textContent = "Downloading... Please wait";
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

    submitBtn.textContent = "Save File";
    submitBtn.classList.remove(
      "border-accent",
      "bg-accent/5",
      "text-accent",
      "hover:bg-accent",
      "hover:text-white"
    );
    submitBtn.classList.add(
      "bg-green-600",
      "border-green-600",
      "text-white",
      "hover:bg-green-700"
    );
  }

  getPrimaryStage(): PrimaryStage {
    return this.primaryStage;
  }

  openCaptchaModal(): void {
    this.refs.captchaModal.classList.remove("hidden");
    this.refs.captchaModal.classList.add("flex");
    this.refs.captchaModal.setAttribute("aria-hidden", "false");
  }

  closeCaptchaModal(): void {
    this.refs.captchaModal.classList.add("hidden");
    this.refs.captchaModal.classList.remove("flex");
    this.refs.captchaModal.setAttribute("aria-hidden", "true");
  }

  transition(
    nextState: YtdlpUiState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ): void {
    this.state = nextState;

    let dockState: ToolResponseState = "idle";
    if (
      nextState === "LOADING_CAPTCHA" ||
      nextState === "SUBMITTING" ||
      nextState === "POLLING"
    ) {
      dockState = "pending";
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
    const isPolling = this.state === "POLLING";
    const isDisabled = this.state === "DISABLED";

    this.refs.pasteBtn.disabled = isBusy;
    this.refs.clearBtn.disabled = isBusy;

    this.refs.submitBtn.disabled =
      isDisabled || isBusy || isPolling || !this.isCaptchaEnabled;

    if (this.primaryStage === "pending") {
      this.refs.submitBtn.disabled = true;
    }

    this.refs.verifyCaptchaBtn.disabled =
      isDisabled || isBusy || !this.isCaptchaEnabled || !this.hasCaptchaToken();

    this.refs.inputEl.toggleAttribute(
      "readonly",
      isDisabled && this.isCaptchaEnabled
    );
  }
}
