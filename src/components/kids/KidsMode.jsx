"use client";

import "./kids.css";
import { KidsProgressProvider } from "@/context/KidsProgressContext";
import SegmentRunner from "@/components/kids/SegmentRunner";
import { DeepDiveProvider, useDeepDive } from "@/components/deepdive/DeepDiveContext";
import DeepDive from "@/components/deepdive/DeepDive";
import SurveyorSegmentRunner from "@/components/kids/SurveyorSegmentRunner";
import { kidsPackFor } from "@/data/machines/index";

function KidsStoryLayer({ machine, onExit, onCompleteCelebration }) {
  const { isOpen } = useDeepDive();
  return (
    <div className={isOpen ? "kids-story-layer is-archive-open" : "kids-story-layer"} aria-hidden={isOpen}>
      <SegmentRunner machine={machine} onExit={onExit} onCompleteCelebration={onCompleteCelebration} />
    </div>
  );
}

/** Kids Mode entry — machine-specific story or game path. */
export default function KidsMode({
  machineId = "opportunity",
  onClose,
  onCompleteCelebration,
}) {
  const resolvedId = machineId === "apollo-12" ? "surveyor-3" : machineId;
  const pack = kidsPackFor(resolvedId);

  if (!pack) {
    return (
      <div className="kids-mode">
        <div className="kids-end-card">
          <p>Machine not found.</p>
          <button type="button" className="kids-btn kids-btn-primary" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const surveyor = resolvedId === "surveyor-3";

  return (
    <div
      className={`kids-mode${surveyor ? " kids-mode--surveyor" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${tName(pack)} kids adventure`}
    >
      <KidsProgressProvider machineId={resolvedId} startAtBeginning>
        {surveyor ? (
          <SurveyorSegmentRunner
            machine={pack}
            onExit={onClose}
            onCompleteCelebration={onCompleteCelebration}
          />
        ) : (
          <DeepDiveProvider>
            <KidsStoryLayer
              machine={pack}
              onExit={onClose}
              onCompleteCelebration={onCompleteCelebration}
            />
            <DeepDive />
          </DeepDiveProvider>
        )}
      </KidsProgressProvider>
    </div>
  );
}

function tName(machine) {
  const n = machine?.name;
  if (typeof n === "string") return n;
  return n?.en ?? "Rover";
}