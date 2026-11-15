"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Opportunity from "@/components/kids/Opportunity";
import Ingenuity from "@/components/kids/Ingenuity";
import Viking from "@/components/kids/Viking";
import MediaPanel from "@/components/kids/MediaPanel";
import SegmentQuestion from "@/components/kids/SegmentQuestion";
import MissionGame from "@/components/kids/MissionGame";
import { useKidsVoice } from "@/hooks/useKidsVoice";
import { useKidsProgress } from "@/context/KidsProgressContext";
import { useDeepDive } from "@/components/deepdive/DeepDiveContext";
import { MODEL_URL } from "@/components/deepdive/RoverModel";
import { INGENUITY_MODEL_URL } from "@/components/deepdive/IngenuityArchiveModel";
import { useGLTF } from "@react-three/drei";
import { t } from "@/data/kids/text";
import { useProgress } from "@/store/progress";

function Mark({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

function SkipMark() {
  return (
    <Mark>
      <path d="M6 6.5v11l8.5-5.5L6 6.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M17 6.2v11.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </Mark>
  );
}

function PrevMark() {
  return (
    <Mark>
      <path d="M7 6.2v11.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 6.5v11L9.5 12 18 6.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Mark>
  );
}

function NextMark() {
  return (
    <Mark>
      <path d="M7 6.5 13.2 12 7 17.5V6.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 6.5 19.2 12 13 17.5V6.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Mark>
  );
}

function PauseMark() {
  return (
    <Mark>
      <path d="M7.5 5.5h3.2v13H7.5zM13.3 5.5h3.2v13h-3.2z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Mark>
  );
}

function PlayMark() {
  return (
    <Mark>
      <path d="M8 5.8v12.4L18.2 12 8 5.8Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Mark>
  );
}

function GameMark() {
  return (
    <Mark>
      <path
        d="M7.5 9.5h9a3 3 0 0 1 3 3v3.5a2.5 2.5 0 0 1-2.5 2.5H7.5A2.5 2.5 0 0 1 5 16V12.5a3 3 0 0 1 3-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 12h.01M11.5 11.5v3M16 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8.5V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Mark>
  );
}

export default function SegmentRunner({ machine, onExit }) {
  const reduceMotion = useReducedMotion();
  const { completeMachine } = useProgress();
  const {
    ready,
    segmentIndex,
    setSegmentIndex,
    completedSegments,
    markSegmentComplete,
    saveAnswer,
  } = useKidsProgress();

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [phase, setPhase] = useState("lines");
  const [lineCursor, setLineCursor] = useState(0);
  const [media, setMedia] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [deepDivePaused, setDeepDivePaused] = useState(false);
  const [skipGameIntro, setSkipGameIntro] = useState(false);
  const pendingStars = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const { open: openDeepDive, registerOnClose, isOpen: archiveOpen } = useDeepDive();

  const segments = machine.segments;
  const segment = segments[segmentIndex] ?? null;
  const atInvite = phase === "invite" || phase === "mission" || !segment;

  const onLineStart = useCallback((line) => {
    if (line.media) setMedia(line.media);
    else if (lineCursor === 0) setMedia(null);
    setHighlight(line.highlight ?? null);
  }, [lineCursor]);

  const voice = useKidsVoice({
    readAloud: true,
    muted: machine.id === "viking-1" ? muted : false,
    onLineStart,
  });
  const handbackRef = useRef(false);
  const lineCursorRef = useRef(lineCursor);
  const segmentIndexRef = useRef(segmentIndex);
  lineCursorRef.current = lineCursor;
  segmentIndexRef.current = segmentIndex;

  useEffect(() => {
    registerOnClose(() => {
      const stayPaused = voice.wasOverlayPaused();
      handbackRef.current = true;
      if (stayPaused) setPaused(true);
      setDeepDivePaused(false);
      void voice.resumePlayback().then((ok) => {
        if (!ok) return;
        if (phaseRef.current === "follow") {
          finishSegment(pendingStars.current);
          return;
        }
        if (phaseRef.current !== "lines") return;
        const seg = segments[segmentIndexRef.current];
        if (!seg) return;
        if (lineCursorRef.current < seg.lines.length - 1) setLineCursor((c) => c + 1);
        else setPhase("question");
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerOnClose]);

  useEffect(() => {
    if (!ready || phase !== "lines" || !segment || deepDivePaused) return undefined;
    if (handbackRef.current) {
      handbackRef.current = false;
      return undefined;
    }
    const line = segment.lines[lineCursor];
    if (!line) {
      setPhase("question");
      return undefined;
    }

    let cancelled = false;
    pendingStars.current = 0;

    (async () => {
      const finished = await voice.playLines([line]);
      if (!cancelled && finished) {
        if (lineCursor < segment.lines.length - 1) setLineCursor((c) => c + 1);
        else setPhase("question");
      }
    })();

    return () => {
      cancelled = true;
      voice.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, segment?.id, phase, lineCursor, deepDivePaused]);

  const finishSegment = (extraStars = pendingStars.current) => {
    if (segment && !completedSegments.includes(segment.id)) {
      markSegmentComplete(segment.id, extraStars);
    } else if (segment && extraStars) {
      markSegmentComplete(segment.id, extraStars);
    }
    pendingStars.current = 0;
    setPhase("ready");
  };

  const togglePause = () => {
    if (paused) {
      voice.releasePlayback();
      setPaused(false);
    } else {
      voice.holdPlayback();
      setPaused(true);
    }
  };

  const toggleMute = () => {
    setMuted((on) => {
      if (!on) voice.holdPlayback();
      else voice.releasePlayback();
      return !on;
    });
  };

  const replayLine = () => {
    if (phase !== "lines" && phase !== "follow") return;
    const line =
      phase === "follow"
        ? segment?.reveal?.lines?.[0] ?? segment?.wrongReveal?.lines?.[0]
        : segment?.lines?.[lineCursor];
    if (!line) return;
    voice.stop();
    void voice.playLines([line]);
  };

  const skipVoice = () => {
    setPaused(false);
    voice.stop();
    if (phase === "lines") setPhase("question");
    if (phase === "follow") finishSegment();
  };

  const onQuestionSolved = ({ revealed = false, line }) => {
    pendingStars.current = 0;
    saveAnswer(`${segment.id}:q`, { solved: true, revealed });

    const scriptLine = revealed
      ? segment.wrongReveal?.lines?.[0]
      : segment.reveal?.lines?.[0];
    const spoken = line
      ? [{ ...(scriptLine || {}), id: scriptLine?.id || "follow", text: line }]
      : null;

    if (spoken) {
      if (scriptLine?.media) {
        setMedia(scriptLine.media);
        setHighlight(scriptLine.highlight ?? null);
      }
      setPhase("follow");
      (async () => {
        const ok = await voice.playLines(spoken);
        if (ok) finishSegment(0);
      })();
      return;
    }
    finishSegment(0);
  };

  const goNextChapter = () => {
    setPaused(false);
    voice.stop();
    if (segmentIndex >= segments.length - 1) {
      setPhase("invite");
      return;
    }
    setLineCursor(0);
    setSegmentIndex(segmentIndex + 1);
    setPhase("lines");
  };

  const goPrevChapter = () => {
    setPaused(false);
    voice.stop();
    if (phase === "invite") {
      setSegmentIndex(segments.length - 1);
      setLineCursor(0);
      setPhase("ready");
      return;
    }
    if (segmentIndex <= 0) return;
    setLineCursor(0);
    setSegmentIndex(segmentIndex - 1);
    setPhase("lines");
  };

  const advance = () => {
    voice.stop();
    if (phase === "ready") {
      goNextChapter();
      return;
    }
    if (phase === "follow") {
      finishSegment();
      return;
    }
    if (phase === "lines" && segment) {
      if (lineCursor < segment.lines.length - 1) setLineCursor((c) => c + 1);
      else setPhase("question");
    }
  };

  const mood =
    phase === "question"
      ? "curious"
      : voice.currentLine?.mood || "happy";
  const pose =
    phase === "lines" || phase === "follow" ? voice.currentLine?.pose || null : null;
  const spokenLine =
    phase === "lines" &&
    voice.currentLine &&
    (voice.active || voice.held)
      ? t(voice.currentLine.text)
      : null;

  const isOpp = machine.id === "opportunity";
  const isGinny = machine.id === "ingenuity";
  const showReadMore =
    (isOpp || isGinny) && (phase === "lines" || phase === "follow" || phase === "question");

  const onReadMore = () => {
    openDeepDive(isGinny ? "ingenuity" : "opportunity");
    setDeepDivePaused(true);
    voice.pausePlayback();
  };

  useEffect(() => {
    if (!showReadMore) return;
    useGLTF.preload(isGinny ? INGENUITY_MODEL_URL : MODEL_URL);
  }, [showReadMore, isGinny]);

  const Character =
    machine.id === "ingenuity" ? Ingenuity : machine.id === "viking-1" ? Viking : Opportunity;
  const hasMiniGame = machine.id === "opportunity" || machine.id === "ingenuity";
  const playGameLabel = t(machine.playGameLabel) || "Play the mini-game";

  const goToGame = () => {
    voice.pausePlayback();
    setPaused(true);
    setSkipGameIntro(true);
    setPhase("mission");
  };

  useEffect(() => {
    if (phase === "invite" && machine.id === "viking-1") {
      completeMachine(machine.id);
    }
  }, [phase, machine.id, completeMachine]);

  if (phase === "mission") {
    if (machine.id === "viking-1") {
      return (
        <div className="kids-mode">
          <div className="kids-end-card kids-mars-card">
            <p className="kids-end-emoji" aria-hidden="true">
              🛰️
            </p>
            <h2>{t(machine.missionControlTitle)}</h2>
            <p>{t(machine.missionControlBody)}</p>
            <button type="button" className="kids-btn kids-btn-primary" onClick={onExit}>
              {t(machine.missionControlBack)}
            </button>
          </div>
        </div>
      );
    }
    if (machine.id === "opportunity" || machine.id === "ingenuity") {
      return (
        <MissionGame
          machineId={machine.id}
          onExit={onExit}
          onBackToStory={
            machine.id === "ingenuity"
              ? () => {
                  setSkipGameIntro(false);
                  setPhase("invite");
                }
              : undefined
          }
        />
      );
    }
    return <MissionGame machineId={machine.id} onExit={onExit} />;
  }

  return (
    <div className="kids-seg kids-seg--on-mars">
      <div className="kids-mars-fade" aria-hidden="true" />

      {!archiveOpen ? (
        <header className="kids-seg-top">
          <button
            type="button"
            className="kids-icon-btn"
            onClick={onExit}
            aria-label="Back to Mars map"
          >
            ← Mars
          </button>

          <div className="kids-dots" role="list" aria-label="Segment progress">
            {segments.map((s, i) => (
              <span
                key={s.id}
                role="listitem"
                className={`kids-dot${i === segmentIndex && !atInvite ? " is-current" : ""}${
                  completedSegments.includes(s.id) || i < segmentIndex ? " is-done" : ""
                }`}
              />
            ))}
          </div>

          <div className="kids-top-actions">
            {hasMiniGame ? (
              <button
                type="button"
                className="kids-nav-icon"
                onClick={goToGame}
                aria-label={playGameLabel}
                title={playGameLabel}
              >
                <GameMark />
              </button>
            ) : null}
            {showReadMore ? (
              <button
                type="button"
                className="kids-btn kids-btn-ghost kids-read-more"
                onClick={onReadMore}
              >
                Read more
              </button>
            ) : null}
            {machine.id === "viking-1" ? (
              <>
                <button
                  type="button"
                  className={`kids-icon-btn${muted ? " is-on" : ""}`}
                  aria-pressed={muted}
                  aria-label={muted ? "Unmute narration" : "Mute narration"}
                  onClick={toggleMute}
                >
                  {muted ? "🔇" : "🔊"}
                </button>
                <button
                  type="button"
                  className="kids-icon-btn"
                  aria-label="Replay this line"
                  disabled={phase !== "lines" && phase !== "follow"}
                  onClick={replayLine}
                >
                  ↺
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={`kids-nav-icon${paused ? " is-on" : ""}`}
              aria-pressed={paused}
              aria-label={paused ? "Play Opp" : "Pause Opp"}
              onClick={togglePause}
            >
              {paused ? <PlayMark /> : <PauseMark />}
            </button>
          </div>
        </header>
      ) : null}

      <AnimatePresence mode="wait">
        {phase === "invite" ? (
          <motion.div
            key="invite"
            className="kids-end-card kids-mars-card"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="kids-end-emoji" aria-hidden="true">
              🚀
            </p>
            <h2>{t(machine.inviteTitle)}</h2>
            <div className="kids-invite-actions">
              {hasMiniGame ? (
                <button
                  type="button"
                  className="kids-nav-icon kids-invite-game-btn"
                  onClick={goToGame}
                  aria-label={playGameLabel}
                  title={playGameLabel}
                >
                  <GameMark />
                </button>
              ) : null}
              <button
                type="button"
                className="kids-btn kids-btn-primary"
                onClick={() => {
                  setSkipGameIntro(true);
                  setPhase("mission");
                }}
              >
                {t(machine.inviteYes)}
              </button>
              <button type="button" className="kids-btn kids-btn-ghost" onClick={onExit}>
                {t(machine.inviteNo)}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={segment.id}
            className="kids-seg-main kids-seg-main--mars"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            {!spokenLine ? (
              <p className="kids-mars-nametag">{t(segment.title)}</p>
            ) : null}

            <div
              className={`kids-seg-stage kids-seg-stage--mars${
                media ? " has-media" : " is-solo"
              }`}
            >
              <div className="kids-seg-opp">
                {!archiveOpen ? (
                  <Character
                    talking={voice.speaking}
                    mood={mood}
                    pose={pose}
                    highlight={phase === "lines" || phase === "follow" ? highlight : null}
                    size="100%"
                  />
                ) : null}
              </div>
              {media ? <MediaPanel media={media} /> : null}
            </div>

            <div className="kids-mars-panel">
              {spokenLine ? (
                <p className="kids-mars-line" aria-live="polite">
                  {spokenLine}
                </p>
              ) : null}

              {(phase === "question" || phase === "follow") && (
                <SegmentQuestion
                  key={segment.id}
                  question={segment.question}
                  onSaveAnswer={(val) => saveAnswer(`${segment.id}:q`, val)}
                  onSolved={onQuestionSolved}
                />
              )}

              {phase === "ready" && (
                <p className="kids-mars-line kids-mars-line--soft">
                  {t({ en: "Nice work! Tap Next when you are ready." })}
                </p>
              )}

              <div className="kids-runner-footer kids-runner-footer--mars">
                {segmentIndex > 0 ? (
                  <button
                    type="button"
                    className="kids-nav-icon"
                    onClick={goPrevChapter}
                    aria-label="Previous chapter"
                  >
                    <PrevMark />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="kids-nav-icon"
                  onClick={skipVoice}
                  disabled={phase !== "lines" && phase !== "follow"}
                  aria-label="Skip"
                >
                  <SkipMark />
                </button>
                <button
                  type="button"
                  className="kids-nav-icon"
                  disabled={phase !== "lines" && phase !== "follow" && phase !== "ready"}
                  onClick={advance}
                  aria-label="Next chapter"
                >
                  <NextMark />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
