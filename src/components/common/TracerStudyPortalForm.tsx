import React, { useState, useMemo, useEffect } from 'react';
import {
  AlumniTracerRecord,
  AlumniRespondentCategory,
  AlumniCareerStatus,
  AlumniRelevanceLevel,
  AlumniWaitingPeriod,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { LiquidNavBar } from './LiquidNavBar';
import { GenshinElementIcon, OrbitaMenuIcon } from './AcademyOrnaments';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  RefreshCw,
  Edit,
  Plus,
  ShieldCheck,
  UserCheck,
  KeyRound,
  AlertCircle,
  AlertTriangle,
  X,
  Lock,
} from 'lucide-react';

export type TracerPortalStage = 'verify' | 'intro' | 'form' | 'success';

interface TracerStudyPortalFormProps {
  source?: 'login_portal' | 'admin_panel';
  lockedCategory?: AlumniRespondentCategory;
  autoRouteByIdentity?: boolean;
  initialCategory?: AlumniRespondentCategory;
  initialStage?: 'verify' | 'intro' | 'form';
  hideOuterBackButton?: boolean;
  onStageChange?: (stage: TracerPortalStage) => void;
  onResolvedCategory?: (category: AlumniRespondentCategory | null) => void;
  onClose?: () => void;
  onSuccessSaved?: (record: AlumniTracerRecord) => void;
}

interface VerifiedRespondent {
  inputCode: string;
  matchedNisn: string;
  matchedNis?: string;
  fullName: string;
  studentId?: string;
  className?: string;
  majorCode: TracerMajorCode;
  gender: 'L' | 'P';
  phone?: string;
  email?: string;
  pklPartnerId?: string;
  pklPartnerName?: string;
  detectedCategory: AlumniRespondentCategory;
  statusLabel: string;
  sourcesMatched: string[];
  tracerRecord?: AlumniTracerRecord;
}

const normalizeIdentityCode = (value?: string): string =>
  (value || '').trim().replace(/\s+/g, '');

const TRACER_MAJORS = ['DPB', 'RPL'] as const;
type TracerMajorCode = (typeof TRACER_MAJORS)[number];

const normalizeTracerMajor = (code?: string): TracerMajorCode => {
  const upper = (code || '').trim().toUpperCase();
  if (upper.includes('DPB') || upper.includes('BUSANA')) return 'DPB';
  return 'RPL';
};

const WAITING_PERIODS: AlumniWaitingPeriod[] = [
  '< 3 Bulan',
  '3 - 6 Bulan',
  '6 - 12 Bulan',
  '> 12 Bulan',
];

const BKK_SUPPORT_OPTIONS = [
  'Info Lowongan Kerja & Rekrutmen Industri (DUDI)',
  'Bimbingan CV, Psikotes & Simulasi Interview Kerja',
  'Pendampingan Pendaftaran Kuliah (SNBP/SNBT/PTS/Beasiswa)',
  'Pelatihan Wirausaha Mandiri & Inkubasi Bisnis',
  'Konseling Penentuan Arah Karir Pasca Lulus',
];

const INCOME_RANGE_PRESETS = [
  'Rp 2.500.000 - Rp 4.000.000',
  'Rp 4.000.000 - Rp 6.000.000',
  '> Rp 6.000.000',
  'Beasiswa Penuh / KIP Kuliah',
  'Mandiri / Omzet Usaha Bertahap',
];

const PLAN_TIMELINE_OPTIONS = [
  'Langsung Setelah Pengumuman Kelulusan',
  'Dalam 1 - 3 Bulan Setelah Lulus',
  'Tahun Akademik / Gelombang Masuk Berikutnya',
  'Masih Mempersiapkan Berkas & Portofolio',
];

const STATUS_DISPLAY: Record<
  AlumniCareerStatus,
  {
    alumniLabel: string;
    grade12Label: string;
    shortLabel: string;
    badgeClass: string;
  }
