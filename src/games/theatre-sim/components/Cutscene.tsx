import { useState, useEffect, useCallback } from 'react';
import type { CutsceneSequence } from '../types';

interface Props {
  sequence: CutsceneSequence;
  onComplete: () => void;
}

const moodGradients: Record<string, string> = {
  neutral: 'from-slate-950 via-slate-900 to-slate-950',
  dramatic: 'from-slate-950 via-red-950/30 to-slate-950',
  hopeful: 'from-slate-950 via-amber-950/20 to-slate-950',
  tense: 'from-slate-950 via-blue-950/30 to-slate-950',
  triumphant: 'from-slate-950 via-yellow-950/20 to-slate-950',
};

const moodBorders: Record<string, string> = {
  neutral: 'border-slate-700/30',
  dramatic: 'border-red-800/20',
  hopeful: 'border-amber-800/20',
  tense: 'border-blue-800/20',
  triumphant: 'border-yellow-800/20',
};

export function Cutscene({ sequence, onComplete }: Props) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [visible, setVisible] = useState(false);

  const beat = sequence.beats[beatIndex];
  const isLastBeat = beatIndex === sequence.beats.length - 1;
  const mood = beat?.mood ?? 'neutral';

  // Fade in content after parent's black overlay has covered the screen
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!beat) return;

    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    const text = beat.text;
    const speed = 25; // ms per character

    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [beat, beatIndex]);

  const advance = useCallback(() => {
    if (isTyping) {
      // Skip typewriter — show full text immediately
      setDisplayedText(beat.text);
      setIsTyping(false);
      return;
    }

    if (isLastBeat) {
      onComplete();
    } else {
      setBeatIndex(prev => prev + 1);
    }
  }, [isTyping, isLastBeat, onComplete, beat]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      } else if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance, onComplete]);

  if (!beat) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-gradient-to-b ${moodGradients[mood]} flex flex-col items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={advance}
    >
      {/* Skip button */}
      <button
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute top-4 right-4 text-xs text-slate-600 hover:text-slate-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-800/50 hover:border-slate-700/50 z-10"
      >
        Skip
      </button>

      {/* Title (shown on first beat only) */}
      {beatIndex === 0 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <h2 className="text-xl sm:text-2xl font-bold text-white/80 tracking-wide">
            {sequence.title}
          </h2>
        </div>
      )}

      {/* Cinematic content area */}
      <div className="max-w-2xl w-full px-6 flex flex-col items-center gap-6">
        {/* Image placeholder */}
        <div
          className={`w-full aspect-[16/9] rounded-xl border ${moodBorders[mood]} bg-slate-900/60 backdrop-blur-sm overflow-hidden flex items-center justify-center transition-all duration-500`}
        >
          {beat.imageSrc ? (
            <img
              src={beat.imageSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center">
              <div className="text-4xl mb-3 opacity-30">🎬</div>
              <p className="text-xs text-slate-600 italic leading-relaxed max-w-sm">
                {beat.imagePlaceholder}
              </p>
            </div>
          )}
        </div>

        {/* Text area */}
        <div className="w-full min-h-[120px] flex flex-col justify-center">
          {/* Speaker tag */}
          {beat.speaker && (
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80 px-2 py-0.5 bg-amber-900/20 rounded">
                {beat.speaker}
              </span>
            </div>
          )}

          {/* Dialogue / Narration */}
          <p className={`text-base sm:text-lg leading-relaxed ${
            beat.speaker ? 'text-white/90 italic' : 'text-slate-300'
          }`}>
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-5 bg-white/60 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Progress & prompt */}
        <div className="flex items-center justify-between w-full">
          {/* Beat progress dots */}
          <div className="flex gap-1.5">
            {sequence.beats.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === beatIndex
                    ? 'bg-white scale-125'
                    : i < beatIndex
                    ? 'bg-white/40'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Advance prompt */}
          {!isTyping && (
            <p className="text-xs text-slate-500 animate-pulse">
              {isLastBeat ? 'Click to continue' : 'Click to advance'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
