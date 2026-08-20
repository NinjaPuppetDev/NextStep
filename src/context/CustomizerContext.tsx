"use client";

import React, { createContext, useContext, useState } from "react";
import { sound } from "@/utils/audio";

export type ShoePartId =
  | "upper"
  | "sole"
  | "outsole"
  | "laces"
  | "accent"
  | "inner"
  | "tongue"
  | "hardware";

export type FinishType = "matte" | "gloss" | "metallic" | "luminescent" | "carbon" | "suede";

export type LightingPreset = "studio" | "cyberpunk" | "sunset" | "midnight";

export type CameraAngle = "isometric" | "side" | "top" | "front" | "heel" | "sole";

export interface ShoeColors {
  upper: string;
  sole: string;
  outsole: string;
  laces: string;
  accent: string;
  inner: string;
  tongue: string;
  hardware: string;
}

export interface ShoeFinishes {
  upper: FinishType;
  sole: FinishType;
  outsole: FinishType;
  laces: FinishType;
  accent: FinishType;
  inner: FinishType;
  tongue: FinishType;
  hardware: FinishType;
}

export interface PresetColorway {
  id: string;
  name: string;
  tagline: string;
  colors: ShoeColors;
  finishes?: Partial<ShoeFinishes>;
  themeColor: string;
  price: number;
}

export interface CartItem {
  id: string;
  modelName: string;
  colors: ShoeColors;
  finishes: ShoeFinishes;
  size: string;
  price: number;
  engraving?: string;
  quantity: number;
  timestamp: number;
}

export const PRESET_COLORWAYS: PresetColorway[] = [
  {
    id: "cyber-volt",
    name: "CYBER VOLT // 01",
    tagline: "High-visibility fluorescent luminescence on #2D3238 charcoal core",
    themeColor: "#39ff14",
    price: 245,
    colors: {
      upper: "#2D3238",
      sole: "#2D3238",
      outsole: "#2D3238",
      laces: "#39ff14",
      accent: "#39ff14",
      inner: "#2D3238",
      tongue: "#2D3238",
      hardware: "#c8ff00",
    },
    finishes: {
      accent: "luminescent",
      laces: "luminescent",
      upper: "carbon",
    },
  },
  {
    id: "stealth-void",
    name: "STEALTH ONYX // 00",
    tagline: "Monochromatic #2D3238 charcoal architecture with light-absorbing finish",
    themeColor: "#2D3238",
    price: 230,
    colors: {
      upper: "#2D3238",
      sole: "#24292e",
      outsole: "#1a1e22",
      laces: "#2D3238",
      accent: "#3b414a",
      inner: "#2D3238",
      tongue: "#2D3238",
      hardware: "#4b5563",
    },
    finishes: {
      upper: "matte",
      accent: "metallic",
    },
  },
  {
    id: "polar-aurora",
    name: "POLAR AURORA // 02",
    tagline: "Crisp arctic titanium shell with cyan laser trim",
    themeColor: "#00f0ff",
    price: 250,
    colors: {
      upper: "#f3f6fa",
      sole: "#e2e8f0",
      outsole: "#00f0ff",
      laces: "#ffffff",
      accent: "#00f0ff",
      inner: "#cbd5e1",
      tongue: "#ffffff",
      hardware: "#38bdf8",
    },
    finishes: {
      accent: "luminescent",
      upper: "gloss",
    },
  },
  {
    id: "mars-terra",
    name: "MARS TERRA // 03",
    tagline: "Oxidized terracotta dunes with volcanic charcoal accents",
    themeColor: "#e65100",
    price: 240,
    colors: {
      upper: "#d84315",
      sole: "#271c19",
      outsole: "#1a1210",
      laces: "#1a1a1a",
      accent: "#ff7043",
      inner: "#2c1d1a",
      tongue: "#d84315",
      hardware: "#ffab91",
    },
    finishes: {
      upper: "suede",
      accent: "metallic",
    },
  },
  {
    id: "liquid-chrome",
    name: "TITANIUM CHROME // 04",
    tagline: "Polished aerospace alloys with ultra-reflective sheen",
    themeColor: "#94a3b8",
    price: 265,
    colors: {
      upper: "#94a3b8",
      sole: "#f8fafc",
      outsole: "#334155",
      laces: "#0f172a",
      accent: "#e2e8f0",
      inner: "#1e293b",
      tongue: "#64748b",
      hardware: "#cbd5e1",
    },
    finishes: {
      upper: "metallic",
      accent: "metallic",
    },
  },
  {
    id: "crimson-rush",
    name: "CRIMSON VELOCITY // 05",
    tagline: "High-adrenaline hyper-red with obsidian chassis",
    themeColor: "#e11d48",
    price: 245,
    colors: {
      upper: "#e11d48",
      sole: "#0f1115",
      outsole: "#9f1239",
      laces: "#ffffff",
      accent: "#fb7185",
      inner: "#18181b",
      tongue: "#e11d48",
      hardware: "#ffffff",
    },
    finishes: {
      upper: "gloss",
      accent: "luminescent",
    },
  },
];

