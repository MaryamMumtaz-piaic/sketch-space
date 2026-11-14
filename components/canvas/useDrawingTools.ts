"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import {
  Canvas,
  Ellipse,
  FabricObject,
  Line,
  PencilBrush,
  Polygon,
  Rect,
  Textbox,
  Triangle,
  type Point,
  type TPointerEvent,
} from "fabric";
import { EraserBrush } from "@erase2d/fabric";
import { nanoid } from "nanoid";

import type { CanvasInteraction } from "@/components/canvas/useFabricCanvas";
import {
  captureHistorySnapshot,
  requestHistorySnapshot,
} from "@/lib/fabric/history";
import {
  boundsBetween,
  completePreview,
  createArrow,
  createArrowhead,
  createLine,
  createText,
  markPreview,
  resizeShape,
  shapeFactory,
  updateArrowParts,
  type ShapeKind,
} from "@/lib/fabric/shapes";
import {
  applyStyleToSelection,
  readStyleFromObject,
  styleSignature,
} from "@/lib/fabric/styles";
import { isTypingTarget } from "@/lib/utils";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";
import type { StyleSettings } from "@/types/whiteboard";

type DrawableKind = ShapeKind | "line" | "arrow";

interface PreviewState {
  active: boolean;
  kind: DrawableKind | null;
  start: Point | null;
  last: Point | null;
  object: Rect | Ellipse | Polygon | Line | null;
  shaft: Line | null;
  head: Triangle | null;
}

const EMPTY_PREVIEW: PreviewState = {
  active: false,
  kind: null,
  start: null,
  last: null,
  object: null,
  shaft: null,
  head: null,
};

const SHAPE_TOOLS: DrawableKind[] = [
  "rectangle",
  "ellipse",
  "diamond",
  "line",
  "arrow",
];

interface UseDrawingToolsOptions {
  canvas: Canvas | null;
  interactionRef: MutableRefObject<CanvasInteraction>;
}

/**
 * Pointer-driven drawing for shapes, lines, arrows, text and the object
 * eraser. The Fabric canvas itself owns lifecycle and pan/zoom; this hook only
 * reacts to `mouse:*` once the canvas is ready.
 */
