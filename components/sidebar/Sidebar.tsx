"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTheme } from "next-themes";
import {
  CircleQuestionMark,
  Image as ImageIcon,
  Moon,
  Save,
  Sun,
  Trash,
  Upload,
  X,
} from "lucide-react";

import { SidebarItem } from "@/components/sidebar/SidebarItem";
import { IconButton } from "@/components/ui/IconButton";
import { Logo } from "@/components/ui/Logo";
import { APP_NAME } from "@/lib/constants";
import { downloadProject, projectFileName } from "@/lib/download";
import {
  parseProjectFile,
  ProjectFileError,
} from "@/lib/fabric/serialize";
import { saveAutosave } from "@/lib/persistence";
import { cn } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

interface SidebarProps {
  onNotify: (message: string) => void;
  onReset: () => void;
}

export function Sidebar({ onNotify, onReset }: SidebarProps) {
  const open = useWhiteboardStore((state) => state.sidebarOpen);
  const setOpen = useWhiteboardStore((state) => state.setSidebarOpen);
  const setHelpOpen = useWhiteboardStore((state) => state.setHelpOpen);
  const setExportOpen = useWhiteboardStore((state) => state.setExportOpen);
  const canvasApi = useWhiteboardStore((state) => state.canvasApi);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Moving the panel offscreen must not leave focus (and its tooltip) behind.
  useEffect(() => {
    if (open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && panelRef.current?.contains(active)) {
      active.blur();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const isDark = mounted && theme === "dark";

  const handleSaveProject = () => {
    setOpen(false);
    if (!canvasApi) {
      onNotify("The canvas is not ready yet. Give it a moment and try again.");
      return;
    }

    const project = canvasApi.getProjectFile();
    const filename = projectFileName();
    downloadProject(project, filename);

    const result = saveAutosave(project);
    onNotify(
      result.ok
        ? `Saved ${filename}.`
        : `Downloaded ${filename}, but browser autosave failed — storage is full.`,
    );
  };

  const handleOpenFile = () => {
    setOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow choosing the same file again after fixing it.
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      onNotify("Choose a SketchSpace .json project file.");
      return;
    }

    if (!canvasApi) {
      onNotify("The canvas is not ready yet. Give it a moment and try again.");
      return;
    }

    try {
      const project = parseProjectFile(await file.text());
      await canvasApi.loadProjectFile(project);
      const result = saveAutosave(project);
      onNotify(
        result.ok
          ? "Drawing loaded."
          : "Drawing loaded, but browser autosave failed — storage is full.",
      );
    } catch (error) {
      onNotify(
        error instanceof ProjectFileError
          ? error.message
          : "That file could not be opened. Choose a SketchSpace .json project.",
      );
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="SketchSpace menu"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[304px] max-w-[86vw] flex-col overflow-hidden border-r border-line bg-surface-solid shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Logo />
            <div>
              <p className="text-sm font-semibold leading-5 tracking-tight">
                {APP_NAME}
              </p>
              <p className="text-[10px] leading-4 text-muted">
                Infinite whiteboard
              </p>
            </div>
          </div>
          <IconButton
            icon={X}
            label="Close menu"
            shortcut="Esc"
            onClick={() => setOpen(false)}
          />
        </div>

        <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            File
          </p>
          <div className="space-y-0.5">
            <SidebarItem
              icon={Upload}
              label="Open File"
              description="Load a .json drawing"
              onClick={handleOpenFile}
            />
            <SidebarItem
              icon={Save}
              label="Save Project"
              description="Download and autosave"
              onClick={handleSaveProject}
            />
            <SidebarItem
              icon={ImageIcon}
              label="Export as Image"
              description="PNG, JPEG or SVG"
              onClick={() => {
                setOpen(false);
                setExportOpen(true);
              }}
            />
          </div>

          <p className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Canvas
          </p>
          <div className="space-y-0.5">
            <SidebarItem
              icon={Trash}
              label="Reset Canvas"
              description="Clear everything"
              danger
              onClick={() => {
                setOpen(false);
                onReset();
              }}
            />
            <SidebarItem
              icon={CircleQuestionMark}
              label="Help & Shortcuts"
              description="Guide and keyboard map"
              shortcut="?"
              onClick={() => setHelpOpen(true)}
            />
          </div>

          <p className="mb-1 mt-5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Appearance
          </p>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-background/50 px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-solid text-foreground/70">
                {isDark ? (
                  <Moon size={16} strokeWidth={1.9} />
                ) : (
                  <Sun size={16} strokeWidth={1.9} />
                )}
              </span>
              <span>
                <span className="block text-[13px] font-medium leading-5">
                  Dark mode
                </span>
                <span className="block text-[10px] leading-4 text-muted">
                  Remembered on this device
                </span>
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label="Toggle dark mode"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-solid",
                isDark ? "bg-accent" : "bg-line",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                  isDark ? "translate-x-[18px]" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </div>

        <div className="border-t border-line px-4 py-3">
          <div className="flex items-center justify-between text-[10px] text-muted">
            <span>Day 4 preview</span>
            <span className="font-medium tabular-nums">v0.4.0</span>
          </div>
        </div>
      </aside>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
}
