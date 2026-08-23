import { supabase } from "@/lib/supabase";
import {
  ServiceCategory,
  ServiceDiscoveryItem,
  ServiceFilterState,
} from "@/types/discovery";
import {
  transformServiceCategory,
  transformServiceDiscoveryItem,
  transformServiceDiscoveryList,
} from "@/lib/transformers/discovery-transformer";

export async function fetchAvailableCustomerServices(): Promise<ServiceDiscoveryItem[]> {
  const { data, error } = await supabase
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
      category:service_categories (id, name, slug),
      business:tenants (id, name, category, currency, timezone, logo_url, phone, email, city, state)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [Discovery Service Error]:", error.message);
    throw new Error(error.message);
  }

  return transformServiceDiscoveryList(data);
}

export async function fetchActiveServices(
  filters?: Partial<ServiceFilterState>
): Promise<ServiceDiscoveryItem[]> {
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
        category:service_categories (id, tenant_id, name, slug, description, display_order, is_active),
        business:tenants (id, name, category, currency, timezone, logo_url, phone, email, city, state)
      `)
      .eq("is_active", true);

    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters?.tenantId) {
      query = query.eq("tenant_id", filters.tenantId);
    }

    if (filters?.maxPrice !== null && filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.maxDuration !== null && filters?.maxDuration !== undefined) {
      query = query.lte("duration_minutes", filters.maxDuration);
    }

    // Apply sorting
    if (filters?.sortBy === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (filters?.sortBy === "price_desc") {
      query = query.order("price", { ascending: false });
    } else if (filters?.sortBy === "duration_asc") {
      query = query.order("duration_minutes", { ascending: true });
    } else if (filters?.sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      // Default: featured first, then newest
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn("⚠️ [Discovery Service] Services query failed or table unpopulated:", error.message);
      return [];
    }

    let items = transformServiceDiscoveryList(data);

    // In-memory text search filter if searchQuery provided
    if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.business.name.toLowerCase().includes(q) ||
          item.category?.name.toLowerCase().includes(q)
      );
    }

    return items;
  } catch (err) {
    console.error("❌ [Discovery Service] Unexpected exception fetching services:", err);
    return [];
  }
}

export async function fetchServiceDetails(
  serviceId: string
): Promise<ServiceDiscoveryItem | null> {
  if (!serviceId) return null;
  try {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        category:service_categories (*),
        business:tenants (
          id,
          name,
          category,
          currency,
          timezone,
          logo_url,
          phone,
          email,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
          country,
          settings:business_settings (working_hours, appointment_duration_minutes)
        )
      `)
      .eq("id", serviceId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.warn(`⚠️ [Discovery Service] Service details query failed for ${serviceId}:`, error.message);
      return null;
    }

    return transformServiceDiscoveryItem(data);
  } catch (err) {
    console.error(`❌ [Discovery Service] Exception fetching service details for ${serviceId}:`, err);
    return null;
  }
}

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.warn("⚠️ [Discovery Service] Categories query failed or table unpopulated:", error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];
    return data
      .map(transformServiceCategory)
      .filter((cat): cat is ServiceCategory => cat !== null);
  } catch (err) {
    console.error("❌ [Discovery Service] Exception fetching categories:", err);
    return [];
  }
}
