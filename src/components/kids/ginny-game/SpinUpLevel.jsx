"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Ingenuity from "@/components/kids/Ingenuity";
import { SPIN, pickText } from "@/data/ginnyGame";

/** Altitude 0 = on ground, 1 = flown off top */
const RISE_SPEED = 0.42;
const FALL_SPEED = 0.18;
const OFF_TOP = 0.98;

export default function SpinUpLevel({ onDone, onSay, reduceMotion }) {
  const riseSpeed = reduceMotion ? 0.55 : RISE_SPEED;

  const [alt, setAlt] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [stageH, setStageH] = useState(480);
  const stageRef = useRef(null);
  const altRef = useRef(0);
  const holdingRef = useRef(false);
  const doneFired = useRef(false);
  const cheered = useRef(false);
  const raf = useRef(0);
  const last = useRef(performance.now());
  const onSayRef = useRef(onSay);
  const onDoneRef = useRef(onDone);

  onSayRef.current = onSay;
  onDoneRef.current = onDone;

  const scheduleSay = (text, worried) => {
    window.setTimeout(() => onSayRef.current(text, worried), 0);
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => setStageH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    doneFired.current = false;
    cheered.current = false;
    holdingRef.current = false;
    altRef.current = 0;
    setHolding(false);
    setAlt(0);
    setDone(false);
  }, []);

  const loop = useCallback(() => {
    const now = performance.now();
    const dt = Math.min(50, now - last.current);
    last.current = now;

    if (holdingRef.current && !doneFired.current) {
      let next = altRef.current + (riseSpeed * dt) / 1000;
      if (!cheered.current && next > 0.08) {
        cheered.current = true;
        scheduleSay(pickText(SPIN.inZoneCheer));
      }
      if (next >= OFF_TOP && !doneFired.current) {
        doneFired.current = true;
        holdingRef.current = false;
        next = 1;
        setHolding(false);
        setDone(true);
        scheduleSay(pickText(SPIN.doneTakeoff));
        window.setTimeout(() => onDoneRef.current(), reduceMotion ? 400 : 900);
      }
      altRef.current = next;
    } else if (!doneFired.current) {
      altRef.current = Math.max(0, altRef.current - (FALL_SPEED * dt) / 1000);
    }
    setAlt(altRef.current);

    raf.current = requestAnimationFrame(loop);
  }, [riseSpeed, reduceMotion]);

  useEffect(() => {
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [loop]);

  const pressStart = (e) => {
    if (doneFired.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    holdingRef.current = true;
    setHolding(true);
  };

  const pressEnd = () => {
    if (doneFired.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (altRef.current > 0.1 && altRef.current < OFF_TOP) scheduleSay(pickText(SPIN.retry), true);
  };

  const liftY = alt * (stageH + 100);
  const fade = alt > 0.72 ? Math.max(0, 1 - (alt - 0.72) / 0.28) : 1;

  return (
    <div className="ginny-takeoff-stage" aria-label={pickText(SPIN.takeoffIntro)}>
      <div
        ref={stageRef}
        className="ginny-takeoff-sky absolute inset-0 overflow-hidden bg-gradient-to-t from-[#3d2818] via-[#6b4a38] to-[#87a4c4]"
      >
        <div
          className="ginny-takeoff-ground absolute inset-x-0 bottom-0 z-[1] h-[min(8dvh,3.5rem)] bg-[#4a3428] border-t-2 border-[#2a1810]"
          aria-hidden
        />
        <div
          className="ginny-takeoff-heli absolute bottom-[min(7dvh,2.75rem)] left-1/2 z-[2]"
          style={{
            transform: `translate(-50%, ${-liftY}px)`,
            opacity: fade,
            transition: holding ? "none" : "transform 0.25s ease-out, opacity 0.2s",
          }}
        >
          <Ingenuity
            talking={holding}
            mood="happy"
            pose={alt < 0.15 ? "takeoff" : "fly"}
            size="clamp(72px, 14vw, 112px)"
            followPointer={false}
            rotors="fast"
          />
        </div>
      </div>

      <div className="ginny-takeoff-hud-bottom pointer-events-auto">
        <div className="flex justify-center">
          <button
            type="button"
            className={`ginny-hold-btn touch-manipulation${holding ? " ginny-hold-btn--on" : ""}${done ? " ginny-hold-btn--done" : ""}`}
            disabled={done}
            onPointerDown={pressStart}
            onPointerUp={pressEnd}
            onPointerCancel={pressEnd}
            onLostPointerCapture={pressEnd}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                holdingRef.current = true;
                setHolding(true);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") pressEnd();
            }}
            aria-label={pickText(SPIN.holdButton)}
          >
            <span className="ginny-hold-btn-label">{pickText(SPIN.holdButton)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}