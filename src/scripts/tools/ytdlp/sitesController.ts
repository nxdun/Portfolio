import type { YtdlpDomRefs } from "./dom";
import type { YtdlpApiClient } from "./apiClient";

const RANDOM_SITES_PREVIEW_COUNT = 60;
const SITES_RENDER_LIMIT = 500;

export class YtdlpSitesController {
  private supportedSites: string[] = [];
  private sitesLoaded = false;
  private readonly cleanupCallbacks: Array<() => void> = [];

  constructor(
    private readonly refs: YtdlpDomRefs,
    private readonly apiClient: YtdlpApiClient | undefined
  ) {}

  public init(): void {
    this.addEventListener(this.refs.viewSitesBtn, "click", () => {
      void this.handleViewSitesClick();
    });

    this.addEventListener(this.refs.sitesCloseBtn, "click", () => {
      this.refs.sitesDialog.close();
    });

    this.addEventListener(this.refs.sitesSearchInput, "input", () => {
      this.handleSitesSearch();
    });
  }

  public destroy(): void {
    this.cleanupCallbacks.forEach(cleanup => cleanup());
    this.cleanupCallbacks.length = 0;
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

  private async handleViewSitesClick(): Promise<void> {
    this.refs.sitesDialog.showModal();
    this.refs.sitesSearchInput.value = "";

    if (this.sitesLoaded) {
      this.renderRandomSitesPreview();
      return;
    }

    if (!this.apiClient) return;

    this.refs.sitesList.innerHTML =
      '<div class="col-span-full py-6 text-center text-muted-foreground">Loading...</div>';

    try {
      const result = await this.apiClient.getSites();
      if (result.ok) {
        this.supportedSites = result.data;
        this.sitesLoaded = true;
        this.refs.sitesCount.textContent =
          this.supportedSites.length.toString();
        this.renderRandomSitesPreview();
      } else {
        this.refs.sitesList.innerHTML =
          '<div class="col-span-full py-6 text-center text-red-500">Failed to load sites.</div>';
      }
    } catch {
      this.refs.sitesList.innerHTML =
        '<div class="col-span-full py-6 text-center text-red-500">Failed to load sites.</div>';
    }
  }

  private handleSitesSearch(): void {
    const query = this.refs.sitesSearchInput.value.toLowerCase().trim();
    if (!query) {
      this.renderRandomSitesPreview();
      return;
    }

    if (query.includes("youtube") || query.includes("youtu.be")) {
      this.refs.sitesList.innerHTML =
        '<div class="col-span-full py-6 text-center"><p class="mb-1 text-sm font-semibold text-red-500">Removed YouTube Download</p><p class="text-xs text-muted-foreground">This feature is disabled due to legal constraints.</p></div>';
      return;
    }

    const filtered = this.supportedSites.filter(s =>
      s.toLowerCase().includes(query)
    );
    this.renderSites(filtered);
  }

  private renderRandomSitesPreview(): void {
    if (this.supportedSites.length <= RANDOM_SITES_PREVIEW_COUNT) {
      this.renderSites(this.supportedSites);
      return;
    }

    const randomIndexes = new Set<number>();
    while (randomIndexes.size < RANDOM_SITES_PREVIEW_COUNT) {
      randomIndexes.add(Math.floor(Math.random() * this.supportedSites.length));
    }

    const randomSites = Array.from(
      randomIndexes,
      index => this.supportedSites[index]
    );

    this.renderSites(randomSites);
  }

  private renderSites(sites: string[]): void {
    if (sites.length === 0) {
      this.refs.sitesList.innerHTML =
        '<div class="col-span-full py-6 text-center"><p class="mb-1 text-muted-foreground">No matching sites found.</p><p class="text-xs text-muted-foreground opacity-75">Notice: YouTube downloading has been removed due to legal issues.</p></div>';
      return;
    }

    const toRender = sites.slice(0, SITES_RENDER_LIMIT);
    this.refs.sitesList.innerHTML = toRender
      .map(site => {
        const safeSite = this.escapeHtml(site);
        return `<article class="min-w-0 rounded-lg border border-border/40 bg-background/70 px-3 py-2.5"><p class="truncate text-sm font-medium leading-tight" title="${safeSite}">${safeSite}</p></article>`;
      })
      .join("");

    if (sites.length > SITES_RENDER_LIMIT) {
      this.refs.sitesList.innerHTML += `<div class="col-span-full px-2 py-3 text-center text-xs text-muted-foreground">Showing first ${SITES_RENDER_LIMIT.toLocaleString()} results. Refine search to narrow matches.</div>`;
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
}
