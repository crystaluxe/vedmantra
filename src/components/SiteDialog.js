"use client";

import { useEffect, useId, useRef } from "react";

export default function SiteDialog({ open = true, title, message, tone = "info", onDismiss, children }) {
  const dialog = useRef(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={message ? `${id}-message` : undefined} onCancel={(event) => { event.preventDefault(); onDismiss(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-sm overflow-y-auto rounded-[28px] border border-[#E8D7DC] bg-[#FFFCF8] p-7 text-center text-[#4A102A] shadow-[0_24px_100px_rgba(35,9,20,.25)] backdrop:bg-[#24111B]/60 backdrop:backdrop-blur-sm">
      <button type="button" onClick={onDismiss} aria-label="Close dialog" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#8E747A] hover:bg-[#F3E5E9] focus-visible:outline-2 focus-visible:outline-[#650D26]">×</button>
      <div aria-hidden="true" className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${tone === "success" ? "bg-emerald-50 text-emerald-700" : tone === "error" ? "bg-rose-50 text-[#9C2849]" : "bg-[#F3E5E9] text-[#650D26]"}`}>{tone === "success" ? "✓" : tone === "error" ? "!" : tone === "confirm" ? "?" : "✺"}</div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#997345]">Vedmantra · Divine guidance</p>
      <h2 id={`${id}-title`} className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {message && <p id={`${id}-message`} className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#806B70]">{message}</p>}
      <div className="mt-6">{children}</div>
    </dialog>
  );
}
