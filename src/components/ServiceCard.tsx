import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { PhoneCall, MapPin, Phone } from "lucide-react-native";
import { Service } from "../types";

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress }) => {
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

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs mb-3 flex-row items-center active:bg-slate-50/80 active:border-primary/50"
    >
      {/* Left: Image / Logo */}
      <View className="w-[50px] h-[50px] rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-100/90 items-center justify-center mr-3 shrink-0">
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Middle: Service Info (Name, Business Name, Location, Phone) */}
      <View className="flex-1 justify-center pr-2">
        {/* Service Name */}
        <Text
          className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug mb-0.5"
          numberOfLines={1}
        >
          {service.name}
        </Text>

        {/* Business Name with Verified Indicator */}
        <View className="flex-row items-center mb-1">
          <Text
            className="text-xs font-bold text-amber-900/90 flex-1"
            numberOfLines={1}
          >
            {service.businessName}
          </Text>
         
        </View>

        {/* Location / Address */}
        <View className="flex-row items-center mb-1">
          <MapPin size={11} color="#64748b" className="shrink-0" />
          <Text
            className="text-[11px] font-medium text-slate-500 ml-1 flex-1"
            numberOfLines={1}
          >
            {service.address}
          </Text>
        </View>

        {/* Phone Number */}
        <View className="flex-row items-center">
          <Phone size={10} color="#059669" className="shrink-0" />
          <Text className="text-[11px] font-bold text-emerald-700 ml-1 font-mono">
            {service.phone}
          </Text>
        </View>
      </View>

      {/* Right: Direct Call Button */}
      <TouchableOpacity
        onPress={handleCall}
        activeOpacity={0.75}
        className="w-11 h-11 rounded-full bg-emerald-500 items-center justify-center shadow-md shadow-emerald-500/25 active:bg-emerald-600 shrink-0"
      >
        <PhoneCall size={18} color="#ffffff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
