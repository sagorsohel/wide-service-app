import { Platform } from "react-native";
import { Category, Subcategory, Service } from "../types";

// Local LAN IP of your PC (so physical mobile devices on Wi-Fi can reach the backend)
const PC_LAN_IP = "192.168.1.72";

export const API_BASE_URL = Platform.select({
  web: "http://localhost:5000/api",
  default: `http://${PC_LAN_IP}:5000/api`,
});

// Default categories fallback
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: "AC Repair", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200" },
  { id: 2, name: "Plumbing", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200" },
  { id: 3, name: "Electrical", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200" },
  { id: 4, name: "Handcraft", image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=200" },
  { id: 5, name: "Cleaning", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200" },
];

// Default services fallback
const FALLBACK_SERVICES: Service[] = [
  {
    id: 1,
    name: "AC Master Jet Cleaning & Comprehensive Maintenance",
    businessName: "Dhakaiya CoolTech Services",
    logo: "https://image.streamespn.org/uploads/rwanda-1791636004109-903878493.webp",
    address: "House 12, Road 4, Dhanmondi, Dhaka",
    phone: "01812345678",
    whatsapp: "01899999999",
    categoryId: 1,
    categoryName: "AC Maintenance & Repair",
    subcategoryId: 1,
    subcategoryName: "AC Deep Cleaning Service",
    description: "Professional jet cleaning and indoor/outdoor unit servicing with guaranteed coolness and energy saving.",
    status: "active",
    price: "$34.00 / Hr",
    rating: 4.9,
    reviewCount: 200,
    experience: "10-year Experience",
  },
  {
    id: 2,
    name: "Plumbing Leak Detection & Pipe Repair",
    businessName: "Apex Water Works",
    logo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    address: "Block B, Mirpur 10, Dhaka",
    phone: "01711223344",
    whatsapp: "01711223344",
    categoryId: 2,
    categoryName: "Home Plumbing",
    subcategoryId: 3,
    subcategoryName: "Pipe Leakage & Tap Fitting",
    description: "Specialized in emergency leakage repair, sink fittings, bathroom pipe repairs and water pump installation.",
    status: "active",
    price: "$28.00 / Hr",
    rating: 4.8,
    reviewCount: 145,
    experience: "8-year Experience",
  },
  {
    id: 3,
    name: "Emergency Electrical Short Circuit Fix",
    businessName: "VoltMaster Bangladesh",
    logo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
    address: "Gulshan 1, Dhaka",
    phone: "01999887766",
    whatsapp: "01999887766",
    categoryId: 3,
    categoryName: "Electrical Wiring",
    description: "Certified electricians available for home wiring inspection, breaker replacement, and short-circuit troubleshooting.",
    status: "active",
    price: "$32.00 / Hr",
    rating: 4.9,
    reviewCount: 180,
    experience: "12-year Experience",
  },
];

// Fetch categories from Backend API
export async function fetchCategories(): Promise<Category[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/categories`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[App API] Categories fetch fallback used:", err);
  }
  return FALLBACK_CATEGORIES;
}

// Fetch subcategories for a given category from Backend API
export async function fetchSubcategories(categoryId: number): Promise<Subcategory[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/subcategories?categoryId=${categoryId}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("[App API] Subcategories fetch fallback used:", err);
  }

  // Fallback subcategories if offline
  if (categoryId === 1) {
    return [
      { id: 1, categoryId: 1, name: "AC Deep Cleaning Service", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300" },
      { id: 2, categoryId: 1, name: "Gas Refill & Leak Check", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300" },
    ];
  }
  if (categoryId === 2) {
    return [
      { id: 3, categoryId: 2, name: "Pipe Leakage & Tap Fitting", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300" },
    ];
  }
  return [];
}

// Fetch services from Backend API
export async function fetchServices(categoryId?: number, subcategoryId?: number): Promise<Service[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", String(categoryId));
    if (subcategoryId) params.append("subcategoryId", String(subcategoryId));

    const url = params.toString()
      ? `${API_BASE_URL}/services?${params.toString()}`
      : `${API_BASE_URL}/services`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((srv: any, index: number) => ({
          ...srv,
          price: srv.price || (index % 2 === 0 ? "$34.00 / Hr" : "$28.00 / Hr"),
          rating: srv.rating || 4.9,
          reviewCount: srv.reviewCount || 200 - index * 20,
          experience: srv.experience || "10-year Experience",
        }));
      }
    }
  } catch (err) {
    console.warn("[App API] Services fetch fallback used:", err);
  }

  let filtered = FALLBACK_SERVICES;
  if (categoryId) {
    filtered = filtered.filter((s) => s.categoryId === categoryId);
  }
  if (subcategoryId) {
    filtered = filtered.filter((s) => s.subcategoryId === subcategoryId);
  }
  return filtered;
}
