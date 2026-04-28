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
const CONTRIBUTIONS_PATH = "/api/v1/contributions";

const normalizeHexColor = (value: string) =>
  value.startsWith("#") ? value : `#${value}`;

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

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
  const range = toRecord(root.range);

  if (!summary || !meta || !range) return false;

  return (
    typeof root.username === "string" &&
    Array.isArray(root.legend) &&
    root.legend.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).level === "number" &&
        typeof (item as Record<string, unknown>).label === "string" &&
        typeof (item as Record<string, unknown>).color === "string"
    ) &&
    Array.isArray(root.months) &&
    root.months.every(
      (month: unknown) =>
        typeof month === "object" &&
        month !== null &&
        typeof (month as Record<string, unknown>).label === "string" &&
        typeof (month as Record<string, unknown>).weekIndex === "number"
    ) &&
    Array.isArray(root.cells) &&
    root.cells.every(
      (cell: unknown) =>
        typeof cell === "object" &&
        cell !== null &&
        typeof (cell as Record<string, unknown>).weekday === "number" &&
        Number.isInteger((cell as Record<string, unknown>).weekday) &&
        ((cell as Record<string, unknown>).weekday as number) >= 0 &&
        ((cell as Record<string, unknown>).weekday as number) <= 6 &&
        typeof (cell as Record<string, unknown>).date === "string" &&
        typeof (cell as Record<string, unknown>).count === "number" &&
        typeof (cell as Record<string, unknown>).level === "number"
    ) &&
    typeof summary.totalContributions === "number" &&
    typeof summary.totalWeeks === "number" &&
    typeof summary.maxDailyCount === "number" &&
    typeof range.from === "string" &&
    typeof range.to === "string" &&
    typeof meta.cached === "boolean" &&
    typeof meta.schemaVersion === "number"
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
  legend: readonly ContributionLegendItem[],
  level: number
): string => legend.find(item => item.level === level)?.label ?? "Unknown";

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const toCellHtmlLabel = (cell: ContributionCell, legendLabel: string) => {
  const contributionWord = cell.count === 1 ? "contribution" : "contributions";
  return `${formatDate(cell.date)} <span class="opacity-70 px-1">|</span> <span class="font-semibold text-foreground">${cell.count} ${contributionWord}</span> <span class="opacity-70 px-1">|</span> ${escapeHtml(legendLabel)}`;
};

const toCellPlainLabel = (cell: ContributionCell, legendLabel: string) => {
  const contributionWord = cell.count === 1 ? "contribution" : "contributions";
  return `${formatDate(cell.date)} | ${cell.count} ${contributionWord} | ${legendLabel}`;
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
  let lastRenderedWeekIndex = Number.NEGATIVE_INFINITY;
  data.months.forEach((month, index) => {
    if (index === 0 || month.weekIndex - lastRenderedWeekIndex < 3) {
      return;
    }

    const node = document.createElement("span");
    node.className = "hero-contribution-month";
    node.textContent = month.label;
    node.style.gridColumnStart = String(month.weekIndex + 1);
    months.appendChild(node);
    lastRenderedWeekIndex = month.weekIndex;
  });
};

const renderWeekdays = (host: HTMLElement) => {
  const weekdays = host.querySelector<HTMLElement>(
    "[data-contribution-weekdays]"
  );
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

    swatch.style.setProperty(
      "--contribution-color",
      normalizeHexColor(item.color)
    );
    label.textContent = item.label;

    wrapper.appendChild(swatch);
    wrapper.appendChild(label);
    legend.appendChild(wrapper);
  });
};

const renderSummary = (host: HTMLElement, data: ContributionGraphResponse) => {
  const summary = host.querySelector<HTMLElement>(
    "[data-contribution-summary]"
  );
  if (!summary) return;

  const cacheStatus = data.meta.cached ? "Cached" : "Live";
  summary.innerHTML = `<span class="font-semibold text-foreground">nxdun</span> <span class="opacity-70 px-1">/</span> ${data.summary.totalContributions} <span class="opacity-90">contributions</span> <span class="opacity-70 px-1">/</span> ${data.summary.totalWeeks} <span class="opacity-90">weeks</span> <span class="text-[0.65rem] opacity-80 ml-1">(${cacheStatus})</span>`;
};

