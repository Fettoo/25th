import { YearData } from '../types/index';
import defaultData from './journalData.json';

export const DEFAULT_JOURNAL_DATA: YearData[] = defaultData as YearData[];

export const STORAGE_KEY_JOURNAL = 'sophie_journal_custom_data';

/**
 * Retrieves the current journal data:
 * 1. Checks localStorage for any custom updates made in the Studio Dashboard
 * 2. Falls back to default journal data from journalData.json
 */
export function getStoredJournalData(): YearData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading stored journal data from localStorage:', error);
  }
  return DEFAULT_JOURNAL_DATA;
}

/**
 * Saves updated journal data:
 * 1. Persists to browser localStorage immediately (real-time reactivity)
 * 2. Attempts to sync with local Vite dev server API to write directly to src/data/journalData.json on disk
 */
export async function saveJournalData(data: YearData[]): Promise<{ savedToDisk: boolean; message: string }> {
  // 1. Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(data));
  } catch (error) {
    console.warn('LocalStorage save failed (possible quota limit):', error);
  }

  // 2. Attempt to save to disk via Vite dev middleware
  try {
    const res = await fetch('/api/save-journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    if (res.ok) {
      const result = await res.json();
      return {
        savedToDisk: true,
        message: result.message || 'Data berhasil disimpan secara permanen ke src/data/journalData.json'
      };
    }
  } catch {
    // API not available (e.g. static production on GitHub Pages)
  }

  return {
    savedToDisk: false,
    message: 'Data tersimpan di penyimpanan browser (LocalStorage)'
  };
}

/**
 * Uploads a media asset (photo or audio):
 * 1. Tries to save directly to public/photos or public/audio via Vite dev API
 * 2. Falls back to Base64 Data URL for client-only operation
 */
export async function uploadMediaAsset(
  file: File, 
  mediaType: 'photo' | 'audio'
): Promise<{ url: string; fileName: string; isLocalFile: boolean }> {
  // Convert to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        base64Data,
        mediaType
      })
    });

    if (res.ok) {
      const result = await res.json();
      return {
        url: result.url,
        fileName: result.fileName,
        isLocalFile: true
      };
    }
  } catch {
    // Vite API unavailable
  }

  // Fallback: Return Base64 data URL
  return {
    url: base64Data,
    fileName: file.name,
    isLocalFile: false
  };
}

/**
 * Downloads current journal data as a json file backup
 */
export function exportJournalDataAsFile(data: YearData[]) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sophie-25th-journal-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Resets journal data to default values
 */
export function resetJournalDataToDefault(): YearData[] {
  try {
    localStorage.removeItem(STORAGE_KEY_JOURNAL);
  } catch (error) {
    console.error('Error clearing localStorage journal data:', error);
  }
  return DEFAULT_JOURNAL_DATA;
}

// Backward compatibility export
export const JOURNAL_DATA = DEFAULT_JOURNAL_DATA;
