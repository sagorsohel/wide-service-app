import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

interface HomeScreenProps {
  userLocation?: UserLocation | null;
  onChangeLocation?: () => void;
  onSelectService: (service: Service) => void;
  onSelectCategory: (category: Category) => void;
  onBackToSplash?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userLocation,
  onChangeLocation,
  onSelectCategory,
  onSelectService,
  onBackToSplash,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "setting">("home");

  // Load Categories & Location-Sorted Services from Backend API
  const loadData = async () => {
    try {
      const [cats, srvs] = await Promise.all([
        fetchCategories(),
        fetchServices(undefined, undefined, userLocation),
      ]);
      setCategories(cats);
      setServices(srvs);
    } catch (err) {
      console.warn("Failed loading home data:", err);
    } finally {
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
      s.businessName.toLowerCase().includes(q) ||
      (s.categoryName && s.categoryName.toLowerCase().includes(q)) ||
      (s.subcategoryName && s.subcategoryName.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      {activeTab === "setting" ? (
        <SettingsScreen
          userLocation={userLocation}
          onChangeLocation={onChangeLocation || onBackToSplash || (() => {})}
        />
      ) : (
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
        {/* Top Header: Location & Notification */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <TouchableOpacity
              onPress={onChangeLocation || onBackToSplash}
              activeOpacity={0.7}
              className="flex-row items-center space-x-1"
            >
              <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                My Location
              </Text>
              <Text className="text-primary text-xs font-bold ml-1">▾</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onChangeLocation || onBackToSplash}
              activeOpacity={0.8}
            >
              <Text
                className="text-xl font-black text-slate-900 tracking-tight"
                numberOfLines={1}
              >
                {userLocation ? `${userLocation.area}, ${userLocation.city}` : "Select Location"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notification Bell Badge */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full bg-white border border-slate-200/80 items-center justify-center relative shadow-2xs"
          >
            <Bell size={18} color="#334155" />
            <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-6 my-4">
          <View className="flex-row items-center bg-white border border-slate-200/80 px-4 py-3.5 rounded-2xl shadow-2xs">
            <Search size={18} color="#94a3b8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search category or service..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-sm text-slate-800 font-medium px-2 py-0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text className="text-slate-400 text-xs font-bold">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Section - Exactly 2 Columns with Admin Name & Admin Image */}
        <View className="px-6 mb-5">
          {/* 2-Column Smart Cards Grid matching screenshot style */}
          <View className="flex-row flex-wrap justify-between">
            {filteredCategories.map((cat) => {
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => onSelectCategory(cat)}
                  activeOpacity={0.75}
                  className="w-[48%] bg-white rounded-[6px] border border-slate-200/90 py-3 px-3 items-center justify-center mb-3.5 shadow-2xs active:bg-slate-50 active:border-primary/60"
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
                      <View className="w-12 h-12 rounded-xl bg-amber-50 items-center justify-center">
                        <Text className="text-2xl">🛠️</Text>
                      </View>
                    )}
                  </View>

                  {/* Bottom: Exact Admin-provided Name */}
                  <Text
                    className="text-xs sm:text-sm font-semibold text-slate-800 text-center tracking-tight"
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Nearby Services Section - Location Based (Closest First) */}
        {filteredServices.length > 0 && (
          <View className="px-6 mb-28">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <Navigation size={15} color="#d97706" />
                <Text
                  className="text-sm font-black text-slate-900 tracking-tight ml-1.5"
                  numberOfLines={1}
                >
                  {userLocation?.area
                    ? `Nearby Services in ${userLocation.area}`
                    : "Nearby Services Around You"}
                </Text>
              </View>
              <View className="bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                <Text className="text-[10px] font-extrabold text-amber-900">
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
        )}
      </ScrollView>
      )}

      {/* Elevated Floating Bottom Navigation Bar (Home & Settings Only) */}
      <View
        className="absolute bottom-5 left-8 right-8 bg-white/95 backdrop-blur-md py-2 px-4 rounded-full flex-row items-center justify-around border border-slate-200/90 shadow-xl"
        style={{
          elevation: 10,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 14,
        }}
      >
        {/* Home Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab("home")}
          activeOpacity={0.8}
          className={`flex-row items-center py-2 px-5 rounded-full ${
            activeTab === "home"
              ? "bg-amber-100/90 border border-amber-300"
              : "bg-transparent"
          }`}
        >
          <Home
            size={19}
            color={activeTab === "home" ? "#b45309" : "#64748b"}
          />
          <Text
            className={`text-xs ml-2 ${
              activeTab === "home"
                ? "text-amber-950 font-black"
                : "text-slate-500 font-bold"
            }`}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Settings Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab("setting")}
          activeOpacity={0.8}
          className={`flex-row items-center py-2 px-5 rounded-full ${
            activeTab === "setting"
              ? "bg-amber-100/90 border border-amber-300"
              : "bg-transparent"
          }`}
        >
          <Settings
            size={19}
            color={activeTab === "setting" ? "#b45309" : "#64748b"}
          />
          <Text
            className={`text-xs ml-2 ${
              activeTab === "setting"
                ? "text-amber-950 font-black"
                : "text-slate-500 font-bold"
            }`}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
