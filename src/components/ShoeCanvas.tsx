"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import  ShoeModel from "./ShoeModel";
import { useCustomizer, CameraAngle, LightingPreset } from "@/context/CustomizerContext";

// Camera Controller that interpolates camera to specific angle presets
function CameraRig({ cameraAngle }: { cameraAngle: CameraAngle }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(3.2, 1.8, 3.8));

  useEffect(() => {
    switch (cameraAngle) {
      case "side":
        targetPos.current.set(0, 0.4, 4.2);
        break;
      case "top":
        targetPos.current.set(0, 4.5, 0.2);
        break;
      case "front":
        targetPos.current.set(3.8, 0.6, 0);
        break;
      case "heel":
        targetPos.current.set(-3.8, 0.6, 0);
        break;
      case "sole":
        targetPos.current.set(0, -3.8, 1.0);
        break;
      case "isometric":
      default:
        targetPos.current.set(3.0, 1.6, 3.5);
        break;
    }
  }, [cameraAngle]);

  useEffect(() => {
    // Smooth camera jump
    camera.position.lerp(targetPos.current, 0.9);
    camera.lookAt(0, 0, 0);
  }, [cameraAngle, camera]);

  return null;
}

// Lighting Rig for Studio Presets
function LightingRig({ preset }: { preset: LightingPreset }) {
  switch (preset) {
    case "cyberpunk":
      return (
        <>
          <ambientLight intensity={0.4} color="#0f172a" />
          <directionalLight position={[5, 6, 4]} intensity={1.8} color="#00f0ff" castShadow />
          <pointLight position={[-4, 2, -3]} intensity={4.5} color="#ec4899" distance={12} />
          <pointLight position={[3, -2, 2]} intensity={3.5} color="#39ff14" distance={10} />
          <spotLight
            position={[0, 8, 0]}
            intensity={2.0}
            angle={0.5}
            penumbra={0.8}
            color="#a855f7"
          />
        </>
      );
    case "sunset":
      return (
        <>
          <ambientLight intensity={0.6} color="#7c2d12" />
          <directionalLight
            position={[6, 3, 5]}
            intensity={2.8}
            color="#ffedd5"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-4, 2, -4]} intensity={0.8} color="#f97316" />
          <pointLight position={[0, -1, 3]} intensity={1.5} color="#ea580c" />
        </>
      );
    case "midnight":
      return (
        <>
          <ambientLight intensity={0.2} color="#020617" />
          <spotLight
            position={[0, 7, 2]}
            intensity={3.8}
            angle={0.4}
            penumbra={0.6}
            color="#f8fafc"
            castShadow
          />
          <pointLight position={[-4, -1, -2]} intensity={2.0} color="#3b82f6" distance={8} />
          <pointLight position={[4, 1, 3]} intensity={1.2} color="#64748b" distance={8} />
        </>
      );
    case "studio":
    default:
      return (
        <>
          <ambientLight intensity={0.9} color="#ffffff" />
          <directionalLight
            position={[5, 8, 5]}
            intensity={2.2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-5, 4, -4]} intensity={1.0} color="#e2e8f0" />
          <directionalLight position={[0, -4, 2]} intensity={0.4} color="#94a3b8" />
          <spotLight position={[0, 6, 0]} intensity={1.2} angle={0.6} penumbra={1} color="#ffffff" />
        </>
      );
  }
}

// WebGL Canvas Snapshot Capturer
function SnapshotCapturer({ trigger }: { trigger: number }) {
  const { gl } = useThree();

  useEffect(() => {
    if (trigger > 0) {
      gl.renderLists.dispose();
      requestAnimationFrame(() => {
        try {
          const dataUrl = gl.domElement.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `NextStep-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        } catch {
          // Handle snapshot capture gracefully
        }
      });
    }
  }, [trigger, gl]);

  return null;
}

const emptySubscribe = () => () => {};

export default function ShoeCanvas({
  interactive = true,
  className = "",
  style = {},
}: {
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { lighting, cameraAngle, snapshotTrigger, highContrast } = useCustomizer();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`shoe-canvas-wrapper ${highContrast ? "high-contrast-canvas" : ""} ${className}`}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "350px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: highContrast ? "#E5E7EB" : "transparent",
          ...style,
        }}
      >
        <div className="skeleton-spinner" />
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: "#64748b", marginTop: "14px" }}>
          INITIALIZING 3D WEBGL ATELIER...
        </span>
      </div>
    );
  }

  return (
    <div
      className={`shoe-canvas-wrapper ${highContrast ? "high-contrast-canvas" : ""} ${className}`}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: highContrast ? "#E5E7EB" : "transparent",
        transition: "background-color 0.3s ease",
        ...style,
      }}
    >
      <Canvas
        shadows={false}
        gl={{
          powerPreference: "high-performance",
          preserveDrawingBuffer: true, // Retained for 4K capture
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: highContrast ? 1.05 : 1.15,
        }}
        camera={{ position: [3.0, 1.6, 3.5], fov: 42 }}
        onCreated={({ gl }) => {
          const handleContextLost = (e: Event) => {
            e.preventDefault();
          };
          gl.domElement.addEventListener("webglcontextlost", handleContextLost, false);
        }}
      >
        <Suspense fallback={null}>
          {highContrast && <color attach="background" args={["#E5E7EB"]} />}
          <LightingRig preset={lighting} />
          <CameraRig cameraAngle={cameraAngle} />
          <ShoeModel />

          {interactive && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2.0}
              maxDistance={7.0}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 1.85}
              dampingFactor={0.05}
            />
          )}

          <SnapshotCapturer trigger={snapshotTrigger} />
        </Suspense>
      </Canvas>
    </div>
  );
}
