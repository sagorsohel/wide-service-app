// Configure Reanimated logger and LogBox before any module evaluates shared values
if (typeof globalThis !== "undefined") {
  (globalThis as any).__reanimatedLoggerConfig = {
    level: 1,
    strict: false,
  };
}

import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { LogBox, View, ActivityIndicator, StatusBar as RNStatusBar, Platform, TouchableOpacity, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { LayoutGrid, Settings, Search } from "lucide-react-native";
import { FindScreen } from "./src/components/FindScreen";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render",
  "Reading from `value` during component render",
  "expo-notifications: Android Push notifications",
]);

import "./global.css";
import { isRunningInExpoGo } from "expo";
import { SplashScreen } from "./src/components/SplashScreen";
import { LocationPickerScreen } from "./src/components/LocationPickerScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { CategoryDetailScreen } from "./src/components/CategoryDetailScreen";
import { SubcategoryDetailScreen } from "./src/components/SubcategoryDetailScreen";
import { ServiceDetailScreen } from "./src/components/ServiceDetailScreen";
import { SettingsScreen } from "./src/components/SettingsScreen";
import { Category, Subcategory, Service, UserLocation } from "./src/types";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getUserLocation,
  getHasSeenSplash,
  setHasSeenSplash,
} from "./src/services/locationStorage";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

function AppContent() {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"splash" | "location" | "home">("splash");
  const [activeTab, setActiveTab] = useState<"home" | "find" | "setting">("home");
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

    // Register push notification token (only in builds supporting push)
    let cleanupListeners = () => {};
    if (!isRunningInExpoGo() || Platform.OS !== "android") {
      import("./src/services/notificationService")
        .then((mod) => {
          mod.registerForPushNotificationsAsync().catch(() => {});
          cleanupListeners = mod.setupNotificationListeners();
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      cleanupListeners();
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

  // Status bar styling (Clean Light Theme, no yellow leakage)
  const statusBarStyle: "light" | "dark" =
    currentScreen === "splash" ? "dark" : isDark ? "light" : "dark";

  const statusBarBg =
    currentScreen === "splash" ? "#ffffff" : isDark ? "#020617" : "#f8fafc";

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

  const handleGoHome = () => {
    setSelectedService(null);
    setSelectedSubcategory(null);
    setSelectedCategory(null);
    setActiveTab("home");
    if (currentScreen === "location") {
      setCurrentScreen("home");
    }
  };

  const handleGoFind = () => {
    setSelectedService(null);
    setSelectedSubcategory(null);
    setSelectedCategory(null);
    setActiveTab("find");
    if (currentScreen === "location") {
      setCurrentScreen("home");
    }
  };

  const handleGoSettings = () => {
    setSelectedService(null);
    setSelectedSubcategory(null);
    setSelectedCategory(null);
    setActiveTab("setting");
    if (currentScreen === "location") {
      setCurrentScreen("home");
    }
  };

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
      ) : activeTab === "setting" ? (
        <SettingsScreen
          userLocation={userLocation}
          onChangeLocation={() => setCurrentScreen("location")}
        />
      ) : activeTab === "find" && !selectedService && !selectedSubcategory && !selectedCategory ? (
        <FindScreen
          userLocation={userLocation}
          onChangeLocation={() => setCurrentScreen("location")}
          onSelectService={(srv) => {
            setSelectedService(srv);
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
          onSelectService={(srv) => {
            setActiveTab("home");
            setSelectedService(srv);
          }}
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
          onSelectService={(srv) => {
            setActiveTab("home");
            setSelectedService(srv);
          }}
        />
      ) : (
        <HomeScreen
          userLocation={userLocation}
          onChangeLocation={() => setCurrentScreen("location")}
          onSelectService={(srv) => {
            setActiveTab("home");
            setSelectedService(srv);
          }}
          onSelectCategory={(cat) => {
            setActiveTab("home");
            setSelectedCategory(cat);
            setSelectedSubcategory(null);
          }}
        />
      )}

      {/* Persistent Floating Pill Bottom Navigation Bar (Matching Screenshot) */}
      {currentScreen !== "splash" && (
        <View
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0 items-center z-50"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <View
            className="w-[88%] max-w-[340px] bg-white border border-slate-200/90 rounded-[32px] px-6 py-2 flex-row items-center justify-between"
            style={{
              elevation: 20,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 18,
            }}
          >
            {/* Home Tab */}
            <TouchableOpacity
              onPress={handleGoHome}
              activeOpacity={0.75}
              className="w-12 h-12 items-center justify-center"
            >
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  activeTab === "home" && !selectedCategory && !selectedService
                    ? "bg-[#e0b328] shadow-md shadow-amber-500/40"
                    : "bg-transparent"
                }`}
              >
                <LayoutGrid
                  size={20}
                  color={
                    activeTab === "home" && !selectedCategory && !selectedService
                      ? "#0f172a"
                      : "#94a3b8"
                  }
                  fill={
                    activeTab === "home" && !selectedCategory && !selectedService
                      ? "#0f172a"
                      : "#94a3b8"
                  }
                  strokeWidth={
                    activeTab === "home" && !selectedCategory && !selectedService ? 2.6 : 2
                  }
                />
              </View>
            </TouchableOpacity>

            {/* Find Tab (Center Elevated Button) */}
            <TouchableOpacity
              onPress={handleGoFind}
              activeOpacity={0.82}
              className="items-center justify-center -mt-6"
            >
              <View
                className={`w-14 h-14 rounded-full items-center justify-center border-4 border-white ${
                  activeTab === "find" && !selectedCategory && !selectedService
                    ? "bg-[#e0b328] shadow-xl shadow-amber-500/50"
                    : "bg-slate-100 border-white shadow-md"
                }`}
                style={{
                  elevation: 12,
                }}
              >
                <Search
                  size={22}
                  color={
                    activeTab === "find" && !selectedCategory && !selectedService
                      ? "#0f172a"
                      : "#64748b"
                  }
                  strokeWidth={
                    activeTab === "find" && !selectedCategory && !selectedService ? 2.8 : 2.2
                  }
                />
              </View>
            </TouchableOpacity>

            {/* Settings Tab */}
            <TouchableOpacity
              onPress={handleGoSettings}
              activeOpacity={0.75}
              className="w-12 h-12 items-center justify-center"
            >
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  activeTab === "setting"
                    ? "bg-[#e0b328] shadow-md shadow-amber-500/40"
                    : "bg-transparent"
                }`}
              >
                <Settings
                  size={20}
                  color={activeTab === "setting" ? "#0f172a" : "#94a3b8"}
                  strokeWidth={activeTab === "setting" ? 2.6 : 2}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
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


