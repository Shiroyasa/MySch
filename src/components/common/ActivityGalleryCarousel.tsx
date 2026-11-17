import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GalleryPhoto,
  GalleryViewSettings,
  GalleryCategory,
  GalleryAspectRatio,
  GalleryImageFit,
} from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Maximize2,
  Pause,
  Play,
  Sparkles,
  Camera,
  X,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import { SqueezeLineIndicator } from './CarouselTablePagination';

const ALL_CATEGORIES: ('Semua' | GalleryCategory)[] = [
  'Semua',
  'Kegiatan Sekolah',
  'PKL & Industri',
  'Prestasi & Lomba',
  'Ekstrakurikuler',
  'Akademik',
];

function getAspectClass(ratio: GalleryAspectRatio): string {
  switch (ratio) {
    case '21:9':
      return 'aspect-[21/9]';
    case '4:3':
      return 'aspect-[4/3]';
    case '1:1':
      return 'aspect-square max-h-[520px]';
    case '16:9':
    default:
      return 'aspect-video';
  }
}

function formatDateId(isoDate: string): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface ActivityGalleryCarouselProps {
  photos: GalleryPhoto[];
  settings: GalleryViewSettings;
  isPreview?: boolean;
  onBackToLogin?: () => void;
}

export const ActivityGalleryCarousel: React.FC<ActivityGalleryCarouselProps> = ({
  photos,
  settings,
  isPreview = false,
  onBackToLogin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | GalleryCategory>('Semua');
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const filteredPhotos = useMemo(() => {
    const base =
      selectedCategory === 'Semua'
        ? photos
        : photos.filter(p => p.category === selectedCategory);
    return base;
  }, [photos, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { Semua: photos.length };
    photos.forEach(p => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [photos]);

  const isMultiCard = settings.displayPreset === 'card_carousel';
  const cardsPerPage = Math.min(3, Math.max(2, settings.cardsPerSlide || 3));
  const totalSlides = isMultiCard
    ? Math.max(1, Math.ceil(filteredPhotos.length / cardsPerPage))
    : Math.max(1, filteredPhotos.length);

  // Clamp index on filter/data change
  useEffect(() => {
    setActiveIndex(prev => (prev >= totalSlides ? Math.max(0, totalSlides - 1) : prev));
  }, [totalSlides, selectedCategory]);

  const goToIndex = (nextIdx: number, dir?: 'next' | 'prev') => {
    if (totalSlides <= 1) {
      setActiveIndex(0);
      return;
    }
    const wrapped = ((nextIdx % totalSlides) + totalSlides) % totalSlides;
    setSlideDir(dir || (wrapped >= activeIndex ? 'next' : 'prev'));
    setActiveIndex(wrapped);
    setAnimKey(k => k + 1);
  };

  const handleNext = () => goToIndex(activeIndex + 1, 'next');
  const handlePrev = () => goToIndex(activeIndex - 1, 'prev');

  // Auto-play timer
  useEffect(() => {
    if (!settings.autoPlay || isPaused || lightboxPhoto || totalSlides <= 1) return;
    const ms = Math.max(2500, Math.min(15000, (settings.autoPlaySeconds || 5) * 1000));
    const timer = window.setInterval(() => {
      setSlideDir('next');
      setActiveIndex(prev => (prev + 1) % totalSlides);
      setAnimKey(k => k + 1);
    }, ms);
    return () => window.clearInterval(timer);
  }, [settings.autoPlay, settings.autoPlaySeconds, isPaused, lightboxPhoto, totalSlides]);

  // Keyboard support for carousel & lightbox
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxPhoto) {
        if (e.key === 'Escape') {
          setLightboxPhoto(null);
          return;
        }
        const idx = filteredPhotos.findIndex(p => p.id === lightboxPhoto.id);
        if (idx >= 0 && filteredPhotos.length > 1) {
          if (e.key === 'ArrowRight') {
            setLightboxPhoto(filteredPhotos[(idx + 1) % filteredPhotos.length]);
          } else if (e.key === 'ArrowLeft') {
            setLightboxPhoto(
              filteredPhotos[(idx - 1 + filteredPhotos.length) % filteredPhotos.length]
            );
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxPhoto, filteredPhotos]);

  const resolveRatioClass = (photo?: GalleryPhoto) => {
    const ratio =
      photo?.aspectRatioOverride && photo.aspectRatioOverride !== 'inherit'
        ? photo.aspectRatioOverride
        : settings.aspectRatio;
    return getAspectClass(ratio);
  };

  const resolveFitClass = (photo?: GalleryPhoto): string => {
    const fit: GalleryImageFit =
      photo?.imageFitOverride && photo.imageFitOverride !== 'inherit'
        ? photo.imageFitOverride
        : settings.imageFit;
    return fit === 'contain' ? 'object-contain bg-[#181438]/90' : 'object-cover';
  };

  const transitionAnimClass =
    animKey === 0
      ? ''
      : settings.transitionStyle === 'fade'
      ? 'animate-fade-in'
      : settings.transitionStyle === 'zoom'
      ? 'animate-scale-up'
      : slideDir === 'prev'
      ? 'animate-carousel-prev'
      : 'animate-carousel-next';

  const currentPhoto = filteredPhotos[activeIndex] || filteredPhotos[0];
  const prevPeekPhoto =
    filteredPhotos.length > 1
      ? filteredPhotos[(activeIndex - 1 + filteredPhotos.length) % filteredPhotos.length]
      : null;
  const nextPeekPhoto =
    filteredPhotos.length > 1
      ? filteredPhotos[(activeIndex + 1) % filteredPhotos.length]
      : null;

  const visibleCardSlice = useMemo(() => {
    if (!isMultiCard) return [];
    const start = activeIndex * cardsPerPage;
    return filteredPhotos.slice(start, start + cardsPerPage);
  }, [isMultiCard, activeIndex, cardsPerPage, filteredPhotos]);

  const mosaicUpcoming = useMemo(() => {
    if (filteredPhotos.length <= 1) return [];
    const items: { photo: GalleryPhoto; index: number }[] = [];
    for (let offset = 1; offset <= Math.min(3, filteredPhotos.length - 1); offset++) {
      const idx = (activeIndex + offset) % filteredPhotos.length;
      items.push({ photo: filteredPhotos[idx], index: idx });
    }
    return items;
  }, [filteredPhotos, activeIndex]);

  return (
    <div
      className="space-y-4 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Toolbar: Category Filter Chips + Mode & Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#DDD8F6]/70 dark:border-[#8D81E3]/25 bg-white/80 dark:bg-[#1B173D]/85 px-4 py-3 backdrop-blur-xl shadow-[0_8px_24px_-8px_rgba(101,88,181,0.12)]">
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_CATEGORIES.map(cat => {
            const count = categoryCounts[cat] || 0;
            if (cat !== 'Semua' && count === 0) return null;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveIndex(0);
                }}
                className={`no-ornament inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'orbita-btn-violet text-white shadow-sm'
                    : 'border border-[#E4E2F2] bg-[#FAF9FE] text-[#5A537A] hover:bg-[#EFEBFB] dark:border-[#8D81E3]/25 dark:bg-[#231E4F]/70 dark:text-slate-200 dark:hover:bg-[#2E2866]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold tabular-nums ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#ECE9F9] text-[#6C60B8] dark:bg-indigo-950/70 dark:text-indigo-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={() => setIsPaused(p => !p)}
              title={isPaused || !settings.autoPlay ? 'Putar Slide Otomatis' : 'Jeda Slide'}
              className="no-ornament inline-flex h-8 items-center gap-1.5 rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#231E4F]/80 px-3 text-[11px] font-bold text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] dark:hover:bg-[#2D2664] transition-colors cursor-pointer whitespace-nowrap"
            >
              {settings.autoPlay && !isPaused ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Auto ({settings.autoPlaySeconds}s)</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Putar</span>
                </>
              )}
            </button>
          )}

          {totalSlides > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide Sebelumnya"
                className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#231E4F]/80 text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] dark:hover:bg-[#2D2664] cursor-pointer transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[42px] text-center text-[11px] font-extrabold text-[#3E385B] dark:text-slate-200 tabular-nums">
                {activeIndex + 1} / {totalSlides}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide Berikutnya"
                className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8F6] dark:border-[#8D81E3]/28 bg-[#FAF9FE] dark:bg-[#231E4F]/80 text-[#5D51B2] dark:text-indigo-300 hover:bg-[#EFEBFB] dark:hover:bg-[#2D2664] cursor-pointer transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {onBackToLogin && (
            <button
              type="button"
              onClick={onBackToLogin}
              className="no-ornament orbita-btn-coral inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-extrabold text-white shadow-sm cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State when no photos uploaded yet */}
      {filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[#C7BFEA] dark:border-[#8D81E3]/30 bg-white/75 dark:bg-[#191538]/75 px-6 py-14 text-center backdrop-blur-xl">
          <div className="orbita-squircle-badge mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] text-white">
            <Camera className="h-7 w-7" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#3E385B] dark:text-white">
            {photos.length === 0
              ? 'Belum Ada Foto Dokumentasi Kegiatan'
              : `Tidak Ada Foto di Kategori "${selectedCategory}"`}
          </h3>
          <p className="mt-1.5 max-w-md text-xs text-[#6A6584] dark:text-slate-300 leading-relaxed">
            {photos.length === 0
              ? 'Dokumentasi kegiatan sekolah, PKL, prestasi, dan ekstrakurikuler yang diunggah oleh Admin akan otomatis tampil di carousel galeri ini.'
              : 'Pilih kategori lain di atas untuk melihat dokumentasi kegiatan yang tersedia.'}
          </p>
        </div>
      ) : (
        <div
          onTouchStart={e => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={e => {
            if (touchStartXRef.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
            const delta = endX - touchStartXRef.current;
            touchStartXRef.current = null;
            if (delta > 45) handlePrev();
            else if (delta < -45) handleNext();
          }}
          className="space-y-4"
        >
          {/* MODE 1: SPOTLIGHT HERO CAROUSEL */}
          {settings.displayPreset === 'spotlight_carousel' && currentPhoto && (
            <div className="relative overflow-hidden rounded-[28px] border border-[#DDD8F6]/80 dark:border-[#8D81E3]/25 bg-white/90 dark:bg-[#181436]/90 shadow-[0_22px_50px_-14px_rgba(79,67,156,0.28)]">
              <div
                key={`spotlight-${currentPhoto.id}-${animKey}`}
                className={`group relative w-full overflow-hidden bg-[#161233] ${resolveRatioClass(
                  currentPhoto
                )} ${transitionAnimClass}`}
              >
                <img
                  src={currentPhoto.imageUrl}
                  alt={currentPhoto.title}
                  onClick={() => setLightboxPhoto(currentPhoto)}
                  className={`h-full w-full cursor-pointer transition-transform duration-700 group-hover:scale-[1.02] ${resolveFitClass(
                    currentPhoto
                  )}`}
                />

                {/* Top Badges */}
                <div className="pointer-events-none absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2 z-10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {settings.showCategoryBadge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1C1642]/75 px-3 py-1 text-[10.5px] font-extrabold text-white backdrop-blur-md border border-white/20">
                        <Tag className="h-3 w-3 text-[#FF8FAD]" />
                        <span>{currentPhoto.category}</span>
                      </span>
                    )}
                    {currentPhoto.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF7597] to-[#EE4D7A] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        <span>Unggulan</span>
                      </span>
                    )}
                    {isPreview && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/85 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md">
                        Pratinjau Admin
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setLightboxPhoto(currentPhoto)}
                    title="Perbesar Foto"
                    className="no-ornament pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1642]/75 text-white hover:bg-[#5D51B2] border border-white/25 backdrop-blur-md cursor-pointer transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Prev/Next Overlay Buttons */}
                {filteredPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Foto Sebelumnya"
                      className="no-ornament absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1642]/65 hover:bg-[#5D51B2]/90 text-white border border-white/25 backdrop-blur-md cursor-pointer transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Foto Berikutnya"
                      className="no-ornament absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1642]/65 hover:bg-[#5D51B2]/90 text-white border border-white/25 backdrop-blur-md cursor-pointer transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Bottom Gradient Overlay Caption */}
                {settings.showCaption && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120E2D]/95 via-[#120E2D]/68 to-transparent px-5 pt-14 pb-4 sm:px-7 sm:pb-5 text-white">
                    <h3 className="text-base sm:text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                      {currentPhoto.title}
                    </h3>
                    {currentPhoto.caption && (
                      <p className="mt-1 text-xs sm:text-[13px] text-white/85 line-clamp-2 max-w-3xl leading-relaxed">
                        {currentPhoto.caption}
                      </p>
                    )}
                    {settings.showDateBadge && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-white/80">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#FF8FAD]" />
                          <span>{formatDateId(currentPhoto.activityDate)}</span>
                        </span>
                        {currentPhoto.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#A79CFF]" />
                            <span>{currentPhoto.location}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: MULTI-CARD DECK CAROUSEL */}
          {settings.displayPreset === 'card_carousel' && (
            <div
              key={`deck-${activeIndex}-${animKey}`}
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                cardsPerPage >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
              } gap-4 ${transitionAnimClass}`}
            >
              {visibleCardSlice.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo)}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-[#E6E4F4] dark:border-[#8D81E3]/25 bg-white/95 dark:bg-[#1B173D]/95 shadow-[0_14px_30px_-10px_rgba(93,81,178,0.18)] cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className={`relative w-full overflow-hidden bg-[#171336] ${resolveRatioClass(photo)}`}>
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${resolveFitClass(
                        photo
                      )}`}
                    />
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                      {settings.showCategoryBadge && (
                        <span className="rounded-full bg-[#1C1642]/78 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md border border-white/20 truncate">
                          {photo.category}
                        </span>
                      )}
                      {photo.isFeatured && (
                        <span className="rounded-full bg-[#FF6E96] px-2 py-0.5 text-[9.5px] font-extrabold text-white shrink-0">
                          Unggulan
                        </span>
                      )}
                    </div>
                  </div>
                  {settings.showCaption && (
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#3E385B] dark:text-white line-clamp-1">
                          {photo.title}
                        </h4>
                        {photo.caption && (
                          <p className="mt-1 text-xs text-[#6A6584] dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {photo.caption}
                          </p>
                        )}
                      </div>
                      {settings.showDateBadge && (
                        <div className="mt-3 pt-2.5 border-t border-[#F0EFF8] dark:border-[#8D81E3]/15 flex items-center justify-between text-[10.5px] font-semibold text-[#8C88A4] dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#7468C4] dark:text-indigo-300" />
                            {formatDateId(photo.activityDate)}
                          </span>
                          {photo.location && (
                            <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin className="h-3 w-3 text-[#FF7597]" />
                              {photo.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* MODE 3: CINEMATIC FILMSTRIP CAROUSEL (CENTER + SIDE PEEKS) */}
          {settings.displayPreset === 'filmstrip_carousel' && currentPhoto && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
              {/* Left Peek */}
              <div className="hidden lg:block lg:col-span-2">
                {prevPeekPhoto && filteredPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="no-ornament group relative w-full overflow-hidden rounded-[22px] border border-[#DDD8F6]/60 dark:border-[#8D81E3]/25 opacity-65 hover:opacity-100 transition-all cursor-pointer aspect-[3/4]"
                    title={`Sebelumnya: ${prevPeekPhoto.title}`}
                  >
                    <img
                      src={prevPeekPhoto.imageUrl}
                      alt={prevPeekPhoto.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#1B163C]/45 flex items-center justify-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md">
                        <ChevronLeft className="h-5 w-5" />
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Center Cinema Frame */}
              <div
                key={`filmstrip-${currentPhoto.id}-${animKey}`}
                className={`lg:col-span-8 relative overflow-hidden rounded-[28px] border border-[#DDD8F6] dark:border-[#8D81E3]/30 bg-[#161233] shadow-[0_24px_54px_-14px_rgba(79,67,156,0.34)] ${transitionAnimClass}`}
              >
                <div className={`relative w-full overflow-hidden ${resolveRatioClass(currentPhoto)}`}>
                  <img
                    src={currentPhoto.imageUrl}
                    alt={currentPhoto.title}
                    onClick={() => setLightboxPhoto(currentPhoto)}
                    className={`h-full w-full cursor-pointer ${resolveFitClass(currentPhoto)}`}
                  />
                  <div className="pointer-events-none absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    {settings.showCategoryBadge && (
                      <span className="rounded-full bg-[#1C1642]/80 px-3 py-1 text-[10.5px] font-extrabold text-white backdrop-blur-md border border-white/20">
                        {currentPhoto.category}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setLightboxPhoto(currentPhoto)}
                      className="no-ornament pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1642]/80 text-white hover:bg-[#5D51B2] border border-white/25 cursor-pointer"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {settings.showCaption && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120E2D]/95 via-[#120E2D]/70 to-transparent px-5 pt-12 pb-4 text-white">
                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        {currentPhoto.title}
                      </h3>
                      {currentPhoto.caption && (
                        <p className="mt-1 text-xs text-white/85 line-clamp-2">
                          {currentPhoto.caption}
                        </p>
                      )}
                      {settings.showDateBadge && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10.5px] text-white/80">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#FF8FAD]" />
                            {formatDateId(currentPhoto.activityDate)}
                          </span>
                          {currentPhoto.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[#A79CFF]" />
                              {currentPhoto.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Peek */}
              <div className="hidden lg:block lg:col-span-2">
                {nextPeekPhoto && filteredPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="no-ornament group relative w-full overflow-hidden rounded-[22px] border border-[#DDD8F6]/60 dark:border-[#8D81E3]/25 opacity-65 hover:opacity-100 transition-all cursor-pointer aspect-[3/4]"
                    title={`Berikutnya: ${nextPeekPhoto.title}`}
                  >
                    <img
                      src={nextPeekPhoto.imageUrl}
                      alt={nextPeekPhoto.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#1B163C]/45 flex items-center justify-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MODE 4: MOSAIC EDITORIAL SPLIT CAROUSEL */}
          {settings.displayPreset === 'mosaic_carousel' && currentPhoto && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div
                key={`mosaic-${currentPhoto.id}-${animKey}`}
                className={`lg:col-span-8 relative overflow-hidden rounded-[26px] border border-[#DDD8F6] dark:border-[#8D81E3]/25 bg-[#161233] ${resolveRatioClass(
                  currentPhoto
                )} ${transitionAnimClass}`}
              >
                <img
                  src={currentPhoto.imageUrl}
                  alt={currentPhoto.title}
                  onClick={() => setLightboxPhoto(currentPhoto)}
                  className={`h-full w-full cursor-pointer ${resolveFitClass(currentPhoto)}`}
                />
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(currentPhoto)}
                  className="no-ornament absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#1C1642]/75 text-white hover:bg-[#5D51B2] border border-white/25 cursor-pointer"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between gap-3.5 rounded-[26px] border border-[#E6E4F4] dark:border-[#8D81E3]/25 bg-white/92 dark:bg-[#1B173D]/92 p-5 backdrop-blur-xl">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {settings.showCategoryBadge && (
                      <span className="rounded-full bg-[#EFEBFB] dark:bg-indigo-950/70 px-3 py-1 text-[10.5px] font-extrabold text-[#5D51B2] dark:text-indigo-300">
                        {currentPhoto.category}
                      </span>
                    )}
                    {currentPhoto.isFeatured && (
                      <span className="rounded-full bg-[#FFE4EC] dark:bg-rose-950/70 px-2.5 py-1 text-[10px] font-extrabold text-[#F25781] dark:text-rose-300">
                        Unggulan
                      </span>
                    )}
                  </div>

                  {settings.showCaption && (
                    <>
                      <h3 className="text-lg font-extrabold text-[#3E385B] dark:text-white leading-snug">
                        {currentPhoto.title}
                      </h3>
                      <p className="text-xs text-[#6A6584] dark:text-slate-300 leading-relaxed">
                        {currentPhoto.caption ||
                          'Dokumentasi resmi kegiatan akademik dan pengembangan karakter siswa ORBITA.'}
                      </p>
                    </>
                  )}

                  {settings.showDateBadge && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-[#7A7596] dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#7468C4] dark:text-indigo-300" />
                        {formatDateId(currentPhoto.activityDate)}
                      </span>
                      {currentPhoto.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#FF7597]" />
                          {currentPhoto.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {mosaicUpcoming.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-[#ECEBF5] dark:border-[#8D81E3]/20">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#9694A8] dark:text-slate-400">
                      Dokumentasi Berikutnya
                    </span>
                    <div className="space-y-2">
                      {mosaicUpcoming.map(({ photo, index }) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => goToIndex(index, 'next')}
                          className="no-ornament flex w-full items-center gap-2.5 rounded-[16px] border border-[#ECEBF5] dark:border-[#8D81E3]/20 bg-[#FAF9FE] dark:bg-[#231E4F]/60 p-2 text-left hover:border-[#7468C4] transition-all cursor-pointer"
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="h-11 w-14 shrink-0 rounded-[10px] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#3E385B] dark:text-white truncate">
                              {photo.title}
                            </p>
                            <p className="text-[10px] text-[#8C88A4] dark:text-slate-400 truncate">
                              {photo.category} · {formatDateId(photo.activityDate)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Controls: SqueezeLineIndicator + Thumbnail Strip */}
          {totalSlides > 1 && (
            <div className="pt-1">
              <SqueezeLineIndicator
                total={Math.min(totalSlides, 12)}
                activeIndex={activeIndex % Math.min(totalSlides, 12)}
                direction={slideDir}
                onSelect={idx => goToIndex(idx)}
              />
            </div>
          )}

          {settings.showThumbnails && !isMultiCard && filteredPhotos.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {filteredPhotos.map((photo, idx) => {
                const isCurr = idx === activeIndex;
                return (
                  <button
                    key={`thumb-${photo.id}`}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    title={photo.title}
                    className={`no-ornament group relative h-16 w-24 sm:h-18 sm:w-28 shrink-0 overflow-hidden rounded-[14px] border-2 transition-all cursor-pointer ${
                      isCurr
                        ? 'border-[#FF7597] ring-2 ring-[#7468C4]/45 scale-[1.03]'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Detail Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#120E29]/85 backdrop-blur-lg p-3 sm:p-6 animate-fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="no-wobble relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-[#1B173D]/95 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/15 px-5 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#7468C4]/60 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                    {lightboxPhoto.category}
                  </span>
                  <span className="text-[11px] font-semibold text-white/70">
                    {formatDateId(lightboxPhoto.activityDate)}
                  </span>
                  {lightboxPhoto.location && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/70">
                      <MapPin className="h-3 w-3 text-[#FF8FAD]" />
                      {lightboxPhoto.location}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 truncate text-sm sm:text-base font-extrabold text-white">
                  {lightboxPhoto.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                aria-label="Tutup Pratinjau"
                className="no-ornament flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center bg-[#0F0C24] p-2 sm:p-4 overflow-hidden min-h-[260px]">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-h-[65dvh] w-auto max-w-full rounded-[16px] object-contain"
              />

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = filteredPhotos.findIndex(p => p.id === lightboxPhoto.id);
                      const prev =
                        filteredPhotos[(idx - 1 + filteredPhotos.length) % filteredPhotos.length];
                      setLightboxPhoto(prev);
                    }}
                    className="no-ornament absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = filteredPhotos.findIndex(p => p.id === lightboxPhoto.id);
                      const next = filteredPhotos[(idx + 1) % filteredPhotos.length];
                      setLightboxPhoto(next);
                    }}
                    className="no-ornament absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {lightboxPhoto.caption && (
              <div className="border-t border-white/10 px-5 py-3 text-xs sm:text-sm text-white/85 leading-relaxed">
                {lightboxPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
