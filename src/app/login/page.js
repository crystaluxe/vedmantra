"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const otpRefs = useRef([]);

  useEffect(() => {
    const user = localStorage.getItem("astro-user");

    if (user) {
      window.location.href = "/";
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

      showMessage("Login successful. Preparing your dashboard...", "success");

      setTimeout(() => {
        window.location.href = "/";
      }, 900);
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
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D] flex items-center justify-center px-0"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="w-full max-w-md min-h-screen relative overflow-visible bg-gradient-to-br from-[#FFF8EF] via-[#F3DEC5] to-[#DDB483] px-4 py-6 flex flex-col justify-between">
        <div className="absolute -top-28 -right-24 w-80 h-80 bg-[#C99055]/30 rounded-full blur-3xl" />
        <div className="absolute top-64 -left-28 w-72 h-72 bg-[#6B2D1A]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-56 h-56 bg-[#F5D49A]/35 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center pt-8">
            <div className="w-24 h-24 mx-auto rounded-[32px] bg-[#24110A] text-white flex items-center justify-center text-5xl shadow-2xl border border-[#D9A45D]/30">
              🔮
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-[#8A5A35] font-black">
              Divine Guidance
            </p>

            <h1 className="text-5xl font-black tracking-[-0.07em] mt-2 text-[#24110A]">
              Vedmantra
            </h1>

            <p className="text-[#6F513F] mt-4 text-[15px] leading-7 font-semibold max-w-sm mx-auto">
              Talk to trusted astrologers for love, career, marriage, kundli
              and spiritual remedies.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-7">
            {[
              ["❤️", "Love"],
              ["💼", "Career"],
              ["💍", "Marriage"],
              ["✨", "Remedy"],
            ].map((item) => (
              <div
                key={item[1]}
                className="bg-white/45 border border-white/70 rounded-3xl p-3 shadow-lg text-center backdrop-blur-xl"
              >
                <p className="text-2xl">{item[0]}</p>
                <p className="text-[11px] font-black mt-2 text-[#4B2A1B]">
                  {item[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[38px] p-5 shadow-2xl mt-7 overflow-visible">
          <div className="absolute -top-10 right-8 w-24 h-24 bg-[#D9A45D]/25 rounded-full blur-2xl" />

          {!confirmationResult ? (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8A5A35] font-black">
                Secure OTP Login
              </p>

              <h2 className="text-3xl font-black tracking-[-0.05em] mt-2">
                Enter mobile number
              </h2>

              <p className="text-sm text-[#7A5A45] font-semibold mt-2">
                We’ll send a one-time password to verify your account.
              </p>

              <div className="mt-5">
                <label className="text-sm font-black text-[#24110A]">
                  Mobile Number
                </label>

                <div className="mt-2 h-15 rounded-[24px] bg-white border border-[#EAD8C2] shadow-sm flex items-center px-4 gap-3">
                  <span className="font-black text-[#8A5A35]">+91</span>
                  <input
                    type="tel"
                    placeholder="9999999999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-14 bg-transparent outline-none font-black text-lg placeholder:text-[#B4987F]"
                  />
                </div>
              </div>

              <div className="mt-5 w-full flex justify-center overflow-visible">
                <div
                  id="recaptcha-container"
                  style={{
                    transform: "scale(0.9)",
                    transformOrigin: "center",
                  }}
                />
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full mt-5 h-15 rounded-[24px] bg-[#24110A] text-white font-black text-lg shadow-2xl disabled:opacity-60 active:scale-[0.98] transition"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8A5A35] font-black">
                OTP Verification
              </p>

              <h2 className="text-3xl font-black tracking-[-0.05em] mt-2">
                Verify your number
              </h2>

              <p className="text-sm text-[#6F513F] mt-2 font-semibold">
                Enter the 6 digit code sent to{" "}
                <span className="font-black text-[#24110A]">
                  {formatPhoneNumber(phone)}
                </span>
              </p>

              <div className="grid grid-cols-6 gap-2 mt-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="h-14 w-full rounded-2xl bg-white border border-[#ead8c2] text-center text-xl font-black outline-none shadow-sm focus:border-[#24110A] focus:scale-[1.03] transition"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full mt-6 h-15 rounded-[24px] bg-[#24110A] text-white font-black text-lg shadow-2xl disabled:opacity-60 active:scale-[0.98] transition"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                onClick={resetPhone}
                disabled={loading}
                className="w-full mt-3 h-12 rounded-[22px] bg-[#F6ECE0] text-[#24110A] font-black"
              >
                Change Number
              </button>

              <p className="text-center text-xs text-[#7A5A45] mt-4 font-bold">
                Didn’t receive OTP? Change number and try again.
              </p>
            </>
          )}

          {message && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-black ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ["🔐", "Secure"],
              ["⚡", "Instant"],
              ["✅", "Verified"],
            ].map((item) => (
              <div key={item[1]} className="bg-white/55 rounded-2xl px-2 py-3">
                <p className="text-lg">{item[0]}</p>
                <p className="text-[10px] font-black text-[#6F513F] mt-1">
                  {item[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}