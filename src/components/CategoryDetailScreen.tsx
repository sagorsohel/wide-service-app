import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MapPin, Navigation } from "lucide-react-native";
import { Category, Subcategory, Service, UserLocation } from "../types";
import { fetchSubcategories, fetchServices } from "../config/api";
import { ServiceCard } from "./ServiceCard";
import { NoServicesEmptyState } from "./NoServicesEmptyState";

const RADIUS_OPTIONS = [
  { label: "All Distance", value: null },
  { label: "Within 1 km", value: 1 },
  { label: "Within 2 km", value: 2 },
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
];

// Shimmer Skeleton for Subcategory Card (exact geometry match)
const SubcategorySkeletonCard: React.FC<{ animStyle: any }> = ({ animStyle }) => (
  <View className="w-[48%] rounded-[6px] border border-slate-200/90 dark:border-slate-800 py-3 px-3 items-center justify-center mb-3.5 shadow-2xs bg-white dark:bg-slate-900">
    <Animated.View
      style={animStyle}
      className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-800 mb-2.5"
    />
    <Animated.View
      style={animStyle}
      className="w-20 h-3 rounded bg-slate-200/90 dark:bg-slate-800 mb-1"
    />
    <Animated.View
      style={animStyle}
      className="w-12 h-2.5 rounded bg-slate-200/60 dark:bg-slate-800/60"
    />
  </View>
);

// Shimmer Skeleton for Service Card (exact geometry match)
const ServiceSkeletonCard: React.FC<{ animStyle: any }> = ({ animStyle }) => (
  <View className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-2xs mb-3 flex-row items-center">
    {/* Left: Image / Logo */}
    <Animated.View
      style={animStyle}
      className="w-[50px] h-[50px] rounded-2xl bg-slate-200/80 dark:bg-slate-800 mr-3 shrink-0"
    />

    {/* Middle: Info */}
    <View className="flex-1 justify-center pr-2">
      <Animated.View
        style={animStyle}
        className="w-40 h-3.5 rounded bg-slate-200/90 dark:bg-slate-800 mb-2"
      />
      <View className="flex-row items-center justify-between mb-2">
        <Animated.View
          style={animStyle}
          className="w-24 h-2.5 rounded bg-slate-200/70 dark:bg-slate-800/70"
        />
        <Animated.View
          style={animStyle}
          className="w-14 h-4 rounded-full bg-slate-100 dark:bg-slate-800"
        />
      </View>
      <Animated.View
        style={animStyle}
        className="w-32 h-2.5 rounded bg-slate-200/60 dark:bg-slate-800/60 mb-1.5"
      />
      <Animated.View
        style={animStyle}
        className="w-20 h-2.5 rounded bg-slate-200/50 dark:bg-slate-800/50"
      />
    </View>

    {/* Right: Direct Call Button */}
    <Animated.View
      style={animStyle}
      className="w-11 h-11 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0"
    />
  </View>
);

