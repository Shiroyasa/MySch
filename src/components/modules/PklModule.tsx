import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  IndustryPartner,
  PklVisitRecord,
  PklStudentReportItem,
  IndustryMou,
  IndustryPlacementRecord,
} from '../../types';
import {
  initialIndustryPartners,
  initialPklVisits,
  initialPklReports,
  sampleIndustryPartners,
  samplePklVisits,
  samplePklReports,
} from '../../data/pklSeedData';
import {
  Building2,
  Users,
  FileCheck2,
  Clock,
  Search,
  Plus,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Star,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Calendar,
  AlertTriangle,
  Award,
  CheckCircle2,
  X,
  TrendingUp,
  Briefcase,
  Filter,
  Trash2,
  Edit,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { exportToExcel, exportToCsv, exportToPdf } from '../../utils/exportUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  AcademyHeroBanner,
  OrnateCard,
  CharacterMedallion,
  AcademyCornerBadge,
  HighlightedChartHeader,
} from '../common/AcademyOrnaments';
import { SortByControl, SortOption, sortDataItems } from '../common/SortByControl';
import { PklAlumniTracerSection } from './PklAlumniTracerSection';
import { LiquidNavBar } from '../common/LiquidNavBar';

export const PklModule: React.FC = () => {
  const {
    classes,
    majors,
    students,
    activeAcademicYear,
    pklPartners: partners,
    pklVisits: visits,
    pklReports: rawStudentReports,
    pklTracers,
    savePklPartner,
    deletePklPartner,
    savePklVisit,
    deletePklVisit,
    savePklReport,
    deletePklReport,
    savePklTracer,
    savePklTracersBatch,
    deletePklTracer,
    clearAllPklTracers,
    clearAllPklData,
    loadSamplePklData,
    reportTemplate,
    saveReportTemplate,
    visualSettings,
  } = useApp();

  // State
  const [activeTab, setActiveTab] = useState<'dudi_database' | 'automated_reports' | 'alumni_tracer'>('dudi_database');
  const [reportSubTab, setReportSubTab] = useState<
    'by_class_major' | 'by_company' | 'visits_attendance' | 'pending_reports' | 'grades' | 'graduate_absorption'
  >('by_class_major');

  // Search, Filter & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('ALL');
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('az');

  const studentReports = useMemo(() => {
    return sortDataItems(rawStudentReports, sortBy, {
      getName: r => r.studentName,
      getNis: r => r.nisn,
      getDate: r => r.id,
    });
  }, [rawStudentReports, sortBy]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    confirmLabel: 'Hapus Sekarang',
    onConfirm: () => {},
  });

  const closeDeleteModal = () => {
    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Modals for CRUD operations
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<IndustryPartner | null>(null);

  const [placementModalPartner, setPlacementModalPartner] = useState<IndustryPartner | null>(null);
  const [editingPlacement, setEditingPlacement] = useState<{ partnerId: string; placement: IndustryPlacementRecord } | null>(null);

  const [mouModalPartner, setMouModalPartner] = useState<IndustryPartner | null>(null);
  const [editingMou, setEditingMou] = useState<{ partnerId: string; mou: IndustryMou } | null>(null);

  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<PklVisitRecord | null>(null);

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluatingPartner, setEvaluatingPartner] = useState<IndustryPartner | null>(null);

  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [editingReportItem, setEditingReportItem] = useState<PklStudentReportItem | null>(null);

  // Forms
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    sector: 'Teknologi Informasi & Software',
    address: '',
    city: 'Sukabumi',
    hrdName: '',
    hrdPhone: '',
    hrdEmail: '',
    hrdPosition: 'HRD / Personalia',
    quota: 6,
    mouNumber: '',
    mouStartDate: new Date().toISOString().split('T')[0],
    mouEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
    mouScope: 'Praktik Kerja Lapangan, Guru Magang & Rekrutmen Lulusan',
  });

  const [evalForm, setEvalForm] = useState({
    rating: 5,
    workCultureScore: 90,
    guidanceScore: 90,
    facilityScore: 90,
    curriculumRelevanceScore: 90,
    recommendation: 'Sangat Direkomendasikan' as
      | 'Sangat Direkomendasikan'
      | 'Direkomendasikan'
      | 'Perlu Evaluasi'
      | 'Tidak Direkomendasikan',
    notes: '',
  });

  const [newVisitForm, setNewVisitForm] = useState({
    partnerId: '',
    teacherName: 'Budi Santoso, S.Kom',
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'Supervisi Rutin' as const,
    attendanceRate: 100,
    guidanceNotes: '',
    industryFeedback: '',
    status: 'terlaksana' as const,
  });

  const [placementForm, setPlacementForm] = useState({
    studentId: '',
    period: 'Juli - Desember 2026',
    schoolMentorName: 'Budi Santoso, S.Kom',
    industryMentorName: 'Pembimbing Industri DUDI',
    status: 'sedang_berjalan' as const,
    finalScore: 88,
  });

  const [mouForm, setMouForm] = useState({
    mouNumber: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
    scope: 'Penyelenggaraan PKL Siswa, Guru Tamu & Penyerapan Lulusan',
    status: 'aktif' as const,
    documentTitle: 'Perjanjian Kerja Sama Kemitraan Vokasi',
  });

  const [studentReportForm, setStudentReportForm] = useState({
    studentId: '',
    partnerId: '',
    reportTitle: '',
    submissionStatus: 'sudah_dikumpulkan' as const,
    submissionDate: new Date().toISOString().split('T')[0],
    schoolMentorScore: 90,
    industryMentorScore: 90,
    absorbedStatus: 'terserap_kerja' as const,
  });

  // Derived metrics
  const totalCapacity = useMemo(() => partners.reduce((acc, p) => acc + p.quota, 0), [partners]);
  const totalActiveStudents = useMemo(() => {
    return partners.reduce((acc, p) => acc + (p.placements?.filter(pl => pl.status === 'sedang_berjalan').length || 0), 0);
  }, [partners]);

  const activeMousCount = useMemo(() => {
    return partners.flatMap(p => p.mouHistory || []).filter(m => m.status === 'aktif').length;
  }, [partners]);

  const sectors = useMemo(() => {
    const list = Array.from(new Set(partners.map(p => p.sector)));
    return ['ALL', ...list];
  }, [partners]);

  const filteredPartners = useMemo(() => {
    const matched = partners.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hrdName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSector = selectedSectorFilter === 'ALL' || p.sector === selectedSectorFilter;
      return matchSearch && matchSector;
    });
    return sortDataItems(matched, sortBy, {
      getName: p => p.name,
      getNis: p => p.placements?.[0]?.nisn || p.id,
      getDate: p => p.mouHistory?.[0]?.startDate || '2025-01-01',
    });
  }, [partners, searchTerm, selectedSectorFilter, sortBy]);

  // CLEAR ALL DATA FUNCTION (Synced with Firestore Database)
  const handleClearAllPklData = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Kosongkan Seluruh Data Administrasi PKL',
      itemName: 'Database DUDI, Kunjungan Supervisi & Laporan PKL',
      description:
        'Apakah Anda yakin ingin MENGHAPUS SEMUA DATA di modul Administrasi PKL? Semua mitra DUDI, riwayat kerja sama, kunjungan pembimbing, dan laporan siswa akan dikosongkan dari Database Cloud.',
      confirmLabel: 'Kosongkan Sekarang',
      onConfirm: () => {
        clearAllPklData();
        setExpandedPartnerId(null);
        closeDeleteModal();
        showToast('Seluruh data administrasi PKL berhasil dikosongkan dari Database Cloud.');
      },
    });
  };

  // LOAD SAMPLE DATA TEMPLATE (Synced with Firestore Database)
  const handleLoadSampleData = () => {
    loadSamplePklData();
    setExpandedPartnerId(sampleIndustryPartners[0]?.id || null);
    showToast('Template data kemitraan & PKL berhasil dimuat dan disimpan ke Database Cloud!');
  };

  // CRUD 1: PARTNER (CREATE, UPDATE, DELETE)
  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.name.trim()) return;

    const newPartner: IndustryPartner = {
      id: `dudi-${Date.now()}`,
      name: newPartnerForm.name,
      sector: newPartnerForm.sector,
      address: newPartnerForm.address,
      city: newPartnerForm.city,
      hrdName: newPartnerForm.hrdName,
      hrdPhone: newPartnerForm.hrdPhone,
      hrdEmail: newPartnerForm.hrdEmail,
      hrdPosition: newPartnerForm.hrdPosition,
      quota: Number(newPartnerForm.quota) || 4,
      activePlacementsCount: 0,
      status: 'aktif',
      mouHistory: [
        {
          id: `mou-${Date.now()}`,
          mouNumber:
            newPartnerForm.mouNumber ||
            `MoU/SMKMY/DUDI/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
          startDate: newPartnerForm.mouStartDate,
          endDate: newPartnerForm.mouEndDate,
          status: 'aktif',
          scope: newPartnerForm.mouScope,
          documentTitle: `PKS Kerja Sama Vokasi ${newPartnerForm.name}`,
        },
      ],
      placements: [],
      evaluation: {
        rating: 5,
        workCultureScore: 90,
        guidanceScore: 90,
        facilityScore: 90,
        curriculumRelevanceScore: 90,
        recommendation: 'Direkomendasikan',
        notes: 'Kemitraan baru terdaftar.',
        evaluatorName: 'Tim Hubin & Kemitraan',
        evaluatedAt: new Date().toISOString().split('T')[0],
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    savePklPartner(newPartner);
    setExpandedPartnerId(newPartner.id);
    setShowAddPartnerModal(false);
    showToast(`Mitra DUDI "${newPartner.name}" berhasil disimpan ke Database Cloud!`);
  };

  const handleUpdatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    savePklPartner(editingPartner);
    setEditingPartner(null);
    showToast(`Data mitra DUDI "${editingPartner.name}" berhasil diperbarui di Database Cloud!`);
  };

  const handleDeletePartner = (partner: IndustryPartner) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Mitra Industri / DUDI',
      itemName: partner.name,
      description: `Apakah Anda yakin ingin menghapus "${partner.name}" beserta riwayat penempatan siswa dan MoU-nya dari database? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Perusahaan',
      onConfirm: () => {
        deletePklPartner(partner.id);
        closeDeleteModal();
        showToast(`Perusahaan "${partner.name}" beserta data terkait berhasil dihapus dari Database Cloud.`);
      },
    });
  };

  // CRUD 2: PLACEMENT IN PARTNER (CREATE, UPDATE, DELETE)
  const handleAddPlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementModalPartner) return;
    const student = students.find(s => s.id === placementForm.studentId);
    if (!student) return;

    const finalScore = Number(placementForm.finalScore) || 85;
    const grade = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

    const newPlacement: IndustryPlacementRecord = {
      id: `plc-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      nisn: student.nisn,
      className: student.className,
      majorCode: student.majorCode,
      academicYear: activeAcademicYear.name,
      period: placementForm.period,
      schoolMentorName: placementForm.schoolMentorName,
      industryMentorName: placementForm.industryMentorName,
      status: placementForm.status,
      finalScore,
      grade,
    };

    const currentPartner = partners.find(p => p.id === placementModalPartner.id) || placementModalPartner;
    const updatedPartner: IndustryPartner = {
      ...currentPartner,
      placements: [newPlacement, ...(currentPartner.placements || [])],
    };
    savePklPartner(updatedPartner);

    // Also auto-add or sync to studentReports table in Firestore
    const existingReport = studentReports.find(r => r.studentId === student.id);
    const syncedReport: PklStudentReportItem = existingReport
      ? {
          ...existingReport,
          partnerId: currentPartner.id,
          partnerName: currentPartner.name,
          finalScore,
          grade,
        }
      : {
          id: `rep-${Date.now()}`,
          studentId: student.id,
          studentName: student.fullName,
          nisn: student.nisn,
          className: student.className,
          majorCode: student.majorCode,
          partnerId: currentPartner.id,
          partnerName: currentPartner.name,
          reportTitle: `Laporan Praktik Kerja Lapangan di ${currentPartner.name}`,
          submissionStatus: 'belum_dikumpulkan',
          schoolMentorScore: finalScore,
          industryMentorScore: finalScore,
          finalScore,
          grade,
          absorbedStatus: 'mencari_kerja',
        };
    savePklReport(syncedReport);

    setPlacementModalPartner(null);
    showToast(`Siswa ${student.fullName} berhasil ditempatkan di ${currentPartner.name} & tersinkron ke semua laporan!`);
  };

  const handleUpdatePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlacement) return;

    const { partnerId, placement } = editingPlacement;
    const finalScore = Number(placement.finalScore) || 85;
    const grade = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

    const targetPartner = partners.find(p => p.id === partnerId);
    if (targetPartner) {
      const updatedPartner: IndustryPartner = {
        ...targetPartner,
        placements: (targetPartner.placements || []).map(pl =>
          pl.id === placement.id ? { ...placement, finalScore, grade } : pl
        ),
      };
      savePklPartner(updatedPartner);
    }

    // Sync score & grade to studentReports in Firestore as well
    const linkedReport = studentReports.find(r => r.studentId === placement.studentId);
    if (linkedReport) {
      savePklReport({
        ...linkedReport,
        finalScore,
        grade,
      });
    }

    setEditingPlacement(null);
    showToast(`Data penempatan & nilai siswa ${placement.studentName} berhasil disinkronkan ke Database Cloud!`);
  };

  const handleDeletePlacement = (partnerId: string, placementId: string, studentName: string) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Tarik / Hapus Siswa dari PKL',
      itemName: studentName,
      description: `Apakah Anda yakin ingin membatalkan penempatan siswa ${studentName} dari perusahaan ini?`,
      confirmLabel: 'Hapus Penempatan',
      onConfirm: () => {
        const targetPartner = partners.find(p => p.id === partnerId);
        if (targetPartner) {
          const removedPlc = (targetPartner.placements || []).find(pl => pl.id === placementId);
          const updatedPartner: IndustryPartner = {
            ...targetPartner,
            placements: (targetPartner.placements || []).filter(pl => pl.id !== placementId),
          };
          savePklPartner(updatedPartner);

          if (removedPlc) {
            const linkedReport = studentReports.find(
              r => r.studentId === removedPlc.studentId && r.partnerId === partnerId
            );
            if (linkedReport) {
              deletePklReport(linkedReport.id);
            }
          }
        }
        closeDeleteModal();
        showToast(`Penempatan siswa ${studentName} berhasil dihapus dari Database Cloud.`);
      },
    });
  };

  // CRUD 3: MOU (CREATE, UPDATE, DELETE)
  const handleAddMou = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mouModalPartner) return;

    const newMou: IndustryMou = {
      id: `mou-${Date.now()}`,
      mouNumber:
        mouForm.mouNumber ||
        `MoU/SMKMY/DUDI/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      startDate: mouForm.startDate,
      endDate: mouForm.endDate,
      status: mouForm.status,
      scope: mouForm.scope,
      documentTitle: mouForm.documentTitle,
    };

    const targetPartner = partners.find(p => p.id === mouModalPartner.id) || mouModalPartner;
    savePklPartner({
      ...targetPartner,
      mouHistory: [newMou, ...(targetPartner.mouHistory || [])],
    });
    setMouModalPartner(null);
    showToast(`MoU baru untuk ${targetPartner.name} berhasil disimpan ke Database Cloud.`);
  };

  const handleUpdateMou = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMou) return;
    const { partnerId, mou } = editingMou;
    const targetPartner = partners.find(p => p.id === partnerId);
    if (targetPartner) {
      savePklPartner({
        ...targetPartner,
        mouHistory: (targetPartner.mouHistory || []).map(m => (m.id === mou.id ? mou : m)),
      });
    }
    setEditingMou(null);
    showToast(`Dokumen MoU ${mou.mouNumber} berhasil diperbarui di Database Cloud.`);
  };

  const handleDeleteMou = (partnerId: string, mouId: string, mouNumber: string) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Dokumen MoU / PKS',
      itemName: mouNumber,
      description: `Hapus nomor surat kerja sama ${mouNumber} dari riwayat?`,
      confirmLabel: 'Hapus Dokumen',
      onConfirm: () => {
        const targetPartner = partners.find(p => p.id === partnerId);
        if (targetPartner) {
          savePklPartner({
            ...targetPartner,
            mouHistory: (targetPartner.mouHistory || []).filter(m => m.id !== mouId),
          });
        }
        closeDeleteModal();
        showToast(`MoU ${mouNumber} berhasil dihapus dari Database Cloud.`);
      },
    });
  };

  // CRUD 4: SUPERVISION VISITS (CREATE, UPDATE, DELETE)
  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const partner = partners.find(p => p.id === newVisitForm.partnerId) || partners[0];
    if (!partner) {
      showToast('Harap tambahkan mitra industri terlebih dahulu.');
      return;
    }

    const newVisit: PklVisitRecord = {
      id: `vst-${Date.now()}`,
      partnerId: partner.id,
      partnerName: partner.name,
      teacherId: 'tch-current',
      teacherName: newVisitForm.teacherName,
      visitDate: newVisitForm.visitDate,
      visitType: newVisitForm.visitType,
      studentCount: partner.placements?.length || 1,
      studentNames: (partner.placements || []).map(p => p.studentName),
      attendanceRate: Number(newVisitForm.attendanceRate) || 100,
      guidanceNotes: newVisitForm.guidanceNotes || 'Supervisi berkala berjalan sesuai SOP.',
      industryFeedback: newVisitForm.industryFeedback || 'Performa kerja siswa sangat baik.',
      status: newVisitForm.status,
    };

    savePklVisit(newVisit);
    setShowAddVisitModal(false);
    showToast(`Kunjungan supervisi ke ${partner.name} berhasil disimpan ke Database Cloud.`);
  };

  const handleUpdateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit) return;

    savePklVisit(editingVisit);
    setEditingVisit(null);
    showToast('Data supervisi kunjungan berhasil diperbarui di Database Cloud.');
  };

  const handleDeleteVisit = (visit: PklVisitRecord) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Catatan Kunjungan Supervisi',
      itemName: `${visit.partnerName} (${visit.visitDate})`,
      description: 'Apakah Anda yakin ingin menghapus log catatan supervisi ini dari database?',
      confirmLabel: 'Hapus Log',
      onConfirm: () => {
        deletePklVisit(visit.id);
        closeDeleteModal();
        showToast('Catatan kunjungan berhasil dihapus dari Database Cloud.');
      },
    });
  };

  // CRUD 5: STUDENT REPORTS & GRADES (CREATE, UPDATE, DELETE)
  const handleCreateStudentReport = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === studentReportForm.studentId);
    const partner = partners.find(p => p.id === studentReportForm.partnerId) || partners[0];
    if (!student) return;

    const sScore = Number(studentReportForm.schoolMentorScore) || 85;
    const iScore = Number(studentReportForm.industryMentorScore) || 85;
    const finalScore = Math.round(sScore * 0.4 + iScore * 0.6);
    const grade = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

    const newReport: PklStudentReportItem = {
      id: `rep-${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      nisn: student.nisn,
      className: student.className,
      majorCode: student.majorCode,
      partnerId: partner ? partner.id : 'dudi-general',
      partnerName: partner ? partner.name : 'Mitra Industri Mandiri',
      reportTitle: studentReportForm.reportTitle || `Laporan PKL Siswa ${student.fullName}`,
      submissionStatus: studentReportForm.submissionStatus,
      submissionDate:
        studentReportForm.submissionStatus === 'sudah_dikumpulkan'
          ? studentReportForm.submissionDate
          : undefined,
      schoolMentorScore: sScore,
      industryMentorScore: iScore,
      finalScore,
      grade,
      absorbedStatus: studentReportForm.absorbedStatus,
    };

    savePklReport(newReport);
    setShowAddReportModal(false);
    showToast(`Data laporan & nilai PKL ${student.fullName} berhasil disimpan ke Database Cloud!`);
  };

  const handleUpdateStudentReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReportItem) return;

    const sScore = Number(editingReportItem.schoolMentorScore) || 80;
    const iScore = Number(editingReportItem.industryMentorScore) || 80;
    const finalScore = Math.round(sScore * 0.4 + iScore * 0.6);
    const grade = finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D';

    savePklReport({
      ...editingReportItem,
      finalScore,
      grade,
    });
    setEditingReportItem(null);
    showToast(`Laporan dan nilai ${editingReportItem.studentName} berhasil disinkronkan ke Database Cloud!`);
  };

  const handleDeleteStudentReport = (item: PklStudentReportItem) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Hapus Laporan PKL Siswa',
      itemName: item.studentName,
      description: `Hapus entri laporan dan nilai PKL untuk ${item.studentName} dari database?`,
      confirmLabel: 'Hapus Entri',
      onConfirm: () => {
        deletePklReport(item.id);
        closeDeleteModal();
        showToast(`Laporan ${item.studentName} berhasil dihapus dari Database Cloud.`);
      },
    });
  };

  // EXPORT HANDLERS
  const exportToExcelReport = () => {
    if (reportSubTab === 'by_class_major') {
      const data = studentReports.map((r, i) => ({
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        Jurusan: r.majorCode,
        'Perusahaan Mitra DUDI': r.partnerName,
        'Judul Laporan PKL': r.reportTitle,
        'Status Laporan': r.submissionStatus.toUpperCase(),
        'Nilai Akhir': r.finalScore,
        Predikat: r.grade,
      }));
      exportToExcel(data, `Rekap_PKL_Kelas_Jurusan_${activeAcademicYear.name}`, 'Peserta PKL');
      showToast('Rekap peserta PKL berhasil diekspor ke Excel.');
    } else if (reportSubTab === 'by_company') {
      const data = partners.map((p, i) => ({
        No: i + 1,
        'Nama Perusahaan': p.name,
        'Bidang Usaha': p.sector,
        Kota: p.city,
        'Kontak HRD': `${p.hrdName} (${p.hrdPhone})`,
        'Kuota Penerimaan': p.quota,
        'Siswa Aktif': p.placements?.filter(pl => pl.status === 'sedang_berjalan').length || 0,
        'Sisa Kuota': Math.max(0, p.quota - (p.placements?.filter(pl => pl.status === 'sedang_berjalan').length || 0)),
        'Masa Berlaku MoU': p.mouHistory?.[0]?.endDate || '-',
        'Rating Evaluasi': `${p.evaluation?.rating || 5} / 5`,
      }));
      exportToExcel(data, `Rekap_Penempatan_Perusahaan_${activeAcademicYear.name}`, 'Mitra DUDI');
      showToast('Rekap penempatan per perusahaan berhasil diekspor ke Excel.');
    } else if (reportSubTab === 'visits_attendance') {
      const data = visits.map((v, i) => ({
        No: i + 1,
        'Tanggal Kunjungan': v.visitDate,
        'Mitra Industri': v.partnerName,
        'Guru Pembimbing': v.teacherName,
        'Tipe Kunjungan': v.visitType,
        'Jumlah Siswa': v.studentCount,
        'Kehadiran (%)': `${v.attendanceRate}%`,
        'Catatan Supervisi': v.guidanceNotes,
        'Feedback Industri': v.industryFeedback,
        Status: v.status.toUpperCase(),
      }));
      exportToExcel(data, `Rekap_Supervisi_PKL_${activeAcademicYear.name}`, 'Supervisi');
      showToast('Rekap kunjungan & presensi berhasil diekspor ke Excel.');
    } else if (reportSubTab === 'pending_reports') {
      const data = studentReports
        .filter(r => r.submissionStatus !== 'sudah_dikumpulkan')
        .map((r, i) => ({
          No: i + 1,
          NISN: r.nisn,
          'Nama Siswa': r.studentName,
          Kelas: r.className,
          Jurusan: r.majorCode,
          'Perusahaan Mitra': r.partnerName,
          'Status Dokumen': r.submissionStatus === 'revisi' ? 'PERLU REVISI' : 'BELUM MENGUMPULKAN',
          'Judul Proyek / Laporan': r.reportTitle,
        }));
      exportToExcel(data, `Rekap_Tunggakan_Laporan_${activeAcademicYear.name}`, 'Laporan Belum Kumpul');
      showToast('Rekap tunggakan laporan berhasil diekspor ke Excel.');
    } else if (reportSubTab === 'grades') {
      const data = studentReports.map((r, i) => ({
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        'Perusahaan Mitra': r.partnerName,
        'Nilai Sekolah (40%)': r.schoolMentorScore,
        'Nilai Industri (60%)': r.industryMentorScore,
        'Nilai Akhir PKL': r.finalScore,
        Predikat: r.grade,
        'Keterangan Kelulusan': r.finalScore >= 75 ? 'TUNTAS / KOMPETEN' : 'REMEDIAL',
      }));
      exportToExcel(data, `Rekap_Nilai_PKL_${activeAcademicYear.name}`, 'Nilai PKL');
      showToast('Rekap nilai PKL berhasil diekspor ke Excel.');
    } else {
      const data = studentReports.map((r, i) => ({
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        'Mitra PKL': r.partnerName,
        'Status Penyerapan':
          r.absorbedStatus === 'terserap_kerja'
            ? 'Bekerja di Industri DUDI'
            : r.absorbedStatus === 'melanjutkan_kuliah'
            ? 'Melanjutkan Kuliah (PTN/S)'
            : r.absorbedStatus === 'wirausaha'
            ? 'Wirausaha Mandiri'
            : 'Menunggu Penempatan Kerja',
      }));
      exportToExcel(data, `Statistik_Penyerapan_Lulusan_${activeAcademicYear.name}`, 'Penyerapan');
      showToast('Statistik penyerapan lulusan berhasil diekspor ke Excel.');
    }
  };

  const exportToCsvReport = () => {
    let data: Record<string, any>[] = [];

    if (reportSubTab === 'by_class_major') {
      data = studentReports.map((r, i) => ({
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        Jurusan: r.majorCode,
        'Mitra DUDI': r.partnerName,
        'Status Laporan': r.submissionStatus,
        'Nilai Akhir': r.finalScore,
        Predikat: r.grade,
      }));
    } else if (reportSubTab === 'by_company') {
      data = partners.map((p, i) => ({
        No: i + 1,
        'Nama Perusahaan': p.name,
        'Bidang Usaha': p.sector,
        Kota: p.city,
        'Kontak HRD': `${p.hrdName} (${p.hrdPhone})`,
        Kuota: p.quota,
        Terisi: p.placements?.filter(pl => pl.status === 'sedang_berjalan').length || 0,
        'Status MoU': p.mouHistory?.[0]?.status || 'aktif',
      }));
    } else if (reportSubTab === 'visits_attendance') {
      data = visits.map((v, i) => ({
        No: i + 1,
        Tanggal: v.visitDate,
        'Mitra Industri': v.partnerName,
        'Guru Pembimbing': v.teacherName,
        'Tipe Kunjungan': v.visitType,
        'Kehadiran (%)': `${v.attendanceRate}%`,
        Status: v.status,
      }));
    } else if (reportSubTab === 'pending_reports') {
      data = studentReports
        .filter(r => r.submissionStatus !== 'sudah_dikumpulkan')
        .map((r, i) => ({
          No: i + 1,
          NISN: r.nisn,
          'Nama Siswa': r.studentName,
          Kelas: r.className,
          Jurusan: r.majorCode,
          'Mitra DUDI': r.partnerName,
          'Status Dokumen': r.submissionStatus === 'revisi' ? 'Revisi' : 'Belum Kumpul',
        }));
    } else if (reportSubTab === 'grades') {
      data = studentReports.map((r, i) => ({
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        'Mitra DUDI': r.partnerName,
        'Nilai Sekolah': r.schoolMentorScore,
        'Nilai Industri': r.industryMentorScore,
        'Nilai Akhir': r.finalScore,
        Predikat: r.grade,
      }));
    } else {
      data = studentReports.map((r, i) => ({
        No: i + 1,
        NISN: r.nisn,
        'Nama Siswa': r.studentName,
        Kelas: r.className,
        'Mitra PKL': r.partnerName,
        'Status Pasca PKL': r.absorbedStatus,
      }));
    }

    exportToCsv(data, `Laporan_PKL_${reportSubTab}_${activeAcademicYear.name}`);
    showToast('Laporan berhasil diekspor ke CSV.');
  };

  const exportToPdfReport = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let title = '';

    if (reportSubTab === 'by_class_major') {
      title = 'REKAPITULASI PESERTA PRAKTEK KERJA LAPANGAN (PKL) BERDASARKAN KELAS & JURUSAN';
      headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Mitra Industri DUDI', 'Status Laporan', 'Nilai'];
      rows = studentReports.map((r, i) => [
        i + 1,
        r.nisn,
        r.studentName,
        r.className,
        r.majorCode,
        r.partnerName,
        r.submissionStatus.toUpperCase(),
        `${r.finalScore} (${r.grade})`,
      ]);
    } else if (reportSubTab === 'by_company') {
      title = 'REKAPITULASI PENEMPATAN SISWA PKL BERDASARKAN PERUSAHAAN MITRA DUDI';
      headers = ['No', 'Nama Perusahaan DUDI', 'Bidang Usaha', 'Kontak HRD', 'Kuota', 'Terisi', 'Masa MoU', 'Rating'];
      rows = partners.map((p, i) => [
        i + 1,
        p.name,
        p.sector,
        p.hrdName,
        p.quota,
        p.placements?.filter(pl => pl.status === 'sedang_berjalan').length || 0,
        p.mouHistory?.[0]?.endDate || '-',
        `${p.evaluation?.rating || 5}/5`,
      ]);
    } else if (reportSubTab === 'visits_attendance') {
      title = 'REKAPITULASI KUNJUNGAN SUPERVISI & PRESENSI SISWA PKL DI INDUSTRI';
      headers = ['No', 'Tanggal', 'Perusahaan Mitra', 'Guru Pembimbing', 'Jenis Kunjungan', 'Kehadiran', 'Status'];
      rows = visits.map((v, i) => [
        i + 1,
        v.visitDate,
        v.partnerName,
        v.teacherName,
        v.visitType,
        `${v.attendanceRate}%`,
        v.status.toUpperCase(),
      ]);
    } else if (reportSubTab === 'pending_reports') {
      title = 'DAFTAR SISWA DENGAN TUNGGAKAN / BELUM MENGUMPULKAN LAPORAN AKHIR PKL';
      headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Perusahaan Penempatan', 'Status Pengumpulan'];
      rows = studentReports
        .filter(r => r.submissionStatus !== 'sudah_dikumpulkan')
        .map((r, i) => [
          i + 1,
          r.nisn,
          r.studentName,
          r.className,
          r.majorCode,
          r.partnerName,
          r.submissionStatus === 'revisi' ? 'PERLU REVISI' : 'BELUM DIKUMPULKAN',
        ]);
    } else if (reportSubTab === 'grades') {
      title = 'REKAPITULASI NILAI AKHIR PRAKTEK KERJA LAPANGAN (PKL) SISWA';
      headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Perusahaan Mitra', 'Sekolah', 'Industri', 'Nilai Akhir', 'Predikat'];
      rows = studentReports.map((r, i) => [
        i + 1,
        r.nisn,
        r.studentName,
        r.className,
        r.partnerName,
        r.schoolMentorScore,
        r.industryMentorScore,
        r.finalScore,
        r.grade,
      ]);
    } else {
      title = 'STATISTIK PENYERAPAN LULUSAN PASCA PRAKTEK KERJA LAPANGAN (DUDI)';
      headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Mitra DUDI Tempat PKL', 'Status Ketercapaian Lulusan'];
      rows = studentReports.map((r, i) => [
        i + 1,
        r.nisn,
        r.studentName,
        r.className,
        r.partnerName,
        r.absorbedStatus === 'terserap_kerja'
          ? 'Direkrut Bekerja di Industri DUDI'
          : r.absorbedStatus === 'melanjutkan_kuliah'
          ? 'Melanjutkan Studi ke Perguruan Tinggi'
          : r.absorbedStatus === 'wirausaha'
          ? 'Berwirausaha Mandiri'
          : 'Pencari Kerja / Menunggu Penempatan',
      ]);
    }

    exportToPdf(
      headers,
      rows,
      {
        title,
        academicYear: `Tahun Ajaran ${activeAcademicYear.name}`,
      },
      `Laporan_Resmi_PKL_${reportSubTab}`,
      'landscape'
    );
    showToast('Dokumen PDF resmi laporan PKL siap diunduh / dicetak.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#7265C2]/30 bg-[#6C60B8] py-3 px-5 text-xs font-bold text-white shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#FFE680] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        itemName={deleteModalConfig.itemName}
        description={deleteModalConfig.description}
        confirmLabel={deleteModalConfig.confirmLabel}
        onConfirm={deleteModalConfig.onConfirm}
        onClose={closeDeleteModal}
      />

      {/* Royal Academy Banner */}
      <AcademyHeroBanner
        moduleKey="pkl"
        kicker="MANAJEMEN HUBUNGAN INDUSTRI & PRAKERIN"
        title="ADMINISTRASI PRAKTIK KERJA LAPANGAN (PKL)"
        subtitle="Kelola database perusahaan mitra dunia usaha & industri, dokumen MoU/PKS, penempatan siswa, supervisi kunjungan, serta rekapitulasi nilai PKL."
        icon={Building2}
        rightContent={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleClearAllPklData}
              className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#FFC4D4] bg-[#FFE8EF] px-3.5 text-xs font-bold text-[#E14A74] hover:bg-[#FFD6E3] cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="Kosongkan seluruh data di menu Administrasi PKL"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Kosongkan Data PKL</span>
            </button>

            {partners.length === 0 && (
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#BCEBD0] bg-[#E7F9EF] px-3.5 text-xs font-bold text-[#139A4C] hover:bg-[#D5F4E3] cursor-pointer transition-colors whitespace-nowrap shrink-0"
                title="Muat contoh data mitra industri & penempatan PKL"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#139A4C] shrink-0" />
                <span>Muat Contoh Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddPartnerModal(true)}
              className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#5E52A8] cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Tambah Instansi Mitra</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (partners.length === 0) {
                  showToast('Tambahkan instansi mitra terlebih dahulu sebelum menjadwalkan supervisi.');
                  return;
                }
                setShowAddVisitModal(true);
              }}
              className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D8D3F2] bg-[#F4F3FA] px-3.5 text-xs font-bold text-[#5E53A8] hover:bg-[#EAE7F8] cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Calendar className="h-3.5 w-3.5 text-[#6C60B8] shrink-0" />
              <span>Jadwal Supervisi</span>
            </button>
          </div>
        }
      />

      {/* Top 4 Ornate Key Metrics Bar (Stationary In-Place 3D Flipcard & Single Top Floating Icon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 items-stretch">
        <OrnateCard
          boxId="pkl_metric_partners"
          className="p-5"
          minFlipHeight="min-h-[172px]"
          flipBack={
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="pr-16">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/90 block truncate">
                    ✦ Detail Instansi PKL
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Instansi</span>
                    <span className="font-black text-white text-[11px] leading-tight block mt-0.5">
                      {partners.length} Mitra
                    </span>
                  </div>
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Kuota PKL</span>
                    <span className="font-black text-[#FFE680] text-[11px] leading-tight block mt-0.5">
                      {totalCapacity} Siswa
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[10px] font-extrabold text-[#FFE680]">
                <span>Sektor: {Math.max(0, sectors.length - 1)} Bidang</span>
                <span>Terverifikasi</span>
              </div>
            </div>
          }
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <AcademyCornerBadge text="MITRA • INSTANSI" className="mb-1.5" />
              <span className="text-xs font-bold text-[#6E7287] dark:text-slate-400 block truncate">
                Instansi Penempatan
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#262833] dark:text-white mt-1 leading-tight tabular-nums">
                {partners.length}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EFEFF7] dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-[#139A4C] dark:text-emerald-400">
              <span>Perusahaan Terafiliasi</span>
              <span>Aktif</span>
            </div>
          </div>
        </OrnateCard>

        <OrnateCard
          boxId="pkl_metric_students"
          className="p-5"
          minFlipHeight="min-h-[164px]"
          flipBack={
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="pr-16">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/90 block truncate">
                    ✦ Rasio Penempatan
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Siswa Aktif</span>
                    <span className="font-black text-white text-[11px] leading-tight block mt-0.5">
                      {totalActiveStudents} Siswa
                    </span>
                  </div>
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Keterisian</span>
                    <span className="font-black text-[#FFE680] text-[11px] leading-tight block mt-0.5">
                      {totalCapacity > 0 ? Math.round((totalActiveStudents / totalCapacity) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[10px] font-extrabold text-[#FFE680]">
                <span>Total Kuota: {totalCapacity}</span>
                <span>Aktif</span>
              </div>
            </div>
          }
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <AcademyCornerBadge text="PESERTA • PRAKERIN" className="mb-1.5" />
              <span className="text-xs font-bold text-[#6E7287] dark:text-slate-400 block truncate">
                Siswa Sedang PKL
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#262833] dark:text-white mt-1 leading-tight tabular-nums">
                {totalActiveStudents}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EFEFF7] dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-[#6C60B8] dark:text-indigo-300">
              <span>Dari {totalCapacity} Kuota Tersedia</span>
              <span>Terdata</span>
            </div>
          </div>
        </OrnateCard>

        <OrnateCard
          boxId="pkl_metric_mou"
          className="p-5"
          minFlipHeight="min-h-[164px]"
          flipBack={
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="pr-16">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/90 block truncate">
                    ✦ Legalitas MoU / PKS
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">MoU Aktif</span>
                    <span className="font-black text-white text-[11px] leading-tight block mt-0.5">
                      {activeMousCount} Dokumen
                    </span>
                  </div>
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Cakupan</span>
                    <span className="font-black text-[#FFE680] text-[11px] leading-tight block mt-0.5">
                      {partners.length > 0 ? Math.round((activeMousCount / partners.length) * 100) : 0}% Mitra
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[10px] font-extrabold text-[#FFE680]">
                <span>Status Dokumen</span>
                <span>Berlaku</span>
              </div>
            </div>
          }
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <AcademyCornerBadge text="DOKUMEN • KERJA SAMA" className="mb-1.5" />
              <span className="text-xs font-bold text-[#6E7287] dark:text-slate-400 block truncate">
                Kerja Sama MoU/PKS
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#262833] dark:text-white mt-1 leading-tight tabular-nums">
                {activeMousCount}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EFEFF7] dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-[#139A4C] dark:text-emerald-400">
              <span>Berstatus Sah &amp; Berlaku</span>
              <span>Terverifikasi</span>
            </div>
          </div>
        </OrnateCard>

        <OrnateCard
          boxId="pkl_metric_visits"
          className="p-5"
          minFlipHeight="min-h-[164px]"
          flipBack={
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="pr-16">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/90 block truncate">
                    ✦ Supervisi Pembimbing
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Kunjungan</span>
                    <span className="font-black text-white text-[11px] leading-tight block mt-0.5">
                      {visits.length} Sesi
                    </span>
                  </div>
                  <div className="no-ornament rounded-lg bg-white/15 border border-white/20 px-2 py-1.5">
                    <span className="text-white/80 block text-[10px] leading-tight">Laporan</span>
                    <span className="font-black text-[#FFE680] text-[11px] leading-tight block mt-0.5">
                      {studentReports.length} Siswa
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[10px] font-extrabold text-[#FFE680]">
                <span>Monitoring Lapangan</span>
                <span>Tersinkron</span>
              </div>
            </div>
          }
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              <AcademyCornerBadge text="AGENDA • MONITORING" className="mb-1.5" />
              <span className="text-xs font-bold text-[#6E7287] dark:text-slate-400 block truncate">
                Supervisi Kunjungan
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#262833] dark:text-white mt-1 leading-tight tabular-nums">
                {visits.length}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#EFEFF7] dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-[#F25781] dark:text-rose-400">
              <span>Monitoring Terjadwal</span>
              <span>Aktif</span>
            </div>
          </div>
        </OrnateCard>
      </div>

      {/* Main Tabs Selection (Sidebar Glass + Liquid Bulge + Mobile/Tablet Seesaw Tilt) */}
      <LiquidNavBar
        ariaLabel="Navigasi Modul Administrasi PKL"
        activeId={activeTab}
        onSelect={id => setActiveTab(id as 'dudi_database' | 'automated_reports' | 'alumni_tracer')}
        items={[
          {
            id: 'dudi_database',
            label: 'A. Database Instansi Mitra PKL',
            icon: <Building2 className="h-4 w-4" />,
            badge: partners.length,
          },
          {
            id: 'automated_reports',
            label: 'B. Laporan & Rekap Otomatis PKL',
            icon: <FileSpreadsheet className="h-4 w-4" />,
            badge: studentReports.length,
          },
          {
            id: 'alumni_tracer',
            label: 'C. Tracer Study Alumni',
            icon: <GraduationCap className="h-4 w-4" />,
            badge: pklTracers.length,
          },
        ]}
      />

      {/* ==================================================================== */}
      {/* SECTION A: DATABASE MITRA INDUSTRI / DUDI (WITH FULL CRUD)           */}
      {/* ==================================================================== */}
      {activeTab === 'dudi_database' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-[#ECEAF6] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8BA3]" />
              <input
                type="text"
                placeholder="Cari perusahaan, HRD, bidang usaha, atau kota..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-9.5 w-full rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] pl-9 pr-4 text-xs font-medium text-[#262341] placeholder:text-[#9694A8] focus:border-[#6C60B8] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-[#8E8BA3] shrink-0" />
                <select
                  value={selectedSectorFilter}
                  onChange={e => setSelectedSectorFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-[#E2DFEF] bg-[#FAF9FE] px-3 text-xs font-bold text-[#3E385B] focus:border-[#6C60B8] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {sectors.map(sec => (
                    <option key={sec} value={sec}>
                      {sec === 'ALL' ? 'Semua Bidang Usaha' : sec}
                    </option>
                  ))}
                </select>
              </div>

              <SortByControl value={sortBy} onChange={setSortBy} />

              <span className="rounded-xl bg-[#F0EEFA] px-3 py-1.5 text-xs text-[#6C60B8] font-extrabold tabular-nums whitespace-nowrap">
                {filteredPartners.length} Mitra
              </span>
            </div>
          </div>

          {/* Empty State */}
          {filteredPartners.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#D8D3F2] bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EEFA] text-[#6C60B8] dark:bg-indigo-950/60 dark:text-indigo-400">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[#262341] dark:text-white">
                Belum Ada Data Mitra Industri / DUDI
              </h3>
              <p className="mt-1 text-xs text-[#7A7596] max-w-sm mx-auto">
                Silakan tambahkan data perusahaan mitra DUDI baru, atau muat template contoh data industri untuk memulai.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(true)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Tambah Mitra DUDI</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E2DFEF] bg-white px-4 text-xs font-bold text-[#3E385B] hover:bg-[#FAF9FE] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#6C60B8] shrink-0" />
                  <span>Muat Template Contoh</span>
                </button>
              </div>
            </div>
          )}

          {/* List of DUDI Partners */}
          <div className="space-y-4">
            {filteredPartners.map(partner => {
              const isExpanded = expandedPartnerId === partner.id;
              const activeCount = partner.placements?.filter(p => p.status === 'sedang_berjalan').length || 0;
              const quotaPercent = Math.min(100, Math.round((activeCount / (partner.quota || 1)) * 100));

              return (
                <div
                  key={partner.id}
                  className="rounded-2xl border border-[#E6E4F2] bg-white shadow-xs transition-all hover:border-[#D0CBEF] dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                >
                  {/* Card Header Summary */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 gap-4 hover:bg-[#FAF9FE]/70 dark:hover:bg-slate-800/40 transition-colors">
                    <div
                      onClick={() => setExpandedPartnerId(isExpanded ? null : partner.id)}
                      className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EEFA] dark:bg-indigo-950/60 text-[#6C60B8] dark:text-indigo-400 font-black text-sm">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-base font-black text-[#241F3F] dark:text-white leading-snug">
                            {partner.name}
                          </h2>
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                              partner.mouHistory?.[0]?.status === 'aktif'
                                ? 'bg-[#E7F9EF] text-[#139A4C] dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            MoU {partner.mouHistory?.[0]?.status?.toUpperCase() || 'AKTIF'}
                          </span>
                        </div>
                        <p className="text-[11.5px] font-semibold text-[#6C60B8] dark:text-indigo-300 mt-0.5">
                          {partner.sector} &middot; {partner.city}
                        </p>
                        <div className="flex items-center gap-x-4 gap-y-1 text-xs text-[#6E6A86] dark:text-slate-400 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#8E8BA3] shrink-0" />
                            <span>{partner.address}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-[#8E8BA3] shrink-0" />
                            <span>
                              HRD: <strong className="text-[#3E385B] dark:text-slate-200">{partner.hrdName}</strong> ({partner.hrdPhone})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quota Progress & Rating & Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#EFEFF7] dark:border-slate-800">
                      <div className="w-36 text-right tabular-nums">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-[#8E8BA3]">Kuota PKL</span>
                          <span className="font-extrabold text-[#252042] dark:text-slate-200">
                            {activeCount} / {partner.quota}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#EFEFF7] dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              quotaPercent >= 100
                                ? 'bg-[#F25781]'
                                : quotaPercent >= 70
                                ? 'bg-amber-500'
                                : 'bg-[#6C60B8]'
                            }`}
                            style={{ width: `${quotaPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-center border-l border-[#ECEAF6] dark:border-slate-800 pl-3.5 tabular-nums">
                        <div className="flex items-center gap-0.5 text-amber-500 font-black text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{partner.evaluation?.rating || 5}.0</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#8E8BA3]">Evaluasi</span>
                      </div>

                      {/* CRUD Partner Buttons */}
                      <div className="inline-flex items-center gap-1 border-l border-[#ECEAF6] dark:border-slate-800 pl-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingPartner(partner)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer shrink-0"
                          title="Edit Profil Perusahaan"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePartner(partner)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#7A7596] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                          title="Hapus Perusahaan DUDI"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedPartnerId(isExpanded ? null : partner.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6C60B8] bg-[#F4F3FA] hover:bg-[#EAE7F8] dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                        >
                          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Tabs & Content */}
                  {isExpanded && (
                    <div className="border-t border-[#ECEAF6] bg-[#FAF9FE]/70 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40 space-y-5 animate-fade-in">
                      {/* Grid 1: Kontak HRD & Detail MoU */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Box Kontak HRD */}
                        <div className="rounded-2xl border border-[#E6E4F2] bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h3 className="text-xs font-extrabold text-[#241F3F] dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-[#6C60B8] shrink-0" />
                              <span>Kontak HRD &amp; Penanggung Jawab DUDI</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => setEditingPartner(partner)}
                              className="inline-flex h-7 items-center justify-center rounded-lg border border-[#DDD8F6] bg-[#F4F2FC] px-2.5 text-[11px] font-bold text-[#6C60B8] hover:bg-[#EAE7F8] dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Edit Kontak
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[#8E8BA3] block text-[10px]">Nama HRD:</span>
                              <strong className="text-[#241F3F] dark:text-slate-200">{partner.hrdName}</strong>
                            </div>
                            <div>
                              <span className="text-[#8E8BA3] block text-[10px]">Jabatan / Posisi:</span>
                              <span className="text-[#4E496E] dark:text-slate-300">{partner.hrdPosition}</span>
                            </div>
                            <div>
                              <span className="text-[#8E8BA3] block text-[10px]">No. Telepon / WA:</span>
                              <span className="text-[#6C60B8] dark:text-indigo-300 font-bold tabular-nums">{partner.hrdPhone}</span>
                            </div>
                            <div>
                              <span className="text-[#8E8BA3] block text-[10px]">Email Resmi:</span>
                              <span className="text-[#4E496E] dark:text-slate-300 font-mono text-[11px] break-all">{partner.hrdEmail}</span>
                            </div>
                          </div>
                        </div>

                        {/* Box Riwayat Kerja Sama MoU / PKS */}
                        <div className="rounded-2xl border border-[#E6E4F2] bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h3 className="text-xs font-extrabold text-[#241F3F] dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                              <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Riwayat Kerja Sama &amp; Masa Berlaku MoU/PKS</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setMouModalPartner(partner);
                                setMouForm({
                                  mouNumber: `MoU/SMKMY/DUDI/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
                                  startDate: new Date().toISOString().split('T')[0],
                                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
                                  scope: 'Penyelenggaraan PKL Siswa, Guru Tamu & Penyerapan Lulusan',
                                  status: 'aktif',
                                  documentTitle: `PKS Perpanjangan Kemitraan Vokasi ${partner.name}`,
                                });
                              }}
                              className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Plus className="h-3 w-3 shrink-0" />
                              <span>Perpanjang MoU</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(partner.mouHistory || []).map(mou => (
                              <div
                                key={mou.id}
                                className="p-2.5 rounded-xl border border-[#ECEAF6] bg-[#FAF9FE] dark:border-slate-800 dark:bg-slate-800/60 text-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-[#6C60B8] dark:text-indigo-300">
                                    {mou.mouNumber}
                                  </span>
                                  <div className="inline-flex items-center gap-1.5 shrink-0">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        mou.status === 'aktif'
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      }`}
                                    >
                                      {mou.status}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingMou({ partnerId: partner.id, mou })}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] cursor-pointer"
                                      title="Edit Dokumen MoU"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMou(partner.id, mou.id, mou.mouNumber)}
                                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#7A7596] hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                      title="Hapus MoU ini"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                <p className="font-semibold text-[#241F3F] dark:text-slate-200 text-[11px] mt-1">
                                  {mou.documentTitle}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#7A7596] mt-1 tabular-nums">
                                  <span>Berlaku: {mou.startDate} s/d <strong>{mou.endDate}</strong></span>
                                  <span>Ruang Lingkup: {mou.scope}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Riwayat Penempatan Siswa per Perusahaan (CRUD Siswa) */}
                      <div className="rounded-2xl border border-[#E6E4F2] bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-xs font-extrabold text-[#241F3F] dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#6C60B8] shrink-0" />
                            <span>Riwayat Penempatan Siswa di {partner.name}</span>
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setPlacementModalPartner(partner);
                              setPlacementForm({
                                studentId: students[0]?.id || '',
                                period: 'Juli - Desember 2026',
                                schoolMentorName: 'Budi Santoso, S.Kom',
                                industryMentorName: `${partner.hrdName} / Pembimbing Teknis`,
                                status: 'sedang_berjalan',
                                finalScore: 88,
                              });
                            }}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-3 text-[11px] font-bold text-white hover:bg-[#5B4FA8] cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5 shrink-0" />
                            <span>Tempatkan Siswa Baru</span>
                          </button>
                        </div>

                        {(partner.placements || []).length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#8E8BA3] italic">
                            Belum ada siswa yang ditempatkan di perusahaan ini. Klik "+ Tempatkan Siswa Baru" di atas.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-[#ECEAF6] bg-[#FAF9FE] text-[#4E496E] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 font-bold">
                                  <th className="p-2 w-10 text-center">No</th>
                                  <th className="p-2">NISN</th>
                                  <th className="p-2">Nama Siswa</th>
                                  <th className="p-2">Kelas / Jurusan</th>
                                  <th className="p-2">Periode PKL</th>
                                  <th className="p-2">Pembimbing Sekolah</th>
                                  <th className="p-2">Pembimbing DUDI</th>
                                  <th className="p-2 text-center">Nilai Akhir</th>
                                  <th className="p-2 text-center">Status</th>
                                  <th className="p-2 text-center w-20">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#ECEAF6] dark:divide-slate-800">
                                {partner.placements.map((plc, idx) => (
                                  <tr key={plc.id} className="hover:bg-[#FAF9FE] dark:hover:bg-slate-800/40">
                                    <td className="p-2 text-center text-[#8E8BA3] tabular-nums">{idx + 1}</td>
                                    <td className="p-2 font-mono text-[11px] text-[#7A7596]">{plc.nisn}</td>
                                    <td className="p-2 font-bold text-[#241F3F] dark:text-white">{plc.studentName}</td>
                                    <td className="p-2">
                                      <span className="font-semibold">{plc.className}</span> ({plc.majorCode})
                                    </td>
                                    <td className="p-2 text-[#7A7596] text-[11px]">{plc.period}</td>
                                    <td className="p-2 text-[#4E496E] dark:text-slate-300">{plc.schoolMentorName}</td>
                                    <td className="p-2 text-[#4E496E] dark:text-slate-300">{plc.industryMentorName}</td>
                                    <td className="p-2 text-center font-bold text-[#6C60B8] dark:text-indigo-300 tabular-nums">
                                      {plc.finalScore ? `${plc.finalScore} (${plc.grade})` : '-'}
                                    </td>
                                    <td className="p-2 text-center">
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                          plc.status === 'sedang_berjalan'
                                            ? 'bg-[#EAE7F8] text-[#5B4FA8] dark:bg-indigo-950 dark:text-indigo-300'
                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        }`}
                                      >
                                        {plc.status === 'sedang_berjalan' ? 'Sedang PKL' : 'Selesai'}
                                      </span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <div className="inline-flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingPlacement({ partnerId: partner.id, placement: plc })}
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] cursor-pointer shrink-0"
                                          title="Edit Nilai & Status Penempatan"
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePlacement(partner.id, plc.id, plc.studentName)}
                                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-rose-50 hover:text-rose-600 cursor-pointer shrink-0"
                                          title="Tarik Siswa dari Perusahaan"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Evaluasi Perusahaan oleh Sekolah (CRUD Evaluasi) */}
                      <div className="rounded-2xl border border-[#E6E4F2] bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <h3 className="text-xs font-extrabold text-[#241F3F] dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>Evaluasi Perusahaan oleh Sekolah ORBITA</span>
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setEvaluatingPartner(partner);
                              setEvalForm({
                                rating: partner.evaluation?.rating || 5,
                                workCultureScore: partner.evaluation?.workCultureScore || 90,
                                guidanceScore: partner.evaluation?.guidanceScore || 90,
                                facilityScore: partner.evaluation?.facilityScore || 90,
                                curriculumRelevanceScore: partner.evaluation?.curriculumRelevanceScore || 90,
                                recommendation: partner.evaluation?.recommendation || 'Sangat Direkomendasikan',
                                notes: partner.evaluation?.notes || '',
                              });
                              setShowEvaluationModal(true);
                            }}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] px-3 text-xs font-bold text-[#6C60B8] hover:bg-[#EAE7F8] dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Edit3 className="h-3.5 w-3.5 shrink-0" />
                            <span>Beri / Perbarui Evaluasi</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4 tabular-nums">
                          <div className="p-3 rounded-xl bg-[#FAF9FE] dark:bg-slate-800/60 border border-[#ECEAF6] dark:border-slate-800">
                            <span className="text-[10px] text-[#7A7596] block font-semibold">Budaya Kerja (5R &amp; K3)</span>
                            <strong className="text-lg font-black text-[#241F3F] dark:text-slate-100">
                              {partner.evaluation?.workCultureScore || 90}
                            </strong>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FAF9FE] dark:bg-slate-800/60 border border-[#ECEAF6] dark:border-slate-800">
                            <span className="text-[10px] text-[#7A7596] block font-semibold">Bimbingan Teknis</span>
                            <strong className="text-lg font-black text-[#241F3F] dark:text-slate-100">
                              {partner.evaluation?.guidanceScore || 90}
                            </strong>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FAF9FE] dark:bg-slate-800/60 border border-[#ECEAF6] dark:border-slate-800">
                            <span className="text-[10px] text-[#7A7596] block font-semibold">Kelayakan Fasilitas</span>
                            <strong className="text-lg font-black text-[#241F3F] dark:text-slate-100">
                              {partner.evaluation?.facilityScore || 90}
                            </strong>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FAF9FE] dark:bg-slate-800/60 border border-[#ECEAF6] dark:border-slate-800">
                            <span className="text-[10px] text-[#7A7596] block font-semibold">Relevansi Kurikulum</span>
                            <strong className="text-lg font-black text-[#241F3F] dark:text-slate-100">
                              {partner.evaluation?.curriculumRelevanceScore || 90}
                            </strong>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F4F2FC]/80 dark:bg-indigo-950/30 border border-[#DDD8F6] dark:border-indigo-900/40 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-[#241F3F] dark:text-indigo-200">
                              Rekomendasi: {partner.evaluation?.recommendation || 'Direkomendasikan'}
                            </span>
                            <span className="text-[10px] text-[#7A7596]">
                              Dinilai oleh: {partner.evaluation?.evaluatorName || 'Tim Hubin'}
                            </span>
                          </div>
                          <p className="text-[#4E496E] dark:text-slate-300 italic text-[11px] leading-relaxed">
                            "{partner.evaluation?.notes || 'Perusahaan mitra menunjukkan pembinaan kejuruan yang baik.'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION B: LAPORAN DAN REKAP OTOMATIS (WITH FULL CRUD)               */}
      {/* ==================================================================== */}
      {activeTab === 'automated_reports' && (
        <div className="space-y-6">
          {/* Sub-tab Navigation & Action Bar (Clean 2-Tier Grid — Fixes ragged wrap on all screen widths) */}
          <div className="rounded-2xl border border-[#ECEAF6] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            {/* Tier 1: Label + Export & Entry Action Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 items-center rounded-lg bg-[#F0EEFA] dark:bg-indigo-950/70 px-2.5 text-[11px] font-extrabold text-[#6C60B8] dark:text-indigo-300">
                  Pilih Kategori Rekapitulasi PKL
                </span>
              </div>

              {/* Export & Action Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentReportForm({
                      studentId: students[0]?.id || '',
                      partnerId: partners[0]?.id || '',
                      reportTitle: '',
                      submissionStatus: 'sudah_dikumpulkan',
                      submissionDate: new Date().toISOString().split('T')[0],
                      schoolMentorScore: 88,
                      industryMentorScore: 90,
                      absorbedStatus: 'terserap_kerja',
                    });
                    setShowAddReportModal(true);
                  }}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-3.5 text-xs font-extrabold text-white hover:bg-[#5B4FA8] cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Entri Laporan Siswa</span>
                </button>

                <button
                  type="button"
                  onClick={exportToExcelReport}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#BCEBD0] bg-[#E7F9EF] px-3.5 text-xs font-bold text-[#139A4C] hover:bg-[#D5F4E3] dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                  title="Unduh Lembar Kerja Excel (.xlsx)"
                >
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={exportToCsvReport}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E2DFEF] bg-white px-3.5 text-xs font-bold text-[#3E385B] hover:bg-[#FAF9FE] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                  title="Unduh Data CSV (.csv)"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportToPdfReport}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#DDD8F6] bg-[#F4F2FC] px-3.5 text-xs font-bold text-[#6C60B8] dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-2xs hover:bg-[#EAE7F8] cursor-pointer whitespace-nowrap shrink-0"
                  title="Cetak Laporan PDF Resmi Lengkap dengan Kop Sekolah"
                >
                  <Printer className="h-3.5 w-3.5 shrink-0" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>

            {/* Tier 2: Balanced Sub-Tab LiquidNavBar (Sidebar Glass + Liquid Bulge + Seesaw Tilt) */}
            <LiquidNavBar
              size="sm"
              ariaLabel="Sub-Navigasi Laporan PKL"
              activeId={reportSubTab}
              onSelect={id => setReportSubTab(id as any)}
              items={[
                { id: 'by_class_major', label: '1. Rekap Kelas & Jurusan' },
                { id: 'by_company', label: '2. Rekap per Perusahaan' },
                { id: 'visits_attendance', label: '3. Absensi & Kunjungan' },
                { id: 'pending_reports', label: '4. Laporan Belum Kumpul' },
                { id: 'grades', label: '5. Rekap Nilai PKL' },
                { id: 'graduate_absorption', label: '6. Penyerapan Lulusan' },
              ]}
            />
          </div>

          {/* SUB-VIEW 1: REKAP KELAS & JURUSAN */}
          {reportSubTab === 'by_class_major' && (
            <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <HighlightedChartHeader
                title="Rekapitulasi Peserta PKL Berdasarkan Kelas & Jurusan"
                subtitle={`Pemetaan distribusi siswa di industri mitra kerja sama • Tahun Ajaran ${activeAcademicYear.name}`}
                accent="purple"
                rightSlot={
                  <span className="text-xs font-extrabold text-[#6C60B8] bg-[#F0EEFA] border border-[#DDD8F6] dark:bg-indigo-950/60 px-3 py-1 rounded-xl tabular-nums">
                    Total {studentReports.length} Siswa Terdata
                  </span>
                }
              />

              {studentReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  Belum ada peserta PKL yang terdaftar. Klik "+ Entri Laporan Siswa" di atas untuk menambahkan peserta.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">NISN</th>
                        <th className="p-2.5">Nama Siswa</th>
                        <th className="p-2.5">Kelas</th>
                        <th className="p-2.5">Jurusan</th>
                        <th className="p-2.5">Perusahaan Penempatan DUDI</th>
                        <th className="p-2.5">Judul Laporan PKL</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-center">Nilai</th>
                        <th className="p-2.5 text-center w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentReports.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 text-center text-slate-400">{i + 1}</td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{r.nisn}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{r.studentName}</td>
                          <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">{r.className}</td>
                          <td className="p-2.5">
                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold text-[10px]">
                              {r.majorCode}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{r.partnerName}</td>
                          <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate" title={r.reportTitle}>
                            {r.reportTitle}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                r.submissionStatus === 'sudah_dikumpulkan'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : r.submissionStatus === 'revisi'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {r.submissionStatus === 'sudah_dikumpulkan'
                                ? 'Sudah Kumpul'
                                : r.submissionStatus === 'revisi'
                                ? 'Revisi'
                                : 'Belum Kumpul'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-blue-600 dark:text-cyan-400">
                            {r.finalScore} ({r.grade})
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingReportItem(r)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer shrink-0"
                                title="Edit Laporan Siswa"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudentReport(r)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer shrink-0"
                                title="Hapus Laporan Siswa"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: REKAP PENEMPATAN BERDASARKAN PERUSAHAAN */}
          {reportSubTab === 'by_company' && (
            <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <HighlightedChartHeader
                title="Rekapitulasi Penempatan Siswa Berdasarkan Perusahaan Mitra DUDI"
                subtitle="Kapasitas kuota, tingkat keterisian siswa magang, masa berlaku MoU, dan evaluasi kepuasan sekolah"
                accent="purple"
                rightSlot={
                  <span className="text-xs font-extrabold text-[#6C60B8] bg-[#F0EEFA] border border-[#DDD8F6] dark:bg-indigo-950/60 px-3 py-1 rounded-xl tabular-nums">
                    Total {partners.length} Perusahaan Mitra
                  </span>
                }
              />

              {partners.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8BA3] italic">
                  Belum ada perusahaan mitra di database. Silakan tambahkan mitra DUDI terlebih dahulu.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#ECEAF6] bg-[#FAF9FE] text-[#4E496E] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">Nama Perusahaan</th>
                        <th className="p-2.5">Bidang Usaha</th>
                        <th className="p-2.5">Kota</th>
                        <th className="p-2.5">Kontak HRD</th>
                        <th className="p-2.5 text-center">Kuota</th>
                        <th className="p-2.5 text-center">Terisi</th>
                        <th className="p-2.5 text-center">Sisa</th>
                        <th className="p-2.5 text-center">Masa MoU</th>
                        <th className="p-2.5 text-center">Rating</th>
                        <th className="p-2.5 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEAF6] dark:divide-slate-800">
                      {partners.map((p, idx) => {
                        const filled = p.placements?.filter(pl => pl.status === 'sedang_berjalan').length || 0;
                        const remaining = Math.max(0, p.quota - filled);

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF9FE] dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-center text-[#8E8BA3] tabular-nums">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-[#241F3F] dark:text-white">{p.name}</td>
                            <td className="p-2.5 text-[#4E496E] dark:text-slate-300">{p.sector}</td>
                            <td className="p-2.5 text-[#7A7596]">{p.city}</td>
                            <td className="p-2.5">
                              <span className="font-semibold block">{p.hrdName}</span>
                              <span className="text-[10px] text-[#8E8BA3] tabular-nums">{p.hrdPhone}</span>
                            </td>
                            <td className="p-2.5 text-center font-bold tabular-nums">{p.quota}</td>
                            <td className="p-2.5 text-center font-bold text-[#6C60B8] dark:text-indigo-300 tabular-nums">{filled}</td>
                            <td className="p-2.5 text-center font-semibold text-emerald-600 tabular-nums">{remaining}</td>
                            <td className="p-2.5 text-center font-mono text-[11px] text-[#7A7596] tabular-nums">
                              {p.mouHistory?.[0]?.endDate || '-'}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="font-bold text-amber-500 flex items-center justify-center gap-1 tabular-nums">
                                <Star className="h-3 w-3 fill-amber-400" />
                                {p.evaluation?.rating || 5}.0
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setEditingPartner(p)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] cursor-pointer shrink-0"
                                title="Edit Kuota / Data Perusahaan"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: ABSENSI & KUNJUNGAN PEMBIMBING */}
          {reportSubTab === 'visits_attendance' && (
            <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <HighlightedChartHeader
                title="Rekapitulasi Absensi & Kunjungan Supervisi Guru Pembimbing"
                subtitle="Logbook monitoring berkala, persentase kehadiran siswa, dan umpan balik pembimbing DUDI"
                accent="emerald"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowAddVisitModal(true)}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-3 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>Tambah Kunjungan</span>
                  </button>
                }
              />

              {visits.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8BA3] italic">
                  Belum ada log kunjungan supervisi. Klik "+ Tambah Kunjungan" untuk menjadwalkan supervisi ke mitra industri.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#ECEAF6] bg-[#FAF9FE] text-[#4E496E] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Perusahaan Mitra DUDI</th>
                        <th className="p-2.5">Guru Pembimbing</th>
                        <th className="p-2.5">Jenis Kunjungan</th>
                        <th className="p-2.5 text-center">Siswa Hadir</th>
                        <th className="p-2.5 text-center">Tingkat Hadir</th>
                        <th className="p-2.5">Catatan Bimbingan &amp; Feedback DUDI</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-center w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEAF6] dark:divide-slate-800">
                      {visits.map((v, idx) => (
                        <tr key={v.id} className="hover:bg-[#FAF9FE] dark:hover:bg-slate-800/40">
                          <td className="p-2.5 text-center text-[#8E8BA3] tabular-nums">{idx + 1}</td>
                          <td className="p-2.5 font-mono text-[11px] text-[#7A7596] whitespace-nowrap tabular-nums">{v.visitDate}</td>
                          <td className="p-2.5 font-bold text-[#241F3F] dark:text-white">{v.partnerName}</td>
                          <td className="p-2.5 text-[#4E496E] dark:text-slate-300 font-semibold">{v.teacherName}</td>
                          <td className="p-2.5">
                            <span className="rounded-md bg-[#F0EEFA] dark:bg-indigo-950 px-2 py-0.5 text-[#6C60B8] dark:text-indigo-300 font-semibold text-[10px]">
                              {v.visitType}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-[#241F3F] dark:text-slate-200 tabular-nums">
                            {v.studentCount} Siswa
                          </td>
                          <td className="p-2.5 text-center font-black text-emerald-600 tabular-nums">
                            {v.attendanceRate}%
                          </td>
                          <td className="p-2.5 text-[11px] text-[#4E496E] dark:text-slate-400 max-w-sm">
                            <p className="line-clamp-2"><strong>Supervisi:</strong> {v.guidanceNotes}</p>
                            <p className="line-clamp-2 mt-0.5 text-[#6C60B8] dark:text-indigo-300"><strong>DUDI:</strong> {v.industryFeedback}</p>
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                v.status === 'terlaksana'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-[#EAE7F8] text-[#5B4FA8] dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {v.status === 'terlaksana' ? 'Terlaksana' : 'Terjadwal'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingVisit(v)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] cursor-pointer shrink-0"
                                title="Edit Catatan Supervisi"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVisit(v)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-rose-50 hover:text-rose-600 cursor-pointer shrink-0"
                                title="Hapus Log Kunjungan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 4: LAPORAN YANG BELUM DIKUMPULKAN */}
          {reportSubTab === 'pending_reports' && (
            <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <HighlightedChartHeader
                title="Rekapitulasi Tunggakan Laporan PKL yang Belum Dikumpulkan"
                subtitle="Daftar siswa yang belum mengunggah laporan akhir magang atau memerlukan revisi pembimbing"
                accent="coral"
                rightSlot={
                  <span className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 px-3 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-300 whitespace-nowrap tabular-nums">
                    {studentReports.filter(r => r.submissionStatus !== 'sudah_dikumpulkan').length} Siswa Menunggak
                  </span>
                }
              />

              {studentReports.filter(r => r.submissionStatus !== 'sudah_dikumpulkan').length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-600 font-bold bg-emerald-50/50 rounded-2xl dark:bg-emerald-950/20">
                  Luar biasa! Semua siswa telah mengumpulkan laporan akhir PKL tepat waktu.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-rose-100 bg-rose-50/60 text-[#4E496E] dark:border-slate-800 dark:bg-rose-950/20 dark:text-slate-200 font-bold">
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">NISN</th>
                        <th className="p-2.5">Nama Siswa</th>
                        <th className="p-2.5">Kelas</th>
                        <th className="p-2.5">Jurusan</th>
                        <th className="p-2.5">Perusahaan Tempat PKL</th>
                        <th className="p-2.5">Judul Proyek Laporan</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-center">Tindakan Langsung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEAF6] dark:divide-slate-800">
                      {studentReports
                        .filter(r => r.submissionStatus !== 'sudah_dikumpulkan')
                        .map((r, idx) => (
                          <tr key={r.id} className="hover:bg-[#FAF9FE] dark:hover:bg-slate-800/40">
                            <td className="p-2.5 text-center text-[#8E8BA3] tabular-nums">{idx + 1}</td>
                            <td className="p-2.5 font-mono text-[11px] text-[#7A7596]">{r.nisn}</td>
                            <td className="p-2.5 font-bold text-[#241F3F] dark:text-white">{r.studentName}</td>
                            <td className="p-2.5 font-semibold text-[#4E496E] dark:text-slate-300">{r.className}</td>
                            <td className="p-2.5">
                              <span className="rounded bg-[#F0EEFA] text-[#6C60B8] dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold">
                                {r.majorCode}
                              </span>
                            </td>
                            <td className="p-2.5 text-[#241F3F] dark:text-slate-200">{r.partnerName}</td>
                            <td className="p-2.5 text-[11px] text-[#7A7596] dark:text-slate-400 max-w-xs truncate">
                              {r.reportTitle}
                            </td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${
                                  r.submissionStatus === 'revisi'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {r.submissionStatus === 'revisi' ? 'Perlu Revisi' : 'Belum Kumpul'}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    savePklReport({
                                      ...r,
                                      submissionStatus: 'sudah_dikumpulkan',
                                      submissionDate: new Date().toISOString().split('T')[0],
                                    });
                                    showToast(`Laporan ${r.studentName} ditandai SUDAH DIKUMPULKAN.`);
                                  }}
                                  className="inline-flex h-7 items-center justify-center rounded-lg bg-emerald-600 px-2.5 text-[10px] font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                                  title="Tandai Sudah Dikumpulkan"
                                >
                                  Verifikasi Kumpul
                                </button>
                                <button
                                  type="button"
                                  onClick={() => showToast(`Notifikasi pengingat laporan berhasil dikirim ke siswa ${r.studentName}.`)}
                                  className="inline-flex h-7 items-center justify-center rounded-lg bg-amber-500 px-2.5 text-[10px] font-bold text-white hover:bg-amber-600 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                                >
                                  Reminder
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 5: REKAP NILAI PKL */}
          {reportSubTab === 'grades' && (
            <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <HighlightedChartHeader
                title="Rekapitulasi Nilai Akhir Praktek Kerja Lapangan (PKL)"
                subtitle="Penggabungan bobot Nilai Pembimbing Sekolah (40%) dan Nilai Pembimbing Industri DUDI (60%)"
                accent="emerald"
                rightSlot={
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 px-3 py-1 rounded-xl tabular-nums">
                    {studentReports.length} Nilai Siswa
                  </span>
                }
              />

              {studentReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8BA3] italic">
                  Belum ada data nilai PKL siswa.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#ECEAF6] bg-[#FAF9FE] text-[#4E496E] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">NISN</th>
                        <th className="p-2.5">Nama Siswa</th>
                        <th className="p-2.5">Kelas / Jurusan</th>
                        <th className="p-2.5">Mitra Industri DUDI</th>
                        <th className="p-2.5 text-center text-[#6C60B8]">Nilai Sekolah (40%)</th>
                        <th className="p-2.5 text-center text-indigo-600">Nilai DUDI (60%)</th>
                        <th className="p-2.5 text-center text-emerald-600 font-black">Nilai Akhir</th>
                        <th className="p-2.5 text-center">Predikat</th>
                        <th className="p-2.5 text-center">Keterangan</th>
                        <th className="p-2.5 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECEAF6] dark:divide-slate-800">
                      {studentReports.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-[#FAF9FE] dark:hover:bg-slate-800/40">
                          <td className="p-2.5 text-center text-[#8E8BA3] tabular-nums">{idx + 1}</td>
                          <td className="p-2.5 font-mono text-[11px] text-[#7A7596]">{r.nisn}</td>
                          <td className="p-2.5 font-bold text-[#241F3F] dark:text-white">{r.studentName}</td>
                          <td className="p-2.5 font-semibold text-[#4E496E] dark:text-slate-300">
                            {r.className} ({r.majorCode})
                          </td>
                          <td className="p-2.5 text-[#241F3F] dark:text-slate-200">{r.partnerName}</td>
                          <td className="p-2.5 text-center font-bold text-[#6C60B8] dark:text-indigo-300 tabular-nums">{r.schoolMentorScore}</td>
                          <td className="p-2.5 text-center font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">{r.industryMentorScore}</td>
                          <td className="p-2.5 text-center font-black text-emerald-600 text-sm bg-emerald-50/20 tabular-nums">
                            {r.finalScore}
                          </td>
                          <td className="p-2.5 text-center font-black">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] ${
                                r.grade === 'A'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-[#EAE7F8] text-[#5B4FA8] dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {r.grade}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="text-[10px] font-bold text-emerald-600">
                              {r.finalScore >= 75 ? 'KOMPETEN' : 'REMEDIAL'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setEditingReportItem(r)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#7A7596] hover:bg-[#F0EEFA] hover:text-[#6C60B8] cursor-pointer shrink-0"
                              title="Edit Nilai PKL Siswa"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 6: STATISTIK PENYERAPAN LULUSAN */}
          {reportSubTab === 'graduate_absorption' && (
            <div className="rounded-2xl border border-[#E6E4F2] bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <HighlightedChartHeader
                title="Statistik Penyerapan Lulusan Pasca PKL di Industri"
                subtitle="Ringkasan pelacakan keterserapan alumni (BMW: Bekerja, Melanjutkan Kuliah, Wirausaha)"
                accent="amber"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setActiveTab('alumni_tracer')}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] px-3 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span>Buka Tracer Study Alumni Lengkap</span>
                  </button>
                }
              />

              {/* Graphical Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 tabular-nums">
                <div className="p-4 rounded-2xl bg-[#E7F9EF]/70 dark:bg-emerald-950/35 border border-[#BCEBD0] dark:border-emerald-800/60 text-center">
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 block">Bekerja di DUDI</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1.5">
                    {studentReports.filter(r => r.absorbedStatus === 'terserap_kerja').length}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {studentReports.length > 0
                      ? Math.round((studentReports.filter(r => r.absorbedStatus === 'terserap_kerja').length / studentReports.length) * 100)
                      : 0}
                    % Rekrutmen DUDI
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F0EEFA]/90 dark:bg-indigo-950/35 border border-[#DDD8F6] dark:border-indigo-800/60 text-center">
                  <span className="text-xs font-extrabold text-[#4E4392] dark:text-indigo-300 block">Lanjut Kuliah (PTN/S)</span>
                  <p className="text-3xl font-black text-[#6C60B8] dark:text-indigo-400 mt-1.5">
                    {studentReports.filter(r => r.absorbedStatus === 'melanjutkan_kuliah').length}
                  </p>
                  <span className="text-[10px] font-semibold text-[#5B4FA8] dark:text-indigo-400">
                    {studentReports.length > 0
                      ? Math.round((studentReports.filter(r => r.absorbedStatus === 'melanjutkan_kuliah').length / studentReports.length) * 100)
                      : 0}
                    % Studi Lanjutan
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF7EA] dark:bg-amber-950/35 border border-[#F5DFB8] dark:border-amber-800/60 text-center">
                  <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 block">Wirausaha Mandiri</span>
                  <p className="text-3xl font-black text-amber-600 mt-1.5">
                    {studentReports.filter(r => r.absorbedStatus === 'wirausaha').length}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    {studentReports.length > 0
                      ? Math.round((studentReports.filter(r => r.absorbedStatus === 'wirausaha').length / studentReports.length) * 100)
                      : 0}
                    % Bisnis Mandiri
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF0F4] dark:bg-rose-950/35 border border-[#FBCFE0] dark:border-rose-800/60 text-center">
                  <span className="text-xs font-extrabold text-rose-800 dark:text-rose-300 block">Menunggu Seleksi</span>
                  <p className="text-3xl font-black text-[#F25781] mt-1.5">
                    {studentReports.filter(r => r.absorbedStatus === 'mencari_kerja').length}
                  </p>
                  <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                    Penyaluran BKK
                  </span>
                </div>
              </div>

              {/* Detail Table */}
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ECEAF6] bg-[#FAF9FE] text-[#4E496E] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 font-bold">
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">NISN</th>
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5">Kelas</th>
                      <th className="p-2.5">Mitra DUDI Tempat PKL</th>
                      <th className="p-2.5">Status Penyerapan Pasca PKL</th>
                      <th className="p-2.5 text-center w-28">Ubah Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEAF6] dark:divide-slate-800">
                    {studentReports.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-[#FAF9FE] dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-center text-[#8E8BA3] tabular-nums">{idx + 1}</td>
                        <td className="p-2.5 font-mono text-[11px] text-[#7A7596]">{r.nisn}</td>
                        <td className="p-2.5 font-bold text-[#241F3F] dark:text-white">{r.studentName}</td>
                        <td className="p-2.5 font-semibold text-[#4E496E] dark:text-slate-300">{r.className}</td>
                        <td className="p-2.5 text-[#241F3F] dark:text-slate-200">{r.partnerName}</td>
                        <td className="p-2.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              r.absorbedStatus === 'terserap_kerja'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : r.absorbedStatus === 'melanjutkan_kuliah'
                                ? 'bg-[#EAE7F8] text-[#5B4FA8] dark:bg-indigo-950 dark:text-indigo-300'
                                : r.absorbedStatus === 'wirausaha'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {r.absorbedStatus === 'terserap_kerja'
                              ? 'Bekerja di Industri DUDI'
                              : r.absorbedStatus === 'melanjutkan_kuliah'
                              ? 'Melanjutkan Kuliah'
                              : r.absorbedStatus === 'wirausaha'
                              ? 'Wirausaha Mandiri'
                              : 'Menunggu Penempatan Kerja'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <select
                            value={r.absorbedStatus}
                            onChange={e => {
                              const newStatus = e.target.value as any;
                              savePklReport({
                                ...r,
                                absorbedStatus: newStatus,
                              });
                              showToast(`Status alumni ${r.studentName} berhasil diperbarui.`);
                            }}
                            className="rounded-lg border border-[#E2DFEF] bg-white p-1 text-[10px] font-bold text-[#241F3F] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="terserap_kerja">Bekerja di DUDI</option>
                            <option value="melanjutkan_kuliah">Kuliah</option>
                            <option value="wirausaha">Wirausaha</option>
                            <option value="mencari_kerja">Mencari Kerja</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION C: TRACER STUDY ALUMNI & KETERLACAAN KARIER                  */}
      {/* ==================================================================== */}
      {activeTab === 'alumni_tracer' && (
        <PklAlumniTracerSection
          tracers={pklTracers}
          students={students}
          classes={classes}
          partners={partners}
          majors={majors}
          academicYearName={activeAcademicYear.name}
          onSaveTracer={savePklTracer}
          onSaveTracersBatch={savePklTracersBatch}
          onDeleteTracer={deletePklTracer}
          onClearAllTracers={clearAllPklTracers}
          reportTemplate={reportTemplate}
          onSaveReportTemplate={saveReportTemplate}
          appLogoUrl={visualSettings?.appLogoUrl || undefined}
          onConfirmDelete={(cfg) =>
            setDeleteModalConfig({
              isOpen: true,
              title: cfg.title,
              itemName: cfg.itemName,
              description: cfg.description,
              confirmLabel: 'Hapus Catatan',
              onConfirm: async () => {
                await Promise.resolve(cfg.onConfirm());
                closeDeleteModal();
              },
            })
          }
          onToast={showToast}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH MITRA INDUSTRI / DUDI BARU                            */}
      {/* ==================================================================== */}
      {showAddPartnerModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddPartnerModal(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Tambah Mitra Industri / DUDI Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">Pendaftaran perusahaan mitra kerja sama PKL &amp; vokasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPartnerModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Perusahaan / Lembaga DUDI *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Telekomunikasi Seluler, CV Solusi Digital"
                    value={newPartnerForm.name}
                    onChange={e => setNewPartnerForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bidang Usaha / Sektor *
                  </label>
                  <select
                    value={newPartnerForm.sector}
                    onChange={e => setNewPartnerForm(p => ({ ...p, sector: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Teknologi Informasi & Software">Teknologi Informasi &amp; Software</option>
                    <option value="Jaringan Komputer & Telekomunikasi">Jaringan Komputer &amp; Telekomunikasi</option>
                    <option value="Otomotif & Manufaktur Presisi">Otomotif &amp; Manufaktur Presisi</option>
                    <option value="Perbankan, Akuntansi & Keuangan">Perbankan, Akuntansi &amp; Keuangan</option>
                    <option value="Desain Grafis, Percetakan Digital & Multimedia">Desain Grafis &amp; Multimedia</option>
                    <option value="Bisnis Daring & Logistik">Bisnis Daring &amp; Logistik</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kuota Penerimaan Siswa (Orang) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newPartnerForm.quota}
                    onChange={e => setNewPartnerForm(p => ({ ...p, quota: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alamat Kantor / Pabrik</label>
                  <input
                    type="text"
                    placeholder="Jl. Pelabuhan II KM. 18, Cikembar"
                    value={newPartnerForm.address}
                    onChange={e => setNewPartnerForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Kontak HRD</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rina Rahayu, S.Psi"
                    value={newPartnerForm.hrdName}
                    onChange={e => setNewPartnerForm(p => ({ ...p, hrdName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. WhatsApp / HP HRD</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={newPartnerForm.hrdPhone}
                    onChange={e => setNewPartnerForm(p => ({ ...p, hrdPhone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Resmi HRD</label>
                  <input
                    type="email"
                    placeholder="hrd@perusahaan.com"
                    value={newPartnerForm.hrdEmail}
                    onChange={e => setNewPartnerForm(p => ({ ...p, hrdEmail: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Surat MoU / PKS</label>
                  <input
                    type="text"
                    placeholder="MoU/SMKMY/2026/001"
                    value={newPartnerForm.mouNumber}
                    onChange={e => setNewPartnerForm(p => ({ ...p, mouNumber: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Mitra DUDI
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT DATA MITRA INDUSTRI / DUDI                              */}
      {/* ==================================================================== */}
      {editingPartner && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingPartner(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Edit Data Perusahaan: {editingPartner.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPartner(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePartner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Perusahaan *</label>
                <input
                  type="text"
                  required
                  value={editingPartner.name}
                  onChange={e => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bidang Usaha</label>
                  <input
                    type="text"
                    value={editingPartner.sector}
                    onChange={e => setEditingPartner({ ...editingPartner, sector: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kuota PKL (Siswa)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingPartner.quota}
                    onChange={e => setEditingPartner({ ...editingPartner, quota: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={editingPartner.address}
                  onChange={e => setEditingPartner({ ...editingPartner, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama HRD / Kontak</label>
                  <input
                    type="text"
                    value={editingPartner.hrdName}
                    onChange={e => setEditingPartner({ ...editingPartner, hrdName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. WhatsApp / Telp</label>
                  <input
                    type="tel"
                    value={editingPartner.hrdPhone}
                    onChange={e => setEditingPartner({ ...editingPartner, hrdPhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: TEMPATKAN SISWA BARU DI PERUSAHAAN (CRUD PLACEMENT)          */}
      {/* ==================================================================== */}
      {placementModalPartner && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPlacementModalPartner(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Tempatkan Siswa PKL: {placementModalPartner.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlacementModalPartner(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlacement} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={placementForm.studentId}
                  onChange={e => setPlacementForm({ ...placementForm, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Siswa dari Daftar --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.className} - {s.majorCode}) - NISN: {s.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Periode PKL</label>
                  <input
                    type="text"
                    value={placementForm.period}
                    onChange={e => setPlacementForm({ ...placementForm, period: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nilai Awal (Jika Ada)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={placementForm.finalScore}
                    onChange={e => setPlacementForm({ ...placementForm, finalScore: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Guru Pembimbing Sekolah</label>
                  <input
                    type="text"
                    value={placementForm.schoolMentorName}
                    onChange={e => setPlacementForm({ ...placementForm, schoolMentorName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pembimbing DUDI / Mentor</label>
                  <input
                    type="text"
                    value={placementForm.industryMentorName}
                    onChange={e => setPlacementForm({ ...placementForm, industryMentorName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPlacementModalPartner(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Tempatkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT PENEMPATAN SISWA (NILAI & STATUS)                        */}
      {/* ==================================================================== */}
      {editingPlacement && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingPlacement(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-md rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Edit Penempatan: {editingPlacement.placement.studentName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlacement(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlacement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Penempatan</label>
                  <select
                    value={editingPlacement.placement.status}
                    onChange={e =>
                      setEditingPlacement({
                        ...editingPlacement,
                        placement: { ...editingPlacement.placement, status: e.target.value as any },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="sedang_berjalan">Sedang PKL (Aktif)</option>
                    <option value="selesai">Selesai PKL</option>
                    <option value="ditarik">Ditarik / Batal</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nilai Akhir (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingPlacement.placement.finalScore || 85}
                    onChange={e =>
                      setEditingPlacement({
                        ...editingPlacement,
                        placement: { ...editingPlacement.placement, finalScore: Number(e.target.value) },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pembimbing Sekolah</label>
                <input
                  type="text"
                  value={editingPlacement.placement.schoolMentorName}
                  onChange={e =>
                    setEditingPlacement({
                      ...editingPlacement,
                      placement: { ...editingPlacement.placement, schoolMentorName: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pembimbing DUDI</label>
                <input
                  type="text"
                  value={editingPlacement.placement.industryMentorName}
                  onChange={e =>
                    setEditingPlacement({
                      ...editingPlacement,
                      placement: { ...editingPlacement.placement, industryMentorName: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlacement(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH / PERPANJANG MOU                                      */}
      {/* ==================================================================== */}
      {mouModalPartner && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setMouModalPartner(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-md rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Perpanjang MoU: {mouModalPartner.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMouModalPartner(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMou} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Surat MoU/PKS *</label>
                <input
                  type="text"
                  required
                  value={mouForm.mouNumber}
                  onChange={e => setMouForm({ ...mouForm, mouNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Perjanjian</label>
                <input
                  type="text"
                  value={mouForm.documentTitle}
                  onChange={e => setMouForm({ ...mouForm, documentTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={mouForm.startDate}
                    onChange={e => setMouForm({ ...mouForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={mouForm.endDate}
                    onChange={e => setMouForm({ ...mouForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ruang Lingkup</label>
                <input
                  type="text"
                  value={mouForm.scope}
                  onChange={e => setMouForm({ ...mouForm, scope: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMouModalPartner(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan MoU
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT DOKUMEN MOU / PKS                                        */}
      {/* ==================================================================== */}
      {editingMou && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingMou(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-md rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Edit Dokumen MoU / PKS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMou(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMou} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Surat MoU/PKS *</label>
                <input
                  type="text"
                  required
                  value={editingMou.mou.mouNumber}
                  onChange={e =>
                    setEditingMou({
                      ...editingMou,
                      mou: { ...editingMou.mou, mouNumber: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Perjanjian</label>
                <input
                  type="text"
                  value={editingMou.mou.documentTitle}
                  onChange={e =>
                    setEditingMou({
                      ...editingMou,
                      mou: { ...editingMou.mou, documentTitle: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editingMou.mou.startDate}
                    onChange={e =>
                      setEditingMou({
                        ...editingMou,
                        mou: { ...editingMou.mou, startDate: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={editingMou.mou.endDate}
                    onChange={e =>
                      setEditingMou({
                        ...editingMou,
                        mou: { ...editingMou.mou, endDate: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Berlaku</label>
                  <select
                    value={editingMou.mou.status}
                    onChange={e =>
                      setEditingMou({
                        ...editingMou,
                        mou: { ...editingMou.mou, status: e.target.value as any },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="akan_berakhir">Akan Berakhir</option>
                    <option value="kadaluarsa">Kadaluarsa</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ruang Lingkup</label>
                  <input
                    type="text"
                    value={editingMou.mou.scope}
                    onChange={e =>
                      setEditingMou({
                        ...editingMou,
                        mou: { ...editingMou.mou, scope: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMou(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Perubahan MoU
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH KUNJUNGAN SUPERVISI                                   */}
      {/* ==================================================================== */}
      {showAddVisitModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddVisitModal(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Jadwalkan Kunjungan Supervisi PKL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVisitModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Perusahaan Mitra DUDI *</label>
                <select
                  required
                  value={newVisitForm.partnerId}
                  onChange={e => setNewVisitForm({ ...newVisitForm, partnerId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Perusahaan DUDI --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.placements?.length || 0} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Guru Pembimbing Sekolah</label>
                  <input
                    type="text"
                    value={newVisitForm.teacherName}
                    onChange={e => setNewVisitForm({ ...newVisitForm, teacherName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    value={newVisitForm.visitDate}
                    onChange={e => setNewVisitForm({ ...newVisitForm, visitDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jenis Kunjungan</label>
                  <select
                    value={newVisitForm.visitType}
                    onChange={e => setNewVisitForm({ ...newVisitForm, visitType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Monitoring Awal">Monitoring Awal</option>
                    <option value="Supervisi Rutin">Supervisi Rutin</option>
                    <option value="Evaluasi Tengah PKL">Evaluasi Tengah PKL</option>
                    <option value="Penarikan Siswa">Penarikan Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Persentase Hadir (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newVisitForm.attendanceRate}
                    onChange={e => setNewVisitForm({ ...newVisitForm, attendanceRate: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Bimbingan</label>
                <textarea
                  rows={2}
                  value={newVisitForm.guidanceNotes}
                  onChange={e => setNewVisitForm({ ...newVisitForm, guidanceNotes: e.target.value })}
                  placeholder="Catatan pelaksanaan bimbingan teknis..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Feedback Pembimbing DUDI</label>
                <textarea
                  rows={2}
                  value={newVisitForm.industryFeedback}
                  onChange={e => setNewVisitForm({ ...newVisitForm, industryFeedback: e.target.value })}
                  placeholder="Umpan balik dari mentor industri..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Catatan Supervisi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT KUNJUNGAN SUPERVISI                                     */}
      {/* ==================================================================== */}
      {editingVisit && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingVisit(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Edit Catatan Supervisi: {editingVisit.partnerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingVisit(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVisit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    value={editingVisit.visitDate}
                    onChange={e => setEditingVisit({ ...editingVisit, visitDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Kunjungan</label>
                  <select
                    value={editingVisit.status}
                    onChange={e => setEditingVisit({ ...editingVisit, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="terlaksana">Terlaksana</option>
                    <option value="terjadwal">Terjadwal</option>
                    <option value="tertunda">Tertunda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Bimbingan</label>
                <textarea
                  rows={2}
                  value={editingVisit.guidanceNotes}
                  onChange={e => setEditingVisit({ ...editingVisit, guidanceNotes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Feedback Industri</label>
                <textarea
                  rows={2}
                  value={editingVisit.industryFeedback}
                  onChange={e => setEditingVisit({ ...editingVisit, industryFeedback: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVisit(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: TAMBAH ENTRI LAPORAN PKL SISWA                                */}
      {/* ==================================================================== */}
      {showAddReportModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddReportModal(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Entri Laporan &amp; Nilai PKL Siswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentReport} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={studentReportForm.studentId}
                  onChange={e => setStudentReportForm({ ...studentReportForm, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.className}) - NISN: {s.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Perusahaan Tempat PKL</label>
                <select
                  value={studentReportForm.partnerId}
                  onChange={e => setStudentReportForm({ ...studentReportForm, partnerId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Mitra DUDI --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Laporan PKL</label>
                <input
                  type="text"
                  placeholder="Contoh: Implementasi Antarmuka Web Monitoring Jaringan"
                  value={studentReportForm.reportTitle}
                  onChange={e => setStudentReportForm({ ...studentReportForm, reportTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Pengumpulan</label>
                  <select
                    value={studentReportForm.submissionStatus}
                    onChange={e => setStudentReportForm({ ...studentReportForm, submissionStatus: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="sudah_dikumpulkan">Sudah Dikumpulkan</option>
                    <option value="belum_dikumpulkan">Belum Mengumpulkan</option>
                    <option value="revisi">Perlu Revisi</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Pasca PKL</label>
                  <select
                    value={studentReportForm.absorbedStatus}
                    onChange={e => setStudentReportForm({ ...studentReportForm, absorbedStatus: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="terserap_kerja">Bekerja di DUDI</option>
                    <option value="melanjutkan_kuliah">Melanjutkan Kuliah</option>
                    <option value="wirausaha">Wirausaha</option>
                    <option value="mencari_kerja">Mencari Kerja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nilai Sekolah (40%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={studentReportForm.schoolMentorScore}
                    onChange={e => setStudentReportForm({ ...studentReportForm, schoolMentorScore: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nilai Industri (60%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={studentReportForm.industryMentorScore}
                    onChange={e => setStudentReportForm({ ...studentReportForm, industryMentorScore: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddReportModal(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Laporan &amp; Nilai
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDIT LAPORAN SISWA & NILAI PKL                                */}
      {/* ==================================================================== */}
      {editingReportItem && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingReportItem(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#6C60B8]" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Edit Laporan &amp; Nilai: {editingReportItem.studentName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReportItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudentReport} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Laporan</label>
                <input
                  type="text"
                  value={editingReportItem.reportTitle}
                  onChange={e => setEditingReportItem({ ...editingReportItem, reportTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Pengumpulan</label>
                  <select
                    value={editingReportItem.submissionStatus}
                    onChange={e => setEditingReportItem({ ...editingReportItem, submissionStatus: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="sudah_dikumpulkan">Sudah Dikumpulkan</option>
                    <option value="belum_dikumpulkan">Belum Mengumpulkan</option>
                    <option value="revisi">Perlu Revisi</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Pasca PKL</label>
                  <select
                    value={editingReportItem.absorbedStatus}
                    onChange={e => setEditingReportItem({ ...editingReportItem, absorbedStatus: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="terserap_kerja">Bekerja di DUDI</option>
                    <option value="melanjutkan_kuliah">Melanjutkan Kuliah</option>
                    <option value="wirausaha">Wirausaha</option>
                    <option value="mencari_kerja">Mencari Kerja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nilai Sekolah (40%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingReportItem.schoolMentorScore}
                    onChange={e => setEditingReportItem({ ...editingReportItem, schoolMentorScore: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-[#6C60B8] dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nilai Industri (60%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingReportItem.industryMentorScore}
                    onChange={e => setEditingReportItem({ ...editingReportItem, industryMentorScore: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReportItem(null)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================================== */}
      {/* MODAL: FORM EVALUASI PERUSAHAAN OLEH SEKOLAH                         */}
      {/* ==================================================================== */}
      {showEvaluationModal && evaluatingPartner && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEvaluationModal(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="relative m-auto w-full max-w-lg rounded-3xl border border-[#E6E4F2] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-[#241F3F] dark:text-white">
                  Evaluasi Mitra: {evaluatingPartner.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                savePklPartner({
                  ...evaluatingPartner,
                  evaluation: {
                    rating: evalForm.rating,
                    workCultureScore: evalForm.workCultureScore,
                    guidanceScore: evalForm.guidanceScore,
                    facilityScore: evalForm.facilityScore,
                    curriculumRelevanceScore: evalForm.curriculumRelevanceScore,
                    recommendation: evalForm.recommendation,
                    notes: evalForm.notes,
                    evaluatorName: 'Wakasek Hubungan Industri & Tim Penilai',
                    evaluatedAt: new Date().toISOString().split('T')[0],
                  },
                });
                setShowEvaluationModal(false);
                showToast(`Evaluasi perusahaan "${evaluatingPartner.name}" berhasil disimpan.`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rating Umum (1-5)</label>
                  <select
                    value={evalForm.rating}
                    onChange={e => setEvalForm(p => ({ ...p, rating: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={5}>5 Bintang (Sangat Memuaskan)</option>
                    <option value={4}>4 Bintang (Baik &amp; Kompeten)</option>
                    <option value={3}>3 Bintang (Cukup)</option>
                    <option value={2}>2 Bintang (Perlu Evaluasi)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rekomendasi Sekolah</label>
                  <select
                    value={evalForm.recommendation}
                    onChange={e => setEvalForm(p => ({ ...p, recommendation: e.target.value as any }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Sangat Direkomendasikan">Sangat Direkomendasikan</option>
                    <option value="Direkomendasikan">Direkomendasikan</option>
                    <option value="Perlu Evaluasi">Perlu Evaluasi</option>
                    <option value="Tidak Direkomendasikan">Tidak Direkomendasikan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Skor Budaya Kerja (0-100)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={evalForm.workCultureScore}
                    onChange={e => setEvalForm(p => ({ ...p, workCultureScore: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Skor Bimbingan Mentor (0-100)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={evalForm.guidanceScore}
                    onChange={e => setEvalForm(p => ({ ...p, guidanceScore: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Kualitatif Evaluasi</label>
                <textarea
                  rows={3}
                  value={evalForm.notes}
                  onChange={e => setEvalForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Tuliskan catatan evaluasi supervisi, keterlibatan siswa dalam proyek..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6C60B8] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#5B4FA8] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Simpan Evaluasi
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
