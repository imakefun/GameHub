import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
}

export interface FloatingScoreAPI {
  spawn: (x: number, y: number, text: string, color?: string, size?: 'sm' | 'md' | 'lg') => void;
}

let popupIdCounter = 0;

export function FloatingScoreLayer({ apiRef }: { apiRef: React.MutableRefObject<FloatingScoreAPI | null> }) {
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const cleanupTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      cleanupTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const spawn = useCallback((x: number, y: number, text: string, color = '#fbbf24', size: 'sm' | 'md' | 'lg' = 'md') => {
    const id = ++popupIdCounter;
    const popup: ScorePopup = { id, x, y, text, color, size };
    setPopups(prev => [...prev, popup]);
    const t = setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
    cleanupTimers.current.push(t);
  }, []);

  // Expose spawn via ref
  useEffect(() => {
    apiRef.current = { spawn };
  }, [spawn, apiRef]);

  const sizeClasses = {
    sm: 'text-xs font-bold',
    md: 'text-sm font-bold',
    lg: 'text-lg font-extrabold',
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ x: popup.x, y: popup.y, opacity: 1, scale: 0.5 }}
            animate={{
              x: popup.x + (Math.random() - 0.5) * 20,
              y: popup.y - 60,
              opacity: 0,
              scale: popup.size === 'lg' ? 1.5 : 1.2,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute ${sizeClasses[popup.size]}`}
            style={{
              color: popup.color,
              textShadow: `0 0 8px ${popup.color}80, 0 2px 4px rgba(0,0,0,0.8)`,
              whiteSpace: 'nowrap',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {popup.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
