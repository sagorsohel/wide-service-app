// Configure Reanimated logger and LogBox before any module evaluates shared values
if (typeof globalThis !== "undefined") {
  (globalThis as any).__reanimatedLoggerConfig = {
    level: 1,
    strict: false,
  };
}

import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { LogBox, View, ActivityIndicator, StatusBar as RNStatusBar, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render",
  "Reading from `value` during component render",
]);

import "./global.css";
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
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

function AppContent() {
  const { isDark, colors } = useTheme();
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

  // Determine whether current screen has a golden #e0b328 header
  const isYellowHeaderScreen =
    currentScreen === "location" ||
    !!selectedService ||
    (!!selectedSubcategory && !!selectedCategory) ||
    !!selectedCategory;

  // On #e0b328 (yellow), status bar icons must always be dark.
  // In HomeScreen / SettingsScreen, dark mode has light icons with dark background (#020617).
  const statusBarStyle: "light" | "dark" = isYellowHeaderScreen
    ? "dark"
    : currentScreen === "splash"
    ? "dark"
    : isDark
    ? "light"
    : "dark";

  const statusBarBg = isYellowHeaderScreen
    ? "#e0b328"
    : currentScreen === "splash"
    ? "#ffffff"
    : isDark
    ? "#020617"
    : "#f8fafc";

  // Synchronize native Android StatusBar
  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBarStyle(statusBarStyle === "light" ? "light-content" : "dark-content", true);
      RNStatusBar.setBackgroundColor(statusBarBg, true);
    }
  }, [statusBarStyle, statusBarBg]);

  // Prevent UI flicker while reading initial storage
  if (isInitializing) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: statusBarBg }}
      >
        <StatusBar style={statusBarStyle} animated={true} />
        <ActivityIndicator size="small" color="#e0b328" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: statusBarBg }}>
      <StatusBar style={statusBarStyle} animated={true} />

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
          userLocation={userLocation}
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
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


