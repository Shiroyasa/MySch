import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportHeaderOptions {
  title: string;
  subtitle?: string;
  academicYear?: string;
  className?: string;
  subjectName?: string;
  dateRange?: string;
  studentName?: string;
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

export function exportToPdf(
  headers: string[],
  rows: (string | number)[][],
  options: ExportHeaderOptions,
  fileName: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
) {
  try {
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Formal Kop Surat SMK Mardi Yuana Cikembar
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Navy
    doc.text('YAYASAN MARDI YUANA', pageWidth / 2, 14, { align: 'center' });

    doc.setFontSize(14);
    doc.text('SMK MARDI YUANA CIKEMBAR', pageWidth / 2, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Kompetensi Keahlian: Rekayasa Perangkat Lunak | Teknik Komputer Jaringan | OTKP | AKL | BDP', pageWidth / 2, 25, { align: 'center' });
    doc.text('Jl. Pelabuhan II KM. 19 Cikembar, Kab. Sukabumi, Jawa Barat 43359 | Telp: (0266) 632145 | info@smkmy-cikembar.sch.id', pageWidth / 2, 29, { align: 'center' });

    // Decorative line
    doc.setDrawColor(37, 99, 235); // Blue line
    doc.setLineWidth(0.8);
    doc.line(14, 32, pageWidth - 14, 32);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.2);
    doc.line(14, 33, pageWidth - 14, 33);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(options.title.toUpperCase(), pageWidth / 2, 41, { align: 'center' });

    // Metadata details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    let metaY = 47;
    const metaLeft: string[] = [];
    if (options.studentName) metaLeft.push(`Nama Siswa: ${options.studentName}`);
    if (options.className) metaLeft.push(`Kelas: ${options.className}`);
    if (options.subjectName) metaLeft.push(`Mata Pelajaran: ${options.subjectName}`);
    if (options.academicYear) metaLeft.push(`Tahun Ajaran: ${options.academicYear}`);
    if (options.dateRange) metaLeft.push(`Periode: ${options.dateRange}`);

    metaLeft.forEach((item, index) => {
      doc.text(item, 14, metaY + index * 5);
    });

    const startTableY = metaY + Math.max(metaLeft.length * 5, 5) + 3;

    // Render Table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startTableY,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42], // Navy #0F172A
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Slate-50
      },
    });

    // Signature blocks
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Check if space for signatures or need new page
    if (finalY + 35 > pageHeight) {
      doc.addPage();
    }

    const sigY = finalY + 35 > pageHeight ? 20 : finalY;
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    
    // Left: Homeroom or Teacher
    doc.text('Mengetahui,', 20, sigY);
    doc.text('Wali Kelas / Guru Pengampu,', 20, sigY + 5);
    doc.text('( .................................................. )', 20, sigY + 25);
    doc.text('NIP. ............................................', 20, sigY + 30);

    // Right: Principal
    const rightX = pageWidth - 75;
    doc.text(`Cikembar, ${today}`, rightX, sigY);
    doc.text('Kepala SMK Mardi Yuana Cikembar,', rightX, sigY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Drs. H. Suryana, M.M.Pd.', rightX, sigY + 25);
    doc.setFont('helvetica', 'normal');
    doc.text('NIP. 196803151992031002', rightX, sigY + 30);

    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Terjadi kesalahan saat mencetak PDF.');
  }
}
