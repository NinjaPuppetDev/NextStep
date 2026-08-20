"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float, Html } from "@react-three/drei";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  useCustomizer,
  ShoePartId,
  FinishType,
  ShoeColors,
  ShoeFinishes,
  PART_NAMES,
} from "@/context/CustomizerContext";

// Helper to calculate Three.js Material properties based on finish type
export function getMaterialProps(finish: FinishType, baseHex: string) {
  const color = new THREE.Color(baseHex);

  switch (finish) {
    case "matte":
      return {
        color,
        roughness: 0.85,
        metalness: 0.05,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
      };
    case "gloss":
      return {
        color,
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      };
    case "metallic":
      return {
        color,
        roughness: 0.22,
        metalness: 0.9,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1,
      };
    case "luminescent":
      return {
        color,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
      };
    case "carbon":
      return {
        color: color.clone().multiplyScalar(0.8),
        roughness: 0.4,
        metalness: 0.5,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      };
    case "suede":
      return {
        color,
        roughness: 0.95,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
      };
    default:
      return {
        color,
        roughness: 0.5,
        metalness: 0.1,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
      };
  }
}

// Custom OBJ-derived GLB component with coordinate raycasting
export function UserObjShoe({
  colors,
  finishes,
  wireframe,
  activePart,
  onSelectPart,
}: {
  colors: ShoeColors;
  finishes: ShoeFinishes;
  wireframe: boolean;
  activePart: ShoePartId;
  onSelectPart: (p: ShoePartId) => void;
}) {
  const { scene } = useGLTF("/models/shoe-from-obj.glb");
  const [hoveredPart, setHoveredPart] = useState<ShoePartId | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Map 3D coordinate point to anatomical shoe zone
  const getPartFromPoint = (point: THREE.Vector3): ShoePartId => {
    if (point.y < -0.4) return "sole";
    if (point.y > 0.42 && point.x < 0.05) return "inner";
    if (
      point.y > -0.05 &&
      point.y < 0.48 &&
      Math.abs(point.z) < 0.26 &&
      point.x > -0.25
    ) {
      return "laces";
    }
    if (Math.abs(point.z) > 0.42 && point.y < 0.18) return "accent";
    return "upper";
  };

  // Color mapping & vertex shading
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Weld split seam vertices from OBJ import to prevent zero-normals
        if (mesh.geometry) {
          try {
            const merged = BufferGeometryUtils.mergeVertices(mesh.geometry, 1e-4);
            mesh.geometry.dispose();
            mesh.geometry = merged;
          } catch {
            // Geometry was already optimized/merged
          }
          mesh.geometry.computeVertexNormals();
        }

        const geom = mesh.geometry;
        const pos = geom.attributes.position;
        if (!pos) return;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        let colorAttr = geom.attributes.color as THREE.BufferAttribute;
        if (!colorAttr || colorAttr.count !== pos.count) {
          const colorsArray = new Float32Array(pos.count * 3);
          colorAttr = new THREE.BufferAttribute(colorsArray, 3);
          geom.setAttribute("color", colorAttr);
        }

        const colorUpper = new THREE.Color(colors.upper);
        const colorSole = new THREE.Color(colors.sole);
        const colorLaces = new THREE.Color(colors.laces);
        const colorAccent = new THREE.Color(colors.accent);
        const colorInner = new THREE.Color(colors.inner);

        const highlightPart = activePart;
        const highlightColor = new THREE.Color(
          colors[highlightPart]
        ).multiplyScalar(1.2);

        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          let c = colorUpper;
          let p: ShoePartId = "upper";

          if (y < -0.4) {
            p = "sole";
            c = colorSole;
          } else if (y > 0.42 && x < 0.05) {
            p = "inner";
            c = colorInner;
          } else if (
            y > -0.05 &&
            y < 0.48 &&
            Math.abs(z) < 0.26 &&
            x > -0.25
          ) {
            p = "laces";
            c = colorLaces;
          } else if (Math.abs(z) > 0.42 && y < 0.18) {
            p = "accent";
            c = colorAccent;
          }

          if (p === highlightPart) {
            c = highlightColor;
          }

          colorAttr.setXYZ(i, c.r, c.g, c.b);
        }
        colorAttr.needsUpdate = true;

        const activeFinishProps = getMaterialProps(
          finishes[activePart],
          colors[activePart]
        );

        // Uses MeshPhysicalMaterial for clearcoat support
        const activeBaseColor = new THREE.Color(colors[activePart]);
        mesh.material = new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: activeFinishProps.roughness,
          metalness: activeFinishProps.metalness,
          clearcoat: activeFinishProps.clearcoat,
          clearcoatRoughness: activeFinishProps.clearcoatRoughness,
          wireframe,
          side: THREE.DoubleSide,
          emissive: activeBaseColor.clone().multiplyScalar(0.12),
        });
      }
    });
  }, [scene, colors, finishes, wireframe, activePart]);

  const handlePointerMove = (e: {
    stopPropagation: () => void;
    point: THREE.Vector3;
  }) => {
    e.stopPropagation();
    const part = getPartFromPoint(e.point);
    setHoveredPart(part);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHoveredPart(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: {
    stopPropagation: () => void;
    point: THREE.Vector3;
  }) => {
    e.stopPropagation();
    const part = getPartFromPoint(e.point);
    onSelectPart(part);
  };

  return (
    <group
      rotation={[0, -Math.PI / 4, 0]}
      position={[0, 0, 0]}
      scale={[1.6, 1.6, 1.6]}
    >
      <primitive
        ref={meshRef}
        object={scene}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {hoveredPart && (
        <Html position={[0, 0.9, 0]} center distanceFactor={7}>
          <div
            style={{
              background: "rgba(10, 12, 16, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(57, 255, 20, 0.4)",
              color: "#fff",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors[hoveredPart],
                display: "inline-block",
              }}
            />
            <span>Edit: {PART_NAMES[hoveredPart]?.label || hoveredPart}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Main Shoe Model Component (Default Export)
export default function ShoeModel() {
  const {
    colors,
    finishes,
    wireframe,
    activePart,
    setActivePart,
    autoRotate,
  } = useCustomizer();

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <Float
      speed={2.2}
      rotationIntensity={0.3}
      floatIntensity={0.4}
      floatingRange={[-0.05, 0.08]}
    >
      <group ref={groupRef} dispose={null}>
        <UserObjShoe
          colors={colors}
          finishes={finishes}
          wireframe={wireframe}
          activePart={activePart}
          onSelectPart={setActivePart}
        />
      </group>
    </Float>
  );
}

useGLTF.preload("/models/shoe-from-obj.glb");