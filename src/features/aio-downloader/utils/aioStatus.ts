const STATUS_MAX_LENGTH = 80;

export type AioTerminalState = "success" | "fail";

export function normalizeAioJobStatus(status: string): string {
  return status.trim().toLowerCase().slice(0, STATUS_MAX_LENGTH);
}

export function isAioSuccessStatus(status: string): boolean {
  const normalized = normalizeAioJobStatus(status);
  return ["completed", "complete", "done", "finished", "success"].includes(
    normalized
  );
}

export function isAioFailureStatus(status: string): boolean {
  const normalized = normalizeAioJobStatus(status);
  return ["failed", "fail", "error", "cancelled", "canceled"].includes(
    normalized
  );
}

export function toAioTerminalState(status: string): AioTerminalState | null {
  if (isAioSuccessStatus(status)) {
    return "success";
  }

  if (isAioFailureStatus(status)) {
    return "fail";
  }

  return null;
}

export function getAioProgressLabel(status: string): string {
  const normalized = normalizeAioJobStatus(status);

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

  if (isAioSuccessStatus(normalized)) {
    return "Finishing";
  }

  if (isAioFailureStatus(normalized)) {
    return "Failed";
  }

  return "Processing";
}
