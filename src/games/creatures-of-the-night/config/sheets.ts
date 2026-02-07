export const SHEETS_CONFIG = {
  apiUrl: import.meta.env.VITE_CREATURES_SHEETS_API || '',

  sheets: {
    cards: 'Cards',
    packs: 'Packs',
    expeditions: 'Expeditions',
    synergies: 'Synergies',
    settings: 'Settings',
  },

  cacheDuration: 5 * 60 * 1000, // 5 minutes
  enabled: true,
};

export const isSheetsConfigured = (): boolean => {
  return !!SHEETS_CONFIG.apiUrl;
};
