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
import { ChevronLeft } from "lucide-react-native";
import { Category, Subcategory, Service } from "../types";
import { fetchSubcategories, fetchServices } from "../config/api";

interface CategoryDetailScreenProps {
  category: Category;
  onBack: () => void;
  onSelectService: (service: Service) => void;
}

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  category,
  onBack,
  onSelectService,
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load subcategories and services for this category
  const loadCategoryData = async (subCatId?: number | null) => {
    try {
      setLoading(true);
      const [subCats, srvs] = await Promise.all([
        fetchSubcategories(category.id),
        fetchServices(category.id, subCatId || undefined),
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
    loadCategoryData(selectedSubcategoryId);
  }, [category.id, selectedSubcategoryId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategoryData(selectedSubcategoryId);
  };

  const selectedSubcategory = subcategories.find(
    (s) => s.id === selectedSubcategoryId
  );

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
          <View className="px-6 mt-4 mb-6">
            <View className="flex-row items-center justify-between mb-3.5">
              

              {selectedSubcategoryId !== null && (
                <TouchableOpacity
                  onPress={() => setSelectedSubcategoryId(null)}
                  activeOpacity={0.7}
                  className="bg-primary/15 px-3 py-1 rounded-full border border-primary/30"
                >
                  <Text className="text-xs font-bold text-amber-800">
                    ✕ Reset Filter
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 2-Column Grid (Category Card Style: flex-col, col 2) */}
            <View className="flex-row flex-wrap justify-between">
              {subcategories.map((subCat) => {
                const isSelected = selectedSubcategoryId === subCat.id;
                const subCatImage = subCat.image;

                return (
                  <TouchableOpacity
                    key={subCat.id}
                    onPress={() =>
                      setSelectedSubcategoryId(isSelected ? null : subCat.id)
                    }
                    activeOpacity={0.75}
                    className={`w-[48%] rounded-[6px] border py-3 px-3 items-center justify-center mb-3.5 shadow-2xs ${
                      isSelected
                        ? "bg-amber-50/70 border-primary shadow-xs"
                        : "bg-white border-slate-200/90 active:bg-slate-50"
                    }`}
                  >
                    {/* Top: Admin-uploaded Transparent PNG Image */}
                    <View className="w-14 h-14 mb-2.5 items-center justify-center relative">
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
                      {isSelected && (
                        <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
                          <Text className="text-[9px] font-black text-white">✓</Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom: Subcategory Name */}
                    <Text
                      className={`text-xs sm:text-sm font-semibold text-center tracking-tight ${
                        isSelected ? "text-amber-950 font-bold" : "text-slate-800"
                      }`}
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

        {/* Services Section Header */}
        <View className="px-6 flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xl font-black text-slate-900 tracking-tight">
              {selectedSubcategory
                ? selectedSubcategory.name
                : `${category.name} Services`}
            </Text>
            <Text className="text-xs text-slate-400 font-medium">
              {services.length} service{services.length !== 1 ? "s" : ""} available
            </Text>
          </View>

          {selectedSubcategoryId !== null && (
            <TouchableOpacity
              onPress={() => setSelectedSubcategoryId(null)}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-bold text-primary">View All</Text>
            </TouchableOpacity>
          )}
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
          <View className="px-6 space-y-4 mb-20">
            {services.map((service) => {
              const imageUri =
                service.logo ||
                (Array.isArray(service.images) && service.images[0]) ||
                "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400";

              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => onSelectService(service)}
                  activeOpacity={0.85}
                  className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex-row space-x-3.5 mb-3"
                >
                  {/* Service Photo with Favorite Heart */}
                  <View className="relative w-24 h-24 rounded-2xl overflow-hidden bg-amber-50/40 items-center justify-center p-2 border border-slate-100">
                    <Image
                      source={{ uri: imageUri }}
                      className="w-16 h-16"
                      resizeMode="contain"
                    />
                    <View className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 items-center justify-center shadow-xs">
                      <Text className="text-rose-500 text-[10px]">♥</Text>
                    </View>
                  </View>

                  {/* Service Details */}
                  <View className="flex-1 justify-between py-0.5 pr-1">
                    <View>
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-base font-extrabold text-slate-900 flex-1 mr-2 tracking-tight"
                          numberOfLines={1}
                        >
                          {service.name}
                        </Text>
                        <View className="flex-row items-center bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                          <Text className="text-primary text-[10px] font-bold mr-0.5">
                            ★
                          </Text>
                          <Text className="text-[11px] font-bold text-slate-800">
                            {service.rating || 4.9}
                          </Text>
                        </View>
                      </View>

                      <Text
                        className="text-xs font-semibold text-slate-400 mt-0.5"
                        numberOfLines={1}
                      >
                        {service.businessName}
                      </Text>

                      {service.subcategoryName && (
                        <View className="mt-1 self-start bg-blue-50 px-2 py-0.5 rounded-full">
                          <Text className="text-[10px] font-semibold text-blue-700">
                            {service.subcategoryName}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom Pricing & Address */}
                    <View className="flex-row items-center justify-between pt-1.5 border-t border-slate-100 mt-1">
                      <Text className="text-xs font-black text-amber-700">
                        {service.price || "৳৫০০ - ৳২,০০০"}
                      </Text>
                      <View className="flex-row items-center max-w-[160px]">
                        <Text className="text-slate-400 text-xs mr-1">📍</Text>
                        <Text
                          className="text-[10px] font-semibold text-slate-500"
                          numberOfLines={1}
                        >
                          {service.address}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};
