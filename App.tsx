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
import { Home, Settings } from "lucide-react-native";

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
  const [activeTab, setActiveTab] = useState<"home" | "setting">("home");
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

  const handleGoHome = () => {
    setSelectedService(null);
    setSelectedSubcategory(null);
    setSelectedCategory(null);
    setActiveTab("home");
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

      {/* Persistent Full-Width Bottom Navigation Bar on ALL Screens */}
      {currentScreen !== "splash" && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800"
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            elevation: 20,
            shadowColor: "#0f172a",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
          }}
        >
          <View className="flex-row items-center justify-between px-5 pt-2.5">
            {/* Home Tab */}
            <TouchableOpacity
              onPress={handleGoHome}
              activeOpacity={0.7}
              className={`flex-1 flex-row items-center justify-center py-2.5 px-4 mx-1.5 rounded-2xl ${
                activeTab === "home" && !selectedCategory && !selectedService
                  ? "bg-[#e0b328]/15 border border-[#e0b328]/60 shadow-2xs"
                  : "bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/80"
              }`}
            >
              <View
                className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${
                  activeTab === "home" && !selectedCategory && !selectedService
                    ? "bg-[#e0b328] shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700"
                }`}
              >
                <Home
                  size={17}
                  color={
                    activeTab === "home" && !selectedCategory && !selectedService
                      ? "#0f172a"
                      : isDark
                      ? "#94a3b8"
                      : "#64748b"
                  }
                  strokeWidth={
                    activeTab === "home" && !selectedCategory && !selectedService ? 2.6 : 2
                  }
                />
              </View>
              <View>
                <Text
                  className={`text-xs tracking-tight ${
                    activeTab === "home" && !selectedCategory && !selectedService
                      ? "font-black text-slate-900 dark:text-slate-100"
                      : "font-bold text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Home
                </Text>
                {activeTab === "home" && !selectedCategory && !selectedService && (
                  <View className="w-3.5 h-0.5 rounded-full bg-[#e0b328] mt-0.5" />
                )}
              </View>
            </TouchableOpacity>

            {/* Settings Tab */}
            <TouchableOpacity
              onPress={handleGoSettings}
              activeOpacity={0.7}
              className={`flex-1 flex-row items-center justify-center py-2.5 px-4 mx-1.5 rounded-2xl ${
                activeTab === "setting"
                  ? "bg-[#e0b328]/15 border border-[#e0b328]/60 shadow-2xs"
                  : "bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/80"
              }`}
            >
              <View
                className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${
                  activeTab === "setting"
                    ? "bg-[#e0b328] shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700"
                }`}
              >
                <Settings
                  size={17}
                  color={
                    activeTab === "setting"
                      ? "#0f172a"
                      : isDark
                      ? "#94a3b8"
                      : "#64748b"
                  }
                  strokeWidth={activeTab === "setting" ? 2.6 : 2}
                />
              </View>
              <View>
                <Text
                  className={`text-xs tracking-tight ${
                    activeTab === "setting"
                      ? "font-black text-slate-900 dark:text-slate-100"
                      : "font-bold text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Settings
                </Text>
                {activeTab === "setting" && (
                  <View className="w-3.5 h-0.5 rounded-full bg-[#e0b328] mt-0.5" />
                )}
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


