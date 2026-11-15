"use client";
import "@/components/certificate/certificate.css";

export function MapLogo({ className = "h-7 w-7" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path fill="#FFFFFF" d="M5 7.5 12 5l8 3 7-2.2V24l-7 2.5-8-3L5 26V7.5z" />
      <path fill="#0B3D91" d="M12 5v18.2M20 8v18.5" stroke="#0B3D91" strokeWidth="1.2" />
      <path fill="#FC3D21" d="M16 8.2c-2.1 0-3.6 1.6-3.6 3.5 0 2.6 3.6 6.3 3.6 6.3s3.6-3.7 3.6-6.3c0-1.9-1.5-3.5-3.6-3.5zm0 4.7a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z" />
    </svg>
  );
}

export default function SiteHeader({
  title = "The Quiet Machines",
  onMap,
  onCertificate,
  certificateUnlocked = false,
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-50 h-16 bg-black text-white">
      <div className="relative mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {onMap ? (
            <button
              type="button"
              onClick={onMap}
              aria-label="Map"
              className="grid h-11 w-11 place-items-center rounded-md bg-[#0B3D91]"
            >
              <MapLogo />
            </button>
          ) : null}
          <p className="text-sm font-semibold tracking-wide">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          {onCertificate ? (
            <button type="button" className="cert-header-btn" onClick={onCertificate}>
              {certificateUnlocked ? "My Certificate" : "Preview Certificate"}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
