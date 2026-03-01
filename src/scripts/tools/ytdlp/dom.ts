export type YtdlpDomRefs = {
  inputEl: HTMLInputElement;
  pasteBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  submitBtn: HTMLButtonElement;
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

  if (!inputEl || !pasteBtn || !clearBtn || !submitBtn) {
    return null;
  }

  return {
    inputEl,
    pasteBtn,
    clearBtn,
    submitBtn,
  };
}
