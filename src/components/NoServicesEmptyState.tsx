import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SearchX, MapPinOff, RotateCcw } from "lucide-react-native";

interface NoServicesEmptyStateProps {
  selectedRadius?: number | null;
  onClearRadius?: () => void;
  onRefresh?: () => void;
  categoryName?: string;
  userArea?: string;
}

export const NoServicesEmptyState: React.FC<NoServicesEmptyStateProps> = ({
  selectedRadius,
  onClearRadius,
  onRefresh,
  categoryName,
  userArea,
}) => {
  return (
    <View className="py-12 px-6 items-center justify-center">
      {/* Decorative Layered Circular Emblem */}
      <View className="w-24 h-24 rounded-full bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 items-center justify-center mb-5 shadow-xs relative">
        <View className="w-16 h-16 rounded-full bg-amber-100/90 dark:bg-amber-900/60 items-center justify-center">
          {selectedRadius ? (
            <MapPinOff size={32} color="#b45309" />
          ) : (
            <SearchX size={32} color="#b45309" />
          )}
        </View>
        <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 dark:bg-[#e0b328] items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
          <Text className="text-xs">⚡</Text>
        </View>
      </View>

      {/* Primary Heading */}
      <Text className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-center mb-1.5">
        {selectedRadius
          ? `No Services Within ${selectedRadius} km`
          : "No Service Providers Found"}
      </Text>

      {/* Helpful Context Subtitle */}
      <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed max-w-[290px] mb-6">
        {selectedRadius
          ? `We couldn't find any ${categoryName ? `"${categoryName}" ` : ""}services within ${selectedRadius} km of ${userArea || "your location"}. Try expanding your search radius.`
          : `There are currently no active providers listed for ${categoryName ? `"${categoryName}"` : "this category"} in ${userArea || "your area"}.`}
      </Text>

      {/* Smart Quick Action Button */}
      {selectedRadius && onClearRadius ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClearRadius}
          className="bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 px-6 py-3 rounded-full flex-row items-center justify-center shadow-sm active:bg-slate-800 mb-3"
        >
          <RotateCcw size={15} color="#ffffff" className="mr-2" />
          <Text className="text-white text-xs font-bold ml-1.5">
            Show All Services (Clear Filter)
          </Text>
        </TouchableOpacity>
      ) : onRefresh ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRefresh}
          className="bg-amber-400 px-6 py-3 rounded-full flex-row items-center justify-center shadow-sm active:bg-amber-500 mb-3"
        >
          <RotateCcw size={15} color="#0f172a" className="mr-2" />
          <Text className="text-slate-950 text-xs font-extrabold ml-1.5">
            Refresh Services
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Helpful Hint Pill */}
      <View className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-4 py-2.5 rounded-2xl flex-row items-center mt-2 max-w-[320px] shadow-2xs">
        <Text className="text-sm mr-2">💡</Text>
        <Text className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-1 leading-snug">
          {selectedRadius
            ? "Tip: Switch to 'All Distance' or increase radius circle above to see services across the city."
            : "Tip: New verified service partners are being onboarded regularly."}
        </Text>
      </View>
    </View>
  );
};

export default NoServicesEmptyState;
