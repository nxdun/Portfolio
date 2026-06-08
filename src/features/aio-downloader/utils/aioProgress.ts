import type { AioJobSnapshot } from "@/features/aio-downloader";
import { getAioProgressLabel } from "./aioStatus";

export function createAioProgressKey(snapshot: AioJobSnapshot): string {
  return [
    snapshot.status,
    snapshot.progressPercent,
    snapshot.progressSpeed,
    snapshot.progressEta,
    snapshot.progressTotal,
    snapshot.updatedAtUnix,
  ].join("|");
}

export function buildAioProgressMessage(snapshot: AioJobSnapshot): string {
  if (snapshot.progressMessage) {
    return snapshot.progressMessage;
  }

  const label = getAioProgressLabel(snapshot.status);
  const percentText =
    typeof snapshot.progressPercent === "number"
      ? ` ${Math.round(snapshot.progressPercent)}%`
      : "";
  const speedText = snapshot.progressSpeed ? ` ${snapshot.progressSpeed}` : "";
  const etaText = snapshot.progressEta ? ` ETA ${snapshot.progressEta}` : "";

  return `${label}...${percentText}${speedText}${etaText}`.trim();
}

export function buildAioProgressMeta(snapshot: AioJobSnapshot): string {
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
