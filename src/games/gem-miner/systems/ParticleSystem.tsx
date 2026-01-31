import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

// ============================================================
// Particle System - Canvas-based particle effects overlay
// ============================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'sparkle' | 'dust' | 'star' | 'ring' | 'shard';
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  fadeStart: number; // life fraction when fade begins
  shrink: boolean;
}

export interface EmitConfig {
  count: number;
  color: string | string[];
  size?: [number, number]; // [min, max]
  speed?: [number, number];
  life?: [number, number]; // seconds
  type?: Particle['type'];
  angle?: [number, number]; // radians spread
  gravity?: number;
  spread?: number;
  shrink?: boolean;
}

export interface ParticleAPI {
  emit: (x: number, y: number, config: EmitConfig) => void;
  burstCircle: (x: number, y: number, config: EmitConfig) => void;
  screenFlash: (color: string, duration?: number) => void;
  clear: () => void;
}

// Preset effects
export const FX = {
  gemMatch: (color: string): EmitConfig => ({
    count: 12,
    color: [color, '#ffffff', color],
    size: [2, 5],
    speed: [80, 200],
    life: [0.3, 0.7],
    type: 'sparkle',
    gravity: 60,
    shrink: true,
  }),
  gemMatchBig: (color: string): EmitConfig => ({
    count: 24,
    color: [color, '#ffffff', '#fbbf24', color],
    size: [3, 7],
    speed: [100, 280],
    life: [0.4, 1.0],
    type: 'star',
    gravity: 40,
    shrink: true,
  }),
  rockBreak: (): EmitConfig => ({
    count: 16,
    color: ['#78716c', '#a8a29e', '#57534e', '#d6d3d1'],
    size: [3, 8],
    speed: [80, 220],
    life: [0.3, 0.8],
    type: 'shard',
    gravity: 200,
    shrink: false,
  }),
  iceBreak: (): EmitConfig => ({
    count: 14,
    color: ['#06b6d4', '#22d3ee', '#a5f3fc', '#ffffff'],
    size: [2, 6],
    speed: [60, 180],
    life: [0.3, 0.7],
    type: 'shard',
    gravity: 100,
  }),
  dirtClear: (): EmitConfig => ({
    count: 8,
    color: ['#92400e', '#b45309', '#78350f'],
    size: [3, 6],
    speed: [40, 120],
    life: [0.2, 0.5],
    type: 'dust',
    gravity: 150,
  }),
  specialCreate: (): EmitConfig => ({
    count: 20,
    color: ['#fbbf24', '#f59e0b', '#ffffff', '#fde68a'],
    size: [2, 6],
    speed: [40, 160],
    life: [0.5, 1.2],
    type: 'star',
    gravity: -20,
    shrink: true,
  }),
  powerUp: (): EmitConfig => ({
    count: 30,
    color: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444', '#22c55e'],
    size: [3, 8],
    speed: [100, 300],
    life: [0.5, 1.5],
    type: 'star',
    gravity: 20,
    shrink: true,
  }),
  winCelebration: (): EmitConfig => ({
    count: 60,
    color: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6', '#ffffff'],
    size: [3, 8],
    speed: [100, 350],
    life: [1.0, 2.5],
    type: 'star',
    gravity: 80,
    shrink: true,
  }),
  ambient: (): EmitConfig => ({
    count: 1,
    color: ['#fbbf2420', '#d9770620', '#ffffff10'],
    size: [1, 3],
    speed: [5, 20],
    life: [2, 5],
    type: 'dust',
    gravity: -5,
    angle: [0, Math.PI * 2],
  }),
};

