export const YTDLP_TOOL_TEMPLATE = `
  <section class="grid gap-6">
    <div class="grid gap-2 relative group/input">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold flex items-center gap-2" for="ytdlp-url-input">
          Video URL
        </label>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            id="ytdlp-paste"
            type="button"
            class="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80 sm:px-2.5"
            title="Paste from clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M7 18V2h13v16zm2-2h9V4H9zm-6 6V6h2v14h11v2zm6-6V4z"/></svg>
            <span class="hidden sm:inline">Paste</span>
          </button>
          <button
            id="ytdlp-clear"
            type="button"
            class="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80 sm:px-2.5"
            title="Clear input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linejoin="round" d="m7 6l4 4m0-4l-4 4M5 3.5h9.5v9H5L1.5 8z"/></svg>
            <span class="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
      <input
        id="ytdlp-url-input"
        type="url"
        class="h-11 rounded-xl border border-border/60 bg-muted/5 px-4 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
        placeholder="https://example.com/video"
        autocomplete="off"
        inputmode="url"
      />
      <div class="flex items-center justify-between">
        <p class="text-xs opacity-75">Paste a video URL from one of <button type="button" id="ytdlp-view-sites" class="font-bold text-accent hover:underline outline-none">2000+ supported sites</button>.</p>
      </div>
    </div>

    <div class="flex gap-3">
      <button
        id="ytdlp-submit"
        type="button"
        class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-accent bg-accent/5 px-6 text-sm font-bold text-accent shadow-sm transition-all hover:bg-accent hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Submit Download
      </button>
    </div>

    <dialog id="ytdlp-sites-dialog" class="m-auto h-[min(82vh,760px)] w-[94vw] max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-0 text-foreground shadow-2xl backdrop:bg-background/80 backdrop:backdrop-blur-sm">
      <div class="flex h-full flex-col">
        <header class="border-b border-border/50 px-5 py-4 sm:px-6">
          <div class="flex items-start justify-between gap-4">
            <div class="grid gap-1">
              <h3 class="text-lg font-bold leading-none">Supported Sites (<span id="ytdlp-sites-count">0</span>+)</h3>
              <p class="text-xs text-muted-foreground">Search across providers and verify your URL host quickly.</p>
            </div>
            <button id="ytdlp-sites-close" type="button" class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Close supported sites dialog">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
            </button>
          </div>
        </header>

        <div class="border-b border-border/50 px-5 py-3 sm:px-6 sm:py-4">
          <div class="relative">
            <input type="text" id="ytdlp-sites-search" placeholder="Search by domain or platform name..." class="h-11 w-full rounded-xl border border-border/60 bg-muted/5 px-4 text-sm outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent" />
          </div>
        </div>

        <div class="min-h-0 flex-1 px-5 py-4 sm:px-6">
          <div id="ytdlp-sites-list" class="grid h-full min-h-56 grid-cols-1 content-start gap-2 overflow-y-auto rounded-xl border border-border/50 bg-muted/10 p-2 text-sm sm:p-3 md:grid-cols-2">
            <div class="col-span-full py-6 text-center text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    </dialog>
  </section>
`;
