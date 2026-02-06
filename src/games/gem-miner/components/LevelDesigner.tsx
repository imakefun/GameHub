import { useState, useCallback } from 'react';
import { ArrowLeft, Play, Download, Upload, Trash2, Plus, Minus, Send } from 'lucide-react';
import type { CellModifier, GemType, Objective, ObjectiveType, DesignerLevel, DesignerCell } from '../types';
import { GEM_DEFS } from '../data/gems';
import { ALL_GEM_TYPES } from '../data/gems';

interface SubmitResult {
  success: boolean;
  error?: string;
  details?: string[];
}

interface LevelDesignerProps {
  onBack: () => void;
  onPlayTest: (level: DesignerLevel) => void;
  onSubmit: (level: DesignerLevel) => Promise<SubmitResult>;
}

type PaintTool = CellModifier;

const MODIFIERS: { type: CellModifier; label: string; emoji: string; color: string }[] = [
  { type: 'none', label: 'Empty', emoji: '⬜', color: '#44403c' },
  { type: 'ice', label: 'Ice', emoji: '🧊', color: '#06b6d4' },
  { type: 'dirt', label: 'Dirt', emoji: '🟤', color: '#92400e' },
  { type: 'rock', label: 'Rock', emoji: '🪨', color: '#78716c' },
  { type: 'bedrock', label: 'Bedrock', emoji: '⬛', color: '#1f2937' },
  { type: 'locked', label: 'Locked', emoji: '🔒', color: '#6b7280' },
];

const OBJECTIVE_TYPES: { type: ObjectiveType; label: string }[] = [
  { type: 'score', label: 'Score Target' },
  { type: 'collect_gems', label: 'Collect Gems' },
  { type: 'clear_rocks', label: 'Clear Rocks' },
  { type: 'clear_ice', label: 'Clear Ice' },
  { type: 'clear_dirt', label: 'Clear Dirt' },
];

function createEmptyGrid(rows: number, cols: number): DesignerCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      modifier: 'none' as CellModifier,
      gem: null,
    }))
  );
}

function resizeGrid(old: DesignerCell[][], newRows: number, newCols: number): DesignerCell[][] {
  return Array.from({ length: newRows }, (_, r) =>
    Array.from({ length: newCols }, (_, c) =>
      old[r]?.[c] ? { ...old[r][c] } : { modifier: 'none' as CellModifier, gem: null }
    )
  );
}

