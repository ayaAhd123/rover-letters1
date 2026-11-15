"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MemoryKeeperCertificate from "@/components/certificate/MemoryKeeperCertificate";
import {
  CERT_BASE_FONT_PX,
  CERT_DESIGN_HEIGHT,
  CERT_DESIGN_WIDTH,
  CERT_EXPORT_HEIGHT,
  CERT_EXPORT_WIDTH,
} from "@/components/certificate/certConstants";
import {
  allMachinesComplete,
  certificateMachineList,
  machineIds,
  useProgress,
} from "@/state/progress";

async function exportCertificatePng(node, { width, height, pixelRatio = 3 }) {
  const clone = node.cloneNode(true);
  const rules = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText?.includes(".mk-")) rules.push(rule.cssText);
      }
    } catch {
      /* cross-origin stylesheet */
    }
  }
  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.cssText = `width:${width}px;height:${height}px;margin:0`;
  const style = document.createElement("style");
  style.textContent = rules.join("\n");
  wrapper.append(style, clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * pixelRatio}" height="${height * pixelRatio}"><foreignObject width="${width}" height="${height}" transform="scale(${pixelRatio})">${new XMLSerializer().serializeToString(wrapper)}</foreignObject></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await new Promise((ok, err) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = err;
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function CertificateModal({ open, onClose }) {
  const { completedMachines, ready } = useProgress();
  const [childName, setChildName] = useState("");
  const [personalized, setPersonalized] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.72);
  const exportRef = useRef(null);
  const scrollRef = useRef(null);
  const panelRef = useRef(null);

  const allMachines = certificateMachineList();
  const required = machineIds();
  const unlocked = ready && allMachinesComplete(completedMachines);
  const completedList = allMachines.filter((m) => completedMachines.includes(m.id));
  const found = completedList.length;
  const total = required.length;

  const updatePreviewScale = useCallback(() => {
    const host = scrollRef.current;
    const panel = panelRef.current;
    if (!host) return;

    const pad = 16;
    let availW = host.clientWidth - pad;
    let availH = host.clientHeight - pad;

    if (panel && availH < 120) {
      const head = panel.querySelector(".cert-modal-head");
      const foot = panel.querySelector(".cert-modal-foot");
      availH =
        panel.clientHeight -
        (head?.offsetHeight ?? 0) -
        (foot?.offsetHeight ?? 0) -
        pad * 2;
    }

    if (availW <= 0 || availH <= 0) return;

    const scaleW = availW / CERT_DESIGN_WIDTH;
    const scaleH = availH / CERT_DESIGN_HEIGHT;
    const scale = Math.min(scaleW, scaleH, 1);
    setPreviewScale(Math.max(0.25, scale));
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setPersonalized(false);
      setChildName("");
      return;
    }
    const run = () => {
      requestAnimationFrame(() => {
        updatePreviewScale();
        requestAnimationFrame(updatePreviewScale);
      });
    };
    run();
    const host = scrollRef.current;
    const panel = panelRef.current;
    if (!host) return undefined;
    const ro = new ResizeObserver(run);
    ro.observe(host);
    if (panel) ro.observe(panel);
    window.addEventListener("resize", run);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [open, updatePreviewScale, personalized, childName]);

  const generate = () => {
    if (!unlocked || !childName.trim()) return;
    setPersonalized(true);
  };

  const downloadPng = useCallback(async () => {
    const node = exportRef.current;
    if (!node || !personalized || !childName.trim()) return;
    setDownloading(true);
    try {
      const dataUrl = await exportCertificatePng(node, {
        pixelRatio: 1,
        width: CERT_EXPORT_WIDTH,
        height: CERT_EXPORT_HEIGHT,
      });
      const link = document.createElement("a");
      const safe = childName.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "memory-keeper";
      link.download = `rover-letters-certificate-${safe}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }, [childName, personalized]);

  if (!open) return null;

  const certMode = personalized && childName.trim() ? "personal" : "preview";
  const certMachines = personalized ? completedList : allMachines;

  const previewFontPx = CERT_BASE_FONT_PX * previewScale;

  return (
    <div className="cert-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="cert-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cert-modal-head">
          <h2 id="cert-modal-title">
            {unlocked ? "Memory Keeper Certificate" : "Certificate preview"}
          </h2>
          <button type="button" className="cert-btn-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="cert-modal-scroll" ref={scrollRef}>
          <MemoryKeeperCertificate
            preview
            previewFontPx={previewFontPx}
            mode={certMode}
            childName={childName}
            machines={certMachines}
          />
        </div>

        <footer className="cert-modal-foot">
          <p className="cert-modal-progress">
            Machines remembered: {found} / {total}
          </p>

          {!unlocked ? (
            <p className="cert-modal-note">
              Visit and finish every mission on Mars and the Moon to unlock your personalized
              certificate. You can preview the template anytime.
            </p>
          ) : !personalized ? (
            <>
              <p className="cert-modal-note">You unlocked the certificate! Enter your name, then generate it.</p>
              <div className="cert-modal-form">
                <label htmlFor="cert-child-name">Your first name</label>
                <input
                  id="cert-child-name"
                  type="text"
                  className="cert-modal-input"
                  value={childName}
                  maxLength={40}
                  autoComplete="given-name"
                  placeholder="e.g. Sara"
                  onChange={(e) => setChildName(e.target.value)}
                />
                <div className="cert-modal-actions">
                  <button
                    type="button"
                    className="cert-btn cert-btn-primary"
                    disabled={!childName.trim()}
                    onClick={generate}
                  >
                    Generate My Certificate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="cert-modal-note">
                Happy exploring, {childName.trim()}! Download your certificate as a PNG.
              </p>
              <div className="cert-modal-actions">
                <button
                  type="button"
                  className="cert-btn cert-btn-primary"
                  disabled={downloading}
                  onClick={downloadPng}
                >
                  {downloading ? "Saving…" : "Download PNG"}
                </button>
                <button
                  type="button"
                  className="cert-btn cert-btn-ghost"
                  onClick={() => setPersonalized(false)}
                >
                  Edit name
                </button>
              </div>
            </>
          )}
        </footer>
      </div>

      {personalized && childName.trim() ? (
        <div className="cert-export-hidden" aria-hidden="true">
          <MemoryKeeperCertificate
            ref={exportRef}
            exportRender
            mode="personal"
            childName={childName}
            machines={completedList}
          />
        </div>
      ) : null}
    </div>
  );
}