"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import SiteDialog from "./SiteDialog";

const DialogContext = createContext(null);

export default function DialogProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const active = useRef(null);
  const queue = useRef([]);
  const sequence = useRef(0);
  const advance = useCallback(() => {
    active.current = queue.current.shift() || null;
    setCurrent(active.current);
  }, []);
  const request = useCallback((message, options = {}) => new Promise((resolve) => {
    queue.current.push({ message: String(message || "Please try again in a moment."), ...options, resolve, id: ++sequence.current });
    if (!active.current) advance();
  }), [advance]);
  const settle = useCallback((accepted) => {
    if (!active.current) return;
    active.current.resolve(accepted);
    advance();
  }, [advance]);
  const api = useMemo(() => ({
    notify: (message, options = {}) => request(message, { tone: "error", title: "Let’s try that again", confirmLabel: "Got it", ...options }),
    confirm: (message, options = {}) => request(message, { tone: "confirm", title: "End this consultation?", confirmLabel: "End consultation", cancelLabel: "Keep chatting", ...options }),
  }), [request]);

  return <DialogContext.Provider value={api}>{children}{current && <SiteDialog key={current.id} title={current.title} message={current.message} tone={current.tone} onDismiss={() => settle(false)}>
    {current.cancelLabel && <button type="button" autoFocus onClick={() => settle(false)} className="mb-3 min-h-12 w-full rounded-full border border-[#DFC7D0] bg-white px-5 py-3 text-sm font-semibold text-[#650D26] hover:bg-[#FAF1F4]">{current.cancelLabel}</button>}
    <button type="button" onClick={() => settle(true)} className="min-h-12 w-full rounded-full bg-[#650D26] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#44091A]">{current.confirmLabel}</button>
  </SiteDialog>}</DialogContext.Provider>;
}

export function useSiteDialog() {
  const api = useContext(DialogContext);
  if (!api) throw new Error("useSiteDialog requires DialogProvider");
  return api;
}