> = {
  bekerja: {
    alumniLabel: 'Bekerja di Industri / Perusahaan (DUDI)',
    grade12Label: 'Rencana Bekerja di Industri / Perusahaan',
    shortLabel: 'Bekerja (DUDI)',
    badgeClass: 'bg-[#E7F9EF] text-[#139A4C] border border-[#BCEAD1]',
  },
  kuliah: {
    alumniLabel: 'Melanjutkan Kuliah (PTN / PTS / Vokasi)',
    grade12Label: 'Rencana Melanjutkan Kuliah (PTN / PTS)',
    shortLabel: 'Lanjut Kuliah',
    badgeClass: 'bg-[#F0EEFA] text-[#6C60B8] border border-[#DDD8F6]',
  },
  wirausaha: {
    alumniLabel: 'Berwirausaha / Freelancer Mandiri',
    grade12Label: 'Rencana Berwirausaha / Usaha Mandiri',
    shortLabel: 'Wirausaha',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  mencari_kerja: {
    alumniLabel: 'Pelatihan / Penyaluran BKK Sekolah',
    grade12Label: 'Ikut Program Penyaluran & Pelatihan BKK',
    shortLabel: 'Pelatihan / BKK',
    badgeClass: 'bg-[#FFE8EF] text-[#D9436D] border border-[#FFC4D4]',
  },
  belum_bekerja: {
    alumniLabel: 'Belum Bekerja',
    grade12Label: 'Belum Menentukan / Belum Bekerja',
    shortLabel: 'Belum Bekerja',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
};

export const TracerStudyPortalForm: React.FC<TracerStudyPortalFormProps> = ({
  source = 'login_portal',
  lockedCategory,
  autoRouteByIdentity = false,
  initialCategory,
  initialStage,
  hideOuterBackButton = false,
  onStageChange,
  onResolvedCategory,
  onClose,
  onSuccessSaved,
}) => {
  const {
    users = [],
    pklTracers = [],
    students = [],
    classes = [],
    pklPartners = [],
    academicYears = [],
    activeAcademicYear,
    savePklTracer,
    addToast,
  } = useApp();

  const resolvedInitialStage: 'verify' | 'intro' | 'form' =
    initialStage || (source === 'login_portal' ? 'verify' : 'intro');

  const [stage, setStage] = useState<TracerPortalStage>(resolvedInitialStage);
  const [nisOrNisnInput, setNisOrNisnInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedRespondent, setVerifiedRespondent] = useState<VerifiedRespondent | null>(null);
  const [showFormBackConfirm, setShowFormBackConfirm] = useState(false);

  const effectiveLockedCategory: AlumniRespondentCategory | undefined =
    lockedCategory ||
    (autoRouteByIdentity && verifiedRespondent ? verifiedRespondent.detectedCategory : undefined);

  const isLockedAlumni = effectiveLockedCategory === 'alumni';
  const isLockedGrade12 = effectiveLockedCategory === 'kelas_12';

  // Read-only Carousel state for Portal Overview of Student & Alumni summaries
  const [carouselFilter, setCarouselFilter] = useState<'all' | 'alumni' | 'kelas_12'>(
    lockedCategory || 'all'
  );
  const [carouselMajorFilter, setCarouselMajorFilter] = useState<'ALL' | 'DPB' | 'RPL'>('ALL');
  const [carouselPage, setCarouselPage] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  });
  const touchStartXRef = React.useRef<number | null>(null);

  useEffect(() => {
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  useEffect(() => {
    if (effectiveLockedCategory) {
      setCategory(effectiveLockedCategory);
      setCarouselFilter(effectiveLockedCategory);
    }
  }, [effectiveLockedCategory]);

  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth >= 1024) setCardsPerSlide(3);
      else if (window.innerWidth >= 640) setCardsPerSlide(2);
      else setCardsPerSlide(1);
    };
    window.addEventListener('resize', updateCardsPerSlide);
    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  const [category, setCategory] = useState<AlumniRespondentCategory>(
    lockedCategory || initialCategory || 'alumni'
  );
  const [lookupQuery, setLookupQuery] = useState('');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<AlumniTracerRecord | null>(null);

  const defaultGradYear = useMemo(() => {
    const raw = activeAcademicYear?.name || '2025/2026';
    const match = raw.match(/(\d{4})\s*$/);
    return match ? match[1] : '2026';
  }, [activeAcademicYear]);

  const graduationYearOptions = useMemo(() => {
    const yrs = new Set<string>(['2026', '2025', '2024', '2023', '2022', defaultGradYear]);
    academicYears.forEach(ay => {
      (ay.name || '').split('/').forEach(part => {
        const clean = part.trim();
        if (/^\d{4}$/.test(clean)) yrs.add(clean);
      });
    });
    pklTracers.forEach(t => {
      if (t.graduationYear) yrs.add(t.graduationYear);
    });
    return Array.from(yrs).sort((a, b) => b.localeCompare(a));
  }, [academicYears, pklTracers, defaultGradYear]);

  // Grade 12 Classes & Active Grade 12 Students pulled live from Database
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
      pklTracers
        .filter(t => (t.respondentCategory || 'alumni') === 'alumni')
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'id')),
    [pklTracers]
  );

  const recordedGrade12Tracers = useMemo(
    () =>
      pklTracers
        .filter(t => t.respondentCategory === 'kelas_12')
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'id')),
    [pklTracers]
  );

  const graduatedStudents = useMemo(() => {
    const alumniNisns = new Set(
      recordedAlumniTracers.map(t => normalizeIdentityCode(t.nisn)).filter(Boolean)
    );
    const alumniStudentKeys = new Set(
      recordedAlumniTracers
        .filter(t => t.studentId)
        .map(t => `${t.studentId}::${t.fullName.trim().toLowerCase()}`)
    );
    return students
      .filter(
        s =>
          s.status === 'lulus' &&
          !alumniNisns.has(normalizeIdentityCode(s.nisn)) &&
          !alumniStudentKeys.has(`${s.id}::${s.fullName.trim().toLowerCase()}`)
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName, 'id'));
  }, [students, recordedAlumniTracers]);

  const [formState, setFormState] = useState<{
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
  }>({
    studentId: '',
    nisn: '',
    fullName: '',
    className: grade12Classes[0]?.name || 'XII RPL 1',
    gender: 'L',
    majorCode: 'RPL',
    graduationYear: defaultGradYear,
    pklPartnerId: '',
    pklPartnerName: '',
    careerStatus: 'bekerja',
    institutionOrCompany: '',
    roleOrStudyProgram: '',
    city: 'Sukabumi',
    industryRelevance: 'sangat_sesuai',
    waitingPeriod: '< 3 Bulan',
    monthlyIncomeRange: '',
    bkkSupportNeed: BKK_SUPPORT_OPTIONS[0],
    targetPlanDate: PLAN_TIMELINE_OPTIONS[0],
    phone: '',
    email: '',
    testimonial: '',
  });

  // Live Statistics Synced Directly with Firestore & Admin Menu (Global + Per-Page)
  const liveStats = useMemo(() => {
    const alumniRecords = pklTracers.filter(
      t => (t.respondentCategory || 'alumni') === 'alumni'
    );
    const k12Records = pklTracers.filter(t => t.respondentCategory === 'kelas_12');

    const total = pklTracers.length;
    const alumniCount = alumniRecords.length;
    const grade12Count = k12Records.length;
    const bekerja = pklTracers.filter(t => t.careerStatus === 'bekerja').length;
    const kuliah = pklTracers.filter(t => t.careerStatus === 'kuliah').length;
    const wirausaha = pklTracers.filter(t => t.careerStatus === 'wirausaha').length;
    const belumBekerja = pklTracers.filter(t => t.careerStatus === 'belum_bekerja').length;
    const dpbCount = pklTracers.filter(t => normalizeTracerMajor(t.majorCode) === 'DPB').length;
    const rplCount = pklTracers.filter(t => normalizeTracerMajor(t.majorCode) === 'RPL').length;
    const bmwPct = total > 0 ? Math.round(((bekerja + kuliah + wirausaha) / total) * 100) : 0;

    // Alumni-specific metrics
    const alumniBekerja = alumniRecords.filter(t => t.careerStatus === 'bekerja').length;
    const alumniKuliah = alumniRecords.filter(t => t.careerStatus === 'kuliah').length;
    const alumniWirausaha = alumniRecords.filter(t => t.careerStatus === 'wirausaha').length;
    const alumniBelumBekerja = alumniRecords.filter(t => t.careerStatus === 'belum_bekerja').length;
    const alumniDpb = alumniRecords.filter(t => normalizeTracerMajor(t.majorCode) === 'DPB').length;
    const alumniRpl = alumniRecords.filter(t => normalizeTracerMajor(t.majorCode) === 'RPL').length;
    const alumniBmwPct =
      alumniCount > 0
        ? Math.round(((alumniBekerja + alumniKuliah + alumniWirausaha) / alumniCount) * 100)
        : 0;

    // Grade 12-specific metrics
    const k12Bekerja = k12Records.filter(t => t.careerStatus === 'bekerja').length;
    const k12Kuliah = k12Records.filter(t => t.careerStatus === 'kuliah').length;
    const k12Wirausaha = k12Records.filter(t => t.careerStatus === 'wirausaha').length;
    const k12MencariKerja = k12Records.filter(t => t.careerStatus === 'mencari_kerja').length;
    const k12Dpb = grade12Students.filter(s => normalizeTracerMajor(s.majorCode) === 'DPB').length;
    const k12Rpl = grade12Students.filter(s => normalizeTracerMajor(s.majorCode) === 'RPL').length;
    const k12CompletionPct =
      grade12Students.length > 0
        ? Math.min(100, Math.round((grade12Count / grade12Students.length) * 100))
        : grade12Count > 0
        ? 100
        : 0;

    return {
      total,
      alumniCount,
      grade12Count,
      bekerja,
      kuliah,
      wirausaha,
      belumBekerja,
      dpbCount,
      rplCount,
      bmwPct,
      alumniBekerja,
      alumniKuliah,
      alumniWirausaha,
      alumniBelumBekerja,
      alumniDpb,
      alumniRpl,
      alumniBmwPct,
      k12Bekerja,
      k12Kuliah,
      k12Wirausaha,
      k12MencariKerja,
      k12Dpb,
      k12Rpl,
      k12CompletionPct,
    };
  }, [pklTracers, grade12Students]);

  // High-level Read-Only Carousel Data (Alumni & Student Outlines Only — Non-Editable, Non-Deletable)
  const carouselItems = useMemo(() => {
    const tracerOutlines = pklTracers.map(rec => ({
      key: `trc-${rec.id}`,
      category: (rec.respondentCategory === 'kelas_12' ? 'kelas_12' : 'alumni') as AlumniRespondentCategory,
      fullName: rec.fullName,
      majorCode: normalizeTracerMajor(rec.majorCode),
      cohortLabel:
        rec.respondentCategory === 'kelas_12'
          ? rec.className || 'Kelas XII'
          : `Alumni ${rec.graduationYear}`,
      statusLabel: (STATUS_DISPLAY[rec.careerStatus] || STATUS_DISPLAY.belum_bekerja).shortLabel,
      statusBadgeClass: (STATUS_DISPLAY[rec.careerStatus] || STATUS_DISPLAY.belum_bekerja).badgeClass,
      destinationSummary:
        rec.institutionOrCompany && rec.institutionOrCompany !== '-'
          ? rec.institutionOrCompany
          : rec.roleOrStudyProgram && rec.roleOrStudyProgram !== '-'
          ? rec.roleOrStudyProgram
          : 'Menunggu Pemetaan BKK',
      city: rec.city || 'Sukabumi',
    }));

    const existingStudentKeys = new Set(
      pklTracers
        .filter(t => t.studentId)
        .map(t => `${t.studentId}::${t.fullName.trim().toLowerCase()}`)
    );
    const existingNisns = new Set(
      pklTracers.map(t => normalizeIdentityCode(t.nisn)).filter(Boolean)
    );

    const unrecordedStudents = students.filter(
      s =>
        !existingStudentKeys.has(`${s.id}::${s.fullName.trim().toLowerCase()}`) &&
        !existingNisns.has(normalizeIdentityCode(s.nisn))
    );

    // Prioritize Class XII & Graduated students first for clear outlines
    const sortedStudents = [...unrecordedStudents].sort((a, b) => {
      const aScore =
        a.status === 'lulus' || (a.className || '').toUpperCase().startsWith('XII') ? 0 : 1;
      const bScore =
        b.status === 'lulus' || (b.className || '').toUpperCase().startsWith('XII') ? 0 : 1;
      if (aScore !== bScore) return aScore - bScore;
      return a.fullName.localeCompare(b.fullName, 'id');
    });

    const additionalStudentOutlines = sortedStudents.slice(0, 16).map(std => {
      const clsUpper = (std.className || '').trim().toUpperCase();
      const isAlumniStatus = std.status === 'lulus';
      const isActualGrade12 = clsUpper.startsWith('XII') || clsUpper.startsWith('12');
      return {
        key: `std-${std.id}`,
        category: (isAlumniStatus ? 'alumni' : 'kelas_12') as AlumniRespondentCategory,
        fullName: std.fullName,
        majorCode: normalizeTracerMajor(std.majorCode),
        cohortLabel: std.className || (isAlumniStatus ? 'Lulusan ORBITA' : 'Siswa Kelas XII'),
        statusLabel: isAlumniStatus
          ? 'Alumni Terdaftar'
          : isActualGrade12
          ? 'Siswa Kelas XII'
          : `Siswa Aktif (${std.className || 'ORBITA'})`,
        statusBadgeClass: isActualGrade12
          ? 'bg-[#FFE8EF] text-[#D9436D] border border-[#FFC4D4]'
          : 'bg-[#F0EEFA] text-[#6C60B8] border border-[#DDD8F6]',
        destinationSummary: isAlumniStatus
          ? 'Terdata pada Master Alumni Sekolah'
          : 'Belum mengisi rencana pasca lulus',
        city: 'ORBITA Akademi',
      };
    });

    const combined = [...tracerOutlines, ...additionalStudentOutlines];
    const effectiveCategory = effectiveLockedCategory || carouselFilter;
    const categoryScoped =
      effectiveCategory === 'all'
        ? combined
        : combined.filter(item => item.category === effectiveCategory);

    if (effectiveLockedCategory && carouselMajorFilter !== 'ALL') {
      return categoryScoped.filter(item => item.majorCode === carouselMajorFilter);
    }
    return categoryScoped;
  }, [pklTracers, students, carouselFilter, carouselMajorFilter, effectiveLockedCategory]);

  const totalCarouselSlides = Math.max(1, Math.ceil(carouselItems.length / cardsPerSlide));

  useEffect(() => {
    setCarouselPage(0);
  }, [carouselFilter, carouselMajorFilter, cardsPerSlide, effectiveLockedCategory]);

  useEffect(() => {
    if (carouselPage >= totalCarouselSlides) {
      setCarouselPage(Math.max(0, totalCarouselSlides - 1));
    }
  }, [carouselPage, totalCarouselSlides]);

  const carouselSlides = useMemo(() => {
    const slides: (typeof carouselItems)[] = [];
    for (let i = 0; i < carouselItems.length; i += cardsPerSlide) {
      slides.push(carouselItems.slice(i, i + cardsPerSlide));
    }
    return slides;
  }, [carouselItems, cardsPerSlide]);

  // Quick Lookup Matches Scoped to Active Mode (Alumni -> Recorded Alumni, Kelas 12 -> Grade 12 DB)
  const lookupResults = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return { tracers: [] as AlumniTracerRecord[], students: [] as typeof students };

    const tracerPool =
      effectiveLockedCategory === 'alumni'
        ? recordedAlumniTracers
        : effectiveLockedCategory === 'kelas_12'
        ? recordedGrade12Tracers
        : pklTracers;

    const matchedTracers = tracerPool
      .filter(
        t =>
          t.fullName.toLowerCase().includes(q) ||
          (t.nisn || '').toLowerCase().includes(q) ||
          (t.className || '').toLowerCase().includes(q) ||
          (t.graduationYear || '').toLowerCase().includes(q) ||
          (t.institutionOrCompany || '').toLowerCase().includes(q)
      )
      .slice(0, 4);

    const existingStudentIds = new Set(matchedTracers.map(t => t.studentId).filter(Boolean));
    const existingNisns = new Set(
      matchedTracers.map(t => normalizeIdentityCode(t.nisn)).filter(Boolean)
    );

    const studentPool =
      effectiveLockedCategory === 'alumni'
        ? graduatedStudents
        : effectiveLockedCategory === 'kelas_12'
        ? grade12Students
        : [...grade12Students, ...graduatedStudents];

    const matchedStudents = studentPool
      .filter(
        s =>
          !existingStudentIds.has(s.id) &&
          !existingNisns.has(normalizeIdentityCode(s.nisn)) &&
          (s.fullName.toLowerCase().includes(q) ||
            (s.nisn || '').toLowerCase().includes(q) ||
            (s.nis || '').toLowerCase().includes(q) ||
            (s.className || '').toLowerCase().includes(q))
      )
      .slice(0, 4);

    return { tracers: matchedTracers, students: matchedStudents };
  }, [
    lookupQuery,
    effectiveLockedCategory,
    recordedAlumniTracers,
    recordedGrade12Tracers,
    pklTracers,
    graduatedStudents,
    grade12Students,
  ]);

  const applyVerifiedToFormState = (
    verified: VerifiedRespondent,
    chosenCategory: AlumniRespondentCategory,
    existingTracer?: AlumniTracerRecord
  ) => {
    setCategory(chosenCategory);
    setFormError(null);

    if (existingTracer) {
      setEditingRecordId(existingTracer.id);
      setFormState({
        studentId: verified.studentId || existingTracer.studentId || '',
        nisn: existingTracer.nisn || verified.matchedNisn,
        fullName: existingTracer.fullName || verified.fullName,
        className:
          chosenCategory === 'kelas_12'
            ? existingTracer.className || verified.className || grade12Classes[0]?.name || 'XII RPL 1'
            : existingTracer.className || verified.className || '',
        gender: (existingTracer.gender || verified.gender) === 'P' ? 'P' : 'L',
        majorCode: normalizeTracerMajor(existingTracer.majorCode || verified.majorCode),
        graduationYear: existingTracer.graduationYear || defaultGradYear,
        pklPartnerId: existingTracer.pklPartnerId || verified.pklPartnerId || '',
        pklPartnerName: existingTracer.pklPartnerName || verified.pklPartnerName || '',
        careerStatus: existingTracer.careerStatus || 'bekerja',
        institutionOrCompany:
          existingTracer.institutionOrCompany === '-' ? '' : existingTracer.institutionOrCompany || '',
        roleOrStudyProgram:
          existingTracer.roleOrStudyProgram === '-' ? '' : existingTracer.roleOrStudyProgram || '',
        city: existingTracer.city || 'Sukabumi',
        industryRelevance: existingTracer.industryRelevance || 'sangat_sesuai',
        waitingPeriod: existingTracer.waitingPeriod || '< 3 Bulan',
        monthlyIncomeRange: existingTracer.monthlyIncomeRange || '',
        bkkSupportNeed:
          chosenCategory === 'kelas_12'
            ? existingTracer.bkkSupportNeed || BKK_SUPPORT_OPTIONS[0]
            : '',
        targetPlanDate:
          chosenCategory === 'kelas_12'
            ? existingTracer.targetPlanDate || PLAN_TIMELINE_OPTIONS[0]
            : '',
        phone: existingTracer.phone || verified.phone || '',
        email: existingTracer.email || verified.email || '',
        testimonial: existingTracer.testimonial || '',
      });
      return;
    }

    setEditingRecordId(null);
    setFormState({
      studentId: verified.studentId || '',
      nisn: verified.matchedNisn,
      fullName: verified.fullName,
      className:
        chosenCategory === 'kelas_12'
          ? verified.className || grade12Classes[0]?.name || 'XII RPL 1'
          : '',
      gender: verified.gender,
      majorCode: verified.majorCode,
      graduationYear: chosenCategory === 'kelas_12' ? defaultGradYear : '2025',
      pklPartnerId: verified.pklPartnerId || '',
      pklPartnerName: verified.pklPartnerName || '',
      careerStatus: 'bekerja',
      institutionOrCompany: '',
      roleOrStudyProgram: '',
      city: 'Sukabumi',
      industryRelevance: 'sangat_sesuai',
      waitingPeriod: '< 3 Bulan',
      monthlyIncomeRange: '',
      bkkSupportNeed: chosenCategory === 'kelas_12' ? BKK_SUPPORT_OPTIONS[0] : '',
      targetPlanDate: chosenCategory === 'kelas_12' ? PLAN_TIMELINE_OPTIONS[0] : '',
      phone: verified.phone || '',
      email: verified.email || '',
      testimonial: '',
    });
  };

  const handleVerifyNisOrNisn = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    const code = normalizeIdentityCode(nisOrNisnInput);
    if (!code) {
      setVerifyError('Harap masukkan NIS atau NISN siswa / alumni terlebih dahulu.');
      return;
    }

    // 1. Cari di Master Data Siswa ORBITA (berdasarkan NIS atau NISN)
    let matchedStudent = students.find(
      s =>
        normalizeIdentityCode(s.nisn) === code ||
        normalizeIdentityCode(s.nis) === code
    );

    // 2. Cari di Akun Pengguna Siswa ORBITA (berdasarkan nipOrNis)
    const matchedUser = users.find(
      u => u.role === 'siswa' && normalizeIdentityCode(u.nipOrNis) === code
    );

    if (!matchedStudent && matchedUser) {
      const cleanUserName = matchedUser.displayName.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
      matchedStudent = students.find(
        s =>
          normalizeIdentityCode(s.nis) === code ||
          normalizeIdentityCode(s.nisn) === code ||
          s.fullName.trim().toLowerCase() === cleanUserName
      );
    }

    // 3. Cari di Database Tracer Study Alumni & Kelas 12 (pastikan NISN/NIS atau identitas cocok, hindari tabrakan ID berbeda orang)
    const matchedTracer = pklTracers.find(t => {
      const tNisn = normalizeIdentityCode(t.nisn);
      if (tNisn && tNisn === code) return true;
      if (matchedStudent) {
        const sNisn = normalizeIdentityCode(matchedStudent.nisn);
        const sNis = normalizeIdentityCode(matchedStudent.nis);
        if (sNisn && tNisn && tNisn === sNisn) return true;
        if (sNis && tNisn && tNisn === sNis) return true;
        if (
          t.studentId &&
          t.studentId === matchedStudent.id &&
          t.fullName.trim().toLowerCase() === matchedStudent.fullName.trim().toLowerCase()
        ) {
          return true;
        }
      }
      return false;
    });

    // 4. Cross-check Penempatan Mitra PKL DUDI jika sudah ada
    let matchedPlacement: {
      partnerId: string;
      partnerName: string;
      studentId?: string;
      studentName?: string;
      nisn?: string;
      className?: string;
      majorCode?: string;
    } | undefined;

    for (const partner of pklPartners) {
      const pl = (partner.placements || []).find(p => {
        const pNisn = normalizeIdentityCode(p.nisn);
        if (pNisn && pNisn === code) return true;
        if (matchedStudent) {
          const sNisn = normalizeIdentityCode(matchedStudent.nisn);
          if (sNisn && pNisn && pNisn === sNisn) return true;
          if (
            p.studentId === matchedStudent.id &&
            (!p.studentName ||
              p.studentName.trim().toLowerCase() === matchedStudent.fullName.trim().toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      });
      if (pl) {
        matchedPlacement = {
          partnerId: partner.id,
          partnerName: partner.name,
          studentId: pl.studentId,
          studentName: pl.studentName,
          nisn: pl.nisn,
          className: pl.className,
          majorCode: pl.majorCode,
        };
        break;
      }
    }

    if (!matchedStudent && !matchedTracer && !matchedUser) {
      setVerifyError(
        `NIS / NISN "${nisOrNisnInput.trim()}" belum terdaftar di database ORBITA. Pastikan nomor NIS/NISN benar atau sudah diinput pada Master Data Siswa / Tracer Alumni ORBITA.`
      );
      return;
    }

    const sourcesMatched: string[] = [];
    if (matchedStudent) sourcesMatched.push('Master Data Siswa');
    if (matchedTracer) sourcesMatched.push('Database Tracer BKK');
    if (matchedPlacement) sourcesMatched.push('Data Penempatan PKL');
    if (matchedUser) sourcesMatched.push('Akun Pengguna ORBITA');

    const resolvedClassName =
      matchedStudent?.className || matchedTracer?.className || matchedPlacement?.className || matchedUser?.className || '';
    const upperClass = resolvedClassName.trim().toUpperCase();

    const isActiveStudent =
      matchedStudent?.status === 'aktif' ||
      (!matchedStudent && matchedUser?.role === 'siswa');
    const isGrade12Class = upperClass.startsWith('XII') || upperClass.startsWith('12');

    const detectedCategory: AlumniRespondentCategory = lockedCategory
      ? lockedCategory
      : matchedStudent?.status === 'lulus'
      ? 'alumni'
      : isActiveStudent || (matchedStudent && isGrade12Class)
      ? 'kelas_12'
      : matchedTracer
      ? matchedTracer.respondentCategory === 'kelas_12'
        ? 'kelas_12'
        : 'alumni'
      : 'alumni';

    const statusLabel = matchedTracer
      ? detectedCategory === 'kelas_12'
        ? `Siswa Aktif Terdaftar (${resolvedClassName || 'Perencanaan Lulus'})`
        : `Alumni Tercatat (Lulusan ${matchedTracer.graduationYear})`
      : matchedStudent?.status === 'lulus'
      ? 'Alumni Lulusan ORBITA'
      : resolvedClassName
      ? `Siswa Aktif (${resolvedClassName})`
      : detectedCategory === 'alumni'
      ? 'Alumni Terdaftar ORBITA'
      : 'Siswa Aktif ORBITA (Perencanaan Lulus)';

    const verified: VerifiedRespondent = {
      inputCode: code,
      matchedNisn:
        matchedTracer?.nisn ||
        matchedStudent?.nisn ||
        matchedPlacement?.nisn ||
        matchedStudent?.nis ||
        matchedUser?.nipOrNis ||
        code,
      matchedNis: matchedStudent?.nis || matchedUser?.nipOrNis || undefined,
      fullName:
        matchedStudent?.fullName ||
        matchedTracer?.fullName ||
        matchedPlacement?.studentName ||
        matchedUser?.displayName.replace(/\s*\([^)]*\)\s*$/, '') ||
        '',
      studentId: matchedStudent?.id || matchedTracer?.studentId || matchedPlacement?.studentId,
      className: resolvedClassName || undefined,
      majorCode: normalizeTracerMajor(
        matchedStudent?.majorCode || matchedTracer?.majorCode || matchedPlacement?.majorCode
      ),
      gender: (matchedStudent?.gender || matchedTracer?.gender) === 'P' ? 'P' : 'L',
      phone: matchedTracer?.phone || matchedStudent?.phone || matchedUser?.phone || undefined,
      email: matchedTracer?.email || matchedUser?.email || undefined,
      pklPartnerId: matchedTracer?.pklPartnerId || matchedPlacement?.partnerId,
      pklPartnerName: matchedTracer?.pklPartnerName || matchedPlacement?.partnerName,
      detectedCategory,
      statusLabel,
      sourcesMatched,
      tracerRecord: matchedTracer,
    };

    setVerifiedRespondent(verified);
    applyVerifiedToFormState(verified, detectedCategory, matchedTracer);
    onResolvedCategory?.(detectedCategory);
    setStage('intro');
    addToast(
      `NIS/NISN terverifikasi! ${verified.fullName} diarahkan ke ${
        detectedCategory === 'kelas_12' ? 'Halaman Siswa Kelas 12' : 'Halaman Alumni'
      }.`,
      'success'
    );
  };

  const startFreshForm = (chosenCategory: AlumniRespondentCategory) => {
    const resolvedCategory = effectiveLockedCategory || chosenCategory;
    if (verifiedRespondent) {
      applyVerifiedToFormState(
        verifiedRespondent,
        resolvedCategory,
        verifiedRespondent.tracerRecord
      );
      setStage('form');
      return;
    }

    setCategory(resolvedCategory);
    setEditingRecordId(null);
    setFormError(null);
    setFormState({
      studentId: '',
      nisn: '',
      fullName: '',
      className:
        chosenCategory === 'kelas_12' ? grade12Classes[0]?.name || 'XII RPL 1' : '',
      gender: 'L',
      majorCode: 'RPL',
      graduationYear: chosenCategory === 'kelas_12' ? defaultGradYear : '2025',
      pklPartnerId: '',
      pklPartnerName: '',
      careerStatus: 'bekerja',
      institutionOrCompany: '',
      roleOrStudyProgram: '',
      city: 'Sukabumi',
      industryRelevance: 'sangat_sesuai',
      waitingPeriod: '< 3 Bulan',
      monthlyIncomeRange: '',
      bkkSupportNeed: chosenCategory === 'kelas_12' ? BKK_SUPPORT_OPTIONS[0] : '',
      targetPlanDate: chosenCategory === 'kelas_12' ? PLAN_TIMELINE_OPTIONS[0] : '',
      phone: '',
      email: '',
      testimonial: '',
    });
    setStage('form');
  };

  const openFromExistingTracer = (rec: AlumniTracerRecord) => {
    const recCategory: AlumniRespondentCategory =
      rec.respondentCategory === 'kelas_12' ? 'kelas_12' : 'alumni';
    setCategory(recCategory);
    setEditingRecordId(rec.id);
    setFormError(null);
    setFormState({
      studentId: rec.studentId || '',
      nisn: rec.nisn || '',
      fullName: rec.fullName || '',
      className: rec.className || (recCategory === 'kelas_12' ? grade12Classes[0]?.name || 'XII RPL 1' : ''),
      gender: rec.gender === 'P' ? 'P' : 'L',
      majorCode: normalizeTracerMajor(rec.majorCode),
      graduationYear: rec.graduationYear || defaultGradYear,
      pklPartnerId: rec.pklPartnerId || '',
      pklPartnerName: rec.pklPartnerName || '',
      careerStatus: rec.careerStatus || 'bekerja',
      institutionOrCompany: rec.institutionOrCompany === '-' ? '' : rec.institutionOrCompany || '',
      roleOrStudyProgram: rec.roleOrStudyProgram === '-' ? '' : rec.roleOrStudyProgram || '',
      city: rec.city || 'Sukabumi',
      industryRelevance: rec.industryRelevance || 'sesuai',
      waitingPeriod: rec.waitingPeriod || '< 3 Bulan',
      monthlyIncomeRange: rec.monthlyIncomeRange || '',
      bkkSupportNeed: rec.bkkSupportNeed || BKK_SUPPORT_OPTIONS[0],
      targetPlanDate: rec.targetPlanDate || PLAN_TIMELINE_OPTIONS[0],
      phone: rec.phone || '',
      email: rec.email || '',
      testimonial: rec.testimonial || '',
    });
    setStage('form');
  };

  const applyStudentFromDb = (stdId: string, forceCategory?: AlumniRespondentCategory) => {
    const targetCat = forceCategory || category;
    const std = students.find(s => s.id === stdId);
    if (!std) {
      setEditingRecordId(null);
      setFormState(prev => ({ ...prev, studentId: '' }));
      return;
    }

    // Check if this student already has a tracer record matching NISN or exact identity
    const existingTracer = pklTracers.find(
      t =>
        ((std.nisn && normalizeIdentityCode(t.nisn) === normalizeIdentityCode(std.nisn)) ||
          (t.studentId === std.id &&
            t.fullName.trim().toLowerCase() === std.fullName.trim().toLowerCase())) &&
        (t.respondentCategory || 'alumni') === targetCat
    );
    if (existingTracer && !editingRecordId) {
      openFromExistingTracer(existingTracer);
      addToast(
        `Data tracer untuk ${std.fullName} sudah ada di Database — dimuat untuk pembaruan.`,
        'info'
      );
      return;
    }

    const matchedPartner = pklPartners.find(p =>
      (p.placements || []).some(pl => pl.studentId === std.id)
    );
    const stdMajor = normalizeTracerMajor(std.majorCode);

    if (forceCategory) setCategory(forceCategory);
    setEditingRecordId(null);
    setFormState(prev => ({
      ...prev,
      studentId: std.id,
      nisn: std.nisn || prev.nisn,
      fullName: std.fullName,
      className:
        targetCat === 'kelas_12'
          ? std.className || grade12Classes[0]?.name || prev.className || 'XII RPL 1'
          : '',
      graduationYear: targetCat === 'kelas_12' ? defaultGradYear : prev.graduationYear || '2025',
      gender: std.gender === 'P' ? 'P' : 'L',
      majorCode: stdMajor,
      phone: std.phone || prev.phone,
      pklPartnerId: matchedPartner?.id || prev.pklPartnerId,
      pklPartnerName: matchedPartner?.name || prev.pklPartnerName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formState.fullName.trim()) {
      setFormError(
        category === 'kelas_12'
          ? 'Nama lengkap siswa kelas 12 wajib diisi.'
          : 'Nama lengkap alumni wajib diisi.'
      );
      return;
    }

    const isUnemployedOrTraining =
      formState.careerStatus === 'belum_bekerja' || formState.careerStatus === 'mencari_kerja';

    if (!isUnemployedOrTraining && !formState.institutionOrCompany.trim()) {
      setFormError(
        category === 'kelas_12'
          ? 'Harap isi nama Perusahaan / Kampus / Ide Usaha yang menjadi target setelah lulus.'
          : 'Harap isi nama Perusahaan / Kampus / Nama Usaha Anda.'
      );
      return;
    }

    const chosenPartner = pklPartners.find(p => p.id === formState.pklPartnerId);
    const matchedByNisnOrStudent = !editingRecordId
      ? pklTracers.find(
          t =>
            (formState.nisn.trim() &&
              normalizeIdentityCode(t.nisn) === normalizeIdentityCode(formState.nisn)) ||
            (formState.studentId &&
              t.studentId === formState.studentId &&
              t.fullName.trim().toLowerCase() === formState.fullName.trim().toLowerCase())
        )
      : undefined;

    const targetId =
      editingRecordId ||
      matchedByNisnOrStudent?.id ||
      `trc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const payload: AlumniTracerRecord = {
      id: targetId,
      respondentCategory: category,
      studentId: formState.studentId || undefined,
      nisn: formState.nisn.trim() || `00${Date.now().toString().slice(-8)}`,
      fullName: formState.fullName.trim(),
      className: category === 'kelas_12' ? formState.className.trim() || 'XII' : undefined,
      gender: formState.gender,
      majorCode: normalizeTracerMajor(formState.majorCode),
      graduationYear: formState.graduationYear.trim() || defaultGradYear,
      pklPartnerId: formState.pklPartnerId || undefined,
      pklPartnerName: chosenPartner?.name || formState.pklPartnerName || undefined,
      careerStatus: formState.careerStatus,
      institutionOrCompany: formState.institutionOrCompany.trim() || '-',
      roleOrStudyProgram: formState.roleOrStudyProgram.trim() || '-',
      city: formState.city.trim() || 'Sukabumi',
      industryRelevance: formState.industryRelevance,
      waitingPeriod: formState.waitingPeriod,
      monthlyIncomeRange:
        category === 'alumni' ? formState.monthlyIncomeRange.trim() || undefined : undefined,
      bkkSupportNeed:
        category === 'kelas_12' ? formState.bkkSupportNeed.trim() || undefined : undefined,
      targetPlanDate:
        category === 'kelas_12' ? formState.targetPlanDate.trim() || undefined : undefined,
      phone: formState.phone.trim() || undefined,
      email: formState.email.trim() || undefined,
      testimonial: formState.testimonial.trim() || undefined,
      verifiedBySchool: source === 'admin_panel',
      submittedSource: source,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setIsSubmitting(true);
    try {
      const isNew = !editingRecordId && !matchedByNisnOrStudent;
      await savePklTracer(payload, isNew);
      setSavedRecord(payload);
      if (verifiedRespondent) {
        setVerifiedRespondent(prev =>
          prev
            ? {
                ...prev,
                tracerRecord: payload,
                sourcesMatched: prev.sourcesMatched.includes('Database Tracer BKK')
                  ? prev.sourcesMatched
                  : [...prev.sourcesMatched, 'Database Tracer BKK'],
              }
            : null
        );
      }
      setStage('success');
      addToast(
        category === 'kelas_12'
          ? `Rencana pasca lulus ${payload.fullName} berhasil tersinkron ke Database BKK & Admin.`
          : `Data Tracer Study alumni ${payload.fullName} berhasil tersinkron ke Database BKK & Admin.`,
        'success'
      );
      onSuccessSaved?.(payload);
    } catch (err) {
      console.error('Tracer portal save error:', err);
      setFormError(
        'Gagal menyinkronkan data ke Database Cloud. Pastikan koneksi internet stabil lalu coba kembali.'
      );
      addToast('Gagal menyimpan data tracer study ke database.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGrade12 = category === 'kelas_12';
  const isUnemployed =
    formState.careerStatus === 'belum_bekerja' || formState.careerStatus === 'mencari_kerja';

  return (
    <div className="w-full space-y-5">
      {/* ===================================================================== */}
      {/* STAGE 0: VERIFIKASI NIS / NISN SISWA ATAU ALUMNI (GERBANG WAJIB DB)  */}
      {/* ===================================================================== */}
      {stage === 'verify' && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[28px] border border-[#DDD8F6] bg-white/95 backdrop-blur-xl shadow-[0_24px_56px_-12px_rgba(93,81,178,0.22)] overflow-hidden">
            {/* Frosted Violet / Rose Header Strip */}
            <div
              style={{
                background: isLockedGrade12
                  ? 'linear-gradient(135deg, rgba(226, 76, 120, 0.94) 0%, rgba(164, 70, 152, 0.94) 55%, rgba(93, 81, 178, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(114, 102, 196, 0.96) 0%, rgba(93, 81, 178, 0.94) 55%, rgba(75, 63, 160, 0.96) 100%)',
              }}
              className="p-6 sm:p-7 text-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/28 bg-white/15 px-3 py-1 text-[10.5px] font-extrabold tracking-wide">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#FFD1E0]" />
                    <span>
                      {isLockedGrade12
                        ? 'Portal Khusus Siswa Kelas 12 ORBITA'
                        : isLockedAlumni
                        ? 'Portal Khusus Alumni Lulusan ORBITA'
                        : 'Verifikasi Responden Terdaftar ORBITA'}
                    </span>
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {isLockedGrade12
                      ? 'Verifikasi NIS / NISN Siswa Kelas 12'
                      : isLockedAlumni
                      ? 'Verifikasi NIS / NISN Alumni'
                      : 'Verifikasi NIS / NISN Siswa & Alumni'}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed">
                    {isLockedGrade12 ? (
                      <>
                        Masukkan Nomor Induk Siswa (<strong>NIS</strong>) atau <strong>NISN</strong>{' '}
                        siswa <strong>Kelas XII</strong> yang terdaftar di aplikasi ORBITA sebelum
                        masuk ke Halaman Perencanaan Pasca Lulus.
                      </>
                    ) : isLockedAlumni ? (
                      <>
                        Masukkan Nomor Induk Siswa (<strong>NIS</strong>) atau <strong>NISN</strong>{' '}
                        <strong>Alumni</strong> yang telah terdaftar di aplikasi ORBITA sebelum masuk
                        ke Halaman Tracer Study Alumni.
                      </>
                    ) : (
                      <>
                        Masukkan Nomor Induk Siswa (<strong>NIS</strong>) atau <strong>NISN</strong>{' '}
                        yang telah terdaftar di aplikasi ORBITA sebelum masuk ke Portal Pengisian
                        Tracer Study &amp; Perencanaan Lulus.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Real Live DB Counts Strip (Tailored Per Separated Page) */}
              <div className="mt-5 grid grid-cols-3 gap-2.5 tabular-nums">
                {isLockedGrade12 ? (
                  <>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Siswa Kelas XII
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {grade12Students.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Rencana Terinput
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {liveStats.grade12Count}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Mitra DUDI
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {pklPartners.length}
                      </span>
                    </div>
                  </>
                ) : isLockedAlumni ? (
                  <>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Alumni Tercatat
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {liveStats.alumniCount}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Alumni Bekerja
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {liveStats.alumniBekerja}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Mitra DUDI
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {pklPartners.length}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Master Siswa
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {students.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Tracer &amp; Alumni
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {pklTracers.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/22 bg-white/12 px-3 py-2">
                      <span className="block text-[10px] font-semibold text-white/75">
                        Mitra DUDI
                      </span>
                      <span className="mt-0.5 block text-base sm:text-lg font-black text-white">
                        {pklPartners.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyNisOrNisn} className="p-6 sm:p-7 space-y-4">
              {verifyError && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#FFC4D4] bg-[#FFE8EF] px-4 py-3 text-xs font-bold text-[#D9436D] animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#D9436D]" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-extrabold text-[#252042]">
                    {isLockedGrade12
                      ? 'NIS / NISN Siswa Kelas 12 *'
                      : isLockedAlumni
                      ? 'NIS / NISN Alumni *'
                      : 'NIS / NISN Siswa atau Alumni *'}
                  </label>
                  <span className="text-[10.5px] font-semibold text-[#7A7596]">
                    Wajib Terdaftar di ORBITA
                  </span>
                </div>

                <div className="orbita-field-underline relative flex items-center rounded-[18px] bg-[#F4F3FA] border border-[#E2DFF2] focus-within:border-[#6C60B8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6C60B8]/20 px-4 py-1.5 transition-all">
                  <KeyRound className="h-4 w-4 text-[#6C60B8] shrink-0 mr-3" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={nisOrNisnInput}
                    onChange={e => {
                      setNisOrNisnInput(e.target.value);
                      if (verifyError) setVerifyError(null);
                    }}
                    placeholder="Ketik NIS (cth: 24251001) atau NISN (cth: 0061239801)..."
                    className="w-full bg-transparent py-2.5 text-sm font-mono font-bold text-[#252042] placeholder:font-sans placeholder:font-medium placeholder:text-[#9694A8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#ECEAF6] bg-[#FAF9FE] p-3.5 text-[11px] text-[#555070] leading-relaxed">
                Sistem otomatis mencocokkan NIS / NISN Anda ke{' '}
                <strong>
                  {isLockedGrade12
                    ? 'Master Data Siswa Kelas XII'
                    : isLockedAlumni
                    ? 'Database Alumni & Tracer Study'
                    : 'Master Data Siswa'}
                </strong>
                , <strong>Database BKK Sekolah</strong>, serta{' '}
                <strong>Penempatan Mitra PKL</strong> agar profil dan jurusan (DPB/RPL) Anda
                langsung tersinkron tanpa input ganda.
              </div>

              <button
                type="submit"
                style={{
                  background: isLockedGrade12
                    ? 'linear-gradient(135deg, #FF7B9F 0%, #EE4D7A 100%)'
                    : 'linear-gradient(135deg, #7468C4 0%, #5D51B2 100%)',
                  boxShadow: isLockedGrade12
                    ? '0 14px 28px -6px rgba(242, 87, 129, 0.38)'
                    : '0 14px 28px -6px rgba(108, 96, 184, 0.42)',
                }}
                className="group flex w-full items-center justify-between rounded-[18px] px-5 py-3.5 text-xs sm:text-sm font-extrabold text-white transition-all cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>
                    {isLockedGrade12
                      ? 'Verifikasi NIS / NISN & Masuk Halaman Kelas 12'
                      : isLockedAlumni
                      ? 'Verifikasi NIS / NISN & Masuk Halaman Alumni'
                      : 'Verifikasi NIS / NISN & Lanjut ke Portal'}
                  </span>
                </span>
                <ChevronRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 1: HALAMAN PORTAL TERPISAH (ALUMNI VS SISWA KELAS 12)           */}
      {/* ===================================================================== */}
      {stage === 'intro' && (
        <div className="space-y-5">
          {/* Header Banner with Frosted Glass Tailored to Active Page */}
          <div
            style={{
              background: isLockedGrade12
                ? 'linear-gradient(135deg, rgba(226, 76, 120, 0.94) 0%, rgba(164, 70, 152, 0.92) 55%, rgba(93, 81, 178, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(114, 102, 196, 0.94) 0%, rgba(93, 81, 178, 0.92) 55%, rgba(75, 63, 160, 0.94) 100%)',
              boxShadow: isLockedGrade12
                ? '0 20px 44px -10px rgba(226, 76, 120, 0.34)'
                : '0 20px 44px -10px rgba(84, 70, 172, 0.36)',
            }}
            className="relative overflow-hidden rounded-[26px] border border-white/30 p-5 sm:p-7 text-white backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10.5px] font-extrabold tracking-wide">
                  <OrbitaMenuIcon
                    variant={isLockedGrade12 ? 'students' : 'master-data'}
                    className="h-3.5 w-3.5 text-[#FFD1E0]"
                  />
                  <span>
                    {isLockedGrade12
                      ? 'Halaman Khusus Siswa Kelas 12 · Tersinkron Real-Time Database BKK'
                      : isLockedAlumni
                      ? 'Halaman Khusus Alumni Lulusan · Tersinkron Real-Time Database BKK'
                      : 'Tersinkron Real-Time dengan Database BKK & Menu Admin PKL'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isLockedGrade12
                    ? 'Halaman Perencanaan Pasca Lulus (Siswa Kelas 12)'
                    : isLockedAlumni
                    ? 'Halaman Tracer Study Alumni (Lulusan ORBITA)'
                    : 'Portal Pengisian Tracer Study & Perencanaan Lulus'}
                </h2>
                <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed">
                  {isLockedGrade12
                    ? 'Halaman khusus siswa Kelas XII jurusan DPB & RPL untuk memetakan rencana kerja industri (DUDI), lanjut kuliah, wirausaha, serta kebutuhan bimbingan karir dari BKK.'
                    : isLockedAlumni
                    ? 'Halaman khusus lulusan alumni jurusan DPB & RPL untuk melaporkan jejak karier terkini, perguruan tinggi, wirausaha mandiri, serta umpan balik kurikulum sekolah.'
                    : 'Pilih kategori formulir sebelum mengisi. Seluruh data alumni (DPB & RPL) serta rencana karir siswa Kelas XII setelah lulus langsung masuk ke database resmi sekolah untuk pemetaan BKK & penyaluran industri.'}
                </p>
              </div>

              {!hideOuterBackButton && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-white/35 bg-white/15 hover:bg-white/25 px-4 text-xs font-extrabold text-white transition-all cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>Kembali ke Login</span>
                </button>
              )}
            </div>

            {/* Live Database Telemetry Strip (Separated Per Page) */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
              {isLockedAlumni ? (
                <>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Total Alumni di DB
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.alumniCount}{' '}
                      <span className="text-[11px] font-bold text-white/80">Alumni</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#FFD1E0]">
                      DPB {liveStats.alumniDpb} &middot; RPL {liveStats.alumniRpl}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Alumni Bekerja (DUDI)
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.alumniBekerja}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-200">
                      {liveStats.alumniBelumBekerja} Belum Bekerja
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Kuliah &amp; Wirausaha
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.alumniKuliah + liveStats.alumniWirausaha}
                    </span>
                    <span className="text-[10px] font-bold text-white/85">
                      {liveStats.alumniKuliah} Kuliah &middot; {liveStats.alumniWirausaha} Usaha
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Serapan BMW Alumni
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.alumniBmwPct}%
                    </span>
                    <span className="text-[10px] font-bold text-white/85">
                      {pklPartners.length} Mitra Industri DUDI
                    </span>
                  </div>
                </>
              ) : isLockedGrade12 ? (
                <>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Siswa Kelas XII di DB
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {grade12Students.length}{' '}
                      <span className="text-[11px] font-bold text-white/80">Siswa</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#FFD1E0]">
                      DPB {liveStats.k12Dpb} &middot; RPL {liveStats.k12Rpl}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Rencana Terinput
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.grade12Count}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-200">
                      Progres {liveStats.k12CompletionPct}% kelas XII
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Target Kerja &amp; Kuliah
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.k12Bekerja + liveStats.k12Kuliah}
                    </span>
                    <span className="text-[10px] font-bold text-white/85">
                      {liveStats.k12Bekerja} DUDI &middot; {liveStats.k12Kuliah} Kuliah
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Wirausaha &amp; BKK
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.k12Wirausaha + liveStats.k12MencariKerja}
                    </span>
                    <span className="text-[10px] font-bold text-white/85">
                      Target Lulus {defaultGradYear}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Total Tercatat di DB
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.total}{' '}
                      <span className="text-[11px] font-bold text-white/80">Catatan</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#FFD1E0]">
                      DPB {liveStats.dpbCount} &middot; RPL {liveStats.rplCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Tracer Alumni Lulusan
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.alumniCount}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-200">
                      {liveStats.bekerja} Bekerja &middot; {liveStats.belumBekerja} Belum Bekerja
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Perencanaan Kelas 12
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.grade12Count}
                    </span>
                    <span className="text-[10px] font-bold text-white/85">
                      {grade12Students.length} Siswa XII terdaftar
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/25 bg-white/12 px-3.5 py-2.5 backdrop-blur-md">
                    <span className="block text-[10px] font-semibold text-white/75">
                      Serapan BMW &amp; Mitra
                    </span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-black text-white leading-tight">
                      {liveStats.bmwPct}%
                    </span>
                    <span className="text-[10px] font-bold text-white/85">
                      {pklPartners.length} Mitra Industri DUDI
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Verified ORBITA Identity Sync Card (After NIS/NISN Verification — No Ganti NIS Allowed) */}
          {verifiedRespondent ? (
            <div className="rounded-[24px] border border-[#BCEAD1] bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-[0_12px_30px_-8px_rgba(19,154,76,0.12)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#E7F9EF] border border-[#BCEAD1] text-[#139A4C]">
                    <OrbitaMenuIcon variant="audit-logs" className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#139A4C] px-2 py-0.5 text-[10px] font-extrabold text-white">
                        TERVERIFIKASI ORBITA
                      </span>
                      <span className="text-[11px] font-bold text-[#2E6F50]">
                        {verifiedRespondent.statusLabel}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-[#252042] truncate">
                      {verifiedRespondent.fullName}
                    </h3>
                    <p className="text-[11px] font-semibold text-[#555070]">
                      NISN <span className="font-mono">{verifiedRespondent.matchedNisn}</span>
                      {verifiedRespondent.matchedNis ? (
                        <>
                          {' '}
                          &middot; NIS <span className="font-mono">{verifiedRespondent.matchedNis}</span>
                        </>
                      ) : null}{' '}
                      {verifiedRespondent.detectedCategory === 'kelas_12' &&
                      verifiedRespondent.className
                        ? ` · Kelas ${verifiedRespondent.className}`
                        : verifiedRespondent.tracerRecord?.graduationYear
                        ? ` · Alumni ${verifiedRespondent.tracerRecord.graduationYear}`
                        : ''}
                      {' · '}Jurusan <strong>{verifiedRespondent.majorCode}</strong>
                      {verifiedRespondent.pklPartnerName
                        ? ` · PKL: ${verifiedRespondent.pklPartnerName}`
                        : ''}
                    </p>
                    <p className="text-[10.5px] font-medium text-[#7A7596]">
                      Sumber sinkronisasi: {verifiedRespondent.sourcesMatched.join(' · ')}
                      {verifiedRespondent.tracerRecord
                        ? ` · Tercatat: ${
                            (
                              STATUS_DISPLAY[verifiedRespondent.tracerRecord.careerStatus] ||
                              STATUS_DISPLAY.belum_bekerja
                            ).shortLabel
                          }`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#BCEAD1] bg-[#E7F9EF]/70 px-3 py-1.5 text-[11px] font-extrabold text-[#139A4C] shrink-0 self-start sm:self-center">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Identitas NIS/NISN Terkunci</span>
                </div>
              </div>
            </div>
          ) : (
            /* Quick Search / Autofill Lookup from Live Database (Scoped to Active Form Mode) */
            <div className="rounded-[24px] border border-[#E6E4F2] bg-white/92 backdrop-blur-xl p-4 sm:p-5 shadow-[0_12px_30px_-8px_rgba(108,96,184,0.12)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#3E385B]">
                    {isLockedGrade12
                      ? 'Cari Data Siswa Kelas 12 di Database ORBITA (Opsional)'
                      : isLockedAlumni
                      ? 'Cari Data Alumni yang Sudah Terdata di Database (Opsional)'
                      : 'Cari Data Alumni Terdata atau Siswa Kelas 12 (Opsional)'}
                  </h3>
                  <p className="text-[11px] text-[#7A7596]">
                    {isLockedGrade12
                      ? 'Ketik Nama, NISN, atau Kelas XII untuk mengisi otomatis profil siswa Kelas 12 agar tidak ganda.'
                      : isLockedAlumni
                      ? 'Ketik Nama, NISN, atau Tahun Lulus untuk memuat & memperbarui data alumni yang sudah tercatat.'
                      : 'Ketik Nama atau NISN untuk mengisi otomatis dari Data Alumni Terdata atau Master Siswa Kelas 12.'}
                  </p>
                </div>
              </div>

              <div className="orbita-searchbar orbita-field-underline relative flex items-center rounded-2xl border border-[#DFDCF2] bg-[#FAF9FE] px-3.5 py-1 focus-within:border-[#6C60B8] focus-within:bg-white transition-all">
                <Search className="h-4 w-4 text-[#6C60B8] shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={e => setLookupQuery(e.target.value)}
                  placeholder={
                    isLockedGrade12
                      ? 'Cari Nama Siswa Kelas 12, NISN, atau Kelas (contoh: XII TKJ 1)...'
                      : isLockedAlumni
                      ? 'Cari Nama Alumni Terdata, NISN, atau Tahun Lulus (contoh: 2025)...'
                      : 'Cari Nama Lengkap, NISN, Tahun Lulus, atau Kelas...'
                  }
                  className="w-full bg-transparent py-2 text-xs font-semibold text-[#3E385B] placeholder:text-[#9694A8] focus:outline-none"
                />
                {lookupQuery && (
                  <button
                    type="button"
                    onClick={() => setLookupQuery('')}
                    className="text-[11px] font-bold text-[#6C60B8] hover:underline px-2 cursor-pointer"
                  >
                    Bersihkan
                  </button>
                )}
              </div>

              {lookupQuery.trim() && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {lookupResults.tracers.map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => openFromExistingTracer(rec)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#DDD8F6] bg-[#F7F5FD] hover:bg-[#EFEBFB] p-3 text-left transition-all cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-[#6C60B8] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                            {rec.respondentCategory === 'kelas_12' ? 'KELAS 12' : 'ALUMNI TERDATA'}
                          </span>
                          <span className="truncate text-xs font-extrabold text-[#252042]">
                            {rec.fullName}
                          </span>
                        </div>
                        <p className="mt-1 text-[10.5px] text-[#6E6A86] truncate">
                          NISN {rec.nisn} &middot; {normalizeTracerMajor(rec.majorCode)} &middot;{' '}
                          {rec.respondentCategory === 'kelas_12'
                            ? rec.className || 'Kelas XII'
                            : `Lulus ${rec.graduationYear}`}{' '}
                          &middot; {STATUS_DISPLAY[rec.careerStatus]?.shortLabel || rec.careerStatus}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-[#6C60B8] shadow-2xs shrink-0">
                        <Edit className="h-3 w-3" />
                        Perbarui
                      </span>
                    </button>
                  ))}

                  {lookupResults.students.map(std => {
                    const targetCat: AlumniRespondentCategory =
                      std.status === 'lulus' ? 'alumni' : 'kelas_12';
                    return (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => {
                          startFreshForm(targetCat);
                          applyStudentFromDb(std.id, targetCat);
                        }}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 p-3 text-left transition-all cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md bg-[#139A4C] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                              {targetCat === 'alumni' ? 'LULUSAN DB' : 'SISWA KELAS 12'}
                            </span>
                            <span className="truncate text-xs font-extrabold text-[#252042]">
                              {std.fullName}
                            </span>
                          </div>
                          <p className="mt-1 text-[10.5px] text-[#2E6F50] truncate">
                            {std.className} &middot; {normalizeTracerMajor(std.majorCode)} &middot; NISN{' '}
                            {std.nisn}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-[#139A4C] shadow-2xs shrink-0">
                          <Plus className="h-3 w-3" />
                          Isi Otomatis
                        </span>
                      </button>
                    );
                  })}

                  {lookupResults.tracers.length === 0 && lookupResults.students.length === 0 && (
                    <div className="sm:col-span-2 rounded-xl border border-dashed border-[#DFDCF2] bg-[#FAF9FE] px-4 py-3 text-center text-xs text-[#7A7596]">
                      Tidak ditemukan data yang cocok. Klik kartu formulir di bawah untuk melanjutkan pengisian.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dedicated Form Launch Card(s): Strictly Separated when effectiveLockedCategory is set */}
          <div className={`grid grid-cols-1 ${effectiveLockedCategory ? '' : 'md:grid-cols-2'} gap-5`}>
            {/* Card 1: Formulir Alumni */}
            {(!effectiveLockedCategory || isLockedAlumni) && (
              <div className="group flex flex-col justify-between rounded-[26px] border border-[#DDD8F6] bg-white/95 p-5 sm:p-6 shadow-[0_16px_38px_-10px_rgba(108,96,184,0.16)] backdrop-blur-xl transition-all hover:border-[#6C60B8]/50">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#7468C4] to-[#5D51B2] text-white shadow-[0_8px_20px_rgba(108,96,184,0.34)]">
                      <GenshinElementIcon element="geo" className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#F0EEFA] border border-[#DDD8F6] px-3 py-1 text-[10.5px] font-extrabold text-[#6C60B8]">
                      {recordedAlumniTracers.length + graduatedStudents.length} Alumni Terdata
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#252042]">
                      Formulir Tracer Study Alumni
                    </h3>
                    <p className="mt-1 text-xs text-[#6E6A86] leading-relaxed">
                      Disesuaikan dengan <strong>{recordedAlumniTracers.length} data alumni</strong>{' '}
                      yang sudah terdata di database BKK ORBITA (jurusan DPB &amp; RPL) untuk
                      memperbarui jejak karier, kuliah, atau wirausaha terkini.
                    </p>
                  </div>

                  <ul
                    className={`grid grid-cols-1 ${
                      isLockedAlumni ? 'sm:grid-cols-3 gap-2.5' : 'gap-1.5'
                    } text-[11.5px] font-semibold text-[#4A4368] bg-[#FAF9FE] rounded-2xl p-3.5 border border-[#ECEAF6]`}
                  >
                    <li className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-[#139A4C] shrink-0" />
                      <span>Tersinkron dengan {recordedAlumniTracers.length} profil alumni di DB</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-[#6C60B8] shrink-0" />
                      <span>Riwayat Mitra PKL DUDI ({pklPartners.length} mitra dari DB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Masa tunggu, relevansi jurusan &amp; testimoni alumni</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => startFreshForm('alumni')}
                  style={{
                    background: 'linear-gradient(135deg, #7468C4 0%, #5D51B2 100%)',
                    boxShadow: '0 12px 24px -6px rgba(108, 96, 184, 0.40)',
                  }}
                  className="mt-5 flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-xs sm:text-sm font-extrabold text-white transition-all cursor-pointer"
                >
                  <span>Mulai Isi Form Alumni</span>
                  <ChevronRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {/* Card 2: Formulir Siswa Kelas 12 */}
            {(!effectiveLockedCategory || isLockedGrade12) && (
              <div className="group flex flex-col justify-between rounded-[26px] border border-[#FFD1DF] bg-white/95 p-5 sm:p-6 shadow-[0_16px_38px_-10px_rgba(248,101,142,0.16)] backdrop-blur-xl transition-all hover:border-[#F8658E]/60">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#FF88A8] to-[#F25781] text-white shadow-[0_8px_20px_rgba(242,87,129,0.34)]">
                      <GenshinElementIcon element="electro" className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#FFE8EF] border border-[#FFC4D4] px-3 py-1 text-[10.5px] font-extrabold text-[#D9436D]">
                      {liveStats.grade12Count} Rencana Kelas 12
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#252042]">
                      Formulir Siswa Kelas 12 (Rencana Lulus)
                    </h3>
                    <p className="mt-1 text-xs text-[#6E6A86] leading-relaxed">
                      Khusus siswa tingkat akhir <strong>Kelas XII (DPB &amp; RPL)</strong> untuk
                      memetakan rencana karir/kuliah setelah lulus &amp; kebutuhan bimbingan BKK.
                    </p>
                  </div>

                  <ul
                    className={`grid grid-cols-1 ${
                      isLockedGrade12 ? 'sm:grid-cols-3 gap-2.5' : 'gap-1.5'
                    } text-[11.5px] font-semibold text-[#4A4368] bg-[#FFF8FA] rounded-2xl p-3.5 border border-[#FFE1EB]`}
                  >
                    <li className="flex items-center gap-2">
                      <OrbitaMenuIcon
                        variant="user-management"
                        className="h-3.5 w-3.5 text-[#F25781] shrink-0"
                      />
                      <span>Tersinkron otomatis dengan {grade12Students.length} data siswa XII di DB</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <OrbitaMenuIcon variant="reports" className="h-3.5 w-3.5 text-[#6C60B8] shrink-0" />
                      <span>Target perusahaan, kampus impian, atau rencana wirausaha</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <OrbitaMenuIcon variant="grading" className="h-3.5 w-3.5 text-[#139A4C] shrink-0" />
                      <span>Pemetaan kebutuhan pendampingan BKK / Guru BK sekolah</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => startFreshForm('kelas_12')}
                  style={{
                    background: 'linear-gradient(135deg, #FF7B9F 0%, #EE4D7A 100%)',
                    boxShadow: '0 12px 24px -6px rgba(242, 87, 129, 0.38)',
                  }}
                  className="mt-5 flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-xs sm:text-sm font-extrabold text-white transition-all cursor-pointer"
                >
                  <span>Mulai Isi Form Siswa Kelas 12</span>
                  <ChevronRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Read-Only Carousel: High-Level Overview of Separated Alumni OR Grade 12 Records */}
          {carouselItems.length > 0 && (
            <div className="rounded-[26px] border border-[#E6E4F2] bg-white/92 p-4 sm:p-5 backdrop-blur-xl shadow-[0_14px_34px_-10px_rgba(108,96,184,0.12)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                      isLockedGrade12
                        ? 'bg-[#FFE8EF] border border-[#FFC4D4] text-[#D9436D]'
                        : 'bg-[#F0EEFA] border border-[#DDD8F6] text-[#6C60B8]'
                    }`}
                  >
                    <OrbitaMenuIcon
                      variant={isLockedGrade12 ? 'students' : 'pkl'}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-[#252042] truncate">
                      {isLockedGrade12
                        ? `Garis Besar Data Siswa Kelas 12 (${carouselItems.length} Profil)`
                        : isLockedAlumni
                        ? `Garis Besar Data Alumni (${carouselItems.length} Profil)`
                        : `Garis Besar Data Siswa & Alumni (${carouselItems.length} Profil)`}
                    </h4>
                    <p className="text-[10.5px] font-medium text-[#7A7596]">
                      Tampilan ringkas baca-saja (read-only) tersinkron dengan Database BKK ORBITA
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {effectiveLockedCategory ? (
                    <LiquidNavBar
                      size="sm"
                      pill
                      ariaLabel="Filter Jurusan Carousel"
                      activeId={carouselMajorFilter}
                      onSelect={id => setCarouselMajorFilter(id as 'ALL' | 'DPB' | 'RPL')}
                      items={[
                        { id: 'ALL', label: 'Semua' },
                        { id: 'DPB', label: 'DPB' },
                        { id: 'RPL', label: 'RPL' },
                      ]}
                    />
                  ) : (
                    <LiquidNavBar
                      size="sm"
                      pill
                      ariaLabel="Filter Carousel Data Siswa & Alumni"
                      activeId={carouselFilter}
                      onSelect={id => setCarouselFilter(id as 'all' | 'alumni' | 'kelas_12')}
                      items={[
                        { id: 'all', label: 'Semua' },
                        { id: 'alumni', label: 'Alumni' },
                        { id: 'kelas_12', label: 'Kelas 12' },
                      ]}
                    />
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCarouselPage(p => Math.max(0, p - 1))}
                      disabled={carouselPage === 0}
                      aria-label="Slide Sebelumnya"
                      className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[#DDD8F6] bg-[#FAF9FE] hover:bg-[#EFEBFB] text-[#5D51B2] disabled:opacity-40 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[44px] text-center text-[11px] font-extrabold text-[#3E385B] tabular-nums">
                      {carouselPage + 1} / {totalCarouselSlides}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCarouselPage(p => Math.min(totalCarouselSlides - 1, p + 1))
                      }
                      disabled={carouselPage >= totalCarouselSlides - 1}
                      aria-label="Slide Berikutnya"
                      className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[#DDD8F6] bg-[#FAF9FE] hover:bg-[#EFEBFB] text-[#5D51B2] disabled:opacity-40 cursor-pointer transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Carousel Sliding Viewport */}
              <div
                className="overflow-hidden rounded-2xl"
                onTouchStart={e => {
                  touchStartXRef.current = e.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={e => {
                  if (touchStartXRef.current === null) return;
                  const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
                  const delta = endX - touchStartXRef.current;
                  touchStartXRef.current = null;
                  if (delta > 45) {
                    setCarouselPage(p => Math.max(0, p - 1));
                  } else if (delta < -45) {
                    setCarouselPage(p => Math.min(totalCarouselSlides - 1, p + 1));
                  }
                }}
              >
                <div
                  style={{ transform: `translateX(-${carouselPage * 100}%)` }}
                  className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  {carouselSlides.map((slideCards, sIdx) => (
                    <div
                      key={`slide-${sIdx}`}
                      className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      {slideCards.map((item, cIdx) => {
                        const isK12 = item.category === 'kelas_12';
                        return (
                          <div
                            key={item.key}
                            className="flex flex-col justify-between gap-2.5 rounded-[20px] border border-[#E6E4F2] bg-[#FAF9FE] p-3.5 text-left select-none"
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${
                                    isK12
                                      ? 'bg-[#FFE8EF] text-[#D9436D] border border-[#FFC4D4]'
                                      : 'bg-[#F0EEFA] text-[#6C60B8] border border-[#DDD8F6]'
                                  }`}
                                >
                                  <GenshinElementIcon
                                    element={cIdx % 2 === 0 ? 'dendro' : 'cryo'}
                                    className="h-4.5 w-4.5"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="block truncate text-xs font-extrabold text-[#252042]">
                                    {item.fullName}
                                  </span>
                                  <span className="block truncate text-[10.5px] font-semibold text-[#7A7596]">
                                    {item.cohortLabel} &middot; {item.majorCode}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`rounded-lg px-2 py-0.5 text-[9.5px] font-extrabold shrink-0 ${
                                  isK12
                                    ? 'bg-[#FFE8EF] text-[#D9436D]'
                                    : 'bg-[#F0EEFA] text-[#6C60B8]'
                                }`}
                              >
                                {isK12 ? 'Kelas 12' : 'Alumni'}
                              </span>
                            </div>

                            <div className="rounded-xl border border-[#ECEAF6] bg-white px-3 py-2 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-semibold text-[#7A7596]">
                                  Garis Besar Status
                                </span>
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-bold shrink-0 ${item.statusBadgeClass}`}
                                >
                                  {item.statusLabel}
                                </span>
                              </div>
                              <p className="truncate text-[11px] font-bold text-[#3E385B]">
                                {item.destinationSummary}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-semibold text-[#8A85A6]">
                              <span className="inline-flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0 text-[#6C60B8]" />
                                <span className="truncate">{item.city}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-[#7A7596] shrink-0">
                                <Lock className="h-2.5 w-2.5" />
                                <span>Baca Saja</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Slide Indicator Bars */}
              {totalCarouselSlides > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {Array.from({ length: totalCarouselSlides }).map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      onClick={() => setCarouselPage(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === carouselPage
                          ? 'w-7 bg-gradient-to-r from-[#7468C4] to-[#FF7597]'
                          : 'w-2 bg-[#DCD8EE] hover:bg-[#BEB7DF]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 2: FORM PENGISIAN TAILORED (ALUMNI VS SISWA KELAS 12)           */}
      {/* ===================================================================== */}
      {stage === 'form' && (
        <div className="rounded-[28px] border border-[#E6E4F2] bg-white/94 p-5 sm:p-7 shadow-[0_22px_50px_-10px_rgba(108,96,184,0.18)] backdrop-blur-xl space-y-5">
          {/* Top Bar: Back to Pre-Form UI + Category Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#ECEAF6]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFormBackConfirm(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] hover:bg-[#EAE7F8] px-3 text-xs font-extrabold text-[#6C60B8] cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Pilihan Form</span>
              </button>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#252042]">
                  {editingRecordId
                    ? isGrade12
                      ? 'Perbarui Rencana Pasca Lulus Kelas 12'
                      : 'Perbarui Data Tracer Study Alumni'
                    : isGrade12
                    ? 'Form Perencanaan Setelah Lulus (Siswa Kelas 12)'
                    : 'Form Tracer Study Alumni (Lulusan)'}
                </h3>
                <p className="text-[11px] text-[#7A7596]">
                  Tersimpan otomatis ke Cloud Database &amp; Menu Admin PKL &rarr; Tracer Study
                </p>
              </div>
            </div>

            {effectiveLockedCategory ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold shrink-0 ${
                  isLockedGrade12
                    ? 'border border-[#FFC4D4] bg-[#FFE8EF] text-[#D9436D]'
                    : 'border border-[#DDD8F6] bg-[#F0EEFA] text-[#5D51B2]'
                }`}
              >
                <GenshinElementIcon
                  element={isLockedGrade12 ? 'electro' : 'geo'}
                  className="h-3.5 w-3.5"
                />
                <span>
                  {isLockedGrade12 ? 'Khusus Halaman Siswa Kelas 12' : 'Khusus Halaman Alumni'}
                </span>
              </span>
            ) : (
              <LiquidNavBar
                size="sm"
                pill
                ariaLabel="Pilih Kategori Responden"
                activeId={category}
                onSelect={id => {
                  const nextCat = id as AlumniRespondentCategory;
                  setCategory(nextCat);
                  if (nextCat === 'kelas_12' && !formState.className) {
                    setFormState(p => ({
                      ...p,
                      className: grade12Classes[0]?.name || 'XII RPL 1',
                      graduationYear: defaultGradYear,
                      bkkSupportNeed: p.bkkSupportNeed || BKK_SUPPORT_OPTIONS[0],
                      targetPlanDate: p.targetPlanDate || PLAN_TIMELINE_OPTIONS[0],
                    }));
                  }
                }}
                items={[
                  {
                    id: 'alumni',
                    label: 'Alumni',
                    icon: <GenshinElementIcon element="geo" className="h-3.5 w-3.5" />,
                  },
                  {
                    id: 'kelas_12',
                    label: 'Siswa Kelas 12',
                    icon: <GenshinElementIcon element="electro" className="h-3.5 w-3.5" />,
                  },
                ]}
              />
            )}
          </div>

          {formError && (
            <div className="rounded-2xl border border-[#FFC4D4] bg-[#FFE8EF] px-4 py-3 text-xs font-bold text-[#D9436D]">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Verified Identity Strip (Locked to Verified NIS/NISN, No Ganti NIS) or Tailored DB Prefill Selector */}
            {verifiedRespondent ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#BCEAD1] bg-[#F3FCF7] px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCheck className="h-4.5 w-4.5 text-[#139A4C] shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[11px] font-extrabold text-[#139A4C]">
                      {isGrade12
                        ? 'Terverifikasi Data Siswa Kelas 12 ORBITA'
                        : 'Terverifikasi Data Alumni Terdata ORBITA'}
                    </span>
                    <span className="block truncate text-[11px] font-semibold text-[#2E6F50]">
                      {verifiedRespondent.fullName} &middot; NISN {verifiedRespondent.matchedNisn}
                      {verifiedRespondent.matchedNis ? ` · NIS ${verifiedRespondent.matchedNis}` : ''}
                      {isGrade12 && verifiedRespondent.className
                        ? ` · ${verifiedRespondent.className}`
                        : !isGrade12 && verifiedRespondent.tracerRecord?.graduationYear
                        ? ` · Alumni ${verifiedRespondent.tracerRecord.graduationYear}`
                        : ''}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-xl border border-[#BCEAD1] bg-white px-2.5 py-1 text-[10.5px] font-bold text-[#139A4C] shrink-0">
                  <Lock className="h-3 w-3" />
                  <span>NISN Terkunci</span>
                </span>
              </div>
            ) : isGrade12 && grade12Students.length > 0 ? (
              <div className="rounded-2xl border border-[#FFD1DF] bg-[#FFF7FA] p-3.5">
                <label className="block text-[11px] font-extrabold mb-1.5 text-[#C2325C]">
                  Pilih Nama dari Data Siswa Kelas 12 di Database (Isi Otomatis NISN, Kelas XII &amp; Mitra PKL)
                </label>
                <div className="orbita-field-underline rounded-xl border border-white/80 bg-white px-3 py-0.5 shadow-2xs">
                  <select
                    value={formState.studentId}
                    onChange={e => applyStudentFromDb(e.target.value, 'kelas_12')}
                    className="w-full bg-transparent py-2 text-xs font-bold text-[#252042] focus:outline-none cursor-pointer"
                  >
                    <option value="">
                      -- Pilih Siswa Kelas 12 atau Ketik Manual di Bawah --
                    </option>
                    {grade12Students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.className} - {normalizeTracerMajor(s.majorCode)}) &middot; NISN{' '}
                        {s.nisn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : !isGrade12 && (recordedAlumniTracers.length > 0 || graduatedStudents.length > 0) ? (
              <div className="rounded-2xl border border-[#DDD8F6] bg-[#F7F5FD] p-3.5">
                <label className="block text-[11px] font-extrabold mb-1.5 text-[#5D51B2]">
                  Pilih dari Data Alumni yang Sudah Terdata di Database (Isi Otomatis / Perbarui Data)
                </label>
                <div className="orbita-field-underline rounded-xl border border-white/80 bg-white px-3 py-0.5 shadow-2xs">
                  <select
                    value={
                      editingRecordId && recordedAlumniTracers.some(r => r.id === editingRecordId)
                        ? `trc:${editingRecordId}`
                        : formState.studentId &&
                          graduatedStudents.some(s => s.id === formState.studentId)
                        ? `std:${formState.studentId}`
                        : ''
                    }
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) {
                        startFreshForm('alumni');
                        return;
                      }
                      if (val.startsWith('trc:')) {
                        const found = recordedAlumniTracers.find(r => r.id === val.slice(4));
                        if (found) openFromExistingTracer(found);
                      } else if (val.startsWith('std:')) {
                        applyStudentFromDb(val.slice(4), 'alumni');
                      }
                    }}
                    className="w-full bg-transparent py-2 text-xs font-bold text-[#252042] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Input Manual Alumni Baru --</option>
                    {recordedAlumniTracers.map(rec => (
                      <option key={`trc-${rec.id}`} value={`trc:${rec.id}`}>
                        [Alumni Terdata] {rec.fullName} &middot; Lulusan {rec.graduationYear} (
                        {normalizeTracerMajor(rec.majorCode)}) &middot; NISN {rec.nisn}
                      </option>
                    ))}
                    {graduatedStudents.map(s => (
                      <option key={`std-${s.id}`} value={`std:${s.id}`}>
                        [Lulusan DB] {s.fullName} ({s.className} - {normalizeTracerMajor(s.majorCode)})
                        &middot; NISN {s.nisn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {/* Section A: Identitas Responden */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6C60B8]">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#6C60B8] text-white text-[10px]">
                  1
                </span>
                <span>{isGrade12 ? 'Identitas Siswa Kelas 12' : 'Identitas Alumni'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    {isGrade12 ? 'Nama Lengkap Siswa *' : 'Nama Lengkap Alumni *'}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                    <input
                      type="text"
                      required
                      placeholder={
                        isGrade12 ? 'Contoh: Nabila Putri Lestari' : 'Contoh: Aditya Pratama'
                      }
                      value={formState.fullName}
                      onChange={e => setFormState(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full bg-transparent py-2.5 text-xs font-bold text-[#252042] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    NISN {verifiedRespondent ? '(Terkunci Terverifikasi)' : ''}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                    <input
                      type="text"
                      readOnly={Boolean(verifiedRespondent)}
                      placeholder="0061239801"
                      value={formState.nisn}
                      onChange={e => {
                        if (!verifiedRespondent) {
                          setFormState(p => ({ ...p, nisn: e.target.value }));
                        }
                      }}
                      className={`w-full bg-transparent py-2.5 text-xs font-mono font-semibold focus:outline-none ${
                        verifiedRespondent ? 'text-[#5D51B2] cursor-not-allowed' : 'text-[#252042]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-[#3E385B] mb-1">L/P</label>
                    <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-2">
                      <select
                        value={formState.gender}
                        onChange={e =>
                          setFormState(p => ({ ...p, gender: e.target.value as 'L' | 'P' }))
                        }
                        className="w-full bg-transparent py-2.5 text-xs font-bold text-[#252042] focus:outline-none cursor-pointer"
                      >
                        <option value="L">L</option>
                        <option value="P">P</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#3E385B] mb-1">Jurusan *</label>
                    <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-2">
                      <select
                        value={formState.majorCode}
                        onChange={e =>
                          setFormState(p => ({
                            ...p,
                            majorCode: e.target.value as TracerMajorCode,
                          }))
                        }
                        className="w-full bg-transparent py-2.5 text-xs font-extrabold text-[#6C60B8] focus:outline-none cursor-pointer"
                      >
                        {TRACER_MAJORS.map(m => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#3E385B] mb-1">
                      {isGrade12 ? 'Est. Lulus' : 'Thn Lulus'}
                    </label>
                    <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-2">
                      <select
                        value={formState.graduationYear}
                        onChange={e =>
                          setFormState(p => ({ ...p, graduationYear: e.target.value }))
                        }
                        className="w-full bg-transparent py-2.5 text-xs font-bold text-[#252042] focus:outline-none cursor-pointer"
                      >
                        {graduationYearOptions.map(yr => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {isGrade12 && (
                  <div>
                    <label className="block font-bold text-[#3E385B] mb-1">
                      Kelas XII (Rombel) *
                    </label>
                    <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                      {grade12Classes.length > 0 ? (
                        <select
                          value={formState.className}
                          onChange={e => {
                            const nextClass = e.target.value;
                            const upper = nextClass.toUpperCase();
                            setFormState(p => ({
                              ...p,
                              className: nextClass,
                              majorCode: upper.includes('DPB') || upper.includes('BUSANA')
                                ? 'DPB'
                                : upper.includes('RPL')
                                ? 'RPL'
                                : p.majorCode,
                            }));
                          }}
                          className="w-full bg-transparent py-2.5 text-xs font-bold text-[#252042] focus:outline-none cursor-pointer"
                        >
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
                          value={formState.className}
                          onChange={e => setFormState(p => ({ ...p, className: e.target.value }))}
                          placeholder="XII RPL 1 / XII DPB 1"
                          className="w-full bg-transparent py-2.5 text-xs font-bold text-[#252042] focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">No. HP / WhatsApp</label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                    <input
                      type="tel"
                      placeholder="0812xxxxxxxx"
                      value={formState.phone}
                      onChange={e => setFormState(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    Email Aktif (Opsional)
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={formState.email}
                      onChange={e => setFormState(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: Rencana Setelah Lulus / Status Karier Saat Ini */}
            <div className="space-y-3 pt-2 border-t border-[#ECEAF6]">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6C60B8]">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#6C60B8] text-white text-[10px]">
                  2
                </span>
                <span>
                  {isGrade12
                    ? 'Perencanaan Karier & Studi Setelah Lulus'
                    : 'Status Karier, Mitra PKL & Penempatan'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    {isGrade12 ? 'Rencana Utama Setelah Lulus *' : 'Status Karier Saat Ini *'}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F0EEFA] border border-[#DDD8F6] px-3">
                    <select
                      value={formState.careerStatus}
                      onChange={e =>
                        setFormState(p => ({
                          ...p,
                          careerStatus: e.target.value as AlumniCareerStatus,
                        }))
                      }
                      className="w-full bg-transparent py-2.5 text-xs font-extrabold text-[#5D51B2] focus:outline-none cursor-pointer"
                    >
                      {(Object.keys(STATUS_DISPLAY) as AlumniCareerStatus[]).map(st => (
                        <option key={st} value={st}>
                          {isGrade12
                            ? STATUS_DISPLAY[st].grade12Label
                            : STATUS_DISPLAY[st].alumniLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    {formState.careerStatus === 'kuliah'
                      ? isGrade12
                        ? 'Kampus / Perguruan Tinggi Target *'
                        : 'Nama Perguruan Tinggi / Kampus *'
                      : formState.careerStatus === 'wirausaha'
                      ? isGrade12
                        ? 'Ide / Nama Usaha yang Direncanakan *'
                        : 'Nama Usaha / Bisnis Mandiri *'
                      : isUnemployed
                      ? 'Keterangan / Target Sementara (Opsional)'
                      : isGrade12
                      ? 'Perusahaan / DUDI yang Dituju *'
                      : 'Nama Perusahaan / Instansi *'}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                    <input
                      type="text"
                      required={!isUnemployed}
                      placeholder={
                        formState.careerStatus === 'kuliah'
                          ? 'Contoh: POLBAN / UPI / Universitas Nusa Putra'
                          : formState.careerStatus === 'wirausaha'
                          ? 'Contoh: Butik Modiste Busana / Studio Web Dev'
                          : isUnemployed
                          ? 'Contoh: Ikut Job Fair BKK / Persiapan Berkas'
                          : 'Contoh: PT Telkom Indonesia / Garment Sukabumi'
                      }
                      value={formState.institutionOrCompany}
                      onChange={e =>
                        setFormState(p => ({ ...p, institutionOrCompany: e.target.value }))
                      }
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    {formState.careerStatus === 'kuliah'
                      ? isGrade12
                        ? 'Target Program Studi / Jurusan Kuliah'
                        : 'Program Studi & Jenjang'
                      : isGrade12
                      ? 'Target Posisi / Bidang Pekerjaan'
                      : 'Jabatan / Bidang Kerja'}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                    <input
                      type="text"
                      placeholder="Contoh: Software Engineer / Pattern Maker / Teknik Informatika"
                      value={formState.roleOrStudyProgram}
                      onChange={e =>
                        setFormState(p => ({ ...p, roleOrStudyProgram: e.target.value }))
                      }
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    {isGrade12 ? 'Kota Tujuan Karir / Studi' : 'Kota Penempatan / Domisili'}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#6C60B8] shrink-0" />
                    <input
                      type="text"
                      placeholder="Sukabumi / Bandung / Jakarta"
                      value={formState.city}
                      onChange={e => setFormState(p => ({ ...p, city: e.target.value }))}
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    Riwayat / Pengalaman Mitra DUDI Saat PKL
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-3">
                    <select
                      value={formState.pklPartnerId}
                      onChange={e => {
                        const chosen = pklPartners.find(p => p.id === e.target.value);
                        setFormState(p => ({
                          ...p,
                          pklPartnerId: e.target.value,
                          pklPartnerName: chosen?.name || '',
                        }));
                      }}
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Tidak Terkait / Mandiri --</option>
                      {pklPartners.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3E385B] mb-1">
                    Kesesuaian dengan Kompetensi {formState.majorCode}
                  </label>
                  <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-3">
                    <select
                      value={formState.industryRelevance}
                      onChange={e =>
                        setFormState(p => ({
                          ...p,
                          industryRelevance: e.target.value as AlumniRelevanceLevel,
                        }))
                      }
                      className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none cursor-pointer"
                    >
                      <option value="sangat_sesuai">Sangat Sesuai Jurusan</option>
                      <option value="sesuai">Sesuai Kompetensi</option>
                      <option value="cukup_sesuai">Cukup Sesuai</option>
                      <option value="tidak_sesuai">Lintas Bidang</option>
                    </select>
                  </div>
                </div>

                {isGrade12 ? (
                  <>
                    <div>
                      <label className="block font-bold text-[#3E385B] mb-1">
                        Kebutuhan Pendampingan BKK / Guru BK
                      </label>
                      <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-3">
                        <select
                          value={formState.bkkSupportNeed}
                          onChange={e =>
                            setFormState(p => ({ ...p, bkkSupportNeed: e.target.value }))
                          }
                          className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none cursor-pointer"
                        >
                          {BKK_SUPPORT_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#3E385B] mb-1">
                        Target Kesiapan Setelah Kelulusan
                      </label>
                      <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-3">
                        <select
                          value={formState.targetPlanDate}
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
                          className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none cursor-pointer"
                        >
                          {PLAN_TIMELINE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold text-[#3E385B] mb-1">
                        Waktu Tunggu Setelah Lulus
                      </label>
                      <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] px-3">
                        <select
                          value={formState.waitingPeriod}
                          onChange={e =>
                            setFormState(p => ({
                              ...p,
                              waitingPeriod: e.target.value as AlumniWaitingPeriod,
                            }))
                          }
                          className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none cursor-pointer"
                        >
                          {WAITING_PERIODS.map(wp => (
                            <option key={wp} value={wp}>
                              {wp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#3E385B] mb-1">
                        Rentang Penghasilan / Keterangan (Opsional)
                      </label>
                      <div className="orbita-field-underline rounded-xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white px-3 transition-all">
                        <input
                          type="text"
                          list="orbita-income-presets"
                          placeholder="Contoh: Rp 4.000.000 - Rp 6.000.000"
                          value={formState.monthlyIncomeRange}
                          onChange={e =>
                            setFormState(p => ({ ...p, monthlyIncomeRange: e.target.value }))
                          }
                          className="w-full bg-transparent py-2.5 text-xs font-semibold text-[#252042] focus:outline-none"
                        />
                        <datalist id="orbita-income-presets">
                          {INCOME_RANGE_PRESETS.map(p => (
                            <option key={p} value={p} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#3E385B] mb-1">
                  {isGrade12
                    ? 'Aspirasi, Kesiapan Portofolio, atau Pesan untuk Tim BKK / Sekolah'
                    : 'Testimoni Manfaat PKL & Saran untuk Kurikulum Sekolah'}
                </label>
                <div className="orbita-field-underline rounded-2xl bg-[#F4F3FA] border border-transparent focus-within:border-[#6C60B8]/50 focus-within:bg-white p-3 transition-all">
                  <textarea
                    rows={3}
                    placeholder={
                      isGrade12
                        ? 'Contoh: Saya ingin diprioritaskan jika ada rekrutmen programmer junior atau informasi beasiswa vokasi...'
                        : 'Contoh: Pengalaman praktik PKL di DUDI sangat membantu adaptasi di tempat kerja saat ini...'
                    }
                    value={formState.testimonial}
                    onChange={e => setFormState(p => ({ ...p, testimonial: e.target.value }))}
                    className="w-full bg-transparent text-xs font-medium text-[#252042] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#ECEAF6]">
              <button
                type="button"
                onClick={() => setShowFormBackConfirm(true)}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-[#DFDCF2] bg-[#FAF9FE] hover:bg-[#F0EEFA] px-4 text-xs font-bold text-[#555070] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isGrade12
                    ? 'linear-gradient(135deg, #FF7B9F 0%, #EE4D7A 100%)'
                    : 'linear-gradient(135deg, #7468C4 0%, #5D51B2 100%)',
                  boxShadow: isGrade12
                    ? '0 14px 28px -6px rgba(242, 87, 129, 0.40)'
                    : '0 14px 28px -6px rgba(108, 96, 184, 0.42)',
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] px-6 text-xs sm:text-sm font-extrabold text-white disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {isSubmitting
                    ? 'Menyimpan ke Database Cloud...'
                    : isGrade12
                    ? 'Kirim & Sinkronkan Rencana Kelas 12'
                    : 'Kirim & Sinkronkan Data Alumni'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 3: KONFIRMASI TERSIMPAN & TERSINKRON KE DATABASE                */}
      {/* ===================================================================== */}
      {stage === 'success' && savedRecord && (
        <div className="rounded-[28px] border border-[#CBEFE0] bg-white/95 p-6 sm:p-8 shadow-[0_22px_50px_-10px_rgba(19,154,76,0.16)] backdrop-blur-xl text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E7F9EF] border border-[#BCEAD1] text-[#139A4C] shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F9EF] px-3 py-1 text-[10.5px] font-extrabold text-[#139A4C]">
              Tersinkron Real-Time ke Cloud Database &amp; Menu Admin BKK
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#252042]">
              {savedRecord.respondentCategory === 'kelas_12'
                ? 'Rencana Pasca Lulus Kelas 12 Berhasil Disimpan!'
                : 'Data Tracer Study Alumni Berhasil Disimpan!'}
            </h3>
            <p className="text-xs text-[#6E6A86] leading-relaxed">
              Terima kasih <strong>{savedRecord.fullName}</strong>. Data Anda telah tercatat langsung
              pada modul <strong>PKL &amp; Tracer Study</strong> Admin Sekolah dengan status{' '}
              <strong>
                {savedRecord.verifiedBySchool ? 'Terverifikasi BKK' : 'Menunggu Review Tim BKK'}
              </strong>
              .
            </p>
          </div>

          <div className="mx-auto max-w-xl rounded-2xl border border-[#ECEAF6] bg-[#FAF9FE] p-4 text-left text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10.5px] font-semibold text-[#7A7596] block">
                Kategori &amp; Jurusan
              </span>
              <span className="font-extrabold text-[#252042]">
                {savedRecord.respondentCategory === 'kelas_12'
                  ? `Siswa Kelas 12 (${savedRecord.className || 'XII'})`
                  : `Alumni Lulusan ${savedRecord.graduationYear}`}{' '}
                &middot; {normalizeTracerMajor(savedRecord.majorCode)}
              </span>
            </div>
            <div>
              <span className="text-[10.5px] font-semibold text-[#7A7596] block">
                {savedRecord.respondentCategory === 'kelas_12'
                  ? 'Rencana Setelah Lulus'
                  : 'Status Karier'}
              </span>
              <span className="font-extrabold text-[#6C60B8]">
                {(STATUS_DISPLAY[savedRecord.careerStatus] || STATUS_DISPLAY.belum_bekerja).shortLabel}
              </span>
            </div>
            <div>
              <span className="text-[10.5px] font-semibold text-[#7A7596] block">
                Instansi / Kampus / Target
              </span>
              <span className="font-bold text-[#252042]">
                {savedRecord.institutionOrCompany || '-'}
              </span>
            </div>
            <div>
              <span className="text-[10.5px] font-semibold text-[#7A7596] block">
                {savedRecord.bkkSupportNeed ? 'Pendampingan BKK' : 'Jabatan / Prodi & Kota'}
              </span>
              <span className="font-bold text-[#252042]">
                {savedRecord.bkkSupportNeed ||
                  `${savedRecord.roleOrStudyProgram || '-'} · ${savedRecord.city || '-'}`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => openFromExistingTracer(savedRecord)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-[#DDD8F6] bg-[#F4F2FC] hover:bg-[#EAE7F8] px-4 text-xs font-extrabold text-[#6C60B8] cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Data Ini</span>
            </button>
            <button
              type="button"
              onClick={() => setStage('intro')}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-[#E2DFEF] bg-white hover:bg-[#FAF9FE] px-4 text-xs font-extrabold text-[#3E385B] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>
                {isLockedGrade12
                  ? 'Kembali ke Halaman Kelas 12'
                  : isLockedAlumni
                  ? 'Kembali ke Halaman Alumni'
                  : 'Kembali ke Portal Pengisian'}
              </span>
            </button>
            {!hideOuterBackButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #7468C4 0%, #5D51B2 100%)',
                }}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl px-5 text-xs font-extrabold text-white cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Selesai &amp; Kembali</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DIALOG KONFIRMASI KEMBALI (WOBBLE IN + FROSTED VIOLET GLASS MATCHED)  */}
      {/* ===================================================================== */}
      {showFormBackConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#42368E]/42 backdrop-blur-md animate-fade-in"
          onClick={e => {
            if (e.target === e.currentTarget) setShowFormBackConfirm(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-[#7468C4]/30 bg-white/90 p-6 text-[#3E385B] shadow-[0_28px_68px_rgba(64,52,142,0.34)] backdrop-blur-2xl animate-wobble-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracer-back-confirm-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E6E8F2] pb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    background: 'linear-gradient(145deg, #7468C4 0%, #5D51B2 100%)',
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="tracer-back-confirm-title" className="text-base font-extrabold text-[#3E385B]">
                    {isLockedGrade12
                      ? 'Kembali ke Halaman Siswa Kelas 12'
                      : isLockedAlumni
                      ? 'Kembali ke Halaman Alumni'
                      : 'Kembali ke Portal Pengisian'}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#8C88A4]">
                    Konfirmasi Perubahan Formulir ORBITA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormBackConfirm(false)}
                className="no-ornament rounded-full border border-[#E6E8F2] bg-[#F5F6FA] p-1.5 text-[#6A6584] hover:bg-[#ECEEF7] hover:text-[#3E385B] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="py-5 space-y-3.5">
              <div className="flex items-start gap-3 rounded-[18px] border border-[#FFE0E9] bg-[#FFF5F8] p-3.5 text-xs">
                <AlertTriangle className="h-5 w-5 text-[#FF6E96] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#3E385B]">
                    Apakah Anda yakin ingin kembali ke pilihan formulir?
                  </p>
                  <p className="mt-1 text-[#6A6584]">
                    Isian formulir yang belum dikirim tidak akan tersimpan ke database hingga Anda menekan tombol kirim.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#E6E8F2]">
              <button
                type="button"
                onClick={() => setShowFormBackConfirm(false)}
                className="no-ornament inline-flex h-9 items-center justify-center rounded-full border border-[#E6E8F2] bg-[#F5F6FA] px-4 text-xs font-bold text-[#6A6584] hover:bg-[#ECEEF7] hover:text-[#3E385B] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFormBackConfirm(false);
                  setStage('intro');
                }}
                style={{
                  background: 'linear-gradient(135deg, #FF7597 0%, #FF5C86 100%)',
                }}
                className="no-ornament inline-flex h-9 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold text-white shadow-md hover:brightness-105 whitespace-nowrap shrink-0 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Ya, Kembali</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