export function useDrawingTools({
  canvas,
  interactionRef,
}: UseDrawingToolsOptions) {
  const activeTool = useWhiteboardStore((state) => state.activeTool);
  const setActiveTool = useWhiteboardStore((state) => state.setActiveTool);
  const style = useWhiteboardStore((state) => state.style);
  const hydrateStyle = useWhiteboardStore((state) => state.hydrateStyle);
  const setHasSelection = useWhiteboardStore(
    (state) => state.setHasSelection,
  );

  const toolRef = useRef(activeTool);
  const styleRef = useRef<StyleSettings>(style);
  const previewRef = useRef<PreviewState>({ ...EMPTY_PREVIEW });
  const erasingRef = useRef(false);

  useEffect(() => {
    toolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    styleRef.current = style;
  }, [style]);

  // Pencil brush follows the current style. The soft eraser swaps the brush.
  useEffect(() => {
    if (!canvas || style.eraserMode === "soft") return;
    const brush = new PencilBrush(canvas);
    brush.color = style.stroke;
    brush.width = Math.max(1, style.strokeWidth);
    brush.decimate = 1.5;
    canvas.freeDrawingBrush = brush;
  }, [canvas, style.stroke, style.strokeWidth, style.eraserMode]);

  // Soft eraser: clips whatever it passes over instead of deleting whole
  // objects. The gesture is one history step.
  useEffect(() => {
    if (!canvas || style.eraserMode !== "soft") return;
    const eraser = new EraserBrush(canvas);
    eraser.color = "rgba(0, 0, 0, 1)";
    eraser.width = Math.max(12, style.strokeWidth * 6);

    const offEnd = eraser.on("end", (event) => {
      // Commit manually so the snapshot lands after the clip paths exist.
      event.preventDefault();
      const { path, targets } = event.detail;
      void eraser.commit({ path, targets }).then(() => {
        captureHistorySnapshot();
      });
      requestHistorySnapshot();
    });

    canvas.freeDrawingBrush = eraser;
    return () => {
      offEnd();
      eraser.dispose();
      if (canvas.freeDrawingBrush === eraser) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
      }
    };
  }, [canvas, style.eraserMode, style.strokeWidth]);

  // Mirror the active selection back into the style panel.
  useEffect(() => {
    if (!canvas) return;

    const syncFromSelection = () => {
      const active = canvas.getActiveObjects();
      setHasSelection(active.length > 0);
      if (active.length === 0) return;
      hydrateStyle(readStyleFromObject(active[0]));
    };

    const clearSelectionFlag = () => setHasSelection(false);

    canvas.on("selection:created", syncFromSelection);
    canvas.on("selection:updated", syncFromSelection);
    canvas.on("selection:cleared", clearSelectionFlag);

    return () => {
      canvas.off("selection:created", syncFromSelection);
      canvas.off("selection:updated", syncFromSelection);
      canvas.off("selection:cleared", clearSelectionFlag);
    };
  }, [canvas, hydrateStyle, setHasSelection]);

  // Panel changes apply to the current selection as well as the next shape.
  // Applying is idempotent, so the mirror write above causes no extra work, and
  // only a real change becomes an undo step.
  useEffect(() => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    const before = active.map(styleSignature);
    applyStyleToSelection(active, style);
    const changed = active.some(
      (object, index) => styleSignature(object) !== before[index],
    );
    canvas.requestRenderAll();
    if (changed) requestHistorySnapshot();
  }, [canvas, style]);

  useEffect(() => {
    if (!canvas) return;

    const currentStyle = () => styleRef.current;
    const isBusy = () =>
      interactionRef.current.panning || interactionRef.current.spaceDown;

    const resetPreview = () => {
      const preview = previewRef.current;
      if (preview.object) canvas.remove(preview.object);
      if (preview.shaft) canvas.remove(preview.shaft);
      if (preview.head) canvas.remove(preview.head);
      previewRef.current = { ...EMPTY_PREVIEW };
      canvas.requestRenderAll();
    };

    const eraseAt = (point: Point) => {
      const objects = canvas.getObjects();
      for (let index = objects.length - 1; index >= 0; index -= 1) {
        const object = objects[index];
        if (!object.visible || !object.selectable) continue;
        if (object.containsPoint(point)) {
          canvas.remove(object);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          return;
        }
      }
    };

    const startShape = (point: Point, kind: DrawableKind) => {
      const preview: PreviewState = {
        active: true,
        kind,
        start: point,
        last: point,
        object: null,
        shaft: null,
        head: null,
      };

      if (kind === "arrow") {
        const shaft = createLine(point, point, currentStyle());
        const head = createArrowhead(point, point, currentStyle());
        for (const part of [shaft, head]) {
          markPreview(part);
          canvas.add(part);
        }
        preview.shaft = shaft;
        preview.head = head;
      } else if (kind === "line") {
        const line = createLine(point, point, currentStyle());
        markPreview(line);
        canvas.add(line);
        preview.object = line;
      } else {
        const shape = shapeFactory(kind, point, point, currentStyle());
        markPreview(shape);
        canvas.add(shape);
        preview.object = shape;
      }

      previewRef.current = preview;
    };

    const updateShapePreview = (point: Point) => {
      const preview = previewRef.current;
      if (!preview.active || !preview.kind || !preview.start) return;
      preview.last = point;

      if (preview.kind === "arrow" && preview.shaft && preview.head) {
        updateArrowParts(
          preview.shaft,
          preview.head,
          preview.start,
          point,
          currentStyle(),
        );
        canvas.requestRenderAll();
        return;
      }

      if (!preview.object) return;

      if (preview.kind === "line" && preview.object instanceof Line) {
        preview.object.set({ x1: preview.start.x, y1: preview.start.y, x2: point.x, y2: point.y });
        preview.object.setCoords();
      } else if (preview.kind === "diamond") {
        // Polygon layout is computed in the constructor, so a fresh diamond is
        // cheaper (and less error-prone) than mutating its point list.
        const next = shapeFactory(
          "diamond",
          preview.start,
          point,
          currentStyle(),
        );
        markPreview(next);
        canvas.remove(preview.object);
        canvas.add(next);
        preview.object = next;
      } else if (
        preview.object instanceof Rect ||
        preview.object instanceof Ellipse
      ) {
        resizeShape(preview.object, preview.start, point);
      }

      canvas.requestRenderAll();
    };

    const finishShape = () => {
      const preview = previewRef.current;
      if (!preview.active || !preview.kind || !preview.start) return;

      const start = preview.start;
      const end = preview.last ?? start;
      const kind = preview.kind;

      const cancelled = (() => {
        if (kind === "line" || kind === "arrow") {
          return Math.hypot(end.x - start.x, end.y - start.y) < 6;
        }
        const { width, height } = boundsBetween(start, end);
        return width < 3 && height < 3;
      })();

      if (cancelled) {
        resetPreview();
        return;
      }

      if (kind === "arrow") {
        if (preview.shaft) canvas.remove(preview.shaft);
        if (preview.head) canvas.remove(preview.head);
        preview.shaft = null;
        preview.head = null;
        const arrow = createArrow(start, end, currentStyle());
        canvas.add(arrow);
        canvas.setActiveObject(arrow);
      } else if (preview.object) {
        const object = preview.object;
        completePreview(object);
        canvas.setActiveObject(object);
      }

      previewRef.current = { ...EMPTY_PREVIEW };
      canvas.requestRenderAll();
      setActiveTool("select");
      captureHistorySnapshot();
    };

    const handleMouseDown = (opt: { e: TPointerEvent }) => {
      if (isBusy()) return;
      if (opt.e instanceof MouseEvent && opt.e.button !== 0) return;
      const tool = toolRef.current;

      // Flush any pending style snapshot before the scene changes, so undo
      // steps stay aligned with what the user actually did.
      if (tool !== "select" && tool !== "hand") captureHistorySnapshot();

      // A new drawing always starts from a clean selection.
      if (tool !== "select" && tool !== "hand") {
        if (canvas.getActiveObject()) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }

      if (tool === "eraser") {
        if (currentStyle().eraserMode === "soft") return;
        erasingRef.current = true;
        eraseAt(canvas.getScenePoint(opt.e));
        return;
      }

      if (tool === "text") {
        const point = canvas.getScenePoint(opt.e);
        const text = createText(point, currentStyle());
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        setActiveTool("select");
        canvas.requestRenderAll();
        return;
      }

      if (SHAPE_TOOLS.includes(tool as DrawableKind)) {
        startShape(canvas.getScenePoint(opt.e), tool as DrawableKind);
      }
    };

    const handleMouseMove = (opt: { e: TPointerEvent }) => {
      if (erasingRef.current) {
        if (!isBusy()) eraseAt(canvas.getScenePoint(opt.e));
        return;
      }
      if (!previewRef.current.active) return;
      updateShapePreview(canvas.getScenePoint(opt.e));
    };

    const handleMouseUp = () => {
      erasingRef.current = false;
      if (previewRef.current.active) finishShape();
    };

    const handlePathCreated = ({ path }: { path: FabricObject }) => {
      (path as FabricObject & { id: string }).id = nanoid();
      path.erasable = true;
      path.set({
        opacity: currentStyle().opacity / 100,
        strokeUniform: true,
      });
      path.setCoords();
    };

    const handleTextExited = ({ target }: { target: unknown }) => {
      const text = target as Textbox;
      if (text instanceof Textbox && !text.text.trim()) {
        canvas.remove(text);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
      captureHistorySnapshot();
    };

    // Clicking any UI outside the canvas commits the text being edited.
    const handleOutsidePointer = (event: PointerEvent) => {
      const active = canvas.getActiveObject();
      if (!(active instanceof Textbox) || !active.isEditing) return;
      const target = event.target;
      if (
        target instanceof HTMLCanvasElement &&
        (target === canvas.upperCanvasEl || target === canvas.lowerCanvasEl)
      ) {
        return;
      }
      active.exitEditing();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const active = canvas.getActiveObject();
        if (active instanceof Textbox && active.isEditing) {
          event.preventDefault();
          active.exitEditing();
          return;
        }
        if (previewRef.current.active) {
          event.preventDefault();
          resetPreview();
        }
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        !isTypingTarget(event.target)
      ) {
        const objects = canvas.getActiveObjects();
        if (objects.length === 0) return;
        event.preventDefault();
        canvas.remove(...objects);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("path:created", handlePathCreated);
    canvas.on("text:editing:exited", handleTextExited);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointerdown", handleOutsidePointer);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("path:created", handlePathCreated);
      canvas.off("text:editing:exited", handleTextExited);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerup", handleMouseUp);
      window.removeEventListener("pointerdown", handleOutsidePointer);
      previewRef.current = { ...EMPTY_PREVIEW };
      erasingRef.current = false;
    };
  }, [canvas, interactionRef, setActiveTool]);
}
