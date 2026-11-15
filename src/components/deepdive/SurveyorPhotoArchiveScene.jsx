"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import sections from "@/data/surveyor3DeepDive";
import { useDeepDive } from "./DeepDiveContext";

const DEFAULT_SRC = "/surveyor3/apollo12-visit.jpg";

/** Left column for Surveyor archive: full-bleed NASA photos synced to scroll chapters. */
export default function SurveyorPhotoArchiveScene() {
  const { activeSectionId, setNasaRoverReady, nasaRoverReady, reducedMotion } = useDeepDive();
  const section = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? sections[0],
    [activeSectionId]
  );
  const [displaySrc, setDisplaySrc] = useState(section?.image?.src ?? DEFAULT_SRC);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef(0);

  useEffect(() => {
    const urls = [...new Set(sections.map((s) => s.image?.src).filter(Boolean))];
    let cancelled = false;
    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => {
      if (!cancelled) setNasaRoverReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [setNasaRoverReady]);

  useEffect(() => {
    const next = section?.image?.src;
    if (!next || next === displaySrc) return;

    if (reducedMotion) {
      setDisplaySrc(next);
      setVisible(true);
      return;
    }

    setVisible(false);
    window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setDisplaySrc(next);
      setVisible(true);
    }, 220);

    return () => window.clearTimeout(fadeTimer.current);
  }, [section?.image?.src, displaySrc, reducedMotion]);

  const caption = section?.image?.caption ?? "Surveyor 3 mission";
  const credit = section?.image?.credit ?? "NASA";

  return (
    <div className="deep-dive-scene-wrap surveyor-photo-stage">
      {nasaRoverReady ? (
        <p className="ring-caption viking-orbit-hint" aria-live="polite">
          NASA mission photography
          <small>Scroll the panel to change chapters</small>
        </p>
      ) : null}
      <figure className={`surveyor-photo-hero${visible ? " is-visible" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displaySrc} alt={caption} />
        <figcaption>
          {caption} · {credit}
        </figcaption>
      </figure>
    </div>
  );
}