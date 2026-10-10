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
  Compass,
  MessageCircle,
  Clock,
  Settings,
} from "lucide-react-native";
import { Category, Service, UserLocation } from "../types";
import { fetchCategories } from "../config/api";

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
  onBackToSplash,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "discover" | "chat" | "history" | "setting">("home");

  // Load Categories from Backend API
  const loadData = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.warn("Failed loading categories:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter categories by search
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
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
        <View className="px-6 mb-24">
          

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
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-3 px-6 flex-row items-center justify-between shadow-2xl">
        <TouchableOpacity
          onPress={() => setActiveTab("home")}
          className="items-center"
        >
          <Home size={20} color={activeTab === "home" ? "#e0b328" : "#94a3b8"} />
          <Text
            className={`text-[10px] font-bold mt-1 ${
              activeTab === "home" ? "text-primary" : "text-slate-400"
            }`}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("discover")}
          className="items-center"
        >
          <Compass size={20} color={activeTab === "discover" ? "#e0b328" : "#94a3b8"} />
          <Text
            className={`text-[10px] font-bold mt-1 ${
              activeTab === "discover" ? "text-primary" : "text-slate-400"
            }`}
          >
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("chat")}
          className="items-center"
        >
          <MessageCircle size={20} color={activeTab === "chat" ? "#e0b328" : "#94a3b8"} />
          <Text
            className={`text-[10px] font-bold mt-1 ${
              activeTab === "chat" ? "text-primary" : "text-slate-400"
            }`}
          >
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          className="items-center"
        >
          <Clock size={20} color={activeTab === "history" ? "#e0b328" : "#94a3b8"} />
          <Text
            className={`text-[10px] font-bold mt-1 ${
              activeTab === "history" ? "text-primary" : "text-slate-400"
            }`}
          >
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("setting")}
          className="items-center"
        >
          <Settings size={20} color={activeTab === "setting" ? "#e0b328" : "#94a3b8"} />
          <Text
            className={`text-[10px] font-bold mt-1 ${
              activeTab === "setting" ? "text-primary" : "text-slate-400"
            }`}
          >
            Setting
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
