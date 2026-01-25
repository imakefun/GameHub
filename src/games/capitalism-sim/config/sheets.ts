// Late Stage Capitalism Simulator - Google Sheets Configuration

export const SHEETS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',
  spreadsheetId: import.meta.env.VITE_CAPITALISM_SIM_SHEET_ID || '',
  sheets: {
    companies: 'Companies',
    strategies: 'Strategies',
    events: 'Events',
    settings: 'Settings',
  },
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  enabled: true,
};

export const isSheetsConfigured = (): boolean => {
  return !!(SHEETS_CONFIG.apiKey && SHEETS_CONFIG.spreadsheetId);
};
