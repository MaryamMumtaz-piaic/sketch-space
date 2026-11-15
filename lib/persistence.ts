"use client";

import { STORAGE_KEY } from "@/lib/constants";
import { parseProjectFile } from "@/lib/fabric/serialize";
import type { ProjectFile } from "@/types/whiteboard";

export type AutosaveResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "unavailable" };

function isQuotaError(error: unknown) {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
}

/** Write the autosave copy, reporting quota problems instead of throwing. */
export function saveAutosave(project: ProjectFile): AutosaveResult {
  if (typeof window === "undefined") return { ok: true };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: isQuotaError(error) ? "quota" : "unavailable",
    };
  }
}

/**
 * Read and validate the autosaved project. A missing or corrupted entry is
 * treated as "nothing to restore" so a bad write can never block startup.
 */
export function readAutosave(): ProjectFile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseProjectFile(raw);
  } catch {
    return null;
  }
}

export function clearAutosave() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // A blocked storage API is not worth interrupting the reset flow.
  }
}
