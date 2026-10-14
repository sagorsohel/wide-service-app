import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Search,
  MapPin,
  LocateFixed,
  X,
  Check,
  Edit3,
} from "lucide-react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Location from "expo-location";
import { UserLocation } from "../types";
import { saveUserLocation, DEFAULT_LOCATION } from "../services/locationStorage";

export interface OsmPlace {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

interface LocationPickerScreenProps {
  currentLocation?: UserLocation | null;
  onBack?: () => void;
  onLocationSelected: (location: UserLocation) => void;
  bottomOffset?: number;
}

// Major cities for quick flyTo jumps
const QUICK_CITIES = [
  { name: "Rajshahi", lat: 24.3636, lng: 88.6241 },
  { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Chittagong", lat: 22.3569, lng: 91.7832 },
  { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { name: "Khulna", lat: 22.8456, lng: 89.5403 },
  { name: "Barishal", lat: 22.701, lng: 90.3535 },
  { name: "Rangpur", lat: 25.7439, lng: 89.2752 },
];

/**
 * Interactive Google Maps HTML with Tap-to-Place Marker & Draggable Pin.
 * Exact same proven, rock-solid architecture used in go-track.
 */
function getMapHtml(initialLat: number, initialLng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=25.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-container { cursor: crosshair; }
    
    /* Google Maps Layer Switcher */
    .layer-control {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 1000;
      background: rgba(255,255,255,0.95);
      border-radius: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.18);
      display: flex;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }
    .layer-btn {
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }
    .layer-btn.active {
      background: #e0b328;
      color: #0f172a;
    }

    /* Floating Tap-Hint Badge */
    .tap-hint {
      position: absolute;
      top: 14px;
      left: 14px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      padding: 6px 12px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      pointer-events: none;
    }

    /* Loading geocode indicator */
    .loading-pill {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: rgba(15, 23, 42, 0.90);
      backdrop-filter: blur(8px);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 7px 16px;
      border-radius: 20px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      display: none;
      align-items: center;
      gap: 7px;
    }
    .loading-pill.show {
      display: flex;
    }
    .spinner {
      width: 13px;
      height: 13px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #e0b328;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Leaflet zoom controls */
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18) !important;
      border-radius: 14px !important;
      overflow: hidden !important;
      margin-right: 16px !important;
      margin-bottom: 96px !important;
      background: #ffffff !important;
      border: 1.5px solid #e2e8f0 !important;
    }
    .leaflet-control-zoom a {
      width: 40px !important;
      height: 40px !important;
      line-height: 40px !important;
      font-size: 20px !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      background: #ffffff !important;
      border-bottom: 1px solid #f1f5f9 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .leaflet-control-zoom a:last-child {
      border-bottom: none !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Instruction Badge -->
  <div class="tap-hint">
    <span>📍 Tap anywhere on map to drop pin</span>
  </div>

  <!-- Google Maps Mode Switcher -->
  <div class="layer-control">
    <button id="btn-streets" class="layer-btn active" onclick="switchLayer('streets')">🗺️ Map</button>
    <button id="btn-satellite" class="layer-btn" onclick="switchLayer('satellite')">🛰️ Satellite</button>
  </div>

  <!-- Loading Geocode Pill -->
  <div id="loading-pill" class="loading-pill">
    <div class="spinner"></div>
    <span>Detecting place name...</span>
  </div>

  <script>
    var currentLat = ${initialLat};
    var currentLng = ${initialLng};

    // Google Maps Roadmap Layer (up to zoom 22 for extreme high-precision)
    var streetLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      attribution: '© Google Maps'
    });

