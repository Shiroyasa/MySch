import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportCustomConfig {
  institutionFoundation: string;
  institutionName: string;
  institutionTagline: string;
  institutionAddress: string;
  institutionContact: string;
  institutionNpsn: string;
  logoDataUrl?: string; // Base64 logo image
  logoPosition?: 'left' | 'center';
  logoWidth?: number;
  logoHeight?: number;
  showKopSurat?: boolean;
  accentColor?: [number, number, number]; // RGB, e.g. [15, 23, 42]
  fontFamily?: string;
  // Left Signer (Guru Pengampu / Wali Kelas)
  leftSignerTitle: string;
  leftSignerName: string;
  leftSignerNip: string;
  leftSignerSignatureUrl?: string; // Base64 signature image
  // Right Signer (Kepala Sekolah)
  rightSignerCity: string;
  rightSignerDate: string;
  rightSignerTitle: string;
  rightSignerName: string;
  rightSignerNip: string;
  rightSignerSignatureUrl?: string; // Base64 signature image
  watermarkText?: string;
}

export const defaultReportConfig: ReportCustomConfig = {
  institutionFoundation: 'YAYASAN MARDI YUANA',
  institutionName: 'SMK MARDI YUANA CIKEMBAR',
  institutionTagline: 'Kompetensi Keahlian: Rekayasa Perangkat Lunak | Teknik Komputer Jaringan | OTKP | AKL | BDP',
  institutionAddress: 'Jl. Pelabuhan II KM. 19 Cikembar, Kab. Sukabumi, Jawa Barat 43359',
  institutionContact: 'Telp: (0266) 632145 | Surel: info@smkmy-cikembar.sch.id | Web: smkmy-cikembar.sch.id',
  institutionNpsn: 'NPSN: 20253456 | Akreditasi: A (Unggul)',
  showKopSurat: true,
  accentColor: [15, 23, 42], // Modern Navy
  leftSignerTitle: 'Wali Kelas / Guru Pengampu,',
  leftSignerName: 'H. Budi Santoso, S.Pd., M.T.',
  leftSignerNip: '197905142005011004',
  rightSignerCity: 'Cikembar',
  rightSignerDate: new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  rightSignerTitle: 'Kepala SMK Mardi Yuana Cikembar,',
  rightSignerName: 'Drs. H. Suryana, M.M.Pd.',
  rightSignerNip: '196803151992031002',
};

export interface ExportHeaderOptions {
  title: string;
  subtitle?: string;
  academicYear?: string;
  className?: string;
  subjectName?: string;
  dateRange?: string;
  studentName?: string;
  teacherName?: string;
}

export function exportToExcel(
  data: Record<string, any>[],
  fileName: string,
  sheetName: string = 'Laporan'
) {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    alert('Gagal mengekspor file Excel. Silakan periksa console.');
  }
}

export function exportToCsv(
  data: Record<string, any>[],
  fileName: string
) {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
}

/**
 * Enhanced PDF Exporter with Custom Kop Surat, Institution Logo Image,
 * and Individual Handwritten Signatures (TTD Gambar)
 */
