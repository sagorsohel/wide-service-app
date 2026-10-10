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
} from "lucide-react-native";
import { UserLocation } from "../types";

interface SettingsScreenProps {
  userLocation?: UserLocation | null;
  onChangeLocation: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userLocation,
  onChangeLocation,
}) => {
  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Top Header */}
      <View className="px-6 pt-4 pb-3 bg-white border-b border-slate-100">
        <Text className="text-2xl font-black text-slate-900 tracking-tight">
          Settings
        </Text>
        <Text className="text-xs text-slate-400 font-medium mt-0.5">
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
          <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Service Location
          </Text>

          <View className="bg-white rounded-3xl p-5 border-2 border-[#e0b328] shadow-lg shadow-amber-500/10">
            <View className="flex-row items-start justify-between mb-3.5">
              <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-300 items-center justify-center mr-3">
                  <MapPin size={22} color="#b45309" />
                </View>
                <View>
                  <Text className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Current Location
                  </Text>
                  <Text className="text-base font-black text-slate-900 tracking-tight">
                    {userLocation?.area || "Not Selected"}
                  </Text>
                </View>
              </View>

              <View className="bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300">
                <Text className="text-xs font-bold text-amber-950">
                  {userLocation?.city || "Bangladesh"}
                </Text>
              </View>
            </View>

            {/* Address Details */}
            <View className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 mb-4">
              <Text className="text-[11px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">
                Full Address
              </Text>
              <Text className="text-xs font-bold text-slate-800 leading-snug">
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
          <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Preferences
          </Text>

          <View className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {/* Notifications */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
                  <Bell size={18} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Notifications</Text>
                  <Text className="text-[11px] text-slate-400">Order & service updates</Text>
                </View>
              </View>
              <View className="bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold text-emerald-800">Enabled</Text>
              </View>
            </View>

            {/* Language */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-purple-50 items-center justify-center mr-3">
                  <Globe size={18} color="#7c3aed" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Language</Text>
                  <Text className="text-[11px] text-slate-400">English / বাংলা</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-slate-600">English</Text>
            </View>
          </View>
        </View>

        {/* 3. SUPPORT & HELP */}
        <View className="mb-6">
          <Text className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Support
          </Text>

          <View className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            {/* Helpline Call */}
            <TouchableOpacity
              onPress={() => Linking.openURL("tel:01712458921")}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4 border-b border-slate-100"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                  <Phone size={18} color="#059669" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Customer Helpline</Text>
                  <Text className="text-[11px] text-slate-400">24/7 dedicated support</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>

            {/* Privacy & Policy */}
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center mr-3">
                  <Shield size={18} color="#d97706" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Privacy & Terms</Text>
                  <Text className="text-[11px] text-slate-400">Security & data policy</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </View>

            {/* App Info */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3">
                  <Info size={18} color="#475569" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">About Wide Service</Text>
                  <Text className="text-[11px] text-slate-400">Version 1.0.0</Text>
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
