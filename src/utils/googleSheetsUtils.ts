import { getCachedGoogleToken, loginWithGoogle } from '../lib/firebase';

export interface GoogleSheetExportOptions {
  title: string;
  sheetName?: string;
  headers: string[];
  rows: (string | number)[][];
}

export async function exportToGoogleSheets({
  title,
  sheetName = 'Sheet1',
  headers,
  rows,
}: GoogleSheetExportOptions): Promise<{ success: boolean; spreadsheetUrl?: string; error?: string }> {
  try {
    let token = getCachedGoogleToken();

    // If not authenticated yet with Google, trigger Google popup
    if (!token) {
      await loginWithGoogle();
      token = getCachedGoogleToken();
    }

    if (!token) {
      return {
        success: false,
        error: 'Tidak dapat memperoleh token otorisasi Google Workspace. Silakan login kembali dengan Google.',
      };
    }

    // Step 1: Create a new Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `${title} - SMK Mardi Yuana (${new Date().toLocaleDateString('id-ID')})`,
        },
        sheets: [
          {
            properties: {
              title: sheetName,
            },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gagal membuat spreadsheet (Status: ${createRes.status})`);
    }

    const spreadsheet = await createRes.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = spreadsheet.spreadsheetUrl;

    // Step 2: Append / Update Values
    const allValues = [headers, ...rows];
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `${sheetName}!A1`,
          majorDimension: 'ROWS',
          values: allValues,
        }),
      }
    );

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Gagal mengisi data ke Google Sheets');
    }

    return {
      success: true,
      spreadsheetUrl,
    };
  } catch (error: any) {
    console.error('Google Sheets Export Error:', error);
    return {
      success: false,
      error: error?.message || 'Terjadi kesalahan saat mengekspor ke Google Sheets.',
    };
  }
}
