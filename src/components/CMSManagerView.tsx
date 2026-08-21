// File: src/components/CMSManagerView.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCMS, CMSSlot, CMSSlotSection } from '../context/CMSContext';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  FolderOpen,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Link2,
  Trash2,
  Layers,
  Check,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Box,
  Cpu,
  Download,
  AlertTriangle,
  FileCode,
  Sliders,
} from 'lucide-react';
import { sound } from '@/utils/audio';
import CMS3DPreview from './CMS3DPreview';
import {
  ModelConversionResult,
  Model3DStats,
} from '@/utils/converter3d';

interface CMSManagerViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function CMSManagerView({ isModal = false, onClose }: CMSManagerViewProps) {
  const {
    slots,
    mediaLibrary,
    activeTab,
    selectedSlotId,
    syncStatus,
    syncErrorMessage,
    setActiveTab,
    setSelectedSlotId,
    updateSlot,
    resetSlot,
    resetAllSlots,
    syncAllToFirestore,
    uploadImageFile,
    upload3DModel,
    saveAssetToLibrary,
    deleteAssetFromLibrary,
  } = useCMS();

  const [sectionFilter, setSectionFilter] = useState<'all' | CMSSlotSection>('all');
  const [editingSlot, setEditingSlot] = useState<CMSSlot | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 3D Pipeline State
  const [pipelineProgress, setPipelineProgress] = useState<{
    stage: string;
    progress: number;
    message: string;
  } | null>(null);
  const [pipelineResult, setPipelineResult] = useState<ModelConversionResult | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [selectedObjFile, setSelectedObjFile] = useState<File | null>(null);
  const [selectedMtlFile, setSelectedMtlFile] = useState<File | null>(null);
  const [selectedTextureFiles, setSelectedTextureFiles] = useState<File[]>([]);
  const [target3DSlot, setTarget3DSlot] = useState<string>('customizer_shoe_model');

  const objInputRef = useRef<HTMLInputElement>(null);
  const mtlInputRef = useRef<HTMLInputElement>(null);
  const texInputRef = useRef<HTMLInputElement>(null);

