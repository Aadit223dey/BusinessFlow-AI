export interface ServiceCategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number; // Stored as NUMERIC in DB, handled as number in client
  currency: string;
  durationMinutes: number;
  bufferTimeMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
  category?: ServiceCategory | null;
}

export interface ServiceFilterParams {
  search?: string;
  categoryId?: string | 'all';
  status?: 'all' | 'active' | 'inactive';
}
