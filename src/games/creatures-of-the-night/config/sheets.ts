// SheetDB REST API configuration
// Set VITE_CREATURES_SHEETS_API to your SheetDB endpoint, e.g.:
//   https://sheetdb.io/api/v1/YOUR_API_ID
// Each sheet tab is fetched via ?sheet=SheetName query param

export const SHEETS_CONFIG = {
  apiUrl: import.meta.env.VITE_CREATURES_SHEETS_API || '',

  sheets: {
    cards: 'Cards',
    packs: 'Packs',
    expeditions: 'Expeditions',
    typeSynergies: 'TypeSynergies',
    crossTypeSynergies: 'CrossTypeSynergies',
    dailyQuests: 'DailyQuests',
    clRewards: 'CLRewards',
    featureUnlocks: 'FeatureUnlocks',
    clConfig: 'CLConfig',
    settings: 'Settings',
  },

  cacheDuration: 5 * 60 * 1000, // 5 minutes
  enabled: true,
};

export const isSheetsConfigured = (): boolean => {
  return !!SHEETS_CONFIG.apiUrl;
};