export const PALETTE_SWATCHES = [
  { name: "Charcoal (#2D3238)", hex: "#2D3238" },
  { name: "Onyx Void", hex: "#111317" },
  { name: "Polar White", hex: "#f8fafc" },
  { name: "Cyber Volt", hex: "#39ff14" },
  { name: "Hyper Cyan", hex: "#00f0ff" },
  { name: "Crimson Red", hex: "#e11d48" },
  { name: "Solar Orange", hex: "#ff5e00" },
  { name: "Gold Titanium", hex: "#eab308" },
  { name: "Ultra Violet", hex: "#8b5cf6" },
  { name: "Desert Tan", hex: "#c2a688" },
  { name: "Slate Blue", hex: "#3b82f6" },
  { name: "Emerald Glitch", hex: "#10b981" },
  { name: "Magma Pink", hex: "#ec4899" },
  { name: "Graphite", hex: "#374151" },
  { name: "Cement Grey", hex: "#9ca3af" },
  { name: "Deep Navy", hex: "#0f172a" },
  { name: "Olive Drab", hex: "#4d5b3d" },
];

export const PART_NAMES: Record<ShoePartId, { label: string; desc: string }> = {
  upper: { label: "Upper Shell", desc: "Aeroknit multi-density engineered weave" },
  sole: { label: "Midsole Chassis", desc: "Kinetic rebound nitrogen-infused foam" },
  outsole: { label: "Grip Outsole", desc: "Bio-adaptive traction compound" },
  laces: { label: "Fast-Lacing Wire", desc: "Kevlar-reinforced tension laces" },
  accent: { label: "Accent Lateral", desc: "Structural support cage & aerodynamic wing" },
  inner: { label: "Collar Liner", desc: "Memory-foam sock liner for zero friction" },
  tongue: { label: "Tongue Gusset", desc: "Breathable ergonomic midfoot gusset" },
  hardware: { label: "Eyelets & Badges", desc: "Anodized laser-etched hardware" },
};

interface CustomizerContextType {
  // Shoe configuration
  activePart: ShoePartId;
  setActivePart: (part: ShoePartId) => void;
  colors: ShoeColors;
  updateColor: (part: ShoePartId, color: string) => void;
  setAllColors: (colors: ShoeColors) => void;
  finishes: ShoeFinishes;
  updateFinish: (part: ShoePartId, finish: FinishType) => void;
  
  // Custom text engraving
  engraving: string;
  setEngraving: (text: string) => void;
  
  // Sizing & Pricing
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  basePrice: number;
  calculatedPrice: number;
  
  // 3D Controls
  lighting: LightingPreset;
  setLighting: (l: LightingPreset) => void;
  cameraAngle: CameraAngle;
  setCameraAngle: (angle: CameraAngle) => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
  wireframe: boolean;
  setWireframe: (v: boolean) => void;
  
  // 3D Model Selection
  modelType: "shoe_obj" | "modular_sneaker" | "custom_upload";
  setModelType: (m: "shoe_obj" | "modular_sneaker" | "custom_upload") => void;

  // Custom uploaded model
  customModelUrl: string | null;
  setCustomModelUrl: (url: string | null) => void;
  isCustomModel: boolean;
  
  // Preset loader
  activePresetId: string | null;
  applyPreset: (preset: PresetColorway) => void;
  randomizeDesign: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: () => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartTotal: number;
  
  // UI Modals
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;
  lookbookModalImg: string | null;
  setLookbookModalImg: (img: string | null) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  
  // Accessibility & Visual Comfort
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  toggleHighContrast: () => void;
  
  // Snapshot trigger
  snapshotTrigger: number;
  triggerSnapshot: () => void;
}

function getInitialUrlConfig(): Partial<{
  colors: ShoeColors;
  finishes: ShoeFinishes;
  size: string;
  engraving: string;
}> {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("custom");
      if (encoded) {
        return JSON.parse(decodeURIComponent(encoded));
      }
    } catch {
      // Ignore
    }
  }
  return {};
}

const CustomizerContext = createContext<CustomizerContextType | undefined>(undefined);

