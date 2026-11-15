"use client";
// MissionGame.jsx v2: Kids mode game for Opportunity.
// Build Opp (quiz per part) -> launch -> analyze photos (pins + fill the blanks)
// -> evidence board -> claim -> challenge -> sign -> printable letter to Opp.
// All content lives in src/data/missionGame.js. No AI: tiles are checked against the data.

import { useCallback, useEffect, useRef, useState } from "react";
import Opportunity, { PARTS as OPP_PARTS, PartIcon as OppPartIcon } from "./Opportunity";
import Ingenuity, { PARTS as ING_PARTS, PartIcon as IngPartIcon } from "./Ingenuity";
import {
  COMPANION as OPP_COMPANION,
  BUILD as OPP_BUILD,
  LAUNCH,
  LOOK_PINS,
  LOOK_PROMPT,
  MISSIONS,
  BOARD,
  CLAIM,
  CHALLENGE,
  SIGN,
  LETTER,
  UI as OPP_UI,
} from "../../data/missionGame";
import {
  COMPANION as ING_COMPANION,
  BUILD as ING_BUILD,
  UI as ING_UI,
} from "../../data/ingenuityBuildGame";
import { useProgress } from "@/state/progress";
import { useSpaceAudio } from "@/hooks/useSpaceAudio";

const FONT = '"Baloo 2", "Nunito", ui-rounded, system-ui, sans-serif';
const T = { sky: "#0e1a38", navy: "#1d3f78", cream: "#fffaf3", gold: "#f0c14a", ink: "#3a2a24", bad: "#e0603f" };

const MACHINE_BUILD = {
  opportunity: {
    Character: Opportunity,
    PARTS: OPP_PARTS,
    PartIcon: OppPartIcon,
    BUILD: OPP_BUILD,
    COMPANION: OPP_COMPANION,
    UI: OPP_UI,
    trayOrder: ["camera", "wheels", "antenna", "arm", "panels"],
    slotAt: { arm: [102, 252], wheels: [98, 304] },
    canvas: { w: 400, h: 340 },
  },
  ingenuity: {
    Character: Ingenuity,
    PARTS: ING_PARTS,
    PartIcon: IngPartIcon,
    BUILD: ING_BUILD,
    COMPANION: ING_COMPANION,
    UI: ING_UI,
    trayOrder: ["blades", "solar", "antenna", "avionics", "sensors", "batteries", "legs"],
    slotAt: { sensors: [192, 208], batteries: [118, 238] },
    canvas: { w: 400, h: 340 },
  },
};

const STEPS = [
  ...MISSIONS.flatMap((m) => [
    { kind: "look", m, intro: m.lookIntro },
    { kind: "explain", m, intro: m.explainIntro },
  ]),
  { kind: "board", intro: BOARD.intro },
  { kind: "claim", intro: CLAIM.intro },
  { kind: "challenge", intro: CHALLENGE.intro },
  { kind: "sign", intro: SIGN.intro },
];

// ---------- shared bits ----------
const reveal = (el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest" });

function useSpeaker(initial = "") {
  const [text, setText] = useState(initial);
  const [talking, setTalking] = useState(false);
  const timer = useRef();
  const say = useCallback((t) => {
    clearTimeout(timer.current);
    setText(t);
    setTalking(true);
    timer.current = setTimeout(() => setTalking(false), Math.min(4500, 600 + t.length * 45));
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { text, talking, say };
}

function Companion({ text, companion }) {
  const listen = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };
  return (
    <div className="flex items-start gap-3">
      <div
        className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full text-xl font-bold"
        style={{ background: T.gold, color: T.ink, border: `3px solid ${T.ink}` }}
      >
        {companion.image ? <img src={companion.image} alt={companion.name} className="h-full w-full object-cover" /> : companion.name[0]}
      </div>
      <div className="rounded-2xl px-4 py-3" style={{ background: T.cream, color: T.ink }}>
        <p aria-live="polite" className="text-lg leading-snug">{text}</p>
        <button type="button" onClick={listen} className="mt-1 text-sm font-bold underline underline-offset-4" aria-label="Read this out loud">
          Listen
        </button>
      </div>
    </div>
  );
}

function BigButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl px-6 py-4 text-xl font-bold transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:opacity-50"
      style={{ background: T.gold, color: T.ink, border: `3px solid ${T.ink}`, outlineColor: T.cream }}
    >
      {children}
    </button>
  );
}

