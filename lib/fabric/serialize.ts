"use client";

import type { Canvas } from "fabric";

import type { ProjectFile } from "@/types/whiteboard";

export const PROJECT_TYPE = "whiteboard";
export const PROJECT_SOURCE = "sketch-space";
export const PROJECT_VERSION = 1;

interface SerializedScene {
  objects?: { preview?: boolean }[];
  background?: unknown;
  overlay?: unknown;
  [key: string]: unknown;
}

/** A readable error for every invalid-file case the UI can hit. */
export class ProjectFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectFileError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Canvas → project file. Previews (half-drawn shapes) and the theme background
 * are stripped so a file restores cleanly in either theme.
 */
export function toProjectFile(canvas: Canvas, now = new Date()): ProjectFile {
  const serialized = canvas.toJSON() as unknown as SerializedScene;
  if (serialized.objects) {
    serialized.objects = serialized.objects.filter((object) => !object.preview);
  }
  delete serialized.background;
  delete serialized.overlay;

  return {
    type: PROJECT_TYPE,
    version: PROJECT_VERSION,
    source: PROJECT_SOURCE,
    savedAt: now.toISOString(),
    canvas: serialized,
  };
}

/**
 * Project file → validated object. Accepts the raw JSON text from a file or
 * `localStorage`, or an already parsed value. Throws `ProjectFileError` with a
 * message that is safe to show to the user.
 */
export function parseProjectFile(input: unknown): ProjectFile {
  let value = input;

  if (typeof input === "string") {
    try {
      value = JSON.parse(input) as unknown;
    } catch {
      throw new ProjectFileError(
        "That file is not valid JSON. Choose a SketchSpace project file.",
      );
    }
  }

  if (!isRecord(value)) {
    throw new ProjectFileError(
      "This is not a SketchSpace project file.",
    );
  }

  if (value.type !== PROJECT_TYPE) {
    throw new ProjectFileError(
      "This is not a SketchSpace project file.",
    );
  }

  if (typeof value.version !== "number" || !Number.isInteger(value.version)) {
    throw new ProjectFileError(
      "This SketchSpace project has an invalid version number.",
    );
  }

  if (value.version > PROJECT_VERSION) {
    throw new ProjectFileError(
      "This project was made with a newer version of SketchSpace. Update the app and try again.",
    );
  }

  if (value.version !== PROJECT_VERSION) {
    throw new ProjectFileError(
      "This project uses an unsupported SketchSpace version.",
    );
  }

  if (!isRecord(value.canvas) || !Array.isArray(value.canvas.objects)) {
    throw new ProjectFileError(
      "This project file is damaged or incomplete. Try another file.",
    );
  }

  return {
    type: PROJECT_TYPE,
    version: PROJECT_VERSION,
    source: PROJECT_SOURCE,
    savedAt:
      typeof value.savedAt === "string"
        ? value.savedAt
        : new Date().toISOString(),
    canvas: value.canvas,
  };
}