  // Global Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingSlot) setEditingSlot(null);
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingSlot, onClose]);

  const slotList = Object.values(slots);
  const filteredSlots =
    sectionFilter === 'all'
      ? slotList
      : slotList.filter((s) => s.section === sectionFilter);

  // General Image drop/input handlers
  const handleImageFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.obj') || lower.endsWith('.glb') || lower.endsWith('.gltf')) {
        setActiveTab('3d-pipeline');
        handle3DFileSelection([file]);
      } else {
        await processImageFileUpload(file);
      }
    }
  };

  const handleImageFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await processImageFileUpload(file);
      } finally {
        e.target.value = '';
      }
    }
  };

  const processImageFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const dataUrl = await uploadImageFile(file);
      await saveAssetToLibrary(file, dataUrl, 'image');

      if (editingSlot) {
        await updateSlot(editingSlot.slotId, { url: dataUrl });
        setEditingSlot((prev) => (prev ? { ...prev, url: dataUrl } : null));
      } else if (selectedSlotId) {
        await updateSlot(selectedSlotId, { url: dataUrl });
      }

      sound?.playSuccess?.();
      setUploadSuccess(`Successfully uploaded and synced ${file.name}!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to process image file.');
    } finally {
      setIsUploading(false);
    }
  };

  // 3D Ingestion & Conversion Pipeline
  const handle3DFileSelection = (files: FileList | File[]) => {
    setPipelineError(null);
    let obj: File | null = null;
    let mtl: File | null = null;
    const textures: File[] = [];

    Array.from(files).forEach((file) => {
      const name = file.name.toLowerCase();
      if (name.endsWith('.obj') || name.endsWith('.glb') || name.endsWith('.gltf')) {
        obj = file;
      } else if (name.endsWith('.mtl')) {
        mtl = file;
      } else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')) {
        textures.push(file);
      }
    });

    if (obj) setSelectedObjFile(obj);
    if (mtl) setSelectedMtlFile(mtl);
    if (textures.length > 0) setSelectedTextureFiles(textures);
  };

  const run3DConversion = async () => {
    if (!selectedObjFile) {
      setPipelineError('Please select a 3D model file (.OBJ, .GLB, or .GLTF) to process.');
      return;
    }

    setIsUploading(true);
    setPipelineError(null);
    setPipelineResult(null);

    try {
      const result = await upload3DModel(
        selectedObjFile,
        selectedMtlFile || undefined,
        selectedTextureFiles.length > 0 ? selectedTextureFiles : undefined,
        (stage, progress, message) => {
          setPipelineProgress({ stage, progress, message });
        }
      );

      setPipelineResult(result);
      sound?.playSuccess?.();
      setUploadSuccess(`3D model converted into web-optimized GLB (${(result.stats.glbSize / 1024 / 1024).toFixed(2)} MB)!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      console.error('3D conversion failed:', err);
      setPipelineError(err instanceof Error ? err.message : 'Failed to parse and convert 3D model.');
    } finally {
      setIsUploading(false);
      setPipelineProgress(null);
    }
  };

  const apply3DModelToSlot = async () => {
    if (!pipelineResult) return;
    setIsUploading(true);
    try {
      await updateSlot(target3DSlot, {
        url: pipelineResult.objectUrl, // Or persistent URL
        type: '3d-model',
        modelStats: pipelineResult.stats,
        title: pipelineResult.fileName.toUpperCase(),
      });

      const fileForLib = new File([pipelineResult.blob], pipelineResult.fileName, { type: 'model/gltf-binary' });
      await saveAssetToLibrary(fileForLib, pipelineResult.objectUrl, '3d-model', pipelineResult.stats);

      sound?.playSuccess?.();
      setUploadSuccess(`Assigned 3D model to slot "${slots[target3DSlot]?.name || target3DSlot}"!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to assign 3D model to slot:', err);
      setPipelineError('Failed to apply 3D model to active slot.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadProcessedGlb = () => {
    if (!pipelineResult) return;
    const a = document.createElement('a');
    a.href = pipelineResult.objectUrl;
    a.download = pipelineResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApplyUrl = async () => {
    if (!customUrlInput.trim() || !editingSlot) return;
    setIsUploading(true);
    try {
      await updateSlot(editingSlot.slotId, { url: customUrlInput.trim() });
      setEditingSlot((prev) => (prev ? { ...prev, url: customUrlInput.trim() } : null));
      setCustomUrlInput('');
      sound?.playSuccess?.();
      setUploadSuccess('Asset URL updated live in Firestore!');
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err) {
      console.error('URL update error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAssignLibraryAsset = async (slotId: string, assetUrl: string, assetType?: string, stats?: Model3DStats) => {
    await updateSlot(slotId, {
      url: assetUrl,
      type: assetType === '3d-model' ? '3d-model' : 'image',
      modelStats: stats,
    });
    if (editingSlot && editingSlot.slotId === slotId) {
      setEditingSlot((prev) => (prev ? { ...prev, url: assetUrl } : null));
    }
    sound?.playSuccess?.();
    setUploadSuccess('Assigned asset from media library!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  return (
    <div className={`cms-window ${!isModal ? 'cms-page-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
      {/* Hidden Inputs for Standard Images and 3D Pipeline Assets */}
      <input
        id="cms-file-input"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleImageFileInput}
        style={{ display: 'none' }}
      />
      <input
        ref={objInputRef}
        type="file"
        accept=".obj,.glb,.gltf"
        onChange={(e) => {
          if (e.target.files?.[0]) setSelectedObjFile(e.target.files[0]);
        }}
        style={{ display: 'none' }}
      />
      <input
        ref={mtlInputRef}
        type="file"
        accept=".mtl"
        onChange={(e) => {
          if (e.target.files?.[0]) setSelectedMtlFile(e.target.files[0]);
        }}
        style={{ display: 'none' }}
      />
      <input
        ref={texInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(e) => {
          if (e.target.files) setSelectedTextureFiles(Array.from(e.target.files));
        }}
        style={{ display: 'none' }}
      />

      {/* Top Header */}
      <div className="cms-header">
        <div className="cms-header-left">
          {!isModal && (
            <Link href="/" className="cms-back-btn" title="Back to Storefront">
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </Link>
          )}
          <div className="cms-logo-icon">
            <Sparkles size={20} />
          </div>
          <div className="cms-title-group">
            <h2>
              NextStep Studio Media & 3D CMS
              <span className="cms-live-badge">
                <span className="cms-pulse" />
                Firestore Live
              </span>
            </h2>
            <p className="cms-header-desc">
              Multi-asset ingestion engine: Direct image manager & client-side OBJ ➔ GLB 3D converter.
            </p>
          </div>
        </div>

        <div className="cms-header-actions">
          {!isModal && (
            <Link href="/store" className="cms-btn-secondary" title="Open 3D Customizer">
              <ExternalLink size={13} />
              <span>3D Customizer</span>
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              const ok = await syncAllToFirestore();
              if (ok) {
                sound?.playSuccess?.();
                setUploadSuccess('All products & lookbook slots synced live to Firestore!');
                setTimeout(() => setUploadSuccess(null), 4000);
              }
            }}
            disabled={syncStatus === 'syncing'}
            className="cms-btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.75rem', background: '#a3e635', color: '#000' }}
            title="Sync all current slots into Firestore database"
          >
            <Sparkles size={13} />
            <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync All to Firestore'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all media slots to original factory defaults?')) {
                resetAllSlots();
              }
            }}
            className="cms-btn-secondary"
            title="Reset all slots to default"
          >
            <RotateCcw size={13} />
            Reset All
          </button>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="cms-close-btn"
              aria-label="Close CMS Modal"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {syncErrorMessage && (
        <div style={{ background: '#251313', border: '1px solid #ef4444', padding: '10px 16px', borderRadius: '8px', margin: '0 24px 12px', color: '#fca5a5', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span>{syncErrorMessage}</span>
          </div>
          <Link href="/admin/login" style={{ color: '#a3e635', fontWeight: 600, textDecoration: 'underline', whiteSpace: 'nowrap' }}>
            Go to Admin Login →
          </Link>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="cms-nav-bar">
        <div className="cms-tabs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('slots');
              setEditingSlot(null);
            }}
            className={`cms-tab-btn ${activeTab === 'slots' ? 'active' : ''}`}
          >
            <Layers size={14} />
            Media Slots ({slotList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('3d-pipeline')}
            className={`cms-tab-btn ${activeTab === '3d-pipeline' ? 'active' : ''}`}
            style={{
              borderColor: activeTab === '3d-pipeline' ? '#a3e635' : undefined,
              color: activeTab === '3d-pipeline' ? '#a3e635' : undefined,
            }}
          >
            <Cpu size={14} />
            3D Pipeline (.OBJ ➔ .GLB)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`cms-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
          >
            <FolderOpen size={14} />
            Media Library ({mediaLibrary.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`cms-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <UploadCloud size={14} />
            Direct Upload & CDN
          </button>
        </div>

        {uploadSuccess && (
          <div className="cms-success-toast">
            <CheckCircle2 size={14} />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="cms-body">
        {/* TAB 1: SLOTS OVERVIEW & EDIT */}
        {activeTab === 'slots' && (
          <div>
            {/* Section Filters */}
            <div className="cms-filter-bar">
              {(['all', '3d-models', 'hero', 'collection', 'lookbook', 'branding'] as const).map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`cms-filter-btn ${sectionFilter === sec ? 'active' : ''}`}
                >
                  {sec === '3d-models' ? '3D Geometry Slots' : sec}
                </button>
              ))}
            </div>

            {/* Slots Grid */}
            <div className="cms-slots-grid">
              {filteredSlots.map((slot) => {
                const is3D = slot.type === '3d-model' || slot.section === '3d-models' || slot.url.endsWith('.glb');

                return (
                  <div key={slot.slotId} className="cms-slot-card">
                    {/* Top Preview */}
                    <div className="cms-slot-preview" style={{ position: 'relative' }}>
                      {is3D ? (
                        <CMS3DPreview
                          modelUrl={slot.url}
                          stats={slot.modelStats}
                          height={180}
                          showControls={false}
                          showStats={false}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slot.url}
                          alt={slot.alt}
                          className="cms-slot-img"
                        />
                      )}
                      <span className="cms-slot-tag" style={{ background: is3D ? 'rgba(56, 189, 248, 0.2)' : undefined, color: is3D ? '#38bdf8' : undefined, borderColor: is3D ? 'rgba(56, 189, 248, 0.4)' : undefined }}>
                        {is3D ? '3D GLB Model' : slot.section}
                      </span>
                    </div>

                    {/* Info & Metadata */}
                    <div className="cms-slot-info">
                      <div>
                        <div className="cms-slot-title-row">
                          <h3>{slot.name}</h3>
                          {slot.price && (
                            <span className="cms-slot-price">{slot.price}</span>
                          )}
                        </div>
                        <p className="cms-slot-desc">{slot.subtitle || slot.alt}</p>
                      </div>

                      {/* Actions */}
                      <div className="cms-slot-actions">
                        <button
                          type="button"
                          onClick={() => {
                            if (is3D) {
                              setTarget3DSlot(slot.slotId);
                              setActiveTab('3d-pipeline');
                            } else {
                              setEditingSlot(slot);
                              setSelectedSlotId(slot.slotId);
                            }
                          }}
                          className="cms-btn-primary"
                        >
                          {is3D ? <Cpu size={14} /> : <UploadCloud size={14} />}
                          {is3D ? 'Process New 3D Model' : 'Change Image'}
                        </button>
                        <button
                          type="button"
                          onClick={() => resetSlot(slot.slotId)}
                          className="cms-btn-icon"
                          title="Reset to default asset"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 3D MODEL PROCESSING PIPELINE */}
        {activeTab === '3d-pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header / Intro */}
            <div style={{ background: '#0e111a', border: '1px solid rgba(163, 230, 53, 0.2)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Box size={20} color="#a3e635" />
                <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700 }}>
                  Client-Side 3D Model Ingestion & Optimization Pipeline
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, maxWidth: '800px' }}>
                Upload legacy polygon meshes (<code>.OBJ</code>) along with optional material definitions (<code>.MTL</code>) and texture maps. The pipeline parses Three.js geometry, calculates vertex normals, packages embedded textures, and exports a lightweight binary <code>.GLB</code> ready for real-time WebGL rendering.
              </p>
            </div>

            {/* Ingestion Dropzone & File Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: pipelineResult ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files) {
                      handle3DFileSelection(e.dataTransfer.files);
                    }
                  }}
                  style={{
                    border: `2px dashed ${dragActive ? '#a3e635' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '14px',
                    padding: '28px 20px',
                    background: dragActive ? 'rgba(163, 230, 53, 0.05)' : '#0d1017',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(163, 230, 53, 0.12)', border: '1px solid rgba(163, 230, 53, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#a3e635' }}>
                    <Box size={24} />
                  </div>
                  <h4 style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
                    Drop .OBJ, .GLB, or .GLTF Files Here
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '16px' }}>
                    Or select individual model, material (.mtl), and texture files below
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => objInputRef.current?.click()}
                      style={{ background: selectedObjFile ? '#a3e635' : 'rgba(255, 255, 255, 0.08)', color: selectedObjFile ? '#000' : '#fff', fontWeight: 600, padding: '7px 14px', borderRadius: '8px', fontSize: '0.74rem', border: '1px solid rgba(255, 255, 255, 0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileCode size={13} />
                      <span>{selectedObjFile ? selectedObjFile.name : 'Select .OBJ / .GLB File *'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => mtlInputRef.current?.click()}
                      style={{ background: selectedMtlFile ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)', color: selectedMtlFile ? '#000' : 'rgba(255, 255, 255, 0.7)', fontWeight: 600, padding: '7px 14px', borderRadius: '8px', fontSize: '0.74rem', border: '1px solid rgba(255, 255, 255, 0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sliders size={13} />
                      <span>{selectedMtlFile ? selectedMtlFile.name : 'Select .MTL (Optional)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => texInputRef.current?.click()}
                      style={{ background: selectedTextureFiles.length > 0 ? '#c084fc' : 'rgba(255, 255, 255, 0.06)', color: selectedTextureFiles.length > 0 ? '#000' : 'rgba(255, 255, 255, 0.7)', fontWeight: 600, padding: '7px 14px', borderRadius: '8px', fontSize: '0.74rem', border: '1px solid rgba(255, 255, 255, 0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ImageIcon size={13} />
                      <span>{selectedTextureFiles.length > 0 ? `${selectedTextureFiles.length} Textures Selected` : 'Textures (Optional)'}</span>
                    </button>
                  </div>
                </div>

                {/* Target Slot Selector */}
                <div style={{ background: '#0e1017', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Target 3D Slot to Update:
                  </label>
                  <select
                    value={target3DSlot}
                    onChange={(e) => setTarget3DSlot(e.target.value)}
                    className="cms-select"
                  >
                    {slotList.map((s) => (
                      <option key={s.slotId} value={s.slotId}>
                        {s.name} ({s.section.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pipeline Execution Button */}
                <button
                  type="button"
                  onClick={run3DConversion}
                  disabled={!selectedObjFile || isUploading}
                  style={{
                    background: selectedObjFile ? '#a3e635' : 'rgba(255, 255, 255, 0.1)',
                    color: selectedObjFile ? '#000' : 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 700,
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    border: 'none',
                    cursor: selectedObjFile && !isUploading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: selectedObjFile ? '0 0 20px rgba(163, 230, 53, 0.3)' : 'none',
                  }}
                >
                  {isUploading ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Processing 3D Asset Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Cpu size={16} />
                      <span>Convert & Ingest 3D Model</span>
                    </>
                  )}
                </button>

                {/* Progress Bar & Stage Indicator */}
                {pipelineProgress && (
                  <div style={{ background: '#0e111a', border: '1px solid rgba(163, 230, 53, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#a3e635', fontWeight: 600, marginBottom: '6px' }}>
                      <span>{pipelineProgress.message}</span>
                      <span>{pipelineProgress.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pipelineProgress.progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #a3e635, #38bdf8)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {pipelineError && (
                  <div style={{ background: '#201212', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px 14px', color: '#f87171', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span>{pipelineError}</span>
                  </div>
                )}
              </div>

              {/* Real-time 3D Preview Panel */}
              {pipelineResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#a3e635', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      Live Ingested 3D Preview
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      {pipelineResult.fileName}
                    </span>
                  </div>

                  <CMS3DPreview
                    modelUrl={pipelineResult.objectUrl}
                    stats={pipelineResult.stats}
                    height={320}
                    showControls={true}
                    showStats={true}
                  />

                  {/* Actions for Converted Model */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={apply3DModelToSlot}
                      disabled={isUploading}
                      style={{ background: '#a3e635', color: '#000', fontWeight: 700, padding: '10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Check size={14} />
                      Assign to Active Slot
                    </button>

                    <button
                      type="button"
                      onClick={downloadProcessedGlb}
                      style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontWeight: 600, padding: '10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Download size={14} />
                      Download .GLB File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA LIBRARY */}
        {activeTab === 'library' && (
          <div>
            {mediaLibrary.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <FolderOpen size={48} style={{ margin: '0 auto 12px', color: 'rgba(255,255,255,0.25)' }} />
                <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>No uploaded assets in library yet</h3>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '4px', maxWidth: '380px', margin: '4px auto 16px' }}>
                  Upload images or 3D models via the Direct Upload or 3D Pipeline tabs to build your reusable shoe media pool.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{ background: '#a3e635', color: '#000', fontWeight: 700, padding: '8px 18px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', border: 'none' }}
                >
                  Upload First Asset
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                {mediaLibrary.map((asset) => {
                  const is3D = asset.type === '3d-model' || asset.name.endsWith('.glb');

                  return (
                    <div
                      key={asset.id}
                      style={{ background: '#11141c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#06070a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                        {is3D ? (
                          <div style={{ width: '100%', height: '100%' }}>
                            <CMS3DPreview
                              modelUrl={asset.url}
                              stats={asset.stats}
                              height="100%"
                              showControls={false}
                              showStats={false}
                            />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        )}
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: is3D ? 'rgba(56, 189, 248, 0.85)' : 'rgba(0,0,0,0.75)', color: is3D ? '#000' : '#fff', fontWeight: 700, fontSize: '9px', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {is3D ? '3D GLB' : 'Image'}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteAssetFromLibrary(asset.id)}
                          style={{ position: 'absolute', top: '8px', right: '8px', padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.85)', color: '#fff', border: 'none', cursor: 'pointer', zIndex: 10 }}
                          title="Delete asset"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div style={{ padding: '12px', background: '#0e1017', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
                          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                            Assign to Slot:
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignLibraryAsset(e.target.value, asset.url, asset.type, asset.stats);
                                e.target.value = '';
                              }
                            }}
                            className="cms-select"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Select target slot...
                            </option>
                            {slotList.map((s) => (
                              <option key={s.slotId} value={s.slotId}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIRECT UPLOAD & CDN URLS */}
        {activeTab === 'upload' && (
          <div>
            {/* Dropzone as Native Label */}
            <label
              htmlFor="cms-file-input"
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleImageFileDrop}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('cms-file-input')?.click();
                }
              }}
              className={`cms-dropzone ${dragActive ? 'active' : ''}`}
              style={{ cursor: 'pointer', display: 'flex' }}
            >
              <div className="cms-drop-icon">
                {isUploading ? (
                  <Sparkles size={28} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <UploadCloud size={28} />
                )}
              </div>
              <h3>
                {isUploading ? 'Optimizing and syncing to Firestore...' : 'Drag and drop your shoe image or 3D model here'}
              </h3>
              <p>
                Supports high-resolution PNG, JPG, WebP, SVG, OBJ, GLB. Instant browser processing with live website update.
              </p>
              <span className="cms-browse-btn">
                <FolderOpen size={15} />
                Browse Files on Computer
              </span>
            </label>

            {/* Slot Target Selector */}
            <div className="cms-upload-block">
              <label>
                Destination Slot for Newly Uploaded Media:
              </label>
              <select
                value={selectedSlotId || ''}
                onChange={(e) => setSelectedSlotId(e.target.value || null)}
                className="cms-select"
              >
                <option value="">Media Library Pool Only (Do not assign immediately)</option>
                {slotList.map((s) => (
                  <option key={s.slotId} value={s.slotId}>
                    {s.name} ({s.section.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* External CDN Link Input */}
            <div className="cms-upload-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                <Link2 size={15} color="#a3e635" />
                <span>External Image / 3D Model CDN Link (Unsplash, Cloudinary, S3, or Hosted GLB)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '10px' }}>
                Paste a direct public HTTPS link for any high-resolution shoe photo, lookbook shoot, or hosted .GLB model.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or https://your-cdn.com/model.glb"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="cms-input"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!customUrlInput.trim()) return;
                    const target = selectedSlotId || 'edition_01';
                    const is3D = customUrlInput.trim().toLowerCase().endsWith('.glb');
                    await updateSlot(target, {
                      url: customUrlInput.trim(),
                      type: is3D ? '3d-model' : 'image',
                    });
                    setCustomUrlInput('');
                    sound?.playSuccess?.();
                    setUploadSuccess(`Saved CDN URL to ${slots[target]?.name || target}!`);
                    setTimeout(() => setUploadSuccess(null), 3000);
                  }}
                  style={{ background: '#a3e635', color: '#000', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Check size={14} />
                  Apply URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL / DRAWER: SINGLE SLOT DETAIL EDIT */}
      {editingSlot && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#131620',
              border: '1px solid rgba(163, 230, 53, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(163, 230, 53, 0.12)', border: '1px solid rgba(163, 230, 53, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3e635' }}>
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>{editingSlot.name}</h3>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', textTransform: 'uppercase' }}>{editingSlot.slotId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Preview */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#080a0f', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editingSlot.url}
                alt={editingSlot.alt}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Upload Direct Trigger (Label) & Reset */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label
                htmlFor="cms-file-input"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('cms-file-input')?.click();
                  }
                }}
                style={{ background: '#a3e635', color: '#000', fontWeight: 700, padding: '10px', borderRadius: '10px', fontSize: '0.78rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 0 16px rgba(163, 230, 53, 0.25)', userSelect: 'none' }}
              >
                <UploadCloud size={16} />
                Upload From Computer
              </label>
              <button
                type="button"
                onClick={() => resetSlot(editingSlot.slotId)}
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', fontWeight: 600, padding: '10px', borderRadius: '10px', fontSize: '0.78rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RotateCcw size={14} />
                Reset to Original
              </button>
            </div>

            {/* Or paste CDN URL */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Or Paste External Image / CDN Link:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="cms-input"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!customUrlInput.trim()}
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', border: 'none', opacity: !customUrlInput.trim() ? 0.4 : 1 }}
                >
                  Save URL
                </button>
              </div>
            </div>

            {/* Metadata Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>Display Title</label>
                <input
                  type="text"
                  value={editingSlot.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingSlot((prev) => (prev ? { ...prev, title: val } : null));
                  }}
                  onBlur={() => {
                    if (editingSlot.title !== undefined) {
                      updateSlot(editingSlot.slotId, { title: editingSlot.title });
                    }
                  }}
                  className="cms-input"
                  style={{ width: '100%' }}
                />
              </div>
              {editingSlot.price !== undefined && (
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>Price Tag</label>
                  <input
                    type="text"
                    value={editingSlot.price || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingSlot((prev) => (prev ? { ...prev, price: val } : null));
                    }}
                    onBlur={() => {
                      if (editingSlot.price !== undefined) {
                        updateSlot(editingSlot.slotId, { price: editingSlot.price });
                      }
                    }}
                    className="cms-input"
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Status Bar */}
      <div className="cms-footer">
        <div className="cms-footer-security">
          <ShieldCheck size={16} />
          <span>Changes & 3D models persist securely across all client browsers in Firebase Firestore</span>
        </div>
        {isModal && onClose ? (
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Close & Return to Store
          </button>
        ) : (
          <Link
            href="/"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Return to Storefront
          </Link>
        )}
      </div>
    </div>
  );
}
