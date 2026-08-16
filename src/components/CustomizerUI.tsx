"use client";

import React, { useState, useRef } from "react";
import {
  useCustomizer,
  ShoePartId,
  FinishType,
  LightingPreset,
  CameraAngle,
  PART_NAMES,
  PALETTE_SWATCHES,
  PRESET_COLORWAYS,
} from "@/context/CustomizerContext";
import {
  Sparkles,
  Camera,
  RotateCw,
  Share2,
  Upload,
  Check,
  HelpCircle,
  ShoppingBag,
  Shuffle,
  Sun,
  Layers,
  Box,
  Eye,
  Contrast,
} from "lucide-react";
import { sound } from "@/utils/audio";

const FINISH_OPTIONS: { id: FinishType; label: string; desc: string; extra: number }[] = [
  { id: "matte", label: "Matte Technical", desc: "Anti-glare micro-weave finish", extra: 0 },
  { id: "gloss", label: "High-Gloss Patent", desc: "Ultra-reflective liquid coat", extra: 10 },
  { id: "metallic", label: "Aerospace Titanium", desc: "Brushed metallic luster", extra: 15 },
  { id: "luminescent", label: "Neon Luminescence", desc: "Self-illuminating photon glow", extra: 25 },
  { id: "carbon", label: "Carbon Composite", desc: "High-tensile carbon weave", extra: 20 },
  { id: "suede", label: "Tactile Suede", desc: "Micro-fiber velvet nap", extra: 15 },
];

const LIGHTING_MODES: { id: LightingPreset; label: string; icon: string }[] = [
  { id: "studio", label: "Clean Studio", icon: "☀️" },
  { id: "cyberpunk", label: "Cyber Neon", icon: "⚡" },
  { id: "sunset", label: "Golden Dusk", icon: "🌅" },
  { id: "midnight", label: "Midnight Dark", icon: "🌑" },
];

const CAMERA_PRESETS: { id: CameraAngle; label: string }[] = [
  { id: "isometric", label: "3D Angle" },
  { id: "side", label: "Side View" },
  { id: "top", label: "Top Down" },
  { id: "front", label: "Front Toe" },
  { id: "heel", label: "Heel Grip" },
  { id: "sole", label: "Under Sole" },
];

const SIZES = [
  "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5",
  "US 10", "US 10.5", "US 11", "US 11.5", "US 12", "US 13"
];

