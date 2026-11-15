"use client";

import type { ExportFormat } from "@/types/whiteboard";

const EXTENSIONS: Record<ExportFormat, string> = {
  png: "png",
  jpeg: "jpg",
  svg: "svg",
};

/** Local calendar date, so the filename matches the user's day. */
function fileStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function projectFileName(date = new Date()) {
  return `sketchspace-${fileStamp(date)}.json`;
}

export function exportFileName(format: ExportFormat, date = new Date()) {
  return `sketchspace-${fileStamp(date)}.${EXTENSIONS[format]}`;
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadText(
  text: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  try {
    triggerDownload(url, filename);
  } finally {
    // Give the browser a moment to start the download before revoking.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function downloadProject(project: unknown, filename: string) {
  downloadText(
    JSON.stringify(project, null, 2),
    filename,
    "application/json;charset=utf-8",
  );
}

/** Data URLs (PNG / JPEG) can be used as a download link directly. */
export function downloadDataUrl(dataUrl: string, filename: string) {
  triggerDownload(dataUrl, filename);
}
