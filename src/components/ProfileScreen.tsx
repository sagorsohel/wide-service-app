import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Search,
  Info,
  ShieldCheck,
  ChevronRight,
  Headphones,
  Globe,
  Sparkles,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { UserLocation } from "../types";

interface ProfileScreenProps {
  userLocation?: UserLocation | null;
  onChangeLocation: () => void;
  onGoFind: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userLocation,
  onChangeLocation,
  onGoFind,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { currentUser, login, register, logout } = useAuth();

  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async () => {
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg("Please enter your phone/email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await login(identifier.trim(), password.trim());
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || "Invalid phone number/email or password.");
    } else {
      setSuccessMsg("Successfully logged in!");
      setPassword("");
    }
  };

  const handleSignupSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please enter your mobile phone number.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await register(
      name.trim(),
      phone.trim(),
      password.trim(),
      email.trim() || undefined,
    );
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || "Failed to create account.");
    } else {
      setSuccessMsg("Account created successfully!");
      setPassword("");
    }
  };

  const handleGoogleSignInClick = () => {
    Alert.alert(
      "Google Sign-In",
      "Google Sign-In is configured with Firebase backend. To enable direct Google Sign-in on this build, connect your Firebase Web/Android Client ID.",
      [{ text: "OK" }],
    );
  };

  const handleCallHotline = async () => {
    const telUrl = "tel:+8801700000000";
    try {
      await Linking.openURL(telUrl);
    } catch {
      Alert.alert("Hotline", "+880 1700-000000 (Available 24/7)");
    }
  };

  const handleOpenWebsite = async () => {
    try {
      await Linking.openURL("https://widetechbd.com");
    } catch {}
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#f8fafc] dark:bg-slate-950"
      edges={["top", "left", "right"]}
    >
      {/* Sticky Header */}
      <View className="px-6 pt-4 pb-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-[#e0b328]" />
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {currentUser ? "My Profile" : "Account & Login"}
            </Text>
          </View>
          <Text className="text-xs text-slate-400 font-medium mt-0.5">
            {currentUser
              ? "Manage credentials & emergency bookings"
              : "Sign in with phone or email to manage profile"}
          </Text>
        </View>

        {currentUser && (
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 items-center justify-center border border-rose-200/80 dark:border-rose-800"
          >
            <LogOut size={16} color="#e11d48" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 12) + 90,
        }}
      >
        {currentUser ? (
          /* =========================================================================
             A. LOGGED IN PROFILE VIEW
             ========================================================================= */
          <View className="space-y-4">
            {/* 1. Profile Hero Card */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm mb-4">
              <View className="flex-row items-center gap-4">
                {/* Avatar */}
                <View className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#e0b328] items-center justify-center border-2 border-white dark:border-slate-800 shadow-md shadow-amber-500/20">
                  {currentUser.photoURL ? (
                    <Image
                      source={{ uri: currentUser.photoURL }}
                      className="w-full h-full rounded-2xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-2xl font-black text-slate-950">
                      {(currentUser.displayName || currentUser.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  )}
                </View>

                {/* User Info */}
                <View className="flex-1 pr-1">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <Text
                      className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight"
                      numberOfLines={1}
                    >
                      {currentUser.displayName ||
                        currentUser.name ||
                        "Wide Service Customer"}
                    </Text>
                    <ShieldCheck size={16} color="#059669" />
                  </View>

                  <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono mb-1">
                    📞 {currentUser.phone || "No phone linked"}
                  </Text>

                  {currentUser.email && (
                    <Text
                      className="text-[11px] text-slate-400 dark:text-slate-500 font-medium"
                      numberOfLines={1}
                    >
                      ✉️ {currentUser.email}
                    </Text>
                  )}

                  <View className="flex-row items-center gap-1.5 mt-2">
                    <View className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      <Text className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase">
                        {currentUser.role || "Customer"}
                      </Text>
                    </View>
                    <View className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                      <Text className="text-[10px] font-black text-amber-800 dark:text-amber-300">
                        ⚡ Verified
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Default Active Location */}
            <View className="mb-4">
              <Text className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                Active Location Area
              </Text>
              <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-300 dark:border-amber-700 items-center justify-center">
                    <MapPin size={20} color="#b45309" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-xs font-black text-slate-900 dark:text-slate-100"
                      numberOfLines={1}
                    >
                      {userLocation
                        ? `${userLocation.area}, ${userLocation.city}`
                        : "Dhaka, Bangladesh"}
                    </Text>
                    <Text className="text-[11px] text-slate-400 font-medium">
                      Active GPS radar coordinate
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onChangeLocation}
                  activeOpacity={0.75}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Account Menu */}
            <View className="mb-4">
              <Text className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
                Account & Shortcuts
              </Text>
              <View className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                {/* Find Services */}
                <TouchableOpacity
                  onPress={onGoFind}
                  activeOpacity={0.7}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 items-center justify-center">
                      <Search size={16} color="#b45309" />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Find Local Technicians
                      </Text>
                      <Text className="text-[10px] text-slate-400">
                        Search nearby emergency repairs
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>

                {/* Hotline */}
                <TouchableOpacity
                  onPress={handleCallHotline}
                  activeOpacity={0.7}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 items-center justify-center">
                      <Phone size={16} color="#059669" />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        24/7 Support Hotline
                      </Text>
                      <Text className="text-[10px] text-slate-400">
                        +880 1700-000000 (Tap to call)
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>

                {/* Official Website */}
                <TouchableOpacity
                  onPress={handleOpenWebsite}
                  activeOpacity={0.7}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 items-center justify-center">
                      <Globe size={16} color="#2563eb" />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Official Website
                      </Text>
                      <Text className="text-[10px] text-slate-400">
                        https://widetechbd.com
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={logout}
              activeOpacity={0.8}
              className="w-full py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex-row items-center justify-center gap-2 active:bg-rose-100"
            >
              <LogOut size={16} color="#e11d48" />
              <Text className="text-xs font-black text-rose-600 dark:text-rose-400">
                Log Out from Account
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* =========================================================================
             B. AUTHENTICATION (LOGIN / SIGNUP) VIEW
             ========================================================================= */
          <View>
            {/* Segmented Auth Mode Switch */}
            <View className="flex-row bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl mb-5">
              <TouchableOpacity
                onPress={() => {
                  setAuthMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                activeOpacity={0.8}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  authMode === "login"
                    ? "bg-white dark:bg-slate-900 shadow-sm"
                    : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-black ${
                    authMode === "login"
                      ? "text-slate-950 dark:text-white"
                      : "text-slate-500"
                  }`}
                >
                  Sign In (লগইন)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setAuthMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                activeOpacity={0.8}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  authMode === "signup"
                    ? "bg-white dark:bg-slate-900 shadow-sm"
                    : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-black ${
                    authMode === "signup"
                      ? "text-slate-950 dark:text-white"
                      : "text-slate-500"
                  }`}
                >
                  Create Account (সাইন আপ)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Auth Form Card */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <View className="mb-4">
                <Text className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {authMode === "login"
                    ? "Welcome Back"
                    : "Create Free Account"}
                </Text>
                <Text className="text-xs text-slate-500 font-medium mt-0.5">
                  {authMode === "login"
                    ? "Sign in with your phone or email to manage your profile"
                    : "Join Wide Service to book local verified technicians"}
                </Text>
              </View>

              {/* Error Alert */}
              {errorMsg && (
                <View className="mb-3.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex-row items-center gap-2">
                  <AlertCircle size={16} color="#e11d48" />
                  <Text className="flex-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* Success Alert */}
              {successMsg && (
                <View className="mb-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex-row items-center gap-2">
                  <CheckCircle2 size={16} color="#059669" />
                  <Text className="flex-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {successMsg}
                  </Text>
                </View>
              )}

              {/* Google Sign In Button */}
              <TouchableOpacity
                onPress={handleGoogleSignInClick}
                activeOpacity={0.85}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-row items-center justify-center gap-2.5 shadow-2xs mb-4"
              >
                <View className="w-5 h-5 items-center justify-center">
                  <Text className="text-base font-black">G</Text>
                </View>
                <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {authMode === "login"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-2 mb-4">
                <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
                <Text className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  or with password
                </Text>
                <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
              </View>

              {/* SIGNUP FORM */}
              {authMode === "signup" && (
                <View className="space-y-3 mb-3">
                  {/* Full Name */}
                  <View className="mb-3">
                    <Text className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Full Name
                    </Text>
                    <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                      <User size={16} color="#94a3b8" />
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Mohammad Rahim"
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-xs text-slate-900 dark:text-slate-100 font-semibold px-2 py-0"
                      />
                    </View>
                  </View>

                  {/* Phone Number */}
                  <View className="mb-3">
                    <Text className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Phone Number
                    </Text>
                    <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                      <Phone size={16} color="#94a3b8" />
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="01XXXXXXXXX"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        className="flex-1 text-xs text-slate-900 dark:text-slate-100 font-semibold px-2 py-0"
                      />
                    </View>
                  </View>

                  {/* Email (Optional) */}
                  <View className="mb-3">
                    <Text className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Email Address (Optional)
                    </Text>
                    <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                      <Mail size={16} color="#94a3b8" />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="rahim@gmail.com"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 text-xs text-slate-900 dark:text-slate-100 font-semibold px-2 py-0"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* LOGIN IDENTIFIER */}
              {authMode === "login" && (
                <View className="mb-3">
                  <Text className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number or Email
                  </Text>
                  <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                    <User size={16} color="#94a3b8" />
                    <TextInput
                      value={identifier}
                      onChangeText={setIdentifier}
                      placeholder="01XXXXXXXXX or user@mail.com"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      className="flex-1 text-xs text-slate-900 dark:text-slate-100 font-semibold px-2 py-0"
                    />
                  </View>
                </View>
              )}

              {/* PASSWORD INPUT */}
              <View className="mb-4">
                <Text className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Password
                </Text>
                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                  <Lock size={16} color="#94a3b8" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    className="flex-1 text-xs text-slate-900 dark:text-slate-100 font-semibold px-2 py-0"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#94a3b8" />
                    ) : (
                      <Eye size={16} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={
                  authMode === "login" ? handleLoginSubmit : handleSignupSubmit
                }
                disabled={loading}
                activeOpacity={0.85}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#e0b328] bg-[#e0b328] items-center justify-center shadow-md shadow-amber-500/25 active:scale-98"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#0f172a" />
                ) : (
                  <View className="flex-row items-center gap-1.5">
                    <LogIn size={15} color="#0f172a" />
                    <Text className="text-slate-950 font-black text-xs tracking-tight">
                      {authMode === "login" ? "Sign In Now" : "Create Account"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
