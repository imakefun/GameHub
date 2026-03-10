import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { EditorState, EditorTool, WorldTheme, WaveGroup, EnemyId } from '../types';
import { ENEMY_LIST } from '../data/enemies';

interface Props {
  editorState: EditorState;
  onSetTool: (tool: EditorTool) => void;
  onPaint: (row: number, col: number) => void;
  onSetName: (name: string) => void;
  onResize: (rows: number, cols: number) => void;
  onSetTheme: (theme: WorldTheme) => void;
  onAddWave: () => void;
  onRemoveWave: (index: number) => void;
  onUpdateWaveGroup: (waveIndex: number, groupIndex: number, group: Partial<WaveGroup>) => void;
  onAddWaveGroup: (waveIndex: number) => void;
  onRemoveWaveGroup: (waveIndex: number, groupIndex: number) => void;
  onSetGold: (gold: number) => void;
  onSetLives: (lives: number) => void;
  onTest: () => void;
  onSave: () => void;
  onExit: () => void;
}

const TOOLS: { tool: EditorTool; label: string; emoji: string }[] = [
  { tool: 'start', label: 'Start', emoji: '🚪' },
  { tool: 'path', label: 'Path', emoji: '🟤' },
  { tool: 'end', label: 'End', emoji: '🏠' },
  { tool: 'buildable', label: 'Build', emoji: '🟩' },
  { tool: 'blocked', label: 'Block', emoji: '⬛' },
  { tool: 'erase', label: 'Erase', emoji: '🧹' },
];

const THEMES: { theme: WorldTheme; label: string; emoji: string }[] = [
  { theme: 'forest', label: 'Forest', emoji: '🌲' },
  { theme: 'desert', label: 'Desert', emoji: '🏜️' },
  { theme: 'ice', label: 'Ice', emoji: '🏔️' },
  { theme: 'volcano', label: 'Volcano', emoji: '🌋' },
  { theme: 'shadow', label: 'Shadow', emoji: '🌑' },
  { theme: 'crystal', label: 'Crystal', emoji: '💎' },
];

const THEME_CELL_COLORS: Record<string, Record<string, string>> = {
  forest: { path: '#4a3728', buildable: '#2d5a27', blocked: '#1a3a15', start: '#2563eb', end: '#dc2626' },
  desert: { path: '#8b7355', buildable: '#6b5a3a', blocked: '#4a3a20', start: '#2563eb', end: '#dc2626' },
  ice: { path: '#6b8ba0', buildable: '#3a5a6a', blocked: '#2a3a4a', start: '#2563eb', end: '#dc2626' },
  volcano: { path: '#5a3030', buildable: '#4a2020', blocked: '#3a1515', start: '#2563eb', end: '#dc2626' },
  shadow: { path: '#4a3a5a', buildable: '#2a2035', blocked: '#1a1525', start: '#2563eb', end: '#dc2626' },
  crystal: { path: '#3a5a5a', buildable: '#2a4a4a', blocked: '#1a3535', start: '#2563eb', end: '#dc2626' },
};

type Tab = 'grid' | 'waves' | 'settings';

