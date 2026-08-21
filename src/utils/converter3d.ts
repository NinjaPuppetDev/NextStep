// File: src/utils/converter3d.ts
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface Model3DStats {
  vertexCount: number;
  triangleCount: number;
  meshCount: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  boundingRadius: number;
  originalSize: number;
  glbSize: number;
}

export interface ModelConversionResult {
  blob: Blob;
  dataUrl: string;
  objectUrl: string;
  stats: Model3DStats;
  fileName: string;
}

export interface ConversionProgressCallback {
  (stage: 'reading' | 'parsing_mtl' | 'parsing_obj' | 'optimizing' | 'exporting_glb' | 'ready', progress: number, message: string): void;
}

/**
 * Calculates vertex, triangle, mesh and bounding box metrics for any Three.js 3D hierarchy.
 */
export function calculateObject3DStats(
  object: THREE.Object3D,
  originalSize = 0,
  glbSize = 0
): Model3DStats {
  let vertexCount = 0;
  let triangleCount = 0;
  let meshCount = 0;

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
      const mesh = child as THREE.Mesh;
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
      }
    }
  });

  const bbox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const sphere = new THREE.Sphere();
  bbox.getBoundingSphere(sphere);

  return {
    vertexCount,
    triangleCount: Math.round(triangleCount),
    meshCount,
    dimensions: {
      width: parseFloat(size.x.toFixed(3)),
      height: parseFloat(size.y.toFixed(3)),
      depth: parseFloat(size.z.toFixed(3)),
    },
    boundingRadius: parseFloat(sphere.radius.toFixed(3)),
    originalSize,
    glbSize,
  };
}

/**
 * Normalizes, recomputes normals, and auto-centers geometry before GLB export.
 */
export function optimizeThreeHierarchy(object: THREE.Object3D): THREE.Object3D {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (mesh.geometry) {
        // Ensure vertex normals exist for clean PBR light calculation
        if (!mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
      }

      // Upgrade basic materials to Standard / Physical materials for crisp WebGL rendering
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => upgradeToPBRMaterial(mat));
        } else {
          mesh.material = upgradeToPBRMaterial(mesh.material);
        }
      }
    }
  });

  return object;
}

function upgradeToPBRMaterial(mat: THREE.Material): THREE.MeshStandardMaterial {
  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
    mat.side = THREE.DoubleSide;
    mat.needsUpdate = true;
    return mat as THREE.MeshStandardMaterial;
  }

  const standard = new THREE.MeshStandardMaterial({
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  if ('color' in mat && (mat as unknown as { color: THREE.Color }).color) {
    standard.color.copy((mat as unknown as { color: THREE.Color }).color);
  }
  if ('map' in mat && (mat as unknown as { map: THREE.Texture | null }).map) {
    standard.map = (mat as unknown as { map: THREE.Texture | null }).map;
  }
  if ('opacity' in mat) {
    standard.opacity = mat.opacity;
    standard.transparent = mat.transparent;
  }

  return standard;
}

/**
 * Converts a Blob to a Base64 data URL string.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert Blob to base64 Data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Parses an OBJ file (with optional MTL & textures) into a Three.js Group.
 */
export async function parseObjToThreeGroup(
  objFile: File,
  mtlFile?: File,
  textureFiles?: File[],
  onProgress?: ConversionProgressCallback
): Promise<THREE.Group> {
  onProgress?.('reading', 10, 'Reading model files...');

  const objText = await objFile.text();
  const objLoader = new OBJLoader();

  // Create temporary blob URLs for any texture files so the MTLLoader can resolve them
  const textureBlobUrls: Record<string, string> = {};
  const cleanupBlobUrls = () => {
    Object.values(textureBlobUrls).forEach((url) => URL.revokeObjectURL(url));
  };

  if (textureFiles && textureFiles.length > 0) {
    for (const tex of textureFiles) {
      textureBlobUrls[tex.name.toLowerCase()] = URL.createObjectURL(tex);
    }
  }

  if (mtlFile) {
    onProgress?.('parsing_mtl', 25, 'Parsing MTL material definitions...');
    try {
      const mtlText = await mtlFile.text();
      const mtlLoader = new MTLLoader();

      // Custom URL modifier to map texture filenames in MTL to our local File Blob URLs
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url) => {
        const fileName = url.split('/').pop()?.split('\\').pop()?.toLowerCase() || '';
        if (textureBlobUrls[fileName]) {
          return textureBlobUrls[fileName];
        }
        return url;
      });

      mtlLoader.manager = manager;
      const materials = mtlLoader.parse(mtlText, '');
      materials.preload();
      objLoader.setMaterials(materials);
    } catch (mtlErr) {
      console.warn('MTL parsing failed, falling back to standard materials:', mtlErr);
    }
  }

  onProgress?.('parsing_obj', 50, 'Parsing 3D geometry and polygon meshes...');
  let group: THREE.Group;
  try {
    group = objLoader.parse(objText);
  } catch (err) {
    cleanupBlobUrls();
    throw new Error(`OBJ syntax error: ${err instanceof Error ? err.message : 'Invalid OBJ file format'}`);
  }

  cleanupBlobUrls();

  if (!group || group.children.length === 0) {
    throw new Error('No valid 3D meshes or geometries were found in the uploaded OBJ file.');
  }

  onProgress?.('optimizing', 75, 'Optimizing bounding boxes, normals, and PBR shaders...');
  optimizeThreeHierarchy(group);

  return group;
}

