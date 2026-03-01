export type ClipboardReadResult =
  | { ok: true; text: string }
  | { ok: false; reason: "unavailable" | "failed" };

export type ClipboardWriteResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "failed" };

export async function readClipboardText(): Promise<ClipboardReadResult> {
  if (!navigator.clipboard || !window.isSecureContext) {
    return { ok: false, reason: "unavailable" };
  }

  try {
    const text = await navigator.clipboard.readText();
    return { ok: true, text };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function writeClipboardText(
  text: string
): Promise<ClipboardWriteResult> {
  if (!navigator.clipboard || !window.isSecureContext) {
    return { ok: false, reason: "unavailable" };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
