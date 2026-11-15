"use client";
import { useEffect, useState } from "react";
import { CAPTIONS, captionAt } from "@/data/captions";

export default function Captions({ audioRef, active }) {
  const [text, setText] = useState("");
  const cues = CAPTIONS.en;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !active) {
      setText("");
      return;
    }

    let raf = 0;
    let last = "";
    const update = () => {
      const next = captionAt(cues, audio.currentTime);
      if (next !== last) {
        last = next;
        setText(next);
      }
      raf = requestAnimationFrame(update);
    };
    const clear = () => {
      cancelAnimationFrame(raf);
      setText("");
    };

    update();
    audio.addEventListener("ended", clear);
    return () => {
      cancelAnimationFrame(raf);
      audio.removeEventListener("ended", clear);
    };
  }, [active, audioRef, cues]);

  if (!active || !text) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-16">
      <p
        dir="ltr"
        className="max-w-3xl bg-black/80 px-5 py-3 text-center text-lg font-medium leading-snug text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] md:text-xl"
      >
        {text}
      </p>
    </div>
  );
}
