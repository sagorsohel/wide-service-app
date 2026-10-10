import "./global.css";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "./src/components/SplashScreen";
import { LocationPickerScreen } from "./src/components/LocationPickerScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { CategoryDetailScreen } from "./src/components/CategoryDetailScreen";
import { SubcategoryDetailScreen } from "./src/components/SubcategoryDetailScreen";
import { ServiceDetailScreen } from "./src/components/ServiceDetailScreen";
import { Category, Subcategory, Service, UserLocation } from "./src/types";
import { getUserLocation } from "./src/services/locationStorage";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"splash" | "location" | "home">("splash");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Load saved location on startup
  useEffect(() => {
    getUserLocation().then((savedLoc) => {
      if (savedLoc) {
        setUserLocation(savedLoc);
      }
    });
  }, []);

  return (
    <>
      <StatusBar style="dark" />

      {currentScreen === "splash" ? (
        <SplashScreen onGetStarted={() => setCurrentScreen("location")} />
      ) : currentScreen === "location" ? (
        <LocationPickerScreen
          currentLocation={userLocation}
          onBack={userLocation ? () => setCurrentScreen("home") : () => setCurrentScreen("splash")}
          onLocationSelected={(loc) => {
            setUserLocation(loc);
            setCurrentScreen("home");
          }}
        />
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
          userLocation={userLocation}
          onChangeLocation={() => setCurrentScreen("location")}
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

