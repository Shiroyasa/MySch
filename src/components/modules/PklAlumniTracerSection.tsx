import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlumniTracerRecord,
  AlumniRespondentCategory,
  AlumniCareerStatus,
  AlumniRelevanceLevel,
  AlumniWaitingPeriod,
  IndustryPartner,
  Student,
  Major,
  ClassRoom,
} from '../../types';
import {
  GraduationCap,
  Briefcase,
  Building2,
  Rocket,
  Clock,
  UserX,
  Search,
  Plus,
  Download,
  FileText,
  Printer,
  CheckCircle2,
  MapPin,
  Edit,
  Trash2,
  X,
  Filter,
  RotateCcw,
  Award,
  Quote,
  Table2,
  Save,
  RefreshCw,
  LayoutGrid,
  AlertCircle,
  Upload,
  PenTool,
  Image as ImageIcon,
  FileCheck2,
  ScrollText,
  Sparkles,
  Send,
} from 'lucide-react';
import { HighlightedChartHeader, OrbitaMenuIcon } from '../common/AcademyOrnaments';
import { LiquidNavBar } from '../common/LiquidNavBar';
import { CarouselTablePagination, useCarouselPagination } from '../common/CarouselTablePagination';
import { AccordionExpandAllBar, AccordionSection, useAccordionGroup } from '../common/AccordionExpandGroup';
import {
  ReportCustomConfig,
  defaultReportConfig,
  exportToExcel,
  exportToCsv,
  exportToPdf,
} from '../../utils/exportUtils';

interface PklAlumniTracerSectionProps {
  tracers: AlumniTracerRecord[];
  students: Student[];
  classes?: ClassRoom[];
  partners: IndustryPartner[];
  majors: Major[];
  academicYearName: string;
  onSaveTracer: (tracer: AlumniTracerRecord, isNew?: boolean) => Promise<void> | void;
  onSaveTracersBatch?: (tracers: AlumniTracerRecord[], deletedIds?: string[]) => Promise<void>;
  onDeleteTracer: (tracerId: string) => Promise<void> | void;
  onClearAllTracers?: () => Promise<void> | void;
  reportTemplate?: ReportCustomConfig;
  onSaveReportTemplate?: (template: ReportCustomConfig) => Promise<void> | void;
  appLogoUrl?: string;
  onConfirmDelete: (config: {
    title: string;
    itemName: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  }) => void;
  onToast: (msg: string) => void;
}

const TRACER_MAJORS = ['DPB', 'RPL'] as const;
type TracerMajorCode = (typeof TRACER_MAJORS)[number];

const TRACER_MAJOR_LABELS: Record<TracerMajorCode, string> = {
  DPB: 'DPB (Desain & Produksi Busana)',
  RPL: 'RPL (Rekayasa Perangkat Lunak)',
};

const normalizeTracerMajor = (code?: string): TracerMajorCode => {
  const upper = (code || '').trim().toUpperCase();
  if (upper.includes('DPB') || upper.includes('BUSANA')) return 'DPB';
  return 'RPL';
};

const CAREER_STATUS_META: Record<
  AlumniCareerStatus,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    barClass: string;
    textClass: string;
    icon: React.FC<{ className?: string }>;
  }
> = {
  bekerja: {
    label: 'Bekerja di Industri / DUDI',
    shortLabel: 'Bekerja (DUDI)',
    badgeClass:
      'bg-[#E7F9EF] text-[#139A4C] border border-[#BCEAD1] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
    barClass: 'bg-[#1CC865]',
    textClass: 'text-[#139A4C] dark:text-emerald-400',
    icon: Briefcase,
  },
  kuliah: {
    label: 'Melanjutkan Kuliah (PTN/PTS)',
    shortLabel: 'Lanjut Kuliah',
    badgeClass:
      'bg-[#F0EEFA] text-[#6C60B8] border border-[#DDD8F6] dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/70',
    barClass: 'bg-[#6C60B8]',
    textClass: 'text-[#6C60B8] dark:text-violet-300',
    icon: GraduationCap,
  },
  wirausaha: {
    label: 'Berwirausaha Mandiri',
    shortLabel: 'Wirausaha',
    badgeClass:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    barClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    icon: Rocket,
  },
  mencari_kerja: {
    label: 'Menunggu Seleksi / Pelatihan BKK',
    shortLabel: 'Pelatihan / BKK',
    badgeClass:
      'bg-[#FFE8EF] text-[#D9436D] border border-[#FFC4D4] dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70',
    barClass: 'bg-[#FF7597]',
    textClass: 'text-[#D9436D] dark:text-rose-400',
    icon: Clock,
  },
  belum_bekerja: {
    label: 'Belum Bekerja',
    shortLabel: 'Belum Bekerja',
    badgeClass:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    barClass: 'bg-slate-400 dark:bg-slate-500',
    textClass: 'text-slate-600 dark:text-slate-300',
    icon: UserX,
  },
};

const getStatusMeta = (status: AlumniCareerStatus | string) =>
  CAREER_STATUS_META[status as AlumniCareerStatus] || CAREER_STATUS_META.belum_bekerja;

const RELEVANCE_LABEL: Record<
  AlumniRelevanceLevel,
  { label: string; colorClass: string; barClass: string }
> = {
  sangat_sesuai: {
    label: 'Sangat Sesuai Jurusan',
    colorClass: 'text-[#139A4C] dark:text-emerald-400',
    barClass: 'bg-[#1CC865]',
  },
  sesuai: {
    label: 'Sesuai Kompetensi',
    colorClass: 'text-[#6C60B8] dark:text-violet-300',
    barClass: 'bg-[#6C60B8]',
  },
  cukup_sesuai: {
    label: 'Cukup Sesuai',
    colorClass: 'text-amber-600 dark:text-amber-400',
    barClass: 'bg-amber-500',
  },
  tidak_sesuai: {
    label: 'Lintas Bidang',
    colorClass: 'text-[#D9436D] dark:text-rose-400',
    barClass: 'bg-[#FF7597]',
  },
};

const WAITING_PERIODS: AlumniWaitingPeriod[] = ['< 3 Bulan', '3 - 6 Bulan', '6 - 12 Bulan', '> 12 Bulan'];

const BKK_SUPPORT_OPTIONS = [
  'Info Lowongan Kerja & Rekrutmen Industri (DUDI)',
  'Bimbingan CV, Psikotes & Simulasi Interview Kerja',
  'Pendampingan Pendaftaran Kuliah (SNBP/SNBT/PTS/Beasiswa)',
  'Pelatihan Wirausaha Mandiri & Inkubasi Bisnis',
  'Konseling Penentuan Arah Karir Pasca Lulus',
];

const PLAN_TIMELINE_OPTIONS = [
  'Langsung Setelah Pengumuman Kelulusan',
  'Dalam 1 - 3 Bulan Setelah Lulus',
  'Tahun Akademik / Gelombang Masuk Berikutnya',
  'Masih Mempersiapkan Berkas & Portofolio',
];

const ACCENT_PRESETS: { label: string; rgb: [number, number, number]; hex: string }[] = [
  { label: 'Navy Resmi', rgb: [15, 23, 42], hex: '#0f172a' },
  { label: 'Ungu ORBITA', rgb: [108, 96, 184], hex: '#6c60b8' },
  { label: 'Biru Akademik', rgb: [30, 64, 175], hex: '#1e40af' },
  { label: 'Emerald Vokasi', rgb: [6, 95, 70], hex: '#065f46' },
  { label: 'Crimson', rgb: [136, 19, 55], hex: '#881337' },
];

const readAndOptimizeImage = (file: File, maxDim: number = 480): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
    reader.onload = () => {
      const rawUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        try {
          const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * ratio));
          const h = Math.max(1, Math.round(img.height * ratio));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawUrl);
            return;
          }
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const hasTransparency = file.type === 'image/png' || file.type === 'image/webp';
          resolve(
            hasTransparency
              ? canvas.toDataURL('image/png')
              : canvas.toDataURL('image/jpeg', 0.88)
          );
        } catch {
          resolve(rawUrl);
        }
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });

