import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  Bell,
  Home,
  Settings,
  Navigation,
} from "lucide-react-native";
import { Category, Service, UserLocation } from "../types";
import { fetchCategories, fetchServices } from "../config/api";
import { ServiceCard } from "./ServiceCard";
import { SettingsScreen } from "./SettingsScreen";
import { useTheme } from "../context/ThemeContext";

// Shimmer Skeleton for Category Card (exact geometry match)
const CategorySkeletonCard: React.FC<{ animStyle: any }> = ({ animStyle }) => (
  <View className="w-[48%] bg-white dark:bg-slate-900 rounded-[6px] border border-slate-200/90 dark:border-slate-800 py-3 px-3 items-center justify-center mb-3.5 shadow-2xs">
    <Animated.View
      style={animStyle}
      className="w-14 h-14 rounded-xl bg-slate-200/80 dark:bg-slate-800 mb-2.5"
    />
    <Animated.View
      style={animStyle}
      className="w-20 h-3.5 rounded bg-slate-200/90 dark:bg-slate-800 mb-1"
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
    <Animated.View
      style={animStyle}
      className="w-[50px] h-[50px] rounded-2xl bg-slate-200/80 dark:bg-slate-800 mr-3 shrink-0"
    />
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
    <Animated.View
      style={animStyle}
      className="w-11 h-11 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0"
    />
  </View>
);

interface HomeScreenProps {
  userLocation?: UserLocation | null;
  onChangeLocation?: () => void;
  onSelectService: (service: Service) => void;
  onSelectCategory: (category: Category) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userLocation,
  onChangeLocation,
  onSelectCategory,
  onSelectService,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "setting">("home");

