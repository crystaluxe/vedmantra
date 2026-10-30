"use client";

const concerns = ["Love & relationships", "Career & business", "Marriage & compatibility", "Family & personal growth"];

export default function LoginView({ phone, setPhone, otp, otpRefs, confirmationResult, loading, message, messageType, sendOtp, verifyOtp, resetPhone, handleOtpChange, handleOtpKeyDown, formatPhoneNumber, returnToProfile }) {
  return (
    <main className="min-h-screen bg-[#FFFCF8] text-[#302321]">
      <header className="border-b border-[#EEE5E5] bg-[#FFFEF9]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="Vedmantra home">
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#650D26] text-2xl text-white">✺</span>
            <span><span className="block font-display text-2xl font-semibold tracking-tight text-[#650D26]">Vedmantra</span><span className="block text-[9px] font-semibold uppercase tracking-[.22em] text-[#A17A35]">Divine Guidance</span></span>
          </a>
          <a href="/" className="text-xs font-medium text-[#806B70] hover:text-[#650D26] sm:text-sm">← Back to home</a>
        </div>
      </header>

      <section aria-labelledby="login-title" className="bg-[radial-gradient(ellipse_at_top_right,#F3E2E8,transparent_65%)] px-5 py-7 sm:py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-[#EADDE1] bg-white/90 p-6 shadow-[0_16px_60px_rgba(74,16,42,.06)] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#A17A35]">Secure OTP sign-in</p>
          <h1 id="login-title" className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-.035em] text-[#4A102A]">{confirmationResult ? "Verify your number" : "Your guidance starts here."}</h1>
          <p className="mt-3 text-sm leading-7 text-[#806B70]">{confirmationResult ? `Enter the 6-digit code sent to ${formatPhoneNumber(phone)}.` : "Sign in with your mobile number to connect with an astrologer. No password needed."}</p>
          {returnToProfile && <p className="mt-4 rounded-xl bg-[#FAF1F4] px-4 py-3 text-xs leading-5 text-[#650D26]">Your astrologer is saved. We’ll take you back to their profile after sign-in.</p>}

          <form className="mt-5" onSubmit={(event) => { event.preventDefault(); confirmationResult ? verifyOtp() : sendOtp(); }}>
            {!confirmationResult ? (
              <>
                <label htmlFor="login-phone" className="text-sm font-medium text-[#4A102A]">Mobile number</label>
                <div className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-[#DFCFD4] bg-white px-4 focus-within:border-[#650D26] focus-within:ring-2 focus-within:ring-[#650D26]/10">
                  <span className="border-r border-[#EADDE1] pr-3 text-sm text-[#806B70]">+91</span>
                  <input id="login-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Your mobile number" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={loading} className="h-full min-w-0 flex-1 bg-transparent text-base text-[#302321] outline-none placeholder:text-[#B09CA2]" />
                </div>
                <div id="recaptcha-container" className="mt-4 flex justify-center [&>div]:max-w-full" />
              </>
            ) : (
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-[#4A102A]">Verification code</legend>
                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, index) => <input key={index} ref={(element) => { otpRefs.current[index] = element; }} aria-label={`Code digit ${index + 1}`} type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} value={digit} onChange={(event) => handleOtpChange(index, event.target.value)} onKeyDown={(event) => handleOtpKeyDown(index, event)} disabled={loading} className="h-13 w-full min-w-0 rounded-xl border border-[#DFCFD4] bg-white text-center text-xl font-medium text-[#4A102A] outline-none focus:border-[#650D26] focus:ring-2 focus:ring-[#650D26]/10" />)}
                </div>
              </fieldset>
            )}
            {message && <p role={messageType === "error" ? "alert" : "status"} className={`mt-4 rounded-xl border px-4 py-3 text-xs leading-6 ${messageType === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-800"}`}>{message}</p>}
            <button type="submit" disabled={loading} className="mt-5 flex min-h-14 w-full items-center justify-center gap-4 rounded-full bg-[#650D26] px-6 py-4 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(101,13,38,.15)] transition hover:bg-[#44091A] disabled:cursor-wait disabled:opacity-60">{loading ? (confirmationResult ? "Verifying..." : "Sending OTP...") : (confirmationResult ? "Verify & continue →" : "Send OTP →")}</button>
            {confirmationResult && <button type="button" onClick={resetPhone} disabled={loading} className="mt-3 w-full rounded-full px-5 py-3 text-sm font-medium text-[#806B70] hover:text-[#650D26]">Change mobile number</button>}
          </form>
          <p className="mt-5 text-center text-[11px] leading-6 text-[#A08B90]">Your number is used for secure sign-in.<br /><a href="/privacy-policy" className="underline underline-offset-4 hover:text-[#650D26]">Privacy policy</a><span className="mx-2">·</span><a href="/terms" className="underline underline-offset-4 hover:text-[#650D26]">Terms of service</a></p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16" aria-labelledby="guidance-title">
        <div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#A17A35]">A little clarity goes a long way</p><h2 id="guidance-title" className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#4A102A]">Ancient wisdom. Personal guidance.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#806B70]">Explore your questions with online astrology consultations, at your own pace.</p></div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">{concerns.map((concern, index) => <a key={concern} href={`/?category=${["love", "career", "love", "women"][index]}#astrologers`} className="rounded-2xl border border-[#EADDE1] bg-white p-5 text-sm font-medium leading-6 text-[#650D26] transition hover:border-[#BA8C9B] hover:shadow-sm"><span aria-hidden="true" className="mb-3 block text-lg text-[#A17A35]">✧</span>{concern}</a>)}</div>
      </section>

      <section className="border-y border-[#EADDE1] bg-[#FAF3F5] px-5 py-12">
        <div className="mx-auto max-w-4xl"><h2 className="text-center font-display text-2xl font-semibold tracking-tight text-[#4A102A]">Your next steps</h2><div className="mt-8 grid gap-6 sm:grid-cols-3">{[["01", "Sign in securely", "Use the one-time code sent to your mobile."], ["02", "Choose your astrologer", "Explore profiles, expertise, and per-minute prices."], ["03", "Start a conversation", "New users get their first 5 minutes free."]].map(([step, title, description]) => <div key={step}><span className="text-xs font-semibold text-[#A17A35]">{step}</span><h3 className="mt-2 text-base font-semibold text-[#4A102A]">{title}</h3><p className="mt-2 text-xs leading-6 text-[#806B70]">{description}</p></div>)}</div></div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 text-center sm:flex-row sm:text-left"><a href="/" className="font-display text-xl font-semibold text-[#650D26]">✺ Vedmantra</a><div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[11px] text-[#806B70]">{[["Privacy", "/privacy-policy"], ["Terms", "/terms"], ["Refunds", "/refund-policy"], ["Cancellation", "/cancellation-policy"], ["Shipping", "/shipping-policy"]].map(([label, href]) => <a key={href} href={href} className="hover:text-[#650D26]">{label}</a>)}</div><p className="text-[10px] text-[#A08B90]">Vedic wisdom for modern lives.</p></footer>
    </main>
  );
}
