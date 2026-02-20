import { TOOL_REGISTRY, getInitialToolKey, isToolKey } from "./registry";
import { TOOL_CATALOG, type ToolKey } from "./catalog";
import type { ToolMount } from "./types";
import { sanitizeSafeToken } from "./validation";

function replaceUrlToolParam(toolKey: ToolKey): void {
  const url = new URL(window.location.href);
  url.searchParams.set("tool", toolKey);
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`
  );
}

export function initToolsWorkbench(): void {
  const workbench = document.querySelector(
    "#tools-workbench"
  ) as HTMLElement | null;
  const host = document.querySelector("#tool-host") as HTMLElement | null;
  const responseHost = document.querySelector(
    "#tool-response-host"
  ) as HTMLElement | null;
  const toolViewPanel = document.querySelector(
    "#tool-view-panel"
  ) as HTMLElement | null;
  const titleEl = document.querySelector("#tool-title") as HTMLElement | null;
  const subtitleEl = document.querySelector(
    "#tool-subtitle"
  ) as HTMLElement | null;
  const toggleBtn = document.querySelector(
    "#selector-toggle"
  ) as HTMLButtonElement | null;
  const maximizeIcon = document.querySelector(
    "#selector-maximize-icon"
  ) as HTMLElement | null;
  const minimizeIcon = document.querySelector(
    "#selector-minimize-icon"
  ) as HTMLElement | null;
  const toggleText = document.querySelector(
    "#selector-toggle-text"
  ) as HTMLElement | null;
  const selectorList = document.querySelector(
    "#tool-selector-list"
  ) as HTMLElement | null;
  const mobileSelect = document.querySelector(
    "#tool-select-mobile"
  ) as HTMLSelectElement | null;
  const toolButtons = Array.from(
    document.querySelectorAll(".tool-select-btn")
  ) as HTMLButtonElement[];

  if (
    !workbench ||
    !host ||
    !responseHost ||
    !toolViewPanel ||
    !titleEl ||
    !subtitleEl ||
    !toggleBtn
  ) {
    return;
  }

  if (workbench.dataset.initialized === "true") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialTool = getInitialToolKey(params);

  let currentTool: ToolKey | null = null;
  let loadRequestId = 0;
  const mountCache = new Map<ToolKey, ToolMount>();
  const buttonsByTool = new Map<ToolKey, HTMLButtonElement[]>();
  let activeButtons: HTMLButtonElement[] = [];

  toolButtons.forEach(button => {
    const toolKey = sanitizeSafeToken(button.dataset.toolKey ?? null);
    if (!isToolKey(toolKey)) return;

    const list = buttonsByTool.get(toolKey) ?? [];
    list.push(button);
    buttonsByTool.set(toolKey, list);
  });

  const setActiveButton = (toolKey: ToolKey) => {
    activeButtons.forEach(button => button.classList.remove("active"));

    const nextActiveButtons = buttonsByTool.get(toolKey) ?? [];
    nextActiveButtons.forEach(button => button.classList.add("active"));
    activeButtons = nextActiveButtons;

    if (mobileSelect) {
      mobileSelect.value = toolKey;
    }
  };

  const revealActiveTool = () => {
    const primaryActive = activeButtons[0];
    if (!primaryActive) return;

    primaryActive.scrollIntoView({ block: "nearest" });
    primaryActive.classList.remove("reveal-focus");

    requestAnimationFrame(() => {
      primaryActive.classList.add("reveal-focus");
      window.setTimeout(() => {
        primaryActive.classList.remove("reveal-focus");
      }, 420);
    });
  };

  const loadTool = async (
    toolKey: ToolKey,
    options?: { useUrlMountOptions?: boolean }
  ) => {
    if (currentTool === toolKey) return;
    const requestId = ++loadRequestId;
    currentTool = toolKey;

    const definition = TOOL_REGISTRY[toolKey];

    setActiveButton(toolKey);
    titleEl.textContent = definition.title;
    subtitleEl.textContent = definition.subtitle;
    replaceUrlToolParam(toolKey);

    host.innerHTML = '<p class="text-sm opacity-80">Loading tool...</p>';
    responseHost.innerHTML = "";
    responseHost.classList.add("hidden");
    toolViewPanel.dataset.responseState = "idle";

    const mountTool = mountCache.get(toolKey) ?? (await definition.loadMount());
    if (requestId !== loadRequestId) {
      return;
    }

    mountCache.set(toolKey, mountTool);

    if (options?.useUrlMountOptions && definition.getMountOptions) {
      mountTool(host, definition.getMountOptions(params), { responseHost });
      return;
    }

    mountTool(host, undefined, { responseHost });
  };

  selectorList?.addEventListener("click", event => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest(
      ".tool-select-btn"
    ) as HTMLButtonElement | null;
    if (!button) return;

    const toolKey = sanitizeSafeToken(button.dataset.toolKey ?? null);
    if (!isToolKey(toolKey)) return;
    loadTool(toolKey);
  });

  mobileSelect?.addEventListener("change", () => {
    const toolKey = sanitizeSafeToken(mobileSelect.value);
    if (!isToolKey(toolKey)) return;
    loadTool(toolKey);
  });

  toggleBtn.addEventListener("click", () => {
    const isCollapsed = workbench.dataset.collapsed === "true";
    const nextCollapsed = isCollapsed ? "false" : "true";
    const isExpanded = nextCollapsed === "false";
    const nextLabel = isExpanded ? "Hide Selector" : "Show Selector";

    workbench.dataset.collapsed = nextCollapsed;
    toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    toggleBtn.setAttribute("aria-label", nextLabel);
    toggleBtn.setAttribute("title", nextLabel);

    if (toggleText) {
      toggleText.textContent = nextLabel;
    }

    maximizeIcon?.classList.toggle("hidden", isExpanded);
    minimizeIcon?.classList.toggle("hidden", !isExpanded);

    if (isCollapsed) {
      revealActiveTool();
    }
  });

  const defaultTool = initialTool ?? TOOL_CATALOG[0]?.key ?? null;
  if (defaultTool) {
    loadTool(defaultTool, { useUrlMountOptions: Boolean(initialTool) });
  }

  workbench.dataset.initialized = "true";
}
