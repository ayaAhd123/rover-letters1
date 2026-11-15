"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ROAD,
  SCOUT_AERIAL_SIZE,
  firstPathHazardHit,
  hazardAtTap,
  pickText,
  pointerToMapCoords,
  scoutMapViewBox,
} from "@/data/ginnyGame";

function MiniRover({ stuck, reduceMotion }) {
  return (
    <svg viewBox="0 0 48 32" aria-hidden style={{ width: 48, height: 32 }}>
      <rect x="8" y="10" width="32" height="14" rx="4" fill="#c45c26" stroke="#3a2a24" strokeWidth="2" />
      <circle cx="14" cy="26" r="5" fill="#2c2624" className={stuck && !reduceMotion ? "ginny-wheel-spin" : ""} />
      <circle cx="34" cy="26" r="5" fill="#2c2624" className={stuck && !reduceMotion ? "ginny-wheel-spin" : ""} />
      <rect x="20" y="4" width="8" height="8" rx="2" fill="#e7eef5" stroke="#3a2a24" />
    </svg>
  );
}

export default function PickTheRoadLevel({
  map,
  onComplete,
  onSay,
  debugHazards,
  reduceMotion,
  onStepChange,
}) {
  const [step, setStep] = useState("spot");
  const [found, setFound] = useState([]);
  const [waypoints, setWaypoints] = useState(() => [map.start]);
  const [driving, setDriving] = useState(false);
  const [roverPos, setRoverPos] = useState(map.start);
  const [stuck, setStuck] = useState(false);
  const [hitId, setHitId] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const animRef = useRef(null);
  const svgRef = useRef(null);
  const onSayRef = useRef(onSay);
  onSayRef.current = onSay;

  const scheduleSay = (text, worried) => {
    window.setTimeout(() => onSayRef.current(text, worried), 0);
  };

  const foundAll = found.length === map.hazards.length;
  const canContinueSpot = found.length >= ROAD.minFound;
  const mapViewBox = scoutMapViewBox(map.imageSize ?? SCOUT_AERIAL_SIZE);
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  const fullPath = useMemo(() => {
    const pts = [...waypoints];
    if (pts.length >= 1 && pts[pts.length - 1] !== map.goal) return [...pts, map.goal];
    return pts;
  }, [waypoints, map.goal]);

  const markHazard = useCallback(
    (h) => {
      if (step !== "spot" || found.includes(h.id)) return;
      setFound((f) => [...f, h.id]);
      scheduleSay(`${pickText(ROAD.spotFound)} ${pickText(h.hint)}`);
    },
    [step, found]
  );

  const mapClick = (e) => {
    if (driving) return;
    const coords = pointerToMapCoords(svgRef.current, e.clientX, e.clientY);
    if (!coords) return;
    if (step === "spot") {
      const h = hazardAtTap(coords.x, coords.y, map.hazards);
      if (h) markHazard(h);
      else scheduleSay(pickText(ROAD.spotMiss), true);
      return;
    }
    if (step === "draw" && waypoints.length < ROAD.maxWaypoints + 1) {
      setStuck(false);
      setHitId(null);
      setWaypoints((w) => [...w, coords]);
    }
  };

  const drive = useCallback(() => {
    if (driving) return;
    const path = [...waypoints, map.goal];
    const crash = firstPathHazardHit(path, map.hazards);
    setCelebrate(false);
    setStuck(false);
    setHitId(null);
    setDriving(true);
    animRef.current = null;

    const duration = reduceMotion ? 100 : 220;
    const stopAt = crash ? crash.segmentIndex + 0.55 : path.length - 1;
    const totalMs = Math.max(duration, stopAt * duration);

    const frame = (t) => {
      if (!animRef.current) animRef.current = t;
      const elapsed = t - animRef.current;
      const progress = Math.min(1, elapsed / totalMs);
      const along = progress * stopAt;
      const idx = Math.min(path.length - 2, Math.floor(along));
      const localT = along - idx;
      const a = path[idx];
      const b = path[idx + 1];
      setRoverPos({
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT,
      });
      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }
      setDriving(false);
      animRef.current = null;
      if (crash) {
        setStuck(true);
        setHitId(crash.hazard.id);
        setStep("draw");
        scheduleSay(pickText(crash.hazard.hint), true);
        return;
      }
      if (!reduceMotion) setCelebrate(true);
      const stars =
        1 + (foundAll ? 1 : 0) + (waypoints.length - 1 <= ROAD.efficientBonusAt ? 1 : 0);
      scheduleSay(pickText(ROAD.success));
      window.setTimeout(
        () =>
          onComplete?.({
            stars,
            foundCount: found.length,
            totalHazards: map.hazards.length,
            foundAll,
          }),
        reduceMotion ? 200 : 900
      );
    };
    requestAnimationFrame(frame);
  }, [driving, waypoints, map, reduceMotion, foundAll, found.length, onComplete]);

  const mapSvgContent = (
    <>
      {map.hazards.map((h) => {
        const isFound = found.includes(h.id);
        const spotting = step === "spot";
        return (
          <g key={h.id}>
            {spotting && !isFound && (
              <circle
                cx={h.x}
                cy={h.y}
                r={h.r + 55}
                fill="rgba(240,193,74,0.22)"
                stroke="#f0c14a"
                strokeWidth={12}
                strokeDasharray="28 22"
                className="ginny-hazard-pulse"
                onPointerUp={(e) => {
                  e.stopPropagation();
                  markHazard(h);
                }}
              />
            )}
            {!spotting && (
              <circle
                cx={h.x}
                cy={h.y}
                r={h.r}
                fill={isFound ? "rgba(240,193,74,0.45)" : "rgba(255,255,255,0.06)"}
                stroke={isFound || hitId === h.id ? "#f0c14a" : debugHazards ? "#ff6666" : "transparent"}
                strokeWidth={hitId === h.id ? 16 : 8}
                pointerEvents="none"
                className={hitId === h.id && !reduceMotion ? "ginny-hazard-blink" : undefined}
              />
            )}
            {spotting && (
              <circle
                cx={h.x}
                cy={h.y}
                r={h.r}
                fill={isFound ? "rgba(240,193,74,0.5)" : "rgba(255,255,255,0.08)"}
                stroke={isFound || hitId === h.id ? "#f0c14a" : debugHazards ? "#ff6666" : "transparent"}
                pointerEvents="none"
                className={hitId === h.id && !reduceMotion ? "ginny-hazard-blink" : undefined}
              />
            )}
          </g>
        );
      })}
      {step !== "spot" && fullPath.length > 1 &&
        fullPath.map((p, i) =>
          i === 0 ? null : (
            <line
              key={`l-${i}`}
              x1={fullPath[i - 1].x}
              y1={fullPath[i - 1].y}
              x2={p.x}
              y2={p.y}
              stroke="#fff"
              strokeWidth="36"
              strokeDasharray="90 60"
              pointerEvents="none"
            />
          )
        )}
      {step !== "spot" &&
        waypoints.map((p, i) => (
          <circle key={`w-${i}`} cx={p.x} cy={p.y} r={55} fill="#f0c14a" pointerEvents="none" />
        ))}
      {step !== "spot" && (
        <>
          <text x={map.start.x} y={map.start.y + 90} textAnchor="middle" fontSize="140" fill="#fff" fontWeight="bold" pointerEvents="none">
            Start
          </text>
          <text x={map.goal.x} y={map.goal.y - 60} textAnchor="middle" fontSize="140" fill="#6fdc8c" fontWeight="bold" pointerEvents="none">
            Goal
          </text>
          <foreignObject x={roverPos.x - 170} y={roverPos.y - 120} width="340" height="200" pointerEvents="none">
            <div style={{ transform: "translate(-20px,-16px)" }}>
              <MiniRover stuck={stuck} reduceMotion={reduceMotion} />
            </div>
          </foreignObject>
        </>
      )}
    </>
  );

  const stageLabel =
    step === "spot" ? pickText(ROAD.spotTitle) : step === "drive" ? pickText(ROAD.drive) : pickText(ROAD.drawTitle);

  return (
    <div className="ginny-spot-stage" aria-label={stageLabel}>
      {celebrate && !reduceMotion ? (
        <div className="ginny-road-confetti pointer-events-none" aria-hidden>
          <span className="text-4xl">✨</span>
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ginny-spot-page-bg" src={map.image} alt="" draggable={false} />
      <svg
        ref={svgRef}
        className="ginny-spot-page-svg"
        viewBox={mapViewBox}
        preserveAspectRatio="xMidYMid slice"
        onPointerUp={mapClick}
        role="application"
        aria-label="Scout map"
      >
        {mapSvgContent}
      </svg>

      <div className="ginny-spot-hud-bottom pointer-events-auto" aria-label={stageLabel}>
        {step === "spot" ? (
          <div className="ginny-spot-hud-bottom-inner">
            <p className="ginny-spot-counter mb-2 text-center">
              {found.length}/{map.hazards.length}
            </p>
            <button
              type="button"
              disabled={!canContinueSpot}
              className="kids-btn kids-btn-primary min-h-12 w-full max-w-md"
              onClick={() => {
                setStep("draw");
                scheduleSay(pickText(ROAD.drawHint));
              }}
            >
              {pickText(ROAD.continueSpot)}
            </button>
          </div>
        ) : (
          <div className="ginny-spot-hud-bottom-inner ginny-spot-hud-bottom-inner--row">
            <button
              type="button"
              className="kids-btn kids-btn-ghost min-h-12 min-w-[7rem] flex-1"
              disabled={waypoints.length < 2 || driving}
              onClick={() => waypoints.length > 1 && setWaypoints((w) => w.slice(0, -1))}
            >
              {pickText(ROAD.undo)}
            </button>
            <button
              type="button"
              className="kids-btn kids-btn-primary min-h-12 min-w-[7rem] flex-1"
              disabled={waypoints.length < 2 || driving}
              onClick={() => {
                setStep("drive");
                drive();
              }}
            >
              {pickText(ROAD.drive)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}