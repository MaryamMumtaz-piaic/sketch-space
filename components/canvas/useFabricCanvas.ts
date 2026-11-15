"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, Point } from "fabric";

import {
  ACCENT,
  CANVAS_DARK,
  CANVAS_LIGHT,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "@/lib/constants";
import { redoCanvas, runWithoutHistory, undoCanvas } from "@/lib/fabric/history";
import { toProjectFile } from "@/lib/fabric/serialize";
import { clamp, isTypingTarget } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { CanvasApi, Tool } from "@/types/whiteboard";

type PointerLike = {
  clientX?: number;
  clientY?: number;
  button?: number;
  preventDefault?: () => void;
};

function clientPoint(event: unknown) {
  const e = event as PointerLike;
  return {
    x: e.clientX ?? 0,
    y: e.clientY ?? 0,
    button: e.button ?? 0,
    preventDefault: () => e.preventDefault?.(),
  };
}

export interface CanvasInteraction {
  spaceDown: boolean;
  panning: boolean;
}

function applyMode(
  canvas: Canvas,
  tool: Tool,
  spaceDown: boolean,
  panning: boolean,
  softEraser: boolean,
) {
  const panReady = spaceDown || tool === "hand" || panning;
  // Pencil and the soft eraser are the only tools that draw through Fabric's
  // brush. Everything else uses our own pointer handlers, so hit-testing stays
  // off.
  const brushing = tool === "pencil" || (tool === "eraser" && softEraser);
  canvas.isDrawingMode = brushing && !panReady;
  canvas.selection = tool === "select" && !panReady;
  canvas.skipTargetFind = panReady || (tool !== "select" && !brushing);
}

function applyCursor(
  canvas: Canvas,
  tool: Tool,
  spaceDown: boolean,
  panning: boolean,
) {
  if (panning) {
    canvas.defaultCursor = "grabbing";
    canvas.hoverCursor = "grabbing";
    return;
  }

  if (spaceDown || tool === "hand") {
    canvas.defaultCursor = "grab";
    canvas.hoverCursor = "grab";
    return;
  }

  if (tool === "select") {
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "move";
    return;
  }

  if (tool === "text") {
    canvas.defaultCursor = "text";
    canvas.hoverCursor = "text";
    return;
  }

  canvas.defaultCursor = "crosshair";
  canvas.hoverCursor = "crosshair";
}

interface UseFabricCanvasOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  theme: "light" | "dark";
  onReady?: (api: CanvasApi | null) => void;
}

/**
 * Owns the Fabric canvas lifecycle: creation, responsive sizing, disposal,
 * hand/space/middle-mouse panning, wheel panning, and cursor-centred zoom.
 */
