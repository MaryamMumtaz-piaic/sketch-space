import { cn } from "@/lib/utils";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-line bg-surface-solid px-4 py-2 text-center text-xs font-medium text-foreground shadow-island transition-all duration-200",
        message
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0",
      )}
    >
      {message ?? ""}
    </div>
  );
}
