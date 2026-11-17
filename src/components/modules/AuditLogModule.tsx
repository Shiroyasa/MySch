import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Search, Filter, Download, ShieldCheck } from 'lucide-react';
import { exportToExcel, exportToCsv } from '../../utils/exportUtils';
import { AcademyHeroBanner } from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';
import { CarouselTablePagination, useCarouselPagination } from '../common/CarouselTablePagination';
import { AccordionExpandAllBar, AccordionSection, useAccordionGroup } from '../common/AccordionExpandGroup';

export const AuditLogModule: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('tanggal');
  const filterAccordion = useAccordionGroup(['audit_filters'], true);

  const modules = Array.from(new Set(auditLogs.map(l => l.module)));

  const filteredLogs = sortDataItems(
    auditLogs.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = filterModule === 'ALL' || log.module === filterModule;
      return matchesSearch && matchesModule;
    }),
    sortBy,
    {
      getName: l => l.userName,
      getNis: l => l.id,
      getDate: l => l.timestamp,
    }
  );

  const logPagination = useCarouselPagination(filteredLogs, 10);

  const handleExport = () => {
    const rows = filteredLogs.map((l, i) => ({
      No: i + 1,
      Waktu: new Date(l.timestamp).toLocaleString('id-ID'),
      'Nama Pengguna': l.userName,
      Peran: l.userRole,
      Modul: l.module,
      Tindakan: l.action,
      Keterangan: l.details,
    }));
    exportToExcel(rows, 'Audit_Log_Keamanan_ORBITA');
  };

  return (
    <div className="space-y-6">
      <AcademyHeroBanner
        moduleKey="audit-logs"
        kicker="AEGIS SECURITY • JEJAK AUDIT SISTEM"
        title="AUDIT LOG & REKAM AKTIVITAS KEAMANAN"
        subtitle="Catatan aktivitas sistem dan perubahan data secara real-time yang tidak dapat diubah (Immutable Audit Trail)."
        icon={ShieldCheck}
        rightContent={
          <button
            type="button"
            onClick={handleExport}
            className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#5E52A8] cursor-pointer transition-colors whitespace-nowrap shrink-0 leading-none"
          >
            <Download className="h-3.5 w-3.5 text-white shrink-0" />
            <span>Ekspor Audit Log (XLSX)</span>
          </button>
        }
      />

      {/* Filter and Search with Accordion Expand-All */}
      <div className="space-y-2.5">
        <AccordionExpandAllBar
          title="Filter Audit Log & Dropdown Modul"
          allExpanded={filterAccordion.allExpanded}
          onExpandAll={filterAccordion.expandAll}
          onCollapseAll={filterAccordion.collapseAll}
        />
        <AccordionSection
          title="Pencarian & Filter Modul Audit"
          subtitle={`${filteredLogs.length} catatan aktivitas ditemukan`}
          icon={<Filter className="h-3.5 w-3.5" />}
          open={filterAccordion.isOpen('audit_filters')}
          onToggle={() => filterAccordion.toggle('audit_filters')}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari aksi, pengguna, atau rincian audit..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterModule}
                onChange={e => setFilterModule(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">Semua Modul</option>
                {modules.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <SortByControl value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Logs Table with Carousel Pagination & Squeeze Line */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div key={logPagination.animKey} className={`overflow-x-auto ${logPagination.slideClass}`}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-40">Waktu &amp; Tanggal</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logPagination.paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada catatan audit log yang sesuai filter.
                  </td>
                </tr>
              ) : (
                logPagination.paginatedItems.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center text-slate-400">
                      {logPagination.startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{log.userRole.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">{log.module}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-snug">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 pt-0">
          <CarouselTablePagination
            page={logPagination.page}
            totalPages={logPagination.totalPages}
            totalItems={logPagination.totalItems}
            pageSize={logPagination.pageSize}
            startIndex={logPagination.startIndex}
            endIndex={logPagination.endIndex}
            slideDirection={logPagination.slideDirection}
            onPageChange={logPagination.setPage}
            onPageSizeChange={logPagination.setPageSize}
            itemLabel="log audit"
          />
        </div>
      </div>
    </div>
  );
};