export function LevelDesigner({ onBack, onPlayTest, onSubmit }: LevelDesignerProps) {
  const [name, setName] = useState('Custom Level');
  const [description, setDescription] = useState('A custom designed level');
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [grid, setGrid] = useState<DesignerCell[][]>(() => createEmptyGrid(8, 8));
  const [activeTool, setActiveTool] = useState<PaintTool>('none');
  const [selectedGems, setSelectedGems] = useState<GemType[]>(['ruby', 'sapphire', 'emerald', 'topaz']);
  const [objectives, setObjectives] = useState<Objective[]>([{ type: 'score', target: 1000 }]);
  const [maxMoves, setMaxMoves] = useState(25);
  const [starThresholds, setStarThresholds] = useState<[number, number, number]>([1000, 2000, 3500]);
  const [activeTab, setActiveTab] = useState<'grid' | 'settings'>('grid');

  const handleCellTap = useCallback((r: number, c: number) => {
    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      // Toggle: if cell already has this modifier, clear it
      if (next[r][c].modifier === activeTool && activeTool !== 'none') {
        next[r][c].modifier = 'none';
      } else {
        next[r][c].modifier = activeTool;
      }
      return next;
    });
  }, [activeTool]);

  const handleResize = useCallback((newRows: number, newCols: number) => {
    const clamped = {
      rows: Math.max(5, Math.min(12, newRows)),
      cols: Math.max(5, Math.min(12, newCols)),
    };
    setRows(clamped.rows);
    setCols(clamped.cols);
    setGrid(prev => resizeGrid(prev, clamped.rows, clamped.cols));
  }, []);

  const handleClearGrid = useCallback(() => {
    setGrid(createEmptyGrid(rows, cols));
  }, [rows, cols]);

  const toggleGem = useCallback((gem: GemType) => {
    setSelectedGems(prev => {
      if (prev.includes(gem)) {
        if (prev.length <= 3) return prev; // Min 3 gem types
        return prev.filter(g => g !== gem);
      }
      return [...prev, gem];
    });
  }, []);

  const addObjective = useCallback(() => {
    setObjectives(prev => [...prev, { type: 'score', target: 1000 }]);
  }, []);

  const removeObjective = useCallback((idx: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateObjective = useCallback((idx: number, update: Partial<Objective>) => {
    setObjectives(prev => prev.map((obj, i) => i === idx ? { ...obj, ...update } : obj));
  }, []);

  const buildLevel = useCallback((): DesignerLevel => {
    return {
      name,
      description,
      rows,
      cols,
      grid,
      availableGems: selectedGems,
      objectives,
      maxMoves,
      starThresholds,
    };
  }, [name, description, rows, cols, grid, selectedGems, objectives, maxMoves, starThresholds]);

  const handlePlayTest = useCallback(() => {
    onPlayTest(buildLevel());
  }, [buildLevel, onPlayTest]);

  const [submitFlash, setSubmitFlash] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; details: string[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit(buildLevel());

      if (result.success) {
        setSubmitFlash(true);
        setTimeout(() => setSubmitFlash(false), 1500);
      } else {
        setSubmitError({
          message: result.error || 'Submission failed',
          details: result.details || [],
        });
      }
    } catch {
      setSubmitError({
        message: 'An unexpected error occurred',
        details: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [buildLevel, onSubmit]);

  const handleExport = useCallback(() => {
    const level = buildLevel();
    const json = JSON.stringify(level, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gem-miner-level-${name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildLevel, name]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const level: DesignerLevel = JSON.parse(ev.target?.result as string);
          setName(level.name);
          setDescription(level.description);
          setRows(level.rows);
          setCols(level.cols);
          setGrid(level.grid);
          setSelectedGems(level.availableGems);
          setObjectives(level.objectives);
          setMaxMoves(level.maxMoves);
          setStarThresholds(level.starThresholds);
        } catch {
          alert('Invalid level file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Grid cell size calculation for designer (slightly smaller for painting)
  const cellSize = Math.min(
    Math.floor(340 / cols),
    Math.floor(340 / rows),
    42
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur-sm border-b border-stone-800">
        <div className="max-w-md mx-auto flex items-center justify-between px-3 py-2">
          <button onClick={onBack} className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="text-sm font-bold text-amber-400">Level Designer</h1>

          <button
            onClick={handlePlayTest}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Play size={14} />
            <span>Test</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="max-w-md mx-auto flex px-3 pb-2 gap-1">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'grid' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`}
          >
            Grid Editor
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 py-3 pb-24">
        {activeTab === 'grid' ? (
          <>
            {/* Grid size controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Size:</span>
                <button onClick={() => handleResize(rows - 1, cols)} className="w-6 h-6 rounded bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700">
                  <Minus size={12} />
                </button>
                <span className="text-xs text-stone-300 tabular-nums w-12 text-center">{rows}×{cols}</span>
                <button onClick={() => handleResize(rows + 1, cols)} className="w-6 h-6 rounded bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700">
                  <Plus size={12} />
                </button>
                <span className="text-[10px] text-stone-600">rows</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleResize(rows, cols - 1)} className="w-6 h-6 rounded bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700">
                  <Minus size={12} />
                </button>
                <button onClick={() => handleResize(rows, cols + 1)} className="w-6 h-6 rounded bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700">
                  <Plus size={12} />
                </button>
                <span className="text-[10px] text-stone-600">cols</span>
              </div>
              <button onClick={handleClearGrid} className="text-stone-500 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Paint tool palette */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {MODIFIERS.map(mod => (
                <button
                  key={mod.type}
                  onClick={() => setActiveTool(mod.type)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all ${
                    activeTool === mod.type
                      ? 'bg-amber-600/30 border-2 border-amber-500 scale-105'
                      : 'bg-stone-800 border border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  <span className="text-sm">{mod.emoji}</span>
                  <span className="text-stone-400">{mod.label}</span>
                </button>
              ))}
            </div>

            {/* Grid editor */}
            <div className="flex justify-center mb-3">
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  width: cols * cellSize + 4,
                  height: rows * cellSize + 4,
                  background: '#1c1917',
                  border: '2px solid #44403c',
                }}
              >
                <div className="absolute" style={{ left: 2, top: 2, width: cols * cellSize, height: rows * cellSize }}>
                  {grid.map((row, r) =>
                    row.map((cell, c) => {
                      const mod = MODIFIERS.find(m => m.type === cell.modifier);
                      return (
                        <div
                          key={`${r}-${c}`}
                          className="absolute rounded-md border border-stone-800/50 flex items-center justify-center cursor-pointer active:scale-90 transition-transform select-none"
                          style={{
                            width: cellSize - 2,
                            height: cellSize - 2,
                            left: c * cellSize + 1,
                            top: r * cellSize + 1,
                            background: cell.modifier === 'bedrock'
                              ? '#1f2937'
                              : cell.modifier === 'rock'
                              ? '#78716c'
                              : cell.modifier === 'ice'
                              ? 'rgba(6, 182, 212, 0.3)'
                              : cell.modifier === 'dirt'
                              ? 'rgba(146, 64, 14, 0.3)'
                              : cell.modifier === 'locked'
                              ? 'rgba(107, 114, 128, 0.3)'
                              : 'rgba(68, 64, 60, 0.2)',
                          }}
                          onClick={() => handleCellTap(r, c)}
                        >
                          {cell.modifier !== 'none' && (
                            <span className="text-xs opacity-70">{mod?.emoji}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-500">
              {MODIFIERS.filter(m => m.type !== 'none').map(mod => {
                const count = grid.flat().filter(c => c.modifier === mod.type).length;
                return count > 0 ? (
                  <span key={mod.type}>{mod.emoji} {count}</span>
                ) : null;
              })}
            </div>
          </>
        ) : (
          <>
            {/* Settings tab */}
            <div className="space-y-4">
              {/* Name & Description */}
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Level Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Moves */}
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Max Moves</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMaxMoves(m => Math.max(5, m - 5))} className="w-8 h-8 rounded-lg bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700">
                    <Minus size={14} />
                  </button>
                  <span className="text-lg font-bold text-white w-12 text-center tabular-nums">{maxMoves}</span>
                  <button onClick={() => setMaxMoves(m => Math.min(99, m + 5))} className="w-8 h-8 rounded-lg bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Available Gems */}
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Available Gems (min 3)</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GEM_TYPES.map(gem => {
                    const def = GEM_DEFS[gem];
                    const isSelected = selectedGems.includes(gem);
                    return (
                      <button
                        key={gem}
                        onClick={() => toggleGem(gem)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'border-2 bg-stone-800'
                            : 'border border-stone-700 bg-stone-900 opacity-40'
                        }`}
                        style={{ borderColor: isSelected ? def.color : undefined }}
                      >
                        <div className="w-4 h-4 rounded-sm" style={{ background: def.bgGradient }} />
                        <span className="text-stone-300">{def.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-stone-500 uppercase tracking-wider">Objectives</label>
                  <button onClick={addObjective} className="text-amber-500 hover:text-amber-400">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2 bg-stone-800/80 border border-stone-700 rounded-lg p-2">
                      <select
                        value={obj.type}
                        onChange={e => updateObjective(i, { type: e.target.value as ObjectiveType })}
                        className="bg-stone-700 border-none rounded text-xs text-white py-1 px-1.5 focus:outline-none"
                      >
                        {OBJECTIVE_TYPES.map(ot => (
                          <option key={ot.type} value={ot.type}>{ot.label}</option>
                        ))}
                      </select>

                      {obj.type === 'collect_gems' && (
                        <select
                          value={obj.gemType || 'ruby'}
                          onChange={e => updateObjective(i, { gemType: e.target.value as GemType })}
                          className="bg-stone-700 border-none rounded text-xs text-white py-1 px-1.5 focus:outline-none"
                        >
                          {selectedGems.map(g => (
                            <option key={g} value={g}>{GEM_DEFS[g].name}</option>
                          ))}
                        </select>
                      )}

                      <input
                        type="number"
                        value={obj.target}
                        onChange={e => updateObjective(i, { target: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-stone-700 border-none rounded text-xs text-white py-1 px-2 focus:outline-none text-center"
                        min={1}
                      />

                      {objectives.length > 1 && (
                        <button onClick={() => removeObjective(i)} className="text-stone-500 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Star Thresholds */}
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Star Thresholds (Score)</label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex-1">
                      <div className="text-center text-[10px] text-stone-500 mb-0.5">
                        {'⭐'.repeat(i + 1)}
                      </div>
                      <input
                        type="number"
                        value={starThresholds[i]}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setStarThresholds(prev => {
                            const next = [...prev] as [number, number, number];
                            next[i] = val;
                            return next;
                          });
                        }}
                        className="w-full bg-stone-700 border-none rounded text-xs text-white py-1.5 px-2 focus:outline-none text-center"
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {submitError && (
        <div className="fixed bottom-20 left-3 right-3 max-w-md mx-auto bg-red-900/90 border border-red-700 rounded-lg p-3 z-30">
          <div className="flex items-start gap-2">
            <span className="text-red-400 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-red-200 font-medium">{submitError.message}</p>
              {submitError.details.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {submitError.details.map((detail, i) => (
                    <li key={i} className="text-xs text-red-300/80">• {detail}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-400 hover:text-red-300 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/95 backdrop-blur-sm border-t border-stone-800 py-2 px-3 z-20">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={handleImport}
            className="flex items-center gap-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-400 hover:bg-stone-700 transition-colors"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-400 hover:bg-stone-700 transition-colors"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              submitFlash
                ? 'bg-green-600 text-white'
                : isSubmitting
                ? 'bg-stone-600 text-stone-400 cursor-wait'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Send size={14} className={isSubmitting ? 'animate-pulse' : ''} />
            <span>{submitFlash ? 'Submitted!' : isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
          <div className="flex-1" />
          <button
            onClick={handlePlayTest}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold text-white transition-colors"
          >
            <Play size={16} />
            <span>Play Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}
