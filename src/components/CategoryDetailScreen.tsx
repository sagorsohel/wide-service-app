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
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e0b328"
          />
        }
      >
        {/* Top Header with Back Button */}
        <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs items-center justify-center"
          >
            <Text className="text-slate-800 text-lg font-bold">‹</Text>
          </TouchableOpacity>

          <View className="flex-1 px-4 items-center">
            <Text
              className="text-base font-extrabold text-slate-900 tracking-tight text-center"
              numberOfLines={1}
            >
              {category.name}
            </Text>
            <Text className="text-[11px] text-slate-400 font-medium">
              Category Overview
            </Text>
          </View>

          {/* Spacer */}
          <View className="w-10 h-10" />
        </View>

        {/* Category Hero Banner */}
        <View className="px-6 my-2">
          <View className="relative w-full h-36 rounded-3xl overflow-hidden bg-slate-200 shadow-sm border border-slate-100">
            {category.image ? (
              <Image
                source={{ uri: category.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-blue-900/80 items-center justify-center">
                <Text className="text-4xl">🛠️</Text>
              </View>
            )}
            {/* Gradient Overlay */}
            <View className="absolute inset-0 bg-black/40 justify-end p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-lg font-black tracking-tight">
                    {category.name}
                  </Text>
                  <Text className="text-white/80 text-xs font-medium">
                    Verified technicians & expert partners
                  </Text>
                </View>
                <View className="bg-primary px-3 py-1 rounded-full">
                  <Text className="text-white text-[11px] font-bold">
                    {services.length} Services
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Subcategories Section (Shown if subcategories exist) */}
        {subcategories.length > 0 && (
          <View className="mt-4 mb-6">
            <View className="px-6 flex-row items-center justify-between mb-3">
              <View className="flex-row items-center space-x-2">
                <Text className="text-lg font-black text-slate-900 tracking-tight">
                  Subcategories
                </Text>
                <View className="bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                  <Text className="text-[11px] font-bold text-amber-900">
                    {subcategories.length}
                  </Text>
                </View>
              </View>

              {selectedSubcategoryId !== null && (
                <TouchableOpacity
                  onPress={() => setSelectedSubcategoryId(null)}
                  activeOpacity={0.7}
                  className="bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30"
                >
                  <Text className="text-xs font-bold text-amber-800">
                    ✕ Show All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Subcategory Cards Carousel / Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {/* "All" Subcategory Pill */}
              <TouchableOpacity
                onPress={() => setSelectedSubcategoryId(null)}
                activeOpacity={0.8}
                className={`w-36 rounded-2xl p-3 border shadow-xs items-center justify-center ${
                  selectedSubcategoryId === null
                    ? "bg-primary border-primary shadow-amber-500/20"
                    : "bg-white border-slate-200/80"
                }`}
              >
                <Text
                  className={`text-2xl mb-1 ${
                    selectedSubcategoryId === null ? "text-white" : "text-slate-700"
                  }`}
                >
                  ✨
                </Text>
                <Text
                  className={`text-xs font-bold text-center ${
                    selectedSubcategoryId === null ? "text-white" : "text-slate-800"
                  }`}
                  numberOfLines={1}
                >
                  All Services
                </Text>
                <Text
                  className={`text-[10px] mt-0.5 font-medium ${
                    selectedSubcategoryId === null ? "text-white/80" : "text-slate-400"
                  }`}
                >
                  Full Category
                </Text>
              </TouchableOpacity>

              {/* Dynamic Subcategory Cards */}
              {subcategories.map((subCat) => {
                const isSelected = selectedSubcategoryId === subCat.id;
                const subCatImage =
                  subCat.image ||
                  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400";

                return (
                  <TouchableOpacity
                    key={subCat.id}
                    onPress={() =>
                      setSelectedSubcategoryId(isSelected ? null : subCat.id)
                    }
                    activeOpacity={0.85}
                    className={`w-40 rounded-2xl p-2.5 border shadow-xs bg-white ${
                      isSelected
                        ? "border-2 border-primary bg-amber-50/40 shadow-md shadow-amber-500/10"
                        : "border-slate-200/80"
                    }`}
                  >
                    {/* Subcategory Image */}
                    <View className="relative w-full h-20 rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <Image
                        source={{ uri: subCatImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-primary">
                          <Text className="text-[9px] font-bold text-white">
                            Active
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Subcategory Name */}
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-amber-900" : "text-slate-800"
                      }`}
                      numberOfLines={2}
                    >
                      {subCat.name}
                    </Text>

                    <Text className="text-[10px] text-slate-400 mt-1 font-medium">
                      {isSelected ? "● Filtered" : "Tap to view"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
                  <View className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100">
                    <Image
                      source={{ uri: imageUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md items-center justify-center shadow-xs">
                      <Text className="text-rose-500 text-xs">♥</Text>
                    </View>
                  </View>

                  {/* Service Details */}
                  <View className="flex-1 justify-between py-1 pr-1">
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
                    <View className="flex-row items-center justify-between pt-2 border-t border-slate-50 mt-1">
                      <Text className="text-sm font-black text-slate-900">
                        {service.price || "$34.00 / Hr"}
                      </Text>
                      <View className="flex-row items-center space-x-1">
                        <Text className="text-slate-400 text-xs">📍</Text>
                        <Text
                          className="text-[11px] font-semibold text-slate-500 max-w-[80px]"
                          numberOfLines={1}
                        >
                          {service.address || "2.4 km"}
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
    </SafeAreaView>
  );
};