function Notebook({ notes, large = false }) {
  return (
    <aside
      className={`rounded-2xl p-5 ${large ? "" : "md:sticky md:top-4"}`}
      style={{ background: `repeating-linear-gradient(${T.cream} 0 35px, #dcd3c4 35px 36px)`, color: T.ink, border: `3px solid ${T.ink}` }}
    >
      <h3 className="mb-2 text-xl font-bold">{OPP_UI.notebookTitle}</h3>
      {notes.length === 0 ? (
        <p className="text-base opacity-70">{OPP_UI.notebookEmpty}</p>
      ) : (
        <ul className="grid gap-2">
          {notes.map((n, k) => (
            <li key={k} className="flex items-start gap-2 text-lg leading-tight">
              <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: T.gold, border: `2px solid ${T.ink}` }}>✓</span>
              {n}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function Options({ options, onPick, tried, solved }) {
  return (
    <div className="grid gap-3">
      {options.map((o) => {
        const wrongTried = tried.includes(o.id);
        const right = solved && o.correct;
        return (
          <button
            key={o.id}
            type="button"
            disabled={solved || wrongTried}
            onClick={() => onPick(o)}
            className="rounded-2xl px-5 py-4 text-left text-lg font-semibold transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:cursor-default"
            style={{ background: right ? "#d7f2c4" : T.cream, color: T.ink, border: `3px solid ${right ? "#3f8f2a" : T.ink}`, opacity: wrongTried ? 0.45 : 1, outlineColor: T.gold }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// multiple-choice question: 1st wrong = hint, 2nd wrong = answer shown (logged for the teacher)
function Quiz({ q, options, hint, right, say, log, label, onSolved }) {
  const [tried, setTried] = useState([]);
  const [solved, setSolved] = useState(false);
  const pick = (o) => {
    if (solved) return;
    if (o.correct) {
      setSolved(true);
      say(right);
      return onSolved?.();
    }
    const t = [...tried, o.id];
    setTried(t);
    log.hint();
    if (t.length >= 2) {
      setSolved(true);
      log.help(label);
      say(`Good tries! ${right}`);
      onSolved?.();
    } else say(hint);
  };
  return (
    <div className="grid gap-3">
      <h2 className="text-2xl font-bold">{q}</h2>
      <Options options={options} onPick={pick} tried={tried} solved={solved} />
    </div>
  );
}

// fill-the-blank sentence built from tiles
function BlankSentence({ spec, say, log, label, onDone }) {
  const pieces = spec.template.split(/\{(\d)\}/); // odd entries are blank numbers
  const [vals, setVals] = useState(spec.blanks.map(() => null));
  const [bad, setBad] = useState([]);
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(false);

  const fill = (word) => {
    const k = vals.indexOf(null);
    if (done || k === -1) return;
    setVals(vals.map((v, j) => (j === k ? word : v)));
    setBad([]);
  };
  const clear = (k) => {
    if (done) return;
    setVals(vals.map((v, j) => (j === k ? null : v)));
    setBad([]);
  };
  const finish = (revealed, values) => {
    setDone(true);
    say(`${revealed ? "Good tries! Here is the answer. " : "Yes! "}${spec.fact}`);
    onDone(pieces.map((p, i) => (i % 2 ? values[Number(p)] : p)).join(""));
  };
  const check = () => {
    const wrong = spec.blanks.map((_, k) => k).filter((k) => !spec.blanks[k].answers.includes(vals[k]));
    if (!wrong.length) return finish(false, vals);
    log.hint();
    const f = fails + 1;
    setFails(f);
    setBad(wrong);
    if (f >= 2) {
      const fixed = vals.map((v, k) => (wrong.includes(k) ? null : v));
      spec.blanks.forEach((b, k) => {
        if (fixed[k] === null) fixed[k] = b.answers.find((a) => !fixed.includes(a));
      });
      setVals(fixed);
      setBad([]);
      log.help(label);
      finish(true, fixed);
    } else say(spec.blanks[wrong[0]].hint);
  };

  return (
    <div className="grid gap-4">
      <p className="text-2xl leading-[2.8rem]">
        {pieces.map((p, i) =>
          i % 2 === 0 ? (
            <span key={i}>{p}</span>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => clear(Number(p))}
              aria-label={vals[Number(p)] ? `${vals[Number(p)]}. Tap to remove` : "Empty blank"}
              className="mx-1 inline-block min-w-[7rem] rounded-xl border-4 px-3 py-0.5 text-center align-middle font-bold"
              style={{
                borderStyle: vals[Number(p)] ? "solid" : "dashed",
                borderColor: bad.includes(Number(p)) ? T.bad : T.gold,
                background: vals[Number(p)] ? T.cream : "transparent",
                color: T.ink,
              }}
            >
              {vals[Number(p)] || "\u00a0"}
            </button>
          )
        )}
      </p>
      {!done && (
        <>
          <div className="flex flex-wrap gap-3">
            {spec.bank.filter((w) => !vals.includes(w)).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => fill(w)}
                className="rounded-2xl px-4 py-3 text-lg font-bold transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-4"
                style={{ background: T.cream, color: T.ink, border: `3px solid ${T.ink}`, outlineColor: T.gold }}
              >
                {w}
              </button>
            ))}
          </div>
          <div>
            <BigButton onClick={check} disabled={vals.includes(null)}>Check my sentence</BigButton>
          </div>
        </>
      )}
    </div>
  );
}

// photo with optional pins (tap to drop a pin)
function Photo({ src, alt, credit, pins = [], onPin, fit }) {
  const [bad, setBad] = useState(false);
  const click = (e) => {
    if (!onPin) return;
    const r = e.currentTarget.getBoundingClientRect();
    onPin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  return (
    <figure
      className="w-full max-w-2xl overflow-hidden rounded-2xl"
      style={{ background: "#00000055", ...(fit ? { maxWidth: `max(16rem, min(42rem, calc((100vh - ${fit}px) * 16 / 9)))` } : {}) }}
    >
      <div onClick={click} className={`relative ${onPin ? "cursor-crosshair" : ""}`}>
        {bad ? (
          <div className="grid aspect-video place-items-center p-4 text-center text-base opacity-80">Photo coming soon: put it at {src}</div>
        ) : (
          <img src={src} alt={alt} onError={() => setBad(true)} className="aspect-video w-full object-cover" />
        )}
        {pins.map((p, k) => (
          <span
            key={k}
            aria-hidden
            className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-bold"
            style={{ left: `${p.x}%`, top: `${p.y}%`, background: T.gold, color: T.ink, border: `3px solid ${T.ink}` }}
          >
            {k + 1}
          </span>
        ))}
      </div>
      <figcaption className="px-3 py-2 text-sm opacity-80">Sent by Opp. Credit: {credit}</figcaption>
    </figure>
  );
}

// ---------- build: place parts + quiz (Opportunity & Ingenuity) ----------
function Build({ log, onDone, config }) {
  const { Character, PARTS, PartIcon, BUILD, COMPANION, trayOrder, slotAt, canvas } = config;
  const canvasW = canvas.w;
  const canvasH = canvas.h;
  const [assembled, setAssembled] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pose, setPose] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [misses, setMisses] = useState(0);
  const { text, talking, say } = useSpeaker(BUILD.intro);

  const missing = trayOrder.filter((id) => !assembled.includes(id));
  const complete = missing.length === 0 && !quiz;
  const labelOf = (id) => PARTS.find((p) => p.id === id).label;

  const place = (slotId) => {
    if (quiz) return;
    if (!selected) return say(BUILD.pickFirst);
    if (selected !== slotId) {
      const m = misses + 1;
      setMisses(m);
      log.hint();
      return say(m === 1 ? BUILD.wrongSlot : BUILD.slotHint[selected]);
    }
    setMisses(0);
    setAssembled([...assembled, slotId]);
    setSelected(null);
    setPose("bounce");
    setTimeout(() => setPose(null), 900);
    setQuiz({ id: slotId, solved: false });
    say(PARTS.find((p) => p.id === slotId).text);
  };
  const cont = () => {
    setQuiz(null);
    say(assembled.length === PARTS.length ? BUILD.done : BUILD.intro);
  };

  return (
    <div className="grid gap-6">
      <Companion text={text} companion={COMPANION} />
      <div className="grid items-center gap-6 md:grid-cols-[1fr_300px]">
        <div className="relative mx-auto w-full max-w-[560px]">
          <Character talking={talking} mood="happy" pose={complete ? "wave" : pose} assembled={assembled} followPointer={false} />
          {missing.map((id) => {
            const [cx, cy] = slotAt[id] || PARTS.find((x) => x.id === id).center;
            const reveal = selected === id && misses >= 3;
            return (
              <button
                key={id}
                type="button"
                aria-label="Empty spot"
                onClick={() => place(id)}
                className={`absolute aspect-square w-[11%] min-w-[44px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed ${selected ? "motion-safe:animate-pulse" : ""}`}
                style={{
                  left: `${(cx / canvasW) * 100}%`,
                  top: `${(cy / canvasH) * 100}%`,
                  borderColor: reveal || selected ? T.gold : "#ffffff77",
                  background: reveal ? "#f0c14a44" : "transparent",
                }}
              />
            );
          })}
        </div>
        <div className="grid gap-4">
          {quiz ? (
            <>
              <Quiz
                key={quiz.id}
                {...BUILD.quiz[quiz.id]}
                say={say}
                log={log}
                label={`Part: ${labelOf(quiz.id)}`}
                onSolved={() => setQuiz((s) => ({ ...s, solved: true }))}
              />
              {quiz.solved && (
                <div ref={reveal}>
                  <BigButton onClick={cont}>{BUILD.nextPart}</BigButton>
                </div>
              )}
            </>
          ) : complete ? (
            <BigButton onClick={onDone}>{BUILD.finishButton}</BigButton>
          ) : (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-2">
              {missing.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelected(id);
                    setMisses(0);
                    say(`This is my ${labelOf(id).toLowerCase()}. Now find its empty spot!`);
                  }}
                  aria-pressed={selected === id}
                  className="grid place-items-center rounded-2xl p-3 focus-visible:outline focus-visible:outline-4"
                  style={{ background: T.cream, border: `4px solid ${selected === id ? T.gold : T.ink}`, outlineColor: T.gold }}
                >
                  <PartIcon part={id} size={84} />
                  <span className="mt-1 text-base font-bold" style={{ color: T.ink }}>
                    {labelOf(id)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- phase 2: launch (placeholder cinematic, replace later) ----------
function Launch({ onDone }) {
  const [step, setStep] = useState(0);
  const total = LAUNCH.stages.length;
  const ready = step >= total;
  const s = LAUNCH.stages[Math.min(step, total - 1)];

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setStep((n) => n + 1), LAUNCH.stages[step].ms);
    return () => clearTimeout(t);
  }, [step, ready]);

  return (
    <div className="grid justify-items-center gap-6 text-center">
      <div className="w-56">
        <Opportunity mood={ready ? "happy" : s.mood} pose={ready ? "wave" : s.pose} followPointer={false} />
      </div>
      <p className="text-4xl font-bold md:text-5xl" aria-live="polite">{ready ? LAUNCH.landed : s.label}</p>
      <div className="w-full max-w-xl">
        <div className="relative h-2 rounded-full" style={{ background: "#ffffff33" }}>
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[2000ms]"
            style={{ left: `${ready ? 100 : s.progress}%`, background: T.gold, border: `3px solid ${T.ink}` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-base"><span>{LAUNCH.earth}</span><span>{LAUNCH.mars}</span></div>
      </div>
      {ready && <BigButton onClick={onDone}>{LAUNCH.button}</BigButton>}
    </div>
  );
}

// ---------- phase 3: mission control steps ----------
function LookStep({ m, pins, setPins, say, onNext }) {
  const addPin = (p) => {
    if (pins.length >= LOOK_PINS) return;
    const next = [...pins, p];
    setPins(next);
    if (next.length === LOOK_PINS) say("Great looking! Press the gold button to continue.");
  };
  return (
    <>
      <h2 className="text-2xl font-bold">{LOOK_PROMPT}</h2>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-lg font-bold">Pins placed: {pins.length} of {LOOK_PINS}</span>
        {pins.length >= LOOK_PINS && <BigButton onClick={() => onNext()}>I looked closely</BigButton>}
        {pins.length > 0 && (
          <button type="button" onClick={() => setPins(pins.slice(0, -1))} className="text-base underline underline-offset-4">Undo last pin</button>
        )}
        <button type="button" onClick={() => onNext()} className="text-base underline underline-offset-4">Skip pins</button>
      </div>
      <Photo src={m.photo} alt={m.alt} credit={m.credit} pins={pins} onPin={addPin} />
    </>
  );
}

function ExplainStep({ m, pins, say, log, onNext }) {
  const [sentence, setSentence] = useState(null);
  return (
    <>
      <Photo src={m.photo} alt={m.alt} credit={m.credit} pins={pins} />
      <BlankSentence spec={m.explain} say={say} log={log} label={`Photo: ${m.clue.label}`} onDone={setSentence} />
      {sentence && <div ref={reveal}><BigButton onClick={() => onNext({ note: sentence, clue: { ...m.clue, photo: m.photo } })}>Next</BigButton></div>}
    </>
  );
}

function BoardStep({ clues, say, log, onNext }) {
  const cards = [...clues, ...BOARD.extra];
  const [pinned, setPinned] = useState([]);
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(false);
  const toggle = (id) => !done && setPinned((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const check = () => {
    if (!cards.some((c) => pinned.includes(c.id) !== c.evidence)) {
      setDone(true);
      return say(BOARD.done);
    }
    log.hint();
    const f = fails + 1;
    setFails(f);
    if (f >= 2) {
      setPinned(cards.filter((c) => c.evidence).map((c) => c.id));
      setDone(true);
      log.help("Evidence board");
      say(`Good tries! ${BOARD.done}`);
    } else say(BOARD.hint);
  };
  return (
    <>
      <h2 className="text-2xl font-bold">{BOARD.prompt}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => {
          const on = pinned.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.id)}
              className="grid gap-2 rounded-2xl p-3 text-left focus-visible:outline focus-visible:outline-4"
              style={{ background: T.cream, color: T.ink, border: `4px solid ${on ? T.gold : T.ink}`, outlineColor: T.gold }}
            >
              {c.photo && <img src={c.photo} alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="h-24 w-full rounded-lg object-cover" />}
              <span className="text-lg font-bold">{c.label}</span>
              <span className="text-sm opacity-70">{on ? "Pinned to the board" : "Tap to pin"}</span>
            </button>
          );
        })}
      </div>
      {done ? <div ref={reveal}><BigButton onClick={() => onNext()}>Next</BigButton></div> : <div><BigButton onClick={check} disabled={!pinned.length}>Check my board</BigButton></div>}
    </>
  );
}

function ClaimStep({ say, log, onNext }) {
  const [claim, setClaim] = useState(null);
  return (
    <>
      <h2 className="text-2xl font-bold">{CLAIM.prompt}</h2>
      <BlankSentence spec={CLAIM} say={say} log={log} label="Claim" onDone={setClaim} />
      {claim && <div ref={reveal}><BigButton onClick={() => onNext({ claim })}>Next</BigButton></div>}
    </>
  );
}

function ChallengeStep({ say, log, onNext }) {
  const [ok, setOk] = useState(false);
  return (
    <>
      <Quiz q={CHALLENGE.prompt} options={CHALLENGE.options} hint={CHALLENGE.hint} right={CHALLENGE.right} say={say} log={log} label="Challenge question" onSolved={() => setOk(true)} />
      {ok && <div ref={reveal}><BigButton onClick={() => onNext()}>Next</BigButton></div>}
    </>
  );
}

function SignStep({ onNext }) {
  const [name, setName] = useState("");
  return (
    <>
      <label className="grid gap-2 text-xl font-bold">
        {SIGN.label}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={14}
          placeholder={SIGN.placeholder}
          className="max-w-sm rounded-2xl px-4 py-3 text-2xl"
          style={{ background: T.cream, color: T.ink, border: `3px solid ${T.ink}` }}
        />
      </label>
      <div><BigButton onClick={() => onNext({ name })}>{SIGN.button}</BigButton></div>
    </>
  );
}

function Mission({ log, onDone }) {
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState([]);
  const [clues, setClues] = useState([]);
  const [pins, setPins] = useState([]);
  const [claim, setClaim] = useState("");
  const { text, say } = useSpeaker("");
  const step = STEPS[i];

  useEffect(() => {
    say(STEPS[i].intro);
    document.getElementById("mission-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [i, say]);

  const go = (p = {}) => {
    if (p.note) setNotes((n) => [...n, p.note]);
    if (p.clue) setClues((c) => [...c, p.clue]);
    if (p.claim) setClaim(p.claim);
    if (i === STEPS.length - 1) return onDone({ notes, claim, name: p.name || "" });
    if (STEPS[i + 1].kind === "look") setPins([]);
    setI(i + 1);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-5">
        <div className="h-2 overflow-hidden rounded-full" style={{ background: "#ffffff33" }} aria-label={`Step ${i + 1} of ${STEPS.length}`}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%`, background: T.gold }} />
        </div>
        <Companion text={text} />
        {step.kind === "look" && <LookStep key={i} m={step.m} pins={pins} setPins={setPins} say={say} onNext={go} />}
        {step.kind === "explain" && <ExplainStep key={i} m={step.m} pins={pins} say={say} log={log} onNext={go} />}
        {step.kind === "board" && <BoardStep key={i} clues={clues} say={say} log={log} onNext={go} />}
        {step.kind === "claim" && <ClaimStep key={i} say={say} log={log} onNext={go} />}
        {step.kind === "challenge" && <ChallengeStep key={i} say={say} log={log} onNext={go} />}
        {step.kind === "sign" && <SignStep key={i} onNext={go} />}
      </div>
      <Notebook notes={[...notes, claim].filter(Boolean)} />
    </div>
  );
}

// ---------- phase 4: letter to Opp ----------
function Report({ data, stats, onReplay, onExit }) {
  const name = data.name.trim() || LETTER.anonymous;
  const date = new Date().toLocaleDateString();
  useEffect(() => {
    // groundwork for the Letters Wall: one saved letter per machine
    try {
      localStorage.setItem("roverLetter:opportunity", JSON.stringify({ machine: "opportunity", name, date, notes: data.notes, claim: data.claim }));
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <style>{`@media print { body * { visibility: hidden } #opp-letter, #opp-letter * { visibility: visible } #opp-letter { position: absolute; left: 0; top: 0; width: 100% } }`}</style>
      <div id="opp-letter" className="grid gap-3 rounded-2xl p-8 text-xl leading-relaxed" style={{ background: T.cream, color: T.ink, border: `4px solid ${T.ink}` }}>
        <p className="font-bold">{LETTER.greeting}</p>
        <p>{LETTER.thanks}</p>
        <ul className="list-disc pl-6">{data.notes.map((n, k) => <li key={k}>{n}</li>)}</ul>
        <p className="font-bold">{data.claim}</p>
        <p>{LETTER.closing}<br />{name}</p>
        <p className="text-sm opacity-70">{date}</p>
        <p className="mt-2 border-t-2 pt-3 text-base" style={{ borderColor: T.ink }}>
          <strong>{LETTER.teacherTitle}.</strong> {LETTER.hintsLabel}: {stats.hints}. {LETTER.helpLabel}: {stats.helped.length ? stats.helped.join(", ") : LETTER.none}.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <BigButton onClick={() => window.print()}>{OPP_UI.print}</BigButton>
        <BigButton onClick={onReplay}>{OPP_UI.replay}</BigButton>
        {onExit && <BigButton onClick={onExit}>{OPP_UI.exit}</BigButton>}
      </div>
    </div>
  );
}

// ---------- main ----------
export default function MissionGame({ machineId, onExit, onBackToStory }) {
  const config = MACHINE_BUILD[machineId] ?? MACHINE_BUILD.opportunity;
  const { UI } = config;
  const { completeMachine } = useProgress();
  const { playMissionComplete } = useSpaceAudio();
  const celebrated = useRef(false);
  const [stats, setStats] = useState({ hints: 0, helped: [] });
  const finishBuild = useCallback(() => {
    completeMachine(machineId);
    if (!celebrated.current) {
      celebrated.current = true;
      playMissionComplete();
    }
    if (onBackToStory) onBackToStory();
    else onExit?.();
  }, [machineId, completeMachine, playMissionComplete, onExit, onBackToStory]);

  const log = {
    hint: () => setStats((s) => ({ ...s, hints: s.hints + 1 })),
    help: (l) => setStats((s) => (s.helped.includes(l) ? s : { ...s, helped: [...s.helped, l] })),
  };

  return (
    <section
      id="mission-scroll"
      className="h-full min-h-0 w-full overflow-y-auto overscroll-contain px-4 py-6 md:px-10"
      style={{
        fontFamily: FONT,
        touchAction: "pan-y",
        color: T.cream,
        backgroundColor: T.sky,
        backgroundImage: `radial-gradient(circle at 15% 0%, ${T.navy} 0, transparent 50%), radial-gradient(#ffffff40 1px, transparent 1.6px)`,
        backgroundSize: "auto, 38px 38px",
      }}
    >
      <div className="mx-auto max-w-5xl pb-24">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base font-bold">{UI.steps[0]}</p>
          <div className="flex flex-wrap items-center gap-4">
            {onBackToStory ? (
              <button type="button" onClick={onBackToStory} className="text-base underline underline-offset-4">
                Back to story
              </button>
            ) : null}
            {onExit ? (
              <button type="button" onClick={onExit} className="text-base underline underline-offset-4">
                {UI.exit}
              </button>
            ) : null}
          </div>
        </header>

        <Build log={log} onDone={finishBuild} config={config} />
      </div>
    </section>
  );
}