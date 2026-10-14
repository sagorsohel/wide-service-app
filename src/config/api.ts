import { Platform, NativeModules } from "react-native";
import Constants from "expo-constants";
import { Category, Subcategory, Service, UserLocation } from "../types";
import { sortServicesByDistance } from "../utils/distance";

/**
 * Production Live Backend API
 */
export const PRODUCTION_API_URL = "https://apiwideservice.widetechbd.com/api";

/**
 * Collects candidate backend base URLs:
 * 1. Configured EXPO_PUBLIC_API_URL or Constants extra.apiUrl (Production default)
 * 2. Production domain: https://apiwideservice.widetechbd.com/api
 * 3. Dynamic Expo Metro hostUri (for local debugging)
 * 4. Known computer Wi-Fi IPs & Android Emulator loopback
 */
function getCandidateBaseUrls(): string[] {
  const urls: string[] = [];

  // 1. Primary: Production Live Backend URL (Ensures builds connect directly)
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig as any)?.extra?.apiUrl ||
    PRODUCTION_API_URL;

  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, "");
    if (!urls.includes(clean)) {
      urls.push(clean);
    }
  }

  if (!urls.includes(PRODUCTION_API_URL)) {
    urls.push(PRODUCTION_API_URL);
  }

  if (Platform.OS === "web") {
    if (!urls.includes("http://localhost:5000/api")) {
      urls.push("http://localhost:5000/api");
    }
    return urls;
  }

  // 2. Dynamic host from Expo Constants (Metro in Expo Go)
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
        const url = `http://${ip}:5000/api`;
        if (!urls.includes(url)) urls.push(url);
      }
    }
  } catch (e) {}

  // 3. Dynamic host from NativeModules.SourceCode.scriptURL
  try {
    const scriptURL: string = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
      if (match && match[1] && match[1] !== "localhost" && match[1] !== "127.0.0.1") {
        const ip = match[1];
        const url = `http://${ip}:5000/api`;
        if (!urls.includes(url)) {
          urls.push(url);
        }
      }
    }
  } catch (e) {}

  // 4. Known computer LAN IPs (covers home/office Wi-Fi networks and emulators)
  const knownIps = [
    "192.168.1.72",
    "192.168.0.106",
    "10.0.2.2",
    "127.0.0.1",
    "localhost",
  ];

  for (const ip of knownIps) {
    const url = `http://${ip}:5000/api`;
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}

// Memory cache for the currently verified working backend URL
let cachedWorkingBaseUrl: string | null = null;

export const API_BASE_URL = PRODUCTION_API_URL;

/**
 * Resilient multi-network fetch that connects directly to the backend
 * (Primary: https://apiwideservice.widetechbd.com/api)
 */
export async function smartFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const candidateUrls = getCandidateBaseUrls();

  // If a known working URL is cached, try it first
  const orderedUrls = cachedWorkingBaseUrl
    ? [cachedWorkingBaseUrl, ...candidateUrls.filter((u) => u !== cachedWorkingBaseUrl)]
    : candidateUrls;

  let lastError: any = null;

  for (const baseUrl of orderedUrls) {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullUrl = `${cleanBase}${cleanEndpoint}`;
    try {
      const controller = new AbortController();
      // Fast timeout per attempt so failover takes max 3 seconds
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        cachedWorkingBaseUrl = baseUrl; // Cache the verified working IP
        return res;
      }
    } catch (err: any) {
      lastError = err;
      if (baseUrl === cachedWorkingBaseUrl) {
        cachedWorkingBaseUrl = null; // Invalidate cache if network changed
      }
    }
  }

  throw lastError || new Error("Failed to connect to any backend URL");
}

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
    latitude: 23.7461,
    longitude: 90.3742,
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
    latitude: 23.8071,
    longitude: 90.3686,
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
    latitude: 23.7925,
    longitude: 90.4078,
  },
];

// Fetch categories from Backend API across any network
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await smartFetch("/categories");
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

// Fetch subcategories for a given category from Backend API across any network
export async function fetchSubcategories(categoryId: number): Promise<Subcategory[]> {
  try {
    const res = await smartFetch(`/subcategories?categoryId=${categoryId}`);
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

// Fetch services from Backend API across any network sorted by distance from user location
export async function fetchServices(
  categoryId?: number,
  subcategoryId?: number,
  userLocation?: UserLocation | null,
  radiusKm?: number
): Promise<Service[]> {
  try {
    const params = new URLSearchParams();
    params.append("status", "active");
    if (categoryId) params.append("categoryId", String(categoryId));
    if (subcategoryId) params.append("subcategoryId", String(subcategoryId));
    if (userLocation?.latitude != null && userLocation?.longitude != null) {
      params.append("lat", String(userLocation.latitude));
      params.append("lng", String(userLocation.longitude));
    }
    if (radiusKm) {
      params.append("radiusKm", String(radiusKm));
    }

    const endpoint = params.toString() ? `/services?${params.toString()}` : `/services`;
    const res = await smartFetch(endpoint);

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const mapped = json.data.map((srv: any, index: number) => ({
          ...srv,
          price: srv.price || (index % 2 === 0 ? "$34.00 / Hr" : "$28.00 / Hr"),
          rating: srv.rating || 4.9,
          reviewCount: srv.reviewCount || 200 - index * 20,
          experience: srv.experience || "10-year Experience",
        }));
        return sortServicesByDistance(mapped, userLocation);
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
  const sorted = sortServicesByDistance(filtered, userLocation);
  if (radiusKm) {
    return sorted.filter((s) => s.distanceKm != null && s.distanceKm <= radiusKm);
  }
  return sorted;
}
