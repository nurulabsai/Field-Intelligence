import { google } from 'googleapis';
import { env, isGoogleSheetsConfigured } from '../config/env.js';

// Only initialize if configured
let sheets: ReturnType<typeof google.sheets> | null = null;

if (isGoogleSheetsConfigured()) {
  const auth = new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheets = google.sheets({ version: 'v4', auth });
  console.log('[GoogleSheets] Service initialized');
} else {
  console.warn('[GoogleSheets] Not configured - data will not sync to Google Sheets');
}

export interface AuditRow {
  auditId: string;
  auditType: 'farm' | 'business';
  businessName: string;
  auditorName: string;
  auditDate: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  [key: string]: any; // Additional fields
}

export const appendToSheet = async (data: AuditRow): Promise<void> => {
  if (!sheets) {
    console.warn('[GoogleSheets] Not configured - skipping append');
    return;
  }

  try {
    // Determine which sheet tab based on audit type
    const sheetName = data.auditType === 'farm' ? 'Farm Audits' : 'Business Audits';
    
    // Prepare row data
    const values = [
      [
        data.auditId,
        data.auditDate,
        data.auditorName,
        data.businessName,
        data.location || '',
        data.latitude?.toString() || '',
        data.longitude?.toString() || '',
        data.status,
        JSON.stringify(data), // Full data as JSON
        new Date().toISOString(), // Sync timestamp
      ],
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    
    console.log(`[GoogleSheets] Appended audit ${data.auditId} to ${sheetName}`);
  } catch (error) {
    console.error('[GoogleSheets] Error:', error);
    throw new Error('Failed to write to Google Sheets');
  }
};

export const batchAppendToSheet = async (dataArray: AuditRow[]): Promise<void> => {
  if (dataArray.length === 0) return;
  
  if (!sheets) {
    console.warn('[GoogleSheets] Not configured - skipping batch append');
    return;
  }
  
  try {
    const farmAudits = dataArray.filter(d => d.auditType === 'farm');
    const businessAudits = dataArray.filter(d => d.auditType === 'business');
    
    const requests = [];
    
    if (farmAudits.length > 0) {
      const farmValues = farmAudits.map(data => [
        data.auditId,
        data.auditDate,
        data.auditorName,
        data.businessName,
        data.location || '',
        data.latitude?.toString() || '',
        data.longitude?.toString() || '',
        data.status,
        JSON.stringify(data),
        new Date().toISOString(),
      ]);
      
      requests.push(
        sheets.spreadsheets.values.append({
          spreadsheetId: env.GOOGLE_SHEET_ID,
          range: 'Farm Audits!A:J',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: farmValues },
        })
      );
    }
    
    if (businessAudits.length > 0) {
      const businessValues = businessAudits.map(data => [
        data.auditId,
        data.auditDate,
        data.auditorName,
        data.businessName,
        data.location || '',
        data.latitude?.toString() || '',
        data.longitude?.toString() || '',
        data.status,
        JSON.stringify(data),
        new Date().toISOString(),
      ]);
      
      requests.push(
        sheets.spreadsheets.values.append({
          spreadsheetId: env.GOOGLE_SHEET_ID,
          range: 'Business Audits!A:J',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: businessValues },
        })
      );
    }
    
    await Promise.all(requests);
    console.log(`[GoogleSheets] Batch appended ${dataArray.length} audits`);
  } catch (error) {
    console.error('[GoogleSheets] Batch error:', error);
    throw new Error('Failed to batch write to Google Sheets');
  }
};
