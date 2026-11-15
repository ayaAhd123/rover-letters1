"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import LunarMission3D from "@/components/kids/surveyor/LunarMission3D";
import SurveyorGameBeat from "@/components/kids/surveyor/SurveyorGameBeat";
import { useRadioAudio } from "@/hooks/useRadioAudio";
import { useProgress } from "@/store/progress";
import { SURVEYOR3_KIDS } from "@/data/kids/surveyor3";
import { GAME_BEAT_AUDIO } from "@/data/kids/surveyor3Playback";

const CALL = SURVEYOR3_KIDS.radioCallouts;
const BEATS = SURVEYOR3_KIDS.gameBeats;

const STEPS = [
  { id: "search", n: "01", label: "Scout" },
  { id: "dig", n: "02", label: "Scoop" },
  { id: "scan", n: "03", label: "Photo" },
  { id: "notify", n: "04", label: "Radio" },
  { id: "landing", n: "05", label: "Land" },
  { id: "flag", n: "06", label: "Flag" },
];

function hintFor(phase, { dist, dig, scan, canPlant }) {
  if (phase === "search") {
    if (dist == null) return "Click the crater. Follow the green arrow to the pad.";
    if (dist < 8) return "Pad in sight. Tap Test soil, or roll onto the green ring.";
    return `Pad ${Math.max(1, Math.round(dist))} m ahead · click the ground`;
  }
  if (phase === "dig") return dig >= 1 ? "Soil test complete." : "Tap Dig. The scoop works until the test is done.";
  if (phase === "scan") return scan >= 1 ? "Panorama locked." : "Tap Pan camera. Houston needs a full look around.";
  if (phase === "notify") return "Dish open. Call Apollo 12 and clear the landing.";
  if (phase === "landing") return "Intrepid on final. Tap Touchdown when the legs kiss the dust.";
  if (phase === "flag") {
    return canPlant
      ? "Boots on the dust. Tap Plant the flag."
      : "Walking to the flag. The boots stay on the ground.";
  }
  return "";
}

function WaveBars({ level, active }) {
  return (
    <div className="s3-comms-wave" aria-hidden={!active}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ transform: `scaleY(${active ? 0.35 + level * (0.5 + i * 0.12) : 0.2})` }} />
      ))}
    </div>
  );
}

function Tele({ k, v }) {
  return (
    <div className="s3-tele-item">
      <span>{k}</span>
      <strong>{v}</strong>
    </div>
  );
}

