"use client";

import React, { useState } from "react";
import { Sparkles, Layers, Cpu } from "lucide-react";

// Reliable high-resolution CDN fallback photography for each edition & lookbook slot
export const LOCAL_COLLECTION_FALLBACKS: Record<string, string> = {
  "edition-01": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  "edition-02": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
  "edition-03": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
  "edition_01": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  "edition_02": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
  "edition_03": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
};

export const LOCAL_LOOKBOOK_FALLBACKS: Record<string, string> = {
  "lookbook-01": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
  "lookbook-02": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  "lookbook-03": "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=80",
  "lookbook_01": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
  "lookbook_02": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  "lookbook_03": "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=80",
};

// Map legacy or missing local paths to active CDN targets
const PATH_TO_CDN_MAP: Record<string, string> = {
  "/images/cyber_volt_shoe.jpg": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  "/images/stealth_onyx_shoe.jpg": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
  "/images/glacier_neon_shoe.jpg": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
  "/images/editorial_cyber_volt.jpg": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
  "/images/editorial_stealth_onyx.jpg": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  "/images/editorial_glacier_neon.jpg": "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=80",
  "/images/shoe.jpg": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  "/images/shoe.png": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
  "/images/stealthshoe.jpg": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
  "/images/whiteshoe.jpg": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
  "/images/whiteneonshoes.jpg": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
  "/images/whiteneonshoes.png": "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=80",
  "/images/LookbookWide.jpg": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
  "/images/LookbookAthlete.jpg": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  "/images/LookbookStride.jpg": "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1200&q=80",
  "/images/EditorialImage1.jpg": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
  "/images/EditorialImage2.jpg": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  "/images/EditorialUrban.jpg": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
};

export function resolveValidSrc(
  src: string | undefined | null,
  fallbackKey: string,
  fallbackMap?: Record<string, string>
): string {
  const map = fallbackMap || LOCAL_LOOKBOOK_FALLBACKS;
  const staticFallback = map[fallbackKey] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80";

  if (!src || typeof src !== "string") {
    return staticFallback;
  }

  const trimmed = src.trim();
  if (trimmed === "" || trimmed === "undefined" || trimmed === "null") {
    return staticFallback;
  }

  // If pointing to a local /images/ path that may not exist on remote hosts, map to verified CDN asset
  if (PATH_TO_CDN_MAP[trimmed]) {
    return PATH_TO_CDN_MAP[trimmed];
  }

  if (trimmed.startsWith("/images/")) {
    return staticFallback;
  }

  // Return valid http/https/data URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  return staticFallback;
}

/**
 * High-tech Glowing 3D Shoe Vector Graphic
 * Embedded inline so it has zero external dependencies and guaranteed rendering.
 */
function FuturisticShoeVector({ accentColor = "#00FF66" }: { accentColor?: string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "80%",
        maxWidth: "280px",
        height: "auto",
        filter: `drop-shadow(0 0 16px ${accentColor}44)`,
        transition: "transform 0.4s ease, filter 0.4s ease",
      }}
    >
      <defs>
        <linearGradient id="cyberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="60%" stopColor="#00d2ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="latticeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Cyber Grid Background Matrix */}
      <path
        d="M 40 190 L 360 190 M 60 195 L 340 195 M 80 200 L 320 200"
        stroke={accentColor}
        strokeWidth="1"
        strokeOpacity="0.25"
        strokeDasharray="4 4"
      />

      {/* Shoe Upper Silhouette */}
      <path
        d="M 65 160 C 80 135 120 100 170 95 C 210 90 240 105 270 120 C 310 135 345 155 355 165 C 340 172 310 175 280 175 C 220 175 160 174 65 174 Z"
        fill="url(#cyberGlow)"
        fillOpacity="0.12"
        stroke="url(#cyberGlow)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Collar & Tongue Line */}
      <path
        d="M 170 95 C 185 70 205 60 220 62 C 230 75 235 95 240 105"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Dynamic Aerodynamic Panels */}
      <path
        d="M 120 155 C 145 125 180 115 225 125 C 255 132 290 148 315 162"
        stroke="#00F0FF"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeOpacity="0.8"
      />
      <path
        d="M 155 165 C 180 140 210 135 250 145"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* 3D Voronoi / 3D-Printed Lattice Sole */}
      <g stroke="url(#latticeGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.95">
        {/* Sole Base Curve */}
        <path d="M 60 174 C 100 174 160 175 240 175 C 295 175 335 172 360 165 C 362 178 340 190 290 190 C 210 190 140 188 60 186 Z" fill="#00FF66" fillOpacity="0.08" />
        
        {/* Lattice struts */}
        <path d="M 80 175 L 95 187 M 110 175 L 125 187 M 140 175 L 155 187 M 170 175 L 185 187" />
        <path d="M 200 175 L 215 187 M 230 175 L 245 187 M 260 175 L 275 187 M 290 175 L 305 187 M 320 173 L 335 183" />
        <path d="M 95 175 L 80 187 M 125 175 L 110 187 M 155 175 L 140 187 M 185 175 L 170 187" />
        <path d="M 215 175 L 200 187 M 245 175 L 230 187 M 275 175 L 260 187 M 305 175 L 290 187 M 335 173 L 320 183" />
      </g>

      {/* Glowing Energy Points */}
      <circle cx="220" cy="62" r="3" fill="#00FF66" filter={`drop-shadow(0 0 6px #00FF66)`} />
      <circle cx="355" cy="165" r="3.5" fill="#00F0FF" filter={`drop-shadow(0 0 6px #00F0FF)`} />
      <circle cx="65" cy="160" r="3" fill="#00FF66" filter={`drop-shadow(0 0 6px #00FF66)`} />
    </svg>
  );
}

