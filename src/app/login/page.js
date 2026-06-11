"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Toast from "@/components/Toast";

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

  const astrologers = [
    ["Acharya Rahul", "Love & Marriage", "4.9"],
    ["Kavita Rao", "Career & Finance", "4.8"],
    ["Nidhi Sharma", "Kundali Expert", "4.9"],
  ];

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen overflow-x-hidden relative bg-gradient-to-br from-[#FFF8EF] via-[#F3DEC5] to-[#DDB483] px-4 py-6">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C99055]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-64 -left-24 w-64 h-64 bg-[#6B2D1A]/12 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center pt-5">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#2A130A] to-[#6B2D1A] text-[#F8D89B] flex items-center justify-center text-5xl shadow-2xl border border-[#F7D9A5]/40">
            ☸
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#8A5A35] font-black">
            Divine Guidance
          </p>

          <h1 className="text-5xl font-black tracking-[-0.07em] mt-2 text-[#24110A]">
            Vedmantra
          </h1>

          <p className="text-[#6F513F] mt-4 text-[15px] leading-7 font-semibold max-w-[340px] mx-auto">
            Talk to verified astrologers for love, career, marriage, kundli and
            spiritual remedies.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ["12k+", "Consults"],
              ["20+", "Astrologers"],
              ["2 min", "Avg Reply"],
            ].map((item) => (
              <div
                key={item[1]}
                className="bg-white/45 border border-white/70 rounded-3xl px-2 py-3 shadow-lg backdrop-blur-xl"
              >
                <p className="text-lg font-black text-[#24110A]">{item[0]}</p>
                <p className="text-[10px] font-black text-[#7A5A45] mt-1">
                  {item[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-6 bg-white/45 border border-white/70 rounded-[30px] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A5A35] font-black">
                Today&apos;s Panchang
              </p>
              <h3 className="text-xl font-black tracking-[-0.04em] mt-1">
                Daily Vedic Insights
              </h3>
            </div>
            <div className="text-3xl">🌞</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              ["Tithi", "Shukla"],
              ["Nakshatra", "Punarvasu"],
              ["Sunrise", "05:44"],
            ].map((item) => (
              <div key={item[0]} className="bg-white/60 rounded-2xl p-3">
                <p className="text-[10px] font-black text-[#8A5A35]">
                  {item[0]}
                </p>
                <p className="text-xs font-black text-[#24110A] mt-1">
                  {item[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-black mb-3">
            Available Astrologers
          </p>

          <div className="space-y-3">
            {astrologers.map((item, index) => (
              <div
                key={item[0]}
                className="bg-white/55 border border-white/75 rounded-[26px] p-4 shadow-lg backdrop-blur-xl flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#24110A] text-white flex items-center justify-center font-black">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-[#24110A] truncate">
                    {item[0]}
                  </h3>
                  <p className="text-xs font-bold text-[#7A5A45] mt-1">
                    {item[1]}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-[#24110A]">
                    ⭐ {item[2]}
                  </p>
                  <p className="text-[10px] font-black text-green-700 mt-1">
                    Online
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-6 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[34px] p-5 shadow-2xl overflow-visible">
          <div className="mb-5 bg-[#FFF8EF] border border-[#F0DEC8] rounded-[24px] px-4 py-3 text-center">
            <p className="text-sm font-black text-[#24110A]">
              ★★★★★ 4.9/5 Rating
            </p>
            <p className="text-xs font-bold text-[#7A5A45] mt-1">
              Trusted by thousands across India
            </p>
          </div>

          {!confirmationResult ? (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-black">
                Secure OTP Login
              </p>

              <h2 className="text-3xl font-black tracking-[-0.05em] mt-2 leading-tight">
                Continue to talk with astrologers
              </h2>

              <p className="text-sm text-[#7A5A45] font-semibold mt-2 leading-6">
                Enter your mobile number and start your private astrology chat.
              </p>

              <div className="mt-5">
                <label className="text-sm font-black text-[#24110A]">
                  Mobile Number
                </label>

                <div className="mt-2 h-14 rounded-[24px] bg-white border border-[#EAD8C2] shadow-sm flex items-center px-4 gap-3 w-full">
                  <span className="font-black text-[#8A5A35] shrink-0">
                    +91
                  </span>

                  <input
                    type="tel"
                    placeholder="9999999999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="min-w-0 flex-1 h-14 bg-transparent outline-none font-black text-lg placeholder:text-[#B4987F]"
                  />
                </div>
              </div>

              <div className="mt-5 w-full flex justify-center overflow-visible">
                <div
                  id="recaptcha-container"
                  style={{
                    transform: "scale(0.86)",
                    transformOrigin: "center",
                  }}
                />
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full mt-5 h-14 rounded-[24px] bg-[#24110A] text-white font-black text-lg shadow-2xl disabled:opacity-60 active:scale-[0.98] transition"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-black">
                OTP Verification
              </p>

              <h2 className="text-3xl font-black tracking-[-0.05em] mt-2 leading-tight">
                Verify your number
              </h2>

              <p className="text-sm text-[#6F513F] mt-2 font-semibold leading-6">
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
                    className="min-w-0 h-13 rounded-2xl bg-white border border-[#ead8c2] text-center text-xl font-black outline-none shadow-sm focus:border-[#24110A]"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full mt-6 h-14 rounded-[24px] bg-[#24110A] text-white font-black text-lg shadow-2xl disabled:opacity-60 active:scale-[0.98] transition"
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
            </>
          )}

          {message && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-black break-words ${
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

        <div className="relative z-10 mt-6 bg-[#24110A] text-white rounded-[32px] p-5 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[#F8D89B] font-black">
            Free Kundali
          </p>

          <h3 className="text-2xl font-black tracking-[-0.05em] mt-2">
            Want detailed kundali analysis?
          </h3>

          <p className="text-sm text-white/70 font-semibold leading-6 mt-2">
            Login to generate your profile and connect with a kundali expert.
          </p>

          <button
            onClick={() => {
              document.querySelector("input[type='tel']")?.focus();
            }}
            className="w-full mt-4 h-13 rounded-[22px] bg-[#F8D89B] text-[#24110A] font-black"
          >
            Generate Janam Kundali
          </button>
        </div>

        <div className="relative z-10 mt-6 pb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-black mb-3">
            People usually ask
          </p>

          <div className="grid grid-cols-1 gap-2">
            {[
              "❤️ Will my relationship work?",
              "💼 When will I get a job change?",
              "💍 When will I get married?",
              "💰 Will my business grow?",
              "🏠 Is this a good time to buy property?",
            ].map((question) => (
              <div
                key={question}
                className="bg-white/45 border border-white/70 rounded-2xl px-4 py-3 text-sm font-black text-[#4B2A1B]"
              >
                {question}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-8 pb-10">
  <footer className="rounded-[34px] overflow-hidden border border-[#E7CFAE] shadow-2xl bg-gradient-to-br from-[#2A1109] via-[#4A1B12] to-[#170805] text-[#FFF4E5]">
    <div className="px-5 pt-7 pb-6">
      <div className="text-center">
        <div className="mx-auto mb-3 h-11 w-11 rounded-full border border-[#D6A85F] flex items-center justify-center text-[#F7D99B] text-2xl">
          ✦
        </div>

        <h3 className="text-3xl font-black tracking-[-0.06em]">
          Vedmantra
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#F4D9B7]/80 font-semibold">
          Ancient Vedic wisdom blended with modern guidance for love,
          career, marriage, business and spiritual growth.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {[
          ["📜", "Terms & Conditions", "/terms"],
          ["🛡️", "Privacy Policy", "/privacy-policy"],
          ["₹", "Refund Policy", "/refund-policy"],
          ["🚚", "Shipping Policy", "/shipping-policy"],
        ].map((item) => (
          <a
            key={item[1]}
            href={item[2]}
            className="rounded-[22px] bg-white/10 border border-white/10 px-3 py-4 text-center shadow-lg backdrop-blur-xl active:scale-[0.98] transition"
          >
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-[#F7D99B]/15 border border-[#F7D99B]/30 flex items-center justify-center text-[#F7D99B] font-black">
              {item[0]}
            </div>
            <p className="text-xs font-black text-[#FFF4E5] leading-4">
              {item[1]}
            </p>
          </a>
        ))}
      </div>

      <a
        href="/cancellation-policy"
        className="mt-3 flex items-center justify-center gap-2 rounded-[22px] bg-white/10 border border-white/10 px-4 py-4 text-center shadow-lg backdrop-blur-xl active:scale-[0.98] transition"
      >
        <span className="h-8 w-8 rounded-full bg-[#F7D99B]/15 border border-[#F7D99B]/30 flex items-center justify-center text-[#F7D99B] font-black">
          ×
        </span>
        <span className="text-xs font-black text-[#FFF4E5]">
          Cancellation Policy
        </span>
      </a>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {[
          ["🔐", "Secure"],
          ["✅", "Verified"],
          ["💬", "Support"],
        ].map((item) => (
          <div
            key={item[1]}
            className="rounded-2xl bg-[#F7D99B]/10 border border-[#F7D99B]/15 px-2 py-3 text-center"
          >
            <p className="text-lg">{item[0]}</p>
            <p className="text-[10px] font-black text-[#F4D9B7] mt-1">
              {item[1]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-[#D6A85F]/30 text-center">
        <p className="text-xs font-black text-[#F7D99B]">
          © 2026 Vedmantra. All Rights Reserved.
        </p>

        <p className="mt-3 text-[11px] leading-5 text-[#F4D9B7]/70 font-semibold">
          Astrology services are provided for guidance purposes only. Outcomes
          may vary based on individual circumstances.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D6A85F]/40 bg-[#F7D99B]/10 px-4 py-2">
          <span>🔒</span>
          <span className="text-[11px] font-black text-[#F7D99B]">
            Made with devotion • Guided by wisdom
          </span>
        </div>
      </div>
    </div>
  </footer>
</div>
    </main>
  );
}