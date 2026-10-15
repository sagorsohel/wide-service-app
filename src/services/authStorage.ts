import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "../types";

const AUTH_STORAGE_KEY = "wide_service_auth_user";

let inMemoryUserCache: UserProfile | null = null;

/**
 * Retrieve current user session from persistent storage
 */
export async function getAuthUser(): Promise<UserProfile | null> {
  if (inMemoryUserCache) return inMemoryUserCache;
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    inMemoryUserCache = parsed;
    return parsed;
  } catch (error) {
    console.warn("[AuthStorage] Error reading auth user:", error);
    return null;
  }
}

/**
 * Save current user session to persistent storage
 */
export async function saveAuthUser(user: UserProfile): Promise<void> {
  try {
    inMemoryUserCache = user;
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("[AuthStorage] Error saving auth user:", error);
  }
}

/**
 * Clear user session upon logout
 */
export async function clearAuthUser(): Promise<void> {
  try {
    inMemoryUserCache = null;
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn("[AuthStorage] Error removing auth user:", error);
  }
}
