export interface PedagogicalAnalysisRequest {
  studentName: string;
  className: string;
  attendanceStats: {
    present: number;
    sick: number;
    leave: number;
    absent: number;
    late: number;
    rate: number;
  };
  grades: {
    subject: string;
    score: number;
    kkm: number;
    predicate: string;
  }[];
  queryType: 'student_diagnostic' | 'homeroom_summary' | 'remedial_plan' | 'growth_report';
}

export async function runPedagogicalThinkingAnalysis(req: PedagogicalAnalysisRequest): Promise<string> {
  const prompt = `
Lakukan analisis pedagogik & akademik mendalam untuk siswa SMK Mardi Yuana Cikembar dengan data berikut:
- Nama Siswa: ${req.studentName}
- Kelas: ${req.className}
- Tipe Analisis: ${req.queryType}
- Statistik Kehadiran:
  * Hadir: ${req.attendanceStats.present} hari
  * Sakit: ${req.attendanceStats.sick} hari
  * Izin: ${req.attendanceStats.leave} hari
  * Alpa (Tanpa Keterangan): ${req.attendanceStats.absent} hari
  * Terlambat: ${req.attendanceStats.late} kali
  * Persentase Kehadiran: ${req.attendanceStats.rate.toFixed(1)}%
- Rekap Nilai Akademik:
  ${req.grades.map(g => `* ${g.subject}: Nilai ${g.score} (KKM: ${g.kkm}, Predikat: ${g.predicate})`).join('\n  ')}

Format keluaran:
1. Ringkasan Diagnostik Kinerja Akademik & Kedisiplinan
2. Analisis Korelasi Kehadiran vs Capaian Pembelajaran
3. Potensi & Keunggulan Siswa
4. Rekomendasi Tindak Lanjut Konkret (untuk Wali Kelas, Guru Mapel, dan Orang Tua)
5. Draf Catatan Rapor Kurikulum Merdeka yang Memotivasi

Gunakan gaya bahasa profesional, suportif, berbasis data, dan terstruktur rapi.
`;

  try {
    const res = await fetch('/api/gemini/thinking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memproses analisis pedagogik AI');
    }

    const data = await res.json();
    return data.text || 'Tidak ada teks yang dihasilkan.';
  } catch (err: any) {
    console.error('Error in runPedagogicalThinkingAnalysis:', err);
    throw err;
  }
}

export async function generateVeoSchoolVideo(
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9',
  imageBytes?: string,
  mimeType?: string
): Promise<string> {
  try {
    const res = await fetch('/api/veo/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, imageBytes, mimeType }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memulai pembuatan video Veo');
    }

    const data = await res.json();
    return data.operationName;
  } catch (err: any) {
    console.error('Error in generateVeoSchoolVideo:', err);
    throw err;
  }
}

export async function checkVeoVideoStatus(operationName: string): Promise<{ done: boolean; response?: any }> {
  try {
    const res = await fetch('/api/veo/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memeriksa status video');
    }

    return await res.json();
  } catch (err: any) {
    console.error('Error in checkVeoVideoStatus:', err);
    throw err;
  }
}
