const STATUS_MAX_LENGTH = 80;

export type YtdlpTerminalState = "success" | "fail";

export function normalizeYtdlpJobStatus(status: string): string {
  return status.trim().toLowerCase().slice(0, STATUS_MAX_LENGTH);
}

export function isYtdlpSuccessStatus(status: string): boolean {
  const normalized = normalizeYtdlpJobStatus(status);
  return ["completed", "complete", "done", "finished", "success"].includes(
    normalized
  );
}

export function isYtdlpFailureStatus(status: string): boolean {
  const normalized = normalizeYtdlpJobStatus(status);
  return ["failed", "error", "cancelled", "canceled"].includes(normalized);
}

export function toYtdlpTerminalState(
  status: string
): YtdlpTerminalState | null {
  if (isYtdlpSuccessStatus(status)) {
    return "success";
  }

  if (isYtdlpFailureStatus(status)) {
    return "fail";
  }

  return null;
}

export function getYtdlpProgressLabel(status: string): string {
  const normalized = normalizeYtdlpJobStatus(status);

  if (["queued", "pending", "waiting"].includes(normalized)) {
    return "Queued";
  }

  if (["running", "downloading", "processing"].includes(normalized)) {
    return "Downloading";
  }

  if (
    ["extracting", "preparing", "analyzing", "metadata"].includes(normalized)
  ) {
    return "Preparing";
  }

  if (
    ["merging", "muxing", "finalizing", "postprocessing"].includes(normalized)
  ) {
    return "Finalizing";
  }

  if (isYtdlpSuccessStatus(normalized)) {
    return "Finishing";
  }

  if (isYtdlpFailureStatus(normalized)) {
    return "Failed";
  }

  return "Processing";
}
