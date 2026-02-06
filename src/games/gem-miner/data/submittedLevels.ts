import type { DesignerLevel, SubmittedLevel } from '../types';

const API = '/api/community-levels';
// Static file served from public/ — used as GET fallback in production builds
const STATIC = import.meta.env.BASE_URL + 'community-levels.json';

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
  try {
    // Try the API first (dev server), fall back to static JSON (production)
    const res = await fetch(API);
    if (res.ok) return res.json();
    const fallback = await fetch(STATIC);
    if (fallback.ok) return fallback.json();
  } catch {
    try {
      const fallback = await fetch(STATIC);
      if (fallback.ok) return fallback.json();
    } catch { /* offline / broken */ }
  }
  return [];
}

/**
 * Submit a new level to the community
 * Throws SubmissionError with details if validation fails
 */
export async function submitLevel(level: DesignerLevel): Promise<SubmittedLevel> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(level),
  });

  if (!res.ok) {
    // Try to parse error details from response
    try {
      const errorData = await res.json();

      // Handle rate limiting
      if (res.status === 429) {
        throw new SubmissionError(
          errorData.message || 'Rate limit exceeded. Please try again later.',
          []
        );
      }

      // Handle validation errors
      if (errorData.details && Array.isArray(errorData.details)) {
        throw new SubmissionError(
          errorData.error || 'Validation failed',
          errorData.details
        );
      }

      throw new SubmissionError(errorData.error || 'Failed to submit level');
    } catch (e) {
      if (e instanceof SubmissionError) throw e;
      throw new SubmissionError('Failed to submit level');
    }
  }

  return res.json();
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
