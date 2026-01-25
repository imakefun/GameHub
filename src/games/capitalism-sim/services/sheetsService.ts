// Late Stage Capitalism Simulator - Google Sheets Service

import { SHEETS_CONFIG, isSheetsConfigured } from '../config/sheets';
import type { TargetCompany, Strategy, GameEvent, GameSettings, CompanyMetrics } from '../types';

interface SheetRow {
  [key: string]: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheEntry<unknown>> = {};

async function fetchSheet(sheetName: string): Promise<SheetRow[]> {
  const cacheKey = `${SHEETS_CONFIG.spreadsheetId}-${sheetName}`;
  const cached = cache[cacheKey];

  if (cached && Date.now() - cached.timestamp < SHEETS_CONFIG.cacheDuration) {
    return cached.data as SheetRow[];
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_CONFIG.spreadsheetId}/values/${sheetName}?key=${SHEETS_CONFIG.apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet ${sheetName}: ${response.statusText}`);
  }

  const data = await response.json();
  const rows = data.values as string[][];

  if (!rows || rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const result = rows.slice(1).map((row) => {
    const obj: SheetRow = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });

  cache[cacheKey] = { data: result, timestamp: Date.now() };
  return result;
}

function parseNumber(value: string, defaultValue = 0): number {
  const parsed = parseFloat(value.replace(/[,$]/g, ''));
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseStringArray(value: string): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function fetchCompanies(): Promise<TargetCompany[]> {
  const rows = await fetchSheet(SHEETS_CONFIG.sheets.companies);

  return rows.map((row) => ({
    id: row.id || row.name?.toLowerCase().replace(/\s+/g, '-') || '',
    name: row.name || '',
    description: row.description || '',
    industry: row.industry || '',
    parody: row.parody || '',
    icon: row.icon || '🏢',
    basePrice: parseNumber(row.basePrice),
    metrics: {
      revenue: parseNumber(row.revenue),
      profit: parseNumber(row.profit),
      debt: parseNumber(row.debt),
      employees: parseNumber(row.employees),
      morale: parseNumber(row.morale, 50),
      brandValue: parseNumber(row.brandValue, 50),
      customerSatisfaction: parseNumber(row.customerSatisfaction, 50),
      assetValue: parseNumber(row.assetValue),
    } as CompanyMetrics,
    specialAssets: parseStringArray(row.specialAssets),
    vulnerabilities: parseStringArray(row.vulnerabilities),
  }));
}

export async function fetchStrategies(): Promise<Strategy[]> {
  const rows = await fetchSheet(SHEETS_CONFIG.sheets.strategies);

  return rows.map((row) => ({
    id: row.id || '',
    name: row.name || '',
    description: row.description || '',
    icon: row.icon || '📋',
    category: (row.category as Strategy['category']) || 'operational',
    effects: [], // Effects would need a more complex parsing
    requirements: [],
    cooldownMonths: parseNumber(row.cooldownMonths),
    reputationCost: parseNumber(row.reputationCost),
  }));
}

export async function fetchEvents(): Promise<GameEvent[]> {
  const rows = await fetchSheet(SHEETS_CONFIG.sheets.events);

  return rows.map((row) => ({
    id: row.id || '',
    title: row.title || '',
    description: row.description || '',
    icon: row.icon || '📰',
    probability: parseNumber(row.probability, 0.05),
    category: (row.category as GameEvent['category']) || 'market',
    effects: [],
    choices: [],
  }));
}

export async function fetchSettings(): Promise<Partial<GameSettings>> {
  const rows = await fetchSheet(SHEETS_CONFIG.sheets.settings);

  const settings: Partial<GameSettings> = {};

  rows.forEach((row) => {
    const key = row.key as keyof GameSettings;
    const value = row.value;

    if (key && value) {
      (settings as Record<string, number>)[key] = parseNumber(value);
    }
  });

  return settings;
}

export interface GameData {
  companies: TargetCompany[];
  strategies: Strategy[];
  events: GameEvent[];
  settings: GameSettings;
}

export async function fetchAllGameData(fallbackData: GameData): Promise<GameData> {
  if (!isSheetsConfigured()) {
    return fallbackData;
  }

  try {
    const [companies, strategies, events, settingsPartial] = await Promise.all([
      fetchCompanies().catch(() => fallbackData.companies),
      fetchStrategies().catch(() => fallbackData.strategies),
      fetchEvents().catch(() => fallbackData.events),
      fetchSettings().catch(() => ({})),
    ]);

    return {
      companies: companies.length > 0 ? companies : fallbackData.companies,
      strategies: strategies.length > 0 ? strategies : fallbackData.strategies,
      events: events.length > 0 ? events : fallbackData.events,
      settings: { ...fallbackData.settings, ...settingsPartial },
    };
  } catch (error) {
    console.error('Failed to fetch game data from sheets:', error);
    return fallbackData;
  }
}

export function clearCache(): void {
  Object.keys(cache).forEach((key) => delete cache[key]);
}
