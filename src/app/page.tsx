"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ShoeCanvas from "@/components/ShoeCanvas";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  Eye,
  CheckCircle,
  Sliders,
  Maximize2,
} from "lucide-react";
import {
  useCustomizer,
  PRESET_COLORWAYS,
  PresetColorway,
} from "@/context/CustomizerContext";
import { sound } from "@/utils/audio";

export default function HomePage() {
  const { applyPreset, setLookbookModalImg } = useCustomizer();
  const [selectedHeroPreset, setSelectedHeroPreset] = useState(PRESET_COLORWAYS[0]);
  const [activeTechTab, setActiveTechTab] = useState<"cushion" | "upper" | "plate" | "tread">("cushion");

  const handleHeroColorway = (preset: PresetColorway) => {
    sound.playSelect();
    setSelectedHeroPreset(preset);
    applyPreset(preset);
  };

  return (
    <div className="landing-page-root">
      {/* 1. HERO SECTION WITH EMBEDDED INTERACTIVE 3D CANVAS */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Column: Story & CTAs */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-indicator" />
              <span>DROP 01 // ON-DEMAND ADDITIVE MANUFACTURING</span>
            </div>

            <h1 className="hero-title">
              ENGINEERED FOR THE <span className="highlight-word">UNBOUND</span>
            </h1>

            <p className="hero-description">
              The next evolutionary leap in computational footwear. High-density
              Aeroknit weave fused with nitrogen-infused additive lattice soles,
              customized in real-time WebGL 3D.
            </p>

            {/* Live Spec Metrics */}
            <div className="hero-metrics-bar">
              <div className="metric-item">
                <span className="metric-val">280g</span>
                <span className="metric-lbl">Ultralight Mass</span>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <span className="metric-val">84%</span>
                <span className="metric-lbl">Kinetic Rebound</span>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <span className="metric-val">4.2 BAR</span>
                <span className="metric-lbl">Hydro-Gel Core</span>
              </div>
            </div>

            {/* Quick Hero Preset Switcher */}
            <div className="hero-preset-selector">
              <span className="preset-selector-label">Interactive Colorways:</span>
              <div className="hero-preset-pills">
                {PRESET_COLORWAYS.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    className={`hero-pill ${selectedHeroPreset.id === p.id ? "active" : ""}`}
                    onClick={() => handleHeroColorway(p)}
                  >
                    <span
                      className="hero-pill-dot"
                      style={{ backgroundColor: p.themeColor }}
                    />
                    <span>{p.name.split("//")[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="hero-actions">
              <Link
                href="/store"
                className="hero-primary-btn"
                onClick={() => sound.playSuccess()}
              >
                <Sparkles size={18} />
                <span>Launch 3D Customizer Studio</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#lookbook"
                className="hero-secondary-btn"
                onClick={() => sound.playClick(600, 0.02)}
              >
                <span>Explore Lookbook</span>
              </a>
            </div>

            {/* Feature Guarantees */}
            <div className="hero-guarantees">
              <div className="guarantee-chip">
                <ShieldCheck size={14} color="#39ff14" />
                <span>Zero-Waste 3D Print</span>
              </div>
              <div className="guarantee-chip">
                <Zap size={14} color="#00f0ff" />
                <span>Live Three.js Raycasting</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Shoe Canvas */}
          <div className="hero-3d-viewport">
            <div className="canvas-header-indicator">
              <div className="indicator-dot" />
              <span>LIVE 3D CAD VIEWPORT • ORBIT TO ROTATE</span>
            </div>

            <div className="canvas-container-3d">
              <ShoeCanvas interactive={true} />
            </div>

            {/* Floating Spatial Spec Overlays */}
            <div className="spatial-chip chip-top-right">
              <div className="chip-header">
                <Cpu size={13} color="#00f0ff" />
                <span>AEROKNIT MATRIX</span>
              </div>
              <p>Multi-density carbon fiber micro-weave</p>
            </div>

            <div className="spatial-chip chip-bottom-left">
              <div className="chip-header">
                <Layers size={13} color="#39ff14" />
                <span>NITROGEN CHASSIS</span>
              </div>
              <p>Dynamic compression shock-absorbing sole</p>
            </div>

            {/* Quick customize direct link button */}
            <Link
              href="/store"
              className="canvas-enter-studio-pill"
              onClick={() => sound.playSuccess()}
            >
              <Sliders size={14} />
              <span>Open in Fullscreen 3D Atelier</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE EDITIONS / CURATED DROP LINEUP */}
      <section className="lineup-section" id="collection">
        <div className="section-header-centered">
          <span className="section-eyebrow">ARCHIVE // DROP 01</span>
          <h2 className="section-title">SIGNATURE SILHOUETTES</h2>
          <p className="section-subtitle">
            Engineered base silhouettes available for immediate dispatch or bespoke 3D recalibration.
          </p>
        </div>

        <div className="lineup-grid">
          {/* Card 1: Lime Cyber Runner */}
          <div className="lineup-card">
            <div className="card-badge">EDITION 01</div>
            <div className="card-image-wrap">
              <Image
                src="/images/shoe.jpg"
                alt="Aether Kinetic Lime Runner"
                width={500}
                height={350}
                className="lineup-img"
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>AETHER // CYBER VOLT</h3>
                <span className="card-price">$245 USD</span>
              </div>
              <p className="card-desc">
                High-visibility electric lime perforated knit with organic Voronoi lattice midsole.
              </p>
              <div className="card-spec-tags">
                <span>Aeroknit Upper</span>
                <span>Lattice Midsole</span>
                <span>US 7 - 13</span>
              </div>
              <Link
                href="/store"
                className="card-customize-btn"
                onClick={() => {
                  sound.playSuccess();
                  applyPreset(PRESET_COLORWAYS[0]);
                }}
              >
                <Sparkles size={14} />
                <span>Customize in 3D</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Stealth Void */}
          <div className="lineup-card">
            <div className="card-badge">EDITION 02</div>
            <div className="card-image-wrap">
              <Image
                src="/images/stealthshoe.jpg"
                alt="Aether Stealth Void"
                width={500}
                height={350}
                className="lineup-img"
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>STEALTH // ONYX VOID</h3>
                <span className="card-price">$230 USD</span>
              </div>
              <p className="card-desc">
                Light-absorbing matte micro-weave with sculpted dark Voronoi shock dampeners.
              </p>
              <div className="card-spec-tags">
                <span>Matte Carbon</span>
                <span>Nitrogen Sole</span>
                <span>US 7 - 13</span>
              </div>
              <Link
                href="/store"
                className="card-customize-btn"
                onClick={() => {
                  sound.playSuccess();
                  applyPreset(PRESET_COLORWAYS[1]);
                }}
              >
                <Sparkles size={14} />
                <span>Customize in 3D</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Glacier White */}
          <div className="lineup-card">
            <div className="card-badge">EDITION 03</div>
            <div className="card-image-wrap">
              <Image
                src="/images/whiteshoe.jpg"
                alt="Aether Pure Glacier Runner"
                width={500}
                height={350}
                className="lineup-img"
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>GLACIER // NEON CORE</h3>
                <span className="card-price">$260 USD</span>
              </div>
              <p className="card-desc">
                Pure glacier white breathable upper with vivid neon lateral core accents.
              </p>
              <div className="card-spec-tags">
                <span>Glacier White</span>
                <span>Cellular Mesh</span>
                <span>US 7 - 13</span>
              </div>
              <Link
                href="/store"
                className="card-customize-btn"
                onClick={() => {
                  sound.playSuccess();
                  applyPreset(PRESET_COLORWAYS[2]);
                }}
              >
                <Sparkles size={14} />
                <span>Customize in 3D</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MATERIALS & TECHNOLOGY LAB */}
      <section className="tech-section" id="technology">
        <div className="tech-container">
          <div className="tech-content">
            <span className="section-eyebrow">AETHER MATERIALS LAB</span>
            <h2 className="section-title">MOLECULAR ARCHITECTURE</h2>
            <p className="section-subtitle">
              Every curve, lattice density, and weave tension is mathematically optimized for zero friction and maximum kinetic energy return.
            </p>

            {/* Interactive Tech Tabs */}
            <div className="tech-nav-pills">
              <button
                className={`tech-pill ${activeTechTab === "cushion" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("cushion");
                }}
              >
                1. Bio-Lattice Cushion
              </button>
              <button
                className={`tech-pill ${activeTechTab === "upper" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("upper");
                }}
              >
                2. Aeroknit Weave
              </button>
              <button
                className={`tech-pill ${activeTechTab === "plate" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("plate");
                }}
              >
                3. Carbon Kinetic Plate
              </button>
              <button
                className={`tech-pill ${activeTechTab === "tread" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("tread");
                }}
              >
                4. Bio-Adaptive Tread
              </button>
            </div>

            {/* Tab Descriptions */}
            <div className="tech-tab-detail-card">
              {activeTechTab === "cushion" && (
                <div>
                  <h3 className="tab-card-title">Nitrogen-Infused Additive Matrix</h3>
                  <p className="tab-card-desc">
                    3D-printed with varying zonal density. Softer at the heel strike point to absorb 92% of ground impacts, transitioning into rigid high-rebound lattice under the forefoot.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">92%</span>
                      <span className="stat-desc">Shock Dissipation</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">1.2M</span>
                      <span className="stat-desc">Lattice Cells</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">0%</span>
                      <span className="stat-desc">Material Waste</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTechTab === "upper" && (
                <div>
                  <h3 className="tab-card-title">Seamless Aeroknit Weave</h3>
                  <p className="tab-card-desc">
                    Engineered from single-filament recycled polymer fibers. Micro-ventilation zones provide maximum airflow while directional ribbing locks down the midfoot.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">98%</span>
                      <span className="stat-desc">Breathability Score</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">420 MPa</span>
                      <span className="stat-desc">Tensile Strength</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Zero</span>
                      <span className="stat-desc">Pressure Hotspots</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTechTab === "plate" && (
                <div>
                  <h3 className="tab-card-title">3K Aerospace Carbon Fiber Shank</h3>
                  <p className="tab-card-desc">
                    Sandwiched between dual-density foam layers, the spoon-shaped carbon propulsion plate acts like a catapult, returning 84% of your stride energy into forward momentum.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">84%</span>
                      <span className="stat-desc">Propulsion Return</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">18g</span>
                      <span className="stat-desc">Plate Mass</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">3K</span>
                      <span className="stat-desc">Carbon Tow</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTechTab === "tread" && (
                <div>
                  <h3 className="tab-card-title">Bio-Adaptive Traction Pattern</h3>
                  <p className="tab-card-desc">
                    Inspired by gecko lamellae micro-structures. Multi-directional geometric lugs grip wet asphalt, polished concrete, and uneven terrain without retaining pebbles.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">1.4µ</span>
                      <span className="stat-desc">Wet Friction Coeff</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">360°</span>
                      <span className="stat-desc">Lateral Stability</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">1,000 km</span>
                      <span className="stat-desc">Tested Durability</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Image: Material Texture Asset */}
          <div className="tech-media-wrap">
            <div className="tech-image-frame">
              <Image
                src="/images/ShoeMaterials.png"
                alt="Aether High-Performance Shoe Materials"
                width={700}
                height={400}
                className="tech-material-img"
              />
              <div className="tech-overlay-tag">
                <Sparkles size={14} color="#39ff14" />
                <span>LAB SAMPLE SPEC: 08-2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EDITORIAL LOOKBOOK GALLERY */}
      <section className="lookbook-section" id="lookbook">
        <div className="section-header-centered">
          <span className="section-eyebrow">CAMPAIGN 2026</span>
          <h2 className="section-title">EDITORIAL LOOKBOOK</h2>
          <p className="section-subtitle">
            Captured on the streets of Neo-Tokyo and Berlin. High-fashion architectural aesthetics meeting brutalist performance.
          </p>
        </div>

        <div className="lookbook-gallery-grid">
          {/* Item 1: Urban Promenade */}
          <div
            className="gallery-item large"
            onClick={() => {
              sound.playSelect();
              setLookbookModalImg("/images/LookbookWide.jpg");
            }}
          >
            <Image
              src="/images/LookbookWide.jpg"
              alt="Urban Lifestyle Waterfront Shoot"
              width={900}
              height={600}
              className="gallery-img"
            />
            <div className="gallery-hover-overlay">
              <div className="hover-content">
                <span className="gallery-tag">LOOKBOOK 01 // URBAN PROMENADE</span>
                <h3>Kinetic Lifestyle</h3>
                <span className="view-link">
                  <Eye size={15} /> Click to Inspect in High-Res
                </span>
              </div>
              <Maximize2 size={18} className="expand-icon" />
            </div>
          </div>

          {/* Item 2: Trail & Park Velocity */}
          <div
            className="gallery-item"
            onClick={() => {
              sound.playSelect();
              setLookbookModalImg("/images/LookbookAthlete.jpg");
            }}
          >
            <Image
              src="/images/LookbookAthlete.jpg"
              alt="Athlete Park Trail Run"
              width={600}
              height={800}
              className="gallery-img"
            />
            <div className="gallery-hover-overlay">
              <div className="hover-content">
                <span className="gallery-tag">LOOKBOOK 02 // TRAIL VELOCITY</span>
                <h3>Endurance Sprint</h3>
                <span className="view-link">
                  <Eye size={15} /> View High-Res
                </span>
              </div>
              <Maximize2 size={18} className="expand-icon" />
            </div>
          </div>

          {/* Item 3: Stride Precision */}
          <div
            className="gallery-item"
            onClick={() => {
              sound.playSelect();
              setLookbookModalImg("/images/LookbookStride.jpg");
            }}
          >
            <Image
              src="/images/LookbookStride.jpg"
              alt="Stride Impact Close-Up"
              width={600}
              height={800}
              className="gallery-img"
            />
            <div className="gallery-hover-overlay">
              <div className="hover-content">
                <span className="gallery-tag">LOOKBOOK 03 // STRIDE IMPACT</span>
                <h3>Cellular Cushioning</h3>
                <span className="view-link">
                  <Eye size={15} /> View High-Res
                </span>
              </div>
              <Maximize2 size={18} className="expand-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3D ATELIER ENGINE SPOTLIGHT */}
      <section className="atelier-spotlight-section">
        <div className="atelier-spotlight-container">
          <div className="atelier-badge">
            <Sparkles size={16} color="#39ff14" />
            <span>REAL-TIME 3D ATELIER</span>
          </div>
          <h2 className="atelier-headline">
            YOU ARE THE HEAD DESIGNER. <br />
            EVERY COMPONENT IS YOUR CANVAS.
          </h2>
          <p className="atelier-sub">
            Choose from 8 distinct anatomical shoe zones, 16 curated designer colorways, 6 tactile material shaders (including Neon Luminescence and Carbon Weave), and custom heel monograms.
          </p>

          <div className="atelier-feature-grid">
            <div className="atelier-card">
              <div className="feature-num">01</div>
              <h4>Direct 3D Raycasting</h4>
              <p>Click directly on the shoe upper, sole, or laces in the 3D viewport to select and recolor instantly.</p>
            </div>
            <div className="atelier-card">
              <div className="feature-num">02</div>
              <h4>Physics-Based Shaders</h4>
              <p>Experience real-time clearcoat reflections, metallic glints, and neon emission in 4 studio lighting rigs.</p>
            </div>
            <div className="atelier-card">
              <div className="feature-num">03</div>
              <h4>4K Render & Share</h4>
              <p>Export high-resolution photographic snapshots and share encoded design links with friends.</p>
            </div>
          </div>

          <div className="atelier-cta-wrap">
            <Link
              href="/store"
              className="atelier-big-btn"
              onClick={() => sound.playSuccess()}
            >
              <span>Launch 3D Customizer Studio</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. BRAND MANIFESTO */}
      <section className="manifesto-section" id="manifesto">
        <div className="manifesto-container">
          <span className="section-eyebrow">OUR PHILOSOPHY</span>
          <h2 className="manifesto-quote">
            &ldquo;MASS PRODUCTION IS OBSOLETE. TRUE LUXURY IS ZERO WASTE, BESPOKE FIT, AND INFINITE COMPUTATIONAL CREATIVITY.&rdquo;
          </h2>
          <div className="manifesto-pillars">
            <div className="pillar-item">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <h5>On-Demand Fabrication</h5>
                <p>Shoes are only 3D-printed and assembled once an order is locked. Zero dead inventory.</p>
              </div>
            </div>
            <div className="pillar-item">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <h5>Recyclable Bio-Polymers</h5>
                <p>Every pair can be disassembled and remelted into fresh filament at end-of-life.</p>
              </div>
            </div>
            <div className="pillar-item">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <h5>Precision Anatomy</h5>
                <p>Optimized for natural foot biomechanics, distributing ground forces across 1.2M micro-struts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
