import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Navigation,
  Copy,
  ExternalLink,
  Check,
  Radio,
  Smartphone,
  Laptop,
  Maximize2,
  X,
  LocateFixed,
  MapPin,
} from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { OrbitaMenuIcon } from '../common/AcademyOrnaments';

export interface LiveDeviceLocation {
  userId: string;
  userName: string;
  userRole: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  deviceName: string;
  label: string;
  isSharing: boolean;
  updatedAt: string;
}

const DEFAULT_SCHOOL_COORDS = {
  latitude: -6.98262,
  longitude: 106.83254,
  label: 'Kampus Utama ORBITA • Cikembar, Sukabumi',
};

function detectDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android Smartphone';
  if (/iPad|Tablet/i.test(ua)) return 'iPad / Tablet';
  if (/iPhone|iPod/i.test(ua)) return 'iPhone iOS';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'MacBook / macOS';
  if (/Windows/i.test(ua)) return 'Windows Desktop/Laptop';
  if (/Linux/i.test(ua)) return 'Linux Workstation';
  return 'Perangkat Web Aktif';
}

export interface RightActivityPanelProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const RightActivityPanel: React.FC<RightActivityPanelProps> = ({
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const {
    classes = [],
    lessonSchedules = [],
    attendanceCorrections = [],
    pklVisits = [],
    pklPartners = [],
    auditLogs = [],
    currentUser,
    currentRole,
    setActiveNav,
    addToast,
  } = useApp();

  const navigateAndClose = (navId: string) => {
    setActiveNav(navId);
    if (onCloseMobile) onCloseMobile();
  };

  const [tab, setTab] = useState<'jadwal' | 'log'>('jadwal');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');

  // Live Location State synced across all devices via Firestore
  const [liveLocationsMap, setLiveLocationsMap] = useState<Record<string, LiveDeviceLocation>>(() => {
    try {
      const saved = localStorage.getItem('orbita_live_locations_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
    label: string;
    userName?: string;
    deviceName?: string;
  }>(DEFAULT_SCHOOL_COORDS);

  const [isSharingLive, setIsSharingLive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showExpandedMapModal, setShowExpandedMapModal] = useState(false);
  const [manualLatInput, setManualLatInput] = useState(String(DEFAULT_SCHOOL_COORDS.latitude));
  const [manualLngInput, setManualLngInput] = useState(String(DEFAULT_SCHOOL_COORDS.longitude));
  const watchIdRef = useRef<number | null>(null);

  // Subscribe to Firestore doc(db, 'settings', 'live_locations') so any device login shares in real-time
  useEffect(() => {
    const ref = doc(db, 'settings', 'live_locations');
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = snap.data() as { entries?: Record<string, LiveDeviceLocation> };
          if (data?.entries && typeof data.entries === 'object') {
            setLiveLocationsMap(data.entries);
            try {
              localStorage.setItem('orbita_live_locations_v1', JSON.stringify(data.entries));
            } catch {
              // ignore storage quota errors
            }
          }
        }
      },
      () => {
        // Fallback quietly if offline
      }
    );
    return () => unsub();
  }, []);

  // Keep current user's live sharing state synced
  useEffect(() => {
    const myEntry = liveLocationsMap[currentUser.id];
    if (myEntry && myEntry.isSharing) {
      setIsSharingLive(true);
      setSelectedCoords({
        latitude: myEntry.latitude,
        longitude: myEntry.longitude,
        label: myEntry.label || `Live GPS • ${myEntry.userName}`,
        userName: myEntry.userName,
        deviceName: myEntry.deviceName,
      });
      setManualLatInput(String(myEntry.latitude));
      setManualLngInput(String(myEntry.longitude));
    }
  }, [currentUser.id, liveLocationsMap]);

  // Cleanup geolocation watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const persistLiveLocationEntry = async (entry: LiveDeviceLocation) => {
    const nextMap = {
      ...liveLocationsMap,
      [entry.userId]: entry,
    };
    setLiveLocationsMap(nextMap);
    try {
      localStorage.setItem('orbita_live_locations_v1', JSON.stringify(nextMap));
    } catch {
      // ignore
    }
    try {
      await setDoc(
        doc(db, 'settings', 'live_locations'),
        {
          entries: nextMap,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // ignore if offline
    }
  };

  /**
   * Immediately activates & broadcasts Live Location for the logged-in user on any device
   * and updates the Google Maps coordinate pin
   */
  const handleStartAndShareLiveLocation = (openModal = false) => {
    if (openModal) {
      setShowExpandedMapModal(true);
    }
    setIsLocating(true);
    const deviceName = detectDeviceName();

    const publishCoords = (lat: number, lng: number, acc = 12, sourceNote = 'GPS Presisi Aktif') => {
      const cleanLat = Number(lat.toFixed(6));
      const cleanLng = Number(lng.toFixed(6));
      const entry: LiveDeviceLocation = {
        userId: currentUser.id,
        userName: currentUser.displayName,
        userRole: currentRole,
        latitude: cleanLat,
        longitude: cleanLng,
        accuracy: Math.round(acc),
        deviceName,
        label: `${sourceNote} • ${deviceName}`,
        isSharing: true,
        updatedAt: new Date().toISOString(),
      };
      setIsSharingLive(true);
      setIsLocating(false);
      setSelectedCoords({
        latitude: cleanLat,
        longitude: cleanLng,
        label: entry.label,
        userName: entry.userName,
        deviceName: entry.deviceName,
      });
      setManualLatInput(String(cleanLat));
      setManualLngInput(String(cleanLng));
      persistLiveLocationEntry(entry);
      addToast(
        `Live Location (${cleanLat}, ${cleanLng}) dibagikan dari ${deviceName}!`,
        'success'
      );
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          publishCoords(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy || 10,
            'Live GPS Device'
          );

          // Also watch continuous movement
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }
          watchIdRef.current = navigator.geolocation.watchPosition(
            watchPos => {
              const wLat = Number(watchPos.coords.latitude.toFixed(6));
              const wLng = Number(watchPos.coords.longitude.toFixed(6));
              const updatedEntry: LiveDeviceLocation = {
                userId: currentUser.id,
                userName: currentUser.displayName,
                userRole: currentRole,
                latitude: wLat,
                longitude: wLng,
                accuracy: Math.round(watchPos.coords.accuracy || 10),
                deviceName,
                label: `Live GPS • ${deviceName}`,
                isSharing: true,
                updatedAt: new Date().toISOString(),
              };
              setSelectedCoords({
                latitude: wLat,
                longitude: wLng,
                label: updatedEntry.label,
                userName: updatedEntry.userName,
                deviceName: updatedEntry.deviceName,
              });
              persistLiveLocationEntry(updatedEntry);
            },
            () => {
              // ignore watch error
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
          );
        },
        () => {
          // If browser/iframe blocks geolocation permission, use active coordinate so sharing still works on any device
          const fallbackLat = Number(
            (selectedCoords.latitude || DEFAULT_SCHOOL_COORDS.latitude).toFixed(6)
          );
          const fallbackLng = Number(
            (selectedCoords.longitude || DEFAULT_SCHOOL_COORDS.longitude).toFixed(6)
          );
          publishCoords(fallbackLat, fallbackLng, 15, 'Titik Koordinat Device');
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      publishCoords(
        selectedCoords.latitude || DEFAULT_SCHOOL_COORDS.latitude,
        selectedCoords.longitude || DEFAULT_SCHOOL_COORDS.longitude,
        15,
        'Titik Koordinat Device'
      );
    }
  };

  const handleStopLiveLocation = async () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharingLive(false);
    const existing = liveLocationsMap[currentUser.id];
    if (existing) {
      const updated: LiveDeviceLocation = {
        ...existing,
        isSharing: false,
        updatedAt: new Date().toISOString(),
      };
      await persistLiveLocationEntry(updated);
    }
    addToast('Berhenti membagikan Live Location.', 'info');
  };

  const googleMapsPinUrl = `https://www.google.com/maps?q=${selectedCoords.latitude},${selectedCoords.longitude}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${selectedCoords.latitude},${selectedCoords.longitude}&z=15&output=embed`;

  const handleShareOrCopyCoordinateLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `Live Location ORBITA (${currentUser.displayName} - ${detectDeviceName()}): ${selectedCoords.latitude}, ${selectedCoords.longitude}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Live Location • ${currentUser.displayName}`,
          text: shareText,
          url: googleMapsPinUrl,
        });
        addToast('Tautan titik koordinat Google Maps berhasil dibagikan!', 'success');
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText} — ${googleMapsPinUrl}`);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        addToast('Link titik koordinat Google Maps disalin ke clipboard!', 'success');
      } catch {
        // ignore
      }
    }
  };

  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(manualLatInput);
    const parsedLng = parseFloat(manualLngInput);
    if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      addToast('Masukkan format koordinat Latitude (-90..90) & Longitude (-180..180) yang valid.', 'warning');
      return;
    }
    const deviceName = detectDeviceName();
    const entry: LiveDeviceLocation = {
      userId: currentUser.id,
      userName: currentUser.displayName,
      userRole: currentRole,
      latitude: Number(parsedLat.toFixed(6)),
      longitude: Number(parsedLng.toFixed(6)),
      accuracy: 5,
      deviceName,
      label: `Koordinat Kustom • ${deviceName}`,
      isSharing: true,
      updatedAt: new Date().toISOString(),
    };
    setIsSharingLive(true);
    setSelectedCoords({
      latitude: entry.latitude,
      longitude: entry.longitude,
      label: entry.label,
      userName: entry.userName,
      deviceName: entry.deviceName,
    });
    persistLiveLocationEntry(entry);
    addToast(`Titik koordinat diperbarui ke (${entry.latitude}, ${entry.longitude})!`, 'success');
  };

  const activeSharedList = Object.values(liveLocationsMap).filter(item => item && item.isSharing);

  // Build real-time KBM schedule items filtered by class & search
  const filteredSchedules = React.useMemo(() => {
    return lessonSchedules.filter(item => {
      if (selectedClassId !== 'ALL' && item.classId !== selectedClassId && item.className !== selectedClassId) {
        return false;
      }
      if (!searchText.trim()) return true;
      const q = searchText.toLowerCase();
      return (
        item.subjectName?.toLowerCase().includes(q) ||
        item.teacherName?.toLowerCase().includes(q) ||
        item.className?.toLowerCase().includes(q) ||
        item.day?.toLowerCase().includes(q) ||
        item.room?.toLowerCase().includes(q)
      );
    });
  }, [lessonSchedules, selectedClassId, searchText]);

  // Build real-time system log & correction items from database
  const systemFeedItems = React.useMemo(() => {
    const items: {
      id: string;
      title: string;
      subtitle: string;
      meta: string;
      badge: string;
      tone: 'pink' | 'purple' | 'emerald' | 'amber';
      targetNav: string;
    }[] = [];

    attendanceCorrections.slice(0, 4).forEach(corr => {
      items.push({
        id: `corr-${corr.id}`,
        title: `Koreksi Presensi • ${corr.studentName}`,
        subtitle: `${corr.className} • Status ${corr.currentStatus} → ${corr.requestedStatus}`,
        meta: corr.reason || 'Verifikasi kehadiran',
        badge: corr.status === 'pending' ? 'PENDING' : corr.status === 'approved' ? 'DISETUJUI' : 'DITOLAK',
        tone: corr.status === 'pending' ? 'pink' : 'emerald',
        targetNav: currentRole === 'siswa' ? 'student-profile' : 'attendance',
      });
    });

    pklVisits.slice(0, 3).forEach(v => {
      items.push({
        id: `pkl-${v.id}`,
        title: `Supervisi PKL • ${v.partnerName}`,
        subtitle: `Pembimbing: ${v.teacherName}`,
        meta: v.findings || `Kunjungan ${v.visitDate}`,
        badge: 'PKL',
        tone: 'purple',
        targetNav: 'pkl',
      });
    });

    auditLogs.slice(0, 4).forEach(log => {
      items.push({
        id: `log-${log.id}`,
        title: `${log.action} • ${log.module}`,
        subtitle: `${log.actorName || log.userName || 'Sistem'} (${log.actorRole || log.userRole || '-'})`,
        meta: log.details,
        badge: 'AUDIT',
        tone: 'amber',
        targetNav: currentRole === 'siswa' ? 'student-profile' : 'audit-logs',
      });
    });

    if (!searchText.trim()) return items;
    const q = searchText.toLowerCase();
    return items.filter(
      it =>
        it.title.toLowerCase().includes(q) ||
        it.subtitle.toLowerCase().includes(q) ||
        it.meta.toLowerCase().includes(q)
    );
  }, [attendanceCorrections, pklVisits, auditLogs, currentRole, searchText]);

  const pendingCorrCount = attendanceCorrections.filter(c => c.status === 'pending').length;

  const panelBody = (isDrawerMode: boolean) => (
    <>
      {/* Top Section: Agenda Jadwal KBM & Log Sistem Real-Time */}
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-[#ECE9FA] text-[#6C60B8] dark:bg-indigo-950/70 dark:text-indigo-300">
              <OrbitaMenuIcon variant="attendance" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-[#3E385B] dark:text-white tracking-tight leading-none truncate">
                Agenda KBM &amp; Sistem
              </h3>
              <span className="text-[10px] font-semibold text-[#9694A8] dark:text-slate-400 truncate block">
                Sinkronisasi Database Aktif
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                navigateAndClose(
                  tab === 'jadwal'
                    ? currentRole === 'siswa'
                      ? 'student-profile'
                      : 'master-data'
                    : currentRole === 'siswa'
                    ? 'student-profile'
                    : 'attendance'
                )
              }
              className="no-ornament text-[11px] font-extrabold text-[#6C60B8] hover:text-[#4E42A1] dark:text-indigo-300 dark:hover:text-indigo-200 transition-colors cursor-pointer"
            >
              Buka Modul
            </button>
            {isDrawerMode && onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Tutup Agenda"
                className="no-ornament flex h-8 w-8 items-center justify-center rounded-full bg-[#EAE9F4] text-[#3E385B] hover:bg-[#FFE4EC] hover:text-[#F25781] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pill Toggle ("Jadwal KBM" / "Log & Koreksi") */}
        <div className="mt-3.5 grid grid-cols-2 gap-1 rounded-full bg-[#EAE9F4] dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTab('jadwal')}
              className={`no-ornament inline-flex items-center justify-center h-8 px-2 rounded-full text-[10.5px] font-extrabold whitespace-nowrap truncate transition-all cursor-pointer ${
                tab === 'jadwal'
                  ? 'bg-[#6C60B8] text-white shadow-[0_6px_16px_rgba(108,96,184,0.34)]'
                  : 'text-[#8E8BA3] hover:text-[#3E385B] dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Jadwal KBM ({lessonSchedules.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('log')}
              className={`no-ornament inline-flex items-center justify-center h-8 px-2 rounded-full text-[10.5px] font-extrabold whitespace-nowrap truncate transition-all cursor-pointer ${
                tab === 'log'
                  ? 'bg-[#6C60B8] text-white shadow-[0_6px_16px_rgba(108,96,184,0.34)]'
                  : 'text-[#8E8BA3] hover:text-[#3E385B] dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Log &amp; Koreksi ({pendingCorrCount > 0 ? `${pendingCorrCount} Baru` : systemFeedItems.length})
            </button>
          </div>

          {/* Filter Kelas & Search Input */}
          <div className="mt-2.5 space-y-2">
            {tab === 'jadwal' && (
              <div className="flex items-center justify-between rounded-full bg-[#ECECF4] dark:bg-slate-800 px-3.5 py-1.5">
                <span className="text-[10px] font-bold text-[#8E8BA3] dark:text-slate-400">Filter Rombel:</span>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-[11px] font-extrabold text-[#6C60B8] dark:text-indigo-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kelas ({classes.length})</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-full bg-[#ECECF4] dark:bg-slate-800 px-3.5 py-2 text-[#3E385B] dark:text-slate-100">
              <OrbitaMenuIcon variant="brand" className="h-3.5 w-3.5 text-[#6C60B8] dark:text-indigo-300 shrink-0" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder={
                  tab === 'jadwal' ? 'Cari mapel, guru, kelas...' : 'Cari log koreksi atau PKL...'
                }
                className="w-full bg-transparent text-xs font-medium text-[#3E385B] dark:text-slate-100 placeholder:text-[#A2A0B4] dark:placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-Time Content List */}
          <div className="mt-3.5 space-y-2 max-h-[245px] overflow-y-auto pr-0.5 scrollbar-none">
            {tab === 'jadwal' ? (
              filteredSchedules.slice(0, 5).map((sched, idx) => {
                const badgeStyles = [
                  'bg-[#E5E2FA] text-[#6C60B8] dark:bg-indigo-950/70 dark:text-indigo-300',
                  'bg-[#FFE2EC] text-[#E64C78] dark:bg-rose-950/70 dark:text-rose-300',
                  'bg-[#DFF8EC] text-[#17A858] dark:bg-emerald-950/70 dark:text-emerald-300',
                  'bg-[#FFF1D6] text-[#D98218] dark:bg-amber-950/70 dark:text-amber-300',
                ];
                const bStyle = badgeStyles[idx % badgeStyles.length];
                return (
                  <div
                    key={sched.id}
                    onClick={() =>
                      navigateAndClose(currentRole === 'siswa' ? 'student-profile' : 'attendance')
                    }
                    className="group flex items-center justify-between gap-2.5 rounded-[18px] bg-white/75 dark:bg-slate-900/80 p-2.5 border border-[#ECEBF5] dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-[#6C60B8]/35 hover:shadow-[0_8px_22px_rgba(108,96,184,0.08)] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[12px] font-extrabold text-[10px] leading-none ${bStyle}`}
                      >
                        <span>{sched.day?.slice(0, 3).toUpperCase() || 'KBM'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-[#3E385B] dark:text-white group-hover:text-[#6C60B8] dark:group-hover:text-indigo-300 transition-colors">
                          {sched.subjectName}
                        </p>
                        <p className="truncate text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-300 leading-tight">
                          {sched.className} &bull; {sched.teacherName}
                        </p>
                        <p className="truncate text-[10px] text-[#A2A0B4] dark:text-slate-400 leading-tight mt-0.5">
                          {sched.startTime} - {sched.endTime} &bull; {sched.room}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#F0EEFA] dark:bg-indigo-950/70 px-2 py-0.5 text-[9.5px] font-extrabold text-[#6C60B8] dark:text-indigo-300">
                      {sched.className}
                    </span>
                  </div>
                );
              })
            ) : (
              systemFeedItems.slice(0, 5).map(item => {
                const toneClasses =
                  item.tone === 'pink'
                    ? 'bg-[#FFE4EC] text-[#F25781] dark:bg-rose-950/70 dark:text-rose-300'
                    : item.tone === 'emerald'
                    ? 'bg-[#DFF8EC] text-[#17A858] dark:bg-emerald-950/70 dark:text-emerald-300'
                    : item.tone === 'amber'
                    ? 'bg-[#FFF1D6] text-[#D98218] dark:bg-amber-950/70 dark:text-amber-300'
                    : 'bg-[#E5E2FA] text-[#6C60B8] dark:bg-indigo-950/70 dark:text-indigo-300';
                return (
                  <div
                    key={item.id}
                    onClick={() => navigateAndClose(item.targetNav)}
                    className="group flex items-center justify-between gap-2.5 rounded-[18px] bg-white/75 dark:bg-slate-900/80 p-2.5 border border-[#ECEBF5] dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-[#6C60B8]/35 hover:shadow-[0_8px_22px_rgba(108,96,184,0.08)] transition-all cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="truncate text-xs font-extrabold text-[#3E385B] dark:text-white group-hover:text-[#6C60B8] dark:group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${toneClasses}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="truncate text-[10.5px] font-semibold text-[#6E6A86] dark:text-slate-300 leading-tight mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="truncate text-[10px] text-[#A2A0B4] dark:text-slate-400 leading-tight mt-0.5">
                        {item.meta}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Section: Interactive Google Maps Coordinate & Instant Live Location Sharing */}
        <div className="mt-5 pt-3 border-t border-[#ECEBF5] dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFE4EC] dark:bg-rose-950/70 text-[#F25781]">
                <OrbitaMenuIcon variant="location" className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-extrabold text-[#3E385B] dark:text-white leading-none">
                  Live Map &amp; GPS
                </h3>
                <span className="text-[9.5px] font-semibold text-[#9694A8] dark:text-slate-400">
                  {selectedCoords.latitude.toFixed(4)}, {selectedCoords.longitude.toFixed(4)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowExpandedMapModal(true)}
              className="no-ornament inline-flex items-center gap-1 rounded-full bg-[#ECE9FA] hover:bg-[#DFD9F8] dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 px-2.5 py-1 text-[10px] font-extrabold text-[#6C60B8] dark:text-indigo-300 transition-colors cursor-pointer"
              title="Perbesar Peta & Koordinat Google Maps"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Detail</span>
            </button>
          </div>

          {/* Interactive Google Maps Coordinate Preview Card — Clicking immediately shares Live Location */}
          <div className="relative overflow-hidden rounded-[22px] border border-[#E4E3F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_12px_28px_-6px_rgba(108,96,184,0.14)]">
            {/* Embedded Real Google Maps Coordinate Iframe */}
            <div className="relative h-40 w-full overflow-hidden bg-[#EEF0F8]">
              <iframe
                title="Google Maps Titik Koordinat Live ORBITA"
                src={googleMapsEmbedUrl}
                className="h-full w-full border-0 pointer-events-none"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Click Overlay that triggers instant Share Live Location on click */}
              <div
                onClick={() => handleStartAndShareLiveLocation(false)}
                title="Klik peta untuk langsung Share Live Location dari perangkat ini"
                className="group absolute inset-0 bg-gradient-to-t from-[#3E385B]/65 via-transparent to-transparent flex flex-col justify-between p-3 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold shadow-sm ${
                      isSharingLive
                        ? 'bg-[#1CC865] text-white'
                        : 'bg-white/95 text-[#3E385B]'
                    }`}
                  >
                    <Radio className={`h-2.5 w-2.5 ${isSharingLive ? 'animate-ping' : 'text-[#F25781]'}`} />
                    <span>{isSharingLive ? 'Live GPS Aktif' : 'Klik untuk Share Live'}</span>
                  </span>

                  <span className="rounded-full bg-[#3E385B]/85 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono font-bold text-white">
                    {activeSharedList.length} Device
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-white">
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-extrabold truncate leading-tight">
                      {selectedCoords.label}
                    </p>
                    <p className="text-[9.5px] text-white/85 font-mono truncate">
                      {selectedCoords.latitude.toFixed(5)}, {selectedCoords.longitude.toFixed(5)}
                    </p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF7597] text-white shadow-md group-hover:scale-105 transition-transform">
                    <LocateFixed className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row Below Map (Proportional Button Sizing) */}
            <div className="p-2.5 bg-white dark:bg-slate-900 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStartAndShareLiveLocation(false)}
                  disabled={isLocating}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] hover:bg-[#5A4EA8] px-2.5 text-[10.5px] font-extrabold text-white whitespace-nowrap shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  <Navigation className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {isLocating
                      ? 'Melacak GPS...'
                      : isSharingLive
                      ? 'Update GPS'
                      : 'Share Live'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareOrCopyCoordinateLink}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FFE4EC] hover:bg-[#FFD4E2] dark:bg-rose-950/60 dark:hover:bg-rose-900/60 px-2.5 text-[10.5px] font-extrabold text-[#F25781] dark:text-rose-300 whitespace-nowrap transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3 w-3 shrink-0" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">Bagikan Titik</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#F0F1F6] dark:border-slate-800">
                <a
                  href={googleMapsPinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6C60B8] dark:text-indigo-300 hover:underline whitespace-nowrap shrink-0"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span>Buka Google Maps</span>
                </a>

                {isSharingLive ? (
                  <button
                    type="button"
                    onClick={handleStopLiveLocation}
                    className="no-ornament inline-flex items-center text-[10px] font-bold text-[#F25781] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Matikan Live
                  </button>
                ) : (
                  <span className="text-[9.5px] font-medium text-[#A2A0B4] dark:text-slate-400 whitespace-nowrap shrink-0">
                    {pklPartners.length} Mitra DUDI
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
  );

  return (
    <>
      {/* Desktop Right Static Rail (xl+) */}
      <aside className="hidden xl:flex w-[304px] shrink-0 flex-col justify-between border-l border-[#ECEBF5] bg-[#F5F6FB]/75 dark:border-slate-800 dark:bg-slate-900/70 px-5 py-6 overflow-y-auto select-none">
        {panelBody(false)}
      </aside>

      {/* Mobile & Tablet Interactive Slide-Over Agenda & Live GPS Drawer (<xl) */}
      {isOpenMobile && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-[#3E385B]/45 backdrop-blur-xs animate-fade-in"
            aria-hidden="true"
          />
          <aside className="relative z-10 flex h-full w-full max-w-[360px] flex-col justify-between border-l border-[#ECEBF5] bg-[#F8F9FD] dark:border-slate-800 dark:bg-slate-950 px-4 py-5 pb-24 lg:pb-6 overflow-y-auto shadow-2xl animate-drawer-right select-none">
            {panelBody(true)}
          </aside>
        </div>
      )}

      {/* EXPANDED INTERACTIVE LIVE MAPS & MULTI-DEVICE COORDINATE MODAL */}
      {showExpandedMapModal && (
        <div
          onClick={() => setShowExpandedMapModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3E385B]/45 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl rounded-[24px] sm:rounded-[28px] border border-[#ECEBF5] bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-6 text-[#3E385B] dark:text-slate-100 shadow-[0_28px_70px_rgba(62,56,91,0.28)] space-y-4 animate-scale-up max-h-[90dvh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#F0F1F6] dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#6C60B8] text-white shadow-sm">
                  <OrbitaMenuIcon variant="location" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#3E385B] dark:text-white">
                    Live Location &amp; Titik Koordinat Google Maps
                  </h3>
                  <p className="text-xs text-[#9694A8] dark:text-slate-400">
                    Sinkronisasi otomatis lintas perangkat (Smartphone, Tablet &amp; Laptop) saat login ke ORBITA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExpandedMapModal(false)}
                className="no-ornament flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F1F6] text-[#3E385B] hover:bg-[#FFE4EC] hover:text-[#F25781] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Large Interactive Google Maps Iframe */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-[22px] border border-[#E4E3F0] dark:border-slate-800 bg-[#F4F3FA] dark:bg-slate-800">
              <iframe
                title="Google Maps Full Coordinate View"
                src={googleMapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute top-3 left-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-[#ECEBF5] dark:border-slate-700 px-3.5 py-2 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C60B8] dark:text-indigo-300 block">
                  Titik Koordinat Aktif
                </span>
                <span className="text-xs font-extrabold text-[#3E385B] dark:text-white block">
                  {selectedCoords.label}
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#F25781]">
                  Lat: {selectedCoords.latitude.toFixed(6)} &bull; Lng: {selectedCoords.longitude.toFixed(6)}
                </span>
              </div>
            </div>

            {/* Primary Live Location Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[20px] bg-[#F8F7FC] dark:bg-slate-800/60 border border-[#ECEBF5] dark:border-slate-800 p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE4EC] dark:bg-rose-950/60 text-[#F25781]">
                  {detectDeviceName().includes('Phone') || detectDeviceName().includes('Android') ? (
                    <Smartphone className="h-4.5 w-4.5" />
                  ) : (
                    <Laptop className="h-4.5 w-4.5" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#3E385B] dark:text-white block">
                    Perangkat Anda: {detectDeviceName()} ({currentUser.displayName})
                  </span>
                  <span className="text-[11px] text-[#9694A8] dark:text-slate-400">
                    {isSharingLive
                      ? 'Sedang membagikan titik koordinat secara real-time'
                      : 'Klik Share Live Location untuk membagikan titik GPS perangkat Anda'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartAndShareLiveLocation(false)}
                  disabled={isLocating}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#6C60B8] hover:bg-[#5B4FA8] px-4 text-xs font-extrabold text-white whitespace-nowrap shrink-0 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  <LocateFixed className="h-3.5 w-3.5 shrink-0" />
                  <span>{isLocating ? 'Melacak GPS...' : 'Share Live Location Sekarang'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareOrCopyCoordinateLink}
                  className="no-ornament inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FFE4EC] hover:bg-[#FFD4E2] dark:bg-rose-950/60 dark:hover:bg-rose-900/60 px-3.5 text-xs font-extrabold text-[#F25781] dark:text-rose-300 whitespace-nowrap shrink-0 transition-all cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                  <span>Salin / Share Link</span>
                </button>

                <a
                  href={googleMapsPinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#E7F9EF] hover:bg-[#D2F4E1] dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 px-3.5 text-xs font-extrabold text-[#139A4C] dark:text-emerald-300 whitespace-nowrap shrink-0 transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>Buka Google Maps</span>
                </a>
              </div>
            </div>

            {/* Manual Coordinate Input & Active Devices / Preset Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Manual / Custom Coordinate Setter */}
              <form
                onSubmit={handleApplyManualCoords}
                className="rounded-[20px] border border-[#ECEBF5] dark:border-slate-800 bg-[#FAF9FE] dark:bg-slate-800/40 p-4 space-y-3"
              >
                <span className="text-xs font-extrabold text-[#3E385B] dark:text-white block">
                  Atur Titik Koordinat Presisi (Latitude / Longitude)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#9694A8] dark:text-slate-400 block mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={manualLatInput}
                      onChange={e => setManualLatInput(e.target.value)}
                      className="w-full rounded-xl px-3 py-1.5 text-xs font-mono font-bold dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      placeholder="-6.98262"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#9694A8] dark:text-slate-400 block mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={manualLngInput}
                      onChange={e => setManualLngInput(e.target.value)}
                      className="w-full rounded-xl px-3 py-1.5 text-xs font-mono font-bold dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      placeholder="106.83254"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="no-ornament inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-[#6C60B8] hover:bg-[#5B4FA8] px-3.5 text-xs font-extrabold text-white whitespace-nowrap transition-all cursor-pointer"
                  >
                    Terapkan &amp; Share
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoords(DEFAULT_SCHOOL_COORDS);
                      setManualLatInput(String(DEFAULT_SCHOOL_COORDS.latitude));
                      setManualLngInput(String(DEFAULT_SCHOOL_COORDS.longitude));
                    }}
                    className="no-ornament inline-flex h-9 items-center justify-center rounded-xl bg-[#F0F1F6] hover:bg-[#E4E3F0] dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 text-xs font-bold text-[#3E385B] dark:text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Kampus ORBITA
                  </button>
                </div>
              </form>

              {/* Right: Active Live Devices & Partner Coordinates */}
              <div className="rounded-[20px] border border-[#ECEBF5] dark:border-slate-800 bg-[#FAF9FE] dark:bg-slate-800/40 p-4 space-y-2.5 max-h-48 overflow-y-auto">
                <span className="text-xs font-extrabold text-[#3E385B] dark:text-white block">
                  Perangkat Live &amp; Titik Lokasi Mitra ({activeSharedList.length + 1})
                </span>

                {activeSharedList.map(entry => (
                  <div
                    key={entry.userId}
                    onClick={() => {
                      setSelectedCoords({
                        latitude: entry.latitude,
                        longitude: entry.longitude,
                        label: `${entry.userName} • ${entry.deviceName}`,
                        userName: entry.userName,
                        deviceName: entry.deviceName,
                      });
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#ECEBF5] dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs hover:border-[#6C60B8] cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#3E385B] dark:text-white truncate">
                        {entry.userName} ({entry.deviceName})
                      </p>
                      <p className="text-[10px] font-mono text-[#6C60B8] dark:text-indigo-300">
                        {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E7F9EF] dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-extrabold text-[#139A4C] dark:text-emerald-300 shrink-0">
                      LIVE
                    </span>
                  </div>
                ))}

                <div
                  onClick={() => setSelectedCoords(DEFAULT_SCHOOL_COORDS)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#ECEBF5] dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs hover:border-[#6C60B8] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-3.5 w-3.5 text-[#F25781] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#3E385B] dark:text-white truncate">
                        Kampus Utama ORBITA Sukabumi
                      </p>
                      <p className="text-[10px] font-mono text-[#9694A8] dark:text-slate-400">
                        {DEFAULT_SCHOOL_COORDS.latitude}, {DEFAULT_SCHOOL_COORDS.longitude}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#F0EEFA] dark:bg-indigo-950/70 px-2 py-0.5 text-[10px] font-bold text-[#6C60B8] dark:text-indigo-300">
                    Pusat
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
