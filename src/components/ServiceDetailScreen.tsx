import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  StatusBar as RNStatusBar,
  Platform,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  PhoneCall,
  MessageSquare,
  MapPin,
  Clock,
  Share2,
  Navigation,
  ExternalLink,
  Images,
  Maximize2,
  X,
  ShieldCheck,
  Compass,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { Service, UserLocation } from "../types";
import { getUserLocation } from "../services/locationStorage";
import { calculateHaversineDistanceKm, formatDistance } from "../utils/distance";

interface ServiceDetailScreenProps {
  service: Service;
  userLocation?: UserLocation | null;
  onBack: () => void;
}

/**
 * Builds HTML for embedded Leaflet Map showing Service and User pins
 */
function getServiceMapHtml(
  serviceLat: number,
  serviceLng: number,
  serviceName: string,
  userLat?: number | null,
  userLng?: number | null
): string {
  const hasUser = userLat != null && userLng != null;
  const cleanServiceName = (serviceName || "Service Location").replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=18.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .custom-service-pin {
      background: #e0b328;
      border: 3px solid #0f172a;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      font-size: 16px;
    }
    .custom-user-pin {
      background: #2563eb;
      border: 3px solid #ffffff;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.28);
    }
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 3px 10px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${serviceLat}, ${serviceLng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    var serviceIcon = L.divIcon({
      className: '',
      html: '<div class="custom-service-pin">📍</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    var sMarker = L.marker([${serviceLat}, ${serviceLng}], { icon: serviceIcon }).addTo(map);
    sMarker.bindPopup("<b>${cleanServiceName}</b>").openPopup();

    ${
      hasUser
        ? `
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="custom-user-pin"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    var uMarker = L.marker([${userLat}, ${userLng}], { icon: userIcon }).addTo(map);
    uMarker.bindPopup("<b>Your Location</b>");

    // Route dashed line
    var latlngs = [
      [${userLat}, ${userLng}],
      [${serviceLat}, ${serviceLng}]
    ];
    var polyline = L.polyline(latlngs, { color: '#0284c7', weight: 3, dashArray: '5, 8', opacity: 0.85 }).addTo(map);

    // Fit view
    var bounds = L.latLngBounds([[${userLat}, ${userLng}], [${serviceLat}, ${serviceLng}]]);
    map.fitBounds(bounds, { padding: [30, 30] });
    `
        : `
    map.setView([${serviceLat}, ${serviceLng}], 15);
    `
    }
  </script>
</body>
</html>`;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service,
  userLocation: propUserLocation,
  onBack,
}) => {
  const [currentUserLoc, setCurrentUserLoc] = useState<UserLocation | null>(
    propUserLocation || null
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  // Load user location if not passed via props
  useEffect(() => {
    if (!currentUserLoc) {
      getUserLocation().then((loc) => {
        if (loc) setCurrentUserLoc(loc);
      });
    }
  }, [currentUserLoc]);

  // Profile Image URL
  const profileImageUri =
    service.logo ||
    "https://img.icons8.com/fluency/96/maintenance.png";

  // Parse Services Images (Showcase Multiple Images)
  const parsedImages: string[] = useMemo(() => {
    if (!service.images) return [];
    if (Array.isArray(service.images)) {
      return service.images.filter((img): img is string => typeof img === "string" && Boolean(img.trim()));
    }
    if (typeof service.images === "string") {
      try {
        const parsed = JSON.parse(service.images);
        if (Array.isArray(parsed)) {
          return parsed.filter((img): img is string => typeof img === "string" && Boolean(img.trim()));
        }
      } catch {
        return service.images.includes(",")
          ? service.images.split(",").map((s) => s.trim()).filter(Boolean)
          : [service.images.trim()];
      }
    }
    return [];
  }, [service.images]);

  // Combined gallery for showcase (parsedImages + profile logo if available)
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (parsedImages.length > 0) {
      list.push(...parsedImages);
    }
    if (
      service.logo &&
      typeof service.logo === "string" &&
      service.logo.trim() &&
      !list.includes(service.logo.trim())
    ) {
      list.push(service.logo.trim());
    }
    if (list.length > 0) return list;
    return ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"];
  }, [parsedImages, service.logo]);

  // Image Navigation Handlers
  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Calculate live distance
  const calculatedDistanceKm: number | null = useMemo(() => {
    const sLat = service.latitude != null ? Number(service.latitude) : null;
    const sLng = service.longitude != null ? Number(service.longitude) : null;
    if (
      currentUserLoc?.latitude != null &&
      currentUserLoc?.longitude != null &&
      sLat != null &&
      sLng != null &&
      !isNaN(sLat) &&
      !isNaN(sLng)
    ) {
      return calculateHaversineDistanceKm(
        currentUserLoc.latitude,
        currentUserLoc.longitude,
        sLat,
        sLng
      );
    }
    if (service.distanceKm != null) {
      return service.distanceKm;
    }
    return null;
  }, [currentUserLoc, service.latitude, service.longitude, service.distanceKm]);

  // Service coordinates
  const serviceLat =
    service.latitude != null && !isNaN(Number(service.latitude))
      ? Number(service.latitude)
      : 24.3636;
  const serviceLng =
    service.longitude != null && !isNaN(Number(service.longitude))
      ? Number(service.longitude)
      : 88.6241;
  const hasCoordinates =
    service.latitude != null &&
    service.longitude != null &&
    !isNaN(Number(service.latitude)) &&
    !isNaN(Number(service.longitude));

  // Phone Call Action
  const handleCall = () => {
    if (service.phone) {
      const cleanNumber = service.phone.replace(/[^0-9+]/g, "");
      Linking.openURL(`tel:${cleanNumber}`).catch((err) => {
        console.warn("Could not launch phone dialer:", err);
      });
    }
  };

  // WhatsApp Action
  const handleWhatsApp = () => {
    if (service.whatsapp) {
      const cleanWa = service.whatsapp.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(
        `হ্যালো, আমি Wide Service অ্যাপ থেকে "${service.name}" সম্পর্কে জানতে যোগাযোগ করছি।`
      );
      Linking.openURL(`https://wa.me/${cleanWa}?text=${msg}`).catch((err) => {
        console.warn("Could not open WhatsApp:", err);
      });
    }
  };

  // Share Service Details
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${service.name}${service.businessName ? ` - ${service.businessName}` : ""}\nঠিকানা: ${service.address}\nযোগাযোগ: ${service.phone}\nWide Service অ্যাপে দেখুন!`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  // Open Location in Native Maps / Google Maps Directions
  const handleOpenMaps = async () => {
    try {
      const destination = hasCoordinates
        ? `${serviceLat},${serviceLng}`
        : encodeURIComponent(service.address || service.name);

      const originParam =
        currentUserLoc?.latitude != null && currentUserLoc?.longitude != null
          ? `&origin=${currentUserLoc.latitude},${currentUserLoc.longitude}`
          : "";

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${originParam}`;

      // Open Google Maps Directions directly
      await Linking.openURL(googleMapsUrl);
    } catch (err) {
      console.warn("Could not open Google Maps directly, trying fallback:", err);
      try {
        const query = encodeURIComponent(`${service.name} ${service.address || ""}`);
        await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      } catch (fallbackErr) {
        console.error("Failed to open fallback maps:", fallbackErr);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle("dark-content", true);
      RNStatusBar.setBackgroundColor("#e0b328", true);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#e0b328]" style={{ backgroundColor: "#e0b328" }}>
      <StatusBar style="dark" animated={true} />

      {/* Top Header matching Brand Theme */}
      <View className="bg-[#e0b328] px-5 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            className="w-10 h-10 items-center justify-center -ml-2 active:opacity-60"
          >
            <ChevronLeft size={28} color="#0f172a" />
          </TouchableOpacity>

          <View className="flex-1 px-2 items-center">
            <Text
              className="text-lg font-black text-slate-900 tracking-tight text-center"
              numberOfLines={1}
            >
              Service Details
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            className="w-10 h-10 items-center justify-center -mr-2 active:opacity-60"
          >
            <Share2 size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Curvy Content Sheet */}
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-t-[30px] overflow-hidden">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* 1. Provider Profile Card (Profile Image, Business Name, Rating & Distance) */}
          <View className="px-5 pt-5 mb-4">
            <View className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center">
                {/* Profile Image (Logo) */}
                <View className="relative">
                  <View className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-600/60 p-2 items-center justify-center shadow-xs overflow-hidden">
                    <Image
                      source={{ uri: profileImageUri }}
                      className="w-full h-full rounded-xl"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-xs">
                    <ShieldCheck size={12} color="#ffffff" />
                  </View>
                </View>

                {/* Identity Info */}
                <View className="flex-1 ml-4 justify-center">
                  <Text
                    className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug"
                    numberOfLines={2}
                  >
                    {service.name}
                  </Text>

                  {/* Business Name (if available) */}
                  {Boolean(service.businessName) && (
                    <Text
                      className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-0.5"
                      numberOfLines={1}
                    >
                      {service.businessName}
                    </Text>
                  )}

                  {/* Distance Badge */}
                  {calculatedDistanceKm != null && (
                    <View className="flex-row items-center flex-wrap gap-1.5 mt-2">
                      <View className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex-row items-center">
                        <Navigation size={10} color="#059669" className="mr-1" />
                        <Text className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          {formatDistance(calculatedDistanceKm)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* 2. Quick Action Buttons (Call Now & WhatsApp) */}
          <View className="px-5 flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.85}
              className="flex-1 bg-emerald-500 py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-sm shadow-emerald-500/20 active:bg-emerald-600 mr-2"
            >
              <PhoneCall size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white font-black text-sm ml-1.5">
                Call Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.85}
              className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 py-3.5 px-4 rounded-2xl flex-row items-center justify-center active:bg-emerald-100 dark:active:bg-emerald-900/40 ml-2"
            >
              <MessageSquare size={18} color="#059669" className="mr-2" />
              <Text className="text-emerald-800 dark:text-emerald-300 font-black text-sm ml-1.5">
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. Services Images Gallery (Showcase Photos) */}
          <View className="px-5 mb-5">
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-1.5">
                  <Images size={16} color="#0284c7" />
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Services Images ({galleryImages.length})
                  </Text>
                </View>

                <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {activeImageIndex + 1} of {galleryImages.length}
                </Text>
              </View>

              {/* Main Active Showcase Photo */}
              <View className="relative w-full h-60 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {/* Clicking Main Image cycles to the next image */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleNextImage}
                  className="w-full h-full"
                >
                  <Image
                    source={{ uri: galleryImages[activeImageIndex] }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* Left Arrow Button (Previous Image) */}
                {galleryImages.length > 1 && (
                  <TouchableOpacity
                    onPress={handlePrevImage}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    className="absolute left-2.5 top-1/2 -mt-5 w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/20 shadow-md"
                  >
                    <ChevronLeft size={22} color="#ffffff" />
                  </TouchableOpacity>
                )}

                {/* Right Arrow Button (Next Image) */}
                {galleryImages.length > 1 && (
                  <TouchableOpacity
                    onPress={handleNextImage}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    className="absolute right-2.5 top-1/2 -mt-5 w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/20 shadow-md"
                  >
                    <ChevronRight size={22} color="#ffffff" />
                  </TouchableOpacity>
                )}

                {/* Dots indicator at bottom-center */}
                {galleryImages.length > 1 && (
                  <View className="absolute bottom-2.5 left-0 right-0 flex-row items-center justify-center gap-1.5">
                    {galleryImages.map((_, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setActiveImageIndex(idx)}
                        activeOpacity={0.7}
                        className={`h-2 rounded-full ${
                          idx === activeImageIndex
                            ? "w-6 bg-amber-400"
                            : "w-2 bg-white/60"
                        }`}
                      />
                    ))}
                  </View>
                )}

                {/* Tap to Fullscreen Button Overlay */}
                <TouchableOpacity
                  onPress={() => setIsFullscreenModalOpen(true)}
                  activeOpacity={0.8}
                  className="absolute top-2.5 right-2.5 bg-slate-900/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex-row items-center gap-1 border border-white/10"
                >
                  <Maximize2 size={12} color="#ffffff" />
                  <Text className="text-[11px] font-bold text-white">Full View</Text>
                </TouchableOpacity>
              </View>

              {/* Thumbnails Row (if more than 1 image) */}
              {galleryImages.length > 1 && (
                <View className="flex-row items-center flex-wrap gap-2.5 mt-3.5">
                  {galleryImages.map((imgUri, idx) => {
                    const isSelected = idx === activeImageIndex;
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setActiveImageIndex(idx)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${
                          isSelected
                            ? "border-amber-500 shadow-md scale-105"
                            : "border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <Image
                          source={{ uri: imgUri }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* 4. Service Operating Schedule Section */}
          <View className="px-5 mb-5">
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 items-center justify-center">
                    <Clock size={16} color="#2563eb" />
                  </View>
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Service Operating Schedule
                  </Text>
                </View>

               
              </View>

              <View className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {service.schedule || "Everyday: 9:00 AM - 9:00 PM (Emergency 24/7 Support)"}
                </Text>
                <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Operating hours may vary during holidays or emergency calls.
                </Text>
              </View>
            </View>
          </View>

          {/* 5. Distance & Interactive Maps Section */}
          <View className="px-5 mb-5">
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 items-center justify-center">
                    <MapPin size={16} color="#d97706" />
                  </View>
                  <View>
                    <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                      Service Location & Map
                    </Text>
                    {calculatedDistanceKm != null && (
                      <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        {formatDistance(calculatedDistanceKm)} from your current location
                      </Text>
                    )}
                  </View>
                </View>

                {calculatedDistanceKm != null && (
                  <View className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                    <Text className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      {calculatedDistanceKm.toFixed(1)} km
                    </Text>
                  </View>
                )}
              </View>

              {/* Physical Address Text */}
              <Text className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-3">
                {service.address}
              </Text>

              {/* Embedded Interactive Map Preview (WebView) */}
              <View className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mb-3 relative">
                <WebView
                  originWhitelist={["*"]}
                  source={{
                    html: getServiceMapHtml(
                      serviceLat,
                      serviceLng,
                      service.name,
                      currentUserLoc?.latitude,
                      currentUserLoc?.longitude
                    ),
                  }}
                  scrollEnabled={false}
                  className="w-full h-full"
                  onError={(err) => console.warn("Map load error:", err)}
                />

                {/* Floating Directions Button on Map */}
                <TouchableOpacity
                  onPress={handleOpenMaps}
                  activeOpacity={0.85}
                  className="absolute bottom-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex-row items-center shadow-md"
                >
                  <Compass size={13} color="#ffffff" className="mr-1.5" />
                  <Text className="text-xs font-bold text-white">Full Map</Text>
                </TouchableOpacity>
              </View>

              {/* Get Directions Button */}
              <TouchableOpacity
                onPress={handleOpenMaps}
                activeOpacity={0.85}
                className="w-full bg-blue-600 py-3 px-4 rounded-2xl flex-row items-center justify-center shadow-sm shadow-blue-600/20 active:bg-blue-700"
              >
                <Navigation size={16} color="#ffffff" className="mr-2" />
                <Text className="text-white font-black text-sm ml-1.5">
                  Get Directions in Google Maps
                </Text>
                <ExternalLink size={14} color="#93c5fd" className="ml-2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. Direct Contact Hotline Row */}
          <View className="px-5 mb-5">
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center">
                    <Phone size={18} color="#059669" />
                  </View>
                  <View>
                    <Text className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      Direct Contact Hotline
                    </Text>
                    <Text className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                      {service.phone}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCall}
                  className="bg-emerald-500 px-3.5 py-2 rounded-xl flex-row items-center"
                >
                  <PhoneCall size={13} color="#ffffff" className="mr-1.5" />
                  <Text className="text-white text-xs font-extrabold ml-1">Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 7. About Service / Description Section */}
          <View className="px-5 mb-5">
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Text className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                About Service
              </Text>
              <Text className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {service.description ||
                  `অভিজ্ঞ ও প্রশিক্ষিত কারিগর দ্বারা দ্রুত এবং নির্ভরযোগ্য সার্ভিস। আধুনিক সরঞ্জাম দিয়ে দ্রুত সমাধান ও কাজের পর ৭ দিনের ফ্রি সার্ভিস ওয়ারেন্টি।`}
              </Text>
            </View>
          </View>

          {/* 8. Customer Reviews Section */}
          <View className="px-5 mb-5">
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Customer Reviews
                </Text>
                <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  ★ 4.9 (48+ Reviews)
                </Text>
              </View>

              <View className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-2.5">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Md. Tariqul Islam
                  </Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    2 days ago
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "খুবই ভালো সার্ভিস। সময়মতো এসে নিঁখুতভাবে কাজটি করে দিয়েছেন। কাজের মান চমৎকার!"
                </Text>
              </View>

              <View className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Sadia Rahman
                  </Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    1 week ago
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "Friendly behavior and reasonable charges. Highly recommended!"
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Booking / Call Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-5 py-3.5 flex-row items-center justify-between shadow-2xl">
          <TouchableOpacity
            onPress={handleOpenMaps}
            activeOpacity={0.8}
            className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-2 border border-slate-200 dark:border-slate-700"
          >
            <Compass size={20} color="#0284c7" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.85}
            className="flex-1 bg-primary py-3.5 px-4 rounded-2xl shadow-md shadow-amber-500/25 flex-row items-center justify-center active:bg-amber-500"
          >
            <PhoneCall size={17} color="#0f172a" className="mr-2" />
            <Text className="text-slate-950 font-black text-sm ml-1.5">
              Call & Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Photo Viewer Modal */}
      <Modal
        visible={isFullscreenModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFullscreenModalOpen(false)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setIsFullscreenModalOpen(false)}
            className="absolute top-12 right-6 w-11 h-11 rounded-full bg-white/20 items-center justify-center z-10"
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Counter at top */}
          {galleryImages.length > 1 && (
            <View className="absolute top-14 bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                {activeImageIndex + 1} / {galleryImages.length}
              </Text>
            </View>
          )}

          {/* Fullscreen Image (tap advances) */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleNextImage}
            className="w-full h-4/5 justify-center items-center"
          >
            <Image
              source={{ uri: galleryImages[activeImageIndex] }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Left Arrow in Modal */}
          {galleryImages.length > 1 && (
            <TouchableOpacity
              onPress={handlePrevImage}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="absolute left-4 top-1/2 -mt-6 w-12 h-12 rounded-full bg-white/20 items-center justify-center z-10"
            >
              <ChevronLeft size={28} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Right Arrow in Modal */}
          {galleryImages.length > 1 && (
            <TouchableOpacity
              onPress={handleNextImage}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              className="absolute right-4 top-1/2 -mt-6 w-12 h-12 rounded-full bg-white/20 items-center justify-center z-10"
            >
              <ChevronRight size={28} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Navigation Controls in Modal */}
          {galleryImages.length > 1 && (
            <View className="flex-row items-center justify-center gap-3 mt-4">
              {galleryImages.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveImageIndex(idx)}
                  className={`w-3 h-3 rounded-full ${
                    idx === activeImageIndex ? "bg-amber-400 scale-125" : "bg-white/40"
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
