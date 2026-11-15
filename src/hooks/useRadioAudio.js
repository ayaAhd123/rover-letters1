"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cancelSpeech, speakLine, waitForVoices, pickEnglishVoice } from "@/hooks/useSpeech";
import { useAudioPrefs } from "@/context/AudioPrefsContext";

const DEFAULT_RATE = 0.94;
const DEFAULT_PITCH = 0.92;

let sharedSfxCtx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
}

function getSharedSfxCtx() {
  if (typeof window === "undefined") return null;
  if (sharedSfxCtx?.state === "closed") sharedSfxCtx = null;
  if (!sharedSfxCtx) sharedSfxCtx = getCtx();
  return sharedSfxCtx;
}

/** Authentic-style Quindar tone (intro/outro beep). */
function quindarTone(ctx, { freq = 2475, duration = 0.25, gain = 0.12 } = {}) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(ctx, { duration = 0.18, color = "pink", gain = 0.08 } = {}) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    if (color === "pink") {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2) * 0.22;
    } else {
      data[i] = white * 0.35;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(ctx.destination);
  src.start();
}

export function useRadioAudio({ enabled = true } = {}) {
  const { sfxEnabled } = useAudioPrefs();
  const ctxRef = useRef(null);
  const voiceRef = useRef(null);
  const [commsOn, setCommsOn] = useState(true);
  const voiceLive = enabled && commsOn;
  const sfxLive = voiceLive && sfxEnabled;
  const [talking, setTalking] = useState(false);
  const [waveLevel, setWaveLevel] = useState(0);
  const waveTimer = useRef(null);
  const runId = useRef(0);
  const clipRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    waitForVoices().then((voices) => {
      voiceRef.current = pickEnglishVoice(voices);
    });
    return () => {
      cancelSpeech();
      if (waveTimer.current) clearInterval(waveTimer.current);
      ctxRef.current = null;
    };
  }, []);

  const ensureCtx = useCallback(() => {
    if (!sfxLive) return null;
    const ctx = getSharedSfxCtx();
    ctxRef.current = ctx;
    if (ctx?.state === "suspended") void ctx.resume();
    return ctx;
  }, [sfxLive]);

  const startWave = useCallback(() => {
    if (waveTimer.current) clearInterval(waveTimer.current);
    waveTimer.current = setInterval(() => {
      setWaveLevel(0.25 + Math.random() * 0.75);
    }, 70);
  }, []);

  const stopWave = useCallback(() => {
    if (waveTimer.current) clearInterval(waveTimer.current);
    waveTimer.current = null;
    setWaveLevel(0);
  }, []);

  const playQuindarBeep = useCallback(
    (variant = "in") => {
      const ctx = ensureCtx();
      if (!ctx) return;
      quindarTone(ctx, { freq: variant === "out" ? 2520 : 2475 });
    },
    [ensureCtx]
  );

  const playThrusterPulse = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(42, t0);
    osc.frequency.exponentialRampToValueAtTime(18, t0 + 0.45);
    g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.55);
    noiseBurst(ctx, { duration: 0.35, gain: 0.06 });
  }, [ensureCtx]);

  const playServoDig = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.linearRampToValueAtTime(95, t0 + 0.22);
    g.gain.setValueAtTime(0.04, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.3);
  }, [ensureCtx]);

  const playScanPing = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t0);
    osc.frequency.exponentialRampToValueAtTime(1760, t0 + 0.12);
    g.gain.setValueAtTime(0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.22);
  }, [ensureCtx]);

  const playSuccessChime = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const t0 = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.07, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.4);
    });
  }, [ensureCtx]);

  const playClip = useCallback(
    async (src, { lineCount = 1, onLineIndex, beeps = true } = {}) => {
      const id = ++runId.current;
      if (!src) return;
      cancelSpeech();
      if (clipRef.current) {
        clipRef.current.pause();
        clipRef.current = null;
      }
      if (!voiceLive) {
        await new Promise((r) => setTimeout(r, 12000));
        return;
      }
      const audio = new Audio(src);
      clipRef.current = audio;
      setTalking(true);
      startWave();
      if (beeps && sfxLive) playQuindarBeep("in");

      const syncLines = () => {
        if (id !== runId.current || !onLineIndex) return;
        const d = audio.duration;
        if (!Number.isFinite(d) || d <= 0) return;
        const idx = Math.min(lineCount - 1, Math.floor((audio.currentTime / d) * lineCount));
        onLineIndex(idx);
      };

      try {
        await new Promise((resolve, reject) => {
          let raf = 0;
          const tick = () => {
            if (id !== runId.current) return;
            syncLines();
            if (!audio.paused && !audio.ended) raf = requestAnimationFrame(tick);
          };
          const cleanup = () => {
            if (raf) cancelAnimationFrame(raf);
            audio.removeEventListener("ended", onEnd);
            audio.removeEventListener("error", onErr);
          };
          const onEnd = () => {
            cleanup();
            resolve();
          };
          const onErr = () => {
            cleanup();
            reject(new Error("clip"));
          };
          audio.addEventListener("ended", onEnd);
          audio.addEventListener("error", onErr);
          audio.addEventListener("loadedmetadata", () => {
            syncLines();
            raf = requestAnimationFrame(tick);
          });
          void audio.play().catch(reject);
        });
      } catch {
        /* blocked */
      }
      if (id !== runId.current) return;
      if (beeps && sfxLive) playQuindarBeep("out");
      setTalking(false);
      stopWave();
      clipRef.current = null;
    },
    [voiceLive, sfxLive, playQuindarBeep, startWave, stopWave]
  );

  const speakRadio = useCallback(
    async (text, { src, pitch = DEFAULT_PITCH, rate = DEFAULT_RATE, beeps = true, lineCount, onLineIndex } = {}) => {
      if (src && voiceLive) {
        await playClip(src, { lineCount, onLineIndex, beeps });
        return;
      }
      const id = ++runId.current;
      if (!text) return;
      setTalking(true);
      startWave();
      if (beeps && sfxLive) playQuindarBeep("in");
      try {
        if (voiceLive && typeof window !== "undefined" && "speechSynthesis" in window) {
          await speakLine(text, { voice: voiceRef.current, pitch, rate });
        } else {
          await new Promise((r) => setTimeout(r, Math.min(8000, 400 + text.length * 45)));
        }
      } catch {
        /* muted or blocked */
      }
      if (id !== runId.current) return;
      if (beeps && sfxLive) playQuindarBeep("out");
      setTalking(false);
      stopWave();
    },
    [voiceLive, sfxLive, playClip, playQuindarBeep, startWave, stopWave]
  );

  const pauseClip = useCallback(() => {
    clipRef.current?.pause();
    cancelSpeech();
    setTalking(false);
    stopWave();
  }, [stopWave]);

  const resumeClip = useCallback(() => {
    const audio = clipRef.current;
    if (!audio || audio.ended) return;
    setTalking(true);
    startWave();
    void audio.play().catch(() => {});
  }, [startWave]);

  const stopRadio = useCallback(() => {
    runId.current += 1;
    cancelSpeech();
    if (clipRef.current) {
      clipRef.current.pause();
      clipRef.current = null;
    }
    setTalking(false);
    stopWave();
  }, [stopWave]);

  return {
    commsOn,
    setCommsOn,
    talking,
    waveLevel,
    playQuindarBeep,
    playThrusterPulse,
    playServoDig,
    playScanPing,
    playSuccessChime,
    speakRadio,
    playClip,
    pauseClip,
    resumeClip,
    stopRadio,
  };
}