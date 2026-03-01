export type Base64DomRefs = {
  inputEl: HTMLTextAreaElement;
  outputEl: HTMLTextAreaElement;
  encodeBtn: HTMLButtonElement;
  decodeBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  pasteBtn: HTMLButtonElement;
  copyBtn: HTMLButtonElement;
  swapBtn: HTMLButtonElement;
  trimCheckbox: HTMLInputElement;
};

export function resolveBase64DomRefs(
  container: HTMLElement
): Base64DomRefs | null {
  const inputEl = container.querySelector(
    "#base64-input"
  ) as HTMLTextAreaElement | null;
  const outputEl = container.querySelector(
    "#base64-output"
  ) as HTMLTextAreaElement | null;
  const encodeBtn = container.querySelector(
    "#base64-encode"
  ) as HTMLButtonElement | null;
  const decodeBtn = container.querySelector(
    "#base64-decode"
  ) as HTMLButtonElement | null;
  const clearBtn = container.querySelector(
    "#base64-clear"
  ) as HTMLButtonElement | null;
  const pasteBtn = container.querySelector(
    "#base64-paste"
  ) as HTMLButtonElement | null;
  const copyBtn = container.querySelector(
    "#base64-copy"
  ) as HTMLButtonElement | null;
  const swapBtn = container.querySelector(
    "#base64-swap"
  ) as HTMLButtonElement | null;
  const trimCheckbox = container.querySelector(
    "#base64-trim"
  ) as HTMLInputElement | null;

  if (
    !inputEl ||
    !outputEl ||
    !encodeBtn ||
    !decodeBtn ||
    !clearBtn ||
    !pasteBtn ||
    !copyBtn ||
    !swapBtn ||
    !trimCheckbox
  ) {
    return null;
  }

  return {
    inputEl,
    outputEl,
    encodeBtn,
    decodeBtn,
    clearBtn,
    pasteBtn,
    copyBtn,
    swapBtn,
    trimCheckbox,
  };
}