export function useFabricCanvas({
  containerRef,
  canvasRef,
  theme,
  onReady,
}: UseFabricCanvasOptions) {
  const activeTool = useWhiteboardStore((state) => state.activeTool);
  const eraserMode = useWhiteboardStore((state) => state.style.eraserMode);
  const setZoom = useWhiteboardStore((state) => state.setZoom);

  const fabricRef = useRef<Canvas | null>(null);
  const panRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const toolRef = useRef(activeTool);
  const spaceRef = useRef(false);
  const pointerRef = useRef(true);
  const themeRef = useRef(theme);
  const onReadyRef = useRef(onReady);
  const interactionRef = useRef<CanvasInteraction>({
    spaceDown: false,
    panning: false,
  });
  const [spaceDown, setSpaceDown] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Create the canvas once and wire interaction handlers.
  useEffect(() => {
    const container = containerRef.current;
    const canvasElement = canvasRef.current;
    if (!container || !canvasElement) return;

    // Read the theme class directly so the very first painted frame already
    // matches dark mode (next-themes applies the class before hydration).
    const initialBackground = document.documentElement.classList.contains(
      "dark",
    )
      ? CANVAS_DARK
      : CANVAS_LIGHT;

    const canvas = new Canvas(canvasElement, {
      backgroundColor: initialBackground,
      selection: true,
      selectionColor: "rgba(105, 101, 219, 0.1)",
      selectionBorderColor: ACCENT,
      selectionLineWidth: 1.25,
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
    });
    fabricRef.current = canvas;
    setReady(true);

    // Never let the browser start a native image drag from the canvas.
    canvas.upperCanvasEl.draggable = false;
    const preventNativeDrag = (event: DragEvent) => event.preventDefault();
    container.addEventListener("dragstart", preventNativeDrag);

    // Dev-only handle so automated tests can inspect the scene.
    if (process.env.NODE_ENV !== "production") {
      (window as Window & { __sketchspace?: Canvas }).__sketchspace = canvas;
    }

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      canvas.setDimensions({ width, height });
      canvas.calcOffset();
      canvas.requestRenderAll();
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const applyZoom = (next: number, point?: Point) => {
      const zoom = clamp(next, MIN_ZOOM, MAX_ZOOM);
      const center =
        point ?? new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
      canvas.zoomToPoint(center, zoom);
      canvas.requestRenderAll();
      setZoom(zoom);
    };

    const api: CanvasApi = {
      zoomIn: () => applyZoom(canvas.getZoom() * ZOOM_STEP),
      zoomOut: () => applyZoom(canvas.getZoom() / ZOOM_STEP),
      resetZoom: () => {
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.requestRenderAll();
        setZoom(1);
      },
      setZoom: (value) => applyZoom(value),
      getZoom: () => canvas.getZoom(),
      clearCanvas: () => {
        // A confirmed reset is a fresh start, not an undoable edit.
        void runWithoutHistory(() => {
          const objects = canvas.getObjects();
          if (objects.length > 0) canvas.remove(...objects);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        });
      },
      undo: () => undoCanvas(),
      redo: () => redoCanvas(),
      getProjectFile: () => toProjectFile(canvas),
      loadProjectFile: async (project) => {
        await runWithoutHistory(async () => {
          await canvas.loadFromJSON(
            project.canvas as Record<string, unknown>,
          );
          // The project format deliberately excludes the theme background.
          canvas.backgroundColor =
            themeRef.current === "dark" ? CANVAS_DARK : CANVAS_LIGHT;
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        });
        useWhiteboardStore.getState().setActiveTool("select");
      },
      exportImage: ({ format, background, scale }) => {
        const previousBackground = canvas.backgroundColor;
        // JPEG has no alpha channel, so a "background off" JPEG falls back to
        // white rather than a black rectangle.
        if (!background) {
          canvas.backgroundColor = format === "jpeg" ? "#ffffff" : "";
        }

        try {
          if (format === "svg") return canvas.toSVG();
          return canvas.toDataURL({
            format,
            multiplier: scale,
            quality: 0.95,
            enableRetinaScaling: false,
            filter: (object) =>
              !(object as { preview?: boolean }).preview,
          });
        } finally {
          canvas.backgroundColor = previousBackground;
          canvas.requestRenderAll();
        }
      },
    };

    onReadyRef.current?.(api);
    setZoom(1);

    // Native listener so preventDefault works (keeps the page from scrolling
    // and stops the browser's own ctrl + wheel zoom).
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      const deltaX = event.deltaX * unit;
      const deltaY = event.deltaY * unit;

      if (event.ctrlKey || event.metaKey) {
        const factor = Math.pow(0.999, deltaY);
        applyZoom(
          canvas.getZoom() * factor,
          new Point(event.offsetX, event.offsetY),
        );
        return;
      }

      const viewport = canvas.viewportTransform;
      if (!viewport) return;
      viewport[4] -= deltaX;
      viewport[5] -= deltaY;
      canvas.requestRenderAll();
    };

    const upperCanvas = canvas.upperCanvasEl;
    upperCanvas.addEventListener("wheel", handleWheel, { passive: false });

    const handleMouseDown = (opt: { e: unknown }) => {
      const event = clientPoint(opt.e);
      const panGesture =
        spaceRef.current || toolRef.current === "hand" || event.button === 1;
      if (!panGesture) return;

      panRef.current = {
        active: true,
        lastX: event.x,
        lastY: event.y,
      };
      interactionRef.current.panning = true;
      canvas.selection = false;
      canvas.skipTargetFind = true;
      applyCursor(canvas, toolRef.current, spaceRef.current, true);
      event.preventDefault?.();
    };

    const handleMouseMove = (opt: { e: unknown }) => {
      if (!panRef.current.active) return;
      const event = clientPoint(opt.e);
      const viewport = canvas.viewportTransform;
      if (!viewport) return;

      viewport[4] += event.x - panRef.current.lastX;
      viewport[5] += event.y - panRef.current.lastY;
      panRef.current.lastX = event.x;
      panRef.current.lastY = event.y;
      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      if (!panRef.current.active) return;
      panRef.current.active = false;
      interactionRef.current.panning = false;
      applyMode(
        canvas,
        toolRef.current,
        spaceRef.current,
        false,
        useWhiteboardStore.getState().style.eraserMode === "soft",
      );
      applyCursor(canvas, toolRef.current, spaceRef.current, false);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    window.addEventListener("pointerup", handleMouseUp);

    canvas.requestRenderAll();

    return () => {
      observer.disconnect();
      container.removeEventListener("dragstart", preventNativeDrag);
      upperCanvas.removeEventListener("wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      window.removeEventListener("pointerup", handleMouseUp);
      onReadyRef.current?.(null);
      fabricRef.current = null;
      panRef.current.active = false;
      interactionRef.current = { spaceDown: false, panning: false };
      setReady(false);
      if (process.env.NODE_ENV !== "production") {
        (window as Window & { __sketchspace?: Canvas }).__sketchspace =
          undefined;
      }
      void canvas.dispose();
    };
  }, [canvasRef, containerRef, setZoom]);

  // Keep the canvas background in sync with the active theme.
  useEffect(() => {
    themeRef.current = theme;
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = theme === "dark" ? CANVAS_DARK : CANVAS_LIGHT;
    canvas.requestRenderAll();
  }, [theme]);

  // Space-to-pan, without hijacking typing or button activation.
  //
  // `:focus-visible` is unreliable here because browsers flip it on as soon as
  // any key is pressed. Track the input modality ourselves instead: after a
  // mouse click a focused button must still yield to Space-to-pan, while after
  // Tab navigation Space should still activate the button.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      if (isTypingTarget(event.target)) return;

      const { sidebarOpen, helpOpen, exportOpen } =
        useWhiteboardStore.getState();
      if (sidebarOpen || helpOpen || exportOpen) return;

      if (event.target instanceof HTMLElement) {
        const control = event.target.closest(
          "button, a, [role='button'], [role='switch']",
        );
        if (control && !pointerRef.current) return;
      }

      event.preventDefault();
      spaceRef.current = true;
      setSpaceDown(true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      spaceRef.current = false;
      setSpaceDown(false);
    };

    const onBlur = () => {
      spaceRef.current = false;
      setSpaceDown(false);
    };

    // Any pointer press means the user is working with the mouse; Tab means
    // they are navigating by keyboard.
    const markPointer = () => {
      pointerRef.current = true;
    };
    const markKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") pointerRef.current = false;
    };

    window.addEventListener("pointerdown", markPointer, true);
    window.addEventListener("keydown", markKeyboard, true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("pointerdown", markPointer, true);
      window.removeEventListener("keydown", markKeyboard, true);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Selection, pencil / soft-eraser mode and cursors follow the active tool,
  // the pan modifier and the eraser mode.
  useEffect(() => {
    toolRef.current = activeTool;
    interactionRef.current.spaceDown = spaceDown;
    const canvas = fabricRef.current;
    if (!canvas) return;

    applyMode(
      canvas,
      activeTool,
      spaceDown,
      panRef.current.active,
      eraserMode === "soft",
    );
    applyCursor(canvas, activeTool, spaceDown, panRef.current.active);
  }, [activeTool, spaceDown, eraserMode]);

  return { fabricRef, interactionRef, ready };
}
