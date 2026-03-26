import { createToolProgressBar } from "./progressBar";

export type ToolResponseState =
  | "idle"
  | "pending"
  | "downloading"
  | "success"
  | "fail"
  | "disabled";

type ToolResponseDockOptions = {
  title?: string;
  hiddenOnIdle?: boolean;
  onStateChange?: (state: ToolResponseState) => void;
  minStateDurationMs?: number;
};

const TOOL_RESPONSE_STATE_STYLE: Record<ToolResponseState, string> = {
  idle: "border-border/70 bg-muted/20 text-foreground/85",
  pending: "border-amber-500/60 bg-amber-500/10 text-amber-300",
  downloading: "border-amber-500/70 bg-amber-500/14 text-amber-300",
  success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-300",
  fail: "border-rose-500/60 bg-rose-500/10 text-rose-300",
  disabled: "border-slate-500/60 bg-slate-500/10 text-slate-300",
};

const TOOL_RESPONSE_STATE_LABEL: Record<ToolResponseState, string> = {
  idle: "Ready",
  pending: "Pending",
  downloading: "Downloading",
  success: "Success",
  fail: "Failed",
  disabled: "Disabled",
};

const TOOL_PROGRESS_BAR_STYLE: Record<ToolResponseState, string> = {
  idle: "bg-foreground/35",
  pending: "bg-amber-400",
  downloading: "bg-amber-400",
  success: "bg-emerald-400",
  fail: "bg-rose-400",
  disabled: "bg-slate-400",
};

export type ToolResponseDock = {
  setState: (
    state: ToolResponseState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ) => void;
  setProgress: (percent: number | null, meta: string) => void;
  clearProgress: () => void;
  getState: () => ToolResponseState;
  hide: () => void;
  clear: () => void;
};

