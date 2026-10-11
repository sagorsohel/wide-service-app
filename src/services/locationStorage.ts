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

// -------------------------------------------------------------
// Splash / Onboarding Screen Local Storage (true/false)
// -------------------------------------------------------------
const HAS_SEEN_SPLASH_KEY = "@wide_service_has_seen_splash";
let memoryHasSeenSplashCache: boolean | null = null;

/**
 * Check whether the user has already seen the splash screen.
 * Returns true if true in local storage, false otherwise.
 */
export async function getHasSeenSplash(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(HAS_SEEN_SPLASH_KEY);
    if (val !== null) {
      const parsed = val === "true";
      memoryHasSeenSplashCache = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn("[Storage] Error reading splash state locally:", error);
  }
  return memoryHasSeenSplashCache ?? false;
}

/**
 * Persist the splash seen status (true or false) in AsyncStorage.
 */
export async function setHasSeenSplash(seen: boolean = true): Promise<void> {
  try {
    memoryHasSeenSplashCache = seen;
    await AsyncStorage.setItem(HAS_SEEN_SPLASH_KEY, seen ? "true" : "false");
  } catch (error) {
    console.warn("[Storage] Error saving splash state locally:", error);
    memoryHasSeenSplashCache = seen;
  }
}

/**
 * Reset the splash seen status (returns back to false).
 */
export async function resetHasSeenSplash(): Promise<void> {
  try {
    memoryHasSeenSplashCache = false;
    await AsyncStorage.removeItem(HAS_SEEN_SPLASH_KEY);
  } catch (error) {
    console.warn("[Storage] Error resetting splash state locally:", error);
    memoryHasSeenSplashCache = false;
  }
}

