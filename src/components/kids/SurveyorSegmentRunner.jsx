"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Surveyor3 from "@/components/kids/Surveyor3";
import SurveyorGame from "@/components/kids/SurveyorGame";
import MediaPanel from "@/components/kids/MediaPanel";
import SegmentQuestion from "@/components/kids/SegmentQuestion";
import { useRadioAudio } from "@/hooks/useRadioAudio";
import { useKidsProgress } from "@/context/KidsProgressContext";
import { STORY_CLIPS, QUIZ_AUDIO } from "@/data/kids/surveyor3Playback";
import { SURVEYOR3_AUDIO } from "@/data/kids/surveyor3Audio";
import { useDeepDive } from "@/components/deepdive/DeepDiveContext";

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

function WaveBars({ level, active }) {
  return (
    <div className="s3-comms-wave" aria-hidden={!active}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            transform: `scaleY(${active ? 0.35 + level * (0.5 + i * 0.12) : 0.2})`,
          }}
        />
      ))}
    </div>
  );
}

export default function SurveyorSegmentRunner({
  machine,
  onExit,
  onCompleteCelebration,
}) {
  const reduceMotion = useReducedMotion();
  const { ready, segmentIndex, setSegmentIndex, completedSegments, markSegmentComplete, saveAnswer } =
    useKidsProgress();
  const radio = useRadioAudio();
  const { playClip, speakRadio, pauseClip, resumeClip, stopRadio } = radio;
  const { open: openDeepDive, registerOnClose, isOpen: archiveOpen } = useDeepDive();
  const [paused, setPaused] = useState(false);
  const [archivePaused, setArchivePaused] = useState(false);
  const [phase, setPhase] = useState("lines");
  const [lineCursor, setLineCursor] = useState(0);
  const [followLine, setFollowLine] = useState("");

  const segments = machine.segments;
  const segment = segments[segmentIndex] ?? null;
  const atInvite = phase === "invite" || phase === "game" || !segment;
  const currentLine = segment?.lines?.[lineCursor] ?? null;
  const media = phase === "lines" || phase === "follow" ? currentLine?.media ?? null : null;

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const pausedBeforeArchive = useRef(false);

  useEffect(() => {
    registerOnClose(() => {
      setArchivePaused(false);
      if (!pausedBeforeArchive.current) {
        setPaused(false);
        radio.resumeClip();
      }
    });
  }, [registerOnClose, radio]);

  const showReadMore =
    phase === "lines" || phase === "question" || phase === "follow" || phase === "ready";

  const onReadMore = () => {
    pausedBeforeArchive.current = paused;
    setArchivePaused(true);
    setPaused(true);
    radio.pauseClip();
    openDeepDive("surveyor-3");
  };

  const storyRun = useRef(0);
  const quizStarted = useRef("");

  useEffect(() => {
    if (!ready || phase !== "lines" || !segment || paused || archivePaused) return undefined;
    const blocks = STORY_CLIPS[segment.id];
    if (!blocks?.length) return undefined;

    const run = ++storyRun.current;
    let cancelled = false;
    setLineCursor(0);

    (async () => {
      let lineOffset = 0;
      for (const block of blocks) {
        if (cancelled || run !== storyRun.current) return;
        await playClip(block.src, {
          lineCount: block.lineCount,
          onLineIndex: (local) => setLineCursor(lineOffset + local),
        });
        lineOffset += block.lineCount;
      }
      if (!cancelled && run === storyRun.current && phaseRef.current === "lines") {
        setPhase("question");
      }
    })();

    return () => {
      cancelled = true;
      stopRadio();
    };
  }, [ready, segment?.id, phase, paused, archivePaused, playClip, stopRadio]);

  useEffect(() => {
    if (paused) pauseClip();
    else resumeClip();
  }, [paused, pauseClip, resumeClip]);

  useEffect(() => {
    if (phase !== "question") quizStarted.current = "";
  }, [phase]);

  useEffect(() => {
    if (!ready || phase !== "question" || !segment || paused || archivePaused) return undefined;
    if (quizStarted.current === segment.id) return undefined;
    const src = QUIZ_AUDIO[segment.id];
    if (!src) return undefined;
    quizStarted.current = segment.id;
    void playClip(src);
  }, [ready, phase, segment?.id, paused, archivePaused, playClip]);

  useEffect(() => {
    if (!ready || phase !== "follow" || !followLine || paused) return undefined;
    let cancelled = false;
    (async () => {
      await speakRadio(followLine);
      if (!cancelled && phaseRef.current === "follow") setPhase("ready");
    })();
    return () => {
      cancelled = true;
      stopRadio();
    };
  }, [ready, phase, followLine, paused, speakRadio, stopRadio]);

  const invitePlayed = useRef(false);
  useEffect(() => {
    if (phase !== "invite") invitePlayed.current = false;
  }, [phase]);
  useEffect(() => {
    if (phase !== "invite" || paused || invitePlayed.current) return undefined;
    invitePlayed.current = true;
    void playClip(SURVEYOR3_AUDIO.story.invite);
    return () => stopRadio();
  }, [phase, paused, playClip, stopRadio]);

  const finishSegment = useCallback(() => {
    if (segment && !completedSegments.includes(segment.id)) {
      markSegmentComplete(segment.id, 1);
    }
    setPhase("ready");
  }, [segment, completedSegments, markSegmentComplete]);

  const onQuestionSolved = ({ line } = {}) => {
    saveAnswer(`${segment.id}:q`, { solved: true });
    if (segment && !completedSegments.includes(segment.id)) {
      markSegmentComplete(segment.id, 1);
    }
    const spoken = line || segment?.question?.explanation || "";
    if (spoken) {
      setFollowLine(spoken);
      setPhase("follow");
      return;
    }
    finishSegment();
  };

  const goNextChapter = () => {
    setPaused(false);
    stopRadio();
    if (segmentIndex >= segments.length - 1) {
      setPhase("invite");
      return;
    }
    setLineCursor(0);
    setFollowLine("");
    setSegmentIndex(segmentIndex + 1);
    setPhase("lines");
  };

  const goPrevChapter = () => {
    setPaused(false);
    stopRadio();
    if (phase === "invite") {
      setSegmentIndex(segments.length - 1);
      setLineCursor(0);
      setPhase("ready");
      return;
    }
    if (segmentIndex <= 0) return;
    setLineCursor(0);
    setFollowLine("");
    setSegmentIndex(segmentIndex - 1);
    setPhase("lines");
  };

  const skipVoice = () => {
    storyRun.current += 1;
    setPaused(false);
    stopRadio();
    if (phase === "lines") setPhase("question");
    if (phase === "follow") finishSegment();
  };

  const advance = () => {
    stopRadio();
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

  const togglePause = () => {
    if (paused) {
      setPaused(false);
      radio.resumeClip();
    } else {
      setPaused(true);
      radio.pauseClip();
    }
  };

  const toggleComms = () => {
    radio.setCommsOn((v) => !v);
    if (radio.commsOn) stopRadio();
  };

  const playGameLabel =
    typeof machine.playGameLabel === "string" ? machine.playGameLabel : "Play the crater game";

  const goToGame = () => {
    setPaused(false);
    stopRadio();
    storyRun.current += 1;
    setPhase("game");
  };

  const mood =
    phase === "question" ? "curious" : phase === "follow" ? "happy" : currentLine?.mood || "happy";
  const pose = phase === "lines" || phase === "follow" ? currentLine?.pose || null : null;
  const highlight = phase === "lines" || phase === "follow" ? currentLine?.highlight ?? null : null;
  const spokenLine = phase === "lines" && currentLine ? currentLine.text : null;

  if (phase === "game") {
    return (
      <motion.div
        className="kids-story-layer kids-story-layer--game"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <SurveyorGame onExit={onExit} onCompleteCelebration={onCompleteCelebration} />
      </motion.div>
    );
  }

  return (
    <div className="kids-seg kids-seg--on-mars kids-seg--on-moon">
      <div className="kids-mars-fade" aria-hidden="true" />

      {!archiveOpen ? (
      <header className="kids-seg-top">
        <button type="button" className="kids-icon-btn" onClick={onExit} aria-label="Back to Moon map">
          ← Moon
        </button>

        <div className="kids-dots" role="list" aria-label="Chapter progress">
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
          {showReadMore ? (
            <button type="button" className="kids-btn kids-btn-ghost kids-read-more" onClick={onReadMore}>
              Read more
            </button>
          ) : null}
          <button
            type="button"
            className="kids-nav-icon"
            onClick={goToGame}
            aria-label={playGameLabel}
            title={playGameLabel}
          >
            <GameMark />
          </button>
          <button
            type="button"
            className={`s3-comms-toggle s3-comms-toggle--mars-bar${radio.commsOn ? " is-on" : ""}`}
            onClick={toggleComms}
            aria-pressed={radio.commsOn}
            aria-label={radio.commsOn ? "Mute Surveyor" : "Unmute Surveyor"}
          >
            COMMS
            <WaveBars level={radio.waveLevel} active={radio.talking && radio.commsOn} />
          </button>
          <button
            type="button"
            className={`kids-nav-icon${paused ? " is-on" : ""}`}
            aria-pressed={paused}
            aria-label={paused ? "Play Surveyor" : "Pause Surveyor"}
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
              🌙
            </p>
            <h2>{machine.inviteTitle}</h2>
            <p>{machine.inviteBody}</p>
            <div className="kids-invite-actions">
              <button type="button" className="kids-btn kids-btn-primary" onClick={() => setPhase("game")}>
                {machine.inviteYes}
              </button>
              <button type="button" className="kids-btn kids-btn-ghost" onClick={onExit}>
                {machine.inviteNo}
              </button>
            </div>
          </motion.div>
        ) : segment ? (
          <motion.div
            key={segment.id}
            className="kids-seg-main kids-seg-main--mars"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <p className="kids-mars-nametag">
              {segment.title}
              <span className="s3-companion-tag"> · Apollo 12 (Intrepid) — same mission</span>
            </p>

            <div
              className={`kids-seg-stage kids-seg-stage--mars kids-seg-stage--moon${media ? " has-media" : " is-solo"}${
                phase === "question" || phase === "follow" ? " is-quiz" : ""
              }`}
            >
              <div className="kids-seg-opp">
                <Surveyor3
                  talking={radio.talking && !paused}
                  mood={mood}
                  pose={pose}
                  highlight={highlight}
                  waveLevel={radio.waveLevel}
                  followPointer
                  size="100%"
                />
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
                  variant="moon"
                  question={segment.question}
                  onSaveAnswer={(val) => saveAnswer(`${segment.id}:q`, val)}
                  onSolved={onQuestionSolved}
                />
              )}

              {phase === "ready" && (
                <p className="kids-mars-line kids-mars-line--soft">Nice work. Tap Next when you are ready.</p>
              )}

              <div className="kids-runner-footer kids-runner-footer--mars">
                {segmentIndex > 0 || phase === "invite" ? (
                  <button type="button" className="kids-nav-icon" onClick={goPrevChapter} aria-label="Previous chapter">
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
                  aria-label="Next"
                >
                  <NextMark />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
