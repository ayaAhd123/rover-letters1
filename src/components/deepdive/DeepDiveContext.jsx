"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const DeepDiveContext = createContext(null);

/** Shared state for the teen Deep Dive overlay (3D + scroll panel). */
export function DeepDiveProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("introduction");
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [userCameraActive, setUserCameraActive] = useState(false);
  const [cameraSyncKey, setCameraSyncKey] = useState(0);
  const [nasaRoverReady, setNasaRoverReady] = useState(false);
  const [archiveKind, setArchiveKind] = useState("opportunity");
  const onCloseRef = useRef(null);
  const userDriveRef = useRef(false);
  const scrollRootRef = useRef(null);
  const sceneApiRef = useRef({});

  const registerScrollRoot = useCallback((el) => {
    scrollRootRef.current = el;
  }, []);

  const scrollToSection = useCallback(
    (id) => {
      setUserCameraActive(false);
      setActiveSectionId(id);
      setCameraSyncKey((k) => k + 1);
      const root = scrollRootRef.current;
      const el = root?.querySelector(`[data-section-id="${CSS.escape(id)}"]`);
      el?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    },
    [reducedMotion]
  );

  const bumpCameraSync = useCallback(() => {
    setCameraSyncKey((k) => k + 1);
  }, []);

  const registerSceneApi = useCallback((patch) => {
    Object.assign(sceneApiRef.current, patch);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const open = useCallback((kind = "opportunity") => {
    const resolved =
      kind === "ingenuity"
        ? "ingenuity"
        : kind === "viking"
          ? "viking"
          : kind === "surveyor-3"
            ? "surveyor-3"
            : "opportunity";
    setArchiveKind(resolved);
    setActiveSectionId("introduction");
    setActiveTrigger(null);
    setUserCameraActive(false);
    setNasaRoverReady(false);
    setIsOpen(true);
  }, []);

  const returnToStoryView = useCallback(() => {
    userDriveRef.current = false;
    setUserCameraActive(false);
    const controls = sceneApiRef.current.controlsRef?.current;
    if (controls) controls.enabled = false;
    controls?.stop?.();
    setCameraSyncKey((k) => k + 1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveTrigger(null);
    setNasaRoverReady(false);
    onCloseRef.current?.();
  }, []);

  const fireTrigger = useCallback((id) => {
    setActiveTrigger({ id, nonce: Date.now() });
  }, []);

  const registerOnClose = useCallback((fn) => {
    onCloseRef.current = fn;
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      activeSectionId,
      setActiveSectionId,
      activeTrigger,
      fireTrigger,
      reducedMotion,
      registerOnClose,
      registerScrollRoot,
      scrollToSection,
      registerSceneApi,
      sceneApiRef,
      userCameraActive,
      setUserCameraActive,
      userDriveRef,
      returnToStoryView,
      cameraSyncKey,
      bumpCameraSync,
      nasaRoverReady,
      setNasaRoverReady,
      archiveKind,
    }),
    [
      isOpen,
      open,
      close,
      activeSectionId,
      activeTrigger,
      fireTrigger,
      reducedMotion,
      registerOnClose,
      registerScrollRoot,
      scrollToSection,
      registerSceneApi,
      userCameraActive,
      userDriveRef,
      returnToStoryView,
      cameraSyncKey,
      bumpCameraSync,
      nasaRoverReady,
      archiveKind,
    ]
  );

  return <DeepDiveContext.Provider value={value}>{children}</DeepDiveContext.Provider>;
}

export function useDeepDive() {
  const ctx = useContext(DeepDiveContext);
  if (!ctx) throw new Error("useDeepDive must be used inside DeepDiveProvider");
  return ctx;
}
