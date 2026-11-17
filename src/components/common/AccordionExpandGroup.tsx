import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';

export function useAccordionGroup(sectionIds: string[], defaultOpen = true) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sectionIds.forEach(id => {
      initial[id] = defaultOpen;
    });
    return initial;
  });

  const isOpen = useCallback(
    (id: string) => (id in openMap ? openMap[id] : defaultOpen),
    [openMap, defaultOpen]
  );

  const toggle = useCallback(
    (id: string) => {
      setOpenMap(prev => ({
        ...prev,
        [id]: !(id in prev ? prev[id] : defaultOpen),
      }));
    },
    [defaultOpen]
  );

  const expandAll = useCallback(() => {
    setOpenMap(prev => {
      const next = { ...prev };
      sectionIds.forEach(id => {
        next[id] = true;
      });
      return next;
    });
  }, [sectionIds]);

  const collapseAll = useCallback(() => {
    setOpenMap(prev => {
      const next = { ...prev };
      sectionIds.forEach(id => {
        next[id] = false;
      });
      return next;
    });
  }, [sectionIds]);

  const allExpanded = useMemo(
    () => sectionIds.every(id => (id in openMap ? openMap[id] : defaultOpen)),
    [sectionIds, openMap, defaultOpen]
  );

  return {
    isOpen,
    toggle,
    expandAll,
    collapseAll,
    allExpanded,
  };
}

interface AccordionExpandAllBarProps {
  allExpanded: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  title?: string;
  className?: string;
}

export const AccordionExpandAllBar: React.FC<AccordionExpandAllBarProps> = ({
  allExpanded,
  onExpandAll,
  onCollapseAll,
  title = 'Panel Filter & Kontrol Dropdown',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E4E3F0] bg-[#FAF9FE]/90 px-3.5 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/75 ${className}`}
    >
      <span className="text-[11px] font-bold text-[#6A6584] dark:text-slate-300">
        {title}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={allExpanded ? onCollapseAll : onExpandAll}
          className="no-ornament inline-flex items-center gap-1.5 rounded-full border border-[#DDD8F6] bg-white px-3 py-1 text-[11px] font-extrabold text-[#5D51B2] hover:bg-[#EFEBFB] dark:border-indigo-500/40 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {allExpanded ? (
            <>
              <ChevronsDownUp className="h-3.5 w-3.5" />
              <span>Ringkas Semua</span>
            </>
          ) : (
            <>
              <ChevronsUpDown className="h-3.5 w-3.5" />
              <span>Perluas Semua</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface AccordionSectionProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  subtitle,
  badge,
  icon,
  open,
  onToggle,
  children,
  className = '',
  contentClassName = 'pt-3',
}) => {
  return (
    <div
      className={`rounded-[22px] border border-[#E6E4F4] bg-white/90 p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80 ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="no-ornament flex w-full items-center justify-between gap-2 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#EFEBFB] text-[#6C60B8] dark:bg-indigo-950/80 dark:text-indigo-300">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#3E385B] dark:text-white truncate">
                {title}
              </span>
              {badge !== undefined && (
                <span className="rounded-full bg-[#FFE4EC] px-2 py-0.5 text-[10px] font-bold text-[#F25781] dark:bg-rose-950/70 dark:text-rose-300">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <span className="block text-[10.5px] font-medium text-[#9694A8] dark:text-slate-400 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F4FB] text-[#6C60B8] transition-transform duration-300 dark:bg-slate-800 dark:text-indigo-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      <div className="orbita-accordion-panel" data-open={open ? 'true' : 'false'}>
        <div className="orbita-accordion-inner">
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
};
