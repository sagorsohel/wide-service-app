import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, MapPin, Navigation, X } from "lucide-react-native";
import { Service, UserLocation } from "../types";
import { fetchServices } from "../config/api";
import { ServiceCard } from "./ServiceCard";
import { NoServicesEmptyState } from "./NoServicesEmptyState";
import { useTheme } from "../context/ThemeContext";

const RADIUS_OPTIONS = [
  { label: "All Distance", value: null },
  { label: "Within 1 km", value: 1 },
  { label: "Within 2 km", value: 2 },
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
];

interface FindScreenProps {
  userLocation?: UserLocation | null;
  onChangeLocation: () => void;
  onSelectService: (service: Service) => void;
}

export const FindScreen: React.FC<FindScreenProps> = ({
  userLocation,
  onChangeLocation,
  onSelectService,
}) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (radius: number | null) => {
    try {
      const data = await fetchServices(
        undefined,
        undefined,
        userLocation,
        radius || undefined
      );
      setServices(data || []);
    } catch (e) {
      console.warn("[FindScreen] error fetching services:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedRadius);
  }, [selectedRadius, userLocation?.latitude, userLocation?.longitude]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedRadius);
  };

  const filteredServices = services.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.businessName && s.businessName.toLowerCase().includes(q)) ||
      (s.categoryName && s.categoryName.toLowerCase().includes(q)) ||
      (s.subcategoryName && s.subcategoryName.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  const statusBarBg = isDark ? "#020617" : "#f8fafc";
  const statusBarStyle: "light" | "dark" = isDark ? "light" : "dark";

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle(
        statusBarStyle === "light" ? "light-content" : "dark-content",
        true
      );
      RNStatusBar.setBackgroundColor(statusBarBg, true);
    }
  }, [statusBarStyle, statusBarBg]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f8fafc] dark:bg-slate-950"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: statusBarBg }}
    >
      <StatusBar style={statusBarStyle} animated={true} />

      {/* Top Fixed Header */}
      <View className="px-6 pt-3 pb-2 bg-[#f8fafc] dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-1 mr-3">
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Find Services
            </Text>
            <TouchableOpacity
              onPress={onChangeLocation}
              activeOpacity={0.7}
              className="flex-row items-center mt-0.5"
            >
              <MapPin size={12} color="#e0b328" className="mr-1" />
              <Text
                className="text-xs font-bold text-slate-500 dark:text-slate-400"
                numberOfLines={1}
              >
                {userLocation?.area
                  ? `${userLocation.area}, ${userLocation.city}`
                  : "Tap to set location"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-amber-100/90 dark:bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
            <Text className="text-[10px] font-extrabold text-amber-950 dark:text-amber-200">
              ⚡ Closest First
            </Text>
          </View>
        </View>

        {/* Live Search Input Box */}
        <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-3.5 py-2.5 rounded-2xl shadow-2xs mb-2">
          <Search size={17} color={isDark ? "#64748b" : "#94a3b8"} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search service, category, or technician..."
            placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
            className="flex-1 text-xs font-semibold text-slate-800 dark:text-slate-100 px-2 py-0"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
            >
              <X size={12} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Radius Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
        >
          {RADIUS_OPTIONS.map((opt) => {
            const isSelected = selectedRadius === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                activeOpacity={0.75}
                onPress={() => setSelectedRadius(opt.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? "bg-[#e0b328] border-amber-500 shadow-2xs"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected
                      ? "text-slate-950 font-black"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView
        className="flex-1 px-6 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 12) + 110,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e0b328"
          />
        }
      >
        {loading && services.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#e0b328" />
            <Text className="text-xs font-bold text-slate-400 mt-3">
              Locating nearby services...
            </Text>
          </View>
        ) : filteredServices.length > 0 ? (
          filteredServices.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              onPress={() => onSelectService(srv)}
            />
          ))
        ) : (
          <NoServicesEmptyState
            selectedRadius={selectedRadius}
            onClearRadius={() => setSelectedRadius(null)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
