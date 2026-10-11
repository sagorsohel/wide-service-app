export interface Category {
  id: number;
  name: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  categoryName?: string | null;
  name: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: number;
  name: string;
  businessName: string;
  logo?: string | null;
  address: string;
  phone: string;
  whatsapp?: string | null;
  images?: string[] | string;
  categoryId: number;
  categoryName?: string | null;
  subcategoryId?: number | null;
  subcategoryName?: string | null;
  description?: string | null;
  status: "active" | "inactive";
  price?: string;
  rating?: number;
  reviewCount?: number;
  experience?: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
}

export interface UserLocation {
  address: string;
  area: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isCurrentGps?: boolean;
  updatedAt?: string;
}

