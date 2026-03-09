import type { ToolResponseState } from "../ui/responseDock";
import type { Base64DomRefs } from "./dom";

export type Base64UiState = "IDLE" | "PROCESSING" | "READY" | "ERROR";

type ResponseBridge = {
  setDockState: (
    state: ToolResponseState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ) => void;
};

export class Base64UiController {
  private state: Base64UiState = "IDLE";

  constructor(
    private readonly refs: Base64DomRefs,
    private readonly responseState: ResponseBridge
  ) {}

  transition(
    nextState: Base64UiState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ): void {
    this.state = nextState;

    let dockState: ToolResponseState = "idle";
    if (nextState === "PROCESSING") {
      dockState = "pending";
    } else if (nextState === "READY") {
      dockState = "success";
    } else if (nextState === "ERROR") {
      dockState = "fail";
    }

    this.responseState.setDockState(dockState, message, options);
  }

  syncInteractiveState(isBusy: boolean): void {
    const {
      encodeBtn,
      decodeBtn,
      clearBtn,
      pasteBtn,
      copyBtn,
      swapBtn,
      trimCheckbox,
    } = this.refs;

    const actionButtons = [
      encodeBtn,
      decodeBtn,
      clearBtn,
      pasteBtn,
      copyBtn,
      swapBtn,
      trimCheckbox,
    ];

    actionButtons.forEach(button => {
      button.disabled = isBusy;
      button.classList.toggle("opacity-60", button.disabled);
      button.classList.toggle("cursor-not-allowed", button.disabled);
    });
  }

  getState(): Base64UiState {
    return this.state;
  }
}
