import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GalleryPhoto,
  GalleryCategory,
  GalleryDisplayPreset,
  GalleryAspectRatio,
  GalleryImageFit,
  GalleryTransitionStyle,
  GalleryViewSettings,
} from '../../types';
import {
  AcademyHeroBanner,
  compressImageForBox,
} from '../common/AcademyOrnaments';
import { LiquidNavBar } from '../common/LiquidNavBar';
import { ActivityGalleryCarousel } from '../common/ActivityGalleryCarousel';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  CarouselTablePagination,
  useCarouselPagination,
} from '../common/CarouselTablePagination';
import {
  AccordionExpandAllBar,
  AccordionSection,
  useAccordionGroup,
} from '../common/AccordionExpandGroup';
import {
  Upload,
  ImagePlus,
  Link2,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Search,
  LayoutGrid,
  Table2,
  SlidersHorizontal,
  MonitorPlay,
  Calendar,
  MapPin,
  Check,
  RotateCcw,
  Camera,
  X,
  Loader2,
  Film,
  Columns3,
  LayoutPanelLeft,
  Maximize,
} from 'lucide-react';

const GALLERY_CATEGORIES: GalleryCategory[] = [
  'Kegiatan Sekolah',
  'PKL & Industri',
  'Prestasi & Lomba',
  'Ekstrakurikuler',
  'Akademik',
];

const DISPLAY_PRESETS: {
  id: GalleryDisplayPreset;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'spotlight_carousel',
    label: 'Spotlight Hero',
    desc: '1 foto utama lebar penuh dengan teks overlay & reel thumbnail di bawah.',
    icon: Maximize,
  },
  {
    id: 'card_carousel',
    label: 'Multi-Card Deck',
    desc: 'Menampilkan 2 atau 3 kartu dokumentasi berdampingan dalam satu slide.',
    icon: Columns3,
  },
  {
    id: 'filmstrip_carousel',
    label: 'Cinematic Filmstrip',
    desc: 'Foto utama di tengah dengan pratinjau slide sebelum & sesudah di sisi kiri-kanan.',
    icon: Film,
  },
  {
    id: 'mosaic_carousel',
    label: 'Mosaic Editorial',
    desc: 'Foto besar di kiri dengan panel cerita kegiatan & daftar antrean foto di kanan.',
    icon: LayoutPanelLeft,
  },
];

interface PendingUploadFile {
  localId: string;
  title: string;
  dataUrl: string;
}