export function exportToPdf(
  headers: string[],
  rows: (string | number)[][],
  options: ExportHeaderOptions,
  fileName: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  customConfig?: Partial<ReportCustomConfig>
) {
  try {
    const config = { ...defaultReportConfig, ...customConfig };
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 12;

    // Render Kop Surat
    if (config.showKopSurat) {
      // 1. Logo if provided
      // 1. Logo if provided with exact proportional aspect ratio
      let textLeftMargin = 14;
      if (config.logoDataUrl) {
        try {
          const maxDimension = config.logoWidth || 20;
          let logoW = maxDimension;
          let logoH = maxDimension;
          try {
            const imgProps = doc.getImageProperties(config.logoDataUrl);
            if (imgProps && imgProps.width && imgProps.height) {
              const aspect = imgProps.width / imgProps.height;
              if (aspect >= 1) {
                logoW = Math.min(24, maxDimension);
                logoH = logoW / aspect;
              } else {
                logoH = Math.min(22, maxDimension);
                logoW = logoH * aspect;
              }
            }
          } catch {
            logoW = 18;
            logoH = 18;
          }
          const logoY = 10 + Math.max(0, (22 - logoH) / 2);
          doc.addImage(config.logoDataUrl, 'PNG', 14, logoY, logoW, logoH);
          textLeftMargin = 14 + logoW + 5;
        } catch (imgErr) {
          console.warn('Could not render logo in PDF:', imgErr);
        }
      }

      const textCenterX = config.logoDataUrl ? (textLeftMargin + pageWidth - 14) / 2 : pageWidth / 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(config.accentColor ? config.accentColor[0] : 15, config.accentColor ? config.accentColor[1] : 23, config.accentColor ? config.accentColor[2] : 42);
      doc.text(config.institutionFoundation, textCenterX, 14, { align: 'center' });

      doc.setFontSize(14);
      doc.text(config.institutionName, textCenterX, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(config.institutionTagline, textCenterX, 25, { align: 'center' });
      doc.text(`${config.institutionAddress} | ${config.institutionContact}`, textCenterX, 29, { align: 'center' });

      // Double divider line
      const accent = config.accentColor || [37, 99, 235];
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.setLineWidth(0.8);
      doc.line(14, 32, pageWidth - 14, 32);
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.2);
      doc.line(14, 33, pageWidth - 14, 33);

      currentY = 40;
    }

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(options.title.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

    if (options.subtitle) {
      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(options.subtitle, pageWidth / 2, currentY, { align: 'center' });
    }

    // Metadata details
    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const metaLeft: string[] = [];
    if (options.studentName) metaLeft.push(`Nama Siswa: ${options.studentName}`);
    if (options.className) metaLeft.push(`Kelas: ${options.className}`);
    if (options.subjectName) metaLeft.push(`Mata Pelajaran: ${options.subjectName}`);
    if (options.academicYear) metaLeft.push(`Tahun Ajaran: ${options.academicYear}`);
    if (options.dateRange) metaLeft.push(`Periode: ${options.dateRange}`);

    metaLeft.forEach((item, index) => {
      doc.text(item, 14, currentY + index * 4.5);
    });

    const startTableY = currentY + Math.max(metaLeft.length * 4.5, 4) + 2;
    const headerColor = config.accentColor || [15, 23, 42];

    // Render Table with autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startTableY,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Signature blocks
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Check if space for signatures or need new page
    if (finalY + 38 > pageHeight) {
      doc.addPage();
    }

    const sigY = finalY + 38 > pageHeight ? 20 : finalY;

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    // Left Signature (Wali Kelas / Guru Pengampu)
    doc.text('Mengetahui,', 20, sigY);
    doc.text(config.leftSignerTitle, 20, sigY + 4.5);

    if (config.leftSignerSignatureUrl) {
      try {
        doc.addImage(config.leftSignerSignatureUrl, 'PNG', 20, sigY + 6, 32, 14);
      } catch (e) {
        console.warn('Could not draw left signature image:', e);
      }
    }

    const leftNameY = sigY + 23;
    doc.setFont('helvetica', 'bold');
    doc.text(config.leftSignerName || '( .................................................. )', 20, leftNameY);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${config.leftSignerNip || '............................................'}`, 20, leftNameY + 4.5);

    // Right Signature (Kepala Sekolah)
    const rightX = pageWidth - 80;
    doc.text(`${config.rightSignerCity}, ${config.rightSignerDate}`, rightX, sigY);
    doc.text(config.rightSignerTitle, rightX, sigY + 4.5);

    if (config.rightSignerSignatureUrl) {
      try {
        doc.addImage(config.rightSignerSignatureUrl, 'PNG', rightX, sigY + 6, 32, 14);
      } catch (e) {
        console.warn('Could not draw right signature image:', e);
      }
    }

    const rightNameY = sigY + 23;
    doc.setFont('helvetica', 'bold');
    doc.text(config.rightSignerName, rightX, rightNameY);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${config.rightSignerNip}`, rightX, rightNameY + 4.5);

    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Terjadi kesalahan saat mencetak PDF.');
  }
}

/**
 * Helper to convert column index to Excel column letter (0 -> A, 27 -> AB)
 */