export default function SurveyorGame({ onExit, onCompleteCelebration }) {
  const radio = useRadioAudio();
  const { completeMachine } = useProgress();
  const [phase, setPhase] = useState("search");
  const [beatOpen, setBeatOpen] = useState("search");
  const [digProgress, setDigProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [padDist, setPadDist] = useState(null);
  const [busy, setBusy] = useState(false);
  const [canPlant, setCanPlant] = useState(false);
  const celebrated = useRef(false);
  const lastDigUi = useRef(0);
  const lastScanUi = useRef(0);
  const pendingPhase = useRef(null);
  const digDone = useRef(false);
  const scanDone = useRef(false);

  const controlRef = useRef({
    digHeld: false,
    digAmount: 0,
    scanHeld: false,
    scanAmount: 0,
    plantAmount: 0,
    plantClick: false,
    phase: "search",
  });
  const beatRef = useRef(beatOpen);
  const landGate = useRef(false);
  beatRef.current = beatOpen;
  controlRef.current.phase = beatOpen ? "pause" : phase;

  const openBeat = useCallback(
    (key) => {
      setBeatOpen(key);
      const src = GAME_BEAT_AUDIO[key];
      if (src) void radio.playClip(src);
      else {
        const beat = BEATS[key];
        if (beat?.voice && CALL[beat.voice]) void radio.speakRadio(CALL[beat.voice]);
      }
    },
    [radio]
  );

  const dismissBeat = useCallback(() => {
    setBeatOpen(null);
    if (pendingPhase.current) {
      setPhase(pendingPhase.current);
      pendingPhase.current = null;
    }
  }, []);

  const toggleComms = useCallback(() => {
    radio.setCommsOn((v) => !v);
    if (radio.commsOn) radio.stopRadio();
  }, [radio]);

  const onPadReached = useCallback(() => {
    if (controlRef.current.phase !== "search" || beatRef.current) return;
    if (pendingPhase.current === "dig") return;
    pendingPhase.current = "dig";
    openBeat("dig");
  }, [openBeat]);

  const startSoilTest = useCallback(() => {
    if (beatRef.current || phase !== "search") return;
    pendingPhase.current = "dig";
    openBeat("dig");
  }, [openBeat, phase]);

  const runDig = useCallback(() => {
    controlRef.current.digHeld = true;
    setBusy(true);
    radio.playServoDig();
  }, [radio]);

  const runScan = useCallback(() => {
    controlRef.current.scanHeld = true;
    setBusy(true);
  }, []);

  const onDigProgress = useCallback(
    (amount) => {
      controlRef.current.digAmount = amount;
      if (amount - lastDigUi.current >= 0.04 || amount >= 1) {
        lastDigUi.current = amount;
        setDigProgress(amount);
      }
      if (amount >= 1 && !digDone.current) {
        digDone.current = true;
        controlRef.current.digHeld = false;
        setBusy(false);
        pendingPhase.current = "scan";
        openBeat("scan");
      }
    },
    [openBeat]
  );

  const onScanProgress = useCallback(
    (amount) => {
      controlRef.current.scanAmount = amount;
      if (amount - lastScanUi.current >= 0.04 || amount >= 1) {
        lastScanUi.current = amount;
        setScanProgress(amount);
      }
      if (amount >= 1 && !scanDone.current) {
        scanDone.current = true;
        controlRef.current.scanHeld = false;
        setBusy(false);
        pendingPhase.current = "notify";
        openBeat("notify");
      }
    },
    [openBeat]
  );

  const notifyApollo = useCallback(() => {
    pendingPhase.current = "landing";
    openBeat("landing");
  }, [openBeat]);

  const onLanded = useCallback(() => {
    if (landGate.current) return;
    landGate.current = true;
    pendingPhase.current = "flag";
    setCanPlant(false);
    openBeat("flag");
  }, [openBeat]);

  const onStatus = useCallback(({ dist }) => {
    setPadDist(dist);
  }, []);

  const onFlagPlanted = useCallback(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    setPhase("complete");
    completeMachine("surveyor-3");
    onCompleteCelebration?.();
    if (GAME_BEAT_AUDIO.flag) void radio.playClip(GAME_BEAT_AUDIO.flag);
    else void radio.speakRadio(CALL.stage3Success);
  }, [completeMachine, onCompleteCelebration, radio]);

  const plantFlag = useCallback(() => {
    if (beatOpen) return;
    if (phase !== "flag") return;
    controlRef.current.plantClick = true;
  }, [beatOpen, phase]);

  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.id === (phase === "complete" ? "flag" : phase)));
  const gamePaused = Boolean(beatOpen);
  const soilPsi = digProgress >= 1 ? "6 PSI" : digProgress > 0 ? `${(digProgress * 6).toFixed(1)} PSI` : "—";
  const alt = phase === "landing" ? "final" : phase === "flag" || phase === "complete" ? "0 m" : "surface";

  return (
    <div className={`s3-game kids-mission-game s3-game--3d s3-view--${phase}${gamePaused ? " is-paused" : ""}`}>
      <LunarMission3D
        controlRef={controlRef}
        phase={gamePaused ? "pause" : phase}
        talking={radio.talking}
        onPadReached={onPadReached}
        onDigProgress={onDigProgress}
        onScanProgress={onScanProgress}
        onLanded={onLanded}
        onFlagPlanted={onFlagPlanted}
        onCanPlant={() => setCanPlant(true)}
        onStatus={onStatus}
      />

      <div className="s3-vignette" aria-hidden="true" />

      <div className="s3-3d-hud">
        <header className="s3-game-top s3-3d-top">
          <button type="button" className="kids-icon-btn s3-back" onClick={onExit}>
            ← Moon
          </button>
          <ol className="s3-rail" aria-label="Mission steps">
            {STEPS.map((step, i) => (
              <li key={step.id} className={i < stepIndex ? "is-done" : i === stepIndex ? "is-current" : ""}>
                <span>
                  <em>{step.n}</em>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={`s3-comms-toggle${radio.commsOn ? " is-on" : ""}`}
            onClick={toggleComms}
            aria-pressed={radio.commsOn}
          >
            COMMS
            <WaveBars level={radio.waveLevel} active={radio.talking && radio.commsOn} />
          </button>
        </header>

        <div className="s3-tele" aria-hidden="true">
          <Tele k="Site" v="Surveyor Crater" />
          <Tele k="Pad" v={padDist == null ? "—" : `${Math.round(padDist)} m`} />
          <Tele k="Soil" v={soilPsi} />
          <Tele k="Photo" v={scanProgress >= 1 ? "locked" : `${Math.round(scanProgress * 100)}%`} />
          <Tele k="Alt" v={alt} />
        </div>

        {!beatOpen && hintFor(phase, { dist: padDist, dig: digProgress, scan: scanProgress, canPlant }) ? (
          <p className="s3-hud-line">{hintFor(phase, { dist: padDist, dig: digProgress, scan: scanProgress, canPlant })}</p>
        ) : null}

        <div className="s3-3d-controls">
          {phase === "search" && !beatOpen && (
            <button type="button" className="kids-btn kids-btn-primary s3-hud-btn" onClick={startSoilTest}>
              Test the soil
            </button>
          )}
          {phase === "dig" && !beatOpen && (
            <>
              <div className="s3-3d-gauge" aria-label="Soil sample">
                <span className="s3-gauge-fill" style={{ width: `${Math.round(digProgress * 100)}%` }} />
                <span className="s3-3d-gauge-label">Scoop {Math.round(digProgress * 100)}%</span>
              </div>
              <button type="button" className="kids-btn kids-btn-primary s3-hud-btn" onClick={runDig} disabled={busy || digProgress >= 1}>
                {busy ? "Digging…" : "Dig"}
              </button>
            </>
          )}
          {phase === "scan" && !beatOpen && (
            <>
              <div className="s3-3d-gauge" aria-label="Panorama">
                <span className="s3-gauge-fill" style={{ width: `${Math.round(scanProgress * 100)}%` }} />
                <span className="s3-3d-gauge-label">Camera {Math.round(scanProgress * 100)}%</span>
              </div>
              <button type="button" className="kids-btn kids-btn-primary s3-hud-btn" onClick={runScan} disabled={busy || scanProgress >= 1}>
                {busy ? "Panning…" : "Pan camera"}
              </button>
            </>
          )}
          {phase === "notify" && !beatOpen && (
            <button type="button" className="kids-btn kids-btn-primary s3-hud-btn" onClick={notifyApollo}>
              Call Apollo 12
            </button>
          )}
          {phase === "landing" && !beatOpen && (
            <button type="button" className="kids-btn kids-btn-primary s3-hud-btn" onClick={onLanded}>
              Touchdown
            </button>
          )}
          {phase === "flag" && !beatOpen && (
            <button type="button" className="kids-btn kids-btn-primary s3-hud-btn" onClick={plantFlag} disabled={!canPlant}>
              {canPlant ? "Plant the flag" : "Walking to the flag…"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {beatOpen && BEATS[beatOpen] ? (
          <SurveyorGameBeat beat={BEATS[beatOpen]} onContinue={dismissBeat} />
        ) : null}
      </AnimatePresence>

      {phase === "complete" && (
        <div className="s3-mission-summary s3-3d-summary">
          <div className="kids-end-card s3-end-cream">
            <p className="kids-end-emoji" aria-hidden="true">
              🇺🇸
            </p>
            <h2>Flag on the Moon</h2>
            <p>
              You scouted the pad, dug the soil, shot a panorama, called Apollo 12, watched Intrepid land, and planted the
              flag. Apollo 12 and Surveyor 3 are one Moon mission — you just finished it.
            </p>
            <div className="kids-invite-actions">
              <button type="button" className="kids-btn kids-btn-primary" onClick={onExit}>
                Back to the Moon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
