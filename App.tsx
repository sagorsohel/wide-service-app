import "./global.css";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "./src/components/SplashScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { CategoryDetailScreen } from "./src/components/CategoryDetailScreen";
import { SubcategoryDetailScreen } from "./src/components/SubcategoryDetailScreen";
import { ServiceDetailScreen } from "./src/components/ServiceDetailScreen";
import { Category, Subcategory, Service } from "./src/types";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"splash" | "home">("splash");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <>
      <StatusBar style="dark" />

      {currentScreen === "splash" ? (
        <SplashScreen onGetStarted={() => setCurrentScreen("home")} />
      ) : selectedService ? (
        <ServiceDetailScreen
          service={selectedService}
          onBack={() => setSelectedService(null)}
        />
      ) : selectedSubcategory && selectedCategory ? (
        <SubcategoryDetailScreen
          category={selectedCategory}
          subcategory={selectedSubcategory}
          onBack={() => setSelectedSubcategory(null)}
          onSelectService={(srv) => setSelectedService(srv)}
        />
      ) : selectedCategory ? (
        <CategoryDetailScreen
          category={selectedCategory}
          onBack={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }}
          onSelectSubcategory={(subCat) => setSelectedSubcategory(subCat)}
          onSelectService={(srv) => setSelectedService(srv)}
        />
      ) : (
        <HomeScreen
          onSelectService={(srv) => setSelectedService(srv)}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubcategory(null);
          }}
          onBackToSplash={() => setCurrentScreen("splash")}
        />
      )}
    </>
  );
}
