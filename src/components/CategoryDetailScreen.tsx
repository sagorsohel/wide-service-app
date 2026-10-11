import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MapPin, Navigation } from "lucide-react-native";
import { Category, Subcategory, Service, UserLocation } from "../types";
import { fetchSubcategories, fetchServices } from "../config/api";
import { ServiceCard } from "./ServiceCard";

const RADIUS_OPTIONS = [
  { label: "All Distance", value: null },
  { label: "Within 1 km", value: 1 },
  { label: "Within 2 km", value: 2 },
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
];

interface CategoryDetailScreenProps {
  category: Category;
  userLocation?: UserLocation | null;
  onBack: () => void;
  onSelectSubcategory: (subcategory: Subcategory) => void;
  onSelectService: (service: Service) => void;
}

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  category,
  userLocation,
  onBack,
  onSelectSubcategory,
  onSelectService,
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load subcategories and all services for this category ordered by proximity
  const loadCategoryData = async (radius: number | null = selectedRadius) => {
    try {
      setLoading(true);
      const [subCats, srvs] = await Promise.all([
        fetchSubcategories(category.id),
        fetchServices(category.id, undefined, userLocation, radius || undefined),
      ]);
      setSubcategories(subCats);
      setServices(srvs);
    } catch (err) {
      console.warn("Failed loading category data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategoryData(selectedRadius);
  }, [category.id, selectedRadius, userLocation?.latitude, userLocation?.longitude]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategoryData(selectedRadius);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#e0b328]">
      {/* Top Header with #e0b328 Color & Sleek Back Icon */}
      <View className="bg-[#e0b328] px-6 pt-2 pb-5">
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
              {category.name}
            </Text>
          </View>

          {/* Spacer */}
          <View className="w-10 h-10" />
        </View>
      </View>

      {/* Curvy Content Container matching reference screenshot */}
      <View className="flex-1 bg-slate-50 rounded-t-[36px] overflow-hidden">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e0b328"
            />
          }
        >
        {/* Subcategories Section (2-Column Grid matching Category Cards: flex-col, col2) */}
        {subcategories.length > 0 && (
          <View className="px-6 mt-2 mb-6">
           

            {/* 2-Column Grid (Category Card Style: flex-col, col 2) */}
            <View className="flex-row flex-wrap justify-between">
              {subcategories.map((subCat) => {
                const subCatImage = subCat.image;

                return (
                  <TouchableOpacity
                    key={subCat.id}
                    onPress={() => onSelectSubcategory(subCat)}
                    activeOpacity={0.75}
                    className="w-[48%] rounded-[6px] border border-slate-200/90 py-3 px-3 items-center justify-center mb-3.5 shadow-2xs bg-white active:bg-slate-50"
                  >
                    {/* Top: Admin-uploaded Transparent PNG Image */}
                    <View className="w-14 h-14 mb-2.5 items-center justify-center">
                      {subCatImage ? (
                        <Image
                          source={{ uri: subCatImage }}
                          className="w-12 h-12"
                          resizeMode="contain"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-xl bg-amber-50 items-center justify-center">
                          <Text className="text-2xl">🛠️</Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom: Subcategory Name */}
                    <Text
                      className="text-xs sm:text-sm font-semibold text-center tracking-tight text-slate-800"
                      numberOfLines={2}
                    >
                      {subCat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Location-Based Proximity & Radius Filter Bar */}
        <View className="px-6 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <Navigation size={14} color="#d97706" />
              <Text className="text-xs font-black text-slate-800 tracking-tight ml-1.5" numberOfLines={1}>
                {userLocation?.area ? `Services near ${userLocation.area}` : "Services near you"}
              </Text>
            </View>
            <View className="bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
              <Text className="text-[10px] font-extrabold text-amber-900">
                ⚡ Closest First
              </Text>
            </View>
          </View>

          {/* Circle Radius Filter Chips (All, < 1 km, < 2 km, < 5 km, < 10 km) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = selectedRadius === opt.value;
              return (
                <TouchableOpacity
                  key={opt.label}
                  activeOpacity={0.75}
                  onPress={() => setSelectedRadius(opt.value)}
                  className={`mr-2 px-3.5 py-1.5 rounded-full border flex-row items-center ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 shadow-2xs"
                      : "bg-white border-slate-200/90 active:bg-slate-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#e0b328" />
            <Text className="text-xs text-slate-400 mt-2 font-medium">
              Loading services...
            </Text>
          </View>
        )}

        {/* Services List / Cards */}
        {!loading && services.length === 0 ? (
          <View className="py-16 px-6 items-center justify-center">
            <Text className="text-3xl mb-2">🔍</Text>
            <Text className="text-sm font-bold text-slate-700">
              No services found
            </Text>
            <Text className="text-xs text-slate-400 mt-1 text-center">
              There are currently no services listed under this subcategory.
            </Text>
          </View>
        ) : (
          <View className="px-6 mb-20">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => onSelectService(service)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};
