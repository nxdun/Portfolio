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

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const normalizeHexColor = (value: string) =>
  value.startsWith("#") ? value : `#${value}`;

const sharedDate = new Date();

const formatDate = (dateString: string) => {
  const year = +dateString.slice(0, 4);
  const month = +dateString.slice(5, 7);
  const day = +dateString.slice(8, 10);
  sharedDate.setFullYear(year, month - 1, day);
  return fullDateFormatter.format(sharedDate);
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

  if (
    typeof root.username !== "string" ||
    !Array.isArray(root.legend) ||
    !Array.isArray(root.months) ||
    !Array.isArray(root.cells) ||
    typeof summary.totalContributions !== "number" ||
    typeof summary.totalWeeks !== "number" ||
    typeof summary.maxDailyCount !== "number" ||
    typeof range.from !== "string" ||
    typeof range.to !== "string" ||
    typeof meta.cached !== "boolean" ||
    typeof meta.schemaVersion !== "number"
  ) {
    return false;
  }

  if (root.legend.length > 0) {
    const item = root.legend[0] as Record<string, unknown>;
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.level !== "number" ||
      typeof item.label !== "string" ||
      typeof item.color !== "string"
    ) {
      return false;
    }
  }

  if (root.months.length > 0) {
    const month = root.months[0] as Record<string, unknown>;
    if (
      typeof month !== "object" ||
      month === null ||
      typeof month.label !== "string" ||
      typeof month.weekIndex !== "number"
    ) {
      return false;
    }
  }

  if (root.cells.length > 0) {
    const cell = root.cells[0] as Record<string, unknown>;
    if (
      typeof cell !== "object" ||
      cell === null ||
      typeof cell.weekday !== "number" ||
      !Number.isInteger(cell.weekday) ||
      (cell.weekday as number) < 0 ||
      (cell.weekday as number) > 6 ||
      typeof cell.date !== "string" ||
      typeof cell.count !== "number" ||
      typeof cell.level !== "number"
    ) {
      return false;
    }
  }

  return true;
};

const deferClientWork = (task: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => task(), { timeout: 1000 });
    return;
  }

  setTimeout(task, 180);
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

const renderMonths = (
  monthsEl: HTMLElement | null,
  data: ContributionGraphResponse
) => {
  if (!monthsEl) return;

  monthsEl.textContent = "";
  let lastRenderedWeekIndex = Number.NEGATIVE_INFINITY;

  const nodes: HTMLElement[] = [];
  data.months.forEach((month, index) => {
    if (index === 0 || month.weekIndex - lastRenderedWeekIndex < 3) {
      return;
    }

    const node = document.createElement("span");
    node.className = "hero-contribution-month";
    node.textContent = month.label;
    node.style.gridColumnStart = String(month.weekIndex + 1);
    nodes.push(node);
    lastRenderedWeekIndex = month.weekIndex;
  });

  monthsEl.append(...nodes);
};

const renderWeekdays = (weekdaysEl: HTMLElement | null) => {
  if (!weekdaysEl) return;

  weekdaysEl.textContent = "";
  const nodes = [1, 3, 5].map(dayIndex => {
    const node = document.createElement("span");
    node.className = "hero-contribution-weekday";
    node.style.gridRowStart = String(dayIndex + 1);
    node.textContent = weekdayShortNames[dayIndex];
    return node;
  });

  weekdaysEl.append(...nodes);
};

const renderLegend = (
  legendEl: HTMLElement | null,
  data: ContributionGraphResponse
) => {
  if (!legendEl) return;

  legendEl.textContent = "";
  const nodes = data.legend.map(item => {
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
    return wrapper;
  });

  legendEl.append(...nodes);
};

const renderSummary = (
  summaryEl: HTMLElement | null,
  data: ContributionGraphResponse
) => {
  if (!summaryEl) return;

  const cacheStatus = data.meta.cached ? "Updated Today" : "Live";

  summaryEl.innerHTML = `<span class="font-semibold text-foreground">nxdun</span> <span class="opacity-70 px-1">/</span> ${data.summary.totalContributions} <span class="opacity-90">contributions</span> <span class="opacity-70 px-1">/</span> ${data.summary.totalWeeks} <span class="opacity-90">weeks</span> <span class="text-[0.65rem] opacity-80 ml-1">(${cacheStatus})</span>`;
};

const bindInteraction = (
  gridEl: HTMLElement | null,
  tooltipEl: HTMLElement | null
) => {
  if (!gridEl || !tooltipEl) return;

  const idleMessage = `<span class="font-semibold text-foreground">nxdun</span> <span class="opacity-50 px-1">/</span> contribution activity`;
  tooltipEl.innerHTML = idleMessage;

  const updateTooltip = (value: string) => {
    tooltipEl.innerHTML = value;
  };

  const getCells = () =>
    Array.from(gridEl.querySelectorAll<HTMLElement>(".hero-contribution-cell"));

  gridEl.addEventListener("pointerover", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".hero-contribution-cell"
    );
    if (!target) return;

    updateTooltip(target.dataset.tooltip || idleMessage);
  });

  gridEl.addEventListener("focusin", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".hero-contribution-cell"
    );
    if (!target) return;

    // Update roving tabindex
    getCells().forEach(c => (c.tabIndex = -1));
    target.tabIndex = 0;

    updateTooltip(target.dataset.tooltip || idleMessage);
  });

  gridEl.addEventListener("keydown", event => {
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
    const nextCell = gridEl.querySelector<HTMLElement>(
      `.hero-contribution-cell[data-week-index="${nextWeek}"][data-weekday="${nextWeekday}"]`
    );
    if (nextCell) {
      nextCell.focus();
    }
  });

  gridEl.addEventListener("pointerleave", () => {
    updateTooltip(idleMessage);
  });

  gridEl.addEventListener("focusout", () => {
    updateTooltip(idleMessage);
  });
};

const renderCells = (
  gridEl: HTMLElement | null,
  host: HTMLElement,
  data: ContributionGraphResponse
) => {
  if (!gridEl) return;

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

  gridEl.textContent = "";
  gridEl.append(...rows);

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

    // Cache DOM elements ;/
    const elements = {
      months: host.querySelector<HTMLElement>("[data-contribution-months]"),
      weekdays: host.querySelector<HTMLElement>("[data-contribution-weekdays]"),
      grid: host.querySelector<HTMLElement>("[data-contribution-grid]"),
      summary: host.querySelector<HTMLElement>("[data-contribution-summary]"),
      legend: host.querySelector<HTMLElement>("[data-contribution-legend]"),
      tooltip: host.querySelector<HTMLElement>("[data-contribution-tooltip]"),
    };

    if (payload.cells.length === 0) {
      renderSummary(elements.summary, payload);
      renderLegend(elements.legend, payload);
      setState(host, "empty");
      settleLoaderMotion(host);
      setStatusMessage(host, "No recent activity for nxdun.");
      return;
    }

    renderMonths(elements.months, payload);
    renderWeekdays(elements.weekdays);
    renderCells(elements.grid, host, payload);
    renderSummary(elements.summary, payload);
    renderLegend(elements.legend, payload);
    bindInteraction(elements.grid, elements.tooltip);

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
