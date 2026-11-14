import "fabric";

/**
 * `@erase2d/fabric` erases objects by clipping them with the eraser path, and
 * reads a custom `erasable` flag to decide what the soft eraser may touch.
 * These augmentations keep that flag typed in our own code.
 */
declare module "fabric" {
  interface FabricObject {
    erasable?: boolean | "deep";
    /** True only while a shape is still being dragged out. */
    preview?: boolean;
  }

  interface SerializedObjectProps {
    erasable?: boolean | "deep";
    preview?: boolean;
  }
}
