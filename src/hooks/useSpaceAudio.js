"use client";

import { useCallback, useRef } from "react";
import { useAudioPrefs } from "@/context/AudioPrefsContext";

let sharedUiCtx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
}

function getSharedUiCtx() {
  if (typeof window === "undefined") return null;
  if (sharedUiCtx?.state === "closed") sharedUiCtx = null;
  if (!sharedUiCtx) sharedUiCtx = getCtx();
  return sharedUiCtx;
}

export function useSpaceAudio() {
  const { sfxEnabled } = useAudioPrefs();
  const ctxRef = useRef(null);

  const ensure = useCallback(() => {
    if (!sfxEnabled) return null;
    const ctx = getSharedUiCtx();
    ctxRef.current = ctx;
    if (ctx?.state === "suspended") void ctx.resume();
    return ctx;
  }, [sfxEnabled]);

  const tone = useCallback(
    (freq, duration = 0.12, gain = 0.06, type = "sine") => {
      const ctx = ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    },
    [ensure]
  );

  const playPlanetHover = useCallback(() => tone(420, 0.08, 0.035), [tone]);
  const playPlanetSelect = useCallback(() => {
    tone(520, 0.1, 0.05);
    tone(780, 0.14, 0.04);
  }, [tone]);
  const playWhoosh = useCallback(() => {
    const ctx = ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.exponentialRampToValueAtTime(45, t0 + 0.55);
    g.gain.setValueAtTime(0.04, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.58);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.6);
  }, [ensure]);
  const playMarkerPing = useCallback(() => tone(880, 0.15, 0.07), [tone]);
  const playMissionComplete = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      window.setTimeout(() => tone(f, 0.22, 0.055), i * 90);
    });
  }, [tone]);

  return {
    playPlanetHover,
    playPlanetSelect,
    playWhoosh,
    playMarkerPing,
    playMissionComplete,
  };
}