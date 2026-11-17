import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SqueezeLineIndicatorProps {
  total: number;
  activeIndex: number;
  direction?: 'next' | 'prev';
  onSelect?: (index: number) => void;
  className?: string;
}

export const SqueezeLineIndicator: React.FC<SqueezeLineIndicatorProps> = ({
  total,
  activeIndex,
  direction = 'next',
  onSelect,
  className = '',
}) => {
  const safeTotal = Math.max(1, total);
  const clampedActive = Math.min(Math.max(0, activeIndex), safeTotal - 1);

  return (
    <div
      className={`flex items-center justify-center gap-1.5 ${className}`}
      role="tablist"
      aria-label="Indikator Halaman Squeeze Line"
    >
      {Array.from({ length: safeTotal }).map((_, idx) => {
        const isActive = idx === clampedActive;
        const animClass = isActive
          ? direction === 'prev'
            ? 'orbita-squeeze-indicator-prev'
            : 'orbita-squeeze-indicator-next'
          : '';
        return (
          <button
            key={`squeeze-seg-${idx}`}
            type="button"
            onClick={() => onSelect?.(idx)}
            disabled={!onSelect}
            aria-label={`Halaman ${idx + 1}`}
            aria-selected={isActive}
            className={`no-ornament h-2 rounded-full transition-all duration-300 ${
              onSelect ? 'cursor-pointer' : 'cursor-default'
            } ${
              isActive
                ? `w-8 bg-gradient-to-r from-[#7468C4] via-[#8F83DF] to-[#FF7597] dark:from-[#5D50B8] dark:via-[#7E70DB] dark:to-[#C8537C] shadow-[0_2px_10px_rgba(116,104,196,0.45)] dark:shadow-[0_2px_10px_rgba(93,80,184,0.4)] ${animClass}`
                : 'w-2.5 bg-[#DCD7F2] hover:bg-[#B8AFEA] dark:bg-slate-700 dark:hover:bg-indigo-500/60'
            }`}
          />
        );
      })}
    </div>
  );
};

export function useCarouselPagination<T>(
  items: T[],
  defaultPageSize = 8
) {
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState<number>(defaultPageSize);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);

  const effectiveSize = pageSize <= 0 ? Math.max(1, items.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(items.length / effectiveSize));

  useEffect(() => {
    if (page > totalPages) {
      setPageState(totalPages);
    }
  }, [page, totalPages]);

  const setPage = (nextPage: number | ((prev: number) => number)) => {
    setPageState(prev => {
      const target = typeof nextPage === 'function' ? nextPage(prev) : nextPage;
      const bounded = Math.min(Math.max(1, target), totalPages);
      if (bounded !== prev) {
        setSlideDirection(bounded > prev ? 'next' : 'prev');
        setAnimKey(k => k + 1);
      }
      return bounded;
    });
  };

  const setPageSize = (nextSize: number) => {
    setPageSizeState(nextSize);
    setPageState(1);
    setSlideDirection('next');
    setAnimKey(k => k + 1);
  };

  const startIndex = (Math.min(page, totalPages) - 1) * effectiveSize;

  const paginatedItems = useMemo(() => {
    if (pageSize <= 0) return items;
    return items.slice(startIndex, startIndex + effectiveSize);
  }, [items, pageSize, startIndex, effectiveSize]);

  const slideClass =
    animKey === 0
      ? ''
      : slideDirection === 'prev'
      ? 'animate-carousel-prev'
      : 'animate-carousel-next';

  return {
    page: Math.min(page, totalPages),
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: items.length,
    startIndex,
    endIndex: Math.min(startIndex + paginatedItems.length, items.length),
    paginatedItems,
    slideDirection,
    animKey,
    slideClass,
  };
}

interface CarouselTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  slideDirection?: 'next' | 'prev';
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const CarouselTablePagination: React.FC<CarouselTablePaginationProps> = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  startIndex,
  endIndex,
  slideDirection = 'next',
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 8, 10, 20],
  itemLabel = 'data',
  className = '',
}) => {
  if (totalItems === 0) return null;

  const squeezeWindowSize = Math.min(totalPages, 7);
  const squeezeOffset =
    totalPages <= 7
      ? 0
      : Math.max(0, Math.min(page - 4, totalPages - squeezeWindowSize));
  const activeSqueezeIdx = page - 1 - squeezeOffset;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  return (
    <div
      className={`mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[20px] border border-[#E6E4F4] bg-[#FAF9FE]/90 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/75 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5">
        <span className="text-[11px] font-semibold text-[#6A6584] dark:text-slate-400 tabular-nums">
          Menampilkan <strong className="text-[#3E385B] dark:text-white">{startIndex + 1}</strong>–
          <strong className="text-[#3E385B] dark:text-white">{endIndex}</strong> dari{' '}
          <strong className="text-[#6C60B8] dark:text-indigo-300">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            aria-label="Jumlah baris per halaman"
            className="h-7 rounded-full border border-[#DDD8F6] bg-white px-2.5 text-[11px] font-bold text-[#3E385B] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt} / hal
              </option>
            ))}
            <option value={0}>Semua</option>
          </select>
        )}
      </div>

      {/* Squeeze Line Track */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center order-first sm:order-none">
          <SqueezeLineIndicator
            total={squeezeWindowSize}
            activeIndex={activeSqueezeIdx}
            direction={slideDirection}
            onSelect={idx => onPageChange(squeezeOffset + idx + 1)}
          />
        </div>
      )}

      {/* Carousel Prev/Page/Next Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8F6] bg-white text-[#5D51B2] hover:bg-[#EFEBFB] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 cursor-pointer transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map(num => (
            <button
              key={`pg-${num}`}
              type="button"
              onClick={() => onPageChange(num)}
              className={`no-ornament h-8 min-w-[32px] rounded-full px-2 text-[11px] font-extrabold tabular-nums transition-all cursor-pointer ${
                num === page
                  ? 'orbita-btn-violet text-white'
                  : 'text-[#6A6584] hover:bg-[#EFEBFB] dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDD8F6] bg-white text-[#5D51B2] hover:bg-[#EFEBFB] disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 cursor-pointer transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
