"use client";

import { useEffect, useRef } from "react";
import { MISSION_SOURCES as DEFAULT_MISSION_SOURCES } from "@/data/opportunityDeepDive";
import { useDeepDive } from "./DeepDiveContext";
import { pickActiveSectionId } from "./missionScrollSync";
import GlossaryTerm from "./GlossaryTerm";
import { tokenizeParagraph } from "./missionRichText";

function resolveSource(ref, missionSources) {
  const full = missionSources.find((s) => s.code === ref.code);
  if (!full) return null;
  return full;
}

function withFirstGlossaryFlags(paragraphs) {
  const seen = new Set();
  return paragraphs.map((text) =>
    tokenizeParagraph(text).map((part) => {
      if (part.kind !== "glossary") return part;
      const emphasize = !seen.has(part.key);
      if (emphasize) seen.add(part.key);
      return { ...part, emphasize };
    })
  );
}

function Paragraph({ parts, onTrigger }) {
  return (
    <p>
      {parts.map((p, i) => {
        if (p.kind === "text") {
          return <span key={i}>{p.value}</span>;
        }
        if (p.kind === "trigger") {
          return (
            <button key={i} type="button" className="mission-trigger" onClick={() => onTrigger(p.id)}>
              {p.label}
            </button>
          );
        }
        return <GlossaryTerm key={i} termKey={p.key} emphasize={p.emphasize} />;
      })}
    </p>
  );
}

function SectionSources({ refs, missionSources }) {
  if (!refs?.length) return null;
  return (
    <div className="mission-sources-inline">
      {refs.map((ref) => {
        const src = resolveSource(ref, missionSources);
        if (!src) return null;
        return (
          <a
            key={src.code}
            className="mission-source-link"
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            SOURCE {src.code} / {src.label} ↗
          </a>
        );
      })}
    </div>
  );
}

function SectionFigure({ image }) {
  if (!image) return null;
  return (
    <figure className="mission-figure mission-figure--inline">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.caption} loading="lazy" />
      <figcaption>
        {image.caption} · {image.credit}
      </figcaption>
    </figure>
  );
}

function SectionArticle({ section, onTrigger, missionSources }) {
  const inlineAfter =
    typeof section.imageAfterParagraph === "number" ? section.imageAfterParagraph : null;
  const showImageAtEnd = section.image && inlineAfter === null;
  const paragraphParts = withFirstGlossaryFlags(section.paragraphs);

  return (
    <article
      className="mission-section"
      data-section-id={section.id}
      id={`mission-${section.id}`}
    >
      <p className="mission-section-kicker">
        CH {section.chapter} · {section.kicker}
      </p>
      <h3>{section.title}</h3>
      {paragraphParts.map((parts, i) => (
        <div key={i} className="mission-paragraph-block">
          <Paragraph parts={parts} onTrigger={onTrigger} />
          {section.image && inlineAfter === i ? <SectionFigure image={section.image} /> : null}
        </div>
      ))}

      {section.telemetry ? (
        <div className="mission-telemetry" role="list">
          {section.telemetry.map((row) => (
            <div key={row.label} className="mission-telemetry-cell" role="listitem">
              <span>{row.label}</span>
              <strong>
                {row.value}
                {row.unit ? <em>{row.unit}</em> : null}
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      {section.routeNote ? <p className="mission-route-note">{section.routeNote}</p> : null}

      {showImageAtEnd ? <SectionFigure image={section.image} /> : null}

      {section.reflectionPrompt ? (
        <div className="mission-reflection">
          <label htmlFor="mission-reflection-input">{section.reflectionPrompt}</label>
          <textarea
            id="mission-reflection-input"
            placeholder="Optional — your idea stays on this device."
            aria-label={section.reflectionPrompt}
          />
        </div>
      ) : null}

      <SectionSources refs={section.sources} missionSources={missionSources} />
    </article>
  );
}

/** Scrollable mission archive with section observer → 3D sync. */
export default function MissionArchivePanel({
  sections,
  missionSources = DEFAULT_MISSION_SOURCES,
  modelFooter,
}) {
  const scrollRef = useRef(null);
  const lastSectionRef = useRef(null);
  const {
    activeSectionId,
    setActiveSectionId,
    setUserCameraActive,
    registerScrollRoot,
    scrollToSection,
    fireTrigger,
  } = useDeepDive();

  useEffect(() => {
    registerScrollRoot(scrollRef.current);
  }, [registerScrollRoot]);

  useEffect(() => {
    lastSectionRef.current = activeSectionId;
  }, [activeSectionId]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;

    const nodes = [...root.querySelectorAll("[data-section-id]")];
    let rafId = 0;

    const syncFromScroll = () => {
      rafId = 0;
      const id = pickActiveSectionId(root, nodes);
      if (!id || id === lastSectionRef.current) return;
      lastSectionRef.current = id;
      setUserCameraActive(false);
      setActiveSectionId(id);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(syncFromScroll);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    syncFromScroll();

    return () => {
      root.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [sections, setActiveSectionId, setUserCameraActive]);

  const activeIdx = Math.max(0, sections.findIndex((s) => s.id === activeSectionId));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className="mission-progress shrink-0" aria-label="Chapter progress">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`mission-progress-dot${i === activeIdx ? " is-active" : ""}${i < activeIdx ? " is-done" : ""}`}
            aria-label={`Chapter ${s.chapter}`}
            onClick={() => scrollToSection(s.id)}
          />
        ))}
      </nav>

      <div ref={scrollRef} className="mission-scroll">
        {sections.map((section) => (
          <SectionArticle
            key={section.id}
            section={section}
            onTrigger={fireTrigger}
            missionSources={missionSources}
          />
        ))}

        <p className="mission-model-footer">
          {modelFooter ??
            "3D model: NASA / JPL-Caltech. Camera positions are for storytelling, not exact measurements."}
        </p>

        <section className="mission-documentation" aria-labelledby="mission-docs-title">
          <h4 id="mission-docs-title">Mission documentation / official sources</h4>
          <div className="mission-sources-inline">
            {missionSources.map((src) => (
              <a
                key={src.code}
                className="mission-source-link"
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                SOURCE {src.code} / {src.label} ↗
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
