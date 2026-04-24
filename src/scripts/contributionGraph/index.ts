import { ContributionsApiClient } from "./apiClient";
import type {
  ContributionCell,
  ContributionGraphResponse,
  ContributionGraphState,
  ContributionLegendItem,
} from "./types";

const hostSelector = "[data-contribution-graph]";
const activeControllers = new Set<AbortController>();
const initializedHosts = new WeakSet<HTMLElement>();
const weekdayShortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const networkTimeoutMs = 12000;

const normalizeHexColor = (value: string) =>
  value.startsWith("#") ? value : `#${value}`;

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
};

const isContributionResponse = (
  payload: unknown
): payload is ContributionGraphResponse => {
  const root = toRecord(payload);
  if (!root) return false;

  const summary = toRecord(root.summary);
  const meta = toRecord(root.meta);

  return (
    typeof root.username === "string" &&
    Array.isArray(root.legend) &&
    Array.isArray(root.months) &&
    Array.isArray(root.cells) &&
    !!summary &&
    typeof summary.totalContributions === "number" &&
    typeof summary.totalWeeks === "number" &&
    typeof summary.maxDailyCount === "number" &&
    !!meta &&
    typeof meta.cached === "boolean"
  );
};

const deferClientWork = (task: () => void) => {
  requestAnimationFrame(() => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => task(), { timeout: 1000 });
      return;
    }

    setTimeout(task, 180);
  });
};

const getLegendLabel = (
  legend: ContributionLegendItem[],
  level: number
): string => legend.find(item => item.level === level)?.label ?? "Unknown";

const toCellAriaLabel = (cell: ContributionCell, legendLabel: string) => {
  const contributionWord = cell.count === 1 ? "contribution" : "contributions";
  return `${cell.date}, ${cell.count} ${contributionWord}, ${legendLabel}`;
};

const setState = (host: HTMLElement, state: ContributionGraphState) => {
  host.dataset.contributionGraphState = state;
};

const setStatusMessage = (host: HTMLElement, message: string) => {
  const status = host.querySelector<HTMLElement>("[data-contribution-status]");
  if (!status) return;
  status.textContent = message;
};

const renderMonths = (host: HTMLElement, data: ContributionGraphResponse) => {
  const months = host.querySelector<HTMLElement>("[data-contribution-months]");
  if (!months) return;

  months.textContent = "";
  data.months.forEach(month => {
    const node = document.createElement("span");
    node.className = "hero-contribution-month";
    node.textContent = month.label;
    node.style.gridColumnStart = String(month.weekIndex + 1);
    months.appendChild(node);
  });
};

const renderWeekdays = (host: HTMLElement) => {
  const weekdays = host.querySelector<HTMLElement>("[data-contribution-weekdays]");
  if (!weekdays) return;

  weekdays.textContent = "";
  [1, 3, 5].forEach(dayIndex => {
    const node = document.createElement("span");
    node.className = "hero-contribution-weekday";
    node.style.gridRowStart = String(dayIndex + 1);
    node.textContent = weekdayShortNames[dayIndex];
    weekdays.appendChild(node);
  });
};

const renderLegend = (host: HTMLElement, data: ContributionGraphResponse) => {
  const legend = host.querySelector<HTMLElement>("[data-contribution-legend]");
  if (!legend) return;

  legend.textContent = "";
  data.legend.forEach(item => {
    const wrapper = document.createElement("span");
    const swatch = document.createElement("span");
    const label = document.createElement("span");

    wrapper.className = "hero-contribution-legend-item";
    swatch.className = "hero-contribution-legend-swatch";
    label.className = "hero-contribution-legend-label";

    swatch.style.setProperty("--contribution-color", normalizeHexColor(item.color));
    label.textContent = item.label;

    wrapper.appendChild(swatch);
    wrapper.appendChild(label);
    legend.appendChild(wrapper);
  });
};

const renderSummary = (host: HTMLElement, data: ContributionGraphResponse) => {
  const summary = host.querySelector<HTMLElement>("[data-contribution-summary]");
  if (!summary) return;

  const cacheStatus = data.meta.cached ? "Cached" : "Live";
  summary.textContent = `${data.summary.totalContributions} contributions in ${data.summary.totalWeeks} weeks (${cacheStatus})`;
};

const bindInteraction = (host: HTMLElement) => {
  const grid = host.querySelector<HTMLElement>("[data-contribution-grid]");
  const tooltip = host.querySelector<HTMLElement>("[data-contribution-tooltip]");

  if (!grid || !tooltip) return;

  const idleMessage = "Hover or focus a day to inspect contribution details.";
  tooltip.textContent = idleMessage;

  const updateTooltip = (value: string) => {
    tooltip.textContent = value;
  };

  grid.addEventListener("pointerover", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".hero-contribution-cell"
    );
    if (!target) return;

    updateTooltip(target.dataset.tooltip || idleMessage);
  });

  grid.addEventListener("focusin", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".hero-contribution-cell"
    );
    if (!target) return;

    updateTooltip(target.dataset.tooltip || idleMessage);
  });

  grid.addEventListener("pointerleave", () => {
    updateTooltip(idleMessage);
  });

  grid.addEventListener("focusout", () => {
    updateTooltip(idleMessage);
  });
};

