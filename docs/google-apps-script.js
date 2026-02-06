/**
 * Google Apps Script for Gem Miner Community Levels
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this code
 * 4. Deploy → New deployment → Web app
 * 5. Set "Who has access" to "Anyone"
 * 6. Copy the web app URL and update SHEETS_API in submittedLevels.ts
 */

const SHEET_NAME = 'Levels';

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  // Set CORS headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (method === 'GET') {
      const levels = getAllLevels();
      return output.setContent(JSON.stringify(levels));
    }

    if (method === 'POST') {
      const data = JSON.parse(e.postData.contents);
      const result = addLevel(data);
      return output.setContent(JSON.stringify(result));
    }
  } catch (error) {
    return output.setContent(JSON.stringify({
      error: error.message || 'Unknown error'
    }));
  }
}

function getAllLevels() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only header row

  const levels = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows

    try {
      levels.push({
        id: row[0],
        name: row[1],
        description: row[2],
        rows: parseInt(row[3]) || 8,
        cols: parseInt(row[4]) || 8,
        grid: JSON.parse(row[5] || '[]'),
        availableGems: JSON.parse(row[6] || '[]'),
        objectives: JSON.parse(row[7] || '[]'),
        maxMoves: parseInt(row[8]) || 25,
        starThresholds: JSON.parse(row[9] || '[1000,2000,3500]'),
        submittedAt: parseInt(row[10]) || Date.now(),
      });
    } catch (e) {
      // Skip malformed rows
    }
  }

  // Return newest first
  return levels.reverse();
}

function addLevel(level) {
  // Basic validation
  if (!level.name || level.name.length < 1 || level.name.length > 50) {
    throw new Error('Invalid level name');
  }
  if (!level.grid || !Array.isArray(level.grid)) {
    throw new Error('Invalid grid');
  }
  if (!level.availableGems || level.availableGems.length < 3) {
    throw new Error('Need at least 3 gem types');
  }
  if (!level.objectives || level.objectives.length < 1) {
    throw new Error('Need at least 1 objective');
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Create sheet with headers if it doesn't exist
    const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    newSheet.appendRow(['id', 'name', 'description', 'rows', 'cols', 'grid',
                        'availableGems', 'objectives', 'maxMoves', 'starThresholds', 'submittedAt']);
  }

  const activeSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Generate ID
  const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const submittedAt = Date.now();

  // Sanitize strings
  const safeName = String(level.name).slice(0, 50).replace(/<[^>]*>/g, '');
  const safeDesc = String(level.description || '').slice(0, 200).replace(/<[^>]*>/g, '');

  // Add row
  activeSheet.appendRow([
    id,
    safeName,
    safeDesc,
    level.rows || 8,
    level.cols || 8,
    JSON.stringify(level.grid),
    JSON.stringify(level.availableGems),
    JSON.stringify(level.objectives),
    level.maxMoves || 25,
    JSON.stringify(level.starThresholds || [1000, 2000, 3500]),
    submittedAt
  ]);

  return {
    id,
    name: safeName,
    description: safeDesc,
    rows: level.rows,
    cols: level.cols,
    grid: level.grid,
    availableGems: level.availableGems,
    objectives: level.objectives,
    maxMoves: level.maxMoves,
    starThresholds: level.starThresholds,
    submittedAt,
  };
}
