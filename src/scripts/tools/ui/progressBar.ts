export type ToolProgressBarRefs = {
  wrapEl: HTMLElement;
  barEl: HTMLElement;
  metaEl: HTMLElement;
};

export type ToolProgressBarUpdate = {
  percent: number | null;
  meta: string;
};

export type ToolProgressBar = {
  hide: () => void;
  reset: () => void;
  update: (next: ToolProgressBarUpdate) => void;
  getPercent: () => number | null;
};

const DEFAULT_META = "Waiting for progress...";

export function createToolProgressBar(
  refs: ToolProgressBarRefs
): ToolProgressBar {
  let lastMeta = "";
  let lastPercent: number | null = null;
  let peakPercent = 0;

  const applyMeta = (meta: string): void => {
    if (meta === lastMeta) {
      return;
    }

    refs.metaEl.textContent = meta;
    lastMeta = meta;
  };

  const applyPercent = (percent: number | null): void => {
    if (percent === null) {
      if (lastPercent === null) {
        return;
      }

      refs.barEl.style.width = "0%";
      refs.barEl.setAttribute("aria-valuenow", "0");
      lastPercent = null;
      peakPercent = 0;
      return;
    }

    const clamped = Math.max(0, Math.min(100, percent));
    const monotonic = Math.max(clamped, peakPercent);
    const rounded = Math.round(monotonic);

    if (lastPercent !== null && rounded === Math.round(lastPercent)) {
      peakPercent = monotonic;
      return;
    }

    refs.barEl.style.width = `${rounded}%`;
    refs.barEl.setAttribute("aria-valuenow", rounded.toString());
    lastPercent = monotonic;
    peakPercent = monotonic;
  };

  const reset = (): void => {
    refs.wrapEl.classList.add("hidden");
    refs.barEl.style.width = "0%";
    refs.barEl.setAttribute("aria-valuenow", "0");
    refs.metaEl.textContent = DEFAULT_META;
    lastMeta = "";
    lastPercent = null;
    peakPercent = 0;
  };

  return {
    hide: () => {
      refs.wrapEl.classList.add("hidden");
    },
    reset,
    update: next => {
      refs.wrapEl.classList.remove("hidden");
      applyPercent(next.percent);
      applyMeta(next.meta || DEFAULT_META);
    },
    getPercent: () => lastPercent,
  };
}
