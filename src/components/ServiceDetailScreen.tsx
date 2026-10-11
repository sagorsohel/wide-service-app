import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  StatusBar as RNStatusBar,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Phone,
  PhoneCall,
  MessageSquare,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Share2,
} from "lucide-react-native";
import { Service } from "../types";

interface ServiceDetailScreenProps {
  service: Service;
  onBack: () => void;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service,
  onBack,
}) => {
  const imageUri =
    service.logo ||
    (Array.isArray(service.images) && service.images[0]) ||
    "https://img.icons8.com/fluency/96/maintenance.png";

  const handleCall = () => {
    if (service.phone) {
      const cleanNumber = service.phone.replace(/[^0-9+]/g, "");
      Linking.openURL(`tel:${cleanNumber}`).catch((err) => {
        console.warn("Could not launch phone dialer:", err);
      });
    }
  };

  const handleWhatsApp = () => {
    if (service.whatsapp) {
      const cleanWa = service.whatsapp.replace(/[^0-9]/g, "");
      const msg = encodeURIComponent(
        `হ্যালো, আমি Wide Service অ্যাপ থেকে "${service.name}" সম্পর্কে জানতে চাই।`
      );
      Linking.openURL(`https://wa.me/${cleanWa}?text=${msg}`).catch((err) => {
        console.warn("Could not open WhatsApp:", err);
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${service.name} - ${service.businessName}\nঠিকানা: ${service.address}\nযোগাযোগ: ${service.phone}\nWide Service অ্যাপে দেখুন!`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle("dark-content", true);
      RNStatusBar.setBackgroundColor("#e0b328", true);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#e0b328]" style={{ backgroundColor: "#e0b328" }}>
      <StatusBar style="dark" animated={true} />
      {/* Top Header matching #e0b328 Brand Bar */}
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
              Service Details
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            className="w-10 h-10 items-center justify-center -mr-2 active:opacity-60"
          >
            <Share2 size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Curvy Content Sheet */}
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-t-[30px] overflow-hidden">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* Hero Image / Logo Showcase Card */}
          <View className="px-6 pt-6 mb-5">
            <View className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs items-center justify-center relative overflow-hidden">
              {/* Rating Pill */}
              <View className="absolute top-4 right-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-full flex-row items-center">
                <Star size={11} color="#d97706" fill="#d97706" className="mr-1" />
                <Text className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                  {service.rating || "4.9"}
                </Text>
              </View>

              {/* Center Logo Showcase */}
              <View className="w-28 h-28 rounded-3xl bg-amber-50/60 dark:bg-slate-800 border border-amber-100 dark:border-slate-700 items-center justify-center p-3.5 my-3 shadow-2xs">
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              {/* Title & Business Name */}
              <Text className="text-xl font-black text-slate-900 dark:text-slate-100 text-center tracking-tight leading-snug">
                {service.name}
              </Text>
              <Text className="text-xs font-bold text-amber-800 dark:text-amber-400 text-center mt-1">
                {service.businessName}
              </Text>
            </View>
          </View>

          {/* Quick Action Buttons (Call Now & WhatsApp) */}
          <View className="px-6 flex-row items-center justify-between space-x-3 mb-6">
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.85}
              className="flex-1 bg-emerald-500 py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-sm shadow-emerald-500/20 active:bg-emerald-600 mr-2"
            >
              <PhoneCall size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white font-black text-sm ml-1.5">
                Call Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.85}
              className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 py-3.5 px-4 rounded-2xl flex-row items-center justify-center active:bg-emerald-100 dark:active:bg-emerald-900/40 ml-2"
            >
              <MessageSquare size={18} color="#059669" className="mr-2" />
              <Text className="text-emerald-800 dark:text-emerald-300 font-black text-sm ml-1.5">
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>

          {/* Key Highlights Card */}
          <View className="px-6 mb-6">
            <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Text className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Service Highlights
              </Text>

              {/* Location Row */}
              <View className="flex-row items-start mb-3">
                <View className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 shrink-0">
                  <MapPin size={16} color="#64748b" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Location
                    </Text>
                    {service.distanceKm !== undefined && service.distanceKm !== null && (
                      <View className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          {service.distanceKm < 1
                            ? `⚡ ${Math.round(service.distanceKm * 1000)}m away`
                            : `📍 ${service.distanceKm.toFixed(1)} km away`}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                    {service.address}
                  </Text>
                </View>
              </View>

              {/* Working Hours Row */}
              <View className="flex-row items-start mb-3">
                <View className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 shrink-0">
                  <Clock size={16} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Service Schedule
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Everyday: 9:00 AM - 9:00 PM (Emergency 24/7 Support)
                  </Text>
                </View>
              </View>

              {/* Phone Row */}
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 shrink-0">
                  <Phone size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Direct Contact Hotline
                  </Text>
                  <Text className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono mt-0.5">
                    {service.phone}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View className="px-6 mb-6">
            <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Text className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">
                About Service
              </Text>
              <Text className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {service.description ||
                  `রাজশাহী শহরের যেকোনো এলাকায় অভিজ্ঞ ও প্রশিক্ষিত কারিগর দ্বারা দ্রুত এবং নির্ভরযোগ্য সার্ভিস। আধুনিক সরঞ্জাম দিয়ে দ্রুত সমাধান ও কাজের পর ৭ দিনের ফ্রি সার্ভিস ওয়ারেন্টি।`}
              </Text>
            </View>
          </View>

          {/* Customer Reviews Section */}
          <View className="px-6 mb-6">
            <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Customer Reviews
                </Text>
                <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  ★ 4.9 (48+ Reviews)
                </Text>
              </View>

              <View className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-2.5">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Md. Tariqul Islam
                  </Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    2 days ago
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "খুবই ভালো সার্ভিস। সময়মতো এসে নিঁখুতভাবে কাজটি করে দিয়েছেন। কাজের মান চমৎকার!"
                </Text>
              </View>

              <View className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Sadia Rahman
                  </Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    1 week ago
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "Friendly behavior and reasonable charges. Highly recommended for Rajshahi city!"
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Floating Booking / Call Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex-row items-center justify-between shadow-2xl">
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.85}
            className="bg-primary w-full flex justify-center px-7 py-3.5 rounded-2xl shadow-md shadow-amber-500/25 flex-row items-center active:bg-amber-500"
          >
            <PhoneCall size={16} color="#0f172a" className="mr-2" />
            <Text className="text-slate-950 font-black text-sm ml-1.5">
              Call & Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
