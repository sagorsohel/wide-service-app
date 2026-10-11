import { Service, UserLocation } from "../types";

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * Returns distance in kilometers (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Formats distance nicely for display:
 * < 1 km -> "450m"
 * >= 1 km -> "1.4 km"
 */
export function formatDistance(distanceKm?: number | null): string {
  if (distanceKm === undefined || distanceKm === null) return "";
  if (distanceKm < 0.05) return "Near you";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Sorts services by distance from the user's location ascending (closest first: 0.1km, 0.5km, 1km, 2km...).
 * Also computes distanceKm if not already provided by backend.
 */
export function sortServicesByDistance(
  services: Service[],
  userLocation?: UserLocation | null
): Service[] {
  if (!userLocation || userLocation.latitude == null || userLocation.longitude == null) {
    return services;
  }

  const uLat = userLocation.latitude;
  const uLng = userLocation.longitude;

  const withDistances = services.map((srv) => {
    let distanceKm = srv.distanceKm;
    if (
      (distanceKm == null || distanceKm === undefined) &&
      srv.latitude != null &&
      srv.longitude != null
    ) {
      distanceKm = calculateHaversineDistanceKm(uLat, uLng, srv.latitude, srv.longitude);
    }
    return {
      ...srv,
      distanceKm,
    };
  });

  return withDistances.sort((a, b) => {
    const distA = a.distanceKm != null ? a.distanceKm : 999999;
    const distB = b.distanceKm != null ? b.distanceKm : 999999;
    return distA - distB;
  });
}
