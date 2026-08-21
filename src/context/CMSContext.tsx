// File: src/context/CMSContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  Model3DStats,
  ModelConversionResult,
  ConversionProgressCallback,
  processAndIngest3DModel,
} from '@/utils/converter3d';

export type CMSSlotType = 'image' | '3d-model';
export type CMSSlotSection = 'hero' | 'collection' | 'lookbook' | 'branding' | '3d-models';

export interface CMSSlot {
  slotId: string;
  name: string;
  section: CMSSlotSection;
  type?: CMSSlotType;
  url: string;
  alt: string;
  title: string;
  subtitle: string;
  price?: string;
  scale?: number;
  rotation?: [number, number, number];
  modelStats?: Model3DStats;
  updatedAt?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  type?: CMSSlotType;
  sizeBytes: number;
  stats?: Model3DStats;
  createdAt: string;
}

export const DEFAULT_SLOTS: Record<string, CMSSlot> = {
  hero_shoe: {
    slotId: 'hero_shoe',
    name: 'Hero Shoe Showcase Image',
    section: 'hero',
    type: 'image',
    url: '/images/cyber_volt_shoe.jpg',
    alt: 'NextStep 3D Printed Shoe',
    title: '3D PRINTED SHOES',
    subtitle: 'Customizable 3D-printed footwear designed around you.',
  },
  customizer_shoe_model: {
    slotId: 'customizer_shoe_model',
    name: '3D Sneaker Customizer Base Model (.GLB)',
    section: '3d-models',
    type: '3d-model',
    url: '/models/shoe-from-obj.glb',
    alt: 'NextStep 3D Sneaker Mesh',
    title: 'NEXTSTEP 3D GEOMETRY',
    subtitle: 'High-detail running shoe geometry for real-time 3D customization.',
    scale: 1.6,
    rotation: [0, -Math.PI / 4, 0],
    modelStats: {
      vertexCount: 18450,
      triangleCount: 36800,
      meshCount: 1,
      dimensions: { width: 0.95, height: 0.82, depth: 2.14 },
      boundingRadius: 1.25,
      originalSize: 2450000,
      glbSize: 1820000,
    },
  },
  edition_01: {
    slotId: 'edition_01',
    name: 'Edition 01 (Cyber Volt)',
    section: 'collection',
    type: 'image',
    url: '/images/cyber_volt_shoe.jpg',
    alt: 'NextStep Cyber Volt Runner',
    title: 'CYBER // VOLT',
    subtitle: 'Breathable knit upper with flexible 3D-printed lattice cushioning for responsive everyday comfort.',
    price: '$245 USD',
  },
  edition_02: {
    slotId: 'edition_02',
    name: 'Edition 02 (Stealth Onyx)',
    section: 'collection',
    type: 'image',
    url: '/images/stealth_onyx_shoe.jpg',
    alt: 'NextStep Stealth Onyx',
    title: 'STEALTH // ONYX',
    subtitle: 'Clean monochromatic matte finish paired with targeted 3D-printed impact support.',
    price: '$230 USD',
  },
  edition_03: {
    slotId: 'edition_03',
    name: 'Edition 03 (Glacier Neon)',
    section: 'collection',
    type: 'image',
    url: '/images/glacier_neon_shoe.jpg',
    alt: 'NextStep Glacier Neon Runner',
    title: 'GLACIER // NEON',
    subtitle: 'Crisp white upper accented with neon highlights and an adaptive lattice midsole.',
    price: '$260 USD',
  },
  lookbook_01: {
    slotId: 'lookbook_01',
    name: 'Lookbook 01 (Cyber Volt)',
    section: 'lookbook',
    type: 'image',
    url: '/images/editorial_cyber_volt.jpg',
    alt: 'Cyber Volt Urban Shoot',
    title: 'Street & Urban Flow',
    subtitle: 'LOOKBOOK 01 // EVERYDAY MOTION',
  },
  lookbook_02: {
    slotId: 'lookbook_02',
    name: 'Lookbook 02 (Stealth Onyx)',
    section: 'lookbook',
    type: 'image',
    url: '/images/editorial_stealth_onyx.jpg',
    alt: 'Stealth Onyx Outdoor Run',
    title: 'Outdoor & Trail Pace',
    subtitle: 'LOOKBOOK 02 // ACTIVE MOVEMENT',
  },
  lookbook_03: {
    slotId: 'lookbook_03',
    name: 'Lookbook 03 (Glacier Neon)',
    section: 'lookbook',
    type: 'image',
    url: '/images/editorial_glacier_neon.jpg',
    alt: 'Glacier Neon Precision Stride',
    title: 'Precision Lattice Structure',
    subtitle: 'LOOKBOOK 03 // DETAIL & CRAFT',
  },
  brand_logo: {
    slotId: 'brand_logo',
    name: 'Brand Header Logo',
    section: 'branding',
    type: 'image',
    url: '/images/NextStepLogo.png',
    alt: 'NextStep Logo',
    title: 'NEXTSTEP',
    subtitle: '3D-Printed Footwear',
  },
};

