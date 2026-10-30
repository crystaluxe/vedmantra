"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginView from "@/components/LoginView";
import { getLoginReturnPath } from "@/lib/login-return";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const otpRefs = useRef([]);
  const [returnToProfile, setReturnToProfile] = useState(false);

  useEffect(() => {
    setReturnToProfile(getLoginReturnPath(window.location.search) !== "/");
    const user = localStorage.getItem("astro-user");

    try {
      if (JSON.parse(user || "null")?.id) {
        window.location.replace(getLoginReturnPath(window.location.search));
      }
    } catch {
      localStorage.removeItem("astro-user");
    }

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error(error);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\s/g, "").replace(/-/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.length === 10) return `+91${cleaned}`;
    return cleaned;
  };

  const setupRecaptcha = async () => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
        callback: () => console.log("reCAPTCHA solved"),
        "expired-callback": () => {
          window.recaptchaVerifier = null;
          showMessage("Security check expired. Please try again.", "error");
        },
      }
    );

    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      showMessage("");

      const formattedPhone = formatPhoneNumber(phone);

      if (!formattedPhone || formattedPhone.length < 12) {
        showMessage("Please enter a valid 10 digit mobile number.", "error");
        return;
      }

      const appVerifier = await setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(result);
      showMessage(`OTP sent successfully to ${formattedPhone}`, "success");

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 300);
    } catch (error) {
      console.error("SEND_OTP_ERROR", error);

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.error(clearError);
        }
        window.recaptchaVerifier = null;
      }

      showMessage(error.message || "Unable to send OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const updatedOtp = [...otp];

    updatedOtp[index] = digit;
    setOtp(updatedOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      showMessage("");

      if (!confirmationResult) {
        showMessage("Please send OTP first.", "error");
        return;
      }

      const finalOtp = otp.join("");

      if (finalOtp.length !== 6) {
        showMessage("Please enter the complete 6 digit OTP.", "error");
        return;
      }

      const result = await confirmationResult.confirm(finalOtp);
      const firebaseUser = result.user;

      const dbRes = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber,
        }),
      });

      const dbData = await dbRes.json();

      if (!dbData.success) {
        showMessage(dbData.error || "Unable to create user.", "error");
        return;
      }

      localStorage.setItem("astro-user", JSON.stringify(dbData.user));
      showMessage("Login successful. Taking you back...", "success");
      // Optional push permission must not delay returning to the consultation.
      setTimeout(() => {
        window.location.replace(getLoginReturnPath(window.location.search));
      }, 900);
      try {
  const { requestFcmToken } = await import("@/lib/firebase-messaging");

  const token = await requestFcmToken();

  if (token && dbData.user?.id) {
    await fetch("/api/notifications/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: dbData.user.id,
        token,
      }),
    });
  }
} catch (notificationError) {
  console.error("SAVE_PUSH_TOKEN_ERROR", notificationError);
}

    } catch (error) {
      console.error("VERIFY_OTP_ERROR", error);
      showMessage(error.message || "Invalid OTP. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetPhone = () => {
    setConfirmationResult(null);
    setOtp(["", "", "", "", "", ""]);
    showMessage("");

    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (error) {
        console.error(error);
      }
      window.recaptchaVerifier = null;
    }
  };

  return (
    <LoginView {...{ phone, setPhone, otp, otpRefs, confirmationResult, loading, message, messageType, sendOtp, verifyOtp, resetPhone, handleOtpChange, handleOtpKeyDown, formatPhoneNumber, returnToProfile }} />
  );
}