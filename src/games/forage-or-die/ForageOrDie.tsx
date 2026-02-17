import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameState, PlayerStats, ForageOption, JournalEntry, Encounter } from './types';
import { encounters, ENCOUNTERS_PER_RUN, TOTAL_ENCOUNTERS } from './encounters';

// ─── Helpers ───────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getGenericLabel(emoji: string): string {
  const map: Record<string, string> = {
    '🍄': 'Unknown Mushroom',
    '🌿': 'Unknown Plant',
    '🌱': 'Unknown Plant',
    '🫐': 'Unknown Berries',
    '🐛': 'Unknown Creature',
    '🦎': 'Unknown Creature',
    '🦗': 'Unknown Creature',
    '🪲': 'Unknown Creature',
  };
  return map[emoji] || 'Unknown Species';
}

function scrambleText(text: string, intensity: number): string {
  return text
    .split('')
    .map((ch) => {
      if (/[a-zA-Z]/.test(ch) && Math.random() < intensity) {
        const offset = Math.floor(Math.random() * 5) - 2;
        return String.fromCharCode(ch.charCodeAt(0) + offset);
      }
      return ch;
    })
    .join('');
}

// ─── Styles (inline, dark naturalist theme) ────────────────

const FONT_FAMILY = "'EB Garamond', 'Georgia', serif";
const BG_DARK = '#0a0a06';
const BG_CARD = '#12120e';
const TEXT_CREAM = '#c8c0a8';
const TEXT_DIM = '#8a8470';
const RED_ACCENT = '#c0392b';
const GREEN_ACCENT = '#4a9e3f';

const containerStyle: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  background: `radial-gradient(ellipse at center, #1a1810 0%, ${BG_DARK} 70%)`,
  color: TEXT_CREAM,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  boxSizing: 'border-box',
  overflowY: 'auto',
};

const fadeInKeyframes = `
@keyframes forageFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes foragePulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
`;

// ─── Component ─────────────────────────────────────────────

