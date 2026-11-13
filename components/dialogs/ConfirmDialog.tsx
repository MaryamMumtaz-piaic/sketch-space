"use client";

import { Trash } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            <Trash size={14} strokeWidth={2} aria-hidden="true" />
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
          <Trash size={15} strokeWidth={2} aria-hidden="true" />
        </span>
        <p>
          This action cannot be undone. Make sure you have saved anything you
          want to keep.
        </p>
      </div>
    </Dialog>
  );
}
