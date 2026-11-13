import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-[10px] bg-accent font-semibold text-white shadow-sm ring-1 ring-inset ring-white/20",
        size === "sm" ? "h-7 w-7 text-sm" : "h-8 w-8 text-base",
        className,
      )}
    >
      S
    </span>
  );
}
