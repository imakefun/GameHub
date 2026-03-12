// ============================================================
// Tower Defense – SVG Sprite System
// Inline SVG sprites inspired by open game art pixel/vector styles
// ============================================================

// --- Tower Sprites ---

export const TOWER_SPRITES: Record<string, string> = {
  archer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="4" width="8" height="24" rx="2" fill="#5b3a1a"/>
    <rect x="10" y="2" width="12" height="4" rx="1" fill="#7c4f2a"/>
    <rect x="14" y="6" width="4" height="16" fill="#8b6914"/>
    <path d="M6 8 L14 16 L6 24" stroke="#8b6914" stroke-width="2" fill="none"/>
    <line x1="16" y1="6" x2="16" y2="2" stroke="#d4d4d4" stroke-width="1.5"/>
    <polygon points="16,0 14,3 18,3" fill="#ef4444"/>
    <rect x="10" y="26" width="12" height="4" rx="1" fill="#6b4226"/>
    <rect x="8" y="28" width="16" height="2" rx="1" fill="#8b5e3c"/>
  </svg>`,

  mage: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="11" y="8" width="10" height="20" rx="3" fill="#4c1d95"/>
    <path d="M11 10 Q16 4 21 10" fill="#6d28d9"/>
    <circle cx="16" cy="5" r="3" fill="#a78bfa"/>
    <circle cx="16" cy="5" r="1.5" fill="#e9d5ff">
      <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <rect x="9" y="26" width="14" height="4" rx="2" fill="#3b0764"/>
    <rect x="7" y="28" width="18" height="2" rx="1" fill="#581c87"/>
    <circle cx="16" cy="18" r="2" fill="#c084fc" opacity="0.6"/>
  </svg>`,

  cannon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="18" width="16" height="10" rx="2" fill="#44403c"/>
    <rect x="6" y="26" width="20" height="4" rx="2" fill="#57534e"/>
    <circle cx="16" cy="16" r="8" fill="#78716c"/>
    <circle cx="16" cy="16" r="6" fill="#57534e"/>
    <rect x="14" y="4" width="4" height="14" rx="1" fill="#44403c"/>
    <ellipse cx="16" cy="4" rx="3" ry="2" fill="#292524"/>
    <circle cx="16" cy="16" r="2" fill="#a8a29e"/>
  </svg>`,

  frost: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="13" y="6" width="6" height="22" rx="2" fill="#0ea5e9"/>
    <rect x="11" y="4" width="10" height="4" rx="2" fill="#38bdf8"/>
    <polygon points="16,0 13,4 19,4" fill="#7dd3fc"/>
    <line x1="16" y1="8" x2="16" y2="24" stroke="#bae6fd" stroke-width="2" opacity="0.5"/>
    <line x1="8" y1="12" x2="24" y2="12" stroke="#7dd3fc" stroke-width="1" opacity="0.6"/>
    <line x1="8" y1="20" x2="24" y2="20" stroke="#7dd3fc" stroke-width="1" opacity="0.6"/>
    <circle cx="16" cy="4" r="2" fill="#e0f2fe">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <rect x="9" y="26" width="14" height="4" rx="2" fill="#0284c7"/>
  </svg>`,

  poison: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12 L12 26 Q12 30 16 30 Q20 30 20 26 L20 12 Q20 8 16 6 Q12 8 12 12Z" fill="#15803d"/>
    <ellipse cx="16" cy="12" rx="4" ry="3" fill="#22c55e"/>
    <circle cx="14" cy="20" r="2" fill="#4ade80" opacity="0.7">
      <animate attributeName="cy" values="20;18;20" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="18" cy="24" r="1.5" fill="#86efac" opacity="0.5">
      <animate attributeName="cy" values="24;22;24" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <ellipse cx="16" cy="6" rx="2" ry="1" fill="#16a34a"/>
    <rect x="10" y="28" width="12" height="2" rx="1" fill="#14532d"/>
  </svg>`,

  lightning: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="13" y="10" width="6" height="18" rx="1" fill="#854d0e"/>
    <polygon points="16,0 12,12 15,12 11,24 20,10 16,10" fill="#facc15"/>
    <polygon points="16,0 12,12 15,12 11,24 20,10 16,10" fill="#fef08a" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.3s" repeatCount="indefinite"/>
    </polygon>
    <circle cx="16" cy="6" r="3" fill="#fef9c3" opacity="0.4">
      <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite"/>
    </circle>
    <rect x="10" y="26" width="12" height="4" rx="2" fill="#713f12"/>
  </svg>`,

  sniper: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="4" width="8" height="24" rx="2" fill="#44403c"/>
    <rect x="10" y="2" width="12" height="6" rx="2" fill="#57534e"/>
    <circle cx="16" cy="5" r="3" fill="#78716c"/>
    <circle cx="16" cy="5" r="1.5" fill="#dc2626"/>
    <line x1="16" y1="2" x2="16" y2="8" stroke="#dc2626" stroke-width="0.5" opacity="0.6"/>
    <line x1="13" y1="5" x2="19" y2="5" stroke="#dc2626" stroke-width="0.5" opacity="0.6"/>
    <rect x="14" y="8" width="4" height="16" fill="#374151"/>
    <rect x="8" y="26" width="16" height="4" rx="2" fill="#374151"/>
    <rect x="6" y="28" width="20" height="2" rx="1" fill="#4b5563"/>
  </svg>`,

  buff: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="20" rx="10" ry="6" fill="#92400e"/>
    <ellipse cx="16" cy="14" rx="10" ry="6" fill="#b45309"/>
    <ellipse cx="16" cy="14" rx="8" ry="4" fill="#d97706"/>
    <line x1="8" y1="8" x2="8" y2="12" stroke="#78350f" stroke-width="1.5"/>
    <line x1="24" y1="8" x2="24" y2="12" stroke="#78350f" stroke-width="1.5"/>
    <circle cx="8" cy="7" r="2" fill="#f59e0b"/>
    <circle cx="24" cy="7" r="2" fill="#f59e0b"/>
    <ellipse cx="16" cy="14" rx="3" ry="1.5" fill="#fbbf24" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.8s" repeatCount="indefinite"/>
    </ellipse>
  </svg>`,

  bomb: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="18" r="10" fill="#1c1917"/>
    <circle cx="16" cy="18" r="8" fill="#292524"/>
    <ellipse cx="16" cy="13" rx="5" ry="2" fill="#44403c" opacity="0.5"/>
    <rect x="14" y="4" width="4" height="6" rx="1" fill="#78716c"/>
    <path d="M18 4 Q22 0 24 2" stroke="#f97316" stroke-width="1.5" fill="none">
      <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>
    </path>
    <circle cx="24" cy="2" r="2" fill="#fbbf24">
      <animate attributeName="r" values="2;3;2" dur="0.5s" repeatCount="indefinite"/>
    </circle>
  </svg>`,

  nature: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="16" width="4" height="12" rx="1" fill="#713f12"/>
    <ellipse cx="16" cy="14" rx="10" ry="10" fill="#15803d"/>
    <ellipse cx="12" cy="12" rx="5" ry="5" fill="#16a34a"/>
    <ellipse cx="20" cy="12" rx="5" ry="5" fill="#22c55e"/>
    <ellipse cx="16" cy="8" rx="4" ry="4" fill="#4ade80"/>
    <circle cx="10" cy="14" r="1" fill="#fbbf24"/>
    <circle cx="20" cy="10" r="1" fill="#fbbf24"/>
    <circle cx="16" cy="16" r="1" fill="#fbbf24"/>
    <rect x="10" y="28" width="12" height="2" rx="1" fill="#422006"/>
  </svg>`,
};

