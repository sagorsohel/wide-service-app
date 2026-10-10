import "./global.css";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "./src/components/SplashScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { CategoryDetailScreen } from "./src/components/CategoryDetailScreen";
import { ServiceDetailModal } from "./src/components/ServiceDetailModal";
import { Category, Service } from "./src/types";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"splash" | "home">("splash");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const handleOpenDetail = (service: Service) => {
    setSelectedService(service);
    setDetailModalVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedService(null);
  };

  return (
    <>
      <StatusBar style="dark" />

      {currentScreen === "splash" ? (
        <SplashScreen onGetStarted={() => setCurrentScreen("home")} />
      ) : selectedCategory ? (
        <CategoryDetailScreen
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          onSelectService={handleOpenDetail}
        />
      ) : (
        <HomeScreen
          onSelectService={handleOpenDetail}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onBackToSplash={() => setCurrentScreen("splash")}
        />
      )}

      {/* Service Detail Modal (Screen 3 from mockup) */}
      <ServiceDetailModal
        service={selectedService}
        visible={detailModalVisible}
        onClose={handleCloseDetail}
      />
    </>
  );
}
