"use client";

import { useEffect, useState } from "react";

const COUNTS = [21, 25, 17, 19];

export default function AstrologersToExplore() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(Math.floor(Math.random() * COUNTS.length));
    const timer = setInterval(() => setIndex(value => (value + 1) % COUNTS.length), 10000);
    return () => clearInterval(timer);
  }, []);
  return <span><strong>{COUNTS[index]}</strong> astrologers to explore</span>;
}
