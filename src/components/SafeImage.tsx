"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

export const LOCAL_LOOKBOOK_FALLBACKS: Record<string, string> = {
  "lookbook-01": "/images/editorial_cyber_volt.jpg",
  "lookbook-02": "/images/editorial_stealth_onyx.jpg",
  "lookbook-03": "/images/editorial_glacier_neon.jpg",
  "lookbook_01": "/images/editorial_cyber_volt.jpg",
  "lookbook_02": "/images/editorial_stealth_onyx.jpg",
  "lookbook_03": "/images/editorial_glacier_neon.jpg",
};

export const LOCAL_COLLECTION_FALLBACKS: Record<string, string> = {
  "edition-01": "/images/cyber_volt_shoe.jpg",
  "edition-02": "/images/stealth_onyx_shoe.jpg",
  "edition-03": "/images/glacier_neon_shoe.jpg",
  "edition_01": "/images/cyber_volt_shoe.jpg",
  "edition_02": "/images/stealth_onyx_shoe.jpg",
  "edition_03": "/images/glacier_neon_shoe.jpg",
};

const LEGACY_URL_MAP: Record<string, string> = {
  "/images/shoe.jpg": "/images/cyber_volt_shoe.jpg",
  "/images/shoe.png": "/images/cyber_volt_shoe.jpg",
  "/images/stealthshoe.jpg": "/images/stealth_onyx_shoe.jpg",
  "/images/whiteshoe.jpg": "/images/glacier_neon_shoe.jpg",
  "/images/whiteneonshoes.jpg": "/images/glacier_neon_shoe.jpg",
  "/images/whiteneonshoes.png": "/images/glacier_neon_shoe.jpg",
  "/images/LookbookWide.jpg": "/images/editorial_cyber_volt.jpg",
  "/images/LookbookAthlete.jpg": "/images/editorial_stealth_onyx.jpg",
  "/images/LookbookStride.jpg": "/images/editorial_glacier_neon.jpg",
  "/images/EditorialImage1.jpg": "/images/editorial_cyber_volt.jpg",
  "/images/EditorialImage2.jpg": "/images/editorial_stealth_onyx.jpg",
  "/images/EditorialUrban.jpg": "/images/editorial_cyber_volt.jpg",
};

export function resolveValidSrc(
  src: string | undefined | null,
  fallbackKey: string,
  fallbackMap?: Record<string, string>
): string {
  const map = fallbackMap || LOCAL_LOOKBOOK_FALLBACKS;
  const staticFallback = map[fallbackKey] || "/images/editorial_cyber_volt.jpg";

  if (!src || typeof src !== "string") {
    return staticFallback;
  }

  const trimmed = src.trim();
  if (trimmed === "" || trimmed === "undefined" || trimmed === "null") {
    return staticFallback;
  }

  if (LEGACY_URL_MAP[trimmed]) {
    return LEGACY_URL_MAP[trimmed];
  }

  // Ensure leading slash if relative
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("data:") &&
    !trimmed.startsWith("/")
  ) {
    return `/${trimmed}`;
  }

  return trimmed;
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
  const targetFallback = fallbackMap[fallbackKey] || "/images/editorial_cyber_volt.jpg";
  const validInitialSrc = resolveValidSrc(src, fallbackKey, fallbackMap);

  // Track failed URLs to gracefully advance from broken remote to verified local fallback
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});

  const isInitialFailed = !!failedSrcs[validInitialSrc];
  const isFallbackFailed = !!failedSrcs[targetFallback];

  const currentSrc = isInitialFailed ? targetFallback : validInitialSrc;
  const bothFailed = (validInitialSrc === targetFallback && isFallbackFailed) || (isInitialFailed && isFallbackFailed);

  const handleError = () => {
    setFailedSrcs((prev) => ({ ...prev, [currentSrc]: true }));
  };

  // Clean UI Fallback State: No broken image icons or leaking alt text
  if (bothFailed) {
    return (
      <div
        className={`safe-image-fallback-container ${className}`}
        style={{
          width: "100%",
          height: "100%",
          minHeight: height ? `${height}px` : "240px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 50%, rgba(30, 36, 48, 0.7) 0%, rgba(13, 16, 23, 0.95) 100%)",
          color: "rgba(255, 255, 255, 0.4)",
          position: "relative",
          overflow: "hidden",
          borderRadius: "inherit",
          ...style,
        }}
        role="img"
        aria-label={alt}
        onClick={onClick}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", pointerEvents: "none" }}>
          <Sparkles size={22} color="rgba(255, 255, 255, 0.35)" />
          <span
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.4)",
              fontWeight: 500,
            }}
          >
            NEXTSTEP ARCHIVE
          </span>
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
