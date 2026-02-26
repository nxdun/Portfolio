export type YtdlpDomRefs = {
  inputEl: HTMLInputElement;
  pasteBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  submitBtn: HTMLButtonElement;
  captchaModal: HTMLElement;
  closeDialogBtn: HTMLButtonElement;
  captchaHostEl: HTMLElement;
  verifyCaptchaBtn: HTMLButtonElement;
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
  const captchaModal = container.querySelector(
    "#ytdlp-captcha-modal"
  ) as HTMLElement | null;
  const closeDialogBtn = container.querySelector(
    "#ytdlp-dialog-close"
  ) as HTMLButtonElement | null;
  const captchaHostEl = container.querySelector(
    "#ytdlp-captcha-host"
  ) as HTMLElement | null;
  const verifyCaptchaBtn = container.querySelector(
    "#ytdlp-verify-captcha"
  ) as HTMLButtonElement | null;

  if (
    !inputEl ||
    !pasteBtn ||
    !clearBtn ||
    !submitBtn ||
    !captchaModal ||
    !closeDialogBtn ||
    !captchaHostEl ||
    !verifyCaptchaBtn
  ) {
    return null;
  }

  return {
    inputEl,
    pasteBtn,
    clearBtn,
    submitBtn,
    captchaModal,
    closeDialogBtn,
    captchaHostEl,
    verifyCaptchaBtn,
  };
}
