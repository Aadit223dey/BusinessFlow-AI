"use client";

import { Service } from "@/types/service";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { Clock, Edit2, Trash2, Power, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardGridProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServiceCardGrid({
  services,
  onEdit,
  onToggleStatus,
  onDelete,
}: ServiceCardGridProps) {
  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(price);
    } catch {
      return `$${price.toFixed(2)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5 backdrop-blur-md shadow-sm space-y-4"
        >
          {/* Header info */}
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary font-bold overflow-hidden border border-brand-primary/20">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">
                    {service.name}
                  </h3>
                  {service.category && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <Layers className="h-3 w-3" />
                      <span>{service.category.name}</span>
                    </span>
                  )}
                </div>
              </div>

              <ServiceStatusBadge isActive={service.isActive} />
            </div>

            {service.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {service.description}
              </p>
            )}
          </div>

          {/* Pricing & Duration Bar */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{service.durationMinutes} mins</span>
              {service.bufferTimeMinutes > 0 && (
                <span className="text-[10px]">(+{service.bufferTimeMinutes}m)</span>
              )}
            </div>

            <div className="font-mono font-extrabold text-foreground text-base">
              {formatPrice(service.price, service.currency)}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
            <button
              onClick={() => onToggleStatus(service)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Power className="h-3.5 w-3.5" />
              <span>{service.isActive ? "Deactivate" : "Activate"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(service)}
                className="rounded-lg h-7 px-2.5 text-xs gap-1"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </Button>

              <button
                onClick={() => onDelete(service)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete service"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