export default function ForageOrDie() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [stats, setStats] = useState<PlayerStats>({ hunger: 50, health: 100, hydration: 60, clarity: 100 });
  const [day, setDay] = useState(1);
  const [runEncounters, setRunEncounters] = useState<Encounter[]>([]);
  const [displayOrder, setDisplayOrder] = useState<boolean[]>([]); // true = swap A/B positions
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [lastChoice, setLastChoice] = useState<ForageOption | null>(null);
  const [animKey, setAnimKey] = useState(0);

  // Google Fonts
  useEffect(() => {
    if (!document.querySelector('link[href*="EB+Garamond"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Inject keyframes
  useEffect(() => {
    const id = 'forage-or-die-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = fadeInKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(encounters);
    const selected = shuffled.slice(0, ENCOUNTERS_PER_RUN);
    const swaps = selected.map(() => Math.random() < 0.5);
    setRunEncounters(selected);
    setDisplayOrder(swaps);
    setStats({ hunger: 50, health: 100, hydration: 60, clarity: 100 });
    setDay(1);
    setJournal([]);
    setLastChoice(null);
    setGameState('playing');
    setAnimKey((k) => k + 1);
  }, []);

  const currentEncounter = runEncounters[day - 1] ?? null;

  // Get the two displayed options (possibly swapped)
  const displayedOptions = useMemo(() => {
    if (!currentEncounter) return [null, null] as const;
    const swap = displayOrder[day - 1];
    if (swap) return [currentEncounter.optionB, currentEncounter.optionA] as const;
    return [currentEncounter.optionA, currentEncounter.optionB] as const;
  }, [currentEncounter, displayOrder, day]);

  // Apply passive drain and make a choice
  const handleChoice = useCallback(
    (option: ForageOption) => {
      if (!currentEncounter) return;

      // Apply passive drain first
      const afterDrain: PlayerStats = {
        hunger: clamp(stats.hunger - 8, 0, 100),
        health: stats.health,
        hydration: clamp(stats.hydration - 5, 0, 100),
        clarity: stats.clarity,
      };

      // Apply item effects
      const newStats: PlayerStats = {
        hunger: clamp(afterDrain.hunger + option.effects.hunger, 0, 100),
        health: clamp(afterDrain.health + option.effects.health, 0, 100),
        hydration: clamp(afterDrain.hydration + option.effects.hydration, 0, 100),
        clarity: clamp(afterDrain.clarity + option.effects.clarity, 0, 100),
      };

      setStats(newStats);
      setLastChoice(option);
      setJournal((j) => [
        ...j,
        {
          day,
          biome: currentEncounter.biome,
          species: option.name,
          safe: option.safe,
          fact: option.fact,
          emoji: option.emoji,
        },
      ]);
      setGameState('outcome');
      setAnimKey((k) => k + 1);
    },
    [currentEncounter, stats, day]
  );

  const handleContinue = useCallback(() => {
    // Death checks
    const dead =
      stats.health <= 0 || (stats.hunger <= 0 && stats.health <= 20);

    if (dead) {
      setGameState('gameover');
      setAnimKey((k) => k + 1);
      return;
    }

    if (day >= ENCOUNTERS_PER_RUN) {
      setGameState('victory');
      setAnimKey((k) => k + 1);
      return;
    }

    setDay((d) => d + 1);
    setLastChoice(null);
    setGameState('playing');
    setAnimKey((k) => k + 1);
  }, [stats, day]);

  // Continue button text
  const continueText = useMemo(() => {
    if (stats.health <= 0) return 'Face Your Fate';
    if (stats.hunger <= 0 && stats.health <= 20) return 'Face Your Fate';
    if (day >= ENCOUNTERS_PER_RUN) return 'See If You Survived';
    return 'Next Day →';
  }, [stats, day]);

  // Clarity distortion CSS
  const clarityFilter = useMemo(() => {
    if (stats.clarity >= 40) return 'none';
    const hue = (100 - stats.clarity) * 2;
    const sat = 1.5 + (100 - stats.clarity) / 50;
    return `hue-rotate(${hue}deg) saturate(${sat})`;
  }, [stats.clarity]);

  const emojiBlur = useMemo(() => {
    if (stats.clarity >= 40) return 0;
    return (100 - stats.clarity) / 30;
  }, [stats.clarity]);

  const descBlur = useMemo(() => {
    return stats.clarity < 30 ? 0.5 : 0;
  }, [stats.clarity]);

  // ─── Render helpers ──────────────────────────────────────

  const renderStatBar = (
    icon: string,
    label: string,
    value: number,
    color: string
  ) => {
    const low = value < 25;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '140px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '12px', color: TEXT_DIM }}>{label}</span>
            <span
              style={{
                fontSize: '12px',
                color: low ? '#e74c3c' : TEXT_CREAM,
                fontWeight: low ? 700 : 400,
              }}
            >
              {value}%
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: '#1a1a14',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${value}%`,
                background: low ? '#e74c3c' : color,
                borderRadius: '3px',
                transition: 'width 0.8s ease, background 0.8s ease',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStatsPanel = () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '12px 16px',
        background: 'rgba(18,18,14,0.8)',
        borderRadius: '8px',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '700px',
        boxSizing: 'border-box',
      }}
    >
      {renderStatBar('🟡', 'Hunger', stats.hunger, '#d4a834')}
      {renderStatBar('🔴', 'Health', stats.health, '#c0392b')}
      {renderStatBar('🔵', 'Hydration', stats.hydration, '#3498db')}
      {renderStatBar('🟣', 'Clarity', stats.clarity, '#9b59b6')}
      {stats.clarity < 40 && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '12px',
            color: '#e74c3c',
            animation: 'foragePulse 2s infinite',
            marginTop: '4px',
          }}
        >
          ⚠ VISION DISTORTED
        </div>
      )}
    </div>
  );

  const renderChoiceCard = (option: ForageOption, side: 'left' | 'right') => {
    const label =
      stats.clarity < 25
        ? scrambleText(getGenericLabel(option.emoji), 0.3)
        : getGenericLabel(option.emoji);

    return (
      <button
        key={side}
        onClick={() => handleChoice(option)}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = `0 0 20px ${option.accentColor}40`;
          el.style.borderColor = option.accentColor;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
          el.style.borderColor = '#2a2a20';
        }}
        style={{
          background: BG_CARD,
          border: '1px solid #2a2a20',
          borderRadius: '10px',
          padding: '24px 20px',
          cursor: 'pointer',
          color: TEXT_CREAM,
          fontFamily: FONT_FAMILY,
          textAlign: 'left',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '0',
        }}
      >
        <div
          style={{
            fontSize: '40px',
            filter: emojiBlur > 0 ? `blur(${emojiBlur}px)` : 'none',
          }}
        >
          {option.emoji}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: TEXT_CREAM }}>
          {label}
        </div>
        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: TEXT_DIM,
            filter: descBlur > 0 ? `blur(${descBlur}px)` : 'none',
          }}
        >
          {option.description}
        </div>
      </button>
    );
  };

  const renderJournalEntry = (entry: JournalEntry) => (
    <div
      key={entry.day}
      style={{
        background: BG_CARD,
        borderRadius: '8px',
        padding: '16px 20px',
        borderLeft: `3px solid ${entry.safe ? GREEN_ACCENT : RED_ACCENT}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '14px', color: TEXT_DIM }}>
          Day {entry.day} · {entry.biome}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: entry.safe ? 'rgba(74,158,63,0.2)' : 'rgba(192,57,43,0.2)',
            color: entry.safe ? GREEN_ACCENT : RED_ACCENT,
          }}
        >
          {entry.safe ? 'SAFE' : 'TOXIC'}
        </span>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
        {entry.emoji} {entry.species}
      </div>
      <div style={{ fontSize: '13px', lineHeight: '1.6', color: TEXT_DIM, fontStyle: 'italic' }}>
        {entry.fact}
      </div>
    </div>
  );

  const buttonStyle = (bg: string): React.CSSProperties => ({
    background: bg,
    color: '#0a0a06',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 32px',
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  });

  // ─── Screens ─────────────────────────────────────────────

  const renderTitle = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '80vh',
        animation: 'forageFadeIn 0.6s ease',
        maxWidth: '500px',
      }}
    >
      <div style={{ fontSize: '14px', letterSpacing: '3px', color: TEXT_DIM, marginBottom: '12px', textTransform: 'uppercase' }}>
        A Survival Foraging Game
      </div>
      <h1 style={{ fontSize: '56px', margin: '0 0 4px 0', lineHeight: 1.1 }}>
        <span style={{ color: TEXT_CREAM }}>Forage</span>
      </h1>
      <div style={{ fontSize: '24px', color: TEXT_DIM, margin: '4px 0' }}>— or —</div>
      <h1 style={{ fontSize: '56px', margin: '0 0 24px 0', color: RED_ACCENT, lineHeight: 1.1 }}>
        Die
      </h1>
      <p
        style={{
          fontSize: '16px',
          lineHeight: '1.8',
          color: TEXT_DIM,
          maxWidth: '400px',
          margin: '0 0 32px 0',
        }}
      >
        Lost in the wilderness. Hunger gnaws. Every plant, every mushroom, every berry is a gamble.
        Choose wisely — or don't choose at all.
      </p>
      <button
        onClick={startGame}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        style={buttonStyle(TEXT_CREAM)}
      >
        Enter the Wild
      </button>
      <p style={{ fontSize: '12px', color: TEXT_DIM, marginTop: '24px' }}>
        {TOTAL_ENCOUNTERS} real species. {ENCOUNTERS_PER_RUN} encounters per run. No two journeys alike.
      </p>
    </div>
  );

  const renderPlaying = () => {
    if (!currentEncounter) return null;
    const [left, right] = displayedOptions;
    if (!left || !right) return null;

    return (
      <div
        key={animKey}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '700px',
          animation: 'forageFadeIn 0.6s ease',
          filter: clarityFilter,
        }}
      >
        {renderStatsPanel()}

        <div
          style={{
            fontSize: '13px',
            color: TEXT_DIM,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Day {day} of {ENCOUNTERS_PER_RUN} · {currentEncounter.biome}
        </div>

        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: TEXT_CREAM,
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 0 8px 0',
          }}
        >
          {currentEncounter.description}
        </p>

        <p
          style={{
            fontSize: '14px',
            color: RED_ACCENT,
            fontStyle: 'italic',
            margin: '0 0 20px 0',
          }}
        >
          You must eat one to survive.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            width: '100%',
          }}
        >
          {renderChoiceCard(left, 'left')}
          {renderChoiceCard(right, 'right')}
        </div>
      </div>
    );
  };

  const renderOutcome = () => {
    if (!lastChoice) return null;
    const safe = lastChoice.safe;

    return (
      <div
        key={animKey}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '700px',
          animation: 'forageFadeIn 0.6s ease',
          filter: clarityFilter,
        }}
      >
        {renderStatsPanel()}

        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{safe ? '✅' : '☠️'}</div>

        <h2
          style={{
            fontSize: '24px',
            color: safe ? GREEN_ACCENT : RED_ACCENT,
            margin: '0 0 16px 0',
          }}
        >
          {safe ? 'You feel nourished.' : 'Something is very wrong.'}
        </h2>

        <p
          style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: TEXT_CREAM,
            textAlign: 'center',
            maxWidth: '480px',
            margin: '0 0 24px 0',
          }}
        >
          {lastChoice.outcome}
        </p>

        {/* Hint box */}
        <div
          style={{
            background: BG_CARD,
            borderRadius: '8px',
            padding: '16px 20px',
            width: '100%',
            maxWidth: '480px',
            borderLeft: `3px solid ${safe ? GREEN_ACCENT : RED_ACCENT}`,
            marginBottom: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            {safe ? '🌿 Survival Instinct' : '💀 Dying Thought'}
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: TEXT_DIM, margin: 0 }}>
            {safe
              ? "You'll remember what this looked like. The details matter — color, shape, smell. Trust your eyes next time."
              : "If you survive this, remember every detail of what you just ate. Your life depends on never making this mistake again."}
          </p>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: TEXT_DIM,
            fontStyle: 'italic',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          What you ate will be revealed in your Forager's Journal at journey's end.
        </div>

        <button
          onClick={handleContinue}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          style={buttonStyle(safe ? GREEN_ACCENT : RED_ACCENT)}
        >
          {continueText}
        </button>
      </div>
    );
  };

  const renderGameOver = () => (
    <div
      key={animKey}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '700px',
        animation: 'forageFadeIn 0.6s ease',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '12px' }}>💀</div>
      <h1 style={{ fontSize: '36px', color: RED_ACCENT, margin: '0 0 8px 0' }}>
        You Didn't Make It
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: TEXT_DIM,
          textAlign: 'center',
          maxWidth: '460px',
          margin: '0 0 32px 0',
          lineHeight: '1.7',
        }}
      >
        The wilderness claimed you after {day} day{day !== 1 ? 's' : ''}. But death is a teacher — now
        you know what killed you.
      </p>

      {/* Journal reveal */}
      <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>
        📖 Forager's Journal — The Truth
      </h2>
      <p style={{ fontSize: '13px', color: TEXT_DIM, margin: '0 0 20px 0', fontStyle: 'italic' }}>
        Now you learn what you actually put in your mouth.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '32px' }}>
        {journal.map(renderJournalEntry)}
      </div>

      <button
        onClick={startGame}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        style={buttonStyle(RED_ACCENT)}
      >
        Try Again
      </button>
    </div>
  );

  const renderVictory = () => (
    <div
      key={animKey}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '700px',
        animation: 'forageFadeIn 0.6s ease',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '12px' }}>🌅</div>
      <h1 style={{ fontSize: '36px', color: GREEN_ACCENT, margin: '0 0 8px 0' }}>
        You Survived
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: TEXT_DIM,
          textAlign: 'center',
          maxWidth: '460px',
          margin: '0 0 24px 0',
          lineHeight: '1.7',
        }}
      >
        {ENCOUNTERS_PER_RUN} days in the wild. You emerged knowing which gifts nature offers and which
        ones it uses to kill. But next time, the encounters will be different.
      </p>

      {/* Final stats */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        {[
          { icon: '🟡', label: 'Hunger', value: stats.hunger },
          { icon: '🔴', label: 'Health', value: stats.health },
          { icon: '🔵', label: 'Hydration', value: stats.hydration },
          { icon: '🟣', label: 'Clarity', value: stats.clarity },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: BG_CARD,
              borderRadius: '8px',
              padding: '12px 20px',
              textAlign: 'center',
              minWidth: '100px',
            }}
          >
            <div style={{ fontSize: '20px' }}>{s.icon}</div>
            <div style={{ fontSize: '12px', color: TEXT_DIM, marginTop: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{s.value}%</div>
          </div>
        ))}
      </div>

      {/* Journal reveal */}
      <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>
        📖 Complete Forager's Journal — The Truth
      </h2>
      <p style={{ fontSize: '13px', color: TEXT_DIM, margin: '0 0 20px 0', fontStyle: 'italic' }}>
        Everything you ate, and what it really was.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '32px' }}>
        {journal.map(renderJournalEntry)}
      </div>

      <button
        onClick={startGame}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        style={buttonStyle(GREEN_ACCENT)}
      >
        Survive Again
      </button>
    </div>
  );

  // ─── Main render ─────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {gameState === 'title' && renderTitle()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'outcome' && renderOutcome()}
      {gameState === 'gameover' && renderGameOver()}
      {gameState === 'victory' && renderVictory()}
    </div>
  );
}
