"use client";

import React from "react";
import Image from "next/image";
import { useCustomizer } from "@/context/CustomizerContext";
import { X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { sound } from "@/utils/audio";

export default function LookbookModal() {
  const { lookbookModalImg, setLookbookModalImg } = useCustomizer();

  if (!lookbookModalImg) return null;

  return (
    <div className="lookbook-modal-overlay" onClick={() => setLookbookModalImg(null)}>
      <div className="lookbook-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="lookbook-close-btn"
          onClick={() => {
            sound.playClick(500, 0.02);
            setLookbookModalImg(null);
          }}
        >
          <X size={20} />
        </button>

        <div className="lookbook-img-wrapper">
          <Image
            src={lookbookModalImg}
            alt="Editorial High-Res Shoot"
            width={1200}
            height={900}
            className="lookbook-full-img"
          />
        </div>

        <div className="lookbook-meta-bar">
          <div>
            <span className="lookbook-tag">EDITORIAL LOOKBOOK // ARCHIVE 2026</span>
            <h3 className="lookbook-title">NextStep Urban Expedition</h3>
          </div>

          <Link
            href="/store"
            className="lookbook-cta"
            onClick={() => {
              sound.playSuccess();
              setLookbookModalImg(null);
            }}
          >
            <Sparkles size={15} />
            <span>Customize This Silhouette in 3D</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