    var satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      attribution: '© Google Maps'
    });

    var map = L.map('map', {
      center: [currentLat, currentLng],
      zoom: 17,
      zoomControl: false,
      layers: [streetLayer]
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    function switchLayer(type) {
      if (type === 'satellite') {
        map.removeLayer(streetLayer);
        map.addLayer(satelliteLayer);
        document.getElementById('btn-satellite').classList.add('active');
        document.getElementById('btn-streets').classList.remove('active');
      } else {
        map.removeLayer(satelliteLayer);
        map.addLayer(streetLayer);
        document.getElementById('btn-streets').classList.add('active');
        document.getElementById('btn-satellite').classList.remove('active');
      }
    }

    var loadingEl = document.getElementById('loading-pill');

    function notifyParent(data) {
      var msg = JSON.stringify(data);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      }
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(msg, '*');
      }
    }

    // Custom Interactive Yellow Pin Marker with Shadow
    var pinSvg = '<div style="position:relative;width:38px;height:48px;cursor:pointer;">' +
      '<svg width="38" height="48" viewBox="0 0 38 48" fill="none" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.38));">' +
        '<path d="M19 0C8.50659 0 0 8.50659 0 19C0 32.25 16.625 46.5 17.375 47.125C17.875 47.5 18.4375 47.75 19 47.75C19.5625 47.75 20.125 47.5 20.625 47.125C21.375 46.5 38 32.25 38 19C38 8.50659 29.4934 0 19 0Z" fill="#e0b328"/>' +
        '<circle cx="19" cy="18" r="8" fill="#0f172a"/>' +
        '<circle cx="19" cy="18" r="4.5" fill="#ffffff"/>' +
      '</svg>' +
    '</div>';

    var pinIcon = L.divIcon({
      className: 'custom-interactive-pin',
      html: pinSvg,
      iconSize: [38, 48],
      iconAnchor: [19, 48]
    });

    // Draggable Marker placed right at target
    var marker = L.marker([currentLat, currentLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    // When marker is dragged and dropped
    marker.on('dragend', function() {
      var pos = marker.getLatLng();
      notifyParent({
        type: 'PIN_SELECTED',
        latitude: pos.lat,
        longitude: pos.lng
      });
    });

    // When user TAPS ANYWHERE on the map (just like go-track)
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      notifyParent({
        type: 'PIN_SELECTED',
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    });

    function handleParentMessage(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'MOVE_PIN') {
          marker.setLatLng([data.latitude, data.longitude]);
          map.setView([data.latitude, data.longitude], data.zoom || 17, { animate: true });
        } else if (data && data.type === 'SET_LOADING') {
          if (data.show) {
            loadingEl.classList.add('show');
          } else {
            loadingEl.classList.remove('show');
          }
        }
      } catch(e) {}
    }

    window.addEventListener('message', handleParentMessage);
    document.addEventListener('message', handleParentMessage);

    // Initial emit
    setTimeout(function() {
      notifyParent({
        type: 'PIN_SELECTED',
        latitude: currentLat,
        longitude: currentLng
      });
    }, 350);
  </script>
