"use client";

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

import { MAX_SHARE_URL_LENGTH } from "@/lib/constants";
import {
  parseProjectFile,
  ProjectFileError,
} from "@/lib/fabric/serialize";
import type { ProjectFile } from "@/types/whiteboard";

export const SHARE_HASH_PREFIX = "#data=";

/** A readable error for every share-link problem the UI can hit. */
export class ShareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShareError";
  }
}

export type ShareLinkResult =
  | { ok: true; url: string; length: number }
  | { ok: false; reason: "too-long" | "unavailable"; length?: number };

/** Compress a project into the URI-safe payload used after `#data=`. */
export function encodeProject(project: ProjectFile): string {
  return compressToEncodedURIComponent(JSON.stringify(project));
}

/**
 * Decode and validate a share payload. Every failure becomes a `ShareError`
 * whose message is safe to show in a toast.
 */
export function decodeSharePayload(payload: string): ProjectFile {
  const cleaned = payload.trim();
  if (!cleaned) {
    throw new ShareError("This share link is empty.");
  }

  let json: string | null = null;
  try {
    json = decompressFromEncodedURIComponent(cleaned);
  } catch {
    throw new ShareError(
      "This share link is damaged. Ask for a new link or a project file.",
    );
  }

  if (!json) {
    throw new ShareError(
      "This share link is damaged. Ask for a new link or a project file.",
    );
  }

  try {
    return parseProjectFile(json);
  } catch (error) {
    throw new ShareError(
      error instanceof ProjectFileError
        ? `This share link could not be opened: ${error.message}`
        : "This share link could not be opened. Ask for a new link or a project file.",
    );
  }
}

/** The raw payload from `#data=...`, or `null` when the hash is unrelated. */
export function readSharePayload(hash = window.location.hash): string | null {
  if (!hash.startsWith(SHARE_HASH_PREFIX)) return null;
  const payload = hash.slice(SHARE_HASH_PREFIX.length);
  return payload.length > 0 ? payload : null;
}

/**
 * Remove a consumed share payload from the address bar. The drawing is loaded
 * into the board and autosaved, so a refresh should not re-open the link.
 */
export function clearShareHash() {
  if (typeof window === "undefined") return;
  if (!window.location.hash.startsWith(SHARE_HASH_PREFIX)) return;
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`,
  );
}

/** Build the full share URL, refusing links that browsers cannot handle well. */
export function buildShareLink(project: ProjectFile): ShareLinkResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  const payload = encodeProject(project);
  const base = `${window.location.origin}${window.location.pathname}`;
  const url = `${base}${SHARE_HASH_PREFIX}${payload}`;

  if (url.length > MAX_SHARE_URL_LENGTH) {
    return { ok: false, reason: "too-long", length: url.length };
  }

  return { ok: true, url, length: url.length };
}

/**
 * Clipboard write with a fallback for browsers that block the async API. The
 * hidden textarea path also works on plain-HTTP previews.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy copy path.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
