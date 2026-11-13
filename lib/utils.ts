type ClassValue = string | false | null | undefined;

/** Tiny class-name helper used by the UI primitives. */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatZoom(zoom: number) {
  return `${Math.round(zoom * 100)}%`;
}

/** True when focus is inside a field where typing should win over shortcuts. */
export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