interface CMSContextType {
  slots: Record<string, CMSSlot>;
  mediaLibrary: MediaAsset[];
  isLoading: boolean;
  isCMSOpen: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncErrorMessage: string | null;
  activeTab: 'slots' | 'library' | 'upload' | '3d-pipeline';
  selectedSlotId: string | null;
  setIsCMSOpen: (open: boolean) => void;
  setActiveTab: (tab: 'slots' | 'library' | 'upload' | '3d-pipeline') => void;
  setSelectedSlotId: (slotId: string | null) => void;
  getSlot: (slotId: string) => CMSSlot;
  updateSlot: (slotId: string, data: Partial<CMSSlot>) => Promise<void>;
  resetSlot: (slotId: string) => Promise<void>;
  resetAllSlots: () => Promise<void>;
  syncAllToFirestore: () => Promise<boolean>;
  uploadImageFile: (file: File) => Promise<string>;
  upload3DModel: (
    mainFile: File,
    mtlFile?: File,
    textureFiles?: File[],
    onProgress?: ConversionProgressCallback
  ) => Promise<ModelConversionResult>;
  saveAssetToLibrary: (file: File, url: string, type?: CMSSlotType, stats?: Model3DStats) => Promise<void>;
  deleteAssetFromLibrary: (assetId: string) => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nextstep_cms_slots_v2';

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [slots, setSlots] = useState<Record<string, CMSSlot>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_SLOTS, ...parsed };
        }
      } catch (e) {
        console.warn('Could not read CMS cache from localStorage:', e);
      }
    }
    return DEFAULT_SLOTS;
  });

  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'library' | 'upload' | '3d-pipeline'>('slots');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeSlots: () => void = () => {};
    let unsubscribeMedia: () => void = () => {};

    try {
      const slotsRef = collection(db, 'cms_slots');
      unsubscribeSlots = onSnapshot(
        slotsRef,
        (snapshot) => {
          const loadedSlots: Record<string, CMSSlot> = { ...DEFAULT_SLOTS };
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as CMSSlot;
            if (data.slotId) {
              loadedSlots[data.slotId] = {
                ...(DEFAULT_SLOTS[data.slotId] || {}),
                ...data,
              };
            }
          });
          setSlots(loadedSlots);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedSlots));
            } catch {
              // ignore storage limit
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('Firestore CMS slots sync error (using local cache / defaults):', error);
          setIsLoading(false);
        }
      );

      const mediaRef = collection(db, 'cms_media_assets');
      const mediaQuery = query(mediaRef, orderBy('createdAt', 'desc'));
      unsubscribeMedia = onSnapshot(
        mediaQuery,
        (snapshot) => {
          const assets: MediaAsset[] = [];
          snapshot.forEach((docSnap) => {
            assets.push(docSnap.data() as MediaAsset);
          });
          setMediaLibrary(assets);
        },
        (error) => {
          console.warn('Firestore CMS media sync error:', error);
        }
      );
    } catch (err) {
      console.warn('Failed to initialize Firestore listener:', err);
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }

    return () => {
      unsubscribeSlots();
      unsubscribeMedia();
    };
  }, []);

  const getSlot = useCallback(
    (slotId: string): CMSSlot => {
      return (
        slots[slotId] ||
        DEFAULT_SLOTS[slotId] || {
          slotId,
          name: slotId,
          section: 'collection',
          type: 'image',
          url: '/images/cyber_volt_shoe.jpg',
          alt: 'NextStep Asset',
          title: 'NextStep Asset',
          subtitle: '',
        }
      );
    },
    [slots]
  );

  const updateSlot = useCallback(
    async (slotId: string, data: Partial<CMSSlot>) => {
      let updatedSlot: CMSSlot | null = null;
      let nextSlots: Record<string, CMSSlot> = {};

      // Functional state updater prevents reading stale closure variables
      setSlots((prev) => {
        const current = prev[slotId] || DEFAULT_SLOTS[slotId] || {
          slotId,
          name: slotId,
          section: 'collection',
          type: 'image',
          url: '/images/cyber_volt_shoe.jpg',
          alt: 'NextStep Shoe',
          title: '',
          subtitle: '',
        };

        updatedSlot = {
          ...current,
          ...data,
          slotId,
          updatedAt: new Date().toISOString(),
        };

        nextSlots = {
          ...prev,
          [slotId]: updatedSlot,
        };

        return nextSlots;
      });

      // Save to localStorage immediately
      if (typeof window !== 'undefined' && nextSlots) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextSlots));
        } catch {
          // ignore storage limit
        }
      }

      if (updatedSlot) {
        setSyncStatus('syncing');
        setSyncErrorMessage(null);
        try {
          const docRef = doc(db, 'cms_slots', slotId);
          await setDoc(docRef, updatedSlot, { merge: true });
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Firestore permission error';
          console.warn('Error saving CMS slot to Firestore (persisted locally):', err);
          setSyncStatus('error');
          setSyncErrorMessage(errMsg.includes('permission') || errMsg.includes('insufficient')
            ? 'Saved to browser cache. Sign in at /admin to publish live to Firestore.'
            : errMsg);
        }
      }
    },
    []
  );

  const resetSlot = useCallback(async (slotId: string) => {
    if (DEFAULT_SLOTS[slotId]) {
      const def = DEFAULT_SLOTS[slotId];
      setSlots((prev) => {
        const next = { ...prev, [slotId]: def };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
      try {
        const docRef = doc(db, 'cms_slots', slotId);
        await setDoc(docRef, def);
      } catch (err) {
        console.warn('Error resetting CMS slot in Firestore:', err);
      }
    }
  }, []);

  const resetAllSlots = useCallback(async () => {
    setSlots(DEFAULT_SLOTS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SLOTS));
      } catch {}
    }
    try {
      for (const [slotId, def] of Object.entries(DEFAULT_SLOTS)) {
        const docRef = doc(db, 'cms_slots', slotId);
        await setDoc(docRef, def);
      }
    } catch (err) {
      console.warn('Error resetting all CMS slots in Firestore:', err);
    }
  }, []);

  const syncAllToFirestore = useCallback(async (): Promise<boolean> => {
    setSyncStatus('syncing');
    setSyncErrorMessage(null);
    try {
      for (const [slotId, slotData] of Object.entries(slots)) {
        const docRef = doc(db, 'cms_slots', slotId);
        await setDoc(docRef, { ...slotData, updatedAt: new Date().toISOString() }, { merge: true });
      }
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Firestore permission error';
      console.warn('Error batch syncing slots to Firestore:', err);
      setSyncStatus('error');
      setSyncErrorMessage(
        errMsg.includes('permission') || errMsg.includes('insufficient')
          ? 'Sign in as site owner at /admin to sync products permanently to Firestore.'
          : errMsg
      );
      return false;
    }
  }, [slots]);

  const uploadImageFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Downscale to fit safely in browser memory & Firestore doc limit
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL('image/webp', 0.75);

          if (dataUrl.length > 950000) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          }

          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image for processing'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Complete 3D Model ingestion pipeline:
   * 1. Converts .obj (+ .mtl) or optimizes native .glb in memory.
   * 2. Calculates real-time telemetry stats.
   * 3. Produces usable Data URL and Object URL for live 3D preview and state storage.
   */
  const upload3DModel = useCallback(
    async (
      mainFile: File,
      mtlFile?: File,
      textureFiles?: File[],
      onProgress?: ConversionProgressCallback
    ): Promise<ModelConversionResult> => {
      return await processAndIngest3DModel(mainFile, mtlFile, textureFiles, onProgress);
    },
    []
  );

  const saveAssetToLibrary = useCallback(
    async (file: File, url: string, type: CMSSlotType = 'image', stats?: Model3DStats) => {
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const asset: MediaAsset = {
        id: assetId,
        name: file.name,
        url,
        type,
        mimeType: file.type || (type === '3d-model' ? 'model/gltf-binary' : 'image/jpeg'),
        sizeBytes: file.size,
        stats,
        createdAt: new Date().toISOString(),
      };

      setMediaLibrary((prev) => [asset, ...prev]);

      try {
        const docRef = doc(db, 'cms_media_assets', assetId);
        // Only save clean serializable data
        await setDoc(docRef, {
          id: asset.id,
          name: asset.name,
          url: asset.url.length > 950000 ? '/models/shoe-from-obj.glb' : asset.url,
          type: asset.type,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          stats: asset.stats || null,
          createdAt: asset.createdAt,
        });
      } catch (err) {
        console.error('Error saving asset to Firestore media library:', err);
      }
    },
    []
  );

  const deleteAssetFromLibrary = useCallback(async (assetId: string) => {
    setMediaLibrary((prev) => prev.filter((a) => a.id !== assetId));
    try {
      const docRef = doc(db, 'cms_media_assets', assetId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting asset from Firestore:', err);
    }
  }, []);

  const contextValue = useMemo<CMSContextType>(
    () => ({
      slots,
      mediaLibrary,
      isLoading,
      isCMSOpen,
      syncStatus,
      syncErrorMessage,
      activeTab,
      selectedSlotId,
      setIsCMSOpen,
      setActiveTab,
      setSelectedSlotId,
      getSlot,
      updateSlot,
      resetSlot,
      resetAllSlots,
      syncAllToFirestore,
      uploadImageFile,
      upload3DModel,
      saveAssetToLibrary,
      deleteAssetFromLibrary,
    }),
    [
      slots,
      mediaLibrary,
      isLoading,
      isCMSOpen,
      syncStatus,
      syncErrorMessage,
      activeTab,
      selectedSlotId,
      getSlot,
      updateSlot,
      resetSlot,
      resetAllSlots,
      syncAllToFirestore,
      uploadImageFile,
      upload3DModel,
      saveAssetToLibrary,
      deleteAssetFromLibrary,
    ]
  );

  return (
    <CMSContext.Provider value={contextValue}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
