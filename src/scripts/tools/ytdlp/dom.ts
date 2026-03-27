export type YtdlpDomRefs = {
  inputEl: HTMLInputElement;
  pasteBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  submitBtn: HTMLButtonElement;
  viewSitesBtn: HTMLButtonElement;
  sitesDialog: HTMLDialogElement;
  sitesCloseBtn: HTMLButtonElement;
  sitesSearchInput: HTMLInputElement;
  sitesList: HTMLElement;
  sitesCount: HTMLElement;
};

export function resolveYtdlpDomRefs(
  container: HTMLElement
): YtdlpDomRefs | null {
  const inputEl = container.querySelector(
    "#ytdlp-url-input"
  ) as HTMLInputElement | null;
  const pasteBtn = container.querySelector(
    "#ytdlp-paste"
  ) as HTMLButtonElement | null;
  const clearBtn = container.querySelector(
    "#ytdlp-clear"
  ) as HTMLButtonElement | null;
  const submitBtn = container.querySelector(
    "#ytdlp-submit"
  ) as HTMLButtonElement | null;
  const viewSitesBtn = container.querySelector(
    "#ytdlp-view-sites"
  ) as HTMLButtonElement | null;
  const sitesDialog = container.querySelector(
    "#ytdlp-sites-dialog"
  ) as HTMLDialogElement | null;
  const sitesCloseBtn = container.querySelector(
    "#ytdlp-sites-close"
  ) as HTMLButtonElement | null;
  const sitesSearchInput = container.querySelector(
    "#ytdlp-sites-search"
  ) as HTMLInputElement | null;
  const sitesList = container.querySelector(
    "#ytdlp-sites-list"
  ) as HTMLElement | null;
  const sitesCount = container.querySelector(
    "#ytdlp-sites-count"
  ) as HTMLElement | null;

  if (
    !inputEl ||
    !pasteBtn ||
    !clearBtn ||
    !submitBtn ||
    !viewSitesBtn ||
    !sitesDialog ||
    !sitesCloseBtn ||
    !sitesSearchInput ||
    !sitesList ||
    !sitesCount
  ) {
    return null;
  }

  return {
    inputEl,
    pasteBtn,
    clearBtn,
    submitBtn,
    viewSitesBtn,
    sitesDialog,
    sitesCloseBtn,
    sitesSearchInput,
    sitesList,
    sitesCount,
  };
}
