// File: src/components/CMS3DPreview.tsx
'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Float, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCcw,
  Sparkles,
  Eye,
  Grid,
  Maximize2,
  Box,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Model3DStats } from '@/utils/converter3d';

interface CMS3DPreviewProps {
  modelUrl: string;
  stats?: Model3DStats | null;
  wireframeDefault?: boolean;
  autoRotateDefault?: boolean;
  height?: string | number;
  className?: string;
  showControls?: boolean;
  showStats?: boolean;
  onStatsCalculated?: (stats: Model3DStats) => void;
}

// Inner Model Loader & Normalizer
function DynamicModelRenderer({
  url,
  wireframe,
  autoRotate,
  onLoaded,
}: {
  url: string;
  wireframe: boolean;
  autoRotate: boolean;
  onLoaded?: (stats: Model3DStats) => void;
}) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let isCancelled = false;
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        if (isCancelled) return;
        const root = gltf.scene;

        let vertexCount = 0;
        let triangleCount = 0;
        let meshCount = 0;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            meshCount++;
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const geom = mesh.geometry;
            if (geom) {
              if (geom.index) {
                triangleCount += geom.index.count / 3;
              } else if (geom.attributes.position) {
                triangleCount += geom.attributes.position.count / 3;
              }
              if (geom.attributes.position) {
                vertexCount += geom.attributes.position.count;
              }
              geom.computeVertexNormals();
            }
          }
        });

        // Compute Bounding Box
        const bbox = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const sphere = new THREE.Sphere();
        bbox.getBoundingSphere(sphere);

        // Auto-scale to standard normalized fit (~2.2 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = maxDim > 0 ? 2.2 / maxDim : 1;
        root.scale.setScalar(targetScale);

        // Auto-center pivot
        bbox.setFromObject(root);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        root.position.sub(center);

        setScene(root);

        onLoaded?.({
          vertexCount,
          triangleCount: Math.round(triangleCount),
          meshCount,
          dimensions: {
            width: parseFloat(size.x.toFixed(3)),
            height: parseFloat(size.y.toFixed(3)),
            depth: parseFloat(size.z.toFixed(3)),
          },
          boundingRadius: parseFloat(sphere.radius.toFixed(3)),
          originalSize: 0,
          glbSize: 0,
        });
      },
      undefined,
      (err) => {
        if (isCancelled) return;
        console.error('DynamicModelRenderer GLTFLoader error:', err);
        setError('Failed to load 3D GLB model in WebGL preview');
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [url, onLoaded]);

  // Apply wireframe / material overrides
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const applyWireframe = (mat: THREE.Material) => {
            if ('wireframe' in mat) {
              (mat as THREE.MeshStandardMaterial).wireframe = wireframe;
              mat.needsUpdate = true;
            }
          };

          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(applyWireframe);
          } else {
            applyWireframe(mesh.material);
          }
        }
      }
    });
  }, [scene, wireframe]);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  if (error) {
    return (
      <Html center>
        <div style={{ background: '#1c1313', color: '#f87171', border: '1px solid #ef4444', padding: '12px 18px', borderRadius: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      </Html>
    );
  }

  if (!scene) {
    return (
      <Html center>
        <div style={{ color: '#a3e635', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <Sparkles size={16} className="animate-spin" />
          <span>Initializing 3D Model...</span>
        </div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      <Center top position={[0, 0, 0]}>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function CMS3DPreview({
  modelUrl,
  stats: initialStats,
  wireframeDefault = false,
  autoRotateDefault = true,
  height = '340px',
  className = '',
  showControls = true,
  showStats = true,
  onStatsCalculated,
}: CMS3DPreviewProps) {
  const [wireframe, setWireframe] = useState(wireframeDefault);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [showGrid, setShowGrid] = useState(true);
  const [stats, setStats] = useState<Model3DStats | null>(initialStats || null);
  const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleLoadedStats = (s: Model3DStats) => {
    setStats((prev) => ({
      ...s,
      originalSize: prev?.originalSize || initialStats?.originalSize || 0,
      glbSize: prev?.glbSize || initialStats?.glbSize || 0,
    }));
    onStatsCalculated?.(s);
  };

  return (
    <div
      className={`cms-3d-preview-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        background: 'radial-gradient(circle at 50% 30%, #151924 0%, #080a0f 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 3D WebGL Canvas */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <Canvas
          camera={{ position: [3, 2, 3.5], fov: 42 }}
          shadows
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#080a0f']} />

          {/* Studio Lighting Rig */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-5, 4, -4]} intensity={0.9} color="#a3e635" />
          <pointLight position={[0, -2, 2]} intensity={0.4} color="#38bdf8" />

          {/* Ground Grid Floor */}
          {showGrid && (
            <gridHelper
              args={[10, 20, '#a3e635', '#1e293b']}
              position={[0, -0.01, 0]}
            />
          )}

          <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.25} floatingRange={[-0.03, 0.03]}>
              <DynamicModelRenderer
                url={modelUrl}
                wireframe={wireframe}
                autoRotate={autoRotate}
                onLoaded={handleLoadedStats}
              />
            </Float>
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={1.2}
            maxDistance={9.0}
            rotateSpeed={0.8}
          />
        </Canvas>

        {/* Floating Top Control Toolbar */}
        {showControls && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className="cms-preview-btn"
              title={autoRotate ? 'Pause Auto-Rotation' : 'Enable Auto-Rotation'}
              style={{
                background: autoRotate ? 'rgba(163, 230, 53, 0.2)' : 'rgba(0, 0, 0, 0.65)',
                color: autoRotate ? '#a3e635' : 'rgba(255, 255, 255, 0.7)',
                borderColor: autoRotate ? 'rgba(163, 230, 53, 0.5)' : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <RotateCcw size={13} style={{ transform: autoRotate ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
              <span>Spin</span>
            </button>

            <button
              type="button"
              onClick={() => setWireframe(!wireframe)}
              className="cms-preview-btn"
              title={wireframe ? 'Shaded PBR View' : 'Wireframe Mesh View'}
              style={{
                background: wireframe ? 'rgba(163, 230, 53, 0.2)' : 'rgba(0, 0, 0, 0.65)',
                color: wireframe ? '#a3e635' : 'rgba(255, 255, 255, 0.7)',
                borderColor: wireframe ? 'rgba(163, 230, 53, 0.5)' : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <Layers size={13} />
              <span>Wireframe</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className="cms-preview-btn"
              title="Toggle Ground Grid"
              style={{
                background: showGrid ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.65)',
                color: showGrid ? '#fff' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <Grid size={13} />
            </button>

            <button
              type="button"
              onClick={resetCamera}
              className="cms-preview-btn"
              title="Reset Orbit Camera"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        )}

        {/* Interactive Orbit Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          <Eye size={11} color="#a3e635" />
          <span>Left-Click Drag to Orbit | Scroll to Zoom</span>
        </div>
      </div>

      {/* 3D Telemetry Bar */}
      {showStats && stats && (
        <div
          style={{
            background: 'rgba(10, 13, 19, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a3e635', fontWeight: 600 }}>
              <Box size={13} />
              <span>3D Geometry</span>
            </span>
            <span>
              <strong style={{ color: '#fff' }}>{stats.triangleCount.toLocaleString()}</strong> Triangles
            </span>
            <span>
              <strong style={{ color: '#fff' }}>{stats.vertexCount.toLocaleString()}</strong> Vertices
            </span>
            <span>
              <strong style={{ color: '#fff' }}>{stats.meshCount}</strong> Meshes
            </span>
            <span>
              Bounds: <strong style={{ color: '#fff' }}>{stats.dimensions.width} &times; {stats.dimensions.height} &times; {stats.dimensions.depth}m</strong>
            </span>
          </div>

          {(stats.originalSize > 0 || stats.glbSize > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
              {stats.originalSize > 0 && (
                <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                  Original: {(stats.originalSize / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
              {stats.glbSize > 0 && (
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                  Optimized GLB: {(stats.glbSize / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
