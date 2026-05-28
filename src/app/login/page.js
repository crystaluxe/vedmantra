"use client";

import { useState } from "react";

import {
  signInWithPhoneNumber,
} from "firebase/auth";

import {
  auth,
  RecaptchaVerifier,
} from "@/lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier =
          new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
            }
          );
      }

      const appVerifier =
        window.recaptchaVerifier;

      const result =
        await signInWithPhoneNumber(
          auth,
          phone,
          appVerifier
        );

      setConfirmationResult(result);

      alert("OTP sent successfully");
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);

      const result =
        await confirmationResult.confirm(otp);

      const firebaseUser = result.user;

      const dbRes = await fetch(
        "/api/auth/firebase-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            phone: firebaseUser.phoneNumber,
          }),
        }
      );

      const dbData = await dbRes.json();

      if (!dbData.success) {
        alert("Unable to create user");
        return;
      }

      localStorage.setItem(
        "astro-user",
        JSON.stringify(dbData.user)
      );

      alert("Login successful");

      window.location.href = "/";
    } catch (error) {
      console.error(error);

      alert("Invalid OTP");
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
          Login to continue your spiritual
          journey.
        </p>

        <div className="mt-8">
          <label className="text-sm font-semibold text-[#24110A]">
            Mobile Number
          </label>

          <input
            type="tel"
            placeholder="+919999999999"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="w-full mt-2 h-14 rounded-2xl border border-[#ead8c2] px-5 outline-none"
          />
        </div>

        {confirmationResult && (
          <div className="mt-5">
            <label className="text-sm font-semibold text-[#24110A]">
              Enter OTP
            </label>

            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              className="w-full mt-2 h-14 rounded-2xl border border-[#ead8c2] px-5 outline-none"
            />
          </div>
        )}

        <button
          onClick={
            confirmationResult
              ? verifyOtp
              : sendOtp
          }
          disabled={loading}
          className="w-full mt-7 h-14 rounded-2xl bg-[#24110A] text-white font-bold text-lg shadow-xl"
        >
          {loading
            ? "Please wait..."
            : confirmationResult
            ? "Verify OTP"
            : "Send OTP"}
        </button>

        <div
          id="recaptcha-container"
          className="mt-4"
        />
      </div>
    </main>
  );
}