  // Entrance spring-bezier animation
  const entranceAnim = useRef(new Animated.Value(0)).current;

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
    entranceAnim.setValue(0);
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 520,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, []);

  const headerTranslateY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });
  const headerOpacity = entranceAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 1, 1],
  });

  const searchTranslateY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });
  const searchOpacity = entranceAnim.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 1, 1],
  });

  // Load Categories & Location-Sorted Services from Backend API
  const loadData = async () => {
    try {
      if (categories.length === 0) {
        setLoading(true);
      }
      const [cats, srvs] = await Promise.all([
        fetchCategories(),
        fetchServices(undefined, undefined, userLocation),
      ]);
      setCategories(cats);
      setServices(srvs);
    } catch (err) {
      console.warn("Failed loading home data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userLocation?.latitude, userLocation?.longitude]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter categories by search
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter services by search
  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      Boolean(s.businessName && s.businessName.toLowerCase().includes(q)) ||
      (s.categoryName && s.categoryName.toLowerCase().includes(q)) ||
      (s.subcategoryName && s.subcategoryName.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  const statusBarBg = isDark
    ? (activeTab === "setting" ? "#0f172a" : "#020617")
    : (activeTab === "setting" ? "#ffffff" : "#f8fafc");
  const statusBarStyle: "light" | "dark" = isDark ? "light" : "dark";

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle(statusBarStyle === "light" ? "light-content" : "dark-content", true);
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
      {activeTab === "setting" ? (
        <SettingsScreen
          userLocation={userLocation}
          onChangeLocation={onChangeLocation || (() => {})}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 12) + 85,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e0b328"
            />
          }
        >
        {/* Top Header: Location & Notification with slide-in animation */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
          className="px-6 pt-4 pb-2 flex-row items-center justify-between"
        >
          <View className="flex-1 mr-3">
            <TouchableOpacity
              onPress={onChangeLocation}
              activeOpacity={0.7}
              className="flex-row items-center space-x-1"
            >
              <Text className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
                My Location
              </Text>
              <Text className="text-primary text-xs font-bold ml-1">▾</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onChangeLocation}
              activeOpacity={0.8}
            >
              <Text
                className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                numberOfLines={1}
              >
                {userLocation ? `${userLocation.area}, ${userLocation.city}` : "Select Location"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notification Bell Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 items-center justify-center relative shadow-2xs"
          >
            <Bell size={18} color={isDark ? "#cbd5e1" : "#334155"} />
            <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar with slide-in animation */}
        <Animated.View
          style={{
            opacity: searchOpacity,
            transform: [{ translateY: searchTranslateY }],
          }}
          className="px-6 my-4"
        >
          <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3.5 rounded-2xl shadow-2xs">
            <Search size={18} color={isDark ? "#64748b" : "#94a3b8"} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search category or service..."
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              className="flex-1 text-sm text-slate-800 dark:text-slate-100 font-medium px-2 py-0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text className="text-slate-400 text-xs font-bold">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Categories Section - Exactly 2 Columns with Skeletons while loading */}
        {loading && categories.length === 0 ? (
          <View className="px-6 mb-5">
            <View className="flex-row flex-wrap justify-between">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CategorySkeletonCard key={i} animStyle={{ opacity: shimmerAnim }} />
              ))}
            </View>
          </View>
        ) : (
          <View className="px-6 mb-5">
            {/* 2-Column Smart Cards Grid matching screenshot style */}
            <View className="flex-row flex-wrap justify-between">
              {filteredCategories.map((cat) => {
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => onSelectCategory(cat)}
                    activeOpacity={0.75}
                    className="w-[48%] bg-white dark:bg-slate-900 rounded-[6px] border border-slate-200/90 dark:border-slate-800 py-3 px-3 items-center justify-center mb-3.5 shadow-2xs active:bg-slate-50 dark:active:bg-slate-800 active:border-primary/60"
                  >
                    {/* Top: Admin-uploaded Image */}
                    <View className="w-14 h-14 mb-2.5 items-center justify-center">
                      {cat.image ? (
                        <Image
                          source={{ uri: cat.image }}
                          className="w-12 h-12 rounded-xl"
                          resizeMode="contain"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 items-center justify-center">
                          <Text className="text-2xl">🛠️</Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom: Exact Admin-provided Name */}
                    <Text
                      className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 text-center tracking-tight"
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Nearby Services Section - Location Based (Closest First) or Skeletons while loading */}
        {loading && services.length === 0 ? (
          <View className="px-6 mb-28">
            <View className="flex-row items-center justify-between mb-3">
              <Animated.View
                style={{ opacity: shimmerAnim }}
                className="w-40 h-4 rounded bg-slate-200/80 dark:bg-slate-800"
              />
              <Animated.View
                style={{ opacity: shimmerAnim }}
                className="w-20 h-4 rounded-full bg-slate-200/70 dark:bg-slate-800"
              />
            </View>
            {[1, 2, 3].map((i) => (
              <ServiceSkeletonCard key={i} animStyle={{ opacity: shimmerAnim }} />
            ))}
          </View>
        ) : filteredServices.length > 0 ? (
          <View className="px-6 mb-28">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <Navigation size={15} color="#d97706" />
                <Text
                  className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight ml-1.5"
                  numberOfLines={1}
                >
                  {userLocation?.area
                    ? `Nearby Services in ${userLocation.area}`
                    : "Nearby Services Around You"}
                </Text>
              </View>
              <View className="bg-amber-100/90 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                <Text className="text-[10px] font-extrabold text-amber-900 dark:text-amber-300">
                  ⚡ Closest First
                </Text>
              </View>
            </View>

            {/* List top closest services */}
            {filteredServices.slice(0, 15).map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                onPress={() => onSelectService(srv)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      )}

      {/* Full-Width Edge-to-Edge Bottom Navigation Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800"
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          elevation: 20,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
        }}
      >
        <View className="flex-row items-center justify-between px-5 pt-2.5">
          {/* Home Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("home")}
            activeOpacity={0.7}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-4 mx-1.5 rounded-2xl ${
              activeTab === "home"
                ? "bg-[#e0b328]/15 border border-[#e0b328]/60 shadow-2xs"
                : "bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/80"
            }`}
          >
            <View
              className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${
                activeTab === "home"
                  ? "bg-[#e0b328] shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700"
              }`}
            >
              <Home
                size={17}
                color={activeTab === "home" ? "#0f172a" : isDark ? "#94a3b8" : "#64748b"}
                strokeWidth={activeTab === "home" ? 2.6 : 2}
              />
            </View>
            <View>
              <Text
                className={`text-xs tracking-tight ${
                  activeTab === "home"
                    ? "font-black text-slate-900 dark:text-slate-100"
                    : "font-bold text-slate-500 dark:text-slate-400"
                }`}
              >
                Home
              </Text>
              {activeTab === "home" && (
                <View className="w-3.5 h-0.5 rounded-full bg-[#e0b328] mt-0.5" />
              )}
            </View>
          </TouchableOpacity>

          {/* Settings Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("setting")}
            activeOpacity={0.7}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-4 mx-1.5 rounded-2xl ${
              activeTab === "setting"
                ? "bg-[#e0b328]/15 border border-[#e0b328]/60 shadow-2xs"
                : "bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/80"
            }`}
          >
            <View
              className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${
                activeTab === "setting"
                  ? "bg-[#e0b328] shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700"
              }`}
            >
              <Settings
                size={17}
                color={activeTab === "setting" ? "#0f172a" : isDark ? "#94a3b8" : "#64748b"}
                strokeWidth={activeTab === "setting" ? 2.6 : 2}
              />
            </View>
            <View>
              <Text
                className={`text-xs tracking-tight ${
                  activeTab === "setting"
                    ? "font-black text-slate-900 dark:text-slate-100"
                    : "font-bold text-slate-500 dark:text-slate-400"
                }`}
              >
                Settings
              </Text>
              {activeTab === "setting" && (
                <View className="w-3.5 h-0.5 rounded-full bg-[#e0b328] mt-0.5" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