export function createToolResponseDock(
  host: HTMLElement,
  options?: ToolResponseDockOptions
): ToolResponseDock {
  const title = options?.title ?? "Response";
  const hiddenOnIdle = options?.hiddenOnIdle ?? true;
  const minStateDurationMs = options?.minStateDurationMs ?? 180;

  host.classList.remove("hidden");
  host.innerHTML = `
    <section id="tool-response-status" class="rounded-2xl border px-3 py-2 text-sm transition-colors ${TOOL_RESPONSE_STATE_STYLE.idle}" aria-live="polite">
      <div class="flex items-center gap-2 text-xs opacity-85">
        <span class="h-px flex-1 bg-current/40"></span>
        <span class="font-semibold tracking-wide uppercase">${title}</span>
        <span class="h-px flex-1 bg-current/40"></span>
        <button
          id="tool-response-dismiss"
          type="button"
          class="rounded-md border border-current/35 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide opacity-85 transition-opacity hover:opacity-100"
        >
          Cancel
        </button>
      </div>

      <div class="mt-2 flex items-start justify-between gap-2">
        <span id="tool-response-label" class="text-xs font-semibold tracking-wide uppercase">${TOOL_RESPONSE_STATE_LABEL.idle}</span>
        <span class="text-[11px] opacity-70">Tool Status</span>
      </div>
      <p id="tool-response-message" class="mt-1 text-xs opacity-90">Awaiting action.</p>

      <div id="tool-response-progress-wrap" class="mt-2 hidden" aria-live="polite" aria-atomic="true">
        <div class="mb-1 text-[11px] opacity-80">
          <span id="tool-response-progress-meta" class="block truncate">Waiting for progress...</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-current/15">
          <div
            id="tool-response-progress-bar"
            class="h-full w-0 rounded-full ${TOOL_PROGRESS_BAR_STYLE.idle} transition-[width] duration-200 ease-linear"
            role="progressbar"
            aria-label="Task progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
          ></div>
        </div>
      </div>
    </section>
  `;

  const statusEl = host.querySelector(
    "#tool-response-status"
  ) as HTMLElement | null;
  const labelEl = host.querySelector(
    "#tool-response-label"
  ) as HTMLSpanElement | null;
  const messageEl = host.querySelector(
    "#tool-response-message"
  ) as HTMLParagraphElement | null;
  const dismissBtn = host.querySelector(
    "#tool-response-dismiss"
  ) as HTMLButtonElement | null;
  const progressWrapEl = host.querySelector(
    "#tool-response-progress-wrap"
  ) as HTMLElement | null;
  const progressBarEl = host.querySelector(
    "#tool-response-progress-bar"
  ) as HTMLElement | null;
  const progressMetaEl = host.querySelector(
    "#tool-response-progress-meta"
  ) as HTMLElement | null;

  if (
    !statusEl ||
    !labelEl ||
    !messageEl ||
    !dismissBtn ||
    !progressWrapEl ||
    !progressBarEl ||
    !progressMetaEl
  ) {
    return {
      setState: () => {},
      setProgress: () => {},
      clearProgress: () => {},
      getState: () => "idle",
      hide: () => host.classList.add("hidden"),
      clear: () => {
        host.innerHTML = "";
        host.classList.add("hidden");
      },
    };
  }

  let currentState: ToolResponseState = "idle";
  let lastStateChangeAt = 0;
  let pendingStateTimer: number | null = null;
  let pendingPayload: {
    state: ToolResponseState;
    message: string;
    showWhenIdle: boolean;
  } | null = null;

  const progressBar = createToolProgressBar({
    wrapEl: progressWrapEl,
    barEl: progressBarEl,
    metaEl: progressMetaEl,
  });

  const applyProgressTone = (state: ToolResponseState): void => {
    progressBarEl.classList.remove(
      TOOL_PROGRESS_BAR_STYLE.idle,
      TOOL_PROGRESS_BAR_STYLE.pending,
      TOOL_PROGRESS_BAR_STYLE.downloading,
      TOOL_PROGRESS_BAR_STYLE.success,
      TOOL_PROGRESS_BAR_STYLE.fail,
      TOOL_PROGRESS_BAR_STYLE.disabled
    );
    progressBarEl.classList.add(TOOL_PROGRESS_BAR_STYLE[state]);
  };

  const setVisible = (visible: boolean) => {
    host.classList.toggle("hidden", !visible);
  };

  const applyState = (
    state: ToolResponseState,
    message: string,
    showWhenIdle: boolean
  ) => {
    currentState = state;
    lastStateChangeAt = Date.now();
    statusEl.className = `rounded-2xl border px-3 py-2 text-sm transition-colors ${TOOL_RESPONSE_STATE_STYLE[state]}`;
    labelEl.textContent = TOOL_RESPONSE_STATE_LABEL[state];
    messageEl.textContent = message;
    applyProgressTone(state);

    if (state !== "pending" && state !== "downloading") {
      progressBar.reset();
    }

    const persist = state === "disabled";
    dismissBtn.disabled = persist;
    dismissBtn.classList.toggle("opacity-45", persist);
    dismissBtn.classList.toggle("cursor-not-allowed", persist);

    const shouldShow = !hiddenOnIdle || state !== "idle" || showWhenIdle;
    setVisible(shouldShow);
    options?.onStateChange?.(state);
  };

  const setProgress: ToolResponseDock["setProgress"] = (percent, meta) => {
    progressBar.update({ percent, meta });
  };

  const clearProgress: ToolResponseDock["clearProgress"] = () => {
    progressBar.reset();
  };

  const setState: ToolResponseDock["setState"] = (
    state,
    message,
    setOptions
  ) => {
    const showWhenIdle = setOptions?.showWhenIdle ?? false;

    if (pendingStateTimer !== null) {
      window.clearTimeout(pendingStateTimer);
      pendingStateTimer = null;
      pendingPayload = null;
    }

    if (state === currentState) {
      applyState(state, message, showWhenIdle);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastStateChangeAt;
    if (
      lastStateChangeAt > 0 &&
      elapsed < minStateDurationMs &&
      state !== "disabled"
    ) {
      pendingPayload = { state, message, showWhenIdle };
      pendingStateTimer = window.setTimeout(() => {
        if (!pendingPayload) return;
        const next = pendingPayload;
        pendingPayload = null;
        pendingStateTimer = null;
        applyState(next.state, next.message, next.showWhenIdle);
      }, minStateDurationMs - elapsed);
      return;
    }

    applyState(state, message, showWhenIdle);
  };

  dismissBtn.addEventListener("click", () => {
    if (currentState === "disabled") {
      return;
    }

    setState("idle", "Awaiting action.");
  });

  setState("idle", "Awaiting action.");

  return {
    setState,
    setProgress,
    clearProgress,
    getState: () => currentState,
    hide: () => setVisible(false),
    clear: () => {
      if (pendingStateTimer !== null) {
        window.clearTimeout(pendingStateTimer);
      }
      progressBar.reset();
      host.innerHTML = "";
      host.classList.add("hidden");
      options?.onStateChange?.("idle");
    },
  };
}
