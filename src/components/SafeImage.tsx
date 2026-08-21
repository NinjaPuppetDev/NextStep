"use client";

import React, { useState } from "react";

// Mapped to match your exact /public/images/*.png files
export const LOCAL_COLLECTION_FALLBACKS: Record<string, string> = {
  "edition-01": "/images/image1.png",
  "edition-02": "/images/image2.png",
  "edition-03": "/images/image3.png",
  "edition_01": "/images/image1.png",
  "edition_02": "/images/image2.png",
  "edition_03": "/images/image3.png",
};

export const LOCAL_LOOKBOOK_FALLBACKS: Record<string, string> = {
  "lookbook-01": "/images/editorial1.png",
  "lookbook-02": "/images/editorial2.png",
  "lookbook-03": "/images/editorial3.png",
  "lookbook_01": "/images/editorial1.png",
  "lookbook_02": "/images/editorial2.png",
  "lookbook_03": "/images/editorial3.png",
};

export function resolveValidSrc(
  src: string | undefined | null,
  fallbackKey: string,
  fallbackMap?: Record<string, string>
): string {
  if (src && typeof src === "string" && src.startsWith("/images/")) {
    return src;
  }
  const map = fallbackMap || LOCAL_LOOKBOOK_FALLBACKS;
  return map[fallbackKey] || map[fallbackKey.replace("_", "-")] || "/images/image1.png";
}

export interface SafeImageProps {
  src?: string | null;
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
  onClick,
}: SafeImageProps) {
  const initialSrc = resolveValidSrc(src, fallbackKey, fallbackMap);
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  const handleError = () => {
    const fallback = fallbackMap[fallbackKey] || fallbackMap[fallbackKey.replace("_", "-")];
    if (fallback && imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={imgSrc}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      style={style}
      loading="lazy"
      decoding="async"
      onClick={onClick}
      onError={handleError}
    />
  );
}