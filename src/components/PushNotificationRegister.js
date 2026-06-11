"use client";

import { useEffect } from "react";

export default function PushNotificationRegister() {
  useEffect(() => {
    const registerPush = async () => {
      try {
        const userData = localStorage.getItem("astro-user");

        if (!userData) return;

        const user = JSON.parse(userData);

        if (!user?.id) return;

        const { requestFcmToken } = await import("@/lib/firebase-messaging");

        const token = await requestFcmToken();

        console.log("FCM TOKEN:", token);

        if (!token) return;

        await fetch("/api/notifications/save-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            token,
          }),
        });

        console.log("PUSH TOKEN SAVED");
      } catch (err) {
        console.error("PUSH ERROR", err);
      }
    };

    registerPush();
  }, []);

  return null;
}