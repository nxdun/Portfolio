type CaptchaDialogLabels = {
  title?: string;
  description?: string;
  verifyButtonText?: string;
};

export type CaptchaDialogOptions = {
  idPrefix: string;
  labels?: CaptchaDialogLabels;
};

export type CaptchaDialogRefs = {
  modalEl: HTMLElement;
  closeBtn: HTMLButtonElement;
  captchaHostEl: HTMLElement;
  verifyBtn: HTMLButtonElement;
};

export type CaptchaDialogController = {
  refs: CaptchaDialogRefs;
  open: () => void;
  close: () => void;
  destroy: () => void;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function createCaptchaDialogTemplate(options: CaptchaDialogOptions): {
  template: string;
  ids: Record<string, string>;
} {
  const title = options.labels?.title ?? "Captcha Verification";
  const description =
    options.labels?.description ?? "Confirm you are human to continue.";
  const verifyButtonText =
    options.labels?.verifyButtonText ?? "Verify and Continue";

  const ids = {
    modal: `${options.idPrefix}-captcha-modal`,
    title: `${options.idPrefix}-captcha-title`,
    description: `${options.idPrefix}-captcha-description`,
    close: `${options.idPrefix}-dialog-close`,
    host: `${options.idPrefix}-captcha-host`,
    verify: `${options.idPrefix}-verify-captcha`,
  };

  return {
    ids,
    template: `
      <div
        id="${ids.modal}"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${ids.title}"
        aria-describedby="${ids.description}"
        tabindex="-1"
        class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4 backdrop:backdrop-blur-sm"
      >
        <section class="w-full max-w-xl overflow-visible rounded-xl border border-border bg-background p-0 text-foreground shadow-2xl outline-none">
          <div class="flex h-full max-h-full flex-col">
            <div class="sticky top-0 z-10 rounded-t-xl border-b border-border bg-background px-6 py-4">
              <div class="flex items-start justify-between">
                <div class="mr-4">
                  <h2 id="${ids.title}" class="text-xl font-bold text-accent sm:text-2xl">${title}</h2>
                  <div id="${ids.description}" class="mt-1 text-sm text-foreground/70">${description}</div>
                </div>

                <button
                  id="${ids.close}"
                  type="button"
                  class="rounded-full p-2 transition-colors hover:bg-muted focus:outline-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="flex-1 space-y-4 overflow-visible p-6">
              <div id="${ids.host}" class="min-h-20 flex justify-center overflow-visible"></div>
              <button
                id="${ids.verify}"
                type="button"
                class="h-10 w-full rounded-lg border border-accent/70 bg-accent/5 px-4 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                ${verifyButtonText}
              </button>
            </div>
          </div>
        </section>
      </div>
    `,
  };
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    root.querySelectorAll(FOCUSABLE_SELECTOR)
  ) as HTMLElement[];

  return elements.filter(element => {
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    if (element.hasAttribute("disabled")) {
      return false;
    }

    return element.offsetParent !== null || element === document.activeElement;
  });
}

function resolveRefs(
  root: HTMLElement,
  ids: Record<string, string>
): CaptchaDialogRefs | null {
  const modalEl = root.querySelector(`#${ids.modal}`) as HTMLElement | null;
  const closeBtn = root.querySelector(
    `#${ids.close}`
  ) as HTMLButtonElement | null;
  const captchaHostEl = root.querySelector(
    `#${ids.host}`
  ) as HTMLElement | null;
  const verifyBtn = root.querySelector(
    `#${ids.verify}`
  ) as HTMLButtonElement | null;

  if (!modalEl || !closeBtn || !captchaHostEl || !verifyBtn) {
    return null;
  }

  return {
    modalEl,
    closeBtn,
    captchaHostEl,
    verifyBtn,
  };
}

export function createCaptchaDialog(
  mountHost: HTMLElement,
  options: CaptchaDialogOptions
): CaptchaDialogController | null {
  const { template, ids } = createCaptchaDialogTemplate(options);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = template;

  const refs = resolveRefs(wrapper, ids);
  if (!refs) {
    return null;
  }

  mountHost.append(refs.modalEl);

  let previouslyFocusedElement: HTMLElement | null = null;

  const close = (): void => {
    refs.modalEl.classList.add("hidden");
    refs.modalEl.classList.remove("flex");
    refs.modalEl.setAttribute("aria-hidden", "true");

    const target = previouslyFocusedElement;
    previouslyFocusedElement = null;

    if (target && target.isConnected) {
      target.focus({ preventScroll: true });
    }
  };

  const open = (): void => {
    previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    refs.modalEl.classList.remove("hidden");
    refs.modalEl.classList.add("flex");
    refs.modalEl.setAttribute("aria-hidden", "false");

    queueMicrotask(() => {
      if (refs.closeBtn.disabled) {
        refs.modalEl.focus({ preventScroll: true });
        return;
      }

      refs.closeBtn.focus({ preventScroll: true });
    });
  };

  const onModalKeydown = (event: KeyboardEvent): void => {
    if (refs.modalEl.classList.contains("hidden")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusables = getFocusableElements(refs.modalEl);
    if (focusables.length === 0) {
      event.preventDefault();
      refs.modalEl.focus({ preventScroll: true });
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  const onModalClick = (event: MouseEvent): void => {
    if (event.target === refs.modalEl) {
      close();
    }
  };

  refs.closeBtn.addEventListener("click", close);
  refs.modalEl.addEventListener("keydown", onModalKeydown);
  refs.modalEl.addEventListener("click", onModalClick);

  return {
    refs,
    open,
    close,
    destroy: () => {
      refs.closeBtn.removeEventListener("click", close);
      refs.modalEl.removeEventListener("keydown", onModalKeydown);
      refs.modalEl.removeEventListener("click", onModalClick);
      refs.modalEl.remove();
      previouslyFocusedElement = null;
    },
  };
}
