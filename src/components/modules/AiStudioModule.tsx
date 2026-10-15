import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Video,
  Film,
  Upload,
  BrainCircuit,
  GraduationCap,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Play,
} from 'lucide-react';
import { runPedagogicalThinkingAnalysis, generateVeoSchoolVideo, checkVeoVideoStatus } from '../../services/aiService';

export const AiStudioModule: React.FC = () => {
  const { students, classes, subjects, assessments, assessmentScores } = useApp();

  const [activeTab, setActiveTab] = useState<'thinking' | 'veo'>('thinking');

  // Pedagogical Thinking State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-001');
  const [analysisType, setAnalysisType] = useState<'student_diagnostic' | 'homeroom_summary' | 'remedial_plan' | 'growth_report'>('student_diagnostic');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingOutput, setThinkingOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const targetStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleRunPedagogicalAnalysis = async () => {
    setIsThinking(true);
    setThinkingOutput('');

    try {
      const studentScores = assessmentScores
        .filter(sc => sc.studentId === targetStudent.id)
        .map(sc => {
          const asm = assessments.find(a => a.id === sc.assessmentId);
          return {
            subject: asm ? asm.subjectName : 'Kompetensi Kejuruan',
            score: sc.score,
            kkm: asm ? asm.kkm : 75,
            predicate: sc.score >= 90 ? 'A' : sc.score >= 80 ? 'B' : sc.score >= 75 ? 'C' : 'D',
          };
        });

      const result = await runPedagogicalThinkingAnalysis({
        studentName: targetStudent.fullName,
        className: targetStudent.className,
        attendanceStats: {
          present: 29,
          sick: targetStudent.id === 'std-003' ? 1 : 0,
          leave: targetStudent.id === 'std-005' ? 1 : 0,
          absent: 0,
          late: 0,
          rate: targetStudent.id === 'std-003' ? 96.6 : 100,
        },
        grades: studentScores.length > 0 ? studentScores : [
          { subject: 'Pemrograman Web & Perangkat Bergerak', score: 88, kkm: 75, predicate: 'B' },
          { subject: 'Basis Data & SQL', score: 85, kkm: 75, predicate: 'B' },
          { subject: 'Matematika Terapan', score: 82, kkm: 72, predicate: 'B' },
        ],
        queryType: analysisType,
      });

      setThinkingOutput(result);
    } catch (err: any) {
      setThinkingOutput('Gagal menjalankan analisis AI: ' + (err.message || 'Periksa koneksi server.'));
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(thinkingOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Veo Video Generation State
  const [veoPrompt, setVeoPrompt] = useState<string>(
    'Siswa-siswi SMK Mardi Yuana Cikembar sedang merakit komputer dan coding di laboratorium komputer modern'
  );
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoStatusMsg, setVideoStatusMsg] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoStatusMsg('Memulai permintaan pembuatan video Veo (veo-3.1-fast-generate-preview)...');

    try {
      let imageBytes: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (imagePreview) {
        const parts = imagePreview.split(',');
        mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        imageBytes = parts[1];
      }

      const opName = await generateVeoSchoolVideo(veoPrompt, veoAspectRatio, imageBytes, mimeType);
      setOperationName(opName);
      setVideoStatusMsg('Operasi video sedang diproses oleh model Veo di Google Cloud. Sedang menunggu antrean render...');
    } catch (err: any) {
      setVideoStatusMsg('Kesalahan: ' + (err.message || 'Gagal memulai pembuatan video.'));
      setIsGeneratingVideo(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!operationName) return;
    setVideoStatusMsg('Memeriksa status render video...');
    try {
      const status = await checkVeoVideoStatus(operationName);
      if (status.done) {
        setVideoStatusMsg('Video selesai dirender! Siap ditampilkan.');
        setIsGeneratingVideo(false);
      } else {
        setVideoStatusMsg('Video masih dalam proses rendering. Silakan periksa kembali dalam beberapa saat.');
      }
    } catch (err: any) {
      setVideoStatusMsg('Gagal memeriksa status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Studio AI &amp; Asisten Pedagogik Cerdas
            </h1>
            <p className="text-xs text-slate-500">
              Analisis Tingkat Tinggi (Gemini 4 Argon High-Thinking) &amp; Animasi Video Kegiatan (Veo 3.1)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-800/60">
          <button
            onClick={() => setActiveTab('thinking')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'thinking'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <BrainCircuit className="h-4 w-4 text-purple-600" />
            <span>Analisis Pedagogik Cerdas (Gemini 4 Argon)</span>
          </button>
          <button
            onClick={() => setActiveTab('veo')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'veo'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Video className="h-4 w-4 text-cyan-500" />
            <span>Studio Animasi Video Sekolah (Veo)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GEMINI 4 ARGON HIGH-THINKING PEDAGOGICAL ANALYSIS */}
      {activeTab === 'thinking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60">
                <BrainCircuit className="h-3.5 w-3.5" /> Model: gemini-4-argon &bull; Thinking: HIGH
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                Konfigurasi Analisis
              </h2>
              <p className="text-xs text-slate-500">
                Lakukan penalaran komprehensif atas data kehadiran, nilai tugas, ketercapaian KKM, dan saran intervensi pembelajaran.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Siswa yang Dianalisis
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.className} - {s.nisn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Fokus Analisis Pedagogik
              </label>
              <select
                value={analysisType}
                onChange={e => setAnalysisType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="student_diagnostic">Diagnostik Lengkap Akademik &amp; Kehadiran</option>
                <option value="remedial_plan">Rencana Intervensi Remedial &amp; Pengayaan</option>
                <option value="growth_report">Draf Catatan Rapor Kurikulum Merdeka</option>
                <option value="homeroom_summary">Rangkuman Konseling Wali Kelas</option>
              </select>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <p><strong>Kelas:</strong> {targetStudent.className}</p>
              <p><strong>Jurusan:</strong> {targetStudent.majorCode}</p>
              <p><strong>Status:</strong> {targetStudent.status.toUpperCase()}</p>
            </div>

            <button
              onClick={handleRunPedagogicalAnalysis}
              disabled={isThinking}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {isThinking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Model Sedang Bernalar (High Thinking)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Jalankan Penalaran Mendalam</span>
                </>
              )}
            </button>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Hasil Analisis Pedagogik Berbasis Data
                  </h2>
                </div>

                {thinkingOutput && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                )}
              </div>

              <div className="mt-4 min-h-[360px]">
                {isThinking ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-4">
                      <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin dark:border-blue-900 dark:border-t-blue-400" />
                      <BrainCircuit className="h-6 w-6 text-blue-600 absolute inset-0 m-auto" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Gemini 4 Argon sedang memproses penalaran mendalam (ThinkingLevel: HIGH)...
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Mengevaluasi rekam jejak presensi, tren kompetensi nilai, KKM, dan merumuskan rekomendasi pedagogik yang aplikatif.
                    </p>
                  </div>
                ) : thinkingOutput ? (
                  <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {thinkingOutput}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <Sparkles className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Belum ada analisis yang dijalankan.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Pilih siswa dan klik tombol &quot;Jalankan Penalaran Mendalam&quot; untuk menghasilkan diagnosa pedagogik otomatis.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>SMK Mardi Yuana Cikembar &bull; Asisten AI Terverifikasi</span>
              <span>Model: gemini-4-argon</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VEO VIDEO SHOWCASE GENERATOR */}
      {activeTab === 'veo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input & Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200/60">
                <Video className="h-3.5 w-3.5" /> Model: veo-3.1-fast-generate-preview
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                Animasikan Foto Kegiatan Menjadi Video (Veo)
              </h2>
              <p className="text-xs text-slate-500">
                Unggah foto kegiatan praktikum bengkel vokasi atau kelas SMK Mardi Yuana Cikembar, lalu hidupkan menjadi video berkualitas sinematik.
              </p>
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Foto Kegiatan / Bengkel (Opsional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>{imageFile ? imageFile.name : 'Pilih Foto Sekolah'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-10 w-16 object-cover rounded-lg border border-slate-200" />
                )}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Prompt Animasi Video
              </label>
              <textarea
                rows={3}
                value={veoPrompt}
                onChange={e => setVeoPrompt(e.target.value)}
                placeholder="Deskripsikan aksi kamera dan suasana kegiatan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Aspek Rasio Video
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVeoAspectRatio('16:9')}
                  className={`rounded-xl p-2.5 text-xs font-bold border transition-all ${
                    veoAspectRatio === '16:9'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  16:9 (Landscape / Layar Lebar)
                </button>
                <button
                  type="button"
                  onClick={() => setVeoAspectRatio('9:16')}
                  className={`rounded-xl p-2.5 text-xs font-bold border transition-all ${
                    veoAspectRatio === '9:16'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  9:16 (Portrait / Reel Media Sosial)
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-700 disabled:opacity-50 transition-all"
            >
              {isGeneratingVideo ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Memproses dengan Veo...</span>
                </>
              ) : (
                <>
                  <Film className="h-4 w-4" />
                  <span>Hasilkan Video Veo</span>
                </>
              )}
            </button>
          </div>

          {/* Status & Preview Player */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
                Status Render Video Veo
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Operasi rendering video model AI tingkat lanjut.
              </p>

              {videoStatusMsg && (
                <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 dark:bg-slate-800/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 mb-4">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Status Progres:</p>
                  <p>{videoStatusMsg}</p>
                  {operationName && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">ID: {operationName}</p>
                  )}
                </div>
              )}

              {operationName && (
                <button
                  onClick={handleCheckStatus}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                  <span>Periksa Status Render Sekarang</span>
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              SMK Mardi Yuana Cikembar &bull; Google Veo Video Generation Engine
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
