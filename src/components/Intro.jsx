"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/context/LangContext";
import SiteHeader from "@/components/SiteHeader";

const SolarIntro = dynamic(() => import("@/components/SolarIntro"), { ssr: false });

function Stars() {
  const stars = useMemo(() => {
    let s = 7;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: 80 }, () => ({
      x: (rnd() * 100).toFixed(2),
      y: (rnd() * 100).toFixed(2),
      size: (rnd() * 2 + 1).toFixed(1),
      delay: (rnd() * 3).toFixed(1),
    }));
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {stars.map((st, i) => (
        <span
          key={i}
          className="star-twinkle absolute rounded-full bg-white"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.size}px`,
            height: `${st.size}px`,
            animationDelay: `${st.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// phase: "intro" | "flying" | "leaving"
export default function Intro({ phase, onStart, onFinish, onSkip }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState(false);
  const [waited, setWaited] = useState(false);
  const ready = loaded || waited;
  const flying = phase !== "intro";

  useEffect(() => {
    const id = setTimeout(() => setWaited(true), 12000);
    return () => clearTimeout(id);
  }, []);

  return (
    <section
      className={`absolute inset-0 z-40 overflow-hidden bg-[#02030a] text-white transition-opacity duration-700 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Stars />

      <div className="absolute inset-0">
        <SolarIntro
          flying={flying}
          rtl={false}
          onReady={() => setLoaded(true)}
          onEnd={onFinish}
        />
      </div>

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent transition-opacity duration-700 ${
          flying ? "opacity-0" : "opacity-100"
        }`}
      />

      {!flying && <SiteHeader title={t.site} />}

      <div
        className={`pointer-events-none absolute inset-0 z-10 overflow-y-auto transition-all duration-700 ${
          flying ? "-translate-y-4 opacity-0" : "opacity-100"
        }`}
      >
        <div className="mx-auto flex min-h-full max-w-[1400px] items-end px-6 pb-16 pt-28 md:items-center md:px-10 md:pt-24">
          <div className="max-w-2xl text-start">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              {t.badge}
            </p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white md:text-xl">{t.intro}</p>

            <button
              onClick={onStart}
              disabled={!ready || flying}
              className="pointer-events-auto mt-8 min-h-12 bg-[#fc3d21] px-6 text-base font-bold text-white transition hover:bg-[#e1331b] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
            >
              {ready ? t.start : t.loading}
            </button>
          </div>
        </div>
      </div>

      {phase === "flying" && (
        <button
          onClick={onSkip ?? onFinish}
          className="absolute bottom-6 end-6 z-20 min-h-11 border border-white/50 bg-black/55 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-black/75"
        >
          {t.skip}
        </button>
      )}
    </section>
  );
}
