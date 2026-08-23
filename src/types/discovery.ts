import { ServiceCategory } from "./service";

export interface BusinessPublicProfile {
  id: string;
  name: string;
  category: string | null;
  currency: string;
  timezone: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

export { type ServiceCategory } from "./service";

export interface ServiceDiscoveryItem {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  durationMinutes: number;
  bufferTimeMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  category?: ServiceCategory | null;
  business: BusinessPublicProfile;
}

export interface ServiceFilterState {
  searchQuery: string;
  categoryId: string | null;
  tenantId: string | null;
  maxPrice: number | null;
  maxDuration: number | null;
  sortBy: 'price_asc' | 'price_desc' | 'duration_asc' | 'popular' | 'newest';
}