// Shimmer Skeleton for Proximity & Radius Filter Bar (exact geometry match)
const FilterBarSkeleton: React.FC<{ animStyle: any }> = ({ animStyle }) => (
  <View className="px-6 mb-3">
    {/* Top Proximity Bar Line */}
    <View className="flex-row items-center justify-between mb-2">
      <Animated.View
        style={animStyle}
        className="w-36 h-3.5 rounded bg-slate-200/80"
      />
      <Animated.View
        style={animStyle}
        className="w-20 h-4 rounded-full bg-slate-200/70"
      />
    </View>

    {/* Horizontal Radius Chips Row */}
    <View className="flex-row py-1">
      <Animated.View
        style={animStyle}
        className="w-20 h-7 rounded-full bg-slate-200/80 mr-2"
      />
      <Animated.View
        style={animStyle}
        className="w-24 h-7 rounded-full bg-slate-200/80 mr-2"
      />
      <Animated.View
        style={animStyle}
        className="w-24 h-7 rounded-full bg-slate-200/80 mr-2"
      />
      <Animated.View
        style={animStyle}
        className="w-24 h-7 rounded-full bg-slate-200/80"
      />
    </View>
  </View>
);

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

  // Master coordinated fluid entrance animation
  const animValue = useRef(new Animated.Value(0)).current;

  // Shimmer pulse animation for skeletons
  const shimmerAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.95,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.4,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 520,
      easing: Easing.bezier(0.16, 1, 0.3, 1), // Apple-grade ultra-smooth easeOutExpo
      useNativeDriver: true,
    }).start();
  }, [category.id]);

  // Choreographed interpolations for butter-smooth smart feel
  const backBtnTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });
  const backBtnOpacity = animValue.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 1, 1],
  });

  const iconScale = animValue.interpolate({
    inputRange: [0, 0.5, 0.8, 1],
    outputRange: [0.35, 1.15, 0.96, 1],
  });
  const iconOpacity = animValue.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 1, 1],
  });
  const iconTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });

  const titleTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });
  const titleOpacity = animValue.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 1, 1],
  });
  const titleScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  const contentTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0],
  });
  const contentOpacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.5, 0.95, 1],
  });

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

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle("dark-content", true);
      RNStatusBar.setBackgroundColor("#ffffff", true);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar style="dark" animated={true} />
      {/* Top Header - Fixed/Sticky with Light Background (No Yellow) */}
      <View className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-5 py-3 shadow-2xs">
        <View className="flex-row items-center justify-between">
          {/* Back Icon Button with slide-in animation */}
          <Animated.View
            style={{
              opacity: backBtnOpacity,
              transform: [{ translateX: backBtnTranslateX }],
            }}
          >
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center -ml-1 active:opacity-60"
            >
              <ChevronLeft size={24} color="#0f172a" strokeWidth={2.4} />
            </TouchableOpacity>
          </Animated.View>

          {/* Animated Center Content: Category Icon Emblem + Name */}
          <View className="flex-1 px-2 flex-row items-center justify-center">
            {/* Pop-in Category Emblem Badge */}
            <Animated.View
              style={{
                opacity: iconOpacity,
                transform: [
                  { translateY: iconTranslateY },
                  { scale: iconScale },
                ],
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 items-center justify-center mr-2 shadow-xs overflow-hidden"
            >
              {category.image ? (
                <Image
                  source={{ uri: category.image }}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              ) : (
                <Text className="text-base">🛠️</Text>
              )}
            </Animated.View>

            {/* Slide-in Title */}
            <Animated.View
              style={{
                opacity: titleOpacity,
                transform: [
                  { translateY: titleTranslateY },
                  { scale: titleScale },
                ],
              }}
            >
              <Text
                className="text-base font-black text-slate-900 dark:text-white tracking-tight text-center"
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </Animated.View>
          </View>

          {/* Symmetrical Spacer */}
          <View className="w-10 h-10" />
        </View>
      </View>

      {/* Content Container */}
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
        className="flex-1 bg-slate-50 dark:bg-slate-950"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e0b328"
            />
          }
        >
        {/* Subcategories Section (2-Column Grid matching Category Cards: flex-col, col2) */}
        {loading && subcategories.length === 0 ? (
          <View className="px-6 mt-2 mb-6">
            <View className="flex-row flex-wrap justify-between">
              {[1, 2, 3, 4].map((i) => (
                <SubcategorySkeletonCard key={i} animStyle={{ opacity: shimmerAnim }} />
              ))}
            </View>
          </View>
        ) : subcategories.length > 0 ? (
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
                    className="w-[48%] rounded-[6px] border border-slate-200/90 dark:border-slate-800 py-3 px-3 items-center justify-center mb-3.5 shadow-2xs bg-white dark:bg-slate-900 active:bg-slate-50 dark:active:bg-slate-800"
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
                        <View className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 items-center justify-center">
                          <Text className="text-2xl">🛠️</Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom: Subcategory Name */}
                    <Text
                      className="text-xs sm:text-sm font-semibold text-center tracking-tight text-slate-800 dark:text-slate-200"
                      numberOfLines={2}
                    >
                      {subCat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Location-Based Proximity & Radius Filter Bar */}
        {loading ? (
          <FilterBarSkeleton animStyle={{ opacity: shimmerAnim }} />
        ) : (
          <View className="px-6 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1 mr-2">
                <Navigation size={14} color="#d97706" />
                <Text className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight ml-1.5" numberOfLines={1}>
                  {userLocation?.area ? `Services near ${userLocation.area}` : "Services near you"}
                </Text>
              </View>
              <View className="bg-amber-100/90 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                <Text className="text-[10px] font-extrabold text-amber-900 dark:text-amber-300">
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
                        ? "bg-slate-900 dark:bg-[#e0b328] border-slate-900 dark:border-[#e0b328] shadow-2xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 active:bg-slate-100 dark:active:bg-slate-800"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white dark:text-slate-950" : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Services List / Skeletons (Prevents layout displacement) */}
        {loading ? (
          <View className="px-6 mb-20">
            {[1, 2, 3, 4].map((i) => (
              <ServiceSkeletonCard key={i} animStyle={{ opacity: shimmerAnim }} />
            ))}
          </View>
        ) : services.length === 0 ? (
          <NoServicesEmptyState
            selectedRadius={selectedRadius}
            onClearRadius={() => setSelectedRadius(null)}
            onRefresh={onRefresh}
            categoryName={category.name}
            userArea={userLocation?.area}
          />
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
      </Animated.View>
    </SafeAreaView>
  );
};