export function getExcelColumnLetter(colIndex: number): string {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Export Leger Nilai to Excel with REAL dynamic logical formulas
 * (AVERAGE, IF for Predicate, IF for KKM Pass/Remedial, and bottom summary statistics)
 */
export function exportLegerExcelWithFormulas(
  students: { id: string; nisn: string; nis: string; fullName: string }[],
  assessments: { id: string; title: string; weight: number; type: string }[],
  scoresMap: Record<string, Record<string, number>>, // [studentId][assessmentId] => score
  kkm: number,
  className: string,
  subjectName: string,
  academicYear: string,
  fileName: string
) {
  try {
    const wb = XLSX.utils.book_new();

    // Headers information
    const data: any[][] = [
      ['YAYASAN MARDI YUANA - SMK MARDI YUANA CIKEMBAR'],
      ['LEGER NILAI AKADEMIK KURIKULUM MERDEKA (BERUMUS OTOMATIS)'],
      [`Kelas: ${className}`, `Mata Pelajaran: ${subjectName}`, `KKM: ${kkm}`, `T.A.: ${academicYear}`],
      [], // blank row
    ];

    // Table Header (Row index 4 in 0-indexed, which is row 5 in Excel)
    const tableHeader = ['No', 'NISN', 'NIS', 'Nama Siswa'];
    assessments.forEach(asm => {
      tableHeader.push(`${asm.title} (${asm.weight}%)`);
    });
    tableHeader.push('Nilai Akhir', 'Predikat', 'Status KKM');
    data.push(tableHeader);

    // Starting data row in Excel: row 6 (1-indexed)
    const startRow = 6;
    const scoreStartColIdx = 4; // column E is index 4 (0-based)
    const scoreEndColIdx = scoreStartColIdx + assessments.length - 1;

    students.forEach((std, idx) => {
      const rowNum = startRow + idx;
      const rowData: any[] = [idx + 1, std.nisn, std.nis, std.fullName];

      // Add scores or default 0
      assessments.forEach(asm => {
        const val = scoresMap[std.id]?.[asm.id] ?? 80;
        rowData.push(val);
      });

      // Nilai Akhir cell formula
      const startColLetter = getExcelColumnLetter(scoreStartColIdx);
      const endColLetter = getExcelColumnLetter(scoreEndColIdx);
      const naColLetter = getExcelColumnLetter(scoreEndColIdx + 1);

      // Formulas will be injected into worksheet object below
      rowData.push(0); // placeholder for Nilai Akhir
      rowData.push(''); // placeholder for Predikat
      rowData.push(''); // placeholder for Status KKM

      data.push(rowData);
    });

    const lastStudentRow = startRow + students.length - 1;
    const naColLetter = getExcelColumnLetter(scoreEndColIdx + 1);
    const predColLetter = getExcelColumnLetter(scoreEndColIdx + 2);
    const kkmColLetter = getExcelColumnLetter(scoreEndColIdx + 3);

    // Summary statistics rows at the bottom
    const avgRowIndex = lastStudentRow + 2;
    const maxRowIndex = lastStudentRow + 3;
    const minRowIndex = lastStudentRow + 4;
    const tuntasRowIndex = lastStudentRow + 5;

    data.push([]); // blank row
    const avgRow: any[] = ['', '', '', 'RATA-RATA KELAS'];
    const maxRow: any[] = ['', '', '', 'NILAI TERTINGGI'];
    const minRow: any[] = ['', '', '', 'NILAI TERENDAH'];
    const tuntasRow: any[] = ['', '', '', 'JUMLAH SISWA TUNTAS'];

    for (let c = 0; c < assessments.length + 3; c++) {
      avgRow.push(0);
      maxRow.push(0);
      minRow.push(0);
    }
    tuntasRow.push(0);

    data.push(avgRow);
    data.push(maxRow);
    data.push(minRow);
    data.push(tuntasRow);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Inject formulas for each student row
    students.forEach((_, idx) => {
      const r = startRow + idx;
      const startColLetter = getExcelColumnLetter(scoreStartColIdx);
      const endColLetter = getExcelColumnLetter(scoreEndColIdx);

      // Nilai Akhir Formula: =ROUND(AVERAGE(E6:G6), 0)
      const naCellRef = `${naColLetter}${r}`;
      ws[naCellRef] = {
        t: 'n',
        f: `ROUND(AVERAGE(${startColLetter}${r}:${endColLetter}${r}), 0)`,
      };

      // Predikat Formula: =IF(H6>=90,"A",IF(H6>=80,"B",IF(H6>=75,"C","D")))
      const predCellRef = `${predColLetter}${r}`;
      ws[predCellRef] = {
        t: 's',
        f: `IF(${naColLetter}${r}>=90,"A",IF(${naColLetter}${r}>=80,"B",IF(${naColLetter}${r}>=75,"C","D")))`,
      };

      // Status KKM Formula: =IF(H6>=75,"TUNTAS","REMEDIAL")
      const kkmCellRef = `${kkmColLetter}${r}`;
      ws[kkmCellRef] = {
        t: 's',
        f: `IF(${naColLetter}${r}>=${kkm},"TUNTAS","REMEDIAL")`,
      };
    });

    // Inject summary formulas for each column
    for (let c = scoreStartColIdx; c <= scoreEndColIdx + 1; c++) {
      const colLetter = getExcelColumnLetter(c);
      // Average
      ws[`${colLetter}${avgRowIndex}`] = {
        t: 'n',
        f: `ROUND(AVERAGE(${colLetter}${startRow}:${colLetter}${lastStudentRow}), 1)`,
      };
      // Max
      ws[`${colLetter}${maxRowIndex}`] = {
        t: 'n',
        f: `MAX(${colLetter}${startRow}:${colLetter}${lastStudentRow})`,
      };
      // Min
      ws[`${colLetter}${minRowIndex}`] = {
        t: 'n',
        f: `MIN(${colLetter}${startRow}:${colLetter}${lastStudentRow})`,
      };
    }

    // Siswa Tuntas count formula
    ws[`${kkmColLetter}${tuntasRowIndex}`] = {
      t: 'n',
      f: `COUNTIF(${kkmColLetter}${startRow}:${kkmColLetter}${lastStudentRow}, "TUNTAS")`,
    };

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 14 }, // NISN
      { wch: 10 }, // NIS
      { wch: 28 }, // Nama Siswa
      ...assessments.map(() => ({ wch: 16 })),
      { wch: 12 }, // Nilai Akhir
      { wch: 10 }, // Predikat
      { wch: 14 }, // Status KKM
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Leger_Nilai_Berumus');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (err) {
    console.error('Error generating formula Excel:', err);
    alert('Terjadi kesalahan saat membuat file Excel berumus.');
  }
}

