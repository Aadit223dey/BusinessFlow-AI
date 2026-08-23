"use client";

import { useState } from "react";
import { Service, ServiceFilterParams } from "@/types/service";
import { ServiceFormValues } from "@/features/services/schemas/service-schema";
import { useServicesManager } from "@/features/services/hooks/use-services-manager";
import { ServiceManagementHeader } from "@/features/services/components/ServiceManagementHeader";
import { ServiceFilterBar } from "@/features/services/components/ServiceFilterBar";
import { ServiceTable } from "@/features/services/components/ServiceTable";
import { ServiceCardGrid } from "@/features/services/components/ServiceCardGrid";
import { ServiceFormDrawer } from "@/features/services/components/ServiceFormDrawer";
import { DeleteServiceDialog } from "@/features/services/components/DeleteServiceDialog";
import { ServiceManagementSkeleton } from "@/features/services/components/ServiceManagementSkeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "@/components/ui/toast";
import { Briefcase, SearchX } from "lucide-react";

export default function BusinessOwnerServicesPage() {
  const [filters, setFilters] = useState<ServiceFilterParams>({
    search: "",
    categoryId: "all",
    status: "all",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const {
    services,
    categories,
    isLoading,
    createService,
    isCreating,
    updateService,
    isUpdating,
    toggleStatus,
    deleteService,
    isDeleting,
  } = useServicesManager(filters);

  // Handlers
  const handleOpenCreate = () => {
    setServiceToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setServiceToEdit(service);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: ServiceFormValues) => {
    try {
      if (serviceToEdit) {
        await updateService({ id: serviceToEdit.id, values });
        toast.success("Service Updated", {
          description: `"${values.name}" has been successfully updated.`,
        });
      } else {
        await createService(values);
        toast.success("Service Created", {
          description: `"${values.name}" is now available in your catalog.`,
        });
      }
    } catch (err: any) {
      toast.error("Operation Failed", {
        description: err.message || "Unable to save service changes.",
      });
      throw err;
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const nextStatus = !service.isActive;
      await toggleStatus({ id: service.id, isActive: nextStatus });
      toast.success(nextStatus ? "Service Activated" : "Service Deactivated", {
        description: `"${service.name}" is now ${nextStatus ? "visible for client bookings" : "hidden from booking discovery"}.`,
      });
    } catch (err: any) {
      toast.error("Update Failed", {
        description: err.message || "Could not toggle service status.",
      });
    }
  };

  const handleOpenDelete = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete.id);
      toast.success("Service Deleted", {
        description: `"${serviceToDelete.name}" was removed from your catalog.`,
      });
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err: any) {
      toast.error("Deletion Failed", {
        description: err.message || "Could not delete this service.",
      });
    }
  };

  const activeCount = services.filter((s) => s.isActive).length;
  const hasActiveFilters =
    Boolean(filters.search?.trim()) ||
    (filters.categoryId && filters.categoryId !== "all") ||
    (filters.status && filters.status !== "all");

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <ServiceManagementHeader
        totalCount={services.length}
        activeCount={activeCount}
        onAddService={handleOpenCreate}
      />

      {/* Filter Bar */}
      <ServiceFilterBar
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        totalResults={services.length}
      />

      {/* Content Canvas */}
      {isLoading ? (
        <ServiceManagementSkeleton />
      ) : services.length === 0 ? (
        hasActiveFilters ? (
          <div className="rounded-2xl border border-border/80 bg-card/60 p-8 backdrop-blur-md">
            <EmptyState
              icon={<SearchX className="h-8 w-8 text-muted-foreground" />}
              title="No Matching Services"
              description={`No services match your active search or status filters.`}
              actionLabel="Reset Search Filters"
              onActionTrigger={() =>
                setFilters({ search: "", categoryId: "all", status: "all" })
              }
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-card/60 p-8 backdrop-blur-md">
            <EmptyState
              icon={<Briefcase className="h-8 w-8 text-brand-primary" />}
              title="No Services Created Yet"
              description="Add your first service to start offering appointments, pricing packages, and session options to your clients."
              actionLabel="Create First Service"
              onActionTrigger={handleOpenCreate}
            />
          </div>
        )
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ServiceTable
              services={services}
              onEdit={handleOpenEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleOpenDelete}
            />
          </div>

          {/* Mobile / Tablet Card Grid View */}
          <div className="block md:hidden">
            <ServiceCardGrid
              services={services}
              onEdit={handleOpenEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleOpenDelete}
            />
          </div>
        </div>
      )}

      {/* Create / Edit Drawer */}
      <ServiceFormDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        serviceToEdit={serviceToEdit}
        categories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteServiceDialog
        service={serviceToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
