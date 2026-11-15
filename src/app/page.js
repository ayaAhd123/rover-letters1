"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { BODIES } from "@/data/bodies";
import { useLang } from "@/context/LangContext";
import Intro from "@/components/Intro";
import Captions from "@/components/Captions";
import SiteHeader, { MapLogo } from "@/components/SiteHeader";
import CertificateModal from "@/components/certificate/CertificateModal";
import { allMachinesComplete, useProgress } from "@/state/progress";
import PlanetMapModal from "@/components/PlanetMapModal";
import SfxToggle from "@/components/SfxToggle";
import { useSpaceAudio } from "@/hooks/useSpaceAudio";

const NARRATION = {
  en: "/audio/narration-en.mp3",
  ar: "/audio/narration-ar.mp3",
};

const SpaceScene = dynamic(() => import("@/components/SpaceScene"), {
  ssr: false,
});

const KidsMode = dynamic(() => import("@/components/kids/KidsMode"), {
  ssr: false,
});

export default function Home() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState("intro"); // "intro" | "flying" | "leaving" | "space"
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(null); // { bodyId, equipId }
  const [onSurface, setOnSurface] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const markerEls = useRef({});
  const finished = useRef(false);
  const narrationRef = useRef(null);
  const spaceAudio = useSpaceAudio();

  useEffect(() => {
    const mission = new URLSearchParams(window.location.search).get("mission");
    if (mission !== "surveyor-3") return;
    finished.current = true;
    setPhase("space");
    setSelected("moon");
    setOpen({ bodyId: "moon", equipId: "surveyor-3" });
    setOnSurface(true);
  }, []);

  const handleSelectPlanet = (id) => {
    if (id !== selected) setOpen(null);
    setSelected(id);
    spaceAudio.playPlanetSelect();
  };

  const handleSurfaceChange = useCallback((isSurface) => {
    setOnSurface(Boolean(isSurface));
  }, []);

  const body = BODIES.find((b) => b.id === selected);

  const item = open
    ? BODIES.find((b) => b.id === open.bodyId)?.equipment?.find((e) => e.id === open.equipId)
    : null;

  const bodyMachines = body?.equipment ?? [];
  const siteVisit =
    Boolean(open?.bodyId) &&
    bodyMachines.some((machine) => machine.id === open?.equipId);
  const moonSiteVisit = siteVisit && open?.bodyId === "moon";
  const [mapOpen, setMapOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const { completedMachines, ready: progressReady } = useProgress();
  const certificateUnlocked = progressReady && allMachinesComplete(completedMachines);
  const showKids = Boolean(item && onSurface);

  const openMission = (machine) => {
    if (!body || !machine) return;
    spaceAudio.playMarkerPing();
    setOpen({ bodyId: body.id, equipId: machine.id });
  };

  const stopNarration = () => {
    const audio = narrationRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setNarrating(false);
  };

  const playNarration = () => {
    const audio = narrationRef.current;
    if (!audio) return;
    audio.src = NARRATION[lang] ?? NARRATION.en;
    audio.currentTime = 0;
    setNarrating(true);
    const play = audio.play();
    if (play) play.catch(() => setNarrating(false));
  };

  const finishIntro = () => {
    if (finished.current) return;
    finished.current = true;
    setPhase("leaving");
    setTimeout(() => setPhase("space"), 700);
  };

  const skipIntro = () => {
    stopNarration();
    finishIntro();
  };

  const startJourney = () => {
    playNarration();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finishIntro();
    } else {
      setPhase("flying");
    }
  };

  const introDone = phase === "leaving" || phase === "space";

  const closeKids = () => {
    setOpen(null);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <SpaceScene
          selected={selected}
          onSelect={handleSelectPlanet}
          markerEls={markerEls}
          siteVisit={siteVisit}
          onSurfaceChange={handleSurfaceChange}
          paused={phase === "intro" || phase === "flying"}
          names={t.planets}
          rtl={lang === "ar"}
          onPlanetHover={spaceAudio.playPlanetHover}
          onApproachStart={spaceAudio.playWhoosh}
        />
      </div>

      {introDone && (
        <div className="absolute right-4 top-20 z-[60] md:top-4">
          <SfxToggle />
        </div>
      )}

      {body &&
        !item &&
        (body.equipment ?? []).map((m) => (
          <button
            key={m.id}
            ref={(el) => {
              markerEls.current[m.id] = el;
            }}
            onClick={() => openMission(m)}
            aria-label={m.name}
            title={m.subtitle ?? m.name}
            className="equipment-marker group pointer-events-none absolute left-0 top-0 text-white opacity-0"
          >
            <span className="equipment-marker-pulse" aria-hidden="true" />
            <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/40 bg-black/80 px-3 py-1.5 text-sm font-semibold shadow-lg ring-2 ring-white/20 transition group-hover:scale-105 group-hover:border-yellow-300 group-hover:ring-yellow-300/40 group-focus-visible:scale-105 group-focus-visible:border-yellow-300">
              <span
                className="h-2.5 w-2.5 animate-pulse rounded-full"
                style={{ backgroundColor: m.color || "#fde047" }}
              />
              {m.name}
            </span>
          </button>
        ))}

      {introDone && !showKids && !item && (
        <SiteHeader
          title={t.site}
          onMap={body ? () => setMapOpen(true) : null}
          onCertificate={() => setCertOpen(true)}
          certificateUnlocked={certificateUnlocked}
        />
      )}

      {introDone && body && item && !showKids && (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          aria-label="Map"
          className={`absolute left-4 z-[90] grid h-11 w-11 place-items-center rounded-md bg-[#0B3D91] ${
            showKids ? "top-24" : "top-4"
          }`}
        >
          <MapLogo />
        </button>
      )}

      {!body && introDone && (
        <p className="pointer-events-none absolute left-0 right-0 top-24 text-center text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
          {t.hint}
        </p>
      )}

      {body && !item && body.id === "earth" && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 flex justify-center px-6"
          style={{ top: "calc(4.5rem + 10vh)", bottom: "48vh" }}
        >
          <p
            className="m-auto max-w-2xl text-center text-base font-semibold leading-relaxed text-white md:text-lg"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}
          >
            {t.earthEquipmentReminder}
          </p>
        </div>
      )}

      {body && !item && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-6 text-white md:p-10">
          <div className="max-w-lg bg-black/70 p-5">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{body.name}</h1>
            <p className="mt-2 text-white/80">{body.tagline}</p>
            {body.equipment?.length > 0 && (
              <p className="mt-3 text-sm text-white/70">
                {body.id === "mars"
                  ? "Tap a machine on Mars to land and meet it."
                  : body.id === "moon"
                    ? "Tap Surveyor 3 — the story includes Apollo 12 landing beside the lander."
                    : t.tapMarker}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelected(null)}
            className="pointer-events-auto border border-white/50 bg-black/55 px-5 py-2 text-sm font-semibold hover:bg-black/80"
          >
            {t.back}
          </button>
        </div>
      )}

      {certOpen ? <CertificateModal open={certOpen} onClose={() => setCertOpen(false)} /> : null}

      {mapOpen && body && (
        <PlanetMapModal
          planet={body}
          onClose={() => setMapOpen(false)}
          onPick={(machine) => {
            setMapOpen(false);
            openMission(machine);
          }}
        />
      )}

      {siteVisit && !onSurface && (
        <p className="pointer-events-none absolute left-0 right-0 top-1/2 z-40 -translate-y-1/2 text-center text-lg text-white/90">
          {moonSiteVisit ? "Descending into Surveyor Crater…" : "Landing on Mars…"}
        </p>
      )}

      {showKids && (
        <KidsMode
          machineId={item.id}
          onClose={closeKids}
          onCompleteCelebration={spaceAudio.playMissionComplete}
        />
      )}

      <audio
        ref={narrationRef}
        preload="auto"
        src={NARRATION[lang] ?? NARRATION.en}
        onEnded={() => setNarrating(false)}
      />

      <Captions audioRef={narrationRef} lang={lang} active={narrating} />

      {phase !== "space" && (
        <Intro phase={phase} onStart={startJourney} onFinish={finishIntro} onSkip={skipIntro} />
      )}
    </main>
  );
}