/**
 * Converts a Three.js Object3D / Group into a binary .glb (GLTF) Blob.
 */
export function exportThreeToGlbBlob(
  object: THREE.Object3D,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    onProgress?.('exporting_glb', 85, 'Generating compressed binary .GLB file...');

    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (result) => {
        try {
          if (result instanceof ArrayBuffer) {
            const blob = new Blob([result], { type: 'model/gltf-binary' });
            onProgress?.('ready', 100, '3D conversion complete!');
            resolve(blob);
          } else {
            // Stringified JSON fallback
            const output = JSON.stringify(result, null, 2);
            const blob = new Blob([output], { type: 'model/gltf+json' });
            onProgress?.('ready', 100, '3D conversion complete!');
            resolve(blob);
          }
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        console.error('GLTFExporter error:', error);
        reject(new Error(`Failed to export model to GLB: ${error instanceof Error ? error.message : String(error)}`));
      },
      {
        binary: true,
        embedImages: true,
        onlyVisible: true,
        truncateDrawRange: true,
      }
    );
  });
}

/**
 * Core Pipeline: End-to-end .obj (+ .mtl) to .glb conversion utility.
 */
export async function convertObjToGlb(
  objFile: File,
  mtlFile?: File,
  textureFiles?: File[],
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  const threeGroup = await parseObjToThreeGroup(objFile, mtlFile, textureFiles, onProgress);
  const glbBlob = await exportThreeToGlbBlob(threeGroup, onProgress);
  return glbBlob;
}

/**
 * Complete Ingestion Handler: Accepts .obj, .glb, or .gltf, produces an optimized .glb and full telemetry stats.
 */
export async function processAndIngest3DModel(
  mainFile: File,
  mtlFile?: File,
  textureFiles?: File[],
  onProgress?: ConversionProgressCallback
): Promise<ModelConversionResult> {
  const lowerName = mainFile.name.toLowerCase();
  let glbBlob: Blob;
  let rootObject: THREE.Object3D;

  if (lowerName.endsWith('.glb')) {
    onProgress?.('reading', 20, 'Reading native GLB binary...');
    const buffer = await mainFile.arrayBuffer();
    glbBlob = new Blob([buffer], { type: 'model/gltf-binary' });

    onProgress?.('optimizing', 60, 'Inspecting GLB scene attributes...');
    const gltfLoader = new GLTFLoader();
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      gltfLoader.parse(buffer, '', resolve, reject);
    });
    rootObject = gltf.scene;
    optimizeThreeHierarchy(rootObject);
  } else if (lowerName.endsWith('.gltf')) {
    onProgress?.('reading', 20, 'Reading GLTF JSON structure...');
    const text = await mainFile.text();
    const gltfLoader = new GLTFLoader();
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      gltfLoader.parse(text, '', resolve, reject);
    });
    rootObject = gltf.scene;
    optimizeThreeHierarchy(rootObject);
    glbBlob = await exportThreeToGlbBlob(rootObject, onProgress);
  } else if (lowerName.endsWith('.obj')) {
    rootObject = await parseObjToThreeGroup(objFileFrom(mainFile), mtlFile, textureFiles, onProgress);
    glbBlob = await exportThreeToGlbBlob(rootObject, onProgress);
  } else {
    throw new Error('Unsupported 3D file format. Please upload .OBJ, .GLB, or .GLTF files.');
  }

  onProgress?.('exporting_glb', 92, 'Generating inspection metadata and URLs...');
  const stats = calculateObject3DStats(rootObject, mainFile.size, glbBlob.size);
  const objectUrl = URL.createObjectURL(glbBlob);
  const dataUrl = await blobToDataUrl(glbBlob);

  onProgress?.('ready', 100, '3D model processed successfully!');

  const outputName = mainFile.name.replace(/\.[^/.]+$/, '') + '.glb';

  return {
    blob: glbBlob,
    dataUrl,
    objectUrl,
    stats,
    fileName: outputName,
  };
}

function objFileFrom(file: File): File {
  return file;
}
