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
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D] flex items-center justify-center px-4"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="w-full max-w-md min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE] relative overflow-hidden px-5 py-8 flex flex-col justify-between">
        <div className="absolute -top-24 -right-20 w-72 h-72 bg-[#C99055]/25 rounded-full blur-3xl" />
        <div className="absolute top-80 -left-28 w-72 h-72 bg-[#6B2D1A]/15 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center pt-7">
            <div className="w-20 h-20 mx-auto rounded-[28px] bg-[#24110A] text-white flex items-center justify-center text-4xl shadow-2xl">
              🔮
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.28em] text-[#8A5A35] font-bold">
              Divine Guidance
            </p>

            <h1 className="text-4xl font-extrabold tracking-[-0.04em] mt-2 text-[#24110A]">
              Vedmantra
            </h1>

            <p className="text-[#6F513F] mt-4 text-[15px] leading-7 font-medium">
              Connect with trusted astrologers for love, career, marriage,
              kundli and spiritual guidance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              ["❤️", "Love", "Relationship guidance"],
              ["💼", "Career", "Job & finance clarity"],
              ["💍", "Marriage", "Kundli matching"],
              ["✨", "Spiritual", "Remedies & healing"],
            ].map((item) => (
              <div
                key={item[1]}
                className="bg-white/45 border border-white/60 rounded-3xl p-4 shadow-lg"
              >
                <p className="text-2xl">{item[0]}</p>
                <p className="font-extrabold mt-2">{item[1]}</p>
                <p className="text-xs text-[#7A5A45] mt-1 font-semibold">
                  {item[2]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/55 backdrop-blur-2xl border border-white/70 rounded-[34px] p-5 shadow-2xl mt-8">
          {!confirmationResult ? (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                Secure Login
              </p>

              <h2 className="text-2xl font-extrabold tracking-[-0.03em] mt-2">
                Enter your mobile number
              </h2>

              <div className="mt-5">
                <label className="text-sm font-bold text-[#24110A]">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-2 h-14 rounded-2xl bg-white border border-white px-5 outline-none font-bold text-lg placeholder:text-[#9A7B62] shadow-sm"
                />
              </div>

              <div className="mt-4 flex justify-center overflow-hidden">
                <div id="recaptcha-container" />
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full mt-5 h-14 rounded-2xl bg-[#24110A] text-white font-bold text-lg shadow-xl disabled:opacity-60 active:scale-[0.98] transition"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                OTP Verification
              </p>

              <h2 className="text-2xl font-extrabold tracking-[-0.03em] mt-2">
                Enter verification code
              </h2>

              <p className="text-sm text-[#6F513F] mt-2 font-medium">
                We sent a 6 digit OTP to{" "}
                <span className="font-extrabold text-[#24110A]">
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
                    className="h-14 w-full rounded-2xl bg-white border border-[#ead8c2] text-center text-xl font-extrabold outline-none shadow-sm focus:border-[#24110A]"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full mt-6 h-14 rounded-2xl bg-[#24110A] text-white font-bold text-lg shadow-xl disabled:opacity-60 active:scale-[0.98] transition"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                onClick={resetPhone}
                disabled={loading}
                className="w-full mt-3 h-12 rounded-2xl bg-[#f6ece0] text-[#24110A] font-bold"
              >
                Change Number
              </button>

              <p className="text-center text-xs text-[#7A5A45] mt-4 font-semibold">
                Didn’t receive OTP? Change number and try again.
              </p>
            </>
          )}

          {message && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${
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
              <div key={item[1]} className="bg-white/45 rounded-2xl px-2 py-3">
                <p className="text-lg">{item[0]}</p>
                <p className="text-[10px] font-bold text-[#6F513F] mt-1">
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