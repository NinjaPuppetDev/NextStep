"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ShoeCanvas from "@/components/ShoeCanvas";
import SafeImage, {
  LOCAL_LOOKBOOK_FALLBACKS,
  LOCAL_COLLECTION_FALLBACKS,
  resolveValidSrc,
} from "@/components/SafeImage";
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
import { useCMS } from "@/context/CMSContext";
import { sound } from "@/utils/audio";

export default function HomePage() {
  const { applyPreset, setLookbookModalImg } = useCustomizer();
  const { getSlot } = useCMS();
  const [selectedHeroPreset, setSelectedHeroPreset] = useState(PRESET_COLORWAYS[0]);
  const [activeTechTab, setActiveTechTab] = useState<"cushion" | "upper" | "plate" | "tread">("cushion");

  const edition01 = { ...getSlot("edition_01"), url: "/images/image1.png" };
  const edition02 = { ...getSlot("edition_02"), url: "/images/image2.png" };
  const edition03 = { ...getSlot("edition_03"), url: "/images/image3.png" };

  const lookbook01 = { ...getSlot("lookbook_01"), url: "/images/editorial1.png" };
  const lookbook02 = { ...getSlot("lookbook_02"), url: "/images/editorial2.png" };
  const lookbook03 = { ...getSlot("lookbook_03"), url: "/images/editorial3.png" };

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
              <span>DROP 01 // ON-DEMAND DIGITAL MANUFACTURING</span>
            </div>

            <h1 className="hero-title">
              3D PRINTED SHOES<br />
              <span style={{ whiteSpace: "nowrap" }}>
                DESIGNED AROUND <span className="highlight-word">YOU</span>
              </span>
            </h1>
            
            <p className="hero-description">
              Customizable 3D-printed footwear designed around your movement and manufactured on demand.
            </p>

            {/* Live Spec Metrics */}
            <div className="hero-metrics-bar">
              <div className="metric-item">
                <span className="metric-val">Lightweight</span>
                <span className="metric-lbl">Engineered Comfort</span>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <span className="metric-val">Customizable</span>
                <span className="metric-lbl">Color, Material & Fit</span>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <span className="metric-val">3D Printed</span>
                <span className="metric-lbl">Made on Demand</span>
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
                <span>Customize yours</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#collection"
                className="hero-secondary-btn"
                onClick={() => sound.playClick(600, 0.02)}
              >
                <span>Explore Collection</span>
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
                <span>Interactive 3D Preview</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Shoe Canvas */}
          <div className="hero-3d-viewport">
            <div className="canvas-header-indicator">
              <div className="indicator-dot" />
              <span>LIVE 3D VIEWPORT • DRAG TO ROTATE</span>
            </div>

            <div className="canvas-container-3d">
              <ShoeCanvas interactive={true} />
            </div>

            {/* Floating Spatial Spec Overlays */}
            <div className="spatial-chip chip-top-right">
              <div className="chip-header">
                <Cpu size={13} color="#00f0ff" />
                <span>3D PRINTED STRUCTURE</span>
              </div>
              <p>Precision engineered lattice support</p>
            </div>

            <div className="spatial-chip chip-bottom-left">
              <div className="chip-header">
                <Layers size={13} color="#39ff14" />
                <span>CUSTOM CUSHIONING</span>
              </div>
              <p>Designed around how you move</p>
            </div>

            {/* Quick customize direct link button */}
            <Link
              href="/store"
              className="canvas-enter-studio-pill"
              onClick={() => sound.playSuccess()}
            >
              <Sliders size={14} />
              <span>Customize in 3D</span>
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
            Base silhouettes ready to wear or customize in 3D around your personal style and fit.
          </p>
        </div>

        <div className="lineup-grid">
          {/* Card 1: Lime Cyber Runner */}
          <div className="lineup-card">
            <div className="card-badge">EDITION 01</div>
            <div className="card-image-wrap">
              <SafeImage
                src={edition01.url}
                fallbackKey="edition-01"
                fallbackMap={LOCAL_COLLECTION_FALLBACKS}
                alt={edition01.alt || "Edition 01 Runner"}
                width={500}
                height={350}
                className="lineup-img"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>{edition01.title || "CYBER // VOLT"}</h3>
                <span className="card-price">{edition01.price || "$245 USD"}</span>
              </div>
              <p className="card-desc">
                {edition01.subtitle || "Breathable knit upper with flexible 3D-printed lattice cushioning for responsive everyday comfort."}
              </p>
              <div className="card-spec-tags">
                <span>3D Printed Sole</span>
                <span>Breathable Knit</span>
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
              <SafeImage
                src={edition02.url}
                fallbackKey="edition-02"
                fallbackMap={LOCAL_COLLECTION_FALLBACKS}
                alt={edition02.alt || "Edition 02 Runner"}
                width={500}
                height={350}
                className="lineup-img"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>{edition02.title || "STEALTH // ONYX"}</h3>
                <span className="card-price">{edition02.price || "$230 USD"}</span>
              </div>
              <p className="card-desc">
                {edition02.subtitle || "Clean monochromatic matte finish paired with targeted 3D-printed impact support."}
              </p>
              <div className="card-spec-tags">
                <span>Matte Finish</span>
                <span>Custom Cushion</span>
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
              <SafeImage
                src={edition03.url}
                fallbackKey="edition-03"
                fallbackMap={LOCAL_COLLECTION_FALLBACKS}
                alt={edition03.alt || "Edition 03 Runner"}
                width={500}
                height={350}
                className="lineup-img"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div className="card-info">
              <div className="card-header">
                <h3>{edition03.title || "GLACIER // NEON"}</h3>
                <span className="card-price">{edition03.price || "$260 USD"}</span>
              </div>
              <p className="card-desc">
                {edition03.subtitle || "Crisp white upper accented with neon highlights and an adaptive lattice midsole."}
              </p>
              <div className="card-spec-tags">
                <span>Adaptive Lattice</span>
                <span>Durable Weave</span>
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
            <span className="section-eyebrow">MATERIALS & INNOVATION</span>
            <h2 className="section-title">THE FUTURE IS PRINTED</h2>
            <p className="section-subtitle">
              We use advanced 3D printing and high-performance materials to develop footwear that adapts to your needs.
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
                1. 3D Printed Structure
              </button>
              <button
                className={`tech-pill ${activeTechTab === "upper" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("upper");
                }}
              >
                2. Advanced Materials
              </button>
              <button
                className={`tech-pill ${activeTechTab === "plate" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("plate");
                }}
              >
                3. Custom Fit
              </button>
              <button
                className={`tech-pill ${activeTechTab === "tread" ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setActiveTechTab("tread");
                }}
              >
                4. All-Surface Traction
              </button>
            </div>

            {/* Tab Descriptions */}
            <div className="tech-tab-detail-card">
              {activeTechTab === "cushion" && (
                <div>
                  <h3 className="tab-card-title">3D Printed Structure</h3>
                  <p className="tab-card-desc">
                    Precision-engineered lattice cushioning delivers targeted support and flexibility exactly where your foot needs it most.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">Targeted</span>
                      <span className="stat-desc">Lattice Support</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Zero</span>
                      <span className="stat-desc">Excess Waste</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Adaptive</span>
                      <span className="stat-desc">Cushioning</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTechTab === "upper" && (
                <div>
                  <h3 className="tab-card-title">Advanced Materials</h3>
                  <p className="tab-card-desc">
                    Flexible, durable polymers and breathable engineered knits designed for long-lasting everyday comfort.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">Durable</span>
                      <span className="stat-desc">High-Grade Polymers</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Breathable</span>
                      <span className="stat-desc">Engineered Weave</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Comfort</span>
                      <span className="stat-desc">All-Day Wear</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTechTab === "plate" && (
                <div>
                  <h3 className="tab-card-title">Custom Fit & Design</h3>
                  <p className="tab-card-desc">
                    A digital design process built around the wearer, allowing seamless personal customization from color to materials.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">Personalized</span>
                      <span className="stat-desc">Color & Finish</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Digital</span>
                      <span className="stat-desc">Manufacturing</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Made for You</span>
                      <span className="stat-desc">On-Demand</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTechTab === "tread" && (
                <div>
                  <h3 className="tab-card-title">All-Surface Traction</h3>
                  <p className="tab-card-desc">
                    Multi-directional tread geometry designed for steady grip across urban sidewalks and varied surfaces.
                  </p>
                  <div className="tab-stats-row">
                    <div className="stat-box">
                      <span className="stat-num">360°</span>
                      <span className="stat-desc">Grip & Stability</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Durable</span>
                      <span className="stat-desc">Rubber Compound</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-num">Flexible</span>
                      <span className="stat-desc">Natural Stride</span>
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
                alt="NextStep High-Performance Shoe Materials"
                width={700}
                height={400}
                className="tech-material-img"
              />
              <div className="tech-overlay-tag">
                <Sparkles size={14} color="#39ff14" />
                <span>DIGITAL FABRICATION LAB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EDITORIAL LOOKBOOK GALLERY */}
      <section className="lookbook-section" id="lookbook">
        <div className="section-header-centered">
          <span className="section-eyebrow">CAMPAIGN 2026</span>
          <h2 className="section-title">MADE FOR EVERY MOVE</h2>
          <p className="section-subtitle">
            Built for life in motion. Designed for everyday comfort, movement, and personal expression.
          </p>
        </div>

        <div className="lookbook-gallery-grid">
          {/* Item 1: Urban Promenade */}
          <div
            className="gallery-item large"
            onClick={() => {
              sound.playSelect();
              setLookbookModalImg(resolveValidSrc(lookbook01.url, "lookbook-01", LOCAL_LOOKBOOK_FALLBACKS));
            }}
          >
            <SafeImage
              src={lookbook01.url}
              fallbackKey="lookbook-01"
              fallbackMap={LOCAL_LOOKBOOK_FALLBACKS}
              alt={lookbook01.alt || "Lookbook 01 Shoot"}
              width={900}
              height={600}
              className="gallery-img"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="gallery-hover-overlay">
              <div className="hover-content">
                <span className="gallery-tag">{lookbook01.subtitle || "LOOKBOOK 01 // EVERYDAY MOTION"}</span>
                <h3>{lookbook01.title || "Street & Urban Flow"}</h3>
                <span className="view-link">
                  <Eye size={15} /> Click to View High-Res
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
              setLookbookModalImg(resolveValidSrc(lookbook02.url, "lookbook-02", LOCAL_LOOKBOOK_FALLBACKS));
            }}
          >
            <SafeImage
              src={lookbook02.url}
              fallbackKey="lookbook-02"
              fallbackMap={LOCAL_LOOKBOOK_FALLBACKS}
              alt={lookbook02.alt || "Lookbook 02 Shoot"}
              width={600}
              height={800}
              className="gallery-img"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="gallery-hover-overlay">
              <div className="hover-content">
                <span className="gallery-tag">{lookbook02.subtitle || "LOOKBOOK 02 // ACTIVE MOVEMENT"}</span>
                <h3>{lookbook02.title || "Outdoor & Trail Pace"}</h3>
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
              setLookbookModalImg(resolveValidSrc(lookbook03.url, "lookbook-03", LOCAL_LOOKBOOK_FALLBACKS));
            }}
          >
            <SafeImage
              src={lookbook03.url}
              fallbackKey="lookbook-03"
              fallbackMap={LOCAL_LOOKBOOK_FALLBACKS}
              alt={lookbook03.alt || "Lookbook 03 Shoot"}
              width={600}
              height={800}
              className="gallery-img"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div className="gallery-hover-overlay">
              <div className="hover-content">
                <span className="gallery-tag">{lookbook03.subtitle || "LOOKBOOK 03 // DETAIL & CRAFT"}</span>
                <h3>{lookbook03.title || "Precision Lattice Structure"}</h3>
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
            <span>3D CUSTOMIZATION STUDIO</span>
          </div>
          <h2 className="atelier-headline">
            CUSTOMIZE YOUR PAIR.<br />
            MAKE IT YOURS.
          </h2>
          <p className="atelier-sub">
            Personalize your shoe from upper to sole. Choose from curated colorways, rich textures, and custom details with real-time 3D controls.
          </p>

          <div className="atelier-feature-grid">
            <div className="atelier-card">
              <div className="feature-num">01</div>
              <h4>Color</h4>
              <p>Personalize every section from the upper and sole to the laces and accents.</p>
            </div>
            <div className="atelier-card">
              <div className="feature-num">02</div>
              <h4>Material</h4>
              <p>Select finishes ranging from matte and gloss to durable composites and tactile suede.</p>
            </div>
            <div className="atelier-card">
              <div className="feature-num">03</div>
              <h4>Fit & Detail</h4>
              <p>Choose your size, add a custom heel monogram, and preview your pair from every angle.</p>
            </div>
          </div>

          <div className="atelier-cta-wrap">
            <Link
              href="/store"
              className="atelier-big-btn"
              onClick={() => sound.playSuccess()}
            >
              <span>Customize in 3D</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. BRAND MANIFESTO & PHILOSOPHY */}
      <section className="manifesto-section" id="manifesto">
        <div className="manifesto-container">
          <span className="section-eyebrow">OUR PHILOSOPHY</span>
          <h2 className="manifesto-quote">
            &ldquo;FOOTWEAR DESIGNED AROUND THE WEARER, MADE ON DEMAND WITH ZERO EXCESS INVENTORY.&rdquo;
          </h2>
          <div className="manifesto-pillars">
            <div className="pillar-item">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <h5>On-Demand Fabrication</h5>
                <p>Shoes are produced once an order is placed, reducing the need for excess inventory.</p>
              </div>
            </div>
            <div className="pillar-item">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <h5>Recyclable Materials</h5>
                <p>Designed with high-performance polymers and material recovery in mind.</p>
              </div>
            </div>
            <div className="pillar-item">
              <CheckCircle size={18} color="#39ff14" />
              <div>
                <h5>Precision Design</h5>
                <p>Digital manufacturing allows the geometry of the product to be adjusted and refined at a granular level for comfort and support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