function pickColor(color: string | string[]): string {
  if (typeof color === 'string') return color;
  return color[Math.floor(Math.random() * color.length)];
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export const ParticleCanvas = forwardRef<ParticleAPI, { className?: string }>(
  function ParticleCanvas({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const flashRef = useRef<{ color: string; alpha: number; decay: number } | null>(null);
    const animFrameRef = useRef<number>(0);
    const lastTimeRef = useRef(0);

    const emit = useCallback((x: number, y: number, config: EmitConfig) => {
      const {
        count, color, size = [2, 5], speed = [80, 200],
        life = [0.3, 0.8], type = 'sparkle', angle,
        gravity = 50, spread = Math.PI * 2, shrink = true,
      } = config;

      for (let i = 0; i < count; i++) {
        const a = angle
          ? rand(angle[0], angle[1])
          : rand(-spread / 2, spread / 2) - Math.PI / 2;
        const spd = rand(speed[0], speed[1]);
        const maxLife = rand(life[0], life[1]);

        particlesRef.current.push({
          x, y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: maxLife,
          maxLife,
          color: pickColor(color),
          size: rand(size[0], size[1]),
          type,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity,
          fadeStart: 0.4,
          shrink,
        });
      }
    }, []);

    const burstCircle = useCallback((x: number, y: number, config: EmitConfig) => {
      const adjustedConfig = {
        ...config,
        angle: [0, Math.PI * 2] as [number, number],
      };
      emit(x, y, adjustedConfig);
    }, [emit]);

    const screenFlash = useCallback((color: string, duration = 0.3) => {
      flashRef.current = { color, alpha: 0.4, decay: 0.4 / duration };
    }, []);

    const clear = useCallback(() => {
      particlesRef.current = [];
      flashRef.current = null;
    }, []);

    useImperativeHandle(ref, () => ({
      emit,
      burstCircle,
      screenFlash,
      clear,
    }), [emit, burstCircle, screenFlash, clear]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const animate = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = time;

        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Screen flash
        if (flashRef.current) {
          const f = flashRef.current;
          ctx.fillStyle = f.color;
          ctx.globalAlpha = f.alpha;
          ctx.fillRect(0, 0, rect.width, rect.height);
          ctx.globalAlpha = 1;
          f.alpha -= f.decay * dt;
          if (f.alpha <= 0) flashRef.current = null;
        }

        // Update and draw particles
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          p.vy += p.gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.rotationSpeed * dt;

          const lifeFrac = p.life / p.maxLife;
          const alpha = lifeFrac < p.fadeStart ? lifeFrac / p.fadeStart : 1;
          const size = p.shrink ? p.size * lifeFrac : p.size;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          switch (p.type) {
            case 'sparkle': {
              // 4-pointed star
              ctx.fillStyle = p.color;
              ctx.beginPath();
              for (let j = 0; j < 4; j++) {
                const angle = (j / 4) * Math.PI * 2;
                const outerR = size;
                const innerR = size * 0.3;
                ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
                const midAngle = angle + Math.PI / 4;
                ctx.lineTo(Math.cos(midAngle) * innerR, Math.sin(midAngle) * innerR);
              }
              ctx.closePath();
              ctx.fill();
              break;
            }
            case 'star': {
              // 5-pointed star
              ctx.fillStyle = p.color;
              ctx.beginPath();
              for (let j = 0; j < 5; j++) {
                const angle = (j / 5) * Math.PI * 2 - Math.PI / 2;
                const outerR = size;
                const innerR = size * 0.4;
                ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
                const midAngle = angle + Math.PI / 5;
                ctx.lineTo(Math.cos(midAngle) * innerR, Math.sin(midAngle) * innerR);
              }
              ctx.closePath();
              ctx.fill();
              break;
            }
            case 'dust': {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(0, 0, size, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case 'ring': {
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(0, 0, size, 0, Math.PI * 2);
              ctx.stroke();
              break;
            }
            case 'shard': {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.moveTo(-size * 0.3, -size);
              ctx.lineTo(size * 0.3, -size * 0.3);
              ctx.lineTo(size * 0.2, size * 0.8);
              ctx.lineTo(-size * 0.4, size * 0.4);
              ctx.closePath();
              ctx.fill();
              break;
            }
          }

          ctx.restore();
        }

        animFrameRef.current = requestAnimationFrame(animate);
      };

      animFrameRef.current = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        window.removeEventListener('resize', resizeCanvas);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none ${className || ''}`}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }
);
