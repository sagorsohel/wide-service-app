import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import { smartFetch } from "../config/api";

const isExpoGoAndroid = isRunningInExpoGo() && Platform.OS === "android";

let Notifications: any = null;
let Device: any = null;

function getNotificationsModule() {
  if (isExpoGoAndroid) return null;
  if (!Notifications) {
    try {
      Notifications = require("expo-notifications");
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (e) {
      console.warn("[PushNotification] Error loading notifications module:", e);
    }
  }
  return Notifications;
}

function getDeviceModule() {
  if (isExpoGoAndroid) return null;
  if (!Device) {
    try {
      Device = require("expo-device");
    } catch (e) {
      console.warn("[PushNotification] Error loading device module:", e);
    }
  }
  return Device;
}

/**
 * Requests push notification permissions, retrieves the device/expo token,
 * and syncs it with the backend database.
 */
export async function registerForPushNotificationsAsync(userId?: number | null): Promise<string | null> {
  // Remote Push notifications were removed from Expo Go on Android in SDK 53+
  if (isExpoGoAndroid) {
    console.log(
      "[PushNotification] Info: Push notifications are disabled in Expo Go on Android (SDK 53+). They work in standalone/development APKs."
    );
    return null;
  }

  const notif = getNotificationsModule();
  const dev = getDeviceModule();
  if (!notif || !dev) return null;

  let token: string | null = null;

  try {
    if (Platform.OS === "android") {
      await notif.setNotificationChannelAsync("default", {
        name: "Wide Service Notifications",
        importance: notif.AndroidImportance?.MAX ?? 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563EB",
      });
    }

    if (!dev.isDevice) {
      console.log("[PushNotification] Push notifications require a physical device.");
      return null;
    }

    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    // 1. Attempt to get Expo Push Token
    try {
      const expoTokenObj = await notif.getExpoPushTokenAsync();
      token = expoTokenObj?.data || null;
    } catch (expoErr: any) {
      // 2. Fallback: Attempt native device token (in development builds)
      try {
        const deviceTokenObj = await notif.getDevicePushTokenAsync();
        token = deviceTokenObj?.data || null;
      } catch (devErr: any) {}
    }

    if (token) {
      console.log("[PushNotification] Device Token registered:", token);

      // Send token to backend to store in MySQL device_tokens table
      try {
        const res = await smartFetch("/notifications/register-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            platform: Platform.OS,
            userId: userId || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("[PushNotification] Token synced with backend:", data.message);
        }
      } catch (syncErr) {
        console.warn("[PushNotification] Failed to sync token with backend:", syncErr);
      }
    }

    return token;
  } catch (error: any) {
    console.warn("[PushNotification] Registration error safely handled:", error?.message);
    return null;
  }
}

/**
 * Setup listeners for receiving notifications and user tapping on them
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: any) => void,
  onNotificationResponse?: (response: any) => void
) {
  if (isExpoGoAndroid) {
    return () => {};
  }

  const notif = getNotificationsModule();
  if (!notif) return () => {};

  try {
    const receivedSubscription = notif.addNotificationReceivedListener((notification: any) => {
      console.log("[PushNotification] Notification received:", notification?.request?.content?.title);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    const responseSubscription = notif.addNotificationResponseReceivedListener((response: any) => {
      console.log("[PushNotification] User tapped notification:", response?.notification?.request?.content?.title);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });

    return () => {
      receivedSubscription?.remove();
      responseSubscription?.remove();
    };
  } catch (err) {
    return () => {};
  }
}
