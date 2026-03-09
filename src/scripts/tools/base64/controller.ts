import { decodeBase64, encodeBase64 } from "@/utils/base64";
import { createToolResponseDock } from "../ui/responseDock";
import { readClipboardText, writeClipboardText } from "../clipboard";
import type {
  Base64ToolAction,
  Base64ToolOptions,
  ToolTeardown,
} from "../types";
import { validateBase64ActionInput } from "./validation";
import type { Base64DomRefs } from "./dom";
import { Base64UiController } from "./uiController";

export type Base64ControllerConfig = {
  refs: Base64DomRefs;
  responseHost: HTMLElement;
  toolViewPanel: HTMLElement | null;
  options?: Base64ToolOptions;
};

export class Base64ToolController {
  private readonly responseDock: ReturnType<typeof createToolResponseDock>;
  private readonly ui: Base64UiController;

  private readonly refs: Base64DomRefs;
  private readonly responseHost: HTMLElement;
  private readonly toolViewPanel: HTMLElement | null;
  private readonly options?: Base64ToolOptions;

  private readonly cleanupCallbacks: Array<() => void> = [];
  private readonly pendingTimeouts = new Set<number>();

  private busy = false;
  private disposed = false;

  constructor(config: Base64ControllerConfig) {
    this.refs = config.refs;
    this.responseHost = config.responseHost;
    this.toolViewPanel = config.toolViewPanel;
    this.options = config.options;

    this.responseDock = createToolResponseDock(this.responseHost, {
      title: "Base64 Response",
      hiddenOnIdle: true,
      minStateDurationMs: 220,
      onStateChange: state => {
        if (this.toolViewPanel) {
          this.toolViewPanel.dataset.responseState = state;
        }
      },
    });

    this.ui = new Base64UiController(this.refs, {
      setDockState: (state, message, setOptions) => {
        this.responseDock.setState(state, message, setOptions);
      },
    });
  }

  init(): ToolTeardown {
    this.bindEvents();

    if (typeof this.options?.input === "string") {
      this.refs.inputEl.value = this.options.input;
    }

    if (typeof this.options?.output === "string") {
      this.refs.outputEl.value = this.options.output;
    }

    if (this.options?.action) {
      this.runAction(this.options.action);
    } else {
      this.ui.transition("IDLE", "Awaiting action.", {
        showWhenIdle: true,
      });
    }

    this.ui.syncInteractiveState(this.busy);

    return () => this.destroy();
  }

  private bindEvents(): void {
    this.addEventListener(this.refs.encodeBtn, "click", () => {
      this.runAction("encode");
    });

    this.addEventListener(this.refs.decodeBtn, "click", () => {
      this.runAction("decode");
    });

    this.addEventListener(this.refs.clearBtn, "click", () => {
      this.runAction("clear");
    });

    this.addEventListener(this.refs.swapBtn, "click", () => {
      this.handleSwap();
    });

    this.addEventListener(this.refs.pasteBtn, "click", () => {
      void this.handlePaste();
    });

    this.addEventListener(this.refs.copyBtn, "click", () => {
      void this.handleCopy();
    });
  }

  private runAction(action: Base64ToolAction): void {
    if (this.busy || this.disposed) {
      return;
    }

    let inputText = this.refs.inputEl.value;
    if (this.refs.trimCheckbox.checked) {
      inputText = inputText.trim();
    }

    const validation = validateBase64ActionInput(action, inputText);
    if (!validation.isValid) {
      this.ui.transition("ERROR", validation.message);
      return;
    }

    this.busy = true;
    this.ui.syncInteractiveState(this.busy);
    this.ui.transition("PROCESSING", "Processing request...");

    const timeoutId = window.setTimeout(() => {
      this.pendingTimeouts.delete(timeoutId);

      if (this.disposed) {
        return;
      }

      try {
        if (action === "encode") {
          this.refs.outputEl.value = encodeBase64(inputText);
          this.busy = false;
          this.ui.syncInteractiveState(this.busy);
          this.ui.transition("READY", "Encoded successfully.");
          return;
        }

        if (action === "decode") {
          this.refs.outputEl.value = decodeBase64(inputText);
          this.busy = false;
          this.ui.syncInteractiveState(this.busy);
          this.ui.transition("READY", "Decoded successfully.");
          return;
        }

        this.refs.inputEl.value = "";
        this.refs.outputEl.value = "";
        this.busy = false;
        this.ui.syncInteractiveState(this.busy);
        this.ui.transition("READY", "Fields cleared.");
        this.refs.inputEl.focus();
      } catch {
        this.busy = false;
        this.ui.syncInteractiveState(this.busy);
        this.ui.transition("ERROR", "Invalid Base64 input.");
      }
    }, 120);

    this.pendingTimeouts.add(timeoutId);
  }

  private handleSwap(): void {
    if (this.busy || this.disposed) {
      return;
    }

    const currentInput = this.refs.inputEl.value;
    const currentOutput = this.refs.outputEl.value;

    this.refs.inputEl.value = currentOutput;
    this.refs.outputEl.value = currentInput;

    this.ui.transition("IDLE", "Swapped Input & Output.", {
      showWhenIdle: true,
    });
  }

  private async handlePaste(): Promise<void> {
    if (this.busy || this.disposed) {
      return;
    }

    this.busy = true;
    this.ui.syncInteractiveState(this.busy);
    this.ui.transition("PROCESSING", "Reading from clipboard...");

    const result = await readClipboardText();

    if (this.disposed) {
      return;
    }

    this.busy = false;
    this.ui.syncInteractiveState(this.busy);

    if (!result.ok) {
      if (result.reason === "unavailable") {
        this.ui.transition("ERROR", "Clipboard access is unavailable.");
        return;
      }

      this.ui.transition("ERROR", "Clipboard read failed.");
      return;
    }

    this.refs.inputEl.value = result.text;
    this.ui.transition("READY", "Pasted from clipboard.");
  }

  private async handleCopy(): Promise<void> {
    if (this.busy || this.disposed) {
      return;
    }

    if (!this.refs.outputEl.value.trim()) {
      this.ui.transition("ERROR", "Output is empty.");
      return;
    }

    this.busy = true;
    this.ui.syncInteractiveState(this.busy);
    this.ui.transition("PROCESSING", "Copying to clipboard...");

    const result = await writeClipboardText(this.refs.outputEl.value);

    if (this.disposed) {
      return;
    }

    this.busy = false;
    this.ui.syncInteractiveState(this.busy);

    if (!result.ok) {
      if (result.reason === "unavailable") {
        this.ui.transition("ERROR", "Clipboard access is unavailable.");
        return;
      }

      this.ui.transition("ERROR", "Clipboard write failed.");
      return;
    }

    this.ui.transition("READY", "Copied to clipboard.");
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
    this.cleanupCallbacks.forEach(cleanup => cleanup());
    this.cleanupCallbacks.length = 0;

    this.pendingTimeouts.forEach(timeoutId => {
      window.clearTimeout(timeoutId);
    });
    this.pendingTimeouts.clear();

    this.busy = false;
    this.ui.syncInteractiveState(this.busy);
    this.responseDock.clear();

    if (this.toolViewPanel) {
      this.toolViewPanel.dataset.responseState = "idle";
    }

    this.responseHost.classList.add("hidden");
  }
}