/**
 * Export Attendance to Excel with logical formulas
 * (COUNTIF for H, S, I, A, T and percentage formulas)
 */
export function exportAttendanceExcelWithFormulas(
  students: { id: string; nisn: string; fullName: string; className: string }[],
  dates: string[],
  attendanceMap: Record<string, Record<string, string>>, // [studentId][date] => 'H' | 'S' | 'I' | 'A' | 'T'
  className: string,
  academicYear: string,
  fileName: string
) {
  try {
    const wb = XLSX.utils.book_new();

    const data: any[][] = [
      ['YAYASAN MARDI YUANA - SMK MARDI YUANA CIKEMBAR'],
      ['REKAPITULASI PRESENSI SISWA (BERUMUS OTOMATIS)'],
      [`Kelas: ${className}`, `Tahun Ajaran: ${academicYear}`, `Total Siswa: ${students.length}`],
      [],
    ];

    const tableHeader = ['No', 'NISN', 'Nama Siswa'];
    dates.forEach(d => tableHeader.push(d.split('-').slice(1).join('/')));
    tableHeader.push('Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Telat (T)', '% Kehadiran');
    data.push(tableHeader);

    const startRow = 6;
    const dateStartColIdx = 3; // Column D (0-indexed 3)
    const dateEndColIdx = dateStartColIdx + dates.length - 1;

    students.forEach((std, idx) => {
      const rowData: any[] = [idx + 1, std.nisn, std.fullName];
      dates.forEach(d => {
        rowData.push(attendanceMap[std.id]?.[d] || 'H');
      });
      // Placeholders for H, S, I, A, T, %
      rowData.push(0, 0, 0, 0, 0, 0);
      data.push(rowData);
    });

    const lastStudentRow = startRow + students.length - 1;
    const colH = getExcelColumnLetter(dateEndColIdx + 1);
    const colS = getExcelColumnLetter(dateEndColIdx + 2);
    const colI = getExcelColumnLetter(dateEndColIdx + 3);
    const colA = getExcelColumnLetter(dateEndColIdx + 4);
    const colT = getExcelColumnLetter(dateEndColIdx + 5);
    const colPct = getExcelColumnLetter(dateEndColIdx + 6);
    const dateStartCol = getExcelColumnLetter(dateStartColIdx);
    const dateEndCol = getExcelColumnLetter(dateEndColIdx);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Inject formulas for each student
    students.forEach((_, idx) => {
      const r = startRow + idx;
      ws[`${colH}${r}`] = { t: 'n', f: `COUNTIF(${dateStartCol}${r}:${dateEndCol}${r}, "H")` };
      ws[`${colS}${r}`] = { t: 'n', f: `COUNTIF(${dateStartCol}${r}:${dateEndCol}${r}, "S")` };
      ws[`${colI}${r}`] = { t: 'n', f: `COUNTIF(${dateStartCol}${r}:${dateEndCol}${r}, "I")` };
      ws[`${colA}${r}`] = { t: 'n', f: `COUNTIF(${dateStartCol}${r}:${dateEndCol}${r}, "A")` };
      ws[`${colT}${r}`] = { t: 'n', f: `COUNTIF(${dateStartCol}${r}:${dateEndCol}${r}, "T")` };
      ws[`${colPct}${r}`] = {
        t: 'n',
        f: `ROUND(((${colH}${r}+${colT}${r})/${dates.length})*100, 1)`,
      };
    });

    // Summary row
    const sumRowIdx = lastStudentRow + 2;
    data.push([]);
    const sumRow: any[] = ['', '', 'TOTAL HADIR PER HARI'];
    dates.forEach((_, dIdx) => {
      const dCol = getExcelColumnLetter(dateStartColIdx + dIdx);
      ws[`${dCol}${sumRowIdx}`] = {
        t: 'n',
        f: `COUNTIF(${dCol}${startRow}:${dCol}${lastStudentRow}, "H")`,
      };
    });

    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      ...dates.map(() => ({ wch: 8 })),
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Presensi_Berumus');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (err) {
    console.error('Error generating attendance Excel:', err);
    alert('Terjadi kesalahan saat mengekspor presensi berumus.');
  }
}
