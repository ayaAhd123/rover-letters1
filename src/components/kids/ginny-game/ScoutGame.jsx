"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Ingenuity from "@/components/kids/Ingenuity";
import SpinUpLevel from "@/components/kids/ginny-game/SpinUpLevel";
import PickTheRoadLevel from "@/components/kids/ginny-game/PickTheRoadLevel";
import {
  INTRO,
  MAP_EASY,
  REPORT,
  ROAD,
  SPIN,
  UI,
  pickText,
} from "@/data/ginnyGame";
import { useProgress } from "@/store/progress";

const FONT = '"Baloo 2", "Nunito", ui-rounded, system-ui, sans-serif';

export default function ScoutGame({ machineId = "ingenuity", onExit, onBackToStory, skipIntro = false }) {
  const { completeMachine } = useProgress();
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const [phase, setPhase] = useState(skipIntro ? "level1" : "intro");
  const [introLine, setIntroLine] = useState(0);
  const [mood, setMood] = useState("happy");
  const [pose, setPose] = useState("wave");
  const [talking, setTalking] = useState(false);
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState(null);
  const [reportWord, setReportWord] = useState(null);
  const [debugHazards] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("debugHazards") === "1" : false
  );
  const [roadStep, setRoadStep] = useState("spot");
  const level2FullPhoto = phase === "level2";
  const takeoffFull = phase === "level1";

  const say = useCallback((text, m = "happy", p = "fly") => {
    setCaption(text);
    setMood(m);
    setPose(p);
    setTalking(true);
    window.setTimeout(() => setTalking(false), Math.min(5000, 700 + text.length * 42));
  }, []);

  useEffect(() => {
    if (skipIntro && phase === "level1") {
      say(pickText(SPIN.tapHint), "happy", "fly");
    }
  }, [skipIntro, phase, say]);

  useEffect(() => {
    if (phase !== "intro") return undefined;
    const line = INTRO.lines[introLine];
    if (!line) return undefined;
    say(pickText(line));
    return undefined;
  }, [phase, introLine, say]);

  useEffect(() => {
    if (phase === "report") completeMachine(machineId);
  }, [phase, machineId, completeMachine]);

  const advanceIntro = () => {
    if (introLine < INTRO.lines.length - 1) {
      setIntroLine((i) => i + 1);
    } else {
      setPhase("level1");
      say(pickText(SPIN.takeoffIntro), "happy", "fly");
    }
  };

  const onSpinDone = () => {
    setPhase("level2");
    say(`${pickText(ROAD.spotHint)} ${pickText(ROAD.spotWhy)}`, "happy", "fly");
  };

  const showCaption = useMemo(
    () => ["intro", "level1", "level2"].includes(phase),
    [phase]
  );

  return (
    <section
      className={`kids-mission-game ginny-scout-game flex h-full min-h-0 w-full flex-col overflow-hidden${
        level2FullPhoto ? " ginny-scout-game--spot-bg" : ""
      }${takeoffFull ? " ginny-scout-game--takeoff" : ""}`}
      style={{ fontFamily: FONT }}
      aria-label="Scout for Perseverance game"
    >
      <header
        className={`ginny-scout-header flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2${
          level2FullPhoto || takeoffFull ? " ginny-scout-header--on-photo" : ""
        }`}
      >
        <button type="button" className="kids-btn kids-btn-ghost min-h-12 text-sm" onClick={onBackToStory ?? onExit}>
          {pickText(UI.backToStory)}
        </button>
        <h2 className="text-center text-lg font-bold text-white">{pickText(INTRO.title)}</h2>
        {onExit ? (
          <button type="button" className="kids-btn kids-btn-ghost min-h-12 text-sm" onClick={onExit}>
            {pickText(UI.backToMap)}
          </button>
        ) : (
          <span className="w-16" aria-hidden="true" />
        )}
      </header>

      <div
        className={`ginny-scout-main flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-start${
          level2FullPhoto || takeoffFull ? " overflow-hidden p-0" : " overflow-y-auto px-3 pb-6 lg:px-6"
        }`}
      >
        {phase !== "level2" && !takeoffFull && (
          <div className="mx-auto w-28 shrink-0 sm:w-32 lg:mx-0">
            <Ingenuity talking={talking} mood={mood} pose={pose} size="100%" followPointer={false} />
          </div>
        )}

        <div className={`min-h-0 min-w-0 flex-1${level2FullPhoto ? " relative" : ""}`}>
          {showCaption && caption && !level2FullPhoto && !takeoffFull ? (
            <p className="kids-mars-line mb-3" aria-live="polite">
              {caption}
            </p>
          ) : null}

          {phase === "intro" && (
            <button type="button" className="kids-btn kids-btn-primary mx-auto mt-2 flex min-h-12" onClick={advanceIntro}>
              {pickText(UI.continue)}
            </button>
          )}

          {phase === "level1" && (
            <SpinUpLevel
              onDone={onSpinDone}
              onSay={(text, worried) => say(text, worried ? "sad" : "happy", worried ? "droop" : "fly")}
              reduceMotion={reduceMotion}
            />
          )}

          {phase === "level2" && (
            <PickTheRoadLevel
              map={MAP_EASY}
              debugHazards={debugHazards}
              reduceMotion={reduceMotion}
              onStepChange={setRoadStep}
              onSay={(text, worried) => say(text, worried ? "scared" : "happy", worried ? "shock" : "fly")}
              onComplete={(stats) => {
                setResult(stats);
                setPhase("report");
              }}
            />
          )}

          {phase === "report" && result && (
            <div className="grid gap-4 rounded-md border-2 border-[#111] bg-white p-4 text-[#111]">
              <p className="text-lg font-bold">{pickText(REPORT.intro)}</p>
              <p className="text-center text-2xl font-bold text-[#f0c14a]">
                {"★".repeat(result.stars)}
                {"☆".repeat(Math.max(0, 3 - result.stars))}
              </p>
              <p className="text-base">
                {pickText(REPORT.starsLabel)}: {result.stars}/3 · {pickText(REPORT.dangersLabel)}: {result.foundCount}/
                {result.totalHazards}
              </p>
              <p className="text-xl leading-relaxed">
                {pickText(REPORT.template).split("{0}")[0]}
                <button type="button" className="mx-1 inline-block min-h-12 min-w-[8rem] rounded border-2 border-dashed border-[#f0c14a] px-2 font-bold" onClick={() => setReportWord(null)}>
                  {reportWord ? pickText(reportWord) : "…"}
                </button>
                {pickText(REPORT.template).split("{0}")[1]}
              </p>
              <div className="flex flex-wrap gap-2">
                {REPORT.blanks[0].map((w) => (
                  <button key={w.en} type="button" className="kids-btn kids-btn-ghost min-h-12" onClick={() => setReportWord(w)}>
                    {pickText(w)}
                  </button>
                ))}
              </div>
              <button type="button" disabled={!reportWord} className="kids-btn kids-btn-primary min-h-12" onClick={onExit}>
                {pickText(REPORT.finish)}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}