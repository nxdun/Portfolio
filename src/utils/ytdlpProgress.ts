import type { YtdlpJobSnapshot } from "@/scripts/tools/ytdlp/apiClient";
import { getYtdlpProgressLabel } from "./ytdlpStatus";

export function createYtdlpProgressKey(snapshot: YtdlpJobSnapshot): string {
  return [
    snapshot.status,
    snapshot.progressPercent,
    snapshot.progressSpeed,
    snapshot.progressEta,
    snapshot.progressTotal,
    snapshot.updatedAtUnix,
  ].join("|");
}

export function buildYtdlpProgressMessage(snapshot: YtdlpJobSnapshot): string {
  if (snapshot.progressMessage) {
    return snapshot.progressMessage;
  }

  const label = getYtdlpProgressLabel(snapshot.status);
  const percentText =
    typeof snapshot.progressPercent === "number"
      ? ` ${Math.round(snapshot.progressPercent)}%`
      : "";
  const speedText = snapshot.progressSpeed ? ` ${snapshot.progressSpeed}` : "";
  const etaText = snapshot.progressEta ? ` ETA ${snapshot.progressEta}` : "";

  return `${label}...${percentText}${speedText}${etaText}`.trim();
}

export function buildYtdlpProgressMeta(snapshot: YtdlpJobSnapshot): string {
  const parts: string[] = [];

  if (typeof snapshot.progressPercent === "number") {
    parts.push(`${Math.round(snapshot.progressPercent)}%`);
  }

  if (snapshot.progressSpeed) {
    parts.push(snapshot.progressSpeed);
  }

  if (snapshot.progressTotal) {
    parts.push(snapshot.progressTotal);
  }

  if (snapshot.progressEta) {
    parts.push(`ETA ${snapshot.progressEta}`);
  }

  return parts.join(" • ") || "Waiting for progress...";
}
