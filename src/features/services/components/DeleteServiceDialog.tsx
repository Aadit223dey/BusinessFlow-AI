"use client";

import { Service } from "@/types/service";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteServiceDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteServiceDialog({
  service,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteServiceDialogProps) {
  if (!service) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Service"
      description="This action cannot be undone. Please confirm before proceeding."
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">
              Are you sure you want to permanently delete &ldquo;{service.name}&rdquo;?
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Deleting this service removes it from customer discovery, upcoming booking slots, and active offerings.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="default"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl gap-2 font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Service</span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
