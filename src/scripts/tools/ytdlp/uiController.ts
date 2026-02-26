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
  private previouslyFocusedElement: HTMLElement | null = null;

  private static readonly focusableSelector = [
    "a[href]",
    "area[href]",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
    "iframe",
    "object",
    "embed",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

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
    this.previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    this.refs.captchaModal.classList.remove("hidden");
    this.refs.captchaModal.classList.add("flex");
    this.refs.captchaModal.setAttribute("aria-hidden", "false");

    queueMicrotask(() => {
      if (this.refs.closeDialogBtn.disabled) {
        this.refs.captchaModal.focus({ preventScroll: true });
        return;
      }

      this.refs.closeDialogBtn.focus({ preventScroll: true });
    });
  }

  closeCaptchaModal(): void {
    this.refs.captchaModal.classList.add("hidden");
    this.refs.captchaModal.classList.remove("flex");
    this.refs.captchaModal.setAttribute("aria-hidden", "true");

    const target = this.previouslyFocusedElement;
    this.previouslyFocusedElement = null;

    if (target && target.isConnected) {
      target.focus({ preventScroll: true });
    }
  }

  handleCaptchaModalKeydown(event: KeyboardEvent): void {
    if (this.refs.captchaModal.classList.contains("hidden")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.closeCaptchaModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusables = this.getFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      this.refs.captchaModal.focus({ preventScroll: true });
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const elements = Array.from(
      this.refs.captchaModal.querySelectorAll(
        YtdlpUiController.focusableSelector
      )
    ) as HTMLElement[];

    return elements.filter(element => {
      if (element.getAttribute("aria-hidden") === "true") {
        return false;
      }

      if (element.hasAttribute("disabled")) {
        return false;
      }

      return (
        element.offsetParent !== null || element === document.activeElement
      );
    });
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