export const GalleryModule: React.FC = () => {
  const {
    galleryPhotos = [],
    galleryViewSettings,
    saveGalleryPhoto,
    deleteGalleryPhoto,
    updateGalleryViewSettings,
    addToast,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'manage' | 'view-settings'>('manage');
  const [adminListView, setAdminListView] = useState<'grid' | 'table' | 'preview'>('grid');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Editing or new photo metadata state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('Kegiatan Sekolah');
  const [activityDate, setActivityDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [aspectRatioOverride, setAspectRatioOverride] = useState<GalleryAspectRatio | 'inherit'>('inherit');
  const [imageFitOverride, setImageFitOverride] = useState<GalleryImageFit | 'inherit'>('inherit');
  const [pendingFiles, setPendingFiles] = useState<PendingUploadFile[]>([]);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | GalleryCategory>('ALL');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Genie Bin delete modal target
  const [deleteTarget, setDeleteTarget] = useState<GalleryPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const accordionGroup = useAccordionGroup(['upload-panel', 'gallery-list'], true);

  const filteredPhotos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return galleryPhotos.filter(photo => {
      if (filterCategory !== 'ALL' && photo.category !== filterCategory) return false;
      if (filterStatus === 'published' && !photo.isPublished) return false;
      if (filterStatus === 'draft' && photo.isPublished) return false;
      if (q) {
        const hay = `${photo.title} ${photo.caption} ${photo.category} ${photo.location || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [galleryPhotos, filterCategory, filterStatus, searchQuery]);

  const publishedPhotos = useMemo(
    () => galleryPhotos.filter(p => p.isPublished !== false),
    [galleryPhotos]
  );

  const tablePagination = useCarouselPagination(filteredPhotos, 8);

  const resetForm = () => {
    setEditingPhotoId(null);
    setTitle('');
    setCaption('');
    setCategory('Kegiatan Sekolah');
    setActivityDate(new Date().toISOString().slice(0, 10));
    setLocation('');
    setExternalUrl('');
    setIsPublished(true);
    setIsFeatured(false);
    setAspectRatioOverride('inherit');
    setImageFitOverride('inherit');
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEdit = (photo: GalleryPhoto) => {
    setActiveTab('manage');
    setEditingPhotoId(photo.id);
    setTitle(photo.title);
    setCaption(photo.caption || '');
    setCategory(photo.category);
    setActivityDate(photo.activityDate || new Date().toISOString().slice(0, 10));
    setLocation(photo.location || '');
    setIsPublished(photo.isPublished !== false);
    setIsFeatured(Boolean(photo.isFeatured));
    setAspectRatioOverride(photo.aspectRatioOverride || 'inherit');
    setImageFitOverride(photo.imageFitOverride || 'inherit');

    if (photo.imageUrl.startsWith('data:image')) {
      setUploadMode('file');
      setPendingFiles([
        {
          localId: 'edit-existing',
          title: photo.title,
          dataUrl: photo.imageUrl,
        },
      ]);
      setExternalUrl('');
    } else {
      setUploadMode('url');
      setExternalUrl(photo.imageUrl);
      setPendingFiles([]);
    }

    if (!accordionGroup.isOpen('upload-panel')) {
      accordionGroup.toggle('upload-panel');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    try {
      const processed: PendingUploadFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!f.type.startsWith('image/')) continue;
        const compressed = await compressImageForBox(f, 1280, 0.8);
        const cleanTitle = f.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        processed.push({
          localId: `file-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          title: cleanTitle || `Dokumentasi Kegiatan ${galleryPhotos.length + i + 1}`,
          dataUrl: compressed,
        });
      }

      if (processed.length === 0) {
        addToast('Format file harus berupa gambar (JPG, PNG, WebP).', 'warning');
        return;
      }

      if (editingPhotoId) {
        setPendingFiles([processed[0]]);
      } else {
        setPendingFiles(prev => [...prev, ...processed]);
        if (processed.length === 1 && !title.trim()) {
          setTitle(processed[0].title);
        }
      }
      addToast(`${processed.length} foto berhasil dikompres & siap disimpan.`, 'info');
    } catch {
      addToast('Gagal memproses file foto yang dipilih.', 'error');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSavePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPhotoId) {
      const existing = galleryPhotos.find(p => p.id === editingPhotoId);
      const imageUrl =
        uploadMode === 'file'
          ? pendingFiles[0]?.dataUrl || existing?.imageUrl || ''
          : externalUrl.trim();

      if (!imageUrl) {
        addToast('Harap pilih foto atau masukkan URL gambar yang valid.', 'warning');
        return;
      }
      if (!title.trim()) {
        addToast('Judul dokumentasi wajib diisi.', 'warning');
        return;
      }

      setIsSaving(true);
      try {
        await saveGalleryPhoto(
          {
            id: editingPhotoId,
            title: title.trim(),
            caption: caption.trim(),
            category,
            activityDate: activityDate || new Date().toISOString().slice(0, 10),
            location: location.trim() || undefined,
            imageUrl,
            aspectRatioOverride,
            imageFitOverride,
            isFeatured,
            isPublished,
            order: existing?.order ?? 1,
            uploadedBy: existing?.uploadedBy || currentUser.displayName,
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          false
        );
        addToast('Foto dokumentasi berhasil diperbarui & disinkronkan!', 'success');
        resetForm();
      } catch {
        addToast('Gagal menyimpan perubahan foto ke cloud.', 'error');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Creating new photo(s)
    if (uploadMode === 'url') {
      if (!externalUrl.trim()) {
        addToast('Masukkan URL foto dokumentasi terlebih dahulu.', 'warning');
        return;
      }
      if (!title.trim()) {
        addToast('Judul kegiatan wajib diisi.', 'warning');
        return;
      }

      setIsSaving(true);
      try {
        const minOrder =
          galleryPhotos.length > 0 ? Math.min(...galleryPhotos.map(p => p.order)) - 1 : 1;
        await saveGalleryPhoto(
          {
            id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: title.trim(),
            caption: caption.trim(),
            category,
            activityDate: activityDate || new Date().toISOString().slice(0, 10),
            location: location.trim() || undefined,
            imageUrl: externalUrl.trim(),
            aspectRatioOverride,
            imageFitOverride,
            isFeatured,
            isPublished,
            order: Math.max(0, minOrder),
            uploadedBy: currentUser.displayName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          true
        );
        addToast('Foto dokumentasi berhasil ditambahkan ke Galeri!', 'success');
        resetForm();
      } catch {
        addToast('Gagal menyimpan foto dokumentasi.', 'error');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // File upload mode (single or multi-photo batch)
    if (pendingFiles.length === 0) {
      addToast('Pilih minimal 1 file foto kegiatan untuk diunggah.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const baseTime = Date.now();
      const startOrder =
        galleryPhotos.length > 0 ? Math.max(...galleryPhotos.map(p => p.order)) + 1 : 1;

      for (let i = 0; i < pendingFiles.length; i++) {
        const item = pendingFiles[i];
        const finalTitle =
          pendingFiles.length === 1 && title.trim()
            ? title.trim()
            : item.title.trim() || `Dokumentasi Kegiatan ${startOrder + i}`;

        await saveGalleryPhoto(
          {
            id: `gal-${baseTime + i}-${Math.random().toString(36).slice(2, 6)}`,
            title: finalTitle,
            caption: caption.trim(),
            category,
            activityDate: activityDate || new Date().toISOString().slice(0, 10),
            location: location.trim() || undefined,
            imageUrl: item.dataUrl,
            aspectRatioOverride,
            imageFitOverride,
            isFeatured,
            isPublished,
            order: startOrder + i,
            uploadedBy: currentUser.displayName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          true
        );
      }

      addToast(
        `${pendingFiles.length} foto dokumentasi berhasil diunggah & langsung tampil di Galeri Login!`,
        'success'
      );
      resetForm();
    } catch {
      addToast('Gagal mengunggah beberapa foto ke database cloud.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (photo: GalleryPhoto) => {
    try {
      await saveGalleryPhoto({ ...photo, isPublished: !photo.isPublished }, false);
      addToast(
        !photo.isPublished
          ? `"${photo.title}" ditayangkan di Galeri halaman Login.`
          : `"${photo.title}" dipindahkan ke Draft (disembunyikan dari Login).`,
        'info'
      );
    } catch {
      addToast('Gagal mengubah status tayang foto.', 'error');
    }
  };

  const handleToggleFeatured = async (photo: GalleryPhoto) => {
    try {
      await saveGalleryPhoto({ ...photo, isFeatured: !photo.isFeatured }, false);
      addToast(
        !photo.isFeatured
          ? `"${photo.title}" ditandai sebagai Foto Unggulan.`
          : `Label unggulan dihapus dari "${photo.title}".`,
        'info'
      );
    } catch {
      addToast('Gagal memperbarui status unggulan.', 'error');
    }
  };

  const handleSwapOrder = async (photo: GalleryPhoto, dir: 'up' | 'down') => {
    const idx = galleryPhotos.findIndex(p => p.id === photo.id);
    if (idx < 0) return;
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= galleryPhotos.length) return;

    const other = galleryPhotos[targetIdx];
    const orderA = photo.order ?? idx + 1;
    const orderB = other.order ?? targetIdx + 1;
    const nextOrderA = orderA === orderB ? (dir === 'up' ? orderB - 1 : orderB + 1) : orderB;
    const nextOrderB = orderA === orderB ? orderA : orderA;

    await Promise.all([
      saveGalleryPhoto({ ...photo, order: nextOrderA }, false),
      saveGalleryPhoto({ ...other, order: nextOrderB }, false),
    ]);
  };

  const handleUpdateViewSetting = async (updates: Partial<GalleryViewSettings>) => {
    try {
      await updateGalleryViewSettings(updates);
      addToast('Setingan view Galeri Login diperbarui secara real-time!', 'success');
    } catch {
      addToast('Gagal menyimpan setingan view Galeri.', 'error');
    }
  };

  const handleResetViewSettings = async () => {
    await handleUpdateViewSetting({
      displayPreset: 'spotlight_carousel',
      aspectRatio: '16:9',
      imageFit: 'cover',
      autoPlay: true,
      autoPlaySeconds: 5,
      showCaption: true,
      showCategoryBadge: true,
      showDateBadge: true,
      showThumbnails: true,
      cardsPerSlide: 3,
      transitionStyle: 'slide',
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <AcademyHeroBanner
        moduleKey="gallery"
        kicker="Dokumentasi & Publikasi Sekolah"
        title="Galeri Dokumentasi Kegiatan"
        subtitle="Unggah foto dokumentasi kegiatan resmi sekolah serta atur konsep & setingan view carousel yang tampil pada menu Gallery di halaman utama Login."
        rightContent={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <LiquidNavBar
              size="sm"
              ariaLabel="Sub-menu Galeri Admin"
              activeId={activeTab}
              onSelect={id => setActiveTab(id as 'manage' | 'view-settings')}
              items={[
                {
                  id: 'manage',
                  label: 'Kelola & Upload Foto',
                  badge: galleryPhotos.length,
                  icon: <Camera className="h-3.5 w-3.5" />,
                },
                {
                  id: 'view-settings',
                  label: 'Setingan View Carousel',
                  icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
                },
              ]}
            />

            <div className="flex items-center gap-2 text-[11px] font-bold text-[#6A6584] dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3 py-1.5 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Eye className="h-3.5 w-3.5" />
                <span>{publishedPhotos.length} Foto Tayang di Login</span>
              </span>
            </div>
          </div>
        }
      />

      {activeTab === 'manage' && (
        <div className="space-y-5">
          <AccordionExpandAllBar
            title="Panel Upload & Daftar Dokumentasi Kegiatan"
            allExpanded={accordionGroup.allExpanded}
            onExpandAll={accordionGroup.expandAll}
            onCollapseAll={accordionGroup.collapseAll}
          />

          {/* SECTION 1: UPLOAD / EDIT FOTO KEGIATAN */}
          <AccordionSection
            title={editingPhotoId ? 'Edit Foto Dokumentasi Kegiatan' : 'Upload Foto Dokumentasi Kegiatan Baru'}
            subtitle="Mendukung unggah 1 atau banyak foto sekaligus (otomatis dikompres) atau tempel URL gambar"
            badge={editingPhotoId ? 'Mode Edit' : `${pendingFiles.length} Siap Upload`}
            icon={<ImagePlus className="h-4 w-4" />}
            open={accordionGroup.isOpen('upload-panel')}
            onToggle={() => accordionGroup.toggle('upload-panel')}
          >
            <form onSubmit={handleSavePhotoSubmit} className="space-y-4">
              {editingPhotoId && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/85 dark:border-amber-700/60 dark:bg-amber-950/40 px-4 py-2.5 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-200">
                    Sedang mengedit foto dokumentasi. Simpan perubahan atau klik Batal Edit untuk mengunggah foto baru.
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="no-ornament inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    Batal Edit
                  </button>
                </div>
              )}

              {/* Source Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/25 bg-[#FAF9FE] dark:bg-[#171434] p-1">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`no-ornament inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      uploadMode === 'file'
                        ? 'orbita-btn-violet text-white shadow-xs'
                        : 'text-[#6A6584] dark:text-slate-300'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload File Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`no-ornament inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      uploadMode === 'url'
                        ? 'orbita-btn-violet text-white shadow-xs'
                        : 'text-[#6A6584] dark:text-slate-300'
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    <span>Gunakan URL Gambar</span>
                  </button>
                </div>

                <span className="text-[11px] font-medium text-[#8C88A4] dark:text-slate-400">
                  Rasio &amp; posisi foto dapat mengikuti setingan global atau diatur khusus per foto.
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Dropzone / Preview */}
                <div className="lg:col-span-5 space-y-3">
                  {uploadMode === 'file' ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple={!editingPhotoId}
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing}
                        className="no-ornament group flex w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#C7BFEA] dark:border-[#8D81E3]/35 bg-[#FAF9FE] dark:bg-[#171434]/85 px-5 py-7 text-center hover:border-[#7468C4] hover:bg-[#F1EFFB] dark:hover:bg-[#1E1A44] transition-all cursor-pointer"
                      >
                        <div className="orbita-squircle-badge mb-3 flex h-12 w-12 items-center justify-center rounded-[16px] text-white group-hover:scale-105 transition-transform">
                          {isCompressing ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <p className="text-xs font-extrabold text-[#3E385B] dark:text-white">
                          {isCompressing
                            ? 'Mengompresi gambar...'
                            : editingPhotoId
                            ? 'Klik untuk Ganti File Foto'
                            : 'Pilih 1 atau Banyak Foto Kegiatan'}
                        </p>
                        <p className="mt-1 text-[11px] text-[#8C88A4] dark:text-slate-400">
                          JPG, PNG, WEBP · Otomatis disesuaikan agar sinkron cepat ke cloud
                        </p>
                      </button>

                      {pendingFiles.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {pendingFiles.map((item, idx) => (
                            <div
                              key={item.localId}
                              className="flex items-center gap-2.5 rounded-2xl border border-[#E6E4F4] dark:border-[#8D81E3]/25 bg-white dark:bg-[#171434] p-2"
                            >
                              <img
                                src={item.dataUrl}
                                alt={item.title}
                                className="h-12 w-16 shrink-0 rounded-xl object-cover border border-[#ECEBF5] dark:border-slate-700"
                              />
                              <div className="min-w-0 flex-1">
                                <input
                                  type="text"
                                  value={
                                    pendingFiles.length === 1 && !editingPhotoId && title
                                      ? title
                                      : item.title
                                  }
                                  onChange={ev => {
                                    const val = ev.target.value;
                                    if (pendingFiles.length === 1) setTitle(val);
                                    setPendingFiles(prev =>
                                      prev.map((pf, i) => (i === idx ? { ...pf, title: val } : pf))
                                    );
                                  }}
                                  placeholder="Judul foto dokumentasi"
                                  className="w-full rounded-xl border border-[#E4E2F2] dark:border-[#8D81E3]/25 bg-[#FAF9FE] dark:bg-[#1E1A42] px-2.5 py-1.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingFiles(prev => prev.filter(pf => pf.localId !== item.localId))
                                }
                                title="Hapus dari antrean"
                                className="no-ornament flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                          URL Foto Dokumentasi
                        </label>
                        <input
                          type="url"
                          value={externalUrl}
                          onChange={e => setExternalUrl(e.target.value)}
                          placeholder="https://example.com/foto-kegiatan.jpg"
                          className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 py-2.5 text-xs font-semibold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                        />
                      </div>
                      {externalUrl.trim() && (
                        <div className="overflow-hidden rounded-[20px] border border-[#E4E2F2] dark:border-[#8D81E3]/25 bg-[#161233] aspect-video">
                          <img
                            src={externalUrl.trim()}
                            alt="Pratinjau URL"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Metadata & Per-Photo View Settings */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                        Judul Kegiatan{' '}
                        {pendingFiles.length > 1 && (
                          <span className="font-normal text-[#8C88A4] dark:text-slate-400">
                            (opsional untuk unggah massal — tiap file memakai judul masing-masing)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Contoh: Pelepasan Siswa PKL Gelombang II Tahun 2026"
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 py-2.5 text-xs font-semibold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                        Kategori Kegiatan
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as GalleryCategory)}
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 py-2.5 text-xs font-semibold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4] cursor-pointer"
                      >
                        {GALLERY_CATEGORIES.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                        Tanggal Kegiatan
                      </label>
                      <input
                        type="date"
                        value={activityDate}
                        onChange={e => setActivityDate(e.target.value)}
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 py-2.5 text-xs font-semibold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                        Lokasi / Tempat Pelaksanaan
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Contoh: Aula Utama Kampus ORBITA / PT Industri Nusantara"
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 py-2.5 text-xs font-semibold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                        Deskripsi / Narasi Dokumentasi
                      </label>
                      <textarea
                        rows={2}
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder="Ceritakan ringkas momen kegiatan untuk ditampilkan di carousel Galeri halaman Login..."
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 py-2.5 text-xs font-medium text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                      />
                    </div>

                    {/* Per-photo overrides */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#6A6584] dark:text-slate-300">
                        Rasio Foto Khusus (Opsional)
                      </label>
                      <select
                        value={aspectRatioOverride}
                        onChange={e =>
                          setAspectRatioOverride(e.target.value as GalleryAspectRatio | 'inherit')
                        }
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3 py-2 text-xs font-semibold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                      >
                        <option value="inherit">Ikuti Setingan Global ({galleryViewSettings.aspectRatio})</option>
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="4:3">4:3 (Standar Kamera)</option>
                        <option value="1:1">1:1 (Persegi)</option>
                        <option value="21:9">21:9 (Sinematik Panorama)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#6A6584] dark:text-slate-300">
                        Image Fit Khusus (Opsional)
                      </label>
                      <select
                        value={imageFitOverride}
                        onChange={e =>
                          setImageFitOverride(e.target.value as GalleryImageFit | 'inherit')
                        }
                        className="w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3 py-2 text-xs font-semibold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                      >
                        <option value="inherit">Ikuti Setingan Global ({galleryViewSettings.imageFit})</option>
                        <option value="cover">Cover (Penuh Frame)</option>
                        <option value="contain">Contain (Utuh Tanpa Terpotong)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles & Submit */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ECEBF5] dark:border-[#8D81E3]/20">
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#3E385B] dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={e => setIsPublished(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#7468C4]"
                        />
                        <span>Langsung Tayang di Galeri Login</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#3E385B] dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={e => setIsFeatured(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#FF7597]"
                        />
                        <span>Tandai Foto Unggulan</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving || isCompressing}
                      className="no-ornament orbita-btn-coral inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-xs font-extrabold text-white shadow-md hover:brightness-105 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>
                        {isSaving
                          ? 'Menyimpan...'
                          : editingPhotoId
                          ? 'Simpan Perubahan Foto'
                          : pendingFiles.length > 1
                          ? `Unggah ${pendingFiles.length} Foto ke Galeri`
                          : 'Unggah & Simpan ke Galeri'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </AccordionSection>

          {/* SECTION 2: DAFTAR FOTO DOKUMENTASI + MULTI-VIEW SWITCHER */}
          <AccordionSection
            title="Daftar Dokumentasi Tersimpan"
            subtitle="Kelola urutan, status tayang, edit metadata, hapus (Genie Bin), atau lihat pratinjau carousel"
            badge={`${filteredPhotos.length} Foto`}
            icon={<LayoutGrid className="h-4 w-4" />}
            open={accordionGroup.isOpen('gallery-list')}
            onToggle={() => accordionGroup.toggle('gallery-list')}
          >
            {/* Filter & Admin View Switcher */}
            <div className="mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C88A4]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari judul, lokasi, deskripsi..."
                    className="h-9 w-full rounded-full border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] pl-8.5 pr-3 text-xs font-semibold text-[#3E385B] dark:text-white outline-none focus:border-[#7468C4]"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value as 'ALL' | GalleryCategory)}
                  className="h-9 rounded-full border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kategori</option>
                  {GALLERY_CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                  className="h-9 rounded-full border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="published">Tayang di Login</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Admin Workspace View Mode Switcher */}
              <div className="inline-flex items-center gap-1 rounded-full border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] p-1 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setAdminListView('grid')}
                  className={`no-ornament inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    adminListView === 'grid'
                      ? 'orbita-btn-violet text-white'
                      : 'text-[#6A6584] dark:text-slate-300 hover:text-[#3E385B]'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Grid Kartu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminListView('table')}
                  className={`no-ornament inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    adminListView === 'table'
                      ? 'orbita-btn-violet text-white'
                      : 'text-[#6A6584] dark:text-slate-300 hover:text-[#3E385B]'
                  }`}
                >
                  <Table2 className="h-3.5 w-3.5" />
                  <span>Tabel Carousel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminListView('preview')}
                  className={`no-ornament inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-all cursor-pointer ${
                    adminListView === 'preview'
                      ? 'orbita-btn-coral text-white'
                      : 'text-[#6A6584] dark:text-slate-300 hover:text-[#3E385B]'
                  }`}
                >
                  <MonitorPlay className="h-3.5 w-3.5" />
                  <span>Pratinjau Carousel</span>
                </button>
              </div>
            </div>

            {adminListView === 'preview' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#DDD8F6] dark:border-[#8D81E3]/25 bg-[#FAF9FE] dark:bg-[#171434] px-4 py-2.5 text-xs">
                  <span className="font-bold text-[#5D51B2] dark:text-indigo-300">
                    Menampilkan pratinjau persis seperti di menu Gallery halaman Login ({publishedPhotos.length} foto tayang).
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('view-settings')}
                    className="no-ornament inline-flex items-center gap-1 rounded-full bg-[#EFEBFB] dark:bg-indigo-950/70 px-3 py-1 text-[11px] font-extrabold text-[#5D51B2] dark:text-indigo-300 cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Ubah Setingan View
                  </button>
                </div>
                <ActivityGalleryCarousel
                  photos={publishedPhotos}
                  settings={galleryViewSettings}
                  isPreview
                />
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D6D1F0] dark:border-[#8D81E3]/30 py-12 text-center">
                <Camera className="mx-auto h-9 w-9 text-[#9E95D8] mb-2.5" />
                <p className="text-sm font-extrabold text-[#3E385B] dark:text-white">
                  {galleryPhotos.length === 0
                    ? 'Belum ada foto dokumentasi kegiatan'
                    : 'Tidak ada foto yang cocok dengan filter'}
                </p>
                <p className="mt-1 text-xs text-[#8C88A4] dark:text-slate-400">
                  {galleryPhotos.length === 0
                    ? 'Gunakan formulir Upload Foto di atas untuk mulai mengisi Galeri Kegiatan ORBITA.'
                    : 'Coba ubah kata kunci pencarian atau pilih "Semua Kategori".'}
                </p>
              </div>
            ) : adminListView === 'grid' ? (
              <>
                <div
                  key={`grid-${tablePagination.animKey}`}
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${tablePagination.slideClass}`}
                >
                  {tablePagination.paginatedItems.map(photo => {
                    const globalIdx = galleryPhotos.findIndex(p => p.id === photo.id);
                    return (
                      <div
                        key={photo.id}
                        className="group flex flex-col overflow-hidden rounded-[24px] border border-[#E6E4F4] dark:border-[#8D81E3]/25 bg-white dark:bg-[#171434] shadow-xs transition-all hover:shadow-md"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-[#161233]">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                              (photo.imageFitOverride !== 'inherit' && photo.imageFitOverride === 'contain') ||
                              (photo.imageFitOverride === 'inherit' && galleryViewSettings.imageFit === 'contain')
                                ? 'object-contain'
                                : 'object-cover'
                            }`}
                          />
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                            <span className="rounded-full bg-[#1C1642]/78 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md">
                              {photo.category}
                            </span>
                            <div className="flex items-center gap-1">
                              {photo.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FF6E96] px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Unggulan
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold text-white ${
                                  photo.isPublished ? 'bg-emerald-500/90' : 'bg-slate-600/90'
                                }`}
                              >
                                {photo.isPublished ? 'Tayang' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                          <div>
                            <h4 className="text-sm font-extrabold text-[#3E385B] dark:text-white line-clamp-1">
                              {photo.title}
                            </h4>
                            <p className="mt-1 text-xs text-[#6A6584] dark:text-slate-300 line-clamp-2 min-h-[32px]">
                              {photo.caption || 'Tanpa keterangan tambahan.'}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[10.5px] font-semibold text-[#8C88A4] dark:text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#7468C4]" />
                                {photo.activityDate}
                              </span>
                              {photo.location && (
                                <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                                  <MapPin className="h-3 w-3 text-[#FF7597]" />
                                  {photo.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-[#F0EFF8] dark:border-[#8D81E3]/15">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSwapOrder(photo, 'up')}
                                disabled={globalIdx <= 0}
                                title="Naikkan urutan"
                                className="no-ornament flex h-7 w-7 items-center justify-center rounded-xl border border-[#E4E2F2] dark:border-slate-700 text-[#6A6584] dark:text-slate-300 hover:bg-[#EFEBFB] dark:hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSwapOrder(photo, 'down')}
                                disabled={globalIdx < 0 || globalIdx >= galleryPhotos.length - 1}
                                title="Turunkan urutan"
                                className="no-ornament flex h-7 w-7 items-center justify-center rounded-xl border border-[#E4E2F2] dark:border-slate-700 text-[#6A6584] dark:text-slate-300 hover:bg-[#EFEBFB] dark:hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePublished(photo)}
                                title={photo.isPublished ? 'Sembunyikan (Draft)' : 'Tayangkan ke Login'}
                                className="no-ornament flex h-7 w-7 items-center justify-center rounded-xl border border-[#E4E2F2] dark:border-slate-700 text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] dark:hover:bg-slate-800 cursor-pointer"
                              >
                                {photo.isPublished ? (
                                  <Eye className="h-3.5 w-3.5" />
                                ) : (
                                  <EyeOff className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(photo)}
                                title="Tandai/Hapus Unggulan"
                                className={`no-ornament flex h-7 w-7 items-center justify-center rounded-xl border border-[#E4E2F2] dark:border-slate-700 cursor-pointer ${
                                  photo.isFeatured
                                    ? 'bg-[#FFE4EC] text-[#F25781] dark:bg-rose-950/70 dark:text-rose-300'
                                    : 'text-[#6A6584] dark:text-slate-300 hover:bg-[#EFEBFB] dark:hover:bg-slate-800'
                                }`}
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(photo)}
                                title="Edit foto"
                                className="no-ornament flex h-7 w-7 items-center justify-center rounded-xl bg-[#EFEBFB] dark:bg-indigo-950/70 text-[#5D51B2] dark:text-indigo-300 hover:bg-[#E1DBFA] cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(photo)}
                                title="Hapus foto (Genie Bin)"
                                className="no-ornament flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <CarouselTablePagination
                  page={tablePagination.page}
                  totalPages={tablePagination.totalPages}
                  totalItems={tablePagination.totalItems}
                  pageSize={tablePagination.pageSize}
                  startIndex={tablePagination.startIndex}
                  endIndex={tablePagination.endIndex}
                  slideDirection={tablePagination.slideDirection}
                  onPageChange={tablePagination.setPage}
                  onPageSizeChange={tablePagination.setPageSize}
                  pageSizeOptions={[6, 9, 12, 24]}
                  itemLabel="foto"
                />
              </>
            ) : (
              <>
                <div className="overflow-x-auto rounded-[22px] border border-[#E6E4F4] dark:border-[#8D81E3]/25">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F4FB] dark:bg-[#1B173D] text-[11px] font-extrabold uppercase tracking-wider text-[#6A6584] dark:text-slate-300">
                      <tr>
                        <th className="px-4 py-3">Urutan</th>
                        <th className="px-4 py-3">Foto &amp; Judul</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">Tanggal &amp; Lokasi</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody
                      key={`tbl-${tablePagination.animKey}`}
                      className={`divide-y divide-[#EFEFF7] dark:divide-[#8D81E3]/15 bg-white dark:bg-[#14112E] ${tablePagination.slideClass}`}
                    >
                      {tablePagination.paginatedItems.map(photo => {
                        const globalIdx = galleryPhotos.findIndex(p => p.id === photo.id);
                        return (
                          <tr key={photo.id} className="hover:bg-[#FAF9FE] dark:hover:bg-[#1B173D]/60">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-[#5D51B2] dark:text-indigo-300 tabular-nums w-5">
                                  #{globalIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSwapOrder(photo, 'up')}
                                  disabled={globalIdx <= 0}
                                  className="no-ornament p-1 rounded hover:bg-[#EFEBFB] dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSwapOrder(photo, 'down')}
                                  disabled={globalIdx < 0 || globalIdx >= galleryPhotos.length - 1}
                                  className="no-ornament p-1 rounded hover:bg-[#EFEBFB] dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={photo.imageUrl}
                                  alt={photo.title}
                                  className="h-11 w-16 shrink-0 rounded-xl object-cover border border-[#E4E2F2] dark:border-slate-700"
                                />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-[#3E385B] dark:text-white truncate max-w-[220px]">
                                    {photo.title}
                                  </p>
                                  <p className="text-[11px] text-[#8C88A4] dark:text-slate-400 truncate max-w-[220px]">
                                    {photo.caption || 'Tanpa deskripsi'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-[#5D51B2] dark:text-indigo-300 whitespace-nowrap">
                              {photo.category}
                            </td>
                            <td className="px-4 py-3 text-[#6A6584] dark:text-slate-300">
                              <span className="block font-semibold">{photo.activityDate}</span>
                              {photo.location && (
                                <span className="block text-[10.5px] text-[#8C88A4] truncate max-w-[160px]">
                                  {photo.location}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublished(photo)}
                                  className={`no-ornament rounded-full px-2.5 py-0.5 text-[10px] font-extrabold cursor-pointer ${
                                    photo.isPublished
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {photo.isPublished ? 'Tayang' : 'Draft'}
                                </button>
                                {photo.isFeatured && (
                                  <span className="rounded-full bg-[#FFE4EC] dark:bg-rose-950/60 px-2 py-0.5 text-[10px] font-extrabold text-[#F25781] dark:text-rose-300">
                                    Unggulan
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(photo)}
                                  className="no-ornament rounded-xl bg-[#EFEBFB] dark:bg-indigo-950/70 p-1.5 text-[#5D51B2] dark:text-indigo-300 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(photo)}
                                  className="no-ornament rounded-xl bg-rose-50 dark:bg-rose-950/60 p-1.5 text-rose-600 dark:text-rose-400 cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <CarouselTablePagination
                  page={tablePagination.page}
                  totalPages={tablePagination.totalPages}
                  totalItems={tablePagination.totalItems}
                  pageSize={tablePagination.pageSize}
                  startIndex={tablePagination.startIndex}
                  endIndex={tablePagination.endIndex}
                  slideDirection={tablePagination.slideDirection}
                  onPageChange={tablePagination.setPage}
                  onPageSizeChange={tablePagination.setPageSize}
                  itemLabel="foto"
                />
              </>
            )}
          </AccordionSection>
        </div>
      )}

      {activeTab === 'view-settings' && (
        <div className="space-y-6">
          {/* Carousel View Settings Configurator */}
          <div className="rounded-[26px] border border-[#E6E4F4] dark:border-[#8D81E3]/25 bg-white/95 dark:bg-[#1B173D]/95 p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEBF5] dark:border-[#8D81E3]/20 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#3E385B] dark:text-white">
                  Setingan View Carousel Halaman Utama (Login)
                </h2>
                <p className="text-xs text-[#6A6584] dark:text-slate-300 mt-0.5">
                  Setiap perubahan otomatis disinkronkan ke cloud dan langsung mengubah tampilan menu Gallery di halaman Login.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetViewSettings}
                className="no-ornament inline-flex h-9 items-center gap-1.5 rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/30 bg-[#FAF9FE] dark:bg-[#231E4F] px-4 text-xs font-bold text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Default</span>
              </button>
            </div>

            {/* 1. Display Preset Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#6A6584] dark:text-slate-300">
                1. Konsep Tata Letak Carousel
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DISPLAY_PRESETS.map(preset => {
                  const Icon = preset.icon;
                  const active = galleryViewSettings.displayPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleUpdateViewSetting({ displayPreset: preset.id })}
                      className={`no-ornament flex flex-col items-start gap-2 rounded-[20px] border p-4 text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#7468C4] bg-[#EFEBFB]/85 dark:border-[#9E92FF] dark:bg-[#2B2464] ring-2 ring-[#7468C4]/25'
                          : 'border-[#E6E4F4] dark:border-[#8D81E3]/20 bg-[#FAF9FE] dark:bg-[#161333] hover:border-[#B5ACEB]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            active
                              ? 'orbita-btn-violet text-white'
                              : 'bg-white dark:bg-[#231E4F] text-[#6C60B8] dark:text-indigo-300 border border-[#E4E2F2] dark:border-[#8D81E3]/25'
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        {active && (
                          <span className="rounded-full bg-[#FF6E96] px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#3E385B] dark:text-white">
                          {preset.label}
                        </p>
                        <p className="mt-1 text-[11px] text-[#6A6584] dark:text-slate-300 leading-relaxed">
                          {preset.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Frame Ratio, Image Fit, Transition & Cards Per Slide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                  Rasio Bingkai Foto
                </label>
                <select
                  value={galleryViewSettings.aspectRatio}
                  onChange={e =>
                    handleUpdateViewSetting({ aspectRatio: e.target.value as GalleryAspectRatio })
                  }
                  className="h-10 w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="16:9">16:9 · Widescreen Modern</option>
                  <option value="4:3">4:3 · Standar Dokumentasi</option>
                  <option value="1:1">1:1 · Persegi Kompak</option>
                  <option value="21:9">21:9 · Sinematik Panorama</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                  Penyesuaian Foto (Image Fit)
                </label>
                <select
                  value={galleryViewSettings.imageFit}
                  onChange={e =>
                    handleUpdateViewSetting({ imageFit: e.target.value as GalleryImageFit })
                  }
                  className="h-10 w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="cover">Cover · Penuhi Frame</option>
                  <option value="contain">Contain · Utuh Tanpa Crop</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                  Efek Transisi Slide
                </label>
                <select
                  value={galleryViewSettings.transitionStyle}
                  onChange={e =>
                    handleUpdateViewSetting({
                      transitionStyle: e.target.value as GalleryTransitionStyle,
                    })
                  }
                  className="h-10 w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                >
                  <option value="slide">Slide Carousel</option>
                  <option value="fade">Fade Halus</option>
                  <option value="zoom">Zoom Scale-Up</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3E385B] dark:text-slate-200">
                  Jumlah Kartu / Slide (Deck)
                </label>
                <select
                  value={galleryViewSettings.cardsPerSlide}
                  onChange={e =>
                    handleUpdateViewSetting({ cardsPerSlide: Number(e.target.value) })
                  }
                  className="h-10 w-full rounded-2xl border border-[#E4E2F2] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#171434] px-3.5 text-xs font-bold text-[#3E385B] dark:text-white outline-none cursor-pointer"
                >
                  <option value={2}>2 Kartu per Slide</option>
                  <option value={3}>3 Kartu per Slide</option>
                </select>
              </div>
            </div>

            {/* 3. Playback & Overlay Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-[#ECEBF5] dark:border-[#8D81E3]/20">
              <div className="flex items-center justify-between rounded-2xl border border-[#E6E4F4] dark:border-[#8D81E3]/20 bg-[#FAF9FE] dark:bg-[#161333] px-4 py-3">
                <div>
                  <p className="text-xs font-extrabold text-[#3E385B] dark:text-white">
                    Auto-Play Carousel
                  </p>
                  <p className="text-[10.5px] text-[#8C88A4] dark:text-slate-400">
                    Geser otomatis saat idle
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {galleryViewSettings.autoPlay && (
                    <select
                      value={galleryViewSettings.autoPlaySeconds}
                      onChange={e =>
                        handleUpdateViewSetting({ autoPlaySeconds: Number(e.target.value) })
                      }
                      className="h-7 rounded-full border border-[#DDD8F6] dark:border-slate-700 bg-white dark:bg-[#231E4F] px-2 text-[11px] font-bold text-[#5D51B2] dark:text-indigo-300 cursor-pointer"
                    >
                      <option value={3}>3 dtk</option>
                      <option value={5}>5 dtk</option>
                      <option value={7}>7 dtk</option>
                      <option value={10}>10 dtk</option>
                    </select>
                  )}
                  <input
                    type="checkbox"
                    checked={galleryViewSettings.autoPlay}
                    onChange={e => handleUpdateViewSetting({ autoPlay: e.target.checked })}
                    className="h-4.5 w-4.5 rounded accent-[#7468C4] cursor-pointer"
                  />
                </div>
              </div>

              {[
                {
                  key: 'showCaption' as const,
                  label: 'Tampilkan Judul & Deskripsi',
                  sub: 'Overlay / kartu narasi foto kegiatan',
                },
                {
                  key: 'showCategoryBadge' as const,
                  label: 'Tampilkan Badge Kategori',
                  sub: 'Label kategori pada sudut foto',
                },
                {
                  key: 'showDateBadge' as const,
                  label: 'Tampilkan Tanggal & Lokasi',
                  sub: 'Informasi waktu & lokasi pelaksanaan',
                },
                {
                  key: 'showThumbnails' as const,
                  label: 'Tampilkan Strip Thumbnail',
                  sub: 'Navigasi cepat gambar mini di bawah',
                },
              ].map(toggle => (
                <label
                  key={toggle.key}
                  className="flex items-center justify-between rounded-2xl border border-[#E6E4F4] dark:border-[#8D81E3]/20 bg-[#FAF9FE] dark:bg-[#161333] px-4 py-3 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-extrabold text-[#3E385B] dark:text-white">
                      {toggle.label}
                    </p>
                    <p className="text-[10.5px] text-[#8C88A4] dark:text-slate-400">
                      {toggle.sub}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(galleryViewSettings[toggle.key])}
                    onChange={e =>
                      handleUpdateViewSetting({ [toggle.key]: e.target.checked })
                    }
                    className="h-4.5 w-4.5 rounded accent-[#7468C4] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-extrabold text-[#3E385B] dark:text-white">
                  Pratinjau Live Carousel Halaman Login
                </h3>
                <p className="text-xs text-[#6A6584] dark:text-slate-400">
                  Melihat hasil nyata foto dokumentasi dengan setingan view yang sedang aktif.
                </p>
              </div>
            </div>

            <ActivityGalleryCarousel
              photos={publishedPhotos}
              settings={galleryViewSettings}
              isPreview
            />
          </div>
        </div>
      )}

      {/* Genie Bin Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Foto Dokumentasi Kegiatan?"
        itemName={deleteTarget?.title}
        description="Foto dokumentasi ini akan dihapus permanen dari daftar Admin dan tidak lagi tampil di menu Gallery halaman utama Login."
        onConfirm={async () => {
          if (!deleteTarget) return;
          const targetId = deleteTarget.id;
          setDeleteTarget(null);
          try {
            await deleteGalleryPhoto(targetId);
            addToast('Foto dokumentasi berhasil dihapus dari Galeri.', 'info');
          } catch {
            addToast('Gagal menghapus foto dari server.', 'error');
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
