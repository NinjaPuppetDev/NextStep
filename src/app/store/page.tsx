"use client";

import React from "react";
import ShoeCanvas from "@/components/ShoeCanvas";
import CustomizerUI from "@/components/CustomizerUI";
import { Sparkles, Info } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";

export default function StorePage() {
  const { highContrast } = useCustomizer();

  return (
    <main className="store-page-root">
      {/* 3D Atelier Workspace Container */}
      <div className="store-workspace">
        {/* Left/Main Area: Interactive 3D Viewport */}
        <div className={`store-3d-stage ${highContrast ? "high-contrast" : ""}`}>
          {/* Top Stage Bar Info */}
          <div className="stage-top-info">
            <div className="brand-stage-tag">
              <span className="live-pulse" />
              <span>NextStep // 3D BESPOKE STUDIO</span>
            </div>
            <div className="stage-hints">
              <Info size={13} color="#00f0ff" />
              <span>Left-click + drag to rotate • Scroll to zoom • Click shoe parts to select</span>
            </div>
          </div>

          {/* Interactive Three.js WebGL Canvas */}
          <div className="canvas-frame">
            <ShoeCanvas interactive={true} />
          </div>

          {/* Bottom Stage Spec Bar */}
          <div className="stage-bottom-specs">
            <div className="spec-bubble">
              <Sparkles size={13} color="#39ff14" />
              <span>REAL-TIME RAYCASTING ACTIVE</span>
            </div>
            <div className="spec-bubble">
              <span>PHYSICS-BASED PBR SHADERS</span>
            </div>
            <div className="spec-bubble">
              <span>ZERO-WASTE 3D PRINT READY</span>
            </div>
          </div>
        </div>

        {/* Right Area: Customizer Controls Panel */}
        <aside className="store-sidebar">
          <CustomizerUI />
        </aside>
      </div>
    </main>
  );
}