export interface SafeImageProps {
  src: string | undefined | null;
  fallbackKey: string;
  fallbackMap?: Record<string, string>;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  onClick?: () => void;
  loading?: "lazy" | "eager";
}

export default function SafeImage({
  src,
  fallbackKey,
  fallbackMap = LOCAL_LOOKBOOK_FALLBACKS,
  alt,
  className = "",
  style = {},
  width,
  height,
  onClick,
  loading = "lazy",
}: SafeImageProps) {
  const targetFallback = fallbackMap[fallbackKey] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80";
  const validInitialSrc = resolveValidSrc(src, fallbackKey, fallbackMap);

  // Track failures to seamlessly step: [Initial URL] -> [CDN Fallback] -> [Rich Visual 3D Card]
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});

  const isInitialFailed = !!failedSrcs[validInitialSrc];
  const isFallbackFailed = !!failedSrcs[targetFallback];

  const currentSrc = isInitialFailed ? targetFallback : validInitialSrc;
  const showRichFallback =
    (validInitialSrc === targetFallback && isFallbackFailed) ||
    (isInitialFailed && isFallbackFailed);

  const handleError = () => {
    setFailedSrcs((prev) => ({ ...prev, [currentSrc]: true }));
  };

  // Determine neon accent based on fallback key
  const isVolt = fallbackKey.includes("01") || fallbackKey.includes("volt");
  const isGlacier = fallbackKey.includes("03") || fallbackKey.includes("glacier");
  const accentColor = isVolt ? "#00FF66" : isGlacier ? "#00F0FF" : "#E2E8F0";

  // Rich Visual Interactive Preview Component
  if (showRichFallback) {
    return (
      <div
        className={`safe-image-fallback-container ${className}`}
        style={{
          width: "100%",
          height: "100%",
          minHeight: height ? `${height}px` : "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 20px 20px",
          background: "radial-gradient(ellipse at 50% 40%, rgba(20, 26, 38, 0.95) 0%, rgba(10, 13, 19, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: `inset 0 0 30px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)`,
          position: "relative",
          overflow: "hidden",
          borderRadius: "inherit",
          cursor: onClick ? "pointer" : "default",
          ...style,
        }}
        role="img"
        aria-label={alt}
        onClick={onClick}
      >
        {/* Subtle Ambient Radial Backlight */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "180px",
            height: "140px",
            background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />

        {/* Top Header Badge */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.1em",
                color: "#CBD5E1",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              NEXTSTEP 3D ARCHIVE
            </span>
          </div>

          <Sparkles size={14} color={accentColor} style={{ opacity: 0.8 }} />
        </div>

        {/* Center Futuristic Glowing Shoe Vector */}
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "12px 0",
            zIndex: 2,
          }}
        >
          <FuturisticShoeVector accentColor={accentColor} />
        </div>

        {/* Bottom Spec Footer Bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={13} color="rgba(255, 255, 255, 0.5)" />
            <span
              style={{
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono, monospace)",
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.06em",
              }}
            >
              SLS LATTICE MATRIX
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={13} color={accentColor} style={{ opacity: 0.7 }} />
            <span
              style={{
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono, monospace)",
                color: accentColor,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              AEROFIBER-7™
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      decoding="async"
      onClick={onClick}
      onError={handleError}
    />
  );
}
