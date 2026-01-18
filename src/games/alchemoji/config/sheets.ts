// Google Sheets Configuration
// Set these values to connect to your Google Sheet

export const SHEETS_CONFIG = {
  // Your Google Sheets API key
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',

  // The ID of your Google Sheet (from the URL)
  // Example: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  spreadsheetId: import.meta.env.VITE_ALCHEMOJI_SHEET_ID || '',

  // Sheet names (tabs) for each data type
  sheets: {
    elements: 'Elements',
    recipes: 'Recipes',
    generators: 'Generators',
    settings: 'Settings',
  },

  // Cache duration in milliseconds (5 minutes)
  cacheDuration: 5 * 60 * 1000,

  // Whether to use sheets (false = use local data as fallback)
  enabled: true,
};

// Check if sheets are properly configured
export const isSheetsConfigured = (): boolean => {
  return !!(SHEETS_CONFIG.apiKey && SHEETS_CONFIG.spreadsheetId);
};
