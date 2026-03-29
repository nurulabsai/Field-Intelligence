
import { AuditRecord, User } from '../types';
import { flattenAuditData } from './googleSheetsService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (audits: AuditRecord[], type: 'farm' | 'business' | 'all') => {
  const filtered = type === 'all' ? audits : audits.filter(a => a.type === type);
  if (filtered.length === 0) {
      alert(`No ${type} audits to export.`);
      return;
  }

  const flattened = filtered.map(a => flattenAuditData(a));
  
  // Get all unique keys
  const headers = Array.from(new Set(flattened.flatMap(Object.keys)));
  
  const csvContent = [
    headers.join(','),
    ...flattened.map(row => headers.map(header => {
      const val = row[header];
      const str = val === undefined || val === null ? '' : String(val);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ].join('\n');

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  downloadFile(csvContent, `${type}_audits_${date}.csv`, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (audits: AuditRecord[]) => {
  if (audits.length === 0) {
      alert("No data to export.");
      return;
  }
  const data = JSON.stringify(audits, null, 2);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  downloadFile(data, `nuruos_full_export_${date}.json`, 'application/json');
};

export const createBackup = (audits: AuditRecord[]) => {
  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    audits: audits
  };
  const data = JSON.stringify(backup, null, 2);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  downloadFile(data, `nuruos_backup_${date}.json`, 'application/json');
};

export const generatePDFReport = (audits: AuditRecord[], user: User) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text("Auditor Performance Summary", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${today}`, 14, 30);
  doc.text(`Inspector: ${user.name}`, 14, 35);

  // Stats
  const total = audits.length;
  const synced = audits.filter(a => a.status === 'synced').length;
  const pending = audits.filter(a => a.status === 'pending').length;
  const drafts = audits.filter(a => a.status === 'draft').length;
  
  const byRegion: Record<string, number> = {};
  let totalGPSAccuracy = 0;
  let countGPS = 0;

  audits.forEach(a => {
    const region = a.farmData?.region || a.businessData?.region || 'Unknown';
    byRegion[region] = (byRegion[region] || 0) + 1;
    if (a.location?.accuracy) {
        totalGPSAccuracy += a.location.accuracy;
        countGPS++;
    }
  });
  const avgGPS = countGPS > 0 ? Math.round(totalGPSAccuracy / countGPS) : 0;

  let y = 50;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Overview", 14, y);
  doc.line(14, y + 2, 196, y + 2); // Horizontal line
  
  y += 10;
  doc.setFontSize(12);
  doc.text(`Total Audits Completed: ${total}`, 20, y); y += 7;
  doc.text(`Successfully Synced: ${synced}`, 20, y); y += 7;
  doc.text(`Pending Upload: ${pending}`, 20, y); y += 7;
  doc.text(`Drafts in Progress: ${drafts}`, 20, y); y += 7;
  doc.text(`Average GPS Accuracy: ${avgGPS} meters`, 20, y); y += 12;

  doc.setFontSize(14);
  doc.text("Regional Breakdown", 14, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 10;
  
  Object.entries(byRegion).forEach(([reg, count]) => {
    doc.setFontSize(12);
    doc.text(`${reg}: ${count} audits`, 20, y);
    y += 7;
  });

  // Table
  y += 10;
  doc.setFontSize(14);
  doc.text("Recent Audit Log", 14, y);
  y += 5;

  const tableData = audits.slice(0, 15).map(a => [
    a.type.toUpperCase(),
    a.businessName.substring(0, 25),
    a.location?.accuracy ? `${Math.round(a.location.accuracy)}m` : '-',
    a.status,
    new Date(a.createdAt).toLocaleDateString()
  ]);

  (doc as any).autoTable({
    startY: y,
    head: [['Type', 'Name', 'GPS', 'Status', 'Date']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 51, 102] },
  });

  doc.save(`auditor_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
};
