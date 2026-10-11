import "./global.css";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "./src/components/SplashScreen";
import { LocationPickerScreen } from "./src/components/LocationPickerScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { CategoryDetailScreen } from "./src/components/CategoryDetailScreen";
import { SubcategoryDetailScreen } from "./src/components/SubcategoryDetailScreen";
import { ServiceDetailScreen } from "./src/components/ServiceDetailScreen";
import { Category, Subcategory, Service, UserLocation } from "./src/types";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  getUserLocation,
  getHasSeenSplash,
  setHasSeenSplash,
} from "./src/services/locationStorage";

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"splash" | "location" | "home">("splash");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Check saved location and whether the user has already seen splash screen
  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      try {
        const [savedLoc, hasSeenSplash] = await Promise.all([
          getUserLocation(),
          getHasSeenSplash(),
        ]);

        if (!isMounted) return;

        if (savedLoc) {
          setUserLocation(savedLoc);
        }

        // If user has already seen the splash screen in a previous session
        if (hasSeenSplash) {
          setCurrentScreen(savedLoc ? "home" : "location");
        } else {
          // First-time user: show splash screen
          setCurrentScreen("splash");
        }
      } catch (error) {
        console.warn("[App] Error initializing app storage state:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initApp();

    return () => {
      isMounted = false;
    };
  }, []);

  // When user taps Get Started on splash:
  const handleGetStarted = async () => {
    // 1. Mark splash screen as seen (stored as true in local storage)
    await setHasSeenSplash(true);

    // 2. If location is already set once, go straight to home! Otherwise ask location
    const loc = userLocation || (await getUserLocation());
    if (loc) {
      setUserLocation(loc);
      setCurrentScreen("home");
    } else {
      // Only first-time users without any saved location will be asked
      setCurrentScreen("location");
    }
  };

  // Prevent UI flicker while reading initial storage
  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 bg-white items-center justify-center">
          <StatusBar style="dark" />
          <ActivityIndicator size="small" color="#e0b328" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {currentScreen === "splash" ? (
        <SplashScreen onGetStarted={handleGetStarted} />
      ) : currentScreen === "location" ? (
        <LocationPickerScreen
          currentLocation={userLocation}
          onBack={userLocation ? () => setCurrentScreen("home") : undefined}
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
          userLocation={userLocation}
          onBack={() => setSelectedSubcategory(null)}
          onSelectService={(srv) => setSelectedService(srv)}
        />
      ) : selectedCategory ? (
        <CategoryDetailScreen
          category={selectedCategory}
          userLocation={userLocation}
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
        />
      )}
    </SafeAreaProvider>
  );
}


