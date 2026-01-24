// Google Sheets Configuration for Farm Valley
// Set these values to connect to your Google Sheet

export const SHEETS_CONFIG = {
  // Your Google Sheets API key
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',

  // The ID of your Google Sheet (from the URL)
  // Example: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  spreadsheetId: import.meta.env.VITE_FARMINGSIM_SHEET_ID || '',

  // Sheet names (tabs) for each data type
  sheets: {
    crops: 'Crops',
    animals: 'Animals',
    trees: 'Trees',
    machines: 'Machines',
    recipes: 'Recipes',
    products: 'Products',
    levels: 'Levels',
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
