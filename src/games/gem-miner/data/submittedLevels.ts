import type { DesignerLevel, SubmittedLevel } from '../types';

const API = '/api/community-levels';
// Static file served from public/ — used as GET fallback in production builds
const STATIC = import.meta.env.BASE_URL + 'community-levels.json';

// Google Sheets API endpoint
// Options:
// 1. Use SheetDB.io (easiest): Create sheet, connect at sheetdb.io, paste URL
// 2. Use Apps Script: See docs/google-apps-script.js for setup
const SHEETS_API = import.meta.env.VITE_SHEETS_API || '';

/** True when running on local dev server (not GitHub Pages) */
function isLocalDev(): boolean {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Error class for API submission errors with details
 */
export class SubmissionError extends Error {
  details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'SubmissionError';
    this.details = details;
  }
}

/**
 * Parse a single SheetDB row into a SubmittedLevel
 */
function parseSheetRow(row: Record<string, unknown>): SubmittedLevel | null {
  try {
    if (!row.id) return null;
    return {
      id: String(row.id),
      name: String(row.name || ''),
      description: String(row.description || ''),
      rows: Number(row.rows) || 8,
      cols: Number(row.cols) || 8,
      grid: typeof row.grid === 'string' ? JSON.parse(row.grid) : (row.grid || []),
      availableGems: typeof row.availableGems === 'string' ? JSON.parse(row.availableGems) : (row.availableGems || []),
      objectives: typeof row.objectives === 'string' ? JSON.parse(row.objectives) : (row.objectives || []),
      maxMoves: Number(row.maxMoves) || 25,
      starThresholds: typeof row.starThresholds === 'string' ? JSON.parse(row.starThresholds) : (row.starThresholds || [1000, 2000, 3500]),
      submittedAt: Number(row.submittedAt) || Date.now(),
    } as SubmittedLevel;
  } catch {
    // Skip malformed rows
    return null;
  }
}

/**
 * Fetch all submitted community levels
 */
export async function fetchSubmittedLevels(): Promise<SubmittedLevel[]> {
  // Try local API first (dev server only — skip on GitHub Pages to avoid HTML 404 responses)
  if (isLocalDev()) {
    try {
      const res = await fetch(API);
      if (res.ok) return await res.json();
    } catch { /* dev server not running */ }
  }

  // Try Google Sheets API (production on GitHub Pages)
  if (SHEETS_API) {
    try {
      const res = await fetch(SHEETS_API);
      if (res.ok) {
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [];
        const levels = rows
          .map((row: Record<string, unknown>) => parseSheetRow(row))
          .filter((level): level is SubmittedLevel => level !== null);
        return levels;
      }
      console.warn('[community-levels] Sheets API returned status:', res.status);
    } catch (err) {
      console.warn('[community-levels] Sheets API fetch failed:', err);
    }
  } else if (!isLocalDev()) {
    console.warn('[community-levels] VITE_SHEETS_API is not configured — community levels will not load');
  }

  // Fall back to static JSON file
  try {
    const fallback = await fetch(STATIC);
    if (fallback.ok) return await fallback.json();
  } catch { /* offline / broken */ }

  return [];
}

/**
 * Submit a new level to the community
 * Throws SubmissionError with details if validation fails
 */
export async function submitLevel(level: DesignerLevel): Promise<SubmittedLevel> {
  // Try local API first (dev server only)
  if (isLocalDev()) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(level),
      });

      if (res.ok) {
        return await res.json();
      }

      const errorData = await parseErrorResponse(res);
      throw new SubmissionError(
        errorData?.error || `Server error (${res.status})`,
        errorData?.details
      );
    } catch (err) {
      if (err instanceof SubmissionError) throw err;
      // Local API not available — fall through to Sheets
    }
  }

  // Try Google Sheets API (production on GitHub Pages)
  if (SHEETS_API) {
    try {
      // Generate ID and timestamp
      const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const submittedAt = Date.now();

      // Prepare the row data (works with SheetDB, Sheet.best, or custom Apps Script)
      const rowData = {
        id,
        name: level.name,
        description: level.description,
        rows: level.rows,
        cols: level.cols,
        grid: JSON.stringify(level.grid),
        availableGems: JSON.stringify(level.availableGems),
        objectives: JSON.stringify(level.objectives),
        maxMoves: level.maxMoves,
        starThresholds: JSON.stringify(level.starThresholds),
        submittedAt,
      };

      // SheetDB expects { data: row }, Apps Script expects the level directly
      const isSheetDB = SHEETS_API.includes('sheetdb.io');
      const body = isSheetDB ? { data: rowData } : level;

      const res = await fetch(SHEETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        return {
          ...level,
          id,
          submittedAt,
        } as SubmittedLevel;
      }

      const errorData = await parseErrorResponse(res);
      throw new SubmissionError(
        errorData?.error || `Sheets API error (${res.status})`,
        errorData?.details
      );
    } catch (err) {
      if (err instanceof SubmissionError) throw err;
      throw new SubmissionError('Failed to submit to Google Sheets. Check your connection.');
    }
  }

  throw new SubmissionError(
    'No backend available. Set up Google Sheets API for GitHub Pages deployment.',
    ['See docs/google-apps-script.js for setup instructions']
  );
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(res: Response): Promise<{ error?: string; message?: string; details?: string[] } | null> {
  try {
    const text = await res.text();
    if (text) return JSON.parse(text);
  } catch { /* Response wasn't JSON */ }
  return null;
}

/**
 * Delete a submitted level by ID
 */
export async function deleteSubmittedLevel(id: string): Promise<boolean> {
  const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

  if (!res.ok) {
    if (res.status === 404) return false;
    throw new Error('Failed to delete level');
  }

  return true;
}
