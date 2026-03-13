import { motion } from 'framer-motion';

interface Props {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  showRanges: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onToggleRanges: () => void;
  onBack: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10">
      <div>
        <div className="text-white font-semibold text-sm">{label}</div>
        <div className="text-white/40 text-xs">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-7 rounded-full transition-colors relative ${
          enabled ? 'bg-emerald-500' : 'bg-slate-600'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
          animate={{ left: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

export function SettingsScreen({
  sfxEnabled, musicEnabled, showRanges,
  onToggleSfx, onToggleMusic, onToggleRanges, onBack,
}: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="text-white/80 text-sm px-3 py-1.5 rounded-lg bg-white/10 active:bg-white/20"
        >
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Settings</h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Audio Settings */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Audio</h3>
          <div className="bg-white/5 rounded-xl px-4">
            <ToggleRow
              label="Sound Effects"
              description="Tower shots, enemy hits, UI sounds"
              enabled={sfxEnabled}
              onToggle={onToggleSfx}
            />
            <ToggleRow
              label="Music"
              description="Background music for each world"
              enabled={musicEnabled}
              onToggle={onToggleMusic}
            />
          </div>
          <p className="text-white/30 text-xs mt-2 px-1">
            Audio files are placeholders. Add .ogg files to /audio/sfx/ and /audio/music/ directories.
          </p>
        </section>

        {/* Gameplay Settings */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">Gameplay</h3>
          <div className="bg-white/5 rounded-xl px-4">
            <ToggleRow
              label="Show Tower Ranges"
              description="Display attack radius when selecting towers"
              enabled={showRanges}
              onToggle={onToggleRanges}
            />
          </div>
        </section>

        {/* Credits */}
        <section>
          <h3 className="text-amber-400 font-bold text-sm mb-2 uppercase tracking-wide">About</h3>
          <div className="bg-white/5 rounded-xl p-4 text-white/50 text-xs space-y-1">
            <div className="text-white font-bold text-sm mb-1">Tower Defense: Kingdom Guardians</div>
            <div>Version 1.0.0</div>
            <div>Built with React + TypeScript</div>
            <div>SVG art inspired by open game art community</div>
            <div className="mt-2 pt-2 border-t border-white/10">
              Audio placeholders ready for:<br/>
              • {13} music tracks (OGG format)<br/>
              • {22} sound effects (OGG format)<br/>
              See /audio/ directory structure
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
