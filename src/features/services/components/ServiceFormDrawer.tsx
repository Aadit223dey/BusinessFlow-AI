"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Service, ServiceCategory } from "@/types/service";
import {
  serviceFormSchema,
  ServiceFormValues,
} from "@/features/services/schemas/service-schema";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, DollarSign, Clock, Layers, Check, Image as ImageIcon } from "lucide-react";

interface ServiceFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: Service | null;
  categories: ServiceCategory[];
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export function ServiceFormDrawer({
  isOpen,
  onClose,
  serviceToEdit,
  categories,
  onSubmit,
  isSubmitting,
}: ServiceFormDrawerProps) {
  const isEditMode = Boolean(serviceToEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: 50,
      durationMinutes: 45,
      bufferTimeMinutes: 0,
      isActive: true,
      imageUrl: "",
    },
  });

  const selectedDuration = watch("durationMinutes");
  const isActive = watch("isActive");

  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        reset({
          name: serviceToEdit.name,
          description: serviceToEdit.description || "",
          categoryId: serviceToEdit.categoryId || "",
          price: serviceToEdit.price,
          durationMinutes: serviceToEdit.durationMinutes,
          bufferTimeMinutes: serviceToEdit.bufferTimeMinutes || 0,
          isActive: serviceToEdit.isActive,
          imageUrl: serviceToEdit.imageUrl || "",
        });
      } else {
        reset({
          name: "",
          description: "",
          categoryId: "",
          price: 50,
          durationMinutes: 45,
          bufferTimeMinutes: 0,
          isActive: true,
          imageUrl: "",
        });
      }
    }
  }, [isOpen, serviceToEdit, reset]);

  const handleFormSubmit = async (data: ServiceFormValues) => {
    await onSubmit({
      ...data,
      categoryId: data.categoryId && data.categoryId !== "" ? data.categoryId : null,
      description: data.description && data.description.trim() !== "" ? data.description : null,
      imageUrl: data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : null,
    });
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Service" : "Create New Service"}
      description={
        isEditMode
          ? `Update parameters and pricing for "${serviceToEdit?.name}"`
          : "Configure a new service offering for client discovery and scheduling."
      }
      widthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-6 pt-2">
        {/* Service Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
            <span>Service Name *</span>
            {errors.name && (
              <span className="text-destructive text-[11px] font-normal normal-case">
                {errors.name.message}
              </span>
            )}
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Deep Tissue Massage, Initial Consultation"
            hasError={Boolean(errors.name)}
            className="rounded-xl bg-muted/40"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Category</span>
            </span>
          </label>
          <select
            {...register("categoryId")}
            className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/40 cursor-pointer"
          >
            <option value="">General / Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span>Price (USD) *</span>
              </span>
              {errors.price && (
                <span className="text-destructive text-[11px] font-normal normal-case">
                  {errors.price.message}
                </span>
              )}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("price", { valueAsNumber: true })}
              placeholder="0.00"
              hasError={Boolean(errors.price)}
              className="rounded-xl bg-muted/40 font-mono font-semibold"
            />
          </div>

          {/* Buffer Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-teal-500" />
                <span>Buffer Time (mins)</span>
              </span>
            </label>
            <Input
              type="number"
              min="0"
              step="5"
              {...register("bufferTimeMinutes", { valueAsNumber: true })}
              placeholder="0"
              className="rounded-xl bg-muted/40 font-mono"
            />
          </div>
        </div>

        {/* Duration Selection (Chips + Custom Input) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-primary" />
              <span>Session Duration (Minutes) *</span>
            </span>
            {errors.durationMinutes && (
              <span className="text-destructive text-[11px] font-normal normal-case">
                {errors.durationMinutes.message}
              </span>
            )}
          </label>

          {/* Preset Chips */}
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((preset) => {
              const isSelected = selectedDuration === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue("durationMinutes", preset, { shouldValidate: true })}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {preset}m
                </button>
              );
            })}
          </div>

          {/* Custom Duration Input */}
          <div className="pt-1">
            <Input
              type="number"
              min="5"
              max="1440"
              {...register("durationMinutes", { valueAsNumber: true })}
              placeholder="Custom duration in minutes"
              hasError={Boolean(errors.durationMinutes)}
              className="rounded-xl bg-muted/40 font-mono text-xs"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
            <span>Description</span>
            {errors.description && (
              <span className="text-destructive text-[11px] font-normal normal-case">
                {errors.description.message}
              </span>
            )}
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Detailed description of what clients receive during this service..."
            className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-y"
          />
        </div>

        {/* Image URL (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Image URL (Optional)</span>
          </label>
          <Input
            {...register("imageUrl")}
            placeholder="https://example.com/service-image.jpg"
            hasError={Boolean(errors.imageUrl)}
            className="rounded-xl bg-muted/40 text-xs"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/30 p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">Active for Online Booking</p>
            <p className="text-[11px] text-muted-foreground">
              When enabled, customers can discover and book this service.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setValue("isActive", !isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="default"
            disabled={isSubmitting}
            className="rounded-xl gap-2 font-bold px-5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{isEditMode ? "Save Changes" : "Create Service"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