export const PklAlumniTracerSection: React.FC<PklAlumniTracerSectionProps> = ({
  tracers,
  students,
  classes = [],
  partners,
  majors: _majors,
  academicYearName,
  onSaveTracer,
  onSaveTracersBatch,
  onDeleteTracer,
  onClearAllTracers,
  reportTemplate,
  onSaveReportTemplate,
  appLogoUrl,
  onConfirmDelete,
  onToast,
}) => {
  const [viewMode, setViewMode] = useState<'directory' | 'editable' | 'paper_print'>('directory');
  const [paperEditorTab, setPaperEditorTab] = useState<'kop' | 'dokumen' | 'ttd'>('kop');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AlumniRespondentCategory>('alumni');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [majorFilter, setMajorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<AlumniCareerStatus | 'ALL'>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editingTracerId, setEditingTracerId] = useState<string | null>(null);

  // Editable Spreadsheet Draft State
  const [draftRows, setDraftRows] = useState<AlumniTracerRecord[]>([]);
  const [deletedDraftIds, setDeletedDraftIds] = useState<string[]>([]);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [isSyncingDraft, setIsSyncingDraft] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [isLaunchingSyncPlane, setIsLaunchingSyncPlane] = useState(false);
  const [isLaunchingModalPlane, setIsLaunchingModalPlane] = useState(false);
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);
  const tracerAccordion = useAccordionGroup(['tracer_filters', 'modal_identity', 'modal_career'], true);

  // Paper Report & Print Customizer State (Synced with reportTemplate in AppContext/Firestore)
  const [paperConfig, setPaperConfig] = useState<ReportCustomConfig>(() => ({
    ...defaultReportConfig,
    ...(reportTemplate || {}),
    logoDataUrl: reportTemplate?.logoDataUrl || appLogoUrl || defaultReportConfig.logoDataUrl,
    leftSignerHeader: reportTemplate?.leftSignerHeader || 'Mengetahui,',
    leftSignerTitle: reportTemplate?.leftSignerTitle || 'Ketua BKK / Koordinator PKL,',
    footerNote:
      reportTemplate?.footerNote ||
      'Laporan penelusuran alumni ini disusun sesuai data resmi Bursa Kerja Khusus (BKK) dan terintegrasi ke sistem akademik ORBITA.',
  }));
  const [paperDocTitle, setPaperDocTitle] = useState<string>(
    'LAPORAN TRACER STUDY & PENYERAPAN ALUMNI (DPB & RPL)'
  );
  const [paperDocSubtitle, setPaperDocSubtitle] = useState<string>(
    `Rekapitulasi Status Karier, Relevansi Kompetensi & Masa Tunggu Lulusan T.A. ${academicYearName}`
  );
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [showSummaryOnPaper, setShowSummaryOnPaper] = useState<boolean>(true);
  const [showSignaturesOnPaper, setShowSignaturesOnPaper] = useState<boolean>(true);

  useEffect(() => {
    if (reportTemplate) {
      setPaperConfig({
        ...defaultReportConfig,
        ...reportTemplate,
        logoDataUrl:
          reportTemplate.logoDataUrl !== undefined
            ? reportTemplate.logoDataUrl || undefined
            : appLogoUrl,
        leftSignerHeader: reportTemplate.leftSignerHeader || 'Mengetahui,',
        leftSignerTitle: reportTemplate.leftSignerTitle || 'Ketua BKK / Koordinator PKL,',
        footerNote:
          reportTemplate.footerNote ||
          'Laporan penelusuran alumni ini disusun sesuai data resmi Bursa Kerja Khusus (BKK) dan terintegrasi ke sistem akademik ORBITA.',
      });
    }
  }, [reportTemplate, appLogoUrl]);

  useEffect(() => {
    if (!isDraftDirty) {
      setDraftRows(
        tracers.map(t => ({
          ...t,
          majorCode: normalizeTracerMajor(t.majorCode),
        }))
      );
      setDeletedDraftIds([]);
    }
  }, [tracers, isDraftDirty]);

  const [formState, setFormState] = useState<{
    respondentCategory: AlumniRespondentCategory;
    studentId: string;
    nisn: string;
    fullName: string;
    className: string;
    gender: 'L' | 'P';
    majorCode: TracerMajorCode;
    graduationYear: string;
    pklPartnerId: string;
    pklPartnerName: string;
    careerStatus: AlumniCareerStatus;
    institutionOrCompany: string;
    roleOrStudyProgram: string;
    city: string;
    industryRelevance: AlumniRelevanceLevel;
    waitingPeriod: AlumniWaitingPeriod;
    monthlyIncomeRange: string;
    bkkSupportNeed: string;
    targetPlanDate: string;
    phone: string;
    email: string;
    testimonial: string;
    verifiedBySchool: boolean;
  }>({
    respondentCategory: 'alumni',
    studentId: '',
    nisn: '',
    fullName: '',
    className: '',
    gender: 'L',
    majorCode: 'RPL',
    graduationYear: '2026',
    pklPartnerId: '',
    pklPartnerName: '',
    careerStatus: 'bekerja',
    institutionOrCompany: '',
    roleOrStudyProgram: '',
    city: 'Sukabumi',
    industryRelevance: 'sangat_sesuai',
    waitingPeriod: '< 3 Bulan',
    monthlyIncomeRange: 'Rp 4.500.000 - Rp 6.000.000',
    bkkSupportNeed: '',
    targetPlanDate: '',
    phone: '',
    email: '',
    testimonial: '',
    verifiedBySchool: true,
  });

  // Always show live editable draft on paper if user has edits or is in editable/paper mode
  const activeSourceList =
    isDraftDirty || viewMode === 'editable' || viewMode === 'paper_print' ? draftRows : tracers;

  const graduationYears = useMemo(() => {
    const years = Array.from(
      new Set(['2026', '2025', ...activeSourceList.map(t => t.graduationYear).filter(Boolean)])
    ).sort((a, b) => b.localeCompare(a));
    return ['ALL', ...years];
  }, [activeSourceList]);

  const defaultGradYear = useMemo(() => {
    const match = (academicYearName || '').match(/(\d{4})\s*$/);
    return match ? match[1] : '2026';
  }, [academicYearName]);

  const grade12Classes = useMemo(() => {
    const matched = classes.filter(c => {
      const n = (c.name || '').trim().toUpperCase();
      return c.gradeLevel === 'XII' || n.startsWith('XII') || n.startsWith('12');
    });
    return matched.length > 0 ? matched : classes;
  }, [classes]);

  const grade12ClassIds = useMemo(
    () =>
      new Set(
        classes
          .filter(c => {
            const n = (c.name || '').trim().toUpperCase();
            return c.gradeLevel === 'XII' || n.startsWith('XII') || n.startsWith('12');
          })
          .map(c => c.id)
      ),
    [classes]
  );

  const grade12Students = useMemo(() => {
    const activeStudents = students.filter(
      s => s.status !== 'lulus' && s.status !== 'mutasi' && s.status !== 'keluar'
    );
    const g12 = activeStudents.filter(s => {
      const cls = (s.className || '').trim().toUpperCase();
      return cls.startsWith('XII') || cls.startsWith('12') || grade12ClassIds.has(s.classId);
    });
    const sourceList = g12.length > 0 ? g12 : activeStudents;
    return [...sourceList].sort((a, b) => a.fullName.localeCompare(b.fullName, 'id'));
  }, [students, grade12ClassIds]);

  const recordedAlumniTracers = useMemo(
    () =>
      tracers
        .filter(t => (t.respondentCategory || 'alumni') === 'alumni')
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'id')),
    [tracers]
  );

  const graduatedStudents = useMemo(() => {
    const normalizeNisn = (v?: string) => (v || '').trim().replace(/\s+/g, '');
    const alumniNisns = new Set(recordedAlumniTracers.map(t => normalizeNisn(t.nisn)).filter(Boolean));
    const alumniStudentKeys = new Set(
      recordedAlumniTracers
        .filter(t => t.studentId)
        .map(t => `${t.studentId}::${t.fullName.trim().toLowerCase()}`)
    );
    return students
      .filter(
        s =>
          s.status === 'lulus' &&
          !alumniNisns.has(normalizeNisn(s.nisn)) &&
          !alumniStudentKeys.has(`${s.id}::${s.fullName.trim().toLowerCase()}`)
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'id'));
  }, [students, recordedAlumniTracers]);

  const totalAlumniInSource = useMemo(
    () =>
      activeSourceList.filter(t => (t.respondentCategory || 'alumni') === 'alumni').length,
    [activeSourceList]
  );

  const totalKelas12InSource = useMemo(
    () => activeSourceList.filter(t => t.respondentCategory === 'kelas_12').length,
    [activeSourceList]
  );

  const filteredTracers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeSourceList.filter(t => {
      const normalizedMajor = normalizeTracerMajor(t.majorCode);
      const recCategory: AlumniRespondentCategory =
        t.respondentCategory === 'kelas_12' ? 'kelas_12' : 'alumni';
      const matchSearch =
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        t.nisn.toLowerCase().includes(q) ||
        (t.className || '').toLowerCase().includes(q) ||
        (t.bkkSupportNeed || '').toLowerCase().includes(q) ||
        (t.institutionOrCompany || '').toLowerCase().includes(q) ||
        (t.roleOrStudyProgram || '').toLowerCase().includes(q) ||
        (t.city || '').toLowerCase().includes(q);
      const matchCategory = recCategory === categoryFilter;
      const matchYear = yearFilter === 'ALL' || t.graduationYear === yearFilter;
      const matchMajor = majorFilter === 'ALL' || normalizedMajor === majorFilter;
      const matchStatus = statusFilter === 'ALL' || t.careerStatus === statusFilter;
      return matchSearch && matchCategory && matchYear && matchMajor && matchStatus;
    });
  }, [activeSourceList, searchQuery, categoryFilter, yearFilter, majorFilter, statusFilter]);

  const tracerPagination = useCarouselPagination(filteredTracers, 8);

  const stats = useMemo(() => {
    const total = filteredTracers.length;
    const alumniCount = filteredTracers.filter(
      t => (t.respondentCategory || 'alumni') === 'alumni'
    ).length;
    const kelas12Count = filteredTracers.filter(t => t.respondentCategory === 'kelas_12').length;
    const bekerja = filteredTracers.filter(t => t.careerStatus === 'bekerja').length;
    const kuliah = filteredTracers.filter(t => t.careerStatus === 'kuliah').length;
    const wirausaha = filteredTracers.filter(t => t.careerStatus === 'wirausaha').length;
    const mencariKerja = filteredTracers.filter(t => t.careerStatus === 'mencari_kerja').length;
    const belumBekerja = filteredTracers.filter(t => t.careerStatus === 'belum_bekerja').length;
    const dpbCount = filteredTracers.filter(t => normalizeTracerMajor(t.majorCode) === 'DPB').length;
    const rplCount = filteredTracers.filter(t => normalizeTracerMajor(t.majorCode) === 'RPL').length;
    const verified = filteredTracers.filter(t => t.verifiedBySchool).length;
    const relevantCount = filteredTracers.filter(
      t => t.industryRelevance === 'sangat_sesuai' || t.industryRelevance === 'sesuai'
    ).length;
    const fastPlaced = filteredTracers.filter(t => t.waitingPeriod === '< 3 Bulan').length;

    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    return {
      total,
      alumniCount,
      kelas12Count,
      bekerja,
      kuliah,
      wirausaha,
      mencariKerja,
      belumBekerja,
      dpbCount,
      rplCount,
      verified,
      bekerjaPct: pct(bekerja),
      kuliahWirausahaPct: pct(kuliah + wirausaha),
      belumBekerjaPct: pct(belumBekerja),
      bmwAbsorbedPct: pct(bekerja + kuliah + wirausaha),
      relevantPct: pct(relevantCount),
      fastPlacedPct: pct(fastPlaced),
      statusRows: [
        { key: 'bekerja' as AlumniCareerStatus, count: bekerja, pct: pct(bekerja) },
        { key: 'kuliah' as AlumniCareerStatus, count: kuliah, pct: pct(kuliah) },
        { key: 'wirausaha' as AlumniCareerStatus, count: wirausaha, pct: pct(wirausaha) },
        { key: 'mencari_kerja' as AlumniCareerStatus, count: mencariKerja, pct: pct(mencariKerja) },
        { key: 'belum_bekerja' as AlumniCareerStatus, count: belumBekerja, pct: pct(belumBekerja) },
      ],
      relevanceRows: (Object.keys(RELEVANCE_LABEL) as AlumniRelevanceLevel[]).map(lvl => {
        const count = filteredTracers.filter(t => t.industryRelevance === lvl).length;
        return { key: lvl, count, pct: pct(count) };
      }),
      waitingRows: WAITING_PERIODS.map(wp => {
        const count = filteredTracers.filter(t => t.waitingPeriod === wp).length;
        return { label: wp, count, pct: pct(count) };
      }),
    };
  }, [filteredTracers]);

  const openCreateModal = () => {
    const isGrade12Tab = categoryFilter === 'kelas_12';
    setEditingTracerId(null);
    setFormSubmitAttempted(false);
    setFormState({
      respondentCategory: isGrade12Tab ? 'kelas_12' : 'alumni',
      studentId: '',
      nisn: '',
      fullName: '',
      className: '',
      gender: 'L',
      majorCode: majorFilter === 'DPB' ? 'DPB' : 'RPL',
      graduationYear: yearFilter !== 'ALL' ? yearFilter : isGrade12Tab ? defaultGradYear : '2025',
      pklPartnerId: '',
      pklPartnerName: '',
      careerStatus: statusFilter !== 'ALL' ? statusFilter : 'bekerja',
      institutionOrCompany: '',
      roleOrStudyProgram: '',
      city: isGrade12Tab ? '' : 'Sukabumi',
      industryRelevance: 'sangat_sesuai',
      waitingPeriod: '< 3 Bulan',
      monthlyIncomeRange: isGrade12Tab ? '' : 'Rp 4.500.000 - Rp 6.000.000',
      bkkSupportNeed: isGrade12Tab ? BKK_SUPPORT_OPTIONS[0] : '',
      targetPlanDate: isGrade12Tab ? PLAN_TIMELINE_OPTIONS[0] : '',
      phone: '',
      email: '',
      testimonial: '',
      verifiedBySchool: true,
    });
    setShowModal(true);
  };

  const openEditModal = (rec: AlumniTracerRecord) => {
    const isRecGrade12 = rec.respondentCategory === 'kelas_12';
    setEditingTracerId(rec.id);
    setFormState({
      respondentCategory: isRecGrade12 ? 'kelas_12' : 'alumni',
      studentId: rec.studentId || '',
      nisn: rec.nisn,
      fullName: rec.fullName,
      className: rec.className || (isRecGrade12 ? grade12Classes[0]?.name || 'XII RPL 1' : ''),
      gender: rec.gender,
      majorCode: normalizeTracerMajor(rec.majorCode),
      graduationYear: rec.graduationYear,
      pklPartnerId: rec.pklPartnerId || '',
      pklPartnerName: rec.pklPartnerName || '',
      careerStatus: rec.careerStatus,
      institutionOrCompany: rec.institutionOrCompany === '-' ? '' : rec.institutionOrCompany,
      roleOrStudyProgram: rec.roleOrStudyProgram === '-' ? '' : rec.roleOrStudyProgram,
      city: rec.city,
      industryRelevance: rec.industryRelevance,
      waitingPeriod: rec.waitingPeriod,
      monthlyIncomeRange: rec.monthlyIncomeRange || '',
      bkkSupportNeed: rec.bkkSupportNeed || (isRecGrade12 ? BKK_SUPPORT_OPTIONS[0] : ''),
      targetPlanDate: rec.targetPlanDate || (isRecGrade12 ? PLAN_TIMELINE_OPTIONS[0] : ''),
      phone: rec.phone || '',
      email: rec.email || '',
      testimonial: rec.testimonial || '',
      verifiedBySchool: rec.verifiedBySchool,
    });
    setShowModal(true);
  };

  const handlePrefillFromStudent = (stdId: string, targetCategory?: AlumniRespondentCategory) => {
    const std = students.find(s => s.id === stdId);
    if (!std) {
      setEditingTracerId(null);
      setFormState(prev => ({ ...prev, studentId: '' }));
      return;
    }

    const activeCat = targetCategory || formState.respondentCategory;
    const norm = (v?: string) => (v || '').trim().replace(/\s+/g, '');
    const existingRecord = tracers.find(
      t =>
        (t.respondentCategory || 'alumni') === activeCat &&
        ((std.nisn && norm(t.nisn) === norm(std.nisn)) ||
          (t.studentId === std.id &&
            t.fullName.trim().toLowerCase() === std.fullName.trim().toLowerCase()))
    );
    if (existingRecord) {
      openEditModal(existingRecord);
      onToast(`Data ${existingRecord.fullName} sudah terdata — dimuat untuk pembaruan.`);
      return;
    }

    const matchedPartner = partners.find(p =>
      (p.placements || []).some(pl => pl.studentId === std.id)
    );
    setEditingTracerId(null);
    setFormState(prev => ({
      ...prev,
      respondentCategory: activeCat,
      studentId: std.id,
      nisn: std.nisn,
      fullName: std.fullName,
      className:
        activeCat === 'kelas_12'
          ? std.className || grade12Classes[0]?.name || prev.className || 'XII RPL 1'
          : '',
      graduationYear: activeCat === 'kelas_12' ? defaultGradYear : prev.graduationYear || '2025',
      gender: std.gender,
      majorCode: normalizeTracerMajor(std.majorCode),
      phone: std.phone || prev.phone,
      pklPartnerId: matchedPartner?.id || prev.pklPartnerId,
      pklPartnerName: matchedPartner?.name || prev.pklPartnerName,
      bkkSupportNeed: activeCat === 'kelas_12' ? prev.bkkSupportNeed || BKK_SUPPORT_OPTIONS[0] : '',
      targetPlanDate: activeCat === 'kelas_12' ? prev.targetPlanDate || PLAN_TIMELINE_OPTIONS[0] : '',
      institutionOrCompany:
        prev.careerStatus === 'bekerja' && matchedPartner && !prev.institutionOrCompany
          ? matchedPartner.name
          : prev.institutionOrCompany,
    }));
  };

  const handlePrefillFromRecordedAlumni = (selectedVal: string) => {
    if (!selectedVal) {
      setEditingTracerId(null);
      setFormState(prev => ({
        ...prev,
        respondentCategory: 'alumni',
        studentId: '',
        nisn: '',
        fullName: '',
        className: '',
        graduationYear: '2025',
      }));
      return;
    }
    if (selectedVal.startsWith('trc:')) {
      const rec = recordedAlumniTracers.find(t => t.id === selectedVal.slice(4));
      if (rec) {
        openEditModal(rec);
        onToast(`Data alumni ${rec.fullName} dimuat dari Database untuk pembaruan.`);
      }
      return;
    }
    if (selectedVal.startsWith('std:')) {
      handlePrefillFromStudent(selectedVal.slice(4), 'alumni');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitAttempted(true);
    const isUnemployedStatus =
      formState.careerStatus === 'belum_bekerja' || formState.careerStatus === 'mencari_kerja';
    if (!formState.fullName.trim()) {
      onToast('Nama lengkap responden wajib diisi.');
      return;
    }
    if (!isUnemployedStatus && !formState.institutionOrCompany.trim()) {
      onToast('Nama perusahaan / kampus / usaha wajib diisi.');
      return;
    }

    const chosenPartner = partners.find(p => p.id === formState.pklPartnerId);
    const isGrade12Payload = formState.respondentCategory === 'kelas_12';
    const payload: AlumniTracerRecord = {
      id: editingTracerId || `trc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      respondentCategory: formState.respondentCategory,
      studentId: formState.studentId || undefined,
      nisn: formState.nisn.trim() || `00${Date.now().toString().slice(-8)}`,
      fullName: formState.fullName.trim(),
      className: isGrade12Payload
        ? formState.className.trim() || grade12Classes[0]?.name || 'XII'
        : undefined,
      gender: formState.gender,
      majorCode: normalizeTracerMajor(formState.majorCode),
      graduationYear:
        formState.graduationYear.trim() || (isGrade12Payload ? defaultGradYear : '2025'),
      pklPartnerId: formState.pklPartnerId || undefined,
      pklPartnerName: chosenPartner?.name || formState.pklPartnerName || undefined,
      careerStatus: formState.careerStatus,
      institutionOrCompany: formState.institutionOrCompany.trim() || '-',
      roleOrStudyProgram: formState.roleOrStudyProgram.trim() || '-',
      city: formState.city.trim() || 'Sukabumi',
      industryRelevance: formState.industryRelevance,
      waitingPeriod: formState.waitingPeriod,
      monthlyIncomeRange: !isGrade12Payload
        ? formState.monthlyIncomeRange.trim() || undefined
        : undefined,
      bkkSupportNeed: isGrade12Payload
        ? formState.bkkSupportNeed.trim() || undefined
        : undefined,
      targetPlanDate: isGrade12Payload
        ? formState.targetPlanDate.trim() || undefined
        : undefined,
      phone: formState.phone.trim() || undefined,
      email: formState.email.trim() || undefined,
      testimonial: formState.testimonial.trim() || undefined,
      verifiedBySchool: formState.verifiedBySchool,
      submittedSource: 'admin_panel',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setIsSavingModal(true);
    setIsLaunchingModalPlane(true);
    setSyncError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 420));
      await Promise.resolve(onSaveTracer(payload, !editingTracerId));
      setFormSubmitAttempted(false);
      setShowModal(false);
      onToast(
        isGrade12Payload
          ? editingTracerId
            ? `Rencana pasca lulus ${payload.fullName} berhasil diperbarui & tersinkron ke Database.`
            : `Rencana pasca lulus ${payload.fullName} berhasil disimpan ke Database Cloud.`
          : editingTracerId
          ? `Data tracer study alumni ${payload.fullName} berhasil diperbarui & tersinkron ke Database.`
          : `Jejak alumni ${payload.fullName} berhasil disimpan ke Database Cloud.`
      );
    } catch (err) {
      console.error('Error saving tracer study record:', err);
      setSyncError('Gagal menyimpan ke Database Cloud.');
      onToast('Gagal menyimpan data tracer ke Database Cloud. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsSavingModal(false);
      setIsLaunchingModalPlane(false);
    }
  };

  // --- Editable Spreadsheet Helpers ---
  const handleUpdateDraftCell = <K extends keyof AlumniTracerRecord>(
    rowId: string,
    field: K,
    value: AlumniTracerRecord[K]
  ) => {
    setDraftRows(prev =>
      prev.map(row =>
        row.id === rowId
          ? {
              ...row,
              [field]: field === 'majorCode' ? normalizeTracerMajor(String(value)) : value,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : row
      )
    );
    setIsDraftDirty(true);
  };

  const handleAddEditableRow = () => {
    const newRow: AlumniTracerRecord = {
      id: `trc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      respondentCategory: categoryFilter,
      nisn: `00${Date.now().toString().slice(-8)}`,
      fullName: '',
      className:
        categoryFilter === 'kelas_12' ? grade12Classes[0]?.name || 'XII RPL 1' : undefined,
      gender: 'L',
      majorCode: majorFilter === 'DPB' ? 'DPB' : 'RPL',
      graduationYear:
        yearFilter !== 'ALL' ? yearFilter : categoryFilter === 'kelas_12' ? defaultGradYear : '2025',
      careerStatus: statusFilter !== 'ALL' ? statusFilter : 'belum_bekerja',
      institutionOrCompany: '-',
      roleOrStudyProgram: '-',
      city: 'Sukabumi',
      industryRelevance: 'sesuai',
      waitingPeriod: '< 3 Bulan',
      verifiedBySchool: true,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (searchQuery.trim()) setSearchQuery('');
    setDraftRows(prev => [newRow, ...prev]);
    setIsDraftDirty(true);
    onToast(
      categoryFilter === 'kelas_12'
        ? 'Baris baru ditambahkan pada Halaman Siswa Kelas 12. Lengkapi data lalu klik Simpan & Sinkronkan.'
        : 'Baris baru ditambahkan pada Halaman Alumni. Lengkapi data lalu klik Simpan & Sinkronkan.'
    );
  };

  const handleDeleteEditableRow = (rowId: string) => {
    setDeletingRowId(rowId);
    window.setTimeout(() => {
      setDraftRows(prev => prev.filter(r => r.id !== rowId));
      if (tracers.some(t => t.id === rowId)) {
        setDeletedDraftIds(prev => (prev.includes(rowId) ? prev : [...prev, rowId]));
      }
      setIsDraftDirty(true);
      setDeletingRowId(null);
    }, 420);
  };

  const handleResetEditableDraft = () => {
    setDraftRows(
      tracers.map(t => ({
        ...t,
        majorCode: normalizeTracerMajor(t.majorCode),
      }))
    );
    setDeletedDraftIds([]);
    setIsDraftDirty(false);
    onToast('Draf Laporan Editable dikembalikan sesuai data Database terbaru.');
  };

  const handleSyncEditableDraftToDb = async () => {
    const emptyNameRow = draftRows.find(r => !r.fullName.trim());
    if (emptyNameRow) {
      onToast('Lengkapi Nama Alumni pada seluruh baris yang baru ditambahkan sebelum menyinkronkan ke database.');
      return;
    }

    const sanitizedPayload: AlumniTracerRecord[] = draftRows.map(row => ({
      ...row,
      nisn: row.nisn.trim() || `00${Date.now().toString().slice(-8)}`,
      fullName: row.fullName.trim(),
      majorCode: normalizeTracerMajor(row.majorCode),
      graduationYear: (row.graduationYear || '2026').trim(),
      institutionOrCompany: (row.institutionOrCompany || '').trim() || '-',
      roleOrStudyProgram: (row.roleOrStudyProgram || '').trim() || '-',
      city: (row.city || '').trim() || 'Sukabumi',
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    setIsSyncingDraft(true);
    setIsLaunchingSyncPlane(true);
    setSyncError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 420));
      if (onSaveTracersBatch) {
        await onSaveTracersBatch(sanitizedPayload, deletedDraftIds);
      } else {
        for (const row of sanitizedPayload) {
          await Promise.resolve(onSaveTracer(row, !tracers.some(t => t.id === row.id)));
        }
        for (const delId of deletedDraftIds) {
          await Promise.resolve(onDeleteTracer(delId));
        }
      }
      setDraftRows(sanitizedPayload);
      setDeletedDraftIds([]);
      setIsDraftDirty(false);
      onToast(
        `Berhasil menyimpan & menyinkronkan ${sanitizedPayload.length} catatan Laporan Tracer Study ke Database Cloud!`
      );
    } catch (err) {
      console.error('Error syncing editable tracer draft:', err);
      setSyncError('Gagal sinkronisasi ke Database Cloud.');
      onToast('Gagal menyimpan & menyinkronkan draf ke Database Cloud. Pastikan koneksi stabil lalu coba lagi.');
    } finally {
      setIsSyncingDraft(false);
      setIsLaunchingSyncPlane(false);
    }
  };

  // --- Image Upload Handlers for Logo & Signature Scans ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndOptimizeImage(file, 420);
      setPaperConfig(prev => ({ ...prev, logoDataUrl: dataUrl }));
      onToast('Logo instansi berhasil dimuat ke Kop Surat kertas laporan.');
    } catch {
      onToast('Gagal membaca berkas gambar logo.');
    }
    e.target.value = '';
  };

  const handleSignatureUpload = async (
    side: 'left' | 'right',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readAndOptimizeImage(file, 460);
      setPaperConfig(prev =>
        side === 'left'
          ? { ...prev, leftSignerSignatureUrl: dataUrl }
          : { ...prev, rightSignerSignatureUrl: dataUrl }
      );
      onToast(
        side === 'left'
          ? 'Scan tanda tangan Penandatangan Kiri berhasil diterapkan ke kertas.'
          : 'Scan tanda tangan Kepala Sekolah berhasil diterapkan ke kertas.'
      );
    } catch {
      onToast('Gagal membaca berkas gambar tanda tangan.');
    }
    e.target.value = '';
  };

  const handleSaveKopTemplateToDb = async () => {
    if (!onSaveReportTemplate) return;
    setIsSavingTemplate(true);
    setSyncError(null);
    try {
      await Promise.resolve(onSaveReportTemplate(paperConfig));
      onToast('Pengaturan Kop Surat, Logo Instansi, dan Scan TTD berhasil disimpan & disinkronkan ke Database.');
    } catch (err) {
      console.error('Error saving report template:', err);
      setSyncError('Gagal menyimpan template Kop Surat ke Database.');
      onToast('Gagal menyimpan template Kop Surat ke Database. Ukuran logo/TTD mungkin terlalu besar atau koneksi terputus.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handlePrintPaperNow = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const handleExportExcel = () => {
    const data = filteredTracers.map((t, i) => ({
      No: i + 1,
      Kategori: t.respondentCategory === 'kelas_12' ? 'Siswa Kelas 12 (Rencana)' : 'Alumni Lulusan',
      NISN: t.nisn,
      Nama: t.fullName,
      Kelas: t.className || '-',
      'L/P': t.gender,
      Jurusan: normalizeTracerMajor(t.majorCode),
      'Tahun Lulus': t.graduationYear,
      'Status / Rencana Karier': getStatusMeta(t.careerStatus).label,
      'Perusahaan / Kampus / Usaha': t.institutionOrCompany || '-',
      'Jabatan / Program Studi': t.roleOrStudyProgram || '-',
      Kota: t.city || '-',
      'Pendampingan BKK': t.bkkSupportNeed || '-',
      'Mitra PKL Sebelumnya': t.pklPartnerName || '-',
      'Relevansi Kompetensi': (RELEVANCE_LABEL[t.industryRelevance] || RELEVANCE_LABEL.sesuai).label,
      'Waktu Tunggu': t.waitingPeriod,
      'Status Verifikasi': t.verifiedBySchool ? 'Terverifikasi BKK' : 'Menunggu Review',
    }));
    exportToExcel(data, `Tracer_Study_Alumni_${academicYearName}`, 'Tracer Alumni');
    onToast('Laporan Tracer Study (Alumni & Kelas 12) berhasil diekspor ke Excel.');
  };

  const handleExportCsv = () => {
    const data = filteredTracers.map((t, i) => ({
      No: i + 1,
      Kategori: t.respondentCategory === 'kelas_12' ? 'Kelas 12' : 'Alumni',
      NISN: t.nisn,
      Nama: t.fullName,
      Kelas: t.className || '-',
      Jurusan: normalizeTracerMajor(t.majorCode),
      Lulus: t.graduationYear,
      Status: getStatusMeta(t.careerStatus).shortLabel,
      Instansi: t.institutionOrCompany || '-',
      Posisi_Prodi: t.roleOrStudyProgram || '-',
      Kota: t.city || '-',
      Pendampingan_BKK: t.bkkSupportNeed || '-',
      Waktu_Tunggu: t.waitingPeriod,
    }));
    exportToCsv(data, `Tracer_Study_Alumni_${academicYearName}`);
    onToast('Data Tracer Study berhasil diekspor ke CSV.');
  };

  const handleExportPdf = () => {
    exportToPdf(
      ['No', 'Kategori', 'NISN', 'Nama & Kelas', 'Jurusan', 'Angkatan', 'Status', 'Instansi / Target', 'Posisi / Prodi', 'Tunggu'],
      filteredTracers.map((t, i) => [
        i + 1,
        t.respondentCategory === 'kelas_12' ? 'Kelas 12' : 'Alumni',
        t.nisn,
        t.className ? `${t.fullName} (${t.className})` : t.fullName,
        normalizeTracerMajor(t.majorCode),
        t.graduationYear,
        getStatusMeta(t.careerStatus).shortLabel,
        t.institutionOrCompany || '-',
        t.roleOrStudyProgram || '-',
        t.waitingPeriod,
      ]),
      {
        title: paperDocTitle || 'LAPORAN TRACER STUDY & PERENCANAAN LULUS (DPB & RPL)',
        subtitle: paperDocSubtitle || undefined,
        academicYear: `Tahun Ajaran ${academicYearName}`,
      },
      'Laporan_Tracer_Study_Alumni',
      paperOrientation,
      paperConfig
    );
    onToast('Dokumen PDF Tracer Study lengkap dengan Kop, Logo & TTD siap diunduh.');
  };

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    yearFilter !== 'ALL' ||
    majorFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const isModalUnemployed =
    formState.careerStatus === 'belum_bekerja' || formState.careerStatus === 'mencari_kerja';

  const accentHex = useMemo(() => {
    const rgb = paperConfig.accentColor || [15, 23, 42];
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }, [paperConfig.accentColor]);

  // Reusable Formal White Paper Sheet (Rendered both in Live Preview & dedicated Print Portal)
  const renderPaperDocument = () => (
    <div
      className={`paper-surface mx-auto bg-white text-slate-900 ${
        paperOrientation === 'landscape' ? 'min-w-[820px] max-w-[1040px]' : 'min-w-[680px] max-w-[790px]'
      } p-7 sm:p-10 print:min-w-0 print:max-w-none print:p-6`}
      style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" }}
    >
      {/* KOP SURAT */}
      {paperConfig.showKopSurat !== false && (
        <div className="print-keep-together mb-5">
          <div className="flex items-center gap-4 pb-3">
            {paperConfig.logoDataUrl && (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                <img
                  src={paperConfig.logoDataUrl}
                  alt="Logo Instansi"
                  className="max-h-20 max-w-20 object-contain"
                />
              </div>
            )}
            <div className="flex-1 text-center">
              {paperConfig.institutionFoundation && (
                <p
                  className="text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: accentHex }}
                >
                  {paperConfig.institutionFoundation}
                </p>
              )}
              <h2
                className="text-lg sm:text-xl font-black uppercase tracking-tight mt-0.5"
                style={{ color: accentHex }}
              >
                {paperConfig.institutionName || 'ORBITA'}
              </h2>
              {paperConfig.institutionTagline && (
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                  {paperConfig.institutionTagline}
                </p>
              )}
              <p className="text-[10.5px] text-slate-600 mt-0.5">
                {[paperConfig.institutionAddress, paperConfig.institutionContact].filter(Boolean).join(' • ')}
              </p>
              {paperConfig.institutionNpsn && (
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  {paperConfig.institutionNpsn}
                </p>
              )}
            </div>
            {paperConfig.logoDataUrl && <div className="w-20 shrink-0 hidden sm:block" />}
          </div>
          <div className="border-t-[3px] border-b border-slate-900 h-[4px]" style={{ borderTopColor: accentHex }} />
        </div>
      )}

      {/* JUDUL LAPORAN */}
      <div className="text-center mb-4">
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
          {paperDocTitle || 'LAPORAN TRACER STUDY & PENYERAPAN ALUMNI (DPB & RPL)'}
        </h3>
        {paperDocSubtitle && (
          <p className="text-[11.5px] font-medium text-slate-600 mt-1.5">{paperDocSubtitle}</p>
        )}
      </div>

      {/* METADATA RINGKAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] border border-slate-300 rounded-md px-3 py-2 mb-4 bg-slate-50/70">
        <div>
          <span className="text-slate-500 font-semibold">Tahun Ajaran:</span>{' '}
          <span className="font-bold text-slate-900">{academicYearName}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Filter Jurusan:</span>{' '}
          <span className="font-bold text-slate-900">{majorFilter === 'ALL' ? 'DPB & RPL' : majorFilter}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Angkatan:</span>{' '}
          <span className="font-bold text-slate-900">
            {yearFilter === 'ALL' ? 'Semua Angkatan' : `Lulusan ${yearFilter}`}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Total Tercatat:</span>{' '}
          <span className="font-bold text-slate-900">{stats.total} Alumni</span>
        </div>
      </div>

      {/* RINGKASAN STATISTIK DI KERTAS (OPSIONAL) */}
      {showSummaryOnPaper && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-4 text-center text-[10.5px] tabular-nums">
          <div className="border border-slate-300 rounded px-2 py-1.5 bg-slate-50">
            <div className="text-slate-500 font-semibold">Total</div>
            <div className="font-black text-slate-900 text-xs">{stats.total}</div>
          </div>
          <div className="border border-slate-300 rounded px-2 py-1.5 bg-emerald-50/60">
            <div className="text-emerald-800 font-semibold">Bekerja</div>
            <div className="font-black text-emerald-700 text-xs">{stats.bekerja}</div>
          </div>
          <div className="border border-slate-300 rounded px-2 py-1.5 bg-indigo-50/60">
            <div className="text-indigo-800 font-semibold">Kuliah</div>
            <div className="font-black text-indigo-700 text-xs">{stats.kuliah}</div>
          </div>
          <div className="border border-slate-300 rounded px-2 py-1.5 bg-amber-50/60">
            <div className="text-amber-800 font-semibold">Wirausaha</div>
            <div className="font-black text-amber-700 text-xs">{stats.wirausaha}</div>
          </div>
          <div className="border border-slate-300 rounded px-2 py-1.5 bg-rose-50/60">
            <div className="text-rose-800 font-semibold">Pelatihan BKK</div>
            <div className="font-black text-rose-700 text-xs">{stats.mencariKerja}</div>
          </div>
          <div className="border border-slate-300 rounded px-2 py-1.5 bg-slate-100">
            <div className="text-slate-700 font-semibold">Belum Bekerja</div>
            <div className="font-black text-slate-900 text-xs">{stats.belumBekerja}</div>
          </div>
        </div>
      )}

      {/* TABEL DATA RESMI */}
      <table className="paper-table w-full border-collapse border border-slate-400 text-[10.5px] tabular-nums mb-5">
        <thead>
          <tr style={{ backgroundColor: accentHex, color: '#ffffff' }}>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-8 font-bold">No</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left font-bold">Nama Alumni &amp; NISN</th>
            <th className="border border-slate-400 py-1.5 px-1.5 text-center w-10 font-bold">L/P</th>
            <th className="border border-slate-400 py-1.5 px-1.5 text-center w-14 font-bold">Jurusan</th>
            <th className="border border-slate-400 py-1.5 px-1.5 text-center w-14 font-bold">Lulus</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left font-bold">Status Karier</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left font-bold">Instansi / Keterangan</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left font-bold">Jabatan / Prodi &amp; Kota</th>
            <th className="border border-slate-400 py-1.5 px-1.5 text-center w-20 font-bold">Masa Tunggu</th>
          </tr>
        </thead>
        <tbody>
          {filteredTracers.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="border border-slate-400 py-6 px-3 text-center text-slate-500 italic"
              >
                Belum ada data alumni tracer study yang sesuai filter untuk dicetak.
              </td>
            </tr>
          ) : (
            filteredTracers.map((t, idx) => (
              <tr key={t.id} className={idx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                <td className="border border-slate-400 py-1.5 px-2 text-center font-semibold">
                  {idx + 1}
                </td>
                <td className="border border-slate-400 py-1.5 px-2">
                  <div className="font-bold text-slate-900">
                    {t.fullName || '-'}{' '}
                    {t.respondentCategory === 'kelas_12' && (
                      <span className="text-[9px] font-extrabold text-rose-700">
                        ({t.className || 'Kelas 12'})
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-mono">
                    {t.respondentCategory === 'kelas_12' ? 'Rencana XII' : 'Alumni'} &middot; NISN: {t.nisn || '-'}
                  </div>
                </td>
                <td className="border border-slate-400 py-1.5 px-1.5 text-center">{t.gender}</td>
                <td className="border border-slate-400 py-1.5 px-1.5 text-center font-bold">
                  {normalizeTracerMajor(t.majorCode)}
                </td>
                <td className="border border-slate-400 py-1.5 px-1.5 text-center">{t.graduationYear}</td>
                <td className="border border-slate-400 py-1.5 px-2 font-semibold">
                  {getStatusMeta(t.careerStatus).shortLabel}
                </td>
                <td className="border border-slate-400 py-1.5 px-2">
                  {t.institutionOrCompany || '-'}
                </td>
                <td className="border border-slate-400 py-1.5 px-2">
                  <div>{t.roleOrStudyProgram || '-'}</div>
                  <div className="text-[9.5px] text-slate-500">{t.city || '-'}</div>
                </td>
                <td className="border border-slate-400 py-1.5 px-1.5 text-center whitespace-nowrap">
                  {t.waitingPeriod}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* CATATAN KAKI / KETERANGAN */}
      {paperConfig.footerNote && paperConfig.footerNote.trim() && (
        <p className="text-[10.5px] italic text-slate-600 mb-6 leading-relaxed">
          Catatan: {paperConfig.footerNote}
        </p>
      )}

      {/* BLOK TANDA TANGAN & SCAN TTD */}
      {showSignaturesOnPaper && (
        <div className="print-keep-together grid grid-cols-2 gap-8 pt-2 text-[11px] text-slate-900">
          {/* Penandatangan Kiri */}
          <div className="pl-2 sm:pl-6">
            <p>{paperConfig.leftSignerHeader || 'Mengetahui,'}</p>
            <p className="font-semibold">{paperConfig.leftSignerTitle || 'Ketua BKK / Koordinator PKL,'}</p>
            <div className="my-2 flex h-16 items-center justify-start">
              {paperConfig.leftSignerSignatureUrl ? (
                <img
                  src={paperConfig.leftSignerSignatureUrl}
                  alt="Scan TTD Kiri"
                  className="max-h-16 max-w-[150px] object-contain"
                />
              ) : (
                <div className="h-14" />
              )}
            </div>
            <p className="font-bold underline underline-offset-2">
              {paperConfig.leftSignerName || '( ........................................ )'}
            </p>
            <p className="text-[10.5px] text-slate-700">
              NIP. {paperConfig.leftSignerNip || '....................................'}
            </p>
          </div>

          {/* Penandatangan Kanan */}
          <div className="pl-4 sm:pl-16">
            <p>
              {paperConfig.rightSignerCity || 'Cikembar'}, {paperConfig.rightSignerDate}
            </p>
            <p className="font-semibold">{paperConfig.rightSignerTitle || 'Kepala Sekolah,'}</p>
            <div className="my-2 flex h-16 items-center justify-start">
              {paperConfig.rightSignerSignatureUrl ? (
                <img
                  src={paperConfig.rightSignerSignatureUrl}
                  alt="Scan TTD Kepala Sekolah"
                  className="max-h-16 max-w-[150px] object-contain"
                />
              ) : (
                <div className="h-14" />
              )}
            </div>
            <p className="font-bold underline underline-offset-2">
              {paperConfig.rightSignerName || '( ........................................ )'}
            </p>
            <p className="text-[10.5px] text-slate-700">
              NIP. {paperConfig.rightSignerNip || '....................................'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const isGrade12Page = categoryFilter === 'kelas_12';

  return (
    <div className="space-y-5">
      {/* Dynamic Print Page Orientation Rule */}
      <style media="print">{`@page { size: A4 ${paperOrientation}; margin: 12mm; }`}</style>

      {/* Separated Page Switcher: Halaman Alumni vs Halaman Siswa Kelas 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#DDD8F6] bg-gradient-to-r from-[#F7F5FD] via-white to-[#FFF5F8] p-3.5 shadow-2xs dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div>
          <span className="text-[10.5px] font-black uppercase tracking-wider text-[#6C60B8] dark:text-violet-300">
            Pemisahan Halaman Data BKK
          </span>
          <h3 className="text-sm sm:text-base font-black text-[#252042] dark:text-white">
            {isGrade12Page
              ? 'Halaman Perencanaan Siswa Kelas 12'
              : 'Halaman Tracer Study Alumni Lulusan'}
          </h3>
        </div>

        <LiquidNavBar
          size="sm"
          pill
          ariaLabel="Pilih Halaman Alumni atau Siswa Kelas 12"
          activeId={categoryFilter}
          onSelect={id => {
            setCategoryFilter(id as AlumniRespondentCategory);
            setStatusFilter('ALL');
          }}
          items={[
            {
              id: 'alumni',
              label: 'Halaman Alumni',
              icon: <OrbitaMenuIcon variant="grading" className="h-3.5 w-3.5" />,
              badge: totalAlumniInSource,
            },
            {
              id: 'kelas_12',
              label: 'Halaman Siswa Kelas 12',
              icon: <OrbitaMenuIcon variant="students" className="h-3.5 w-3.5" />,
              badge: totalKelas12InSource,
            },
          ]}
        />
      </div>

      {/* Top Mode Switcher + Live DB Sync Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-[#E6E4F2] bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:inline-flex items-center gap-1.5 rounded-[14px] border border-[#E4E1F4] bg-[#F4F3FA] p-1 dark:border-slate-700/80 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setViewMode('directory')}
            className={`no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3.5 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              viewMode === 'directory'
                ? 'bg-[#6C60B8] text-white shadow-xs'
                : 'text-[#5A537A] hover:bg-white hover:text-[#3E385B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
            <span>Direktori &amp; Statistik</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('editable')}
            className={`no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3.5 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              viewMode === 'editable'
                ? 'bg-[#6C60B8] text-white shadow-xs'
                : 'text-[#5A537A] hover:bg-white hover:text-[#3E385B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
          >
            <Table2 className="h-3.5 w-3.5 shrink-0" />
            <span>Laporan Editable</span>
            {isDraftDirty && (
              <span className="ml-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('paper_print')}
            className={`no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] px-3.5 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              viewMode === 'paper_print'
                ? 'bg-[#6C60B8] text-white shadow-xs'
                : 'text-[#5A537A] hover:bg-white hover:text-[#3E385B] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
            }`}
          >
            <ScrollText className="h-3.5 w-3.5 shrink-0" />
            <span>Kertas Laporan &amp; Print</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tabular-nums">
          <span className="no-ornament inline-flex items-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F7F5FD] px-3 py-1.5 text-[#5D51B2] dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-300">
            <span>
              {isGrade12Page ? 'Siswa Kelas 12' : 'Alumni'} ({stats.total}) &middot; DPB ({stats.dpbCount}) &middot; RPL ({stats.rplCount})
            </span>
          </span>
          {syncError ? (
            <span className="no-ornament inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{syncError}</span>
            </span>
          ) : isSyncingDraft || isSavingModal || isSavingTemplate ? (
            <span className="no-ornament inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-indigo-700 dark:border-indigo-800/70 dark:bg-indigo-950/50 dark:text-indigo-300">
              <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span>Menyimpan ke Database...</span>
            </span>
          ) : isDraftDirty ? (
            <span className="no-ornament inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-700 dark:border-amber-800/70 dark:bg-amber-950/50 dark:text-amber-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Draf Belum Disimpan</span>
            </span>
          ) : (
            <span className="no-ornament inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Tersinkron ke Database</span>
            </span>
          )}
        </div>
      </div>

      {/* Top Tracer Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="rounded-2xl border border-[#E6E4F2] bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#6E6A86] dark:text-slate-400">
              {isGrade12Page ? 'Total Siswa Kelas 12 Terdata' : 'Total Alumni Terlacak'}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0EEFA] text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#252042] dark:text-white leading-none">
            {stats.total}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-[#139A4C] dark:text-emerald-400">
            {stats.verified} terverifikasi BKK Sekolah
          </p>
        </div>

        <div className="rounded-2xl border border-[#CBEFE0] bg-gradient-to-br from-[#ECFBF3] to-white p-4 shadow-2xs dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-slate-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#184B34] dark:text-emerald-300">Terserap Dunia Kerja</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1CC865]/15 text-[#139A4C] dark:text-emerald-400">
              <Briefcase className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#139A4C] dark:text-emerald-400 leading-none">
            {stats.bekerjaPct}%
          </p>
          <p className="mt-2 text-[11px] font-semibold text-[#2E6F50] dark:text-emerald-300/80">
            {stats.bekerja} alumni bekerja di industri DUDI
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2DDF6] bg-gradient-to-br from-[#F4F2FC] to-white p-4 shadow-2xs dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-slate-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#4B4188] dark:text-indigo-300">Kuliah &amp; Wirausaha</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C60B8]/15 text-[#6C60B8] dark:text-indigo-300">
              <Rocket className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#6C60B8] dark:text-indigo-400 leading-none">
            {stats.kuliahWirausahaPct}%
          </p>
          <p className="mt-2 text-[11px] font-semibold text-[#645A9E] dark:text-indigo-300/80">
            {stats.kuliah} kuliah &middot; {stats.wirausaha} wirausaha
          </p>
        </div>

        <div className="rounded-2xl border border-[#F5DFB8] bg-gradient-to-br from-[#FFF9EE] to-white p-4 shadow-2xs dark:border-amber-900/50 dark:from-amber-950/30 dark:to-slate-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#6E4F16] dark:text-amber-300">
              Belum Bekerja &amp; Masa Tunggu
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
            {stats.belumBekerja}{' '}
            <span className="text-sm font-bold text-[#8A6728] dark:text-amber-300/90">
              ({stats.belumBekerjaPct}%)
            </span>
          </p>
          <p className="mt-2 text-[11px] font-semibold text-[#8A6728] dark:text-amber-300/80">
            Relevansi {stats.relevantPct}% &middot; {stats.fastPlacedPct}% &lt; 3 bln
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid (Shown in Directory Mode) */}
      {viewMode === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Career Status Breakdown */}
          <div className="lg:col-span-6 rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <HighlightedChartHeader
              title="Distribusi Status Karier Alumni (BMW & Belum Bekerja)"
              subtitle="Klik salah satu kategori status untuk memfilter direktori alumni di bawah"
              accent="purple"
              rightSlot={
                <span className="no-ornament rounded-xl bg-[#E7F9EF] border border-[#BCEAD1] px-2.5 py-1 text-[11px] font-black text-[#139A4C] dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300 tabular-nums whitespace-nowrap">
                  Serapan BMW: {stats.bmwAbsorbedPct}%
                </span>
              }
            />

            <div className="space-y-2.5 tabular-nums">
              {stats.statusRows.map(row => {
                const meta = getStatusMeta(row.key);
                const Icon = meta.icon;
                const isSelected = statusFilter === row.key;
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => setStatusFilter(prev => (prev === row.key ? 'ALL' : row.key))}
                    className={`no-ornament w-full text-left rounded-2xl border p-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#6C60B8] bg-[#F4F2FC] shadow-2xs dark:border-violet-500 dark:bg-indigo-950/40'
                        : 'border-[#EFEFF7] bg-[#FAF9FE] hover:border-[#D4CEEF] dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <span className="flex items-center gap-2 font-extrabold text-[#2E294E] dark:text-slate-100 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${meta.textClass}`} />
                        <span className="truncate">{meta.label}</span>
                      </span>
                      <span className={`font-black whitespace-nowrap shrink-0 ${meta.textClass}`}>
                        {row.pct}%{' '}
                        <span className="text-[10.5px] font-semibold text-[#7A7596] dark:text-slate-400">
                          ({row.count} alumni)
                        </span>
                      </span>
                    </div>
                    <div className="jrpg-stat-bar">
                      <div
                        className={`jrpg-stat-bar-fill ${meta.barClass}`}
                        style={{ width: `${row.count > 0 ? Math.max(6, row.pct) : 0}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Industry Relevance & Waiting Period */}
          <div className="lg:col-span-6 rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div>
              <HighlightedChartHeader
                title="Relevansi Kompetensi DPB/RPL & Waktu Tunggu"
                subtitle="Evaluasi kesesuaian bidang kerja/kuliah terhadap kompetensi keahlian DPB & RPL"
                accent="emerald"
              />

              <div className="space-y-3 tabular-nums">
                {stats.relevanceRows.map(r => {
                  const info = RELEVANCE_LABEL[r.key];
                  return (
                    <div key={r.key} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[#3E385B] dark:text-slate-200">{info.label}</span>
                        <span className={`font-black whitespace-nowrap ${info.colorClass}`}>
                          {r.pct}%{' '}
                          <span className="text-[10.5px] font-semibold text-[#8E8BA3] dark:text-slate-400">
                            ({r.count})
                          </span>
                        </span>
                      </div>
                      <div className="jrpg-stat-bar">
                        <div
                          className={`jrpg-stat-bar-fill ${info.barClass}`}
                          style={{ width: `${r.count > 0 ? Math.max(5, r.pct) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Waiting Period Strip */}
            <div className="rounded-2xl border border-[#ECEAF6] bg-[#FAF9FE] p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#6C60B8] dark:text-violet-300">
                  Distribusi Waktu Tunggu Lulusan
                </span>
                <span className="text-[11px] font-bold text-[#7A7596] dark:text-slate-400">
                  Total {stats.total} alumni
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 tabular-nums">
                {stats.waitingRows.map(w => (
                  <div
                    key={w.label}
                    className="rounded-xl border border-[#E6E4F2] bg-white px-2.5 py-2 text-center dark:border-slate-700 dark:bg-slate-900"
                  >
                    <span className="block text-[10px] font-bold text-[#7A7596] dark:text-slate-400">
                      {w.label}
                    </span>
                    <span className="block text-sm font-black text-[#262341] dark:text-white mt-0.5">
                      {w.count}
                    </span>
                    <span className="block text-[10px] font-semibold text-[#6C60B8] dark:text-violet-300">
                      {w.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean 2-Tier Filter & Actions Bar with Accordion Expand-All */}
      <div className="rounded-2xl border border-[#E6E4F2] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <AccordionExpandAllBar
          title="Filter Pencarian & Dropdown Tracer Study"
          allExpanded={tracerAccordion.allExpanded}
          onExpandAll={tracerAccordion.expandAll}
          onCollapseAll={tracerAccordion.collapseAll}
        />

        <AccordionSection
          title="Filter Angkatan, Jurusan & Status Karier"
          subtitle={`${filteredTracers.length} data ditampilkan`}
          icon={<Filter className="h-3.5 w-3.5" />}
          open={tracerAccordion.isOpen('tracer_filters')}
          onToggle={() => tracerAccordion.toggle('tracer_filters')}
        >
          {/* Tier 1: Responsive Search & Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
            <div className="relative sm:col-span-2 lg:col-span-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8BA3]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  isGrade12Page
                    ? 'Cari nama siswa XII, NISN, kelas, atau target...'
                    : 'Cari nama alumni, NISN, instansi, atau kota...'
                }
                className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] pl-9 pr-3 text-xs font-medium text-[#262341] placeholder:text-[#9694A8] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="relative flex items-center">
                <Filter className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#8E8BA3]" />
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] pl-8 pr-2.5 text-xs font-bold text-[#3E385B] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {graduationYears.map(yr => (
                    <option key={yr} value={yr}>
                      {yr === 'ALL' ? 'Semua Angkatan' : `Lulusan ${yr}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-2">
              <select
                value={majorFilter}
                onChange={e => setMajorFilter(e.target.value)}
                className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs font-bold text-[#3E385B] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Jurusan</option>
                {TRACER_MAJORS.map(mj => (
                  <option key={mj} value={mj}>
                    Jurusan {mj}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as AlumniCareerStatus | 'ALL')}
                className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs font-bold text-[#3E385B] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Status Karier</option>
                <option value="bekerja">Bekerja di Industri</option>
                <option value="kuliah">Melanjutkan Kuliah</option>
                <option value="wirausaha">Berwirausaha Mandiri</option>
                <option value="mencari_kerja">Pelatihan / Penyaluran BKK</option>
                <option value="belum_bekerja">Belum Bekerja</option>
              </select>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setYearFilter('ALL');
                    setMajorFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  title="Reset semua filter"
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#FFE8EF] px-3 text-xs font-bold text-[#D9436D] hover:bg-[#FFD6E3] dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/70 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </AccordionSection>

        {/* Tier 2: Aligned Primary Workflow & Export Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#ECEAF6] dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'editable' ? (
              <>
                <button
                  type="button"
                  onClick={handleAddEditableRow}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] px-3.5 text-xs font-extrabold text-[#6C60B8] hover:bg-[#EAE7F8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-900/60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Tambah Baris</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncEditableDraftToDb}
                  disabled={isSyncingDraft}
                  data-sending={isLaunchingSyncPlane ? 'true' : 'false'}
                  className="no-ornament orbita-paper-plane-btn inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-extrabold text-white shadow-xs hover:bg-[#5B4FA8] disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <Send className="h-3.5 w-3.5 shrink-0 orbita-paper-plane-icon" />
                  <span>{isSyncingDraft ? 'Menyinkronkan...' : 'Simpan & Sinkronkan Database'}</span>
                </button>
                {isDraftDirty && (
                  <button
                    type="button"
                    onClick={handleResetEditableDraft}
                    className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-800/70 dark:bg-amber-950/50 dark:text-amber-300 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span>Reset Draf</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-extrabold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>{isGrade12Page ? 'Catat Rencana Kelas 12' : 'Catat Tracer Alumni'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewMode !== 'paper_print' && (
              <button
                type="button"
                onClick={() => setViewMode('paper_print')}
                className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] px-3.5 text-xs font-extrabold text-[#5D51B2] hover:bg-[#EAE7F8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-900/60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <ScrollText className="h-3.5 w-3.5 shrink-0" />
                <span>Tampilkan ke Kertas &amp; Print</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#BCEBD0] bg-[#E7F9EF] px-3 text-xs font-bold text-[#139A4C] hover:bg-[#D5F4E3] dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E2DFEF] bg-white px-3 text-xs font-bold text-[#3E385B] hover:bg-[#FAF9FE] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] px-3 text-xs font-bold text-[#6C60B8] hover:bg-[#EAE7F8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-900/60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span>Cetak PDF</span>
            </button>

            {onClearAllTracers && tracers.length > 0 && viewMode === 'directory' && (
              <button
                type="button"
                onClick={() =>
                  onConfirmDelete({
                    title: 'Kosongkan Data Alumni Tracer Study',
                    itemName: `${tracers.length} Data Alumni Tracer Study`,
                    description:
                      'Seluruh catatan penelusuran alumni di menu Tracer Study akan dihapus permanen dari perangkat dan Database Cloud. Lanjutkan?',
                    onConfirm: async () => {
                      try {
                        await Promise.resolve(onClearAllTracers());
                        setIsDraftDirty(false);
                        setSyncError(null);
                        onToast('Seluruh data alumni pada menu Tracer Study berhasil dikosongkan dari Database.');
                      } catch {
                        setSyncError('Gagal mengosongkan data di Database.');
                        onToast('Gagal mengosongkan data Tracer Study di Database Cloud.');
                      }
                    },
                  })
                }
                className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#FFC4D4] bg-[#FFE8EF] px-3 text-xs font-bold text-[#E14A74] hover:bg-[#FFD6E3] dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Kosongkan Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: DIRECTORY LIST / TABLE */}
      {viewMode === 'directory' && (
        <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <HighlightedChartHeader
            title={
              isGrade12Page
                ? 'Direktori Perencanaan Pasca Lulus (Siswa Kelas 12)'
                : 'Direktori Jejak Karier & Tracer Study Alumni'
            }
            subtitle={
              isGrade12Page
                ? 'Pemetaan rencana kerja, kuliah, wirausaha & kebutuhan bimbingan BKK siswa Kelas XII DPB & RPL'
                : 'Riwayat penempatan kerja, kuliah, wirausaha, dan status belum bekerja jurusan DPB & RPL'
            }
            accent="purple"
            rightSlot={
              <span className="no-ornament rounded-xl bg-[#F0EEFA] border border-[#DDD8F6] px-3 py-1 text-xs font-black text-[#6C60B8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 tabular-nums whitespace-nowrap">
                {filteredTracers.length} {isGrade12Page ? 'Siswa XII' : 'Alumni'} Ditampilkan
              </span>
            }
          />

          {filteredTracers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DFDCF2] bg-[#FAF9FE] p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <GraduationCap className="mx-auto h-10 w-10 text-[#6C60B8]/70 dark:text-violet-400" />
              <h4 className="mt-3 text-sm font-extrabold text-[#262341] dark:text-white">
                {isGrade12Page
                  ? 'Belum Ada Catatan Perencanaan Siswa Kelas 12 pada Filter Ini'
                  : tracers.length === 0
                  ? 'Data Alumni Tracer Study Masih Kosong'
                  : 'Tidak Ada Catatan Tracer Study Alumni yang Sesuai Filter'}
              </h4>
              <p className="mt-1 text-xs text-[#7A7596] dark:text-slate-400 max-w-md mx-auto">
                {isGrade12Page
                  ? 'Klik Catat Rencana Kelas 12 atau siswa Kelas XII dapat mengisi langsung melalui Halaman Siswa Kelas 12.'
                  : tracers.length === 0
                  ? 'Database tracer study alumni saat ini bersih (0 catatan). Klik Catat Tracer Alumni atau beralih ke Laporan Editable untuk mengisi banyak baris sekaligus.'
                  : 'Ubah kata kunci pencarian dan filter angkatan/jurusan di atas, atau catat jejak alumni baru.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-bold text-white hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>{isGrade12Page ? 'Tambah Rencana Kelas 12' : 'Tambah Jejak Alumni Baru'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('editable');
                    if (draftRows.length === 0) handleAddEditableRow();
                  }}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] px-4 text-xs font-bold text-[#6C60B8] hover:bg-[#EAE7F8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Table2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Buka Laporan Editable</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table (Carousel Paginated) */}
              <div key={`dir-tbl-${tracerPagination.animKey}`} className={`hidden lg:block overflow-x-auto rounded-2xl border border-[#ECEBF5] dark:border-slate-800 ${tracerPagination.slideClass}`}>
                <table className="w-full text-left text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-[#ECEBF5] bg-[#FAF9FE] text-[#3E385B] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-extrabold">
                      <th className="py-3 px-3 w-10 text-center">No</th>
                      <th className="py-3 px-3">Alumni &amp; Angkatan</th>
                      <th className="py-3 px-3">Status Karier</th>
                      <th className="py-3 px-3">Instansi / Kampus / Keterangan</th>
                      <th className="py-3 px-3">Relevansi &amp; Tunggu</th>
                      <th className="py-3 px-3">Rekam Mitra PKL</th>
                      <th className="py-3 px-3 text-center">Verifikasi</th>
                      <th className="py-3 px-3 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EFF8] dark:divide-slate-800">
                    {tracerPagination.paginatedItems.map((t, idx) => {
                      const meta = getStatusMeta(t.careerStatus);
                      const rel = RELEVANCE_LABEL[t.industryRelevance] || RELEVANCE_LABEL.sesuai;
                      const majorDisplay = normalizeTracerMajor(t.majorCode);
                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-[#FAF9FE]/70 dark:hover:bg-slate-800/40 align-top ${
                            deletingRowId === t.id ? 'animate-genie-bin-exit' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center text-[#8E8BA3] font-bold">
                            {tracerPagination.startIndex + idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-[#252042] dark:text-white">
                                {t.fullName}
                              </span>
                              <span
                                className={`no-ornament rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold ${
                                  t.respondentCategory === 'kelas_12'
                                    ? 'bg-[#FFE8EF] text-[#D9436D] dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-[#F0EEFA] text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300'
                                }`}
                              >
                                {t.respondentCategory === 'kelas_12'
                                  ? `Kelas 12${t.className ? ` · ${t.className}` : ''}`
                                  : 'Alumni'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#7A7596] dark:text-slate-400 mt-0.5">
                              NISN {t.nisn} &middot; {majorDisplay} &middot;{' '}
                              {t.respondentCategory === 'kelas_12'
                                ? `Est. Lulus ${t.graduationYear}`
                                : `Lulus ${t.graduationYear}`}
                            </div>
                            {(t.phone || t.email) && (
                              <div className="text-[10.5px] text-[#6C60B8] dark:text-violet-300 mt-0.5 flex flex-wrap gap-2">
                                {t.phone && <span>{t.phone}</span>}
                                {t.email && <span className="truncate max-w-[170px]">{t.email}</span>}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`no-ornament inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold ${meta.badgeClass}`}
                            >
                              {meta.shortLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="font-bold text-[#2E294E] dark:text-slate-100">
                              {t.institutionOrCompany || '-'}
                            </div>
                            <div className="text-[11px] text-[#6E6A86] dark:text-slate-400 mt-0.5">
                              {t.roleOrStudyProgram || '-'} &middot; {t.city || '-'}
                            </div>
                            {t.bkkSupportNeed && (
                              <div className="text-[10.5px] font-semibold text-[#D9436D] dark:text-rose-300 mt-0.5">
                                Bimbingan BKK: {t.bkkSupportNeed}
                              </div>
                            )}
                            {t.monthlyIncomeRange && t.monthlyIncomeRange !== '-' && (
                              <div className="text-[10.5px] font-semibold text-[#139A4C] dark:text-emerald-400 mt-0.5">
                                {t.monthlyIncomeRange}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className={`text-[11px] font-extrabold ${rel.colorClass}`}>{rel.label}</div>
                            <div className="text-[10.5px] text-[#7A7596] dark:text-slate-400 mt-0.5">
                              Masa tunggu: {t.waitingPeriod}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-[180px]">
                            <span className="text-[11px] font-medium text-[#555070] dark:text-slate-300">
                              {t.pklPartnerName || 'Mandiri / Non-Mitra'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await Promise.resolve(
                                    onSaveTracer({
                                      ...t,
                                      majorCode: majorDisplay,
                                      verifiedBySchool: !t.verifiedBySchool,
                                      updatedAt: new Date().toISOString().split('T')[0],
                                    })
                                  );
                                  setSyncError(null);
                                  onToast(
                                    !t.verifiedBySchool
                                      ? `Data alumni ${t.fullName} ditandai Terverifikasi BKK.`
                                      : `Status verifikasi ${t.fullName} dikembalikan ke Menunggu Review.`
                                  );
                                } catch {
                                  setSyncError('Gagal memperbarui verifikasi ke Database.');
                                  onToast('Gagal menyimpan status verifikasi ke Database Cloud.');
                                }
                              }}
                              className={`no-ornament inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold cursor-pointer transition-colors ${
                                t.verifiedBySchool
                                  ? 'bg-[#E7F9EF] text-[#139A4C] hover:bg-[#D5F4E3] dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                              title="Klik untuk mengubah status verifikasi sekolah/BKK"
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              <span>{t.verifiedBySchool ? 'Terverifikasi' : 'Review'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(t)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-violet-300 cursor-pointer"
                                title="Edit Data Tracer Alumni"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onConfirmDelete({
                                    title: 'Hapus Catatan Tracer Study Alumni',
                                    itemName: t.fullName,
                                    description: `Hapus jejak alumni ${t.fullName} (${t.institutionOrCompany || '-'}) dari database Tracer Study?`,
                                    onConfirm: async () => {
                                      setDeletingRowId(t.id);
                                      await new Promise(r => setTimeout(r, 420));
                                      try {
                                        await Promise.resolve(onDeleteTracer(t.id));
                                        setSyncError(null);
                                        onToast(`Catatan alumni ${t.fullName} berhasil dihapus dari Database Cloud.`);
                                      } catch {
                                        setSyncError('Gagal menghapus data dari Database.');
                                        onToast(`Gagal menghapus catatan ${t.fullName} di Database Cloud.`);
                                      } finally {
                                        setDeletingRowId(null);
                                      }
                                    },
                                  })
                                }
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 cursor-pointer"
                                title="Hapus Data Alumni"
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

              {/* Mobile & Tablet Cards */}
              <div key={`dir-mob-${tracerPagination.animKey}`} className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden ${tracerPagination.slideClass}`}>
                {tracerPagination.paginatedItems.map(t => {
                  const meta = getStatusMeta(t.careerStatus);
                  const rel = RELEVANCE_LABEL[t.industryRelevance] || RELEVANCE_LABEL.sesuai;
                  const majorDisplay = normalizeTracerMajor(t.majorCode);
                  return (
                    <div
                      key={t.id}
                      className={`rounded-2xl border border-[#ECEAF6] bg-[#FAF9FE] p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40 ${
                        deletingRowId === t.id ? 'animate-genie-bin-exit' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-[#252042] dark:text-white truncate">
                              {t.fullName}
                            </h4>
                            <span
                              className={`no-ornament rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold shrink-0 ${
                                t.respondentCategory === 'kelas_12'
                                  ? 'bg-[#FFE8EF] text-[#D9436D] dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-[#F0EEFA] text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300'
                              }`}
                            >
                              {t.respondentCategory === 'kelas_12' ? 'Kelas 12' : 'Alumni'}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-[#7A7596] dark:text-slate-400">
                            NISN {t.nisn} &middot; {majorDisplay} &middot;{' '}
                            {t.className ? `${t.className} · ` : ''}Lulus {t.graduationYear}
                          </p>
                        </div>
                        <span
                          className={`no-ornament rounded-lg px-2.5 py-1 text-[10px] font-extrabold whitespace-nowrap shrink-0 ${meta.badgeClass}`}
                        >
                          {meta.shortLabel}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[#E6E4F2] bg-white p-3 dark:border-slate-700 dark:bg-slate-900 space-y-1 text-xs">
                        <div className="font-bold text-[#2E294E] dark:text-white flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#6C60B8] dark:text-violet-300 shrink-0" />
                          <span className="truncate">{t.institutionOrCompany || '-'}</span>
                        </div>
                        <p className="text-[11px] text-[#6E6A86] dark:text-slate-300">
                          {t.roleOrStudyProgram || '-'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#7A7596] dark:text-slate-400 pt-1">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {t.city || '-'}
                          </span>
                          <span className={`font-bold ${rel.colorClass}`}>{rel.label}</span>
                          <span>Tunggu: {t.waitingPeriod}</span>
                        </div>
                      </div>

                      {t.testimonial && (
                        <p className="text-[11px] italic text-[#555070] dark:text-slate-300 flex items-start gap-1.5">
                          <Quote className="h-3.5 w-3.5 text-[#6C60B8] dark:text-violet-300 shrink-0 mt-0.5" />
                          <span>"{t.testimonial}"</span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6E4F2] dark:border-slate-700">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await Promise.resolve(
                                onSaveTracer({
                                  ...t,
                                  majorCode: majorDisplay,
                                  verifiedBySchool: !t.verifiedBySchool,
                                  updatedAt: new Date().toISOString().split('T')[0],
                                })
                              );
                              setSyncError(null);
                              onToast(`Status verifikasi ${t.fullName} diperbarui di Database.`);
                            } catch {
                              setSyncError('Gagal memperbarui verifikasi ke Database.');
                              onToast('Gagal menyimpan status verifikasi ke Database Cloud.');
                            }
                          }}
                          className={`no-ornament inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold cursor-pointer ${
                            t.verifiedBySchool
                              ? 'bg-[#E7F9EF] text-[#139A4C] dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>{t.verifiedBySchool ? 'Terverifikasi BKK' : 'Verifikasi Sekarang'}</span>
                        </button>

                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(t)}
                            className="no-ornament inline-flex h-8 items-center gap-1 rounded-lg border border-[#DDD8F6] bg-white px-2.5 text-[11px] font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Edit className="h-3 w-3 shrink-0" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onConfirmDelete({
                                title: 'Hapus Catatan Tracer Study Alumni',
                                itemName: t.fullName,
                                description: `Hapus jejak alumni ${t.fullName} dari database Tracer Study?`,
                                onConfirm: async () => {
                                  setDeletingRowId(t.id);
                                  await new Promise(r => setTimeout(r, 420));
                                  try {
                                    await Promise.resolve(onDeleteTracer(t.id));
                                    setSyncError(null);
                                    onToast(`Catatan alumni ${t.fullName} dihapus dari Database.`);
                                  } catch {
                                    setSyncError('Gagal menghapus data dari Database.');
                                    onToast(`Gagal menghapus catatan ${t.fullName} di Database Cloud.`);
                                  } finally {
                                    setDeletingRowId(null);
                                  }
                                },
                              })
                            }
                            className="no-ornament inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <CarouselTablePagination
                page={tracerPagination.page}
                totalPages={tracerPagination.totalPages}
                totalItems={tracerPagination.totalItems}
                pageSize={tracerPagination.pageSize}
                startIndex={tracerPagination.startIndex}
                endIndex={tracerPagination.endIndex}
                slideDirection={tracerPagination.slideDirection}
                onPageChange={tracerPagination.setPage}
                onPageSizeChange={tracerPagination.setPageSize}
                itemLabel={isGrade12Page ? 'siswa XII' : 'alumni'}
              />
            </>
          )}
        </div>
      )}

      {/* VIEW 2: LAPORAN EDITABLE (ZERO-TRUNCATION COMPACT SPREADSHEET + SYNC DATABASE) */}
      {viewMode === 'editable' && (
        <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <HighlightedChartHeader
            title="Laporan Editable Tracer Study & Penyerapan Alumni (DPB & RPL)"
            subtitle="Ubah data alumni secara langsung di tabel/kartu lalu tekan Simpan & Sinkronkan Database agar tersimpan ke Cloud Firestore"
            accent="emerald"
            rightSlot={
              <span className="no-ornament rounded-xl bg-[#F0EEFA] border border-[#DDD8F6] px-3 py-1 text-xs font-black text-[#6C60B8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 tabular-nums whitespace-nowrap">
                {filteredTracers.length} Baris Draf
              </span>
            }
          />

          {filteredTracers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DFDCF2] bg-[#FAF9FE] p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <Table2 className="mx-auto h-10 w-10 text-[#6C60B8]/70 dark:text-violet-400" />
              <h4 className="mt-3 text-sm font-extrabold text-[#262341] dark:text-white">
                {draftRows.length === 0
                  ? 'Laporan Editable Belum Memiliki Baris Data'
                  : 'Tidak Ada Baris Laporan yang Sesuai Filter'}
              </h4>
              <p className="mt-1 text-xs text-[#7A7596] dark:text-slate-400 max-w-md mx-auto">
                Klik tombol Tambah Baris untuk mulai menginput laporan tracer study alumni jurusan DPB &amp; RPL secara langsung.
              </p>
              <button
                type="button"
                onClick={handleAddEditableRow}
                className="no-ornament mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-bold text-white hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>Tambah Baris Laporan Pertama</span>
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Compact 7-Column Spreadsheet (Carousel Paginated) */}
              <div key={`edit-tbl-${tracerPagination.animKey}`} className={`hidden lg:block overflow-x-auto rounded-2xl border border-[#ECEBF5] dark:border-slate-800 ${tracerPagination.slideClass}`}>
                <table className="w-full text-left text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-[#ECEBF5] bg-[#FAF9FE] text-[#3E385B] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-extrabold">
                      <th className="py-3 px-2.5 w-10 text-center">No</th>
                      <th className="py-3 px-2.5 min-w-[195px]">Nama Alumni &amp; NISN *</th>
                      <th className="py-3 px-2.5 w-[158px]">Jurusan, L/P &amp; Lulus</th>
                      <th className="py-3 px-2.5 min-w-[205px]">Status Karier &amp; Instansi</th>
                      <th className="py-3 px-2.5 min-w-[205px]">Jabatan / Prodi, Kota &amp; Mitra</th>
                      <th className="py-3 px-2.5 w-[172px]">Relevansi, Tunggu &amp; BKK</th>
                      <th className="py-3 px-2 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EFF8] dark:divide-slate-800">
                    {tracerPagination.paginatedItems.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-[#FAF9FE]/60 dark:hover:bg-slate-800/30 align-top ${
                          deletingRowId === row.id ? 'animate-genie-bin-exit' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2.5 text-center font-bold text-[#8E8BA3] pt-4">
                          {tracerPagination.startIndex + idx + 1}
                        </td>

                        {/* Nama & NISN */}
                        <td className="py-2.5 px-2.5 space-y-1.5">
                          <input
                            type="text"
                            value={row.fullName}
                            onChange={e => handleUpdateDraftCell(row.id, 'fullName', e.target.value)}
                            placeholder="Nama lengkap alumni *"
                            className="no-ornament h-8 w-full rounded-lg border border-[#DCD8EE] bg-white px-2.5 text-xs font-bold text-[#252042] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <input
                            type="text"
                            value={row.nisn}
                            onChange={e => handleUpdateDraftCell(row.id, 'nisn', e.target.value)}
                            placeholder="NISN"
                            className="no-ornament h-7 w-full rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-2.5 text-[11px] font-mono text-[#555070] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          />
                        </td>

                        {/* Jurusan, Gender, Tahun Lulus (Paired neatly so RPL/L/2026 never clip!) */}
                        <td className="py-2.5 px-2.5 space-y-1.5">
                          <select
                            value={normalizeTracerMajor(row.majorCode)}
                            onChange={e => handleUpdateDraftCell(row.id, 'majorCode', e.target.value)}
                            className="no-ornament h-8 w-full rounded-lg border border-[#DCD8EE] bg-white px-2.5 text-xs font-extrabold text-[#6C60B8] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300 cursor-pointer"
                          >
                            {TRACER_MAJORS.map(m => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <div className="grid grid-cols-2 gap-1.5">
                            <select
                              value={row.gender}
                              onChange={e =>
                                handleUpdateDraftCell(row.id, 'gender', e.target.value as 'L' | 'P')
                              }
                              className="no-ornament h-7 w-full rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-1.5 text-[11px] font-bold text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
                            >
                              <option value="L">L</option>
                              <option value="P">P</option>
                            </select>
                            <input
                              type="text"
                              value={row.graduationYear}
                              onChange={e =>
                                handleUpdateDraftCell(row.id, 'graduationYear', e.target.value)
                              }
                              placeholder="2026"
                              className="no-ornament h-7 w-full rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-1.5 text-center text-[11px] font-bold text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                          </div>
                        </td>

                        {/* Status Karier & Instansi */}
                        <td className="py-2.5 px-2.5 space-y-1.5">
                          <select
                            value={row.careerStatus}
                            onChange={e =>
                              handleUpdateDraftCell(
                                row.id,
                                'careerStatus',
                                e.target.value as AlumniCareerStatus
                              )
                            }
                            className="no-ornament h-8 w-full rounded-lg border border-[#DCD8EE] bg-white px-2 text-xs font-bold text-[#3E385B] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
                          >
                            <option value="bekerja">Bekerja (DUDI)</option>
                            <option value="kuliah">Lanjut Kuliah</option>
                            <option value="wirausaha">Wirausaha</option>
                            <option value="mencari_kerja">Pelatihan / BKK</option>
                            <option value="belum_bekerja">Belum Bekerja</option>
                          </select>
                          <input
                            type="text"
                            value={row.institutionOrCompany}
                            onChange={e =>
                              handleUpdateDraftCell(row.id, 'institutionOrCompany', e.target.value)
                            }
                            placeholder={
                              row.careerStatus === 'belum_bekerja'
                                ? 'Keterangan / -'
                                : 'Perusahaan / Kampus'
                            }
                            className="no-ornament h-7 w-full rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-2.5 text-[11px] font-semibold text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </td>

                        {/* Jabatan/Prodi, Kota & Mitra PKL */}
                        <td className="py-2.5 px-2.5 space-y-1.5">
                          <input
                            type="text"
                            value={row.roleOrStudyProgram}
                            onChange={e =>
                              handleUpdateDraftCell(row.id, 'roleOrStudyProgram', e.target.value)
                            }
                            placeholder="Jabatan / Prodi"
                            className="no-ornament h-8 w-full rounded-lg border border-[#DCD8EE] bg-white px-2.5 text-xs text-[#252042] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={row.city}
                              onChange={e => handleUpdateDraftCell(row.id, 'city', e.target.value)}
                              placeholder="Kota"
                              className="no-ornament h-7 w-full rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-2 text-[11px] text-[#555070] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            />
                            <select
                              value={row.pklPartnerId || ''}
                              onChange={e => {
                                const chosen = partners.find(p => p.id === e.target.value);
                                setDraftRows(prev =>
                                  prev.map(r =>
                                    r.id === row.id
                                      ? {
                                          ...r,
                                          pklPartnerId: e.target.value || undefined,
                                          pklPartnerName: chosen?.name || undefined,
                                        }
                                      : r
                                  )
                                );
                                setIsDraftDirty(true);
                              }}
                              className="no-ornament h-7 w-full rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-1.5 text-[11px] font-medium text-[#555070] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
                            >
                              <option value="">Mitra: Mandiri</option>
                              {partners.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Relevansi, Masa Tunggu & BKK */}
                        <td className="py-2.5 px-2.5 space-y-1.5">
                          <select
                            value={row.industryRelevance}
                            onChange={e =>
                              handleUpdateDraftCell(
                                row.id,
                                'industryRelevance',
                                e.target.value as AlumniRelevanceLevel
                              )
                            }
                            className="no-ornament h-8 w-full rounded-lg border border-[#DCD8EE] bg-white px-2 text-[11px] font-bold text-[#3E385B] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="sangat_sesuai">Sangat Sesuai</option>
                            <option value="sesuai">Sesuai</option>
                            <option value="cukup_sesuai">Cukup Sesuai</option>
                            <option value="tidak_sesuai">Lintas Bidang</option>
                          </select>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={row.waitingPeriod}
                              onChange={e =>
                                handleUpdateDraftCell(
                                  row.id,
                                  'waitingPeriod',
                                  e.target.value as AlumniWaitingPeriod
                                )
                              }
                              className="no-ornament h-7 flex-1 min-w-0 rounded-lg border border-[#ECEAF6] bg-[#FAF9FE] px-1.5 text-[10.5px] font-semibold text-[#555070] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
                            >
                              {WAITING_PERIODS.map(wp => (
                                <option key={wp} value={wp}>
                                  {wp}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateDraftCell(row.id, 'verifiedBySchool', !row.verifiedBySchool)
                              }
                              className={`no-ornament inline-flex h-7 items-center justify-center rounded-lg px-2 text-[10px] font-extrabold cursor-pointer whitespace-nowrap shrink-0 ${
                                row.verifiedBySchool
                                  ? 'bg-[#E7F9EF] text-[#139A4C] dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                              title="Toggle verifikasi BKK"
                            >
                              {row.verifiedBySchool ? 'Sah' : 'Rev'}
                            </button>
                          </div>
                        </td>

                        {/* Delete */}
                        <td className="py-2.5 px-2 text-center pt-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteEditableRow(row.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                            title="Hapus baris dari draf laporan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Editable Cards */}
              <div key={`edit-mob-${tracerPagination.animKey}`} className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden ${tracerPagination.slideClass}`}>
                {tracerPagination.paginatedItems.map((row, idx) => (
                  <div
                    key={row.id}
                    className={`rounded-2xl border border-[#ECEAF6] bg-[#FAF9FE] p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs ${
                      deletingRowId === row.id ? 'animate-genie-bin-exit' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#E6E4F2] pb-2 dark:border-slate-700">
                      <span className="font-black text-[#6C60B8] dark:text-violet-300">
                        Baris #{tracerPagination.startIndex + idx + 1} &middot; {normalizeTracerMajor(row.majorCode)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateDraftCell(row.id, 'verifiedBySchool', !row.verifiedBySchool)
                          }
                          className={`no-ornament rounded-lg px-2 py-1 text-[10px] font-extrabold cursor-pointer ${
                            row.verifiedBySchool
                              ? 'bg-[#E7F9EF] text-[#139A4C] dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {row.verifiedBySchool ? 'Terverifikasi' : 'Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEditableRow(row.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300 cursor-pointer"
                          title="Hapus Baris"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                          Nama Alumni *
                        </label>
                        <input
                          type="text"
                          value={row.fullName}
                          onChange={e => handleUpdateDraftCell(row.id, 'fullName', e.target.value)}
                          placeholder="Nama lengkap alumni"
                          className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs font-bold text-[#252042] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                          NISN
                        </label>
                        <input
                          type="text"
                          value={row.nisn}
                          onChange={e => handleUpdateDraftCell(row.id, 'nisn', e.target.value)}
                          className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                            L/P
                          </label>
                          <select
                            value={row.gender}
                            onChange={e =>
                              handleUpdateDraftCell(row.id, 'gender', e.target.value as 'L' | 'P')
                            }
                            className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="L">L</option>
                            <option value="P">P</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                            Jurusan
                          </label>
                          <select
                            value={normalizeTracerMajor(row.majorCode)}
                            onChange={e => handleUpdateDraftCell(row.id, 'majorCode', e.target.value)}
                            className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-1.5 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-900 dark:text-violet-300"
                          >
                            {TRACER_MAJORS.map(m => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                            Lulus
                          </label>
                          <input
                            type="text"
                            value={row.graduationYear}
                            onChange={e =>
                              handleUpdateDraftCell(row.id, 'graduationYear', e.target.value)
                            }
                            className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-1.5 text-center text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                          Status Karier
                        </label>
                        <select
                          value={row.careerStatus}
                          onChange={e =>
                            handleUpdateDraftCell(
                              row.id,
                              'careerStatus',
                              e.target.value as AlumniCareerStatus
                            )
                          }
                          className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="bekerja">Bekerja (DUDI)</option>
                          <option value="kuliah">Lanjut Kuliah</option>
                          <option value="wirausaha">Wirausaha</option>
                          <option value="mencari_kerja">Pelatihan / BKK</option>
                          <option value="belum_bekerja">Belum Bekerja</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                          Instansi / Kampus / Keterangan
                        </label>
                        <input
                          type="text"
                          value={row.institutionOrCompany}
                          onChange={e =>
                            handleUpdateDraftCell(row.id, 'institutionOrCompany', e.target.value)
                          }
                          className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                          Jabatan / Prodi
                        </label>
                        <input
                          type="text"
                          value={row.roleOrStudyProgram}
                          onChange={e =>
                            handleUpdateDraftCell(row.id, 'roleOrStudyProgram', e.target.value)
                          }
                          className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-[#6E6A86] dark:text-slate-400 block mb-1">
                          Kota &amp; Masa Tunggu
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={row.city}
                            onChange={e => handleUpdateDraftCell(row.id, 'city', e.target.value)}
                            className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          <select
                            value={row.waitingPeriod}
                            onChange={e =>
                              handleUpdateDraftCell(
                                row.id,
                                'waitingPeriod',
                                e.target.value as AlumniWaitingPeriod
                              )
                            }
                            className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-1.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          >
                            {WAITING_PERIODS.map(wp => (
                              <option key={wp} value={wp}>
                                {wp}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <CarouselTablePagination
                page={tracerPagination.page}
                totalPages={tracerPagination.totalPages}
                totalItems={tracerPagination.totalItems}
                pageSize={tracerPagination.pageSize}
                startIndex={tracerPagination.startIndex}
                endIndex={tracerPagination.endIndex}
                slideDirection={tracerPagination.slideDirection}
                onPageChange={tracerPagination.setPage}
                onPageSizeChange={tracerPagination.setPageSize}
                itemLabel="baris draf"
              />
            </>
          )}
        </div>
      )}

      {/* VIEW 3: PRATINJAU KERTAS A4, EDITOR KOP SURAT, LOGO INSTANSI, SCAN TTD & PRINT */}
      {viewMode === 'paper_print' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL: Editor Kop, Logo Instansi, Judul Dokumen & Scan TTD */}
          <div className="xl:col-span-5 rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <HighlightedChartHeader
              title="Pengaturan Kertas, Kop Surat & Scan TTD"
              subtitle="Setiap perubahan langsung tampil pada lembar kertas laporan di sebelah kanan"
              accent="purple"
            />

            {/* Sub-Tabs inside Customizer */}
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E4E1F4] bg-[#F4F3FA] p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setPaperEditorTab('kop')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-extrabold cursor-pointer transition-all ${
                  paperEditorTab === 'kop'
                    ? 'bg-[#6C60B8] text-white shadow-2xs'
                    : 'text-[#5A537A] hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>Kop &amp; Logo</span>
              </button>
              <button
                type="button"
                onClick={() => setPaperEditorTab('dokumen')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-extrabold cursor-pointer transition-all ${
                  paperEditorTab === 'dokumen'
                    ? 'bg-[#6C60B8] text-white shadow-2xs'
                    : 'text-[#5A537A] hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
                <span>Judul &amp; Kertas</span>
              </button>
              <button
                type="button"
                onClick={() => setPaperEditorTab('ttd')}
                className={`no-ornament inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-extrabold cursor-pointer transition-all ${
                  paperEditorTab === 'ttd'
                    ? 'bg-[#6C60B8] text-white shadow-2xs'
                    : 'text-[#5A537A] hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <PenTool className="h-3.5 w-3.5 shrink-0" />
                <span>Tanda Tangan</span>
              </button>
            </div>

            {/* EDITOR TAB A: KOP & LOGO INSTANSI */}
            {paperEditorTab === 'kop' && (
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between gap-2 rounded-xl border border-[#ECEAF6] bg-[#FAF9FE] px-3 py-2 cursor-pointer dark:border-slate-800 dark:bg-slate-800/60">
                  <span className="font-bold text-[#3E385B] dark:text-slate-200">
                    Tampilkan Kop Surat Resmi di Kertas
                  </span>
                  <input
                    type="checkbox"
                    checked={paperConfig.showKopSurat !== false}
                    onChange={e =>
                      setPaperConfig(prev => ({ ...prev, showKopSurat: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-[#6C60B8]"
                  />
                </label>

                {/* Upload Logo Instansi */}
                <div className="rounded-xl border border-[#E6E4F2] bg-[#FAF9FE] p-3 space-y-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#3E385B] dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-[#6C60B8]" />
                      <span>Logo Instansi / Sekolah</span>
                    </span>
                    {paperConfig.logoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPaperConfig(prev => ({ ...prev, logoDataUrl: undefined }))}
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#D4CEEF] bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900">
                      {paperConfig.logoDataUrl ? (
                        <img
                          src={paperConfig.logoDataUrl}
                          alt="Logo Instansi"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center px-1">Belum ada</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#DDD8F6] bg-white px-3 text-[11px] font-bold text-[#6C60B8] hover:bg-[#F4F2FC] dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300 cursor-pointer">
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        <span>Unggah Logo Instansi (PNG/JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {appLogoUrl && paperConfig.logoDataUrl !== appLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setPaperConfig(prev => ({ ...prev, logoDataUrl: appLogoUrl }))}
                          className="no-ornament inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-[#F0EEFA] px-2.5 text-[10.5px] font-bold text-[#6C60B8] hover:bg-[#E4E0F6] dark:bg-violet-950/60 dark:text-violet-300 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span>Gunakan Logo Aplikasi Saat Ini</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Nama Yayasan / Dinas Pendidikan
                  </label>
                  <input
                    type="text"
                    value={paperConfig.institutionFoundation}
                    onChange={e =>
                      setPaperConfig(prev => ({ ...prev, institutionFoundation: e.target.value }))
                    }
                    className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs font-semibold text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Nama Sekolah / Instansi Utama
                  </label>
                  <input
                    type="text"
                    value={paperConfig.institutionName}
                    onChange={e =>
                      setPaperConfig(prev => ({ ...prev, institutionName: e.target.value }))
                    }
                    className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs font-bold text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Kompetensi Keahlian / Tagline
                  </label>
                  <input
                    type="text"
                    value={paperConfig.institutionTagline}
                    onChange={e =>
                      setPaperConfig(prev => ({ ...prev, institutionTagline: e.target.value }))
                    }
                    placeholder="Contoh: Program Keahlian DPB & RPL"
                    className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Alamat Lengkap Instansi
                  </label>
                  <input
                    type="text"
                    value={paperConfig.institutionAddress}
                    onChange={e =>
                      setPaperConfig(prev => ({ ...prev, institutionAddress: e.target.value }))
                    }
                    className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                      Kontak / Email / Web
                    </label>
                    <input
                      type="text"
                      value={paperConfig.institutionContact}
                      onChange={e =>
                        setPaperConfig(prev => ({ ...prev, institutionContact: e.target.value }))
                      }
                      className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                      Warna Aksen Kop &amp; Tabel
                    </label>
                    <div className="flex items-center gap-2 h-9">
                      {ACCENT_PRESETS.map(p => {
                        const cur = paperConfig.accentColor || [15, 23, 42];
                        const active =
                          cur[0] === p.rgb[0] && cur[1] === p.rgb[1] && cur[2] === p.rgb[2];
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setPaperConfig(prev => ({ ...prev, accentColor: p.rgb }))}
                            style={{ backgroundColor: p.hex }}
                            title={p.label}
                            className={`h-7 w-7 rounded-lg border transition-transform cursor-pointer ${
                              active
                                ? 'scale-110 ring-2 ring-[#6C60B8] border-white'
                                : 'border-slate-300 opacity-80 hover:opacity-100'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDITOR TAB B: JUDUL DOKUMEN, NOMOR SURAT & KERTAS */}
            {paperEditorTab === 'dokumen' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Judul Laporan di Atas Kertas *
                  </label>
                  <input
                    type="text"
                    value={paperDocTitle}
                    onChange={e => setPaperDocTitle(e.target.value)}
                    className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs font-bold text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Subjudul / Nomor Surat Resmi
                  </label>
                  <input
                    type="text"
                    value={paperDocSubtitle}
                    onChange={e => setPaperDocSubtitle(e.target.value)}
                    placeholder="Contoh: Nomor: 421.5/BKK-SMK/XI/2026"
                    className="no-ornament h-9 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1">
                    Catatan Kaki / Keterangan Penutup
                  </label>
                  <textarea
                    rows={3}
                    value={paperConfig.footerNote || ''}
                    onChange={e =>
                      setPaperConfig(prev => ({ ...prev, footerNote: e.target.value }))
                    }
                    placeholder="Tambahkan keterangan atau catatan resmi sebelum blok tanda tangan..."
                    className="no-ornament w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] p-2.5 text-xs text-[#252042] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5A537A] dark:text-slate-300 block mb-1.5">
                    Orientasi Kertas A4
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperOrientation('landscape')}
                      className={`no-ornament h-9 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        paperOrientation === 'landscape'
                          ? 'border-[#6C60B8] bg-[#F0EEFA] text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300'
                          : 'border-[#E2DFEF] bg-white text-[#5A537A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      A4 Landscape (Lebar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperOrientation('portrait')}
                      className={`no-ornament h-9 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        paperOrientation === 'portrait'
                          ? 'border-[#6C60B8] bg-[#F0EEFA] text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300'
                          : 'border-[#E2DFEF] bg-white text-[#5A537A] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      A4 Portrait (Berdiri)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between gap-2 rounded-xl border border-[#ECEAF6] bg-[#FAF9FE] px-3 py-2 cursor-pointer dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="font-bold text-[#3E385B] dark:text-slate-200">
                      Tampilkan Ringkasan Statistik di Kertas
                    </span>
                    <input
                      type="checkbox"
                      checked={showSummaryOnPaper}
                      onChange={e => setShowSummaryOnPaper(e.target.checked)}
                      className="h-4 w-4 rounded text-[#6C60B8]"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-xl border border-[#ECEAF6] bg-[#FAF9FE] px-3 py-2 cursor-pointer dark:border-slate-800 dark:bg-slate-800/60">
                    <span className="font-bold text-[#3E385B] dark:text-slate-200">
                      Tampilkan Blok Tanda Tangan
                    </span>
                    <input
                      type="checkbox"
                      checked={showSignaturesOnPaper}
                      onChange={e => setShowSignaturesOnPaper(e.target.checked)}
                      className="h-4 w-4 rounded text-[#6C60B8]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* EDITOR TAB C: TANDA TANGAN & SCAN TTD */}
            {paperEditorTab === 'ttd' && (
              <div className="space-y-4 text-xs">
                {/* Left Signer */}
                <div className="rounded-xl border border-[#E6E4F2] bg-[#FAF9FE] p-3.5 space-y-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#3E385B] dark:text-slate-200">
                      1. Penandatangan Kiri (Ketua BKK / Koordinator)
                    </span>
                    {paperConfig.leftSignerSignatureUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPaperConfig(prev => ({ ...prev, leftSignerSignatureUrl: undefined }))
                        }
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Hapus Scan TTD
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Teks Pembuka
                      </label>
                      <input
                        type="text"
                        value={paperConfig.leftSignerHeader || 'Mengetahui,'}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, leftSignerHeader: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        value={paperConfig.leftSignerTitle}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, leftSignerTitle: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Nama Lengkap &amp; Gelar
                      </label>
                      <input
                        type="text"
                        value={paperConfig.leftSignerName}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, leftSignerName: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        NIP / NUPTK
                      </label>
                      <input
                        type="text"
                        value={paperConfig.leftSignerNip}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, leftSignerNip: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#D4CEEF] bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900">
                      {paperConfig.leftSignerSignatureUrl ? (
                        <img
                          src={paperConfig.leftSignerSignatureUrl}
                          alt="Scan TTD Kiri"
                          className="h-full w-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Kosong</span>
                      )}
                    </div>
                    <label className="no-ornament flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DDD8F6] bg-white px-3 text-[11px] font-bold text-[#6C60B8] hover:bg-[#F4F2FC] dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 shrink-0" />
                      <span>Unggah Scan TTD Kiri</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleSignatureUpload('left', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Right Signer */}
                <div className="rounded-xl border border-[#E6E4F2] bg-[#FAF9FE] p-3.5 space-y-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#3E385B] dark:text-slate-200">
                      2. Penandatangan Kanan (Kepala Sekolah)
                    </span>
                    {paperConfig.rightSignerSignatureUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPaperConfig(prev => ({ ...prev, rightSignerSignatureUrl: undefined }))
                        }
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Hapus Scan TTD
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Kota
                      </label>
                      <input
                        type="text"
                        value={paperConfig.rightSignerCity}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, rightSignerCity: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Tanggal Cetak
                      </label>
                      <input
                        type="text"
                        value={paperConfig.rightSignerDate}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, rightSignerDate: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Jabatan Kepala Sekolah
                      </label>
                      <input
                        type="text"
                        value={paperConfig.rightSignerTitle}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, rightSignerTitle: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                        Nama Lengkap &amp; Gelar
                      </label>
                      <input
                        type="text"
                        value={paperConfig.rightSignerName}
                        onChange={e =>
                          setPaperConfig(prev => ({ ...prev, rightSignerName: e.target.value }))
                        }
                        className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-400 block mb-0.5">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={paperConfig.rightSignerNip}
                      onChange={e =>
                        setPaperConfig(prev => ({ ...prev, rightSignerNip: e.target.value }))
                      }
                      className="no-ornament h-8 w-full rounded-lg border border-[#E2DFEF] bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#D4CEEF] bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-900">
                      {paperConfig.rightSignerSignatureUrl ? (
                        <img
                          src={paperConfig.rightSignerSignatureUrl}
                          alt="Scan TTD Kepala Sekolah"
                          className="h-full w-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Kosong</span>
                      )}
                    </div>
                    <label className="no-ornament flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DDD8F6] bg-white px-3 text-[11px] font-bold text-[#6C60B8] hover:bg-[#F4F2FC] dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 shrink-0" />
                      <span>Unggah Scan TTD Kanan</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleSignatureUpload('right', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Kop & TTD Template Action */}
            <div className="pt-2 border-t border-[#ECEAF6] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSaveKopTemplateToDb}
                disabled={isSavingTemplate}
                className="no-ornament w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-extrabold text-white shadow-xs hover:bg-[#5B4FA8] disabled:opacity-60 cursor-pointer transition-colors"
              >
                {isSavingTemplate ? (
                  <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>
                  {isSavingTemplate
                    ? 'Menyimpan Template ke Database...'
                    : 'Simpan Template Kop, Logo & TTD ke Database'}
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Live A4 Paper Sheet + Print & Export */}
          <div className="xl:col-span-7 rounded-2xl border border-[#E6E4F2] bg-[#ECEAF4] p-4 sm:p-5 shadow-inner dark:border-slate-800 dark:bg-slate-950 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DFDCF0] bg-white px-4 py-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-xs">
                <ScrollText className="h-4 w-4 text-[#6C60B8] shrink-0" />
                <span className="font-extrabold text-[#252042] dark:text-white">
                  Pratinjau Kertas Siap Cetak
                </span>
                <span className="no-ornament rounded-lg bg-[#F0EEFA] px-2 py-0.5 text-[10.5px] font-bold text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300">
                  A4 {paperOrientation === 'landscape' ? 'Landscape' : 'Portrait'} &middot; {filteredTracers.length} Baris
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPaperNow}
                  className="no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#6C60B8] px-3.5 text-xs font-extrabold text-white hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 shrink-0" />
                  <span>Print Kertas</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="no-ornament inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#DDD8F6] bg-[#F4F2FC] px-3 text-xs font-bold text-[#6C60B8] hover:bg-[#EAE7F8] dark:border-violet-800/70 dark:bg-violet-950/50 dark:text-violet-300 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="shadow-xl border border-slate-300 rounded-sm overflow-hidden inline-block min-w-full">
                {renderPaperDocument()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PRINT PORTAL ON document.body (Clean A4 Print with zero UI chrome) */}
      {viewMode === 'paper_print' &&
        typeof document !== 'undefined' &&
        createPortal(
          <div id="tracer-print-portal" className="hidden print:block bg-white text-slate-900">
            {renderPaperDocument()}
          </div>,
          document.body
        )}

      {/* Add / Edit Alumni Tracer Modal (Centered via Portal) */}
      {showModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={e => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
          >
            <div className="relative m-auto w-full max-w-2xl rounded-3xl border border-[#E6E4F2] bg-white p-6 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#ECEAF6] pb-3.5 mb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EEFA] text-[#6C60B8] dark:bg-violet-950/60 dark:text-violet-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#252042] dark:text-white">
                      {formState.respondentCategory === 'kelas_12'
                        ? editingTracerId
                          ? 'Perbarui Rencana Pasca Lulus (Siswa Kelas 12)'
                          : 'Form Perencanaan Lulusan (Siswa Kelas 12)'
                        : editingTracerId
                        ? 'Perbarui Data Tracer Study Alumni'
                        : 'Catat / Perbarui Jejak Alumni Terdata'}
                    </h3>
                    <p className="text-[11px] text-[#7A7596] dark:text-slate-400">
                      {formState.respondentCategory === 'kelas_12'
                        ? 'Pemetaan rencana kerja industri, kuliah, wirausaha & pendampingan BKK untuk Siswa Kelas XII (DPB & RPL)'
                        : 'Pelacakan penempatan kerja, kuliah, wirausaha & masa tunggu dari data alumni terdata (DPB & RPL)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#ECEAF6] bg-[#FAF9FE] p-1.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <button
                    type="button"
                    onClick={() => {
                      setFormState(p => ({
                        ...p,
                        respondentCategory: 'alumni',
                        graduationYear:
                          p.respondentCategory === 'kelas_12' ? '2025' : p.graduationYear,
                      }));
                    }}
                    className={`no-ornament rounded-xl py-2 px-3 text-xs font-extrabold transition-all cursor-pointer ${
                      formState.respondentCategory === 'alumni'
                        ? 'bg-[#6C60B8] text-white shadow-2xs'
                        : 'text-[#5A537A] hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    Alumni Lulusan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitAttempted(false);
                      setFormState(p => ({
                        ...p,
                        respondentCategory: 'kelas_12',
                        studentId: editingTracerId ? p.studentId : '',
                        nisn: editingTracerId ? p.nisn : '',
                        fullName: editingTracerId ? p.fullName : '',
                        className: editingTracerId ? p.className : '',
                        graduationYear: defaultGradYear,
                        institutionOrCompany: editingTracerId ? p.institutionOrCompany : '',
                        roleOrStudyProgram: editingTracerId ? p.roleOrStudyProgram : '',
                        city: editingTracerId ? p.city : '',
                        phone: editingTracerId ? p.phone : '',
                        email: editingTracerId ? p.email : '',
                        testimonial: editingTracerId ? p.testimonial : '',
                        bkkSupportNeed: BKK_SUPPORT_OPTIONS[0],
                        targetPlanDate: PLAN_TIMELINE_OPTIONS[0],
                      }));
                    }}
                    className={`no-ornament rounded-xl py-2 px-3 text-xs font-extrabold transition-all cursor-pointer ${
                      formState.respondentCategory === 'kelas_12'
                        ? 'bg-[#F25781] text-white shadow-2xs'
                        : 'text-[#5A537A] hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    Siswa Kelas 12 (Rencana Lulus)
                  </button>
                </div>

                <AccordionExpandAllBar
                  title="Grup Formulir & Dropdown Modal"
                  allExpanded={tracerAccordion.allExpanded}
                  onExpandAll={tracerAccordion.expandAll}
                  onCollapseAll={tracerAccordion.collapseAll}
                />

                <AccordionSection
                  title="Identitas Responden & Data Kelas / Alumni"
                  open={tracerAccordion.isOpen('modal_identity')}
                  onToggle={() => tracerAccordion.toggle('modal_identity')}
                >
                  <div className="space-y-3">

                {formState.respondentCategory === 'kelas_12'
                  ? !editingTracerId &&
                    grade12Students.length > 0 && (
                      <div className="rounded-2xl border border-[#FFC4D4] bg-[#FFF5F8] p-3 dark:border-rose-900/50 dark:bg-rose-950/30">
                        <label className="font-bold text-[#C2325C] dark:text-rose-300 block mb-1.5">
                          Pilih dari Data Siswa Kelas 12 (Master Siswa &amp; Penempatan PKL)
                        </label>
                        <select
                          value={formState.studentId}
                          onChange={e => handlePrefillFromStudent(e.target.value, 'kelas_12')}
                          className="w-full rounded-xl border border-[#FFD1DF] bg-white py-2 px-3 text-xs font-semibold text-[#262341] focus:border-[#F25781] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="">-- Pilih Siswa Kelas 12 atau Ketik Manual --</option>
                          {grade12Students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.className} - {normalizeTracerMajor(s.majorCode)})
                              &middot; NISN {s.nisn}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  : (recordedAlumniTracers.length > 0 || graduatedStudents.length > 0) && (
                      <div className="rounded-2xl border border-[#DDD8F6] bg-[#F7F5FD] p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                        <label className="font-bold text-[#4B4188] dark:text-indigo-300 block mb-1.5">
                          Pilih dari Data Alumni yang Sudah Terdata (Opsional)
                        </label>
                        <select
                          value={
                            editingTracerId &&
                            recordedAlumniTracers.some(r => r.id === editingTracerId)
                              ? `trc:${editingTracerId}`
                              : formState.studentId &&
                                graduatedStudents.some(s => s.id === formState.studentId)
                              ? `std:${formState.studentId}`
                              : ''
                          }
                          onChange={e => handlePrefillFromRecordedAlumni(e.target.value)}
                          className="w-full rounded-xl border border-[#D4CEEF] bg-white py-2 px-3 text-xs font-semibold text-[#262341] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="">-- Input Manual Alumni Baru --</option>
                          {recordedAlumniTracers.map(rec => (
                            <option key={`trc-${rec.id}`} value={`trc:${rec.id}`}>
                              [Alumni Terdata] {rec.fullName} &middot; Lulus {rec.graduationYear} (
                              {normalizeTracerMajor(rec.majorCode)}) &middot; NISN {rec.nisn}
                            </option>
                          ))}
                          {graduatedStudents.map(s => (
                            <option key={`std-${s.id}`} value={`std:${s.id}`}>
                              [Lulusan DB] {s.fullName} ({s.className} -{' '}
                              {normalizeTracerMajor(s.majorCode)}) &middot; NISN {s.nisn}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      {formState.respondentCategory === 'kelas_12'
                        ? 'Nama Lengkap Siswa Kelas 12 *'
                        : 'Nama Lengkap Alumni *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        formState.respondentCategory === 'kelas_12'
                          ? 'Contoh: Nabila Putri Lestari'
                          : 'Contoh: Aditya Pratama Putra'
                      }
                      value={formState.fullName}
                      aria-invalid={formSubmitAttempted && !formState.fullName.trim()}
                      onChange={e => setFormState(p => ({ ...p, fullName: e.target.value }))}
                      className={`w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                        formSubmitAttempted && !formState.fullName.trim() ? 'orbita-field-zigzag-error' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">NISN</label>
                    <input
                      type="text"
                      placeholder="0061239801"
                      value={formState.nisn}
                      onChange={e => setFormState(p => ({ ...p, nisn: e.target.value }))}
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-mono focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {formState.respondentCategory === 'kelas_12' && (
                    <>
                      <div>
                        <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                          Kelas XII (Rombel)
                        </label>
                        {grade12Classes.length > 0 ? (
                          <select
                            value={formState.className}
                            onChange={e => {
                              const nextClass = e.target.value;
                              const upper = nextClass.toUpperCase();
                              setFormState(p => ({
                                ...p,
                                className: nextClass,
                                majorCode:
                                  upper.includes('DPB') || upper.includes('BUSANA')
                                    ? 'DPB'
                                    : upper.includes('RPL')
                                    ? 'RPL'
                                    : p.majorCode,
                              }));
                            }}
                            className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-bold focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="">-- Pilih Kelas XII --</option>
                            {grade12Classes.map(cls => (
                              <option key={cls.id} value={cls.name}>
                                {cls.name}
                              </option>
                            ))}
                            {!grade12Classes.some(c => c.name === formState.className) &&
                              formState.className && (
                                <option value={formState.className}>{formState.className}</option>
                              )}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="XII RPL 1 / XII DPB 1"
                            value={formState.className}
                            onChange={e => setFormState(p => ({ ...p, className: e.target.value }))}
                            className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-bold focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        )}
                      </div>
                      <div>
                        <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                          Kebutuhan Pendampingan BKK
                        </label>
                        <select
                          value={formState.bkkSupportNeed || BKK_SUPPORT_OPTIONS[0]}
                          onChange={e =>
                            setFormState(p => ({ ...p, bkkSupportNeed: e.target.value }))
                          }
                          className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {BKK_SUPPORT_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          {formState.bkkSupportNeed &&
                            !BKK_SUPPORT_OPTIONS.includes(formState.bkkSupportNeed) && (
                              <option value={formState.bkkSupportNeed}>
                                {formState.bkkSupportNeed}
                              </option>
                            )}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">L/P</label>
                      <select
                        value={formState.gender}
                        onChange={e => setFormState(p => ({ ...p, gender: e.target.value as 'L' | 'P' }))}
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="L">L</option>
                        <option value="P">P</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                        Jurusan *
                      </label>
                      <select
                        value={formState.majorCode}
                        onChange={e =>
                          setFormState(p => ({ ...p, majorCode: e.target.value as TracerMajorCode }))
                        }
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-2 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-violet-300"
                      >
                        {TRACER_MAJORS.map(code => (
                          <option key={code} value={code} title={TRACER_MAJOR_LABELS[code]}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                        {formState.respondentCategory === 'kelas_12' ? 'Est. Lulus' : 'Thn Lulus'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={defaultGradYear}
                        value={formState.graduationYear}
                        onChange={e => setFormState(p => ({ ...p, graduationYear: e.target.value }))}
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-2 text-xs font-bold text-center dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Rencana / Status Karier, Mitra & Timeline"
                  open={tracerAccordion.isOpen('modal_career')}
                  onToggle={() => tracerAccordion.toggle('modal_career')}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      {formState.respondentCategory === 'kelas_12'
                        ? 'Rencana Utama Setelah Lulus *'
                        : 'Status Karier Saat Ini *'}
                    </label>
                    <select
                      value={formState.careerStatus}
                      onChange={e =>
                        setFormState(p => ({
                          ...p,
                          careerStatus: e.target.value as AlumniCareerStatus,
                        }))
                      }
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300"
                    >
                      <option value="bekerja">
                        {formState.respondentCategory === 'kelas_12'
                          ? 'Rencana Bekerja di Industri / DUDI'
                          : 'Bekerja di Industri / Perusahaan'}
                      </option>
                      <option value="kuliah">
                        {formState.respondentCategory === 'kelas_12'
                          ? 'Rencana Melanjutkan Kuliah (PTN / PTS)'
                          : 'Melanjutkan Kuliah (PTN / PTS)'}
                      </option>
                      <option value="wirausaha">
                        {formState.respondentCategory === 'kelas_12'
                          ? 'Rencana Berwirausaha / Usaha Mandiri'
                          : 'Berwirausaha / Freelancer Mandiri'}
                      </option>
                      <option value="mencari_kerja">
                        {formState.respondentCategory === 'kelas_12'
                          ? 'Ikut Program Penyaluran & Pelatihan BKK'
                          : 'Pelatihan / Penyaluran BKK'}
                      </option>
                      <option value="belum_bekerja">
                        {formState.respondentCategory === 'kelas_12'
                          ? 'Belum Menentukan / Belum Bekerja'
                          : 'Belum Bekerja'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      {formState.careerStatus === 'kuliah'
                        ? formState.respondentCategory === 'kelas_12'
                          ? 'Perguruan Tinggi / Kampus Target *'
                          : 'Perguruan Tinggi / Kampus *'
                        : formState.careerStatus === 'wirausaha'
                        ? formState.respondentCategory === 'kelas_12'
                          ? 'Ide / Nama Usaha Target *'
                          : 'Nama Usaha / Bisnis *'
                        : isModalUnemployed
                        ? 'Keterangan / Target Penempatan (Opsional)'
                        : formState.respondentCategory === 'kelas_12'
                        ? 'Perusahaan / DUDI yang Dituju *'
                        : 'Nama Perusahaan / Instansi *'}
                    </label>
                    <input
                      type="text"
                      required={!isModalUnemployed}
                      placeholder={
                        isModalUnemployed
                          ? 'Opsional (mis. Persiapan Kerja / Sedang Mencari)'
                          : 'Contoh: PT Telkom Indonesia / POLBAN'
                      }
                      value={formState.institutionOrCompany}
                      aria-invalid={formSubmitAttempted && !isModalUnemployed && !formState.institutionOrCompany.trim()}
                      onChange={e => setFormState(p => ({ ...p, institutionOrCompany: e.target.value }))}
                      className={`w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                        formSubmitAttempted && !isModalUnemployed && !formState.institutionOrCompany.trim()
                          ? 'orbita-field-zigzag-error'
                          : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      {formState.careerStatus === 'kuliah'
                        ? formState.respondentCategory === 'kelas_12'
                          ? 'Target Program Studi & Jenjang'
                          : 'Program Studi & Jenjang'
                        : formState.respondentCategory === 'kelas_12'
                        ? 'Target Posisi / Bidang Kerja'
                        : 'Jabatan / Bidang Kerja'}
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Frontend Developer / Fashion Designer"
                      value={formState.roleOrStudyProgram}
                      onChange={e => setFormState(p => ({ ...p, roleOrStudyProgram: e.target.value }))}
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      Riwayat Mitra DUDI Saat PKL
                    </label>
                    <select
                      value={formState.pklPartnerId}
                      onChange={e => {
                        const chosen = partners.find(p => p.id === e.target.value);
                        setFormState(p => ({
                          ...p,
                          pklPartnerId: e.target.value,
                          pklPartnerName: chosen?.name || '',
                        }));
                      }}
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">-- Tidak Terkait / Mandiri --</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      {formState.respondentCategory === 'kelas_12'
                        ? 'Kota Tujuan Karir / Studi'
                        : 'Kota Penempatan'}
                    </label>
                    <input
                      type="text"
                      value={formState.city}
                      onChange={e => setFormState(p => ({ ...p, city: e.target.value }))}
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      Relevansi dengan Jurusan (DPB / RPL)
                    </label>
                    <select
                      value={formState.industryRelevance}
                      onChange={e =>
                        setFormState(p => ({
                          ...p,
                          industryRelevance: e.target.value as AlumniRelevanceLevel,
                        }))
                      }
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="sangat_sesuai">Sangat Sesuai Jurusan</option>
                      <option value="sesuai">Sesuai Kompetensi</option>
                      <option value="cukup_sesuai">Cukup Sesuai</option>
                      <option value="tidak_sesuai">Lintas Bidang</option>
                    </select>
                  </div>

                  {formState.respondentCategory === 'kelas_12' ? (
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                        Target Kesiapan Setelah Kelulusan
                      </label>
                      <select
                        value={formState.targetPlanDate || PLAN_TIMELINE_OPTIONS[0]}
                        onChange={e => {
                          const val = e.target.value;
                          setFormState(p => ({
                            ...p,
                            targetPlanDate: val,
                            waitingPeriod: val.includes('Tahun Akademik')
                              ? '3 - 6 Bulan'
                              : val.includes('Berkas')
                              ? '6 - 12 Bulan'
                              : '< 3 Bulan',
                          }));
                        }}
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {PLAN_TIMELINE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        {formState.targetPlanDate &&
                          !PLAN_TIMELINE_OPTIONS.includes(formState.targetPlanDate) && (
                            <option value={formState.targetPlanDate}>
                              {formState.targetPlanDate}
                            </option>
                          )}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                        Waktu Tunggu Lulusan
                      </label>
                      <select
                        value={formState.waitingPeriod}
                        onChange={e =>
                          setFormState(p => ({
                            ...p,
                            waitingPeriod: e.target.value as AlumniWaitingPeriod,
                          }))
                        }
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {WAITING_PERIODS.map(wp => (
                          <option key={wp} value={wp}>
                            {wp}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                      No. HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="0812xxxxxxxx"
                      value={formState.phone}
                      onChange={e => setFormState(p => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {formState.respondentCategory === 'alumni' ? (
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                        Rentang Penghasilan / Keterangan
                      </label>
                      <input
                        type="text"
                        placeholder="Rp 4.500.000 - Rp 6.000.000 / Beasiswa"
                        value={formState.monthlyIncomeRange}
                        onChange={e => setFormState(p => ({ ...p, monthlyIncomeRange: e.target.value }))}
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                        Email Aktif (Opsional)
                      </label>
                      <input
                        type="email"
                        placeholder="siswa@email.com"
                        value={formState.email}
                        onChange={e => setFormState(p => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  )}
                </div>
                </AccordionSection>

                <div>
                  <label className="font-bold text-[#3E385B] dark:text-slate-300 block mb-1">
                    {formState.respondentCategory === 'kelas_12'
                      ? 'Aspirasi, Kesiapan Portofolio, atau Pesan untuk Tim BKK'
                      : 'Testimoni / Kesan Manfaat PKL Terhadap Karier'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={
                      formState.respondentCategory === 'kelas_12'
                        ? 'Contoh: Membutuhkan pendampingan CV & info rekrutmen industri bidang RPL/DPB...'
                        : 'Contoh: Pengalaman PKL membantu langsung lolos seleksi wawancara...'
                    }
                    value={formState.testimonial}
                    onChange={e => setFormState(p => ({ ...p, testimonial: e.target.value }))}
                    className="w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={formState.verifiedBySchool}
                    onChange={e => setFormState(p => ({ ...p, verifiedBySchool: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#D4CEEF] text-[#6C60B8] focus:ring-[#6C60B8]"
                  />
                  <span className="font-bold text-[#3E385B] dark:text-slate-200">
                    Tandai sebagai data Terverifikasi Tim BKK / Sekolah
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-[#ECEAF6] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSavingModal}
                    className="no-ornament inline-flex h-9 items-center justify-center rounded-xl border border-[#E2DFEF] px-4 text-xs font-bold text-[#555070] hover:bg-[#FAF9FE] disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingModal}
                    data-sending={isLaunchingModalPlane ? 'true' : 'false'}
                    className="no-ornament orbita-paper-plane-btn inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-5 text-xs font-extrabold text-white shadow-xs hover:bg-[#5B4FA8] disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Send className="h-3.5 w-3.5 shrink-0 orbita-paper-plane-icon" />
                    <span>
                      {isSavingModal
                        ? 'Menyimpan ke Database...'
                        : formState.respondentCategory === 'kelas_12'
                        ? editingTracerId
                          ? 'Simpan & Sinkronkan Kelas 12'
                          : 'Kirim & Sinkronkan Rencana Kelas 12'
                        : editingTracerId
                        ? 'Simpan & Sinkronkan Alumni'
                        : 'Kirim & Sinkronkan Data Alumni'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
