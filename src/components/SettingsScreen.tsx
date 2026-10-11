import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import {
  MapPin,
  ChevronRight,
  Bell,
  Globe,
  Phone,
  Info,
  Shield,
  Compass,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react-native";
import { UserLocation } from "../types";
import { useTheme } from "../context/ThemeContext";

interface SettingsScreenProps {
  userLocation?: UserLocation | null;
  onChangeLocation: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userLocation,
  onChangeLocation,
}) => {
  const { isDark, setThemeMode } = useTheme();

  return (
    <View
      className="flex-1 bg-[#f8fafc] dark:bg-slate-950"
      style={{ backgroundColor: isDark ? "#020617" : "#f8fafc" }}
    >
      {/* Top Header */}
      <View
        className="px-6 pt-4 pb-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
        style={{ backgroundColor: isDark ? "#0f172a" : "#ffffff" }}
      >
        <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Settings
        </Text>
        <Text className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">
          Manage your location and app preferences
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 110 }}
      >
        {/* 1. HIGHLIGHTED LOCATION SECTION */}
        <View className="mb-6">
          <Text className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Service Location
          </Text>

          <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-[#e0b328] shadow-lg shadow-amber-500/10">
            <View className="flex-row items-start justify-between mb-3.5">
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-300 dark:border-amber-500/40 items-center justify-center mr-3">
                  <MapPin size={22} color="#b45309" />
                </View>
                <View>
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
                    Current Location
                  </Text>
                  <Text className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {userLocation?.area || "Not Selected"}
                  </Text>
                </View>
              </View>

              <View className="bg-amber-100/90 dark:bg-amber-950/70 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                <Text className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  {userLocation?.city || "Bangladesh"}
                </Text>
              </View>
            </View>

            {/* Address Details */}
            <View className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 mb-4">
              <Text className="text-[11px] font-bold text-slate-400 dark:text-slate-400 mb-0.5 uppercase tracking-wider">
                Full Address
              </Text>
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                {userLocation?.address || "No specific address set yet. Tap below to choose on map."}
              </Text>
            </View>

            {/* Change Location Action Button */}
            <TouchableOpacity
              onPress={onChangeLocation}
              activeOpacity={0.85}
              className="w-full bg-[#e0b328] py-3.5 px-4 rounded-2xl flex-row items-center justify-between shadow-md shadow-amber-500/25 active:opacity-90"
            >
              <View className="flex-row items-center">
                <Compass size={18} color="#0f172a" className="mr-2" />
                <Text className="text-slate-900 text-sm font-black tracking-wide">
                  Change Location On Map
                </Text>
              </View>
              <ArrowRight size={18} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. APP PREFERENCES */}
        <View className="mb-6">
          <Text className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Preferences
          </Text>

          <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            {/* Theme Appearance Mode Switcher (NEW) */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center flex-1 mr-3">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                    isDark ? "bg-amber-400/20" : "bg-amber-100"
                  }`}
                >
                  {isDark ? (
                    <Moon size={18} color="#f59e0b" />
                  ) : (
                    <Sun size={18} color="#d97706" />
                  )}
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Theme Appearance
                  </Text>
                  <Text className="text-[11px] text-slate-400 dark:text-slate-400">
                    {isDark ? "Dark mode active" : "Light mode active"}
                  </Text>
                </View>
              </View>

              {/* Segmented Light / Dark Switcher */}
              <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <TouchableOpacity
                  onPress={() => setThemeMode("light")}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-3 py-1.5 rounded-xl ${
                    !isDark
                      ? "bg-white shadow-xs border border-slate-200/50"
                      : "bg-transparent"
                  }`}
                >
                  <Sun size={13} color={!isDark ? "#b45309" : "#94a3b8"} className="mr-1" />
                  <Text
                    className={`text-xs ${
                      !isDark
                        ? "font-black text-amber-950"
                        : "font-semibold text-slate-400"
                    }`}
                  >
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setThemeMode("dark")}
                  activeOpacity={0.7}
                  className={`flex-row items-center px-3 py-1.5 rounded-xl ${
                    isDark
                      ? "bg-slate-900 border border-slate-700 shadow-xs"
                      : "bg-transparent"
                  }`}
                >
                  <Moon size={13} color={isDark ? "#38bdf8" : "#94a3b8"} className="mr-1" />
                  <Text
                    className={`text-xs ${
                      isDark
                        ? "font-black text-sky-200"
                        : "font-semibold text-slate-400"
                    }`}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 items-center justify-center mr-3">
                  <Bell size={18} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</Text>
                  <Text className="text-[11px] text-slate-400 dark:text-slate-400">Order & service updates</Text>
                </View>
              </View>
              <View className="bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                <Text className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Enabled</Text>
              </View>
            </View>

            {/* Language */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 items-center justify-center mr-3">
                  <Globe size={18} color="#7c3aed" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">Language</Text>
                  <Text className="text-[11px] text-slate-400 dark:text-slate-400">English / বাংলা</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">English</Text>
            </View>
          </View>
        </View>

        {/* 3. SUPPORT & HELP */}
        <View className="mb-6">
          <Text className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Support
          </Text>

          <View className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            {/* Helpline Call */}
            <TouchableOpacity
              onPress={() => Linking.openURL("tel:01712458921")}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center mr-3">
                  <Phone size={18} color="#059669" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">Customer Helpline</Text>
                  <Text className="text-[11px] text-slate-400 dark:text-slate-400">24/7 dedicated support</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>

            {/* Privacy & Policy */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 items-center justify-center mr-3">
                  <Shield size={18} color="#d97706" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">Privacy & Terms</Text>
                  <Text className="text-[11px] text-slate-400 dark:text-slate-400">Security & data policy</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </View>

            {/* App Info */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3">
                  <Info size={18} color="#94a3b8" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">About Wide Service</Text>
                  <Text className="text-[11px] text-slate-400 dark:text-slate-400">Version 1.0.0</Text>
                </View>
              </View>
              <Text className="text-xs font-mono font-bold text-slate-400">v1.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
