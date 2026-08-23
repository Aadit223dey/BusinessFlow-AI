import { supabase } from "@/lib/supabase";
import { Service, ServiceCategory, ServiceFilterParams } from "@/types/service";
import { ServiceFormValues } from "@/features/services/schemas/service-schema";

export async function fetchOwnerServices(filters?: ServiceFilterParams): Promise<Service[]> {
  try {
    let query = supabase
      .from("services")
      .select(`
        id,
        tenant_id,
        category_id,
        name,
        slug,
        description,
        price,
        currency,
        duration_minutes,
        buffer_time_minutes,
        image_url,
        is_active,
        is_featured,
        created_at,
        updated_at,
        category:service_categories (id, tenant_id, name, slug, description, display_order, is_active, created_at, updated_at)
      `)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("is_active", filters.status === "active");
    }

    if (filters?.categoryId && filters.categoryId !== "all") {
      query = query.eq("category_id", filters.categoryId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("⚠️ [Service Management] Error fetching owner services:", error.message);
      return [];
    }

    let services: Service[] = (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      categoryId: row.category_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: Number(row.price || 0),
      currency: row.currency || "USD",
      durationMinutes: row.duration_minutes || 30,
      bufferTimeMinutes: row.buffer_time_minutes || 0,
      imageUrl: row.image_url,
      isActive: row.is_active ?? true,
      isFeatured: row.is_featured ?? false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      category: row.category
        ? {
            id: row.category.id,
            tenantId: row.category.tenant_id,
            name: row.category.name,
            slug: row.category.slug,
            description: row.category.description,
            displayOrder: row.category.display_order,
            isActive: row.category.is_active,
            createdAt: row.category.created_at,
            updatedAt: row.category.updated_at,
          }
        : null,
    }));

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      services = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category?.name.toLowerCase().includes(q)
      );
    }

    return services;
  } catch (err) {
    console.error("❌ [Service Management] Exception fetching services:", err);
    return [];
  }
}

export async function fetchOwnerCategories(): Promise<ServiceCategory[]> {
  try {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.warn("⚠️ [Service Management] Error fetching categories:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      displayOrder: row.display_order || 0,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error("❌ [Service Management] Exception fetching categories:", err);
    return [];
  }
}

export async function createService(values: ServiceFormValues, tenantId?: string): Promise<void> {
  let resolvedTenantId = tenantId;

  if (!resolvedTenantId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();
      resolvedTenantId = profile?.tenant_id || undefined;
    }
  }

  if (!resolvedTenantId) {
    throw new Error("Tenant context missing. Unable to create service without an active business tenant.");
  }

  const slug =
    values.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 7);

  const { error } = await supabase.from("services").insert({
    tenant_id: resolvedTenantId,
    category_id: values.categoryId || null,
    name: values.name,
    slug,
    description: values.description || null,
    price: values.price,
    duration_minutes: values.durationMinutes,
    buffer_time_minutes: values.bufferTimeMinutes,
    image_url: values.imageUrl || null,
    is_active: values.isActive,
  });

  if (error) throw new Error(error.message);
}

export async function updateService(id: string, values: Partial<ServiceFormValues>): Promise<void> {
  const payload: any = {};
  if (values.name !== undefined) payload.name = values.name;
  if (values.description !== undefined) payload.description = values.description || null;
  if (values.price !== undefined) payload.price = values.price;
  if (values.durationMinutes !== undefined) payload.duration_minutes = values.durationMinutes;
  if (values.bufferTimeMinutes !== undefined) payload.buffer_time_minutes = values.bufferTimeMinutes;
  if (values.categoryId !== undefined) payload.category_id = values.categoryId || null;
  if (values.imageUrl !== undefined) payload.image_url = values.imageUrl || null;
  if (values.isActive !== undefined) payload.is_active = values.isActive;

  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleServiceStatus(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
