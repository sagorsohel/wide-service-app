import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Service } from "../types";

interface ServiceDetailModalProps {
  service: Service | null;
  visible: boolean;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  visible,
  onClose,
}) => {
  if (!service) return null;

  const imageUri =
    service.logo ||
    (Array.isArray(service.images) && service.images[0]) ||
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Top Hero Image with Back Button & Options */}
          <View className="relative w-full h-80 bg-slate-100">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />

            {/* Back Button */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="absolute top-12 left-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md items-center justify-center shadow-md"
            >
              <Text className="text-slate-800 text-lg font-bold">‹</Text>
            </TouchableOpacity>

            {/* More Options Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute top-12 right-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md items-center justify-center shadow-md"
            >
              <Text className="text-slate-800 text-base font-bold">•••</Text>
            </TouchableOpacity>

            {/* Image Indicator Dots */}
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-1.5">
              <View className="w-4 h-1.5 rounded-full bg-primary" />
              <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <View className="w-1.5 h-1.5 rounded-full bg-white/80" />
            </View>

            {/* Inset Badge Image */}
            <View className="absolute bottom-4 right-6 w-14 h-14 rounded-2xl border-2 border-white overflow-hidden shadow-lg bg-white">
              <Image
                source={{
                  uri:
                    service.logo ||
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200",
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Details Body */}
          <View className="p-6">
            {/* Header: Name, Category, Rating */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-black text-slate-900 tracking-tight">
                  {service.name}
                </Text>
                <Text className="text-sm font-semibold text-slate-400 mt-1">
                  {service.businessName} • {service.experience || "10-year Experience"}
                </Text>
              </View>

              <View className="flex-row items-center bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Text className="text-primary text-xs font-bold mr-1">★</Text>
                <Text className="text-xs font-bold text-slate-800">
                  {service.rating || 4.9}
                </Text>
                <Text className="text-slate-400 text-xs ml-0.5">
                  ({service.reviewCount || 200})
                </Text>
              </View>
            </View>

            {/* Category / Subcategory Tags */}
            <View className="flex-row items-center space-x-2 mb-6">
              <View className="bg-slate-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-slate-600">
                  {service.categoryName || "General Service"}
                </Text>
              </View>
              {service.subcategoryName && (
                <View className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-blue-700">
                    {service.subcategoryName}
                  </Text>
                </View>
              )}
            </View>

            {/* About Me Section */}
            <View className="mb-6">
              <Text className="text-base font-bold text-slate-900 mb-2">About me</Text>
              <Text className="text-sm text-slate-500 leading-relaxed">
                {service.description ||
                  `I am a dedicated professional with over a decade of hands-on experience. I specialize in fast diagnostics, quality repairs, and full customer satisfaction.`}
              </Text>
            </View>

            {/* Contact Information */}
            <View className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Verified Contact Details
              </Text>
              <Text className="text-sm font-bold text-slate-800 mb-1">
                📞 Phone: {service.phone}
              </Text>
              {service.whatsapp && (
                <Text className="text-sm font-bold text-emerald-600 mb-1">
                  💬 WhatsApp: {service.whatsapp}
                </Text>
              )}
              <Text className="text-xs text-slate-500 mt-1">
                📍 Address: {service.address}
              </Text>
            </View>

            {/* Customer Review Card */}
            <View className="mb-10">
              <Text className="text-base font-bold text-slate-900 mb-3">Review</Text>
              <View className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <View className="flex-row items-center mb-2">
                  <Text className="text-primary text-sm font-bold tracking-widest mr-2">
                    ★★★★★
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 italic leading-relaxed mb-2">
                  "A true professional! Quickly diagnosed the problem and fixed it with ease. Highly recommended!"
                </Text>
                <Text className="text-xs font-bold text-slate-700">- Alex T. (Verified Client)</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Floating Bar */}
        <View className="px-6 py-4 border-t border-slate-100 bg-white flex-row items-center justify-between shadow-xl">
          <View>
            <Text className="text-xs text-slate-400 font-medium">Rate / Cost</Text>
            <Text className="text-lg font-black text-slate-900">
              {service.price || "$34.00 / Hr"}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            className="bg-primary px-8 py-3.5 rounded-2xl shadow-md shadow-amber-500/30 items-center justify-center"
          >
            <Text className="text-white font-bold text-sm">
              Hire Specialist
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