</body>
</html>`;
}

export const LocationPickerScreen: React.FC<LocationPickerScreenProps> = ({
  currentLocation,
  onBack,
  onLocationSelected,
  bottomOffset,
}) => {
  const insets = useSafeAreaInsets();
  const bottomNavOffset =
    bottomOffset !== undefined ? bottomOffset : Math.max(insets.bottom, 12) + 76;

  const initialLat = currentLocation?.latitude || DEFAULT_LOCATION.latitude || 23.8103;
  const initialLng = currentLocation?.longitude || DEFAULT_LOCATION.longitude || 90.4125;

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<OsmPlace[]>([]);
  const [customAreaName, setCustomAreaName] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");
  const [selectedLoc, setSelectedLoc] = useState<UserLocation>(
    currentLocation || DEFAULT_LOCATION
  );
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Send message to WebView map
  const sendMapMessage = (msgObj: any) => {
    const payload = JSON.stringify(msgObj);

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const iframe = document.getElementById("inapp-google-map") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(payload, "*");
      }
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.postMessage(${JSON.stringify(payload)}, '*'); document.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(payload)} })); true;`
      );
    }
  };

  // Move pin and center map
  const movePinTo = (lat: number, lng: number, zoom = 17) => {
    sendMapMessage({ type: "MOVE_PIN", latitude: lat, longitude: lng, zoom });
  };

  /**
   * Reverse Geocode (Exact same clean approach as go-track with Photon & Nominatim)
   */
  const handleLocationCoordinates = async (lat: number, lng: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGeocoding(true);
    sendMapMessage({ type: "SET_LOADING", show: true });

    try {
      // 1. Photon POI Reverse Lookup
      try {
        const photonRes = await fetch(
          `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "User-Agent": "WideServiceApp/1.0 (contact@widetechbd.com)",
            },
          }
        );

        if (photonRes.ok) {
          const photonData = await photonRes.json();
          const f = photonData.features?.[0];
          const p = f?.properties;

          if (p) {
            const rawName =
              p.name && !/^\d{4,6}$/.test(p.name.trim()) ? p.name.trim() : null;
            const street = p.street?.trim() || null;
            const district = p.district?.trim() || null;
            const city =
              p.city?.trim() ||
              p.county?.trim() ||
              p.state?.trim() ||
              "Bangladesh";

            const primaryPoi = rawName || street || district || "Selected Location";
            const rawParts = [rawName, street, district, city].filter(Boolean) as string[];
            const parts = rawParts.filter((item, pos) => rawParts.indexOf(item) === pos);
            const fullAddress = parts.join(", ") || primaryPoi;

            setSelectedLoc((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              area: customAreaName || primaryPoi,
              address: customAreaName || fullAddress,
              city: city,
              isCurrentGps: false,
            }));
            return;
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }

      // 2. OpenStreetMap Nominatim JSON Reverse Lookup (go-track style)
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "User-Agent": "GoTrackApp/1.0",
            },
          }
        );

        if (nomRes.ok) {
          const data = await nomRes.json();
          const addr = data.address || {};
          const poi =
            data.name ||
            addr.amenity ||
            addr.shop ||
            addr.building ||
            addr.road ||
            addr.neighbourhood ||
            addr.suburb ||
            "Selected Location";
          const city =
            addr.city || addr.town || addr.district || addr.state || "Bangladesh";
          const displayName = data.display_name || poi;

          setSelectedLoc((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            area: customAreaName || poi,
            address: customAreaName || displayName,
            city: city,
            isCurrentGps: false,
          }));
          return;
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }

      // Fallback
      setSelectedLoc((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        area: customAreaName || "Pinned Location",
        address:
          customAreaName || `Pinned Spot (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        city: "Bangladesh",
        isCurrentGps: false,
      }));
    } finally {
      setIsGeocoding(false);
      sendMapMessage({ type: "SET_LOADING", show: false });
    }
  };

  // Handle messages received from map (Tap or Drag)
  const handleLocationUpdate = (data: any) => {
    if (!data) return;

    if (data.type === "PIN_SELECTED") {
      setCustomAreaName(null);
      if (
        typeof data.latitude === "number" &&
        typeof data.longitude === "number"
      ) {
        handleLocationCoordinates(data.latitude, data.longitude);
      }
    }
  };

  // Web platform event listener
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleWebMessage = (event: MessageEvent) => {
        try {
          const data =
            typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          handleLocationUpdate(data);
        } catch (e) {}
      };

      window.addEventListener("message", handleWebMessage);
      return () => window.removeEventListener("message", handleWebMessage);
    }
  }, [customAreaName]);

  // Native WebView event listener
  const handleNativeMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleLocationUpdate(data);
    } catch (e) {}
  };

  // Live Autocomplete Search Input Change (same as go-track searchOpenStreetMap)
  const handleSearchQueryChange = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text.trim()
          )}&limit=5`,
          {
            headers: {
              "User-Agent": "GoTrackApp/1.0",
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  // User taps a search suggestion from dropdown
  const handleSelectSuggestion = (place: OsmPlace) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setSearchQuery(place.display_name);
    setSuggestions([]);
    setCustomAreaName(null);

    const title = place.name || place.display_name.split(",")[0].trim();
    setSelectedLoc({
      address: place.display_name,
      area: title,
      city: "Bangladesh",
      latitude: lat,
      longitude: lng,
      isCurrentGps: false,
    });

    movePinTo(lat, lng, 18);
  };

  // Live GPS button handler
  const handleDetectCurrentLocation = async () => {
    setIsDetectingGps(true);
    setCustomAreaName(null);
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            movePinTo(lat, lng, 18);
            handleLocationCoordinates(lat, lng);
            setIsDetectingGps(false);
          },
          (err) => {
            console.warn("Web Geolocation error:", err);
            Alert.alert("GPS Error", "Could not get current GPS location.");
            setIsDetectingGps(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow location permission to detect your current position."
        );
        setIsDetectingGps(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      movePinTo(lat, lng, 18);
      handleLocationCoordinates(lat, lng);
    } catch (err) {
      console.warn("GPS detection error:", err);
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Apply custom location name manually
  const handleApplyCustomName = (name?: string) => {
    const query = (name || searchQuery).trim();
    if (!query) return;
    setCustomAreaName(query);
    setSelectedLoc((prev) => ({
      ...prev,
      address: query,
      area: query.split(",")[0].trim(),
    }));
  };

  // Confirm selection and save
  const handleConfirm = async () => {
    await saveUserLocation(selectedLoc);
    onLocationSelected(selectedLoc);
  };

  const mapHtml = getMapHtml(initialLat, initialLng);

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle("dark-content", true);
      RNStatusBar.setBackgroundColor("#e0b328", true);
    }
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-[#e0b328]"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: "#e0b328" }}
    >
      <StatusBar style="dark" animated={true} />
      {/* Top Header */}
      <View className="bg-[#e0b328] px-6 pt-2 pb-3 z-50">
        <View className="flex-row items-center justify-between">
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="w-10 h-10 items-center justify-center -ml-2 active:opacity-60"
            >
              <ChevronLeft size={28} color="#0f172a" />
            </TouchableOpacity>
          ) : (
            <View className="w-10 h-10" />
          )}

          <View className="flex-1 px-2 items-center">
            <Text
              className="text-lg font-black text-slate-900 tracking-tight text-center"
              numberOfLines={1}
            >
              Google Maps Location Picker
            </Text>
            <Text className="text-[11px] font-semibold text-amber-950/70">
              Tap anywhere on map or search address
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        {/* Floating Live Search Bar with Instant Autocomplete (go-track style) */}
        <View className="mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md flex-row items-center px-4 py-2">
          <Search size={18} color="#94a3b8" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            placeholder="Search address, landmark, road, or city..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 py-1"
            returnKeyType="search"
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#e0b328" className="mr-1" />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSuggestions([]);
                setCustomAreaName(null);
              }}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center ml-1"
            >
              <X size={13} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Live Search Autocomplete Dropdown List (same as go-track) */}
        {suggestions.length > 0 && (
          <View className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mt-2 shadow-2xl overflow-hidden max-h-52 z-50">
            <ScrollView keyboardShouldPersistTaps="handled">
              {suggestions.map((place) => (
                <TouchableOpacity
                  key={place.place_id}
                  onPress={() => handleSelectSuggestion(place)}
                  activeOpacity={0.7}
                  className="p-3 border-b border-slate-100 dark:border-slate-800 flex-row items-center active:bg-amber-50 dark:active:bg-slate-800"
                >
                  <MapPin size={15} color="#e0b328" className="mr-2.5 shrink-0" />
                  <Text
                    className="text-slate-800 dark:text-slate-100 text-xs font-semibold flex-1"
                    numberOfLines={2}
                  >
                    {place.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Set Custom Location Name Pill */}
        {searchQuery.trim().length > 0 && suggestions.length === 0 && (
          <TouchableOpacity
            onPress={() => handleApplyCustomName(searchQuery.trim())}
            activeOpacity={0.85}
            className="mt-2 bg-amber-50/95 border border-amber-300 rounded-xl px-3.5 py-2 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <MapPin size={15} color="#b45309" className="mr-2 shrink-0" />
              <Text className="text-xs font-bold text-amber-950" numberOfLines={1}>
                Set Location Name: <Text className="font-black text-amber-900">"{searchQuery.trim()}"</Text>
              </Text>
            </View>
            <View className="bg-[#e0b328] px-2.5 py-1 rounded-lg">
              <Text className="text-[11px] font-black text-slate-900">Apply</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Container */}
      <View className="flex-1 bg-slate-100 rounded-t-[36px] overflow-hidden relative">
        {/* Quick City Jump Bar */}
        <View className="bg-white/95 border-b border-slate-200/80 px-4 py-2.5 z-10 flex-row items-center">
          <Text className="text-[11px] font-bold text-slate-500 mr-2 shrink-0">
            Quick Jump:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingRight: 16 }}
            className="flex-1"
          >
            {QUICK_CITIES.map((city) => (
              <TouchableOpacity
                key={city.name}
                onPress={() => {
                  setSearchQuery(city.name);
                  setSuggestions([]);
                  setCustomAreaName(null);
                  movePinTo(city.lat, city.lng, 15);
                  handleLocationCoordinates(city.lat, city.lng);
                }}
                activeOpacity={0.7}
                className="bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/90 active:bg-[#e0b328]"
              >
                <Text className="text-[11px] font-bold text-amber-950">
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Free In-App Google Maps Canvas with Interactive Pin */}
        <View className="flex-1 relative">
          {Platform.OS === "web" ? (
            React.createElement("iframe", {
              id: "inapp-google-map",
              title: "In-App Google Maps",
              srcDoc: mapHtml,
              style: {
                width: "100%",
                height: "100%",
                border: 0,
              },
            })
          ) : (
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              onMessage={handleNativeMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              style={{ flex: 1 }}
            />
          )}

          {/* Floating Highlighted Live GPS Button on Map */}
          <TouchableOpacity
            onPress={handleDetectCurrentLocation}
            disabled={isDetectingGps}
            activeOpacity={0.82}
            className="absolute bottom-5 right-4 z-30 flex-row items-center bg-white dark:bg-slate-900 pl-3.5 pr-4 py-2.5 rounded-full border-2 border-[#e0b328] shadow-2xl active:scale-95"
            style={{
              elevation: 9,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
            }}
          >
            <View className="w-8 h-8 rounded-full bg-amber-500/15 items-center justify-center mr-2 border border-amber-300 dark:border-amber-700">
              {isDetectingGps ? (
                <ActivityIndicator size="small" color="#b45309" />
              ) : (
                <LocateFixed size={18} color="#b45309" />
              )}
            </View>

            <Text className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {isDetectingGps ? "Finding GPS..." : "My Location"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Selected Location Preview & Confirmation Sheet */}
        <View
          className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-5 pt-3.5 shadow-2xl z-30"
          style={{
            paddingBottom: bottomNavOffset,
          }}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center mb-0.5">
                <MapPin size={13} color="#e0b328" className="mr-1" />
                <Text className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Selected Location (In-App Pin)
                </Text>
              </View>
              {isEditingName ? (
                <View className="flex-row items-center mt-1 mb-1">
                  <TextInput
                    value={editNameInput}
                    onChangeText={setEditNameInput}
                    placeholder="Enter location name..."
                    placeholderTextColor="#94a3b8"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (editNameInput.trim()) {
                        handleApplyCustomName(editNameInput.trim());
                      }
                      setIsEditingName(false);
                    }}
                    className="ml-2 bg-[#e0b328] px-3 py-1.5 rounded-xl"
                  >
                    <Text className="text-xs font-black text-slate-900">Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text
                    className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tracking-tight flex-1"
                    numberOfLines={1}
                  >
                    {isGeocoding
                      ? "Detecting location name..."
                      : (selectedLoc.area || selectedLoc.address)}
                  </Text>
                  {isGeocoding ? (
                    <ActivityIndicator size="small" color="#e0b328" className="ml-2" />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setEditNameInput(selectedLoc.area || selectedLoc.address);
                        setIsEditingName(true);
                      }}
                      activeOpacity={0.7}
                      className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 ml-2"
                    >
                      <Edit3 size={13} color="#b45309" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={1}>
                {isGeocoding
                  ? "Locating on Google Maps..."
                  : (selectedLoc.address || `${selectedLoc.area}, ${selectedLoc.city}`)}
              </Text>
            </View>

            <View className="bg-amber-100/90 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              <Text className="text-[11px] font-black text-amber-950 dark:text-amber-200 font-mono">
                {selectedLoc.latitude ? `${selectedLoc.latitude.toFixed(3)}°N` : "GPS"}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.88}
            className="w-full bg-[#e0b328] py-3.5 rounded-2xl shadow-lg shadow-amber-500/30 items-center justify-center active:opacity-90 flex-row"
          >
            <Check size={18} color="#0f172a" className="mr-2" />
            <Text className="text-slate-900 text-sm sm:text-base font-black tracking-wide">
              Confirm & Set Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
