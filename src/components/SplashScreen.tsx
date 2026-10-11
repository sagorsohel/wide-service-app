import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StatusBar as RNStatusBar, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle("dark-content", true);
      RNStatusBar.setBackgroundColor("#ffffff", true);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" animated={true} />
      {/* Top Hero Section with Map Background & Service Worker */}
      <View className="relative flex-1 bg-blue-100/60 overflow-hidden rounded-b-[40px] items-center justify-end">
        {/* Soft decorative ambient circles */}
        <View className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-200/50" />
        <View className="absolute top-10 -left-20 w-60 h-60 rounded-full bg-indigo-200/40" />

        {/* Brand Header */}
        <View className="absolute top-12 items-center">
          <Text className="text-xl font-extrabold text-blue-900 tracking-wider">
            Wide Service
          </Text>
        </View>

        {/* Worker Hero Image matching mockup */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
          }}
          className="w-full h-[85%] rounded-b-[36px]"
          resizeMode="cover"
        />

        {/* Subtle gradient overlay at bottom of image */}
        <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />
      </View>

      {/* Bottom Content Area */}
      <View className="px-8 pt-8 pb-10 items-center">
        <Text className="text-2xl font-black text-slate-900 text-center tracking-tight mb-3">
          Browser Local Service
        </Text>

        <Text className="text-sm text-slate-500 text-center leading-relaxed px-4 mb-6">
          Enjoy a seamless and transparent booking experience where users can explore verified local experts.
        </Text>

        {/* Pagination Dots indicator */}
        <View className="flex-row items-center justify-center space-x-2 mb-8">
          <View className="w-2 h-2 rounded-full bg-slate-200" />
          <View className="w-6 h-2 rounded-full bg-primary" />
          <View className="w-2 h-2 rounded-full bg-slate-200" />
          <View className="w-2 h-2 rounded-full bg-slate-200" />
        </View>

        {/* Get Started Primary Button */}
        <TouchableOpacity
          onPress={onGetStarted}
          activeOpacity={0.85}
          className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-amber-500/30 items-center justify-center"
        >
          <Text className="text-white text-base font-bold tracking-wide">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
