import { decodeBase64, encodeBase64 } from "@/utils/base64";
import { createToolResponseDock, type ToolResponseState } from "../ui/responseDock";
import type { Base64ToolAction, Base64ToolOptions, ToolMountUiSlots } from "../types";
import { validateBase64ActionInput } from "./validation";

export function mountBase64Tool(
  container: HTMLElement,
  options?: Base64ToolOptions,
  slots?: ToolMountUiSlots,
): void {
  container.innerHTML = `
    <section class="grid gap-5">
        <label class="grid gap-2" for="base64-input">
          <span class="text-sm font-medium">Input</span>
          <textarea
            id="base64-input"
            class="min-h-32 rounded-xl border border-border/70 bg-muted/15 px-3 py-2 text-sm leading-relaxed sm:min-h-36"
            placeholder="Enter text or Base64 value"
          ></textarea>
        </label>

        <div class="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <button
            id="base64-encode"
            type="button"
            class="rounded-lg border border-border/70 bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:text-accent"
          >
            Encode
          </button>
          <button
            id="base64-decode"
            type="button"
            class="rounded-lg border border-border/70 bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:text-accent"
          >
            Decode
          </button>
          <button
            id="base64-clear"
            type="button"
            class="rounded-lg border border-border/70 bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:text-accent"
          >
            Clear
          </button>
        </div>

        <label class="grid gap-2" for="base64-output">
          <span class="text-sm font-medium">Output</span>
          <textarea
            id="base64-output"
            readonly
            class="min-h-32 rounded-xl border border-border/70 bg-muted/15 px-3 py-2 text-sm leading-relaxed sm:min-h-36"
            placeholder="Result appears here"
          ></textarea>
        </label>
    </section>
  `;

  const inputEl = container.querySelector("#base64-input") as HTMLTextAreaElement | null;
  const outputEl = container.querySelector("#base64-output") as HTMLTextAreaElement | null;
  const encodeBtn = container.querySelector("#base64-encode") as HTMLButtonElement | null;
  const decodeBtn = container.querySelector("#base64-decode") as HTMLButtonElement | null;
  const clearBtn = container.querySelector("#base64-clear") as HTMLButtonElement | null;

  if (
    !inputEl ||
    !outputEl ||
    !encodeBtn ||
    !decodeBtn ||
    !clearBtn
  ) {
    return;
  }

  const responseHost = slots?.responseHost;
  if (!responseHost) {
    return;
  }

  const toolViewPanel = container.closest("#tool-view-panel") as HTMLElement | null;

  const actionButtons = [encodeBtn, decodeBtn, clearBtn];
  let busy = false;

  const responseDock = createToolResponseDock(responseHost, {
    title: "Base64 Response",
    hiddenOnIdle: true,
    minStateDurationMs: 220,
    onStateChange: state => {
      if (toolViewPanel) {
        toolViewPanel.dataset.responseState = state;
      }
    },
  });

  const setUiState = (state: ToolResponseState, message: string, setOptions?: { showWhenIdle?: boolean }) => {
    responseDock.setState(state, message, setOptions);

    const isDisabled = state === "disabled";
    actionButtons.forEach(button => {
      button.disabled = isDisabled || busy;
      button.classList.toggle("opacity-60", button.disabled);
      button.classList.toggle("cursor-not-allowed", button.disabled);
    });

    inputEl.toggleAttribute("readonly", isDisabled);
  };

  const runAction = (action: Base64ToolAction) => {
    if (busy) return;

    const validation = validateBase64ActionInput(action, inputEl.value);
    if (!validation.isValid) {
      setUiState("fail", validation.message);
      return;
    }

    busy = true;
    setUiState("pending", "Processing request...");

    window.setTimeout(() => {
      try {
        if (action === "encode") {
          outputEl.value = encodeBase64(inputEl.value);
          busy = false;
          setUiState("success", "Encoded successfully.");
          return;
        }

        if (action === "decode") {
          outputEl.value = decodeBase64(inputEl.value.trim());
          busy = false;
          setUiState("success", "Decoded successfully.");
          return;
        }

        inputEl.value = "";
        outputEl.value = "";
        busy = false;
        setUiState("success", "Fields cleared.");
        inputEl.focus();
      } catch {
        busy = false;
        setUiState("fail", "Invalid Base64 input.");
      }
    }, 120);
  };

  encodeBtn.addEventListener("click", () => {
    runAction("encode");
  });

  decodeBtn.addEventListener("click", () => {
    runAction("decode");
  });

  clearBtn.addEventListener("click", () => {
    runAction("clear");
  });

  if (typeof options?.input === "string") {
    inputEl.value = options.input;
  }

  if (typeof options?.output === "string") {
    outputEl.value = options.output;
  }

  if (options?.action) {
    runAction(options.action);
  } else {
    setUiState("idle", "Awaiting action.");
  }
}
