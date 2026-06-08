export type AioDomRefs = {
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

export function resolveAioDomRefs(container: HTMLElement): AioDomRefs | null {
  const inputEl = container.querySelector(
    "#aio-url-input"
  ) as HTMLInputElement | null;
  const pasteBtn = container.querySelector(
    "#aio-paste"
  ) as HTMLButtonElement | null;
  const clearBtn = container.querySelector(
    "#aio-clear"
  ) as HTMLButtonElement | null;
  const submitBtn = container.querySelector(
    "#aio-submit"
  ) as HTMLButtonElement | null;
  const viewSitesBtn = container.querySelector(
    "#aio-view-sites"
  ) as HTMLButtonElement | null;
  const sitesDialog = container.querySelector(
    "#aio-sites-dialog"
  ) as HTMLDialogElement | null;
  const sitesCloseBtn = container.querySelector(
    "#aio-sites-close"
  ) as HTMLButtonElement | null;
  const sitesSearchInput = container.querySelector(
    "#aio-sites-search"
  ) as HTMLInputElement | null;
  const sitesList = container.querySelector(
    "#aio-sites-list"
  ) as HTMLElement | null;
  const sitesCount = container.querySelector(
    "#aio-sites-count"
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