const bindInteraction = (host: HTMLElement) => {
  const grid = host.querySelector<HTMLElement>("[data-contribution-grid]");
  const tooltip = host.querySelector<HTMLElement>(
    "[data-contribution-tooltip]"
  );

  if (!grid || !tooltip) return;

  const idleMessage = `<span class="font-semibold text-foreground">nxdun</span> <span class="opacity-50 px-1">/</span> contribution activity`;
  tooltip.innerHTML = idleMessage;

  const updateTooltip = (value: string) => {
    tooltip.innerHTML = value;
  };

  const getCells = () =>
    Array.from(grid.querySelectorAll<HTMLElement>(".hero-contribution-cell"));

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

    // Update roving tabindex
    getCells().forEach(c => (c.tabIndex = -1));
    target.tabIndex = 0;

    updateTooltip(target.dataset.tooltip || idleMessage);
  });

  grid.addEventListener("keydown", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".hero-contribution-cell"
    );
    if (!target) return;

    const currentWeek = parseInt(target.dataset.weekIndex || "0");
    const currentWeekday = parseInt(target.dataset.weekday || "0");
    let nextWeek = currentWeek;
    let nextWeekday = currentWeekday;

    switch (event.key) {
      case "ArrowLeft":
        nextWeek--;
        break;
      case "ArrowRight":
        nextWeek++;
        break;
      case "ArrowUp":
        nextWeekday--;
        break;
      case "ArrowDown":
        nextWeekday++;
        break;
      case "Home":
        nextWeek = 0;
        nextWeekday = 0;
        break;
      case "End": {
        const cells = getCells();
        const lastCell = cells[cells.length - 1];
        nextWeek = parseInt(lastCell.dataset.weekIndex || "0");
        nextWeekday = parseInt(lastCell.dataset.weekday || "0");
        break;
      }
      default:
        return;
    }

    event.preventDefault();
    const nextCell = grid.querySelector<HTMLElement>(
      `.hero-contribution-cell[data-week-index="${nextWeek}"][data-weekday="${nextWeekday}"]`
    );
    if (nextCell) {
      nextCell.focus();
    }
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

  // Create 7 rows to satisfy ARIA grid requirements
  const rows = Array.from({ length: 7 }, () => {
    const row = document.createElement("div");
    row.setAttribute("role", "row");
    // display: contents allows the children to participate in the grid layout of the parent
    row.style.display = "contents";
    return row;
  });

  data.cells.forEach((cell, index) => {
    const item = document.createElement("button");
    const legendLabel = getLegendLabel(data.legend, cell.level);
    const htmlLabel = toCellHtmlLabel(cell, legendLabel);
    const plainLabel = toCellPlainLabel(cell, legendLabel);

    item.type = "button";
    item.className = "hero-contribution-cell";
    item.setAttribute("role", "gridcell");
    item.style.gridColumnStart = String(cell.weekIndex + 1);
    item.style.gridRowStart = String(cell.weekday + 1);
    item.style.setProperty(
      "--contribution-color",
      normalizeHexColor(cell.color)
    );
    item.setAttribute("aria-label", plainLabel);
    item.setAttribute("title", plainLabel);
    item.dataset.tooltip = htmlLabel;
    item.dataset.weekIndex = String(cell.weekIndex);
    item.dataset.weekday = String(cell.weekday);

    // Initial roving tabindex: only the last cell is tabbable
    item.tabIndex = index === data.cells.length - 1 ? 0 : -1;

    rows[cell.weekday].appendChild(item);
  });

  grid.textContent = "";
  rows.forEach(row => grid.appendChild(row));

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
  baseUrl: string,
  signal: AbortSignal
): Promise<{
  ok: boolean;
  data?: ContributionGraphResponse;
  timedOut: boolean;
}> => {
  const timeoutController = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, networkTimeoutMs);

  signal.addEventListener("abort", () => timeoutController.abort(), {
    once: true,
  });

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}${CONTRIBUTIONS_PATH}`,
      {
        signal: timeoutController.signal,
      }
    );

    if (!response.ok) {
      return { ok: false, timedOut: false };
    }

    const data = await response.json();
    return {
      ok: true,
      data,
      timedOut: false,
    };
  } catch (error) {
    const isAbort =
      error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      timedOut: isAbort && timedOut,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const resolveHost = async (host: HTMLElement) => {
  const configuredBaseUrl = (
    host.getAttribute("data-contribution-graph-url") ?? ""
  ).trim();

  if (!configuredBaseUrl || !isHttpUrl(configuredBaseUrl)) {
    setState(host, "error");
    settleLoaderMotion(host);
    setStatusMessage(host, "Contribution service is unavailable right now.");
    return;
  }

  const controller = new AbortController();
  activeControllers.add(controller);

  try {
    const { ok, data, timedOut } = await fetchContributionGraph(
      configuredBaseUrl,
      controller.signal
    );
    if (controller.signal.aborted) return;

    if (!ok) {
      if (!timedOut && controller.signal.aborted) {
        return;
      }

      setState(host, "error");
      settleLoaderMotion(host);
      setStatusMessage(host, "Activity unavailable for nxdun.");
      return;
    }

    if (!isContributionResponse(data)) {
      setState(host, "error");
      settleLoaderMotion(host);
      setStatusMessage(host, "Activity unavailable for nxdun.");
      return;
    }

    const payload = data;
    if (payload.cells.length === 0) {
      renderSummary(host, payload);
      renderLegend(host, payload);
      setState(host, "empty");
      settleLoaderMotion(host);
      setStatusMessage(host, "No recent activity for nxdun.");
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
  setStatusMessage(host, "Loading nxdun's activity...");

  deferClientWork(() => {
    resolveHost(host);
  });
};

export const initContributionGraph = () => {
  const hosts = document.querySelectorAll<HTMLElement>(hostSelector);
  hosts.forEach(initHost);
};

if (typeof window !== "undefined") {
  // Listen for navigation cleanup
  document.addEventListener("astro:before-swap", () => {
    activeControllers.forEach(controller => controller.abort());
    activeControllers.clear();
  });
}