export default function CustomizerUI() {
  const {
    activePart,
    setActivePart,
    colors,
    updateColor,
    finishes,
    updateFinish,
    engraving,
    setEngraving,
    selectedSize,
    setSelectedSize,
    calculatedPrice,
    lighting,
    setLighting,
    cameraAngle,
    setCameraAngle,
    autoRotate,
    setAutoRotate,
    wireframe,
    setWireframe,
    highContrast,
    toggleHighContrast,
    modelType,
    setModelType,
    setCustomModelUrl,
    isCustomModel,
    activePresetId,
    applyPreset,
    randomizeDesign,
    addToCart,
    setSizeGuideOpen,
    triggerSnapshot,
  } = useCustomizer();

  const [activeTab, setActiveTab] = useState<"parts" | "finishes" | "presets" | "studio">("parts");
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShare = () => {
    sound.playClick(800, 0.04);
    const config = {
      colors,
      finishes,
      size: selectedSize,
      engraving,
    };
    const encoded = encodeURIComponent(JSON.stringify(config));
    const url = `${window.location.origin}/store?custom=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playSuccess();
      const url = URL.createObjectURL(file);
      setCustomModelUrl(url);
    }
  };

  return (
    <div className="customizer-ui-container">
      {/* Top Floating Controls Bar */}
      <div className="customizer-top-bar">
        <div className="camera-pills">
          {CAMERA_PRESETS.map((cam) => (
            <button
              key={cam.id}
              className={`pill-btn ${cameraAngle === cam.id ? "active" : ""}`}
              onClick={() => setCameraAngle(cam.id)}
            >
              {cam.label}
            </button>
          ))}
        </div>

        <div className="top-action-group">
          <button
            className={`icon-pill-btn ${autoRotate ? "active" : ""}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Rotation"
          >
            <RotateCw size={15} className={autoRotate ? "spin-slow" : ""} />
            <span>{autoRotate ? "Spinning" : "Paused"}</span>
          </button>

          <button
            className={`icon-pill-btn ${wireframe ? "active" : ""}`}
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Mesh Wireframe"
          >
            <Box size={15} />
            <span>Wireframe</span>
          </button>

          <button
            className={`icon-pill-btn ${highContrast ? "active" : ""}`}
            onClick={toggleHighContrast}
            title="Toggle High Contrast Canvas (#E5E7EB)"
          >
            <Contrast size={15} />
            <span>{highContrast ? "Contrast: ON" : "High Contrast"}</span>
          </button>

          <button
            className="icon-pill-btn highlight"
            onClick={triggerSnapshot}
            title="Download 4K Rendering"
          >
            <Camera size={15} />
            <span>Capture 4K</span>
          </button>

          <button className="icon-pill-btn" onClick={handleShare} title="Share Custom Spec">
            {copiedLink ? <Check size={15} color="#39ff14" /> : <Share2 size={15} />}
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Customization Panel */}
      <div className="customizer-panel">
        {/* Panel Tabs */}
        <div className="panel-tabs">
          <button
            className={`tab-btn ${activeTab === "parts" ? "active" : ""}`}
            onClick={() => {
              sound.playClick(500, 0.02);
              setActiveTab("parts");
            }}
          >
            <Layers size={15} />
            <span>Components</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "finishes" ? "active" : ""}`}
            onClick={() => {
              sound.playClick(500, 0.02);
              setActiveTab("finishes");
            }}
          >
            <Sparkles size={15} />
            <span>Materials</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "presets" ? "active" : ""}`}
            onClick={() => {
              sound.playClick(500, 0.02);
              setActiveTab("presets");
            }}
          >
            <Eye size={15} />
            <span>Colorways</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "studio" ? "active" : ""}`}
            onClick={() => {
              sound.playClick(500, 0.02);
              setActiveTab("studio");
            }}
          >
            <Sun size={15} />
            <span>Studio & Model</span>
          </button>
        </div>

        {/* Tab 1: Shoe Parts & Colors */}
        {activeTab === "parts" && (
          <div className="tab-content">
            <div className="section-title-row">
              <span className="section-eyebrow">SELECT ANATOMY TO CUSTOMIZE</span>
              <button className="text-link-btn" onClick={randomizeDesign}>
                <Shuffle size={13} />
                <span>Randomize</span>
              </button>
            </div>

            {/* Part Selector Pills */}
            <div className="part-grid">
              {(Object.keys(PART_NAMES) as ShoePartId[]).map((partKey) => {
                const info = PART_NAMES[partKey];
                const isSelected = activePart === partKey;
                const partColor = colors[partKey];

                return (
                  <button
                    key={partKey}
                    className={`part-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setActivePart(partKey)}
                  >
                    <div className="part-color-indicator" style={{ backgroundColor: partColor }} />
                    <div className="part-meta">
                      <span className="part-label">{info.label}</span>
                      <span className="part-finish-tag">{finishes[partKey]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Palette for Selected Part */}
            <div className="color-section">
              <div className="color-header">
                <div>
                  <span className="color-target-title">
                    Editing: <span className="highlight-text">{PART_NAMES[activePart].label}</span>
                  </span>
                  <p className="color-target-desc">{PART_NAMES[activePart].desc}</p>
                </div>
                <div className="current-color-badge">
                  <div
                    className="swatch-preview"
                    style={{ backgroundColor: colors[activePart] }}
                  />
                  <span className="hex-label">{colors[activePart].toUpperCase()}</span>
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="swatches-grid">
                {PALETTE_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    className={`swatch-btn ${
                      colors[activePart].toLowerCase() === swatch.hex.toLowerCase()
                        ? "swatch-active"
                        : ""
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                    onClick={() => updateColor(activePart, swatch.hex)}
                    title={`${swatch.name} (${swatch.hex})`}
                  />
                ))}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="custom-hex-row">
                <label className="custom-hex-label">
                  <span>Custom Color:</span>
                  <div className="color-picker-input-wrapper">
                    <input
                      type="color"
                      value={colors[activePart]}
                      onChange={(e) => updateColor(activePart, e.target.value)}
                      className="native-color-picker"
                    />
                    <span className="picker-color-dot" style={{ backgroundColor: colors[activePart] }} />
                  </div>
                </label>
                <input
                  type="text"
                  value={colors[activePart]}
                  maxLength={7}
                  onChange={(e) => updateColor(activePart, e.target.value)}
                  className="hex-text-input"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Material Sheen & Finishes */}
        {activeTab === "finishes" && (
          <div className="tab-content">
            <div className="section-title-row">
              <span className="section-eyebrow">SURFACE FINISH & TEXTURE</span>
              <span className="target-part-badge">{PART_NAMES[activePart].label}</span>
            </div>

            <div className="finishes-list">
              {FINISH_OPTIONS.map((opt) => {
                const isSelected = finishes[activePart] === opt.id;

                return (
                  <button
                    key={opt.id}
                    className={`finish-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => updateFinish(activePart, opt.id)}
                  >
                    <div className="finish-left">
                      <div className={`finish-icon-blob finish-${opt.id}`} />
                      <div className="finish-info">
                        <span className="finish-name">{opt.label}</span>
                        <span className="finish-desc">{opt.desc}</span>
                      </div>
                    </div>
                    <div className="finish-price-tag">
                      {opt.extra === 0 ? "Standard" : `+$${opt.extra}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Engraving / Monogram */}
            <div className="engraving-section">
              <span className="section-eyebrow">CUSTOM HEEL MONOGRAM (+ $15)</span>
              <p className="engraving-desc">
                Laser-etch your initials or serial number into the rear stabilization bracket.
              </p>
              <div className="engraving-input-wrap">
                <input
                  type="text"
                  maxLength={8}
                  value={engraving}
                  onChange={(e) => setEngraving(e.target.value.toUpperCase())}
                  placeholder="E.G. 'KINETIC' OR '007'"
                  className="engraving-input"
                />
                <span className="char-count">{engraving.length}/8</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Preset Colorways */}
        {activeTab === "presets" && (
          <div className="tab-content">
            <div className="section-title-row">
              <span className="section-eyebrow">SIGNATURE ARCHIVE COLORWAYS</span>
            </div>

            <div className="presets-grid">
              {PRESET_COLORWAYS.map((preset) => {
                const isActive = activePresetId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className={`preset-card ${isActive ? "active" : ""}`}
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="preset-header">
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-price">${preset.price}</span>
                    </div>
                    <p className="preset-tagline">{preset.tagline}</p>
                    <div className="preset-palette-preview">
                      {Object.values(preset.colors).map((c, i) => (
                        <div
                          key={i}
                          className="preset-swatch-dot"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Studio Lighting & Custom 3D Model Upload */}
        {activeTab === "studio" && (
          <div className="tab-content">
            <div className="section-title-row">
              <span className="section-eyebrow">LIGHTING ENVIRONMENT</span>
            </div>

            <div className="lighting-grid">
              {LIGHTING_MODES.map((l) => (
                <button
                  key={l.id}
                  className={`lighting-card ${lighting === l.id ? "active" : ""}`}
                  onClick={() => setLighting(l.id)}
                >
                  <span className="lighting-icon">{l.icon}</span>
                  <span className="lighting-label">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Accessibility & Canvas Contrast Section */}
            <div className="section-title-row">
              <span className="section-eyebrow">ACCESSIBILITY & CANVAS CONTRAST</span>
            </div>

            <div className="contrast-card">
              <div className="contrast-card-left">
                <div className="contrast-icon-wrap">
                  <Contrast size={18} />
                </div>
                <div className="contrast-card-info">
                  <div className="contrast-card-header">
                    <span className="contrast-title">High Contrast Mode</span>
                    <span className={`contrast-badge ${highContrast ? "on" : "off"}`}>
                      {highContrast ? "LIGHT GRAY (#E5E7EB)" : "DARK THEME"}
                    </span>
                  </div>
                  <p className="contrast-desc">
                    Flips the 3D canvas background to <strong>#E5E7EB</strong> light gray for enhanced luminance contrast and edge perception.
                  </p>
                </div>
              </div>

              <button
                className={`high-contrast-btn ${highContrast ? "active" : ""}`}
                onClick={toggleHighContrast}
                aria-pressed={highContrast}
              >
                <Contrast size={15} />
                <span>{highContrast ? "Disable High Contrast" : "Enable High Contrast"}</span>
              </button>
            </div>

            {/* 3D Model Silhouette Selector */}
            <div className="section-title-row">
              <span className="section-eyebrow">ACTIVE 3D MESH SILHOUETTE</span>
            </div>

            <div className="model-selector-grid">
              <button
                className={`model-select-card ${modelType === "shoe_obj" && !isCustomModel ? "active" : ""}`}
                onClick={() => {
                  setCustomModelUrl(null);
                  setModelType("shoe_obj");
                }}
              >
                <div className="model-card-header">
                  <span className="model-name">Shoe.obj Asset</span>
                  <span className="brand-asset-badge">Original Asset</span>
                </div>
                <p className="model-desc">Official 3D shoe object from your assets with multi-zone vertex shading.</p>
              </button>

              <button
                className={`model-select-card ${modelType === "modular_sneaker" && !isCustomModel ? "active" : ""}`}
                onClick={() => {
                  setCustomModelUrl(null);
                  setModelType("modular_sneaker");
                }}
              >
                <div className="model-card-header">
                  <span className="model-name">Modular Sneaker</span>
                  <span className="modular-badge">Multi-Mesh</span>
                </div>
                <p className="model-desc">Anatomical 8-component performance sneaker geometry.</p>
              </button>
            </div>

            {/* Custom 3D Asset Import */}
            <div className="model-upload-box">
              <div className="section-title-row">
                <span className="section-eyebrow">IMPORT CUSTOM 3D ASSET (.GLB / .GLTF)</span>
              </div>
              <p className="upload-desc">
                Have your own 3D sneaker mesh? Upload any .glb file to inspect and render it inside the NextStep WebGL engine.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".glb,.gltf"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />

              <div className="upload-actions">
                <button
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>{isCustomModel ? "Change Custom .GLB" : "Upload .GLB Asset"}</span>
                </button>

                {isCustomModel && (
                  <button
                    className="reset-model-btn"
                    onClick={() => {
                      sound.playClick(400, 0.05);
                      setCustomModelUrl(null);
                    }}
                  >
                    Reset to Default Kinesis Sneaker
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sizing & Final Purchase Footer */}
        <div className="customizer-bottom-bar">
          <div className="size-selector-row">
            <div className="size-header">
              <span className="size-label">Select Size:</span>
              <button
                className="size-guide-btn"
                onClick={() => {
                  sound.playClick(600, 0.02);
                  setSizeGuideOpen(true);
                }}
              >
                <HelpCircle size={13} />
                <span>Size Guide</span>
              </button>
            </div>
            <div className="size-pills-scroll">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={`size-pill ${selectedSize === s ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(700, 0.02);
                    setSelectedSize(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="checkout-cta-row">
            <div className="price-display">
              <span className="price-label">TOTAL CONFIGURATION</span>
              <div className="price-value">
                ${calculatedPrice} <span className="currency">USD</span>
              </div>
            </div>

            <button className="add-cart-btn" onClick={addToCart}>
              <ShoppingBag size={18} />
              <span>Add Custom Pair to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
