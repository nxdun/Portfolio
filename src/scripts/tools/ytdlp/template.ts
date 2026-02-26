export const YTDLP_TOOL_TEMPLATE = `
  <section class="grid gap-6">
    <div class="grid gap-2 relative group/input">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold flex items-center gap-2" for="ytdlp-url-input">
          YouTube URL
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
        placeholder="https://www.youtube.com/watch?v=..."
        autocomplete="off"
        inputmode="url"
      />
      <p class="text-xs opacity-75">Only single YouTube videos are allowed. Playlists are blocked.</p>
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

    <div
      id="ytdlp-captcha-modal"
      aria-hidden="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ytdlp-captcha-title"
      aria-describedby="ytdlp-captcha-description"
      tabindex="-1"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4 backdrop:backdrop-blur-sm"
    >
      <section class="w-full max-w-xl overflow-visible rounded-xl border border-border bg-background p-0 text-foreground shadow-2xl outline-none">
        <div class="flex h-full max-h-full flex-col">
          <div class="sticky top-0 z-10 rounded-t-xl border-b border-border bg-background px-6 py-4">
            <div class="flex items-start justify-between">
              <div class="mr-4">
                <h2 id="ytdlp-captcha-title" class="text-xl font-bold text-accent sm:text-2xl">Captcha Verification</h2>
                <div id="ytdlp-captcha-description" class="mt-1 text-sm text-foreground/70">Confirm you are human to start download</div>
              </div>

              <button
                id="ytdlp-dialog-close"
                type="button"
                class="rounded-full p-2 transition-colors hover:bg-muted focus:outline-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
          </div>

          <div class="flex-1 space-y-4 overflow-visible p-6">
            <div id="ytdlp-captcha-host" class="min-h-20 flex justify-center overflow-visible"></div>
            <button
              id="ytdlp-verify-captcha"
              type="button"
              class="h-10 w-full rounded-lg border border-accent/70 bg-accent/5 px-4 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled
            >
              Verify and Continue
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
`;
