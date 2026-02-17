export type ToolResponseState =
  | "idle"
  | "pending"
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
  success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-300",
  fail: "border-rose-500/60 bg-rose-500/10 text-rose-300",
  disabled: "border-slate-500/60 bg-slate-500/10 text-slate-300",
};

const TOOL_RESPONSE_STATE_LABEL: Record<ToolResponseState, string> = {
  idle: "Ready",
  pending: "Pending",
  success: "Success",
  fail: "Failed",
  disabled: "Disabled",
};

export type ToolResponseDock = {
  setState: (
    state: ToolResponseState,
    message: string,
    options?: { showWhenIdle?: boolean }
  ) => void;
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

  if (!statusEl || !labelEl || !messageEl || !dismissBtn) {
    return {
      setState: () => {},
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

    const persist = state === "disabled";
    dismissBtn.disabled = persist;
    dismissBtn.classList.toggle("opacity-45", persist);
    dismissBtn.classList.toggle("cursor-not-allowed", persist);

    const shouldShow = !hiddenOnIdle || state !== "idle" || showWhenIdle;
    setVisible(shouldShow);
    options?.onStateChange?.(state);
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
    getState: () => currentState,
    hide: () => setVisible(false),
    clear: () => {
      if (pendingStateTimer !== null) {
        window.clearTimeout(pendingStateTimer);
      }
      host.innerHTML = "";
      host.classList.add("hidden");
      options?.onStateChange?.("idle");
    },
  };
}
