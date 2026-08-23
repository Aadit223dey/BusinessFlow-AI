"use client";

import { useState } from "react";
import { Service } from "@/types/service";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { Clock, MoreVertical, Edit2, Trash2, Power, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServiceTable({
  services,
  onEdit,
  onToggleStatus,
  onDelete,
}: ServiceTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
    <div className="relative overflow-visible rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Service Details</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Duration</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {services.map((service) => (
              <tr
                key={service.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                {/* Service Details */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary font-bold overflow-hidden border border-brand-primary/20">
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
                    <div className="min-w-0 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm truncate">
                          {service.name}
                        </span>
                        {service.isFeatured && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Featured
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  {service.category ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      <span>{service.category.name}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      General
                    </span>
                  )}
                </td>

                {/* Duration */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{service.durationMinutes}m</span>
                    {service.bufferTimeMinutes > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        (+{service.bufferTimeMinutes}m buffer)
                      </span>
                    )}
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-4 font-mono font-bold text-foreground text-sm">
                  {formatPrice(service.price, service.currency)}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <ServiceStatusBadge isActive={service.isActive} />
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="relative inline-flex items-center gap-1.5 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(service)}
                      className="rounded-lg h-8 px-2.5 text-xs gap-1"
                      title="Edit Service"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === service.id ? null : service.id
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuId === service.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-0 top-9 z-40 w-44 rounded-xl border border-border bg-card/95 p-1 shadow-xl backdrop-blur-xl animate-scale-in space-y-0.5">
                            <button
                              onClick={() => {
                                onToggleStatus(service);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left"
                            >
                              <Power className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>
                                {service.isActive ? "Deactivate" : "Activate"}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                onDelete(service);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Service</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
