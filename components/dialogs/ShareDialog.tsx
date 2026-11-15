"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Link2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { MAX_SHARE_URL_LENGTH } from "@/lib/constants";
import { downloadProject, projectFileName } from "@/lib/download";
import { buildShareLink, copyText } from "@/lib/share";
import { useWhiteboardStore } from "@/stores/useWhiteboardStore";

type ShareState =
  | { mode: "link"; url: string; length: number }
  | { mode: "too-long"; length?: number }
  | { mode: "empty" }
  | { mode: "unavailable" };

interface ShareDialogProps {
  onNotify: (message: string) => void;
}

const number = new Intl.NumberFormat("en-US");

export function ShareDialog({ onNotify }: ShareDialogProps) {
  const open = useWhiteboardStore((state) => state.shareOpen);
  const setOpen = useWhiteboardStore((state) => state.setShareOpen);
  const canvasApi = useWhiteboardStore((state) => state.canvasApi);

  const [share, setShare] = useState<ShareState>({ mode: "empty" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);

    if (!canvasApi) {
      setShare({ mode: "unavailable" });
      return;
    }

    const project = canvasApi.getProjectFile();
    const objects = (project.canvas as { objects?: unknown[] } | undefined)
      ?.objects;
    if (!objects || objects.length === 0) {
      setShare({ mode: "empty" });
      return;
    }

    const result = buildShareLink(project);
    setShare(
      result.ok
        ? { mode: "link", url: result.url, length: result.length }
        : { mode: "too-long", length: result.length },
    );
  }, [open, canvasApi]);

  const handleCopy = async () => {
    if (share.mode !== "link") return;
    const ok = await copyText(share.url);
    onNotify(
      ok
        ? "Share link copied to your clipboard."
        : "Could not copy automatically. Select the link and press Ctrl+C.",
    );
    if (ok) setCopied(true);
  };

  const handleDownload = () => {
    if (!canvasApi) return;
    const filename = projectFileName();
    downloadProject(canvasApi.getProjectFile(), filename);
    onNotify(`Downloaded ${filename}. Send the file instead of a link.`);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Share this drawing"
      description="Anyone with the link gets an editable copy in their own browser."
      footer={
        share.mode === "too-long" ? (
          <>
            <Button size="sm" onClick={handleDownload}>
              <Download size={14} aria-hidden="true" />
              Download project
            </Button>
            <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </>
        ) : share.mode === "link" ? (
          <>
            <Button size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleCopy}>
              <Copy size={14} aria-hidden="true" />
              {copied ? "Copied" : "Copy link"}
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        )
      }
    >
      {share.mode === "link" ? (
        <div className="space-y-3">
          <label
            htmlFor="share-link"
            className="block text-[11px] font-medium text-muted"
          >
            Share link
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-background/60 px-3 py-2 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20">
            <Link2
              size={15}
              strokeWidth={1.9}
              className="shrink-0 text-accent"
              aria-hidden="true"
            />
            <input
              id="share-link"
              readOnly
              value={share.url}
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-foreground outline-none"
            />
          </div>
          <p className="text-[10px] leading-relaxed text-muted">
            {number.format(share.length)} characters. The drawing is compressed
            into the link itself — nothing is uploaded to a server.
          </p>
        </div>
      ) : share.mode === "too-long" ? (
        <div className="space-y-3">
          <div className="flex gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
            <TriangleAlert
              size={16}
              strokeWidth={2}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-relaxed">
              This drawing is too large for a share link. The URL would be{" "}
              <span className="font-semibold">
                about {number.format(share.length ?? MAX_SHARE_URL_LENGTH)}
              </span>{" "}
              characters, and links over{" "}
              {number.format(MAX_SHARE_URL_LENGTH)} characters are unreliable in
              browsers and chat apps.
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Download the project as a <code>.json</code> file instead and send
            that. The other person can open it with{" "}
            <span className="font-medium text-foreground">Open File</span>.
          </p>
        </div>
      ) : share.mode === "unavailable" ? (
        <p className="rounded-xl border border-line bg-background/50 p-3 text-[11px] leading-relaxed text-muted">
          The canvas is still loading. Give it a moment, then try sharing again.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] leading-relaxed text-muted">
            There is nothing to share yet. Draw a shape, write a note or sketch
            something first.
          </p>
          <p className="rounded-xl border border-line bg-background/50 p-3 text-[11px] leading-relaxed text-muted">
            Tip: you can also use{" "}
            <span className="font-medium text-foreground">Save Project</span>{" "}
            from the menu to download a file.
          </p>
        </div>
      )}
    </Dialog>
  );
}
