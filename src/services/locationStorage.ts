import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserLocation } from "../types";

const STORAGE_KEY = "@wide_service_user_location";

export const DEFAULT_LOCATION: UserLocation = {
  address: "Dhaka, Bangladesh",
  area: "Dhaka",
  city: "Dhaka",
  latitude: 23.8103,
  longitude: 90.4125,
  isCurrentGps: false,
};

// In-memory cache fallback in case native storage has issues
let memoryLocationCache: UserLocation | null = null;

/**
 * Save user location to local database / persistent storage
 */
export async function saveUserLocation(location: UserLocation): Promise<void> {
  try {
    const locWithTimestamp: UserLocation = {
      ...location,
      updatedAt: new Date().toISOString(),
    };
    memoryLocationCache = locWithTimestamp;
    const jsonString = JSON.stringify(locWithTimestamp);
    await AsyncStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.warn("[LocationStorage] Error saving location locally:", error);
    memoryLocationCache = location;
  }
}

/**
 * Retrieve user location from local database / persistent storage
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const jsonString = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonString) {
      const parsed = JSON.parse(jsonString) as UserLocation;
      memoryLocationCache = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn("[LocationStorage] Error loading location locally:", error);
  }
  return memoryLocationCache;
}

/**
 * Clear stored location
 */
export async function clearUserLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    memoryLocationCache = null;
  } catch (error) {
    console.warn("[LocationStorage] Error clearing location locally:", error);
  }
}
