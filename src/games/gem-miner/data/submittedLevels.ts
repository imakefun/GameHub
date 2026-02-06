import type { DesignerLevel, SubmittedLevel } from '../types';

const API = '/api/community-levels';
// Static file served from public/ — used as GET fallback in production builds
const STATIC = import.meta.env.BASE_URL + 'community-levels.json';

// Google Sheets API endpoint (set this after deploying your Apps Script)
// To set up: see docs/google-apps-script.js for instructions
const SHEETS_API = import.meta.env.VITE_SHEETS_API || '';

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
 * Fetch all submitted community levels
 */
export async function fetchSubmittedLevels(): Promise<SubmittedLevel[]> {
  // Try local API first (dev server)
  try {
    const res = await fetch(API);
    if (res.ok) return res.json();
  } catch { /* dev server not running */ }

  // Try Google Sheets API (production on GitHub Pages)
  if (SHEETS_API) {
    try {
      const res = await fetch(SHEETS_API);
      if (res.ok) return res.json();
    } catch { /* sheets API failed */ }
  }

  // Fall back to static JSON file
  try {
    const fallback = await fetch(STATIC);
    if (fallback.ok) return fallback.json();
  } catch { /* offline / broken */ }

  return [];
}

/**
 * Submit a new level to the community
 * Throws SubmissionError with details if validation fails
 */
export async function submitLevel(level: DesignerLevel): Promise<SubmittedLevel> {
  // Try local API first (dev server)
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(level),
    });

    if (res.ok) {
      return res.json();
    }

    // If we got an error response from the local API, handle it
    if (res.status !== 404 && res.status !== 405) {
      const errorData = await parseErrorResponse(res);
      throw new SubmissionError(
        errorData?.error || `Server error (${res.status})`,
        errorData?.details
      );
    }
  } catch (err) {
    // If it's already a SubmissionError, rethrow it
    if (err instanceof SubmissionError) {
      throw err;
    }
    // Otherwise, local API not available - try Google Sheets
  }

  // Try Google Sheets API (production on GitHub Pages)
  if (SHEETS_API) {
    try {
      const res = await fetch(SHEETS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(level),
      });

      if (res.ok) {
        return res.json();
      }

      const errorData = await parseErrorResponse(res);
      throw new SubmissionError(
        errorData?.error || `Sheets API error (${res.status})`,
        errorData?.details
      );
    } catch (err) {
      if (err instanceof SubmissionError) {
        throw err;
      }
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
    if (text) {
      return JSON.parse(text);
    }
  } catch {
    // Response wasn't JSON
  }
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
