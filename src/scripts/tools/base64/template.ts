export const BASE64_TOOL_TEMPLATE = `
  <section class="grid gap-6">
    <div class="grid gap-2 relative group/input">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold flex items-center gap-2" for="base64-input">
          Input
        </label>
        <div class="flex items-center gap-2 flex-wrap">
          <label class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors min-w-0">
            <input type="checkbox" id="base64-trim" class="rounded border-border/70 bg-muted/15 text-accent focus:ring-accent w-3.5 h-3.5 flex-shrink-0" checked>
            <span class="truncate">Trim</span>
          </label>
          <div class="h-4 w-px bg-border/60 mx-1"></div>
          <button
            id="base64-paste"
            type="button"
            class="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80 sm:px-2.5"
            title="Paste from clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M7 18V2h13v16zm2-2h9V4H9zm-6 6V6h2v14h11v2zm6-6V4z"/></svg>
            <span class="hidden sm:inline">Paste</span>
          </button>
          <button
            id="base64-clear"
            type="button"
            class="flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80 sm:px-2.5"
            title="Clear input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linejoin="round" d="m7 6l4 4m0-4l-4 4M5 3.5h9.5v9H5L1.5 8z"/></svg>
            <span class="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
      <textarea
        id="base64-input"
        class="min-h-32 rounded-xl border border-border/60 bg-muted/5 px-4 py-3 text-sm leading-relaxed sm:min-h-36 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-muted-foreground/60 resize-y"
        placeholder="Type or paste content here..."
      ></textarea>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex flex-1 gap-3">
        <button
          id="base64-encode"
          type="button"
          class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-accent bg-accent/5 px-6 text-sm font-bold text-accent shadow-sm transition-all hover:bg-accent hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
          Encode
        </button>
        <button
          id="base64-decode"
          type="button"
          class="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-accent bg-accent/5 px-6 text-sm font-bold text-accent shadow-sm transition-all hover:bg-accent hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>
          Decode
        </button>
      </div>

      <div class="flex justify-center sm:px-2">
        <button
          id="base64-swap"
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-accent hover:text-accent hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-accent"
          title="Swap Input and Output"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 25"><path fill="currentColor" fill-rule="evenodd" d="M6.793 3.007a1 1 0 0 1 1.414 0l3.5 3.5a1 1 0 0 1-1.414 1.415L8.5 6.129v9.585a1 1 0 1 1-2 0V6.13L4.707 7.922a1 1 0 1 1-1.414-1.415zM16.5 8.714a1 1 0 0 1 1 1V19.3l1.793-1.793a1 1 0 0 1 1.414 1.415l-3.5 3.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 0 1 1.414-1.415L15.5 19.3V9.714a1 1 0 0 1 1-1" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>

    <div class="grid gap-2 relative group/output">
      <div class="flex items-center justify-between">
        <label class="text-sm font-semibold flex items-center gap-2" for="base64-output">
          Output
        </label>
        <button
          id="base64-copy"
          type="button"
          class="flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border/80"
          title="Copy to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h4.175q.275-.875 1.075-1.437T12 1q1 0 1.788.563T14.85 3H19q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5h-2v3H7V5H5zm7-14q.425 0 .713-.288T13 4t-.288-.712T12 3t-.712.288T11 4t.288.713T12 5"/></svg>
          Copy
        </button>
      </div>
      <textarea
        id="base64-output"
        readonly
        class="min-h-32 rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-sm leading-relaxed sm:min-h-36 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-y"
        placeholder="Result will appear here..."
      ></textarea>
    </div>
  </section>
`;