// --- Enemy Sprites ---

export const ENEMY_SPRITES: Record<string, string> = {
  slime: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="24" rx="12" ry="6" fill="#15803d" opacity="0.3"/>
    <path d="M6 24 Q6 10 16 8 Q26 10 26 24 Q22 28 16 28 Q10 28 6 24Z" fill="#4ade80"/>
    <path d="M8 22 Q8 12 16 10 Q24 12 24 22" fill="#22c55e"/>
    <circle cx="12" cy="18" r="2" fill="white"/>
    <circle cx="20" cy="18" r="2" fill="white"/>
    <circle cx="12" cy="18" r="1" fill="#1e293b"/>
    <circle cx="20" cy="18" r="1" fill="#1e293b"/>
  </svg>`,

  goblin: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="14" r="10" fill="#22c55e"/>
    <circle cx="16" cy="14" r="8" fill="#16a34a"/>
    <circle cx="12" cy="12" r="2.5" fill="#fef9c3"/>
    <circle cx="20" cy="12" r="2.5" fill="#fef9c3"/>
    <circle cx="12" cy="12" r="1.5" fill="#dc2626"/>
    <circle cx="20" cy="12" r="1.5" fill="#dc2626"/>
    <polygon points="6,10 4,2 10,8" fill="#16a34a"/>
    <polygon points="26,10 28,2 22,8" fill="#16a34a"/>
    <path d="M12 18 Q16 22 20 18" stroke="#1e293b" stroke-width="1.5" fill="none"/>
    <rect x="12" y="24" width="8" height="6" rx="2" fill="#15803d"/>
  </svg>`,

  skeleton: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="12" r="8" fill="#f1f5f9"/>
    <circle cx="12" cy="10" r="2.5" fill="#0f172a"/>
    <circle cx="20" cy="10" r="2.5" fill="#0f172a"/>
    <circle cx="12" cy="10" r="1" fill="#dc2626"/>
    <circle cx="20" cy="10" r="1" fill="#dc2626"/>
    <rect x="12" y="16" width="2" height="1" fill="#0f172a"/>
    <rect x="15" y="16" width="2" height="1" fill="#0f172a"/>
    <rect x="18" y="16" width="2" height="1" fill="#0f172a"/>
    <rect x="13" y="20" width="6" height="8" fill="#e2e8f0"/>
    <rect x="11" y="20" width="2" height="6" fill="#e2e8f0"/>
    <rect x="19" y="20" width="2" height="6" fill="#e2e8f0"/>
  </svg>`,

  bat: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14 Q6 8 12 12 L16 10 L20 12 Q26 8 30 14 Q26 18 20 14 L16 16 L12 14 Q6 18 2 14Z" fill="#6d28d9">
      <animate attributeName="d" values="M2 14 Q6 8 12 12 L16 10 L20 12 Q26 8 30 14 Q26 18 20 14 L16 16 L12 14 Q6 18 2 14Z;M4 16 Q8 12 12 14 L16 12 L20 14 Q24 12 28 16 Q24 18 20 16 L16 18 L12 16 Q8 18 4 16Z;M2 14 Q6 8 12 12 L16 10 L20 12 Q26 8 30 14 Q26 18 20 14 L16 16 L12 14 Q6 18 2 14Z" dur="0.4s" repeatCount="indefinite"/>
    </path>
    <circle cx="13" cy="12" r="1.5" fill="#fbbf24"/>
    <circle cx="19" cy="12" r="1.5" fill="#fbbf24"/>
    <ellipse cx="16" cy="14" rx="3" ry="4" fill="#7c3aed"/>
  </svg>`,

  orc: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="14" r="10" fill="#4d7c0f"/>
    <circle cx="16" cy="14" r="8" fill="#65a30d"/>
    <circle cx="11" cy="12" r="2" fill="#fef9c3"/>
    <circle cx="21" cy="12" r="2" fill="#fef9c3"/>
    <circle cx="11" cy="12" r="1" fill="#1e293b"/>
    <circle cx="21" cy="12" r="1" fill="#1e293b"/>
    <rect x="10" y="18" width="3" height="4" rx="1" fill="#f1f5f9"/>
    <rect x="19" y="18" width="3" height="4" rx="1" fill="#f1f5f9"/>
    <rect x="12" y="24" width="8" height="6" rx="2" fill="#3f6212"/>
    <rect x="8" y="22" width="6" height="4" rx="1" fill="#4d7c0f"/>
    <rect x="18" y="22" width="6" height="4" rx="1" fill="#4d7c0f"/>
  </svg>`,

  ghost: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 28 L8 14 Q8 4 16 4 Q24 4 24 14 L24 28 L21 24 L18 28 L16 24 L14 28 L11 24 Z" fill="#e9d5ff" opacity="0.7">
      <animate attributeName="opacity" values="0.7;0.4;0.7" dur="2s" repeatCount="indefinite"/>
    </path>
    <circle cx="12" cy="14" r="2.5" fill="#0f172a"/>
    <circle cx="20" cy="14" r="2.5" fill="#0f172a"/>
    <circle cx="12" cy="14" r="1" fill="#c084fc"/>
    <circle cx="20" cy="14" r="1" fill="#c084fc"/>
    <ellipse cx="16" cy="20" rx="2" ry="1.5" fill="#0f172a" opacity="0.5"/>
  </svg>`,

  spider: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="6" ry="5" fill="#1e293b"/>
    <circle cx="16" cy="11" r="4" fill="#334155"/>
    <circle cx="14" cy="10" r="1.5" fill="#dc2626"/>
    <circle cx="18" cy="10" r="1.5" fill="#dc2626"/>
    <line x1="10" y1="14" x2="2" y2="8" stroke="#475569" stroke-width="1.5"/>
    <line x1="10" y1="16" x2="2" y2="18" stroke="#475569" stroke-width="1.5"/>
    <line x1="10" y1="18" x2="4" y2="26" stroke="#475569" stroke-width="1.5"/>
    <line x1="22" y1="14" x2="30" y2="8" stroke="#475569" stroke-width="1.5"/>
    <line x1="22" y1="16" x2="30" y2="18" stroke="#475569" stroke-width="1.5"/>
    <line x1="22" y1="18" x2="28" y2="26" stroke="#475569" stroke-width="1.5"/>
  </svg>`,

  golem: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="16" height="14" rx="3" fill="#78716c"/>
    <rect x="6" y="18" width="20" height="10" rx="2" fill="#57534e"/>
    <rect x="4" y="12" width="6" height="10" rx="2" fill="#78716c"/>
    <rect x="22" y="12" width="6" height="10" rx="2" fill="#78716c"/>
    <circle cx="12" cy="12" r="2" fill="#fbbf24"/>
    <circle cx="20" cy="12" r="2" fill="#fbbf24"/>
    <rect x="12" y="16" width="8" height="2" rx="1" fill="#44403c"/>
    <line x1="10" y1="8" x2="22" y2="8" stroke="#a8a29e" stroke-width="0.5"/>
    <line x1="10" y1="22" x2="22" y2="22" stroke="#a8a29e" stroke-width="0.5"/>
  </svg>`,

  dragon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20 Q4 10 12 8 L16 6 L20 8 Q28 10 28 20 Q24 24 16 24 Q8 24 4 20Z" fill="#dc2626"/>
    <path d="M8 18 Q8 12 16 10 Q24 12 24 18" fill="#ef4444"/>
    <polygon points="6,8 2,2 10,6" fill="#dc2626"/>
    <polygon points="26,8 30,2 22,6" fill="#dc2626"/>
    <circle cx="12" cy="14" r="2" fill="#fbbf24"/>
    <circle cx="20" cy="14" r="2" fill="#fbbf24"/>
    <circle cx="12" cy="14" r="1" fill="#0f172a"/>
    <circle cx="20" cy="14" r="1" fill="#0f172a"/>
    <path d="M2 22 Q4 16 8 20" fill="#b91c1c"/>
    <path d="M30 22 Q28 16 24 20" fill="#b91c1c"/>
    <rect x="10" y="24" width="12" height="6" rx="2" fill="#991b1b"/>
  </svg>`,

  demon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" fill="#991b1b"/>
    <circle cx="16" cy="16" r="10" fill="#b91c1c"/>
    <polygon points="8,8 6,0 12,6" fill="#7f1d1d"/>
    <polygon points="24,8 26,0 20,6" fill="#7f1d1d"/>
    <circle cx="12" cy="14" r="2.5" fill="#fbbf24"/>
    <circle cx="20" cy="14" r="2.5" fill="#fbbf24"/>
    <circle cx="12" cy="14" r="1.5" fill="#0f172a"/>
    <circle cx="20" cy="14" r="1.5" fill="#0f172a"/>
    <path d="M10 22 Q16 26 22 22" stroke="#7f1d1d" stroke-width="2" fill="none"/>
    <circle cx="16" cy="16" r="12" fill="none" stroke="#ef4444" stroke-width="0.5" opacity="0.3">
      <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>`,

  wolf: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="18" rx="10" ry="8" fill="#475569"/>
    <circle cx="16" cy="10" r="6" fill="#64748b"/>
    <polygon points="10,6 8,0 13,5" fill="#64748b"/>
    <polygon points="22,6 24,0 19,5" fill="#64748b"/>
    <circle cx="13" cy="9" r="1.5" fill="#fbbf24"/>
    <circle cx="19" cy="9" r="1.5" fill="#fbbf24"/>
    <ellipse cx="16" cy="13" rx="2" ry="1" fill="#1e293b"/>
    <rect x="8" y="24" width="4" height="6" rx="1" fill="#334155"/>
    <rect x="20" y="24" width="4" height="6" rx="1" fill="#334155"/>
  </svg>`,

  mushroom: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="13" y="18" width="6" height="10" rx="1" fill="#fef9c3"/>
    <ellipse cx="16" cy="16" rx="12" ry="8" fill="#dc2626"/>
    <circle cx="10" cy="14" r="2" fill="#fef9c3" opacity="0.6"/>
    <circle cx="20" cy="12" r="2.5" fill="#fef9c3" opacity="0.6"/>
    <circle cx="16" cy="10" r="1.5" fill="#fef9c3" opacity="0.6"/>
    <circle cx="13" cy="20" r="1" fill="#0f172a"/>
    <circle cx="19" cy="20" r="1" fill="#0f172a"/>
    <rect x="10" y="28" width="12" height="2" rx="1" fill="#422006"/>
  </svg>`,

  troll: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="16" height="16" rx="3" fill="#65a30d"/>
    <circle cx="16" cy="10" r="8" fill="#84cc16"/>
    <circle cx="12" cy="9" r="2" fill="#fef9c3"/>
    <circle cx="20" cy="9" r="2" fill="#fef9c3"/>
    <circle cx="12" cy="9" r="1" fill="#1e293b"/>
    <circle cx="20" cy="9" r="1" fill="#1e293b"/>
    <ellipse cx="16" cy="15" rx="4" ry="2" fill="#4d7c0f"/>
    <rect x="6" y="12" width="4" height="10" rx="2" fill="#65a30d"/>
    <rect x="22" y="12" width="4" height="10" rx="2" fill="#65a30d"/>
    <rect x="10" y="24" width="5" height="6" rx="1" fill="#4d7c0f"/>
    <rect x="17" y="24" width="5" height="6" rx="1" fill="#4d7c0f"/>
  </svg>`,

  wraith: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 28 L8 12 Q8 4 16 4 Q24 4 24 12 L24 28 L21 24 L18 28 L16 24 L14 28 L11 24 Z" fill="#8b5cf6" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.5s" repeatCount="indefinite"/>
    </path>
    <circle cx="12" cy="12" r="3" fill="#a855f7"/>
    <circle cx="20" cy="12" r="3" fill="#a855f7"/>
    <circle cx="12" cy="12" r="1.5" fill="#e9d5ff"/>
    <circle cx="20" cy="12" r="1.5" fill="#e9d5ff"/>
    <ellipse cx="16" cy="18" rx="3" ry="2" fill="#6d28d9" opacity="0.5"/>
  </svg>`,

  knight: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="4" width="12" height="14" rx="2" fill="#64748b"/>
    <rect x="12" y="6" width="8" height="4" rx="1" fill="#475569"/>
    <line x1="14" y1="8" x2="18" y2="8" stroke="#94a3b8" stroke-width="1"/>
    <rect x="8" y="16" width="16" height="12" rx="2" fill="#475569"/>
    <rect x="4" y="14" width="8" height="4" rx="2" fill="#64748b"/>
    <rect x="2" y="12" width="6" height="12" rx="1" fill="#94a3b8"/>
    <circle cx="5" cy="18" r="4" fill="#64748b"/>
    <rect x="3" y="16" width="4" height="4" fill="#94a3b8"/>
    <rect x="10" y="26" width="5" height="4" rx="1" fill="#334155"/>
    <rect x="17" y="26" width="5" height="4" rx="1" fill="#334155"/>
  </svg>`,
};

// --- Terrain Tile Sprites ---

export const TERRAIN_SPRITES: Record<string, Record<string, string>> = {
  forest: {
    path: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#5b3a1a"/>
      <circle cx="6" cy="8" r="2" fill="#4a3218" opacity="0.5"/>
      <circle cx="24" cy="20" r="3" fill="#4a3218" opacity="0.4"/>
      <circle cx="14" cy="26" r="1.5" fill="#4a3218" opacity="0.3"/>
    </svg>`,
    buildable: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#2d5a27"/>
      <circle cx="8" cy="8" r="1" fill="#22c55e" opacity="0.3"/>
      <circle cx="24" cy="12" r="1" fill="#22c55e" opacity="0.2"/>
      <circle cx="16" cy="24" r="1.5" fill="#16a34a" opacity="0.2"/>
    </svg>`,
    blocked: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#1a3a15"/>
      <ellipse cx="16" cy="20" rx="8" ry="6" fill="#15803d" opacity="0.3"/>
      <ellipse cx="16" cy="12" rx="10" ry="8" fill="#166534" opacity="0.4"/>
    </svg>`,
  },
  desert: {
    path: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#92702a"/>
      <path d="M0 28 Q8 24 16 28 Q24 32 32 28" stroke="#a0823a" stroke-width="1" fill="none" opacity="0.3"/>
    </svg>`,
    buildable: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#6b5a3a"/>
      <circle cx="20" cy="10" r="1" fill="#d4a855" opacity="0.2"/>
    </svg>`,
    blocked: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#4a3a20"/>
      <rect x="10" y="8" width="12" height="16" rx="2" fill="#5a4a30" opacity="0.4"/>
    </svg>`,
  },
  ice: {
    path: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#6b8ba0"/>
      <line x1="4" y1="4" x2="28" y2="28" stroke="#7dd3fc" stroke-width="0.5" opacity="0.2"/>
      <line x1="28" y1="4" x2="4" y2="28" stroke="#7dd3fc" stroke-width="0.5" opacity="0.2"/>
    </svg>`,
    buildable: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#3a5a6a"/>
      <rect x="8" y="8" width="16" height="16" fill="#4a6a7a" opacity="0.15"/>
    </svg>`,
    blocked: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#2a3a4a"/>
      <polygon points="16,4 8,16 16,28 24,16" fill="#3a5a6a" opacity="0.3"/>
    </svg>`,
  },
  volcano: {
    path: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#5a3030"/>
      <circle cx="8" cy="24" r="2" fill="#ef4444" opacity="0.15"/>
      <circle cx="24" cy="8" r="1.5" fill="#f97316" opacity="0.1"/>
    </svg>`,
    buildable: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#4a2020"/>
    </svg>`,
    blocked: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#3a1515"/>
      <circle cx="16" cy="16" r="6" fill="#ef4444" opacity="0.08"/>
    </svg>`,
  },
  shadow: {
    path: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#4a3a5a"/>
      <circle cx="16" cy="16" r="8" fill="#6d28d9" opacity="0.08"/>
    </svg>`,
    buildable: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#2a2035"/>
    </svg>`,
    blocked: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#1a1525"/>
      <circle cx="16" cy="16" r="4" fill="#8b5cf6" opacity="0.06"/>
    </svg>`,
  },
  crystal: {
    path: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#3a5a5a"/>
      <polygon points="16,8 12,16 16,24 20,16" fill="#06b6d4" opacity="0.1"/>
    </svg>`,
    buildable: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#2a4a4a"/>
    </svg>`,
    blocked: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#1a3535"/>
      <polygon points="16,6 10,18 22,18" fill="#22d3ee" opacity="0.08"/>
    </svg>`,
  },
};

// --- UI Icons ---

export const UI_ICONS = {
  gold: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#fbbf24"/>
    <circle cx="12" cy="12" r="8" fill="#f59e0b"/>
    <text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#92400e">$</text>
  </svg>`,
  heart: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21 C6 16 2 12 2 8 C2 4 5 2 8 2 C10 2 11.5 3 12 4.5 C12.5 3 14 2 16 2 C19 2 22 4 22 8 C22 12 18 16 12 21Z" fill="#ef4444"/>
    <path d="M12 18 C8 14 5 11 5 8 C5 6 7 4 8 4 C10 4 11 5 12 7" fill="#f87171" opacity="0.5"/>
  </svg>`,
  wave: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12 Q6 6 10 12 Q14 18 18 12 Q20 9 22 12" stroke="#60a5fa" stroke-width="2.5" fill="none"/>
    <path d="M2 16 Q6 10 10 16 Q14 22 18 16 Q20 13 22 16" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.5"/>
  </svg>`,
  star: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="#fbbf24"/>
    <polygon points="12,4 14,9 12,8 10,9" fill="#fef3c7" opacity="0.5"/>
  </svg>`,
  starEmpty: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="#374151" opacity="0.5"/>
  </svg>`,
  gem: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 20,8 16,22 8,22 4,8" fill="#8b5cf6"/>
    <polygon points="12,2 16,8 12,22 8,8" fill="#a78bfa"/>
    <polygon points="12,2 14,8 12,6 10,8" fill="#e9d5ff" opacity="0.5"/>
    <line x1="4" y1="8" x2="20" y2="8" stroke="#7c3aed" stroke-width="0.5"/>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M12 2 L13 6 M12 22 L11 18 M2 12 L6 11 M22 12 L18 13 M4.93 4.93 L7.76 7.76 M19.07 19.07 L16.24 16.24 M4.93 19.07 L7.76 16.24 M19.07 4.93 L16.24 7.76" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  pause: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
  </svg>`,
  play: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="6,4 20,12 6,20" fill="currentColor"/>
  </svg>`,
  fastForward: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="3,4 13,12 3,20" fill="currentColor"/>
    <polygon points="13,4 23,12 13,20" fill="currentColor"/>
  </svg>`,
  crown: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="2,18 4,8 8,14 12,4 16,14 20,8 22,18" fill="#fbbf24"/>
    <rect x="2" y="18" width="20" height="3" rx="1" fill="#f59e0b"/>
    <circle cx="6" cy="18" r="1.5" fill="#dc2626"/>
    <circle cx="12" cy="18" r="1.5" fill="#22c55e"/>
    <circle cx="18" cy="18" r="1.5" fill="#3b82f6"/>
  </svg>`,
};

// --- Helper to create inline SVG data URLs ---

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

// --- Sprite component helper ---

export function getSpriteUrl(type: 'tower' | 'enemy' | 'ui', id: string): string {
  let svg: string | undefined;
  if (type === 'tower') svg = TOWER_SPRITES[id];
  else if (type === 'enemy') svg = ENEMY_SPRITES[id];
  else if (type === 'ui') svg = UI_ICONS[id as keyof typeof UI_ICONS];
  return svg ? svgToDataUrl(svg) : '';
}

export function getTerrainUrl(theme: string, cellType: string): string {
  const themeSprites = TERRAIN_SPRITES[theme];
  if (!themeSprites) return '';
  const svg = themeSprites[cellType] || themeSprites.buildable;
  return svg ? svgToDataUrl(svg) : '';
}
