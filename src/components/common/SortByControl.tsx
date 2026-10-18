import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'az' | 'za' | 'tanggal' | 'nis';

interface SortByControlProps {
  value: SortOption;
  onChange: (val: SortOption) => void;
  className?: string;
  label?: string;
}

export const SortByControl: React.FC<SortByControlProps> = ({
  value,
  onChange,
  className = '',
  label = 'Urutkan:',
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <ArrowUpDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{label}</span>
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
      >
        <option value="az">Nama (A - Z)</option>
        <option value="za">Nama (Z - A)</option>
        <option value="nis">NIS / NISN</option>
        <option value="tanggal">Tanggal</option>
      </select>
    </div>
  );
};

export function sortDataItems<T>(
  items: T[],
  sortBy: SortOption,
  extractors: {
    getName?: (item: T) => string;
    getNis?: (item: T) => string;
    getDate?: (item: T) => string;
  }
): T[] {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sortBy === 'az') {
      const nameA = (extractors.getName ? extractors.getName(a) : '') || '';
      const nameB = (extractors.getName ? extractors.getName(b) : '') || '';
      return nameA.localeCompare(nameB, 'id', { sensitivity: 'base' });
    }
    if (sortBy === 'za') {
      const nameA = (extractors.getName ? extractors.getName(a) : '') || '';
      const nameB = (extractors.getName ? extractors.getName(b) : '') || '';
      return nameB.localeCompare(nameA, 'id', { sensitivity: 'base' });
    }
    if (sortBy === 'nis') {
      const nisA = (extractors.getNis ? extractors.getNis(a) : '') || '';
      const nisB = (extractors.getNis ? extractors.getNis(b) : '') || '';
      return nisA.localeCompare(nisB, undefined, { numeric: true });
    }
    if (sortBy === 'tanggal') {
      const dateA = (extractors.getDate ? extractors.getDate(a) : '') || '';
      const dateB = (extractors.getDate ? extractors.getDate(b) : '') || '';
      const tA = dateA ? new Date(dateA).getTime() : 0;
      const tB = dateB ? new Date(dateB).getTime() : 0;
      if (tA !== tB && !isNaN(tA) && !isNaN(tB)) {
        return tB - tA; // Terbaru ke Terlama
      }
      return dateB.localeCompare(dateA);
    }
    return 0;
  });
  return copy;
}