export const CustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePart, setActivePart] = useState<ShoePartId>("upper");
  const [colors, setColors] = useState<ShoeColors>(() => {
    const urlConfig = getInitialUrlConfig();
    return urlConfig.colors || {
      upper: "#2D3238",
      sole: "#2D3238",
      outsole: "#2D3238",
      laces: "#39ff14",
      accent: "#39ff14",
      inner: "#2D3238",
      tongue: "#2D3238",
      hardware: "#c8ff00",
    };
  });

  const [finishes, setFinishes] = useState<ShoeFinishes>(() => {
    const urlConfig = getInitialUrlConfig();
    return urlConfig.finishes || {
      upper: "matte",
      sole: "matte",
      outsole: "matte",
      laces: "matte",
      accent: "luminescent",
      inner: "matte",
      tongue: "matte",
      hardware: "metallic",
    };
  });

  const [modelType, setModelType] = useState<"shoe_obj" | "modular_sneaker" | "custom_upload">("modular_sneaker");
  const [engraving, setEngraving] = useState<string>(() => {
    const urlConfig = getInitialUrlConfig();
    return urlConfig.engraving || "";
  });
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const urlConfig = getInitialUrlConfig();
    return urlConfig.size || "US 10.5";
  });
  const [lighting, setLighting] = useState<LightingPreset>("studio");
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>("isometric");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>("cyber-volt");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [lookbookModalImg, setLookbookModalImg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [snapshotTrigger, setSnapshotTrigger] = useState<number>(0);

  // Calculate pricing based on premium finishes and custom engraving
  const basePrice = 220;
  const finishSurcharges: Record<FinishType, number> = {
    matte: 0,
    gloss: 10,
    metallic: 15,
    luminescent: 25,
    carbon: 20,
    suede: 15,
  };

  const calculatedPrice =
    basePrice +
    (Object.values(finishes) as FinishType[]).reduce(
      (sum, f) => sum + (finishSurcharges[f] || 0),
      0
    ) +
    (engraving.trim() ? 15 : 0);

  const updateColor = (part: ShoePartId, color: string) => {
    sound.playClick(750, 0.03);
    setColors((prev) => ({ ...prev, [part]: color }));
    setActivePresetId(null);
  };

  const updateFinish = (part: ShoePartId, finish: FinishType) => {
    sound.playSelect();
    setFinishes((prev) => ({ ...prev, [part]: finish }));
  };

  const setAllColors = (newColors: ShoeColors) => {
    setColors(newColors);
  };

  const applyPreset = (preset: PresetColorway) => {
    sound.playSuccess();
    setColors(preset.colors);
    if (preset.finishes) {
      setFinishes((prev) => ({ ...prev, ...preset.finishes }));
    }
    setActivePresetId(preset.id);
  };

  const randomizeDesign = () => {
    sound.playClick(900, 0.05);
    const randomColor = () =>
      PALETTE_SWATCHES[Math.floor(Math.random() * PALETTE_SWATCHES.length)].hex;
    setColors({
      upper: randomColor(),
      sole: randomColor(),
      outsole: randomColor(),
      laces: randomColor(),
      accent: randomColor(),
      inner: randomColor(),
      tongue: randomColor(),
      hardware: randomColor(),
    });
    setActivePresetId(null);
  };

  const triggerSnapshot = () => {
    sound.playShutter();
    setSnapshotTrigger((prev) => prev + 1);
  };

  const toggleSound = () => {
    const next = sound.toggleMute();
    setSoundEnabled(next);
  };

  const toggleHighContrast = () => {
    sound.playSelect();
    setHighContrast((prev) => !prev);
  };

  const addToCart = () => {
    sound.playSuccess();
    const newItem: CartItem = {
      id: "cart-" + Date.now(),
      modelName: "NEXTSTEP // NEXUS-01",
      colors: { ...colors },
      finishes: { ...finishes },
      size: selectedSize,
      price: calculatedPrice,
      engraving: engraving.trim() || undefined,
      quantity: 1,
      timestamp: Date.now(),
    };
    setCart((prev) => [newItem, ...prev]);
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    sound.playClick(400, 0.05);
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    sound.playClick(600, 0.03);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CustomizerContext.Provider
      value={{
        activePart,
        setActivePart: (part) => {
          sound.playClick(500, 0.02);
          setActivePart(part);
        },
        colors,
        updateColor,
        setAllColors,
        finishes,
        updateFinish,
        engraving,
        setEngraving,
        selectedSize,
        setSelectedSize,
        basePrice,
        calculatedPrice,
        lighting,
        setLighting: (l) => {
          sound.playSelect();
          setLighting(l);
        },
        cameraAngle,
        setCameraAngle: (angle) => {
          sound.playSelect();
          setCameraAngle(angle);
        },
        autoRotate,
        setAutoRotate,
        wireframe,
        setWireframe,
        modelType,
        setModelType: (m) => {
          sound.playSelect();
          setModelType(m);
        },
        customModelUrl,
        setCustomModelUrl,
        isCustomModel: !!customModelUrl,
        activePresetId,
        applyPreset,
        randomizeDesign,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartOpen,
        setCartOpen,
        cartTotal,
        checkoutOpen,
        setCheckoutOpen,
        sizeGuideOpen,
        setSizeGuideOpen,
        lookbookModalImg,
        setLookbookModalImg,
        soundEnabled,
        toggleSound,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        snapshotTrigger,
        triggerSnapshot,
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error("useCustomizer must be used within a CustomizerProvider");
  }
  return context;
};