const renderCells = (host: HTMLElement, data: ContributionGraphResponse) => {
  const grid = host.querySelector<HTMLElement>("[data-contribution-grid]");
  if (!grid) return;

  const fragment = document.createDocumentFragment();
  data.cells.forEach(cell => {
    const item = document.createElement("button");
    const legendLabel = getLegendLabel(data.legend, cell.level);
    const ariaLabel = toCellAriaLabel(cell, legendLabel);

    item.type = "button";
    item.className = "hero-contribution-cell";
    item.style.gridColumnStart = String(cell.weekIndex + 1);
    item.style.gridRowStart = String(cell.weekday + 1);
    item.style.setProperty("--contribution-color", normalizeHexColor(cell.color));
    item.setAttribute("aria-label", ariaLabel);
    item.setAttribute("title", ariaLabel);
    item.dataset.tooltip = ariaLabel;

    fragment.appendChild(item);
  });

  grid.textContent = "";
  grid.appendChild(fragment);

  const totalWeeks = Math.max(1, data.summary.totalWeeks);
  host.style.setProperty("--contribution-weeks", String(totalWeeks));
};

const getLoaderElement = (host: HTMLElement) =>
  host.querySelector<HTMLElement>("[data-loader]");

const settleLoaderMotion = (host: HTMLElement) => {
  const loader = getLoaderElement(host);
  if (!loader) return;

  loader.dataset.loaderAnimation = "false";
  loader.dataset.loaderSweep = "false";
};

const fetchContributionGraph = async (
  client: ContributionsApiClient,
  signal: AbortSignal
) => {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), networkTimeoutMs);

  signal.addEventListener("abort", () => timeoutController.abort(), { once: true });

  try {
    const combinedSignal = timeoutController.signal;
    return await client.getContributionGraph(combinedSignal);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const resolveHost = async (host: HTMLElement) => {
  const configuredBaseUrl = (import.meta.env.PUBLIC_TOOLS_BACKEND_URL ?? "").trim();

  if (!configuredBaseUrl || !isHttpUrl(configuredBaseUrl)) {
    setState(host, "error");
    settleLoaderMotion(host);
    setStatusMessage(host, "Contribution service is unavailable right now.");
    return;
  }

  const controller = new AbortController();
  activeControllers.add(controller);

  const client = new ContributionsApiClient(configuredBaseUrl);

  try {
    const result = await fetchContributionGraph(client, controller.signal);
    if (controller.signal.aborted) return;

    if (!result.ok) {
      if (result.errorType === "ABORTED") return;

      setState(host, "error");
      settleLoaderMotion(host);
      setStatusMessage(host, "Contribution activity is temporarily unavailable.");
      return;
    }

    if (!isContributionResponse(result.data)) {
      setState(host, "error");
      settleLoaderMotion(host);
      setStatusMessage(host, "Contribution activity is temporarily unavailable.");
      return;
    }

    const payload = result.data;
    if (payload.cells.length === 0) {
      renderSummary(host, payload);
      renderLegend(host, payload);
      setState(host, "empty");
      settleLoaderMotion(host);
      setStatusMessage(host, "No contribution activity yet.");
      return;
    }

    renderMonths(host, payload);
    renderWeekdays(host);
    renderCells(host, payload);
    renderSummary(host, payload);
    renderLegend(host, payload);
    bindInteraction(host);

    setState(host, "resolving");
    settleLoaderMotion(host);

    const reducedMotion = window.matchMedia(reducedMotionQuery).matches;
    const settleDelay = reducedMotion ? 80 : 420;

    window.setTimeout(() => {
      if (controller.signal.aborted) return;
      setState(host, "resolved");
      setStatusMessage(host, "");
    }, settleDelay);
  } finally {
    activeControllers.delete(controller);
  }
};

const initHost = (host: HTMLElement) => {
  if (initializedHosts.has(host)) return;
  initializedHosts.add(host);

  host.dataset.contributionGraphInit = "true";
  setState(host, "loading");
  setStatusMessage(host, "Loading contribution activity...");

  deferClientWork(() => {
    resolveHost(host);
  });
};

export const initContributionGraph = () => {
  const hosts = document.querySelectorAll<HTMLElement>(hostSelector);
  hosts.forEach(initHost);
};

if (typeof window !== "undefined") {
  initContributionGraph();
  document.addEventListener("astro:page-load", initContributionGraph);
  document.addEventListener("astro:before-swap", () => {
    activeControllers.forEach(controller => controller.abort());
    activeControllers.clear();
  });
}
