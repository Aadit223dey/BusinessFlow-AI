import {
  BusinessPublicProfile,
  ServiceCategory,
  ServiceDiscoveryItem,
} from "@/types/discovery";

export function transformServiceCategory(raw: any): ServiceCategory | null {
  if (!raw) return null;
  return {
    id: raw.id,
    tenantId: raw.tenant_id ?? raw.tenantId ?? "",
    name: raw.name ?? "General",
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    displayOrder: raw.display_order ?? raw.displayOrder ?? 0,
    isActive: raw.is_active ?? raw.isActive ?? true,
    createdAt: raw.created_at ?? raw.createdAt,
  };
}

export function transformBusinessProfile(raw: any): BusinessPublicProfile {
  if (!raw) {
    return {
      id: "unknown",
      name: "Local Service Provider",
      category: null,
      currency: "USD",
      timezone: "UTC",
    };
  }

  // Handle settings relation if joined as object or array
  const rawSettings = Array.isArray(raw.settings) ? raw.settings[0] : raw.settings;

  const address =
    raw.address_line_1 ||
    rawSettings?.address ||
    (raw.address_line_2 ? `${raw.address_line_1 || ""}, ${raw.address_line_2}` : null);

  const city = raw.city || rawSettings?.city || null;
  const state = raw.state || rawSettings?.state || null;
  const postalCode = raw.postal_code || rawSettings?.postal_code || null;
  const phone = raw.phone || rawSettings?.phone_number || null;
  const email = raw.email || rawSettings?.business_email || null;

  return {
    id: raw.id,
    name: raw.name ?? "Local Business",
    category: raw.category ?? null,
    currency: raw.currency ?? "USD",
    timezone: raw.timezone ?? "UTC",
    logoUrl: raw.logo_url ?? raw.logoUrl ?? null,
    phone,
    email,
    address,
    city,
    state,
    postalCode,
  };
}

export function transformServiceDiscoveryItem(raw: any): ServiceDiscoveryItem | null {
  if (!raw) return null;

  const category = raw.category ? transformServiceCategory(raw.category) : null;
  const business = transformBusinessProfile(raw.business);

  return {
    id: raw.id,
    tenantId: raw.tenant_id ?? raw.tenantId ?? business.id,
    categoryId: raw.category_id ?? raw.categoryId ?? null,
    name: raw.name ?? "Service",
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    price: typeof raw.price === "number" ? raw.price : parseFloat(raw.price || "0"),
    currency: raw.currency ?? business.currency ?? "USD",
    durationMinutes: raw.duration_minutes ?? raw.durationMinutes ?? 30,
    bufferTimeMinutes: raw.buffer_time_minutes ?? raw.bufferTimeMinutes ?? 0,
    imageUrl: raw.image_url ?? raw.imageUrl ?? null,
    isActive: raw.is_active ?? raw.isActive ?? true,
    isFeatured: raw.is_featured ?? raw.isFeatured ?? false,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    category,
    business,
  };
}

export function transformServiceDiscoveryList(rawList: any[] | null): ServiceDiscoveryItem[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map(transformServiceDiscoveryItem)
    .filter((item): item is ServiceDiscoveryItem => item !== null);
}