export function LevelEditor({
  editorState, onSetTool, onPaint, onSetName, onResize, onSetTheme,
  onAddWave, onRemoveWave, onUpdateWaveGroup, onAddWaveGroup, onRemoveWaveGroup,
  onSetGold, onSetLives, onTest, onSave, onExit,
}: Props) {
  const [tab, setTab] = useState<Tab>('grid');
  const [isPainting, setIsPainting] = useState(false);

  const cellSize = Math.min(36, Math.floor((window.innerWidth - 32) / editorState.cols));
  const colors = THEME_CELL_COLORS[editorState.theme] || THEME_CELL_COLORS.forest;

  const handlePointerDown = useCallback((row: number, col: number) => {
    setIsPainting(true);
    onPaint(row, col);
  }, [onPaint]);

  const handlePointerEnter = useCallback((row: number, col: number) => {
    if (isPainting) onPaint(row, col);
  }, [isPainting, onPaint]);

  const handlePointerUp = useCallback(() => {
    setIsPainting(false);
  }, []);

  const pathValid = editorState.path.length >= 2;

  return (
    <div
      className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/30">
        <button onClick={onExit} className="text-white/70 text-sm px-3 py-1 rounded bg-white/10">
          ← Back
        </button>
        <h2 className="text-white font-bold text-sm">Level Editor</h2>
        <div className="flex gap-1.5">
          <button
            onClick={onTest}
            disabled={!pathValid}
            className={`text-sm px-3 py-1 rounded font-bold ${
              pathValid ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500'
            }`}
          >
            Test
          </button>
          <button
            onClick={onSave}
            disabled={!pathValid}
            className={`text-sm px-3 py-1 rounded font-bold ${
              pathValid ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-500'
            }`}
          >
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['grid', 'waves', 'settings'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-bold capitalize ${
              tab === t ? 'text-white border-b-2 border-amber-400' : 'text-white/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tab === 'grid' && (
          <div>
            {/* Tools */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
              {TOOLS.map(t => (
                <button
                  key={t.tool}
                  onClick={() => onSetTool(t.tool)}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    editorState.selectedTool === t.tool
                      ? 'bg-white/25 text-white ring-1 ring-white/40'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {/* Path status */}
            <div className={`text-xs mb-2 ${pathValid ? 'text-emerald-400' : 'text-red-400'}`}>
              {pathValid
                ? `✓ Path found (${editorState.path.length} cells)`
                : '✕ Place a Start, path cells, and End to create a valid path'}
            </div>

            {/* Grid */}
            <div className="flex justify-center touch-none select-none">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${editorState.cols}, ${cellSize}px)`,
                  gap: 1,
                }}
              >
                {editorState.grid.map((row, r) =>
                  row.map((cell, c) => {
                    const isOnPath = editorState.path.some(p => p.row === r && p.col === c);
                    return (
                      <div
                        key={`${r}-${c}`}
                        onPointerDown={() => handlePointerDown(r, c)}
                        onPointerEnter={() => handlePointerEnter(r, c)}
                        className="flex items-center justify-center text-[10px] cursor-pointer"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: colors[cell.type] || colors.buildable,
                          border: isOnPath ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {cell.type === 'start' && '🚪'}
                        {cell.type === 'end' && '🏠'}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'waves' && (
          <div className="space-y-3">
            {editorState.waves.map((wave, wi) => (
              <div key={wi} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">Wave {wi + 1}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onAddWaveGroup(wi)}
                      className="text-xs px-2 py-0.5 rounded bg-emerald-600/50 text-emerald-300"
                    >
                      + Group
                    </button>
                    {editorState.waves.length > 1 && (
                      <button
                        onClick={() => onRemoveWave(wi)}
                        className="text-xs px-2 py-0.5 rounded bg-red-600/50 text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {wave.groups.map((group, gi) => (
                  <div key={gi} className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <select
                      value={group.enemyId}
                      onChange={(e) => onUpdateWaveGroup(wi, gi, { enemyId: e.target.value as EnemyId })}
                      className="bg-slate-800 text-white text-xs rounded px-1.5 py-1 border border-white/10"
                    >
                      {ENEMY_LIST.map(e => (
                        <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>
                      ))}
                    </select>
                    <label className="text-white/50 text-xs">×</label>
                    <input
                      type="number"
                      value={group.count}
                      onChange={(e) => onUpdateWaveGroup(wi, gi, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="bg-slate-800 text-white text-xs rounded px-1.5 py-1 w-12 border border-white/10"
                      min={1}
                    />
                    <label className="text-white/50 text-[10px]">interval</label>
                    <input
                      type="number"
                      value={group.interval}
                      onChange={(e) => onUpdateWaveGroup(wi, gi, { interval: Math.max(100, parseInt(e.target.value) || 100) })}
                      className="bg-slate-800 text-white text-xs rounded px-1.5 py-1 w-16 border border-white/10"
                      min={100}
                      step={100}
                    />
                    <label className="text-white/50 text-[10px]">delay</label>
                    <input
                      type="number"
                      value={group.delay}
                      onChange={(e) => onUpdateWaveGroup(wi, gi, { delay: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="bg-slate-800 text-white text-xs rounded px-1.5 py-1 w-16 border border-white/10"
                      min={0}
                      step={500}
                    />
                    {wave.groups.length > 1 && (
                      <button
                        onClick={() => onRemoveWaveGroup(wi, gi)}
                        className="text-red-400 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <button
              onClick={onAddWave}
              className="w-full py-2 rounded-xl bg-white/10 text-white/70 text-sm font-bold active:bg-white/20"
            >
              + Add Wave
            </button>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs block mb-1">Level Name</label>
              <input
                type="text"
                value={editorState.name}
                onChange={(e) => onSetName(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-white/60 text-xs block mb-1">Start Gold</label>
                <input
                  type="number"
                  value={editorState.startGold}
                  onChange={(e) => onSetGold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
                  min={0}
                  step={10}
                />
              </div>
              <div className="flex-1">
                <label className="text-white/60 text-xs block mb-1">Start Lives</label>
                <input
                  type="number"
                  value={editorState.startLives}
                  onChange={(e) => onSetLives(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
                  min={1}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-white/60 text-xs block mb-1">Rows</label>
                <input
                  type="number"
                  value={editorState.rows}
                  onChange={(e) => onResize(Math.max(5, Math.min(12, parseInt(e.target.value) || 9)), editorState.cols)}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
                  min={5}
                  max={12}
                />
              </div>
              <div className="flex-1">
                <label className="text-white/60 text-xs block mb-1">Cols</label>
                <input
                  type="number"
                  value={editorState.cols}
                  onChange={(e) => onResize(editorState.rows, Math.max(5, Math.min(12, parseInt(e.target.value) || 8)))}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
                  min={5}
                  max={12}
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs block mb-1">Theme</label>
              <div className="flex gap-1.5 flex-wrap">
                {THEMES.map(t => (
                  <button
                    key={t.theme}
                    onClick={() => onSetTheme(t.theme)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      editorState.theme === t.theme
                        ? 'bg-white/20 text-white ring-1 ring-white/40'
                        : 'bg-white/5 text-white/60'
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
