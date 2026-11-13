"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

/**
 * New shapes follow the theme (black in light mode, white in dark mode) until
 * the user picks a custom stroke colour.
 */
export function ThemeStyleSync() {
  const { resolvedTheme } = useTheme();
  const applyThemeStroke = useWhiteboardStore(
    (state) => state.applyThemeStroke,
  );

  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      applyThemeStroke(resolvedTheme);
    }
  }, [applyThemeStroke, resolvedTheme]);

  return null;
}
