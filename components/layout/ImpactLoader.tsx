"use client";

import React, { useEffect, useState } from "react";

export const ImpactLoader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check session storage to only show once per session (or keep it snappy ~1.4s)
    const hasLoaded = sessionStorage.getItem("impact_loaded_once");

    const timer1 = setTimeout(() => {
      setFading(true);
    }, hasLoaded ? 400 : 1200);

    const timer2 = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("impact_loaded_once", "true");
    }, hasLoaded ? 700 : 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF9F6] transition-opacity duration-500 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Self-Assembling Geometric Engine Icon */}
        <div className="relative w-20 h-20 mb-6">
          {/* Outer Pulsing Aura Ring */}
          <div className="absolute inset-0 rounded-2xl bg-brand-accent/15 animate-ping" />

          {/* Converging Geometric Fragments */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Top Fragment */}
            <div className="absolute -top-1 w-6 h-6 rounded-lg bg-brand-accent transform rotate-12 transition-transform animate-pulse" />
            {/* Bottom Left Fragment */}
            <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-lg bg-brand-teal/80 transform -rotate-12 transition-transform" />
            {/* Center Core */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-brand-gold flex items-center justify-center shadow-lg transform rotate-45">
              <div className="w-4 h-4 rounded-md bg-white transform -rotate-45" />
            </div>
            {/* Orbiting Spark */}
            <div className="absolute w-2 h-2 rounded-full bg-brand-gold animate-bounce -top-2 -right-2" />
          </div>
        </div>

        {/* Brand Text Assembly */}
        <div className="text-center space-y-1">
          <div className="text-2xl font-black tracking-widest text-brand-dark flex items-center justify-center gap-1">
            <span className="inline-block animate-pulse">I</span>
            <span className="inline-block animate-pulse [animation-delay:100ms]">M</span>
            <span className="inline-block animate-pulse [animation-delay:200ms]">P</span>
            <span className="inline-block animate-pulse [animation-delay:300ms]">A</span>
            <span className="inline-block animate-pulse [animation-delay:400ms]">C</span>
            <span className="inline-block animate-pulse [animation-delay:500ms]">T</span>
          </div>
          <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-brand-muted uppercase">
            ENTERPRISE
          </div>
        </div>

        {/* Loading Bar */}
        <div className="mt-6 w-36 h-1 bg-brand-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-accent via-brand-teal to-brand-gold animate-[shimmer_1.4s_infinite]" />
        </div>
      </div>
    </div>
  );
};
