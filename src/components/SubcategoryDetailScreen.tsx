import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { Category, Subcategory, Service } from "../types";
import { fetchServices } from "../config/api";
import { ServiceCard } from "./ServiceCard";

interface SubcategoryDetailScreenProps {
  category?: Category | null;
  subcategory: Subcategory;
  onBack: () => void;
  onSelectService: (service: Service) => void;
}

export const SubcategoryDetailScreen: React.FC<SubcategoryDetailScreenProps> = ({
  category,
  subcategory,
  onBack,
  onSelectService,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const catId = category?.id || subcategory.categoryId;
      const data = await fetchServices(catId, subcategory.id);
      setServices(data);
    } catch (err) {
      console.warn("Failed to load subcategory services:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [category?.id, subcategory.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const subCatImage = subcategory.image;

  return (
    <SafeAreaView className="flex-1 bg-[#e0b328]">
      {/* Top Header with #e0b328 Color & Sleek Back Icon */}
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
              {subcategory.name}
            </Text>
          </View>

          {/* Symmetrical Spacer */}
          <View className="w-10 h-10" />
        </View>
      </View>

      {/* Curvy Content Container matching reference screenshot */}
      <View className="flex-1 bg-slate-50 rounded-t-[36px] overflow-hidden">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e0b328"
            />
          }
        >
          {/* Subcategory Hero Info Banner */}
         

          {/* Section Header */}
          

          {/* Loading Indicator */}
          {loading && (
            <View className="py-14 items-center justify-center">
              <ActivityIndicator size="small" color="#e0b328" />
              <Text className="text-xs text-slate-400 mt-2 font-medium">
                Loading services...
              </Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && services.length === 0 ? (
            <View className="py-16 px-6 items-center justify-center">
              <Text className="text-3xl mb-2">🔍</Text>
              <Text className="text-sm font-bold text-slate-700">
                No services found
              </Text>
              <Text className="text-xs text-slate-400 mt-1 text-center">
                There are currently no services listed under this subcategory.
              </Text>
            </View>
          ) : (
            /* Services List rendered via ServiceCard */
            <View className="px-6 mb-10">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => onSelectService(service)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
