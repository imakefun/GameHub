/**
 * Database Module for Community Levels
 *
 * Uses SQLite for persistent storage of community-submitted levels.
 * Includes migration support and proper error handling.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

// Database types
export interface StoredLevel {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  grid: string; // JSON stringified
  available_gems: string; // JSON stringified
  objectives: string; // JSON stringified
  max_moves: number;
  star_thresholds: string; // JSON stringified
  submitted_at: number;
  ip_hash: string | null; // Hashed IP for rate limiting
  play_count: number;
  like_count: number;
}

export interface SubmittedLevel {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  grid: unknown[][];
  availableGems: string[];
  objectives: unknown[];
  maxMoves: number;
  starThresholds: [number, number, number];
  submittedAt: number;
  playCount?: number;
  likeCount?: number;
}

let db: Database.Database | null = null;

/**
 * Get database file path
 */
function getDbPath(): string {
  // Store in data directory next to the project
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'community-levels.db');
}

/**
 * Initialize the database connection and create tables
 */
export function initDatabase(): Database.Database {
  if (db) return db;

  const dbPath = getDbPath();
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS levels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      rows INTEGER NOT NULL,
      cols INTEGER NOT NULL,
      grid TEXT NOT NULL,
      available_gems TEXT NOT NULL,
      objectives TEXT NOT NULL,
      max_moves INTEGER NOT NULL,
      star_thresholds TEXT NOT NULL,
      submitted_at INTEGER NOT NULL,
      ip_hash TEXT,
      play_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_submitted_at ON levels(submitted_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ip_hash ON levels(ip_hash);

    -- Rate limiting table
    CREATE TABLE IF NOT EXISTS rate_limits (
      ip_hash TEXT PRIMARY KEY,
      last_submit INTEGER NOT NULL,
      submit_count INTEGER DEFAULT 1
    );
  `);

  // Migrate existing JSON data if present
  migrateFromJson();

  return db;
}

/**
 * Migrate existing levels from JSON file to SQLite
 */
function migrateFromJson(): void {
  if (!db) return;

  const jsonPath = path.resolve(process.cwd(), 'public/community-levels.json');
  if (!fs.existsSync(jsonPath)) return;

  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (!Array.isArray(jsonData) || jsonData.length === 0) return;

    // Check if we already have levels (don't migrate twice)
    const count = db.prepare('SELECT COUNT(*) as count FROM levels').get() as { count: number };
    if (count.count > 0) return;

    console.log(`Migrating ${jsonData.length} levels from JSON to SQLite...`);

    const insert = db.prepare(`
      INSERT OR IGNORE INTO levels (
        id, name, description, rows, cols, grid, available_gems,
        objectives, max_moves, star_thresholds, submitted_at, ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((levels: unknown[]) => {
      for (const level of levels) {
        if (!level || typeof level !== 'object') continue;
        const l = level as Record<string, unknown>;

        // Basic validation
        if (!l.id || !l.name) continue;

        insert.run(
          String(l.id),
          String(l.name || 'Untitled'),
          String(l.description || ''),
          Number(l.rows) || 8,
          Number(l.cols) || 8,
          JSON.stringify(l.grid || []),
          JSON.stringify(l.availableGems || []),
          JSON.stringify(l.objectives || []),
          Number(l.maxMoves) || 25,
          JSON.stringify(l.starThresholds || [1000, 2000, 3000]),
          Number(l.submittedAt) || Date.now(),
          null
        );
      }
    });

    insertMany(jsonData);
    console.log('Migration complete!');

    // Backup the old JSON file
    fs.renameSync(jsonPath, jsonPath + '.backup');
  } catch (err) {
    console.error('Failed to migrate JSON data:', err);
  }
}

/**
 * Hash an IP address for privacy-preserving rate limiting
 */
export function hashIp(ip: string): string {
  // Simple hash - in production you'd want a cryptographic hash with salt
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return 'ip_' + Math.abs(hash).toString(36);
}

/**
 * Check rate limit for an IP
 * Returns true if the request should be allowed
 */
export function checkRateLimit(ipHash: string, maxPerHour: number = 5): boolean {
  if (!db) return false;

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Get current rate limit info
  const info = db.prepare(
    'SELECT last_submit, submit_count FROM rate_limits WHERE ip_hash = ?'
  ).get(ipHash) as { last_submit: number; submit_count: number } | undefined;

  if (!info) {
    // First submission from this IP
    db.prepare(
      'INSERT INTO rate_limits (ip_hash, last_submit, submit_count) VALUES (?, ?, 1)'
    ).run(ipHash, now);
    return true;
  }

  if (info.last_submit < oneHourAgo) {
    // Reset counter if last submission was over an hour ago
    db.prepare(
      'UPDATE rate_limits SET last_submit = ?, submit_count = 1 WHERE ip_hash = ?'
    ).run(now, ipHash);
    return true;
  }

  if (info.submit_count >= maxPerHour) {
    // Rate limit exceeded
    return false;
  }

  // Increment counter
  db.prepare(
    'UPDATE rate_limits SET last_submit = ?, submit_count = submit_count + 1 WHERE ip_hash = ?'
  ).run(now, ipHash);
  return true;
}

/**
 * Get all submitted levels
 */
export function getAllLevels(): SubmittedLevel[] {
  if (!db) return [];

  const rows = db.prepare(
    'SELECT * FROM levels ORDER BY submitted_at DESC'
  ).all() as StoredLevel[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    rows: row.rows,
    cols: row.cols,
    grid: JSON.parse(row.grid),
    availableGems: JSON.parse(row.available_gems),
    objectives: JSON.parse(row.objectives),
    maxMoves: row.max_moves,
    starThresholds: JSON.parse(row.star_thresholds),
    submittedAt: row.submitted_at,
    playCount: row.play_count,
    likeCount: row.like_count,
  }));
}

/**
 * Get a single level by ID
 */
export function getLevelById(id: string): SubmittedLevel | null {
  if (!db) return null;

  const row = db.prepare('SELECT * FROM levels WHERE id = ?').get(id) as StoredLevel | undefined;
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    rows: row.rows,
    cols: row.cols,
    grid: JSON.parse(row.grid),
    availableGems: JSON.parse(row.available_gems),
    objectives: JSON.parse(row.objectives),
    maxMoves: row.max_moves,
    starThresholds: JSON.parse(row.star_thresholds),
    submittedAt: row.submitted_at,
    playCount: row.play_count,
    likeCount: row.like_count,
  };
}

/**
 * Insert a new level
 */
export function insertLevel(level: Omit<SubmittedLevel, 'playCount' | 'likeCount'>, ipHash: string | null): SubmittedLevel {
  if (!db) throw new Error('Database not initialized');

  db.prepare(`
    INSERT INTO levels (
      id, name, description, rows, cols, grid, available_gems,
      objectives, max_moves, star_thresholds, submitted_at, ip_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    level.id,
    level.name,
    level.description,
    level.rows,
    level.cols,
    JSON.stringify(level.grid),
    JSON.stringify(level.availableGems),
    JSON.stringify(level.objectives),
    level.maxMoves,
    JSON.stringify(level.starThresholds),
    level.submittedAt,
    ipHash
  );

  return { ...level, playCount: 0, likeCount: 0 };
}

/**
 * Delete a level by ID
 */
export function deleteLevel(id: string): boolean {
  if (!db) return false;

  const result = db.prepare('DELETE FROM levels WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Increment play count for a level
 */
export function incrementPlayCount(id: string): void {
  if (!db) return;
  db.prepare('UPDATE levels SET play_count = play_count + 1 WHERE id = ?').run(id);
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
