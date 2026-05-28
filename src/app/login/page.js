"use client";

import { useEffect, useState } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
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

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\s/g, "").replace(/-/g, "");

    if (cleaned.startsWith("+")) {
      return cleaned;
    }

    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    return cleaned;
  };

  const setupRecaptcha = async () => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          window.recaptchaVerifier = null;
          setMessage("reCAPTCHA expired. Please try again.");
        },
      }
    );

    await window.recaptchaVerifier.render();

    return window.recaptchaVerifier;
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const formattedPhone = formatPhoneNumber(phone);

      if (!formattedPhone || formattedPhone.length < 12) {
        alert("Please enter a valid mobile number with country code.");
        return;
      }

      const appVerifier = await setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(result);
      setMessage(`OTP sent to ${formattedPhone}`);
      alert("OTP sent successfully");
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

      alert(error.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!confirmationResult) {
        alert("Please send OTP first");
        return;
      }

      if (!otp || otp.length < 6) {
        alert("Please enter valid OTP");
        return;
      }

      const result = await confirmationResult.confirm(otp);

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
        alert(dbData.error || "Unable to create user");
        return;
      }

      localStorage.setItem("astro-user", JSON.stringify(dbData.user));

      alert("Login successful");

      window.location.href = "/";
    } catch (error) {
      console.error("VERIFY_OTP_ERROR", error);

      alert(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7efe4] flex items-center justify-center px-5">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-7">
        <h1 className="text-3xl font-extrabold text-[#24110A]">
          Welcome Back ✨
        </h1>

        <p className="text-[#7a5a3a] mt-2">
          Login to continue your spiritual journey.
        </p>

        <div className="mt-8">
          <label className="text-sm font-semibold text-[#24110A]">
            Mobile Number
          </label>

          <input
            type="tel"
            placeholder="9999999999 or +919999999999"
            value={phone}
            disabled={!!confirmationResult}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-2 h-14 rounded-2xl border border-[#ead8c2] px-5 outline-none disabled:opacity-60"
          />
        </div>

        {!confirmationResult && (
          <div className="mt-5">
            <div id="recaptcha-container" />
          </div>
        )}

        {confirmationResult && (
          <div className="mt-5">
            <label className="text-sm font-semibold text-[#24110A]">
              Enter OTP
            </label>

            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mt-2 h-14 rounded-2xl border border-[#ead8c2] px-5 outline-none"
            />
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
            {message}
          </p>
        )}

        <button
          onClick={confirmationResult ? verifyOtp : sendOtp}
          disabled={loading}
          className="w-full mt-7 h-14 rounded-2xl bg-[#24110A] text-white font-bold text-lg shadow-xl disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : confirmationResult
            ? "Verify OTP"
            : "Send OTP"}
        </button>

        {confirmationResult && (
          <button
            onClick={() => {
              setConfirmationResult(null);
              setOtp("");
              setMessage("");

              if (window.recaptchaVerifier) {
                try {
                  window.recaptchaVerifier.clear();
                } catch (error) {
                  console.error(error);
                }

                window.recaptchaVerifier = null;
              }
            }}
            className="w-full mt-3 h-12 rounded-2xl bg-[#f6ece0] text-[#24110A] font-bold"
          >
            Change Number
          </button>
        )}
      </div>
    </main>
  );
}