import React from 'react';

// ─── Palette ────────────────────────────────────────────────

const P = {
  bg: '#0a0a06',
  ground: '#1a1810',
  groundHi: '#252518',
  tree: '#1a2a10',
  treeMid: '#2a3a1a',
  treeLt: '#3a4a2a',
  trunk: '#2a1e14',
  trunkLt: '#4a3a2a',
  water: '#0e1e30',
  waterLt: '#1a3050',
  waterHi: '#2a4a6a',
  rock: '#2a2a22',
  rockLt: '#3a3a30',
  light: '#c8c0a8',
  dim: '#5a5440',
  dimLt: '#8a8470',
  moss: '#1a3010',
  sand: '#3a3020',
  sandLt: '#5a4a30',
  red: '#c0392b',
  green: '#4a9e3f',
  greenDk: '#2a5a1a',
  orange: '#8a5a20',
  warmGlow: '#2a2010',
  birch: '#8a8478',
  snow: '#6a6a60',
};

// ─── SVG Wrapper ────────────────────────────────────────────

function Scene({ children, vb }: { children: React.ReactNode; vb?: string }) {
  return (
    <svg
      viewBox={vb || '0 0 300 140'}
      style={{ width: '100%', maxWidth: '320px', borderRadius: '8px', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="300" height="140" fill={P.bg} />
      {children}
    </svg>
  );
}

function FigureScene({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 180"
      style={{ width: '100%', maxWidth: '220px', borderRadius: '8px', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="180" fill={P.bg} />
      {children}
    </svg>
  );
}

// ─── Reusable Elements ──────────────────────────────────────

function ConiferTree({ x, h, w, o }: { x: number; h: number; w: number; o?: number }) {
  const baseY = 115;
  return (
    <g opacity={o ?? 0.7}>
      <line x1={x} y1={baseY} x2={x} y2={baseY - h * 0.4} stroke={P.trunk} strokeWidth="3" />
      <polygon points={`${x - w},${baseY - h * 0.25} ${x},${baseY - h} ${x + w},${baseY - h * 0.25}`} fill={P.tree} />
      <polygon points={`${x - w * 0.75},${baseY - h * 0.5} ${x},${baseY - h * 0.9} ${x + w * 0.75},${baseY - h * 0.5}`} fill={P.treeMid} />
    </g>
  );
}

function DeciduousTree({ x, h, w, o }: { x: number; h: number; w: number; o?: number }) {
  const baseY = 115;
  return (
    <g opacity={o ?? 0.7}>
      <rect x={x - 2} y={baseY - h * 0.55} width={4} height={h * 0.55} fill={P.trunk} />
      <ellipse cx={x} cy={baseY - h * 0.7} rx={w} ry={w * 0.85} fill={P.treeMid} />
    </g>
  );
}

function BirchTree({ x, h, o }: { x: number; h: number; o?: number }) {
  const baseY = 115;
  return (
    <g opacity={o ?? 0.6}>
      <line x1={x} y1={baseY} x2={x} y2={baseY - h} stroke={P.birch} strokeWidth="3" />
      <line x1={x - 1} y1={baseY - h * 0.3} x2={x - 1} y2={baseY - h * 0.35} stroke={P.dim} strokeWidth="3" />
      <line x1={x + 1} y1={baseY - h * 0.6} x2={x + 1} y2={baseY - h * 0.64} stroke={P.dim} strokeWidth="3" />
      <ellipse cx={x} cy={baseY - h * 0.9} rx={12} ry={14} fill={P.treeMid} opacity={0.5} />
    </g>
  );
}

function Rock({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <ellipse cx={x} cy={y} rx={w} ry={h} fill={P.rock} />;
}

function WaterSurface({ y, h }: { y: number; h: number }) {
  return (
    <>
      <rect x={0} y={y} width={300} height={h} fill={P.water} />
      <line x1={40} y1={y + h * 0.3} x2={80} y2={y + h * 0.3} stroke={P.waterLt} strokeWidth="1" opacity={0.4} />
      <line x1={150} y1={y + h * 0.5} x2={200} y2={y + h * 0.5} stroke={P.waterLt} strokeWidth="1" opacity={0.3} />
      <line x1={220} y1={y + h * 0.7} x2={250} y2={y + h * 0.7} stroke={P.waterLt} strokeWidth="1" opacity={0.4} />
    </>
  );
}

function Ground({ d, fill }: { d: string; fill?: string }) {
  return <path d={d} fill={fill || P.ground} />;
}

function Sparkle({ x, y, s }: { x: number; y: number; s?: number }) {
  const sz = s || 3;
  return (
    <g>
      <line x1={x - sz} y1={y} x2={x + sz} y2={y} stroke={P.light} strokeWidth="1" opacity={0.7} />
      <line x1={x} y1={y - sz} x2={x} y2={y + sz} stroke={P.light} strokeWidth="1" opacity={0.7} />
    </g>
  );
}

// ─── 29 Biome Scene Illustrations ───────────────────────────

function TemperateForest() {
  return (
    <Scene>
      <Ground d="M0,110 Q60,102 120,108 Q180,115 240,105 Q270,108 300,110 L300,140 L0,140 Z" />
      <DeciduousTree x={40} h={75} w={22} o={0.4} />
      <DeciduousTree x={130} h={85} w={26} o={0.6} />
      <DeciduousTree x={240} h={70} w={20} o={0.5} />
      <rect x={70} y={106} width={45} height={6} rx={3} fill={P.trunkLt} opacity={0.5} />
      {/* undergrowth */}
      <ellipse cx={90} cy={112} rx={30} ry={6} fill={P.moss} opacity={0.4} />
      <ellipse cx={200} cy={110} rx={25} ry={5} fill={P.moss} opacity={0.3} />
    </Scene>
  );
}

function MossyClearing() {
  return (
    <Scene>
      <Ground d="M0,108 Q75,105 150,107 Q225,104 300,108 L300,140 L0,140 Z" />
      {/* moss patches */}
      <ellipse cx={80} cy={112} rx={35} ry={4} fill={P.moss} opacity={0.5} />
      <ellipse cx={180} cy={110} rx={40} ry={5} fill={P.moss} opacity={0.4} />
      <ellipse cx={250} cy={113} rx={20} ry={3} fill={P.moss} opacity={0.3} />
      {/* stones */}
      <Rock x={60} y={111} w={8} h={5} />
      <Rock x={220} y={109} w={6} h={4} />
      {/* distant trees */}
      <DeciduousTree x={15} h={55} w={16} o={0.25} />
      <DeciduousTree x={285} h={50} w={14} o={0.25} />
      {/* rain */}
      <line x1={100} y1={10} x2={98} y2={30} stroke={P.waterHi} strokeWidth="1" opacity={0.15} />
      <line x1={180} y1={5} x2={178} y2={25} stroke={P.waterHi} strokeWidth="1" opacity={0.12} />
      <line x1={240} y1={15} x2={238} y2={35} stroke={P.waterHi} strokeWidth="1" opacity={0.1} />
    </Scene>
  );
}

function OldGrowthForest() {
  return (
    <Scene>
      <Ground d="M0,112 Q100,108 200,112 Q250,110 300,112 L300,140 L0,140 Z" />
      {/* massive trunk */}
      <rect x={120} y={30} width={25} height={82} fill={P.trunk} opacity={0.8} />
      <rect x={115} y={25} width={35} height={10} rx={5} fill={P.treeMid} opacity={0.7} />
      {/* thick canopy */}
      <ellipse cx={135} cy={20} rx={50} ry={22} fill={P.tree} opacity={0.5} />
      <ellipse cx={110} cy={25} rx={30} ry={18} fill={P.treeMid} opacity={0.4} />
      <ellipse cx={165} cy={22} rx={28} ry={16} fill={P.tree} opacity={0.4} />
      {/* hanging moss */}
      <path d="M118,35 Q115,55 120,65" fill="none" stroke={P.moss} strokeWidth="2" opacity={0.5} />
      <path d="M148,32 Q152,50 147,60" fill="none" stroke={P.moss} strokeWidth="2" opacity={0.4} />
      {/* dead branch */}
      <line x1={145} y1={55} x2={185} y2={45} stroke={P.trunkLt} strokeWidth="2" opacity={0.4} />
      {/* background tree */}
      <DeciduousTree x={260} h={60} w={18} o={0.25} />
    </Scene>
  );
}

function BirchGrove() {
  return (
    <Scene>
      <Ground d="M0,112 Q75,108 150,112 Q225,109 300,112 L300,140 L0,140 Z" />
      <BirchTree x={50} h={80} o={0.5} />
      <BirchTree x={110} h={90} o={0.7} />
      <BirchTree x={180} h={75} o={0.6} />
      <BirchTree x={240} h={85} o={0.4} />
      {/* grass tufts */}
      <path d="M70,112 Q73,105 76,112" fill="none" stroke={P.treeMid} strokeWidth="1" opacity={0.3} />
      <path d="M150,110 Q153,103 156,110" fill="none" stroke={P.treeMid} strokeWidth="1" opacity={0.3} />
      <path d="M210,111 Q213,104 216,111" fill="none" stroke={P.treeMid} strokeWidth="1" opacity={0.3} />
    </Scene>
  );
}

function ShadedRavine() {
  return (
    <Scene>
      {/* ravine walls */}
      <polygon points="0,50 0,140 130,140 80,100" fill={P.ground} />
      <polygon points="300,45 300,140 170,140 220,100" fill={P.ground} />
      {/* dark bottom */}
      <rect x={80} y={100} width={140} height={40} fill={P.bg} />
      {/* ferns at bottom */}
      <path d="M120,115 Q125,100 130,115" fill="none" stroke={P.treeMid} strokeWidth="2" opacity={0.5} />
      <path d="M160,112 Q165,98 170,112" fill="none" stroke={P.treeMid} strokeWidth="2" opacity={0.4} />
      <path d="M140,118 Q145,105 150,118" fill="none" stroke={P.moss} strokeWidth="1.5" opacity={0.4} />
      {/* dripping water */}
      <line x1={150} y1={80} x2={150} y2={95} stroke={P.waterLt} strokeWidth="1" opacity={0.3} />
    </Scene>
  );
}

function DecayingStump() {
  return (
    <Scene>
      <Ground d="M0,112 Q150,108 300,112 L300,140 L0,140 Z" />
      {/* large stump */}
      <path d="M110,112 L110,70 Q115,65 150,65 Q185,65 190,70 L190,112 Z" fill={P.trunk} opacity={0.7} />
      <ellipse cx={150} cy={65} rx={42} ry={10} fill={P.trunkLt} opacity={0.5} />
      {/* rings */}
      <ellipse cx={150} cy={65} rx={25} ry={6} fill="none" stroke={P.dim} strokeWidth="0.5" opacity={0.3} />
      <ellipse cx={150} cy={65} rx={15} ry={4} fill="none" stroke={P.dim} strokeWidth="0.5" opacity={0.3} />
      {/* tiny mushrooms on stump */}
      <circle cx={125} cy={85} r={4} fill={P.dimLt} opacity={0.5} />
      <rect x={124} y={85} width={2} height={6} fill={P.dim} opacity={0.4} />
      <circle cx={170} cy={80} r={3} fill={P.dimLt} opacity={0.4} />
      <rect x={169} y={80} width={2} height={5} fill={P.dim} opacity={0.3} />
      {/* background tree */}
      <DeciduousTree x={40} h={55} w={16} o={0.2} />
      <DeciduousTree x={260} h={50} w={14} o={0.2} />
    </Scene>
  );
}

function MeadowEdge() {
  return (
    <Scene>
      <Ground d="M0,112 Q75,108 150,110 Q225,112 300,110 L300,140 L0,140 Z" />
      {/* grass on left */}
      <rect x={0} y={108} width={160} height={32} fill={P.groundHi} opacity={0.3} />
      {/* wildflowers */}
      <circle cx={30} cy={108} r={2} fill={P.orange} opacity={0.5} />
      <circle cx={80} cy={106} r={2} fill={P.light} opacity={0.4} />
      <circle cx={120} cy={109} r={2} fill={P.orange} opacity={0.4} />
      {/* tree line on right */}
      <DeciduousTree x={200} h={70} w={20} o={0.5} />
      <DeciduousTree x={240} h={80} w={24} o={0.6} />
      <DeciduousTree x={280} h={65} w={18} o={0.4} />
      {/* morning dew glow */}
      <rect x={0} y={0} width={300} height={140} fill={P.warmGlow} opacity={0.15} />
    </Scene>
  );
}

function Streamside() {
  return (
    <Scene>
      <Ground d="M0,100 Q50,98 100,100 L100,140 L0,140 Z" />
      <Ground d="M200,100 Q250,98 300,102 L300,140 L200,140 Z" />
      <WaterSurface y={98} h={42} />
      {/* overhanging plants */}
      <path d="M90,95 Q105,85 115,95" fill="none" stroke={P.treeMid} strokeWidth="2" opacity={0.5} />
      <path d="M205,92 Q195,82 185,95" fill="none" stroke={P.treeMid} strokeWidth="2" opacity={0.4} />
      {/* bank details */}
      <Rock x={85} y={102} w={7} h={4} />
      <Rock x={210} y={100} w={5} h={3} />
      <DeciduousTree x={40} h={60} w={18} o={0.3} />
      <DeciduousTree x={265} h={55} w={16} o={0.3} />
    </Scene>
  );
}

function RockyHillside() {
  return (
    <Scene>
      {/* sloped ground */}
      <polygon points="0,130 0,140 300,140 300,85" fill={P.ground} />
      <polygon points="0,125 0,140 300,140 300,80" fill={P.groundHi} opacity={0.3} />
      {/* rocks */}
      <Rock x={80} y={118} w={14} h={9} />
      <Rock x={180} y={102} w={18} h={11} />
      <Rock x={250} y={92} w={10} h={7} />
      <Rock x={40} y={125} w={8} h={5} />
      {/* sparse plant */}
      <path d="M140,110 Q143,100 146,110" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.4} />
      <path d="M220,96 Q223,88 226,96" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.3} />
    </Scene>
  );
}

function OvergrownTrail() {
  return (
    <Scene>
      {/* path */}
      <path d="M120,140 Q130,110 150,90 Q170,70 160,40" fill="none" stroke={P.sandLt} strokeWidth="20" opacity={0.15} />
      <Ground d="M0,105 Q40,100 80,108 Q100,112 120,105 L120,140 L0,140 Z" />
      <Ground d="M180,105 Q210,100 240,108 Q270,112 300,105 L300,140 L180,140 Z" />
      {/* crowding vegetation */}
      <ellipse cx={60} cy={100} rx={35} ry={15} fill={P.treeMid} opacity={0.5} />
      <ellipse cx={240} cy={98} rx={35} ry={14} fill={P.tree} opacity={0.5} />
      {/* tall plants */}
      <line x1={90} y1={108} x2={100} y2={80} stroke={P.treeMid} strokeWidth="2" opacity={0.5} />
      <line x1={210} y1={105} x2={200} y2={78} stroke={P.treeMid} strokeWidth="2" opacity={0.5} />
      {/* flower clusters */}
      <circle cx={100} cy={78} r={5} fill={P.light} opacity={0.2} />
      <circle cx={200} cy={76} r={5} fill={P.light} opacity={0.2} />
    </Scene>
  );
}

function SunnyClearing() {
  return (
    <Scene>
      <Ground d="M0,112 Q75,108 150,110 Q225,108 300,112 L300,140 L0,140 Z" />
      {/* sunbeams */}
      <polygon points="130,0 110,110 190,110 170,0" fill={P.warmGlow} opacity={0.2} />
      <polygon points="140,0 125,110 175,110 160,0" fill={P.warmGlow} opacity={0.15} />
      {/* trees at edges */}
      <DeciduousTree x={20} h={70} w={22} o={0.4} />
      <DeciduousTree x={60} h={60} w={18} o={0.3} />
      <DeciduousTree x={250} h={65} w={20} o={0.4} />
      <DeciduousTree x={285} h={55} w={16} o={0.3} />
      {/* warm ground glow */}
      <ellipse cx={150} cy={112} rx={60} ry={5} fill={P.warmGlow} opacity={0.3} />
    </Scene>
  );
}

function DitchBank() {
  return (
    <Scene>
      {/* banks */}
      <Ground d="M0,95 Q50,92 100,98 L100,140 L0,140 Z" />
      <Ground d="M200,98 Q250,92 300,95 L300,140 L200,140 Z" />
      {/* ditch slopes */}
      <polygon points="100,98 120,115 180,115 200,98 200,140 100,140" fill={P.ground} opacity={0.5} />
      {/* water in ditch */}
      <rect x={115} y={113} width={70} height={27} fill={P.water} />
      <line x1={125} y1={120} x2={155} y2={120} stroke={P.waterLt} strokeWidth="1" opacity={0.3} />
      {/* mud */}
      <ellipse cx={110} cy={115} rx={12} ry={3} fill={P.sand} opacity={0.4} />
      <ellipse cx={190} cy={115} rx={12} ry={3} fill={P.sand} opacity={0.4} />
      {/* vegetation */}
      <path d="M80,94 Q83,84 86,94" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.4} />
      <path d="M220,94 Q223,84 226,94" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.4} />
    </Scene>
  );
}

function ForestFloor() {
  return (
    <Scene>
      {/* ground level view - very close */}
      <Ground d="M0,90 Q50,85 100,92 Q150,88 200,90 Q250,86 300,92 L300,140 L0,140 Z" />
      {/* leaf litter */}
      <ellipse cx={60} cy={95} rx={12} ry={3} fill={P.trunkLt} opacity={0.3} />
      <ellipse cx={140} cy={92} rx={10} ry={3} fill={P.orange} opacity={0.2} />
      <ellipse cx={230} cy={93} rx={14} ry={3} fill={P.trunkLt} opacity={0.25} />
      {/* canopy far above */}
      <ellipse cx={80} cy={5} rx={60} ry={30} fill={P.tree} opacity={0.25} />
      <ellipse cx={200} cy={0} rx={70} ry={35} fill={P.treeMid} opacity={0.2} />
      {/* tree trunks going up */}
      <rect x={55} y={0} width={6} height={90} fill={P.trunk} opacity={0.3} />
      <rect x={200} y={0} width={5} height={88} fill={P.trunk} opacity={0.25} />
      {/* roots */}
      <path d="M55,90 Q40,92 30,95" fill="none" stroke={P.trunk} strokeWidth="3" opacity={0.3} />
      <path d="M205,88 Q215,90 225,94" fill="none" stroke={P.trunk} strokeWidth="3" opacity={0.25} />
      {/* small plants on floor */}
      <path d="M120,90 Q123,80 126,90" fill="none" stroke={P.moss} strokeWidth="2" opacity={0.4} />
      <path d="M170,88 Q173,78 176,88" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.3} />
    </Scene>
  );
}

function PineForest() {
  return (
    <Scene>
      <Ground d="M0,112 Q75,108 150,110 Q225,109 300,112 L300,140 L0,140 Z" />
      {/* needle carpet */}
      <rect x={0} y={110} width={300} height={3} fill={P.groundHi} opacity={0.3} />
      <ConiferTree x={30} h={80} w={16} o={0.4} />
      <ConiferTree x={100} h={95} w={20} o={0.65} />
      <ConiferTree x={175} h={85} w={18} o={0.55} />
      <ConiferTree x={250} h={90} w={19} o={0.5} />
      <ConiferTree x={65} h={60} w={12} o={0.25} />
      {/* resin scent lines */}
      <path d="M100,50 Q105,40 100,30" fill="none" stroke={P.treeLt} strokeWidth="0.5" opacity={0.2} />
    </Scene>
  );
}

function ForestEdge() {
  return (
    <Scene>
      <Ground d="M0,112 Q75,108 150,112 Q225,115 300,118 L300,140 L0,140 Z" />
      {/* trees on left, thinning out */}
      <DeciduousTree x={25} h={80} w={24} o={0.6} />
      <DeciduousTree x={75} h={70} w={20} o={0.5} />
      <DeciduousTree x={130} h={55} w={16} o={0.35} />
      {/* open sky on right */}
      <rect x={170} y={0} width={130} height={110} fill={P.bg} />
      {/* horizon glow */}
      <ellipse cx={250} cy={115} rx={80} ry={15} fill={P.warmGlow} opacity={0.15} />
      {/* berry bushes */}
      <ellipse cx={160} cy={110} rx={18} ry={8} fill={P.treeMid} opacity={0.4} />
    </Scene>
  );
}

function Hedgerow() {
  return (
    <Scene>
      <Ground d="M0,115 Q150,112 300,115 L300,140 L0,140 Z" />
      {/* thick hedge line */}
      <ellipse cx={150} cy={85} rx={140} ry={30} fill={P.treeMid} opacity={0.6} />
      <ellipse cx={120} cy={80} rx={50} ry={25} fill={P.tree} opacity={0.5} />
      <ellipse cx={200} cy={82} rx={45} ry={22} fill={P.treeMid} opacity={0.45} />
      {/* berries */}
      <circle cx={100} cy={78} r={3} fill={P.red} opacity={0.6} />
      <circle cx={140} cy={82} r={2.5} fill={P.red} opacity={0.5} />
      <circle cx={180} cy={75} r={3} fill={P.red} opacity={0.55} />
      <circle cx={220} cy={80} r={2} fill={P.red} opacity={0.5} />
      {/* field on near side */}
      <ellipse cx={80} cy={118} rx={30} ry={3} fill={P.groundHi} opacity={0.3} />
    </Scene>
  );
}

function WoodlandPath() {
  return (
    <Scene>
      {/* winding path */}
      <path d="M130,140 Q120,110 140,85 Q160,60 150,30" fill="none" stroke={P.sand} strokeWidth="25" opacity={0.15} />
      <Ground d="M0,105 Q40,102 90,108 L90,140 L0,140 Z" />
      <Ground d="M210,108 Q250,102 300,105 L300,140 L210,140 Z" />
      {/* spaced trees */}
      <DeciduousTree x={40} h={70} w={20} o={0.45} />
      <DeciduousTree x={260} h={75} w={22} o={0.5} />
      {/* dappled light */}
      <circle cx={140} cy={90} r={8} fill={P.warmGlow} opacity={0.15} />
      <circle cx={160} cy={70} r={6} fill={P.warmGlow} opacity={0.1} />
      <circle cx={130} cy={55} r={5} fill={P.warmGlow} opacity={0.1} />
    </Scene>
  );
}

function MountainSlope() {
  return (
    <Scene>
      {/* distant peaks */}
      <polygon points="0,70 60,30 120,70" fill={P.ground} opacity={0.3} />
      <polygon points="100,65 170,15 240,65" fill={P.ground} opacity={0.35} />
      <polygon points="200,70 270,25 340,70" fill={P.ground} opacity={0.3} />
      {/* snow caps */}
      <polygon points="55,33 60,30 65,33" fill={P.snow} opacity={0.3} />
      <polygon points="163,18 170,15 177,18" fill={P.snow} opacity={0.35} />
      {/* rocky foreground slope */}
      <polygon points="0,140 0,100 300,80 300,140" fill={P.ground} />
      <Rock x={80} y={110} w={12} h={7} />
      <Rock x={200} y={95} w={15} h={9} />
      <Rock x={260} y={88} w={9} h={6} />
      {/* sparse alpine plant */}
      <path d="M140,100 Q143,90 146,100" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.35} />
    </Scene>
  );
}

function AutumnThicket() {
  return (
    <Scene>
      <Ground d="M0,110 Q75,106 150,110 Q225,106 300,110 L300,140 L0,140 Z" />
      {/* dense bushes in warm colors */}
      <ellipse cx={60} cy={95} rx={40} ry={20} fill={P.orange} opacity={0.25} />
      <ellipse cx={150} cy={90} rx={45} ry={22} fill={P.trunk} opacity={0.3} />
      <ellipse cx={240} cy={95} rx={38} ry={18} fill={P.orange} opacity={0.2} />
      <ellipse cx={100} cy={92} rx={30} ry={18} fill={P.red} opacity={0.15} />
      <ellipse cx={200} cy={88} rx={35} ry={20} fill={P.trunk} opacity={0.25} />
      {/* hanging fruit */}
      <circle cx={70} cy={100} r={3} fill={P.red} opacity={0.4} />
      <circle cx={160} cy={95} r={2.5} fill={P.orange} opacity={0.4} />
      <circle cx={230} cy={98} r={3} fill={P.red} opacity={0.35} />
      {/* scattered leaves */}
      <ellipse cx={120} cy={112} rx={5} ry={2} fill={P.orange} opacity={0.3} transform="rotate(-20 120 112)" />
      <ellipse cx={200} cy={113} rx={4} ry={2} fill={P.red} opacity={0.25} transform="rotate(15 200 113)" />
    </Scene>
  );
}

function RiverCrossing() {
  return (
    <Scene>
      {/* far bank */}
      <Ground d="M0,65 Q75,60 150,65 Q225,62 300,65 L300,80 L0,80 Z" />
      {/* wide river */}
      <WaterSurface y={68} h={50} />
      {/* near bank */}
      <Ground d="M0,115 Q75,112 150,115 Q225,113 300,115 L300,140 L0,140 Z" />
      {/* far trees */}
      <DeciduousTree x={50} h={40} w={14} o={0.2} />
      <DeciduousTree x={250} h={35} w={12} o={0.2} />
      {/* water plants */}
      <path d="M100,115 Q103,105 106,115" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.4} />
      <path d="M210,113 Q213,103 216,113" fill="none" stroke={P.treeMid} strokeWidth="1.5" opacity={0.35} />
    </Scene>
  );
}

function DesertWash() {
  return (
    <Scene>
      {/* dry ground */}
      <Ground d="M0,108 Q75,105 150,108 Q225,106 300,108 L300,140 L0,140 Z" fill={P.sand} />
      {/* cracked texture */}
      <line x1={50} y1={115} x2={90} y2={118} stroke={P.sandLt} strokeWidth="0.5" opacity={0.3} />
      <line x1={70} y1={112} x2={65} y2={125} stroke={P.sandLt} strokeWidth="0.5" opacity={0.3} />
      <line x1={200} y1={113} x2={240} y2={116} stroke={P.sandLt} strokeWidth="0.5" opacity={0.3} />
      <line x1={220} y1={110} x2={215} y2={123} stroke={P.sandLt} strokeWidth="0.5" opacity={0.3} />
      {/* cactus */}
      <rect x={248} y={70} width={6} height={38} rx={3} fill={P.greenDk} opacity={0.5} />
      <path d="M248,85 Q235,82 238,75" fill="none" stroke={P.greenDk} strokeWidth="5" strokeLinecap="round" opacity={0.5} />
      <path d="M254,80 Q265,78 262,72" fill="none" stroke={P.greenDk} strokeWidth="5" strokeLinecap="round" opacity={0.5} />
      {/* scattered rocks */}
      <Rock x={100} y={110} w={10} h={6} />
      <Rock x={170} y={108} w={7} h={4} />
      {/* heat shimmer */}
      <rect x={0} y={0} width={300} height={50} fill={P.warmGlow} opacity={0.1} />
    </Scene>
  );
}

function DenseUndergrowth() {
  return (
    <Scene>
      {/* very dark, layered vegetation */}
      <Ground d="M0,90 Q75,85 150,92 Q225,87 300,90 L300,140 L0,140 Z" />
      {/* layered bushes */}
      <ellipse cx={50} cy={85} rx={40} ry={18} fill={P.tree} opacity={0.4} />
      <ellipse cx={150} cy={80} rx={50} ry={22} fill={P.treeMid} opacity={0.35} />
      <ellipse cx={250} cy={82} rx={45} ry={20} fill={P.tree} opacity={0.4} />
      {/* canopy blocking light */}
      <ellipse cx={100} cy={10} rx={80} ry={30} fill={P.tree} opacity={0.3} />
      <ellipse cx={220} cy={5} rx={70} ry={28} fill={P.treeMid} opacity={0.25} />
      {/* tangled branches */}
      <path d="M80,50 Q100,40 120,55 Q140,45 160,50" fill="none" stroke={P.trunk} strokeWidth="2" opacity={0.25} />
      <path d="M180,45 Q200,35 220,50" fill="none" stroke={P.trunk} strokeWidth="1.5" opacity={0.2} />
      {/* barely visible light filtering */}
      <circle cx={150} cy={60} r={5} fill={P.warmGlow} opacity={0.08} />
    </Scene>
  );
}

function RockyStream() {
  return (
    <Scene>
      {/* stream bed */}
      <WaterSurface y={85} h={55} />
      {/* banks */}
      <Ground d="M0,90 Q30,85 50,95 L50,140 L0,140 Z" />
      <Ground d="M260,92 Q280,87 300,90 L300,140 L260,140 Z" />
      {/* rocks in water */}
      <Rock x={100} y={95} w={14} h={10} />
      <Rock x={160} y={100} w={18} h={12} />
      <Rock x={220} y={92} w={12} h={8} />
      <Rock x={80} y={108} w={8} h={5} />
      {/* splashing lines */}
      <path d="M105,88 Q108,84 112,88" fill="none" stroke={P.waterHi} strokeWidth="1" opacity={0.3} />
      <path d="M165,92 Q168,88 172,92" fill="none" stroke={P.waterHi} strokeWidth="1" opacity={0.3} />
    </Scene>
  );
}

function RotatingLog() {
  return (
    <Scene>
      <Ground d="M0,112 Q150,108 300,112 L300,140 L0,140 Z" />
      {/* fallen log */}
      <rect x={40} y={95} width={220} height={18} rx={9} fill={P.trunk} opacity={0.6} />
      <ellipse cx={40} cy={104} rx={9} ry={11} fill={P.trunkLt} opacity={0.5} />
      <ellipse cx={260} cy={104} rx={9} ry={11} fill={P.trunkLt} opacity={0.5} />
      {/* decay marks */}
      <ellipse cx={120} cy={100} rx={12} ry={4} fill={P.moss} opacity={0.3} />
      <ellipse cx={200} cy={102} rx={8} ry={3} fill={P.moss} opacity={0.25} />
      {/* tiny mushrooms */}
      <circle cx={140} cy={94} r={3} fill={P.dimLt} opacity={0.4} />
      <rect x={139} y={94} width={2} height={5} fill={P.dim} opacity={0.3} />
      <circle cx={180} cy={93} r={2.5} fill={P.dimLt} opacity={0.35} />
      <rect x={179} y={93} width={2} height={4} fill={P.dim} opacity={0.3} />
      {/* background */}
      <DeciduousTree x={280} h={50} w={15} o={0.2} />
    </Scene>
  );
}

function PondEdge() {
  return (
    <Scene>
      {/* still water */}
      <rect x={0} y={70} width={300} height={70} fill={P.water} />
      {/* reflections */}
      <line x1={60} y1={90} x2={100} y2={90} stroke={P.waterLt} strokeWidth="1" opacity={0.2} />
      <line x1={180} y1={100} x2={230} y2={100} stroke={P.waterLt} strokeWidth="1" opacity={0.15} />
      {/* near bank */}
      <Ground d="M0,105 Q30,100 60,110 L60,140 L0,140 Z" />
      <Ground d="M240,108 Q270,100 300,105 L300,140 L240,140 Z" />
      {/* reeds */}
      <line x1={55} y1={110} x2={55} y2={75} stroke={P.treeMid} strokeWidth="2" opacity={0.4} />
      <line x1={62} y1={108} x2={62} y2={80} stroke={P.treeMid} strokeWidth="1.5" opacity={0.35} />
      <line x1={245} y1={108} x2={245} y2={78} stroke={P.treeMid} strokeWidth="2" opacity={0.4} />
      {/* lily pads */}
      <ellipse cx={130} cy={95} rx={8} ry={3} fill={P.moss} opacity={0.35} />
      <ellipse cx={200} cy={88} rx={6} ry={2.5} fill={P.moss} opacity={0.3} />
    </Scene>
  );
}

function SandyBank() {
  return (
    <Scene>
      {/* sandy ground */}
      <Ground d="M0,100 Q75,95 150,100 Q225,97 300,100 L300,140 L0,140 Z" fill={P.sand} />
      {/* water on one side */}
      <rect x={0} y={110} width={120} height={30} fill={P.water} />
      <line x1={20} y1={118} x2={60} y2={118} stroke={P.waterLt} strokeWidth="1" opacity={0.3} />
      {/* sand texture */}
      <ellipse cx={200} cy={105} rx={25} ry={2} fill={P.sandLt} opacity={0.3} />
      <ellipse cx={250} cy={110} rx={18} ry={2} fill={P.sandLt} opacity={0.25} />
      {/* warm sun */}
      <circle cx={260} cy={25} r={18} fill={P.warmGlow} opacity={0.2} />
      <circle cx={260} cy={25} r={10} fill={P.orange} opacity={0.15} />
      {/* small stones */}
      <Rock x={170} y={103} w={5} h={3} />
      <Rock x={230} y={100} w={4} h={2.5} />
    </Scene>
  );
}

function TidalPool() {
  return (
    <Scene>
      {/* rocky coast */}
      <Ground d="M0,90 Q50,80 100,95 Q150,85 200,92 Q250,82 300,88 L300,140 L0,140 Z" fill={P.rock} />
      {/* pools */}
      <ellipse cx={80} cy={100} rx={25} ry={8} fill={P.water} />
      <ellipse cx={200} cy={95} rx={30} ry={10} fill={P.water} />
      {/* pool reflections */}
      <line x1={70} y1={99} x2={85} y2={99} stroke={P.waterLt} strokeWidth="0.5" opacity={0.3} />
      <line x1={190} y1={94} x2={210} y2={94} stroke={P.waterLt} strokeWidth="0.5" opacity={0.3} />
      {/* rock details */}
      <Rock x={140} y={88} w={15} h={10} />
      <Rock x={40} y={92} w={12} h={8} />
      <Rock x={260} y={86} w={14} h={9} />
      {/* distant sea */}
      <rect x={0} y={0} width={300} height={50} fill={P.water} opacity={0.1} />
    </Scene>
  );
}

function KelpBeach() {
  return (
    <Scene>
      {/* sandy beach */}
      <Ground d="M0,95 Q75,90 150,95 Q225,92 300,95 L300,140 L0,140 Z" fill={P.sand} />
      {/* water at top */}
      <rect x={0} y={0} width={300} height={70} fill={P.water} opacity={0.3} />
      <path d="M0,70 Q75,65 150,72 Q225,68 300,70" fill="none" stroke={P.waterLt} strokeWidth="2" opacity={0.3} />
      {/* kelp strands */}
      <path d="M60,95 Q55,75 65,55 Q60,40 70,25" fill="none" stroke={P.greenDk} strokeWidth="3" opacity={0.4} />
      <path d="M140,92 Q135,72 145,52 Q140,35 150,20" fill="none" stroke={P.greenDk} strokeWidth="3" opacity={0.35} />
      <path d="M230,94 Q225,74 235,55" fill="none" stroke={P.greenDk} strokeWidth="3" opacity={0.3} />
      {/* kelp blobs */}
      <circle cx={70} cy={23} r={5} fill={P.greenDk} opacity={0.3} />
      <circle cx={150} cy={18} r={4} fill={P.greenDk} opacity={0.25} />
      {/* shells on beach */}
      <ellipse cx={100} cy={100} rx={3} ry={2} fill={P.dimLt} opacity={0.3} />
      <ellipse cx={200} cy={97} rx={2.5} ry={1.5} fill={P.dimLt} opacity={0.25} />
    </Scene>
  );
}

function MangroveSwamp() {
  return (
    <Scene>
      {/* warm water */}
      <rect x={0} y={75} width={300} height={65} fill={P.water} opacity={0.5} />
      <WaterSurface y={90} h={50} />
      {/* root arches */}
      <path d="M40,60 Q50,95 70,110" fill="none" stroke={P.trunk} strokeWidth="4" opacity={0.5} />
      <path d="M60,55 Q65,85 55,110" fill="none" stroke={P.trunk} strokeWidth="3" opacity={0.45} />
      <path d="M140,50 Q150,80 165,110" fill="none" stroke={P.trunk} strokeWidth="4" opacity={0.5} />
      <path d="M160,48 Q155,78 145,108" fill="none" stroke={P.trunk} strokeWidth="3" opacity={0.45} />
      <path d="M240,55 Q250,85 260,108" fill="none" stroke={P.trunk} strokeWidth="4" opacity={0.45} />
      {/* canopy above */}
      <ellipse cx={50} cy={42} rx={30} ry={18} fill={P.treeMid} opacity={0.35} />
      <ellipse cx={150} cy={35} rx={35} ry={20} fill={P.tree} opacity={0.35} />
      <ellipse cx={245} cy={40} rx={28} ry={16} fill={P.treeMid} opacity={0.3} />
    </Scene>
  );
}

// ─── Biome Lookup ───────────────────────────────────────────

const biomeScenes: Record<string, () => React.ReactElement> = {
  'Temperate Forest': TemperateForest,
  'Mossy Clearing': MossyClearing,
  'Old Growth Forest': OldGrowthForest,
  'Birch Grove': BirchGrove,
  'Shaded Ravine': ShadedRavine,
  'Decaying Stump': DecayingStump,
  'Meadow Edge': MeadowEdge,
  'Streamside': Streamside,
  'Rocky Hillside': RockyHillside,
  'Overgrown Trail': OvergrownTrail,
  'Sunny Clearing': SunnyClearing,
  'Ditch Bank': DitchBank,
  'Forest Floor': ForestFloor,
  'Pine Forest': PineForest,
  'Forest Edge': ForestEdge,
  'Hedgerow': Hedgerow,
  'Woodland Path': WoodlandPath,
  'Mountain Slope': MountainSlope,
  'Autumn Thicket': AutumnThicket,
  'River Crossing': RiverCrossing,
  'Desert Wash': DesertWash,
  'Dense Undergrowth': DenseUndergrowth,
  'Rocky Stream': RockyStream,
  'Rotting Log': RotatingLog,
  'Pond Edge': PondEdge,
  'Sandy Bank': SandyBank,
  'Tidal Pool': TidalPool,
  'Kelp Beach': KelpBeach,
  'Mangrove Swamp': MangroveSwamp,
};

// ─── 6 Funny Safe Outcome Illustrations ─────────────────────

function ChefKiss() {
  return (
    <FigureScene>
      {/* head */}
      <circle cx={100} cy={42} r={18} fill="none" stroke={P.light} strokeWidth="2" />
      {/* closed happy eyes */}
      <path d="M90,39 Q94,35 98,39" fill="none" stroke={P.light} strokeWidth="1.5" />
      <path d="M102,39 Q106,35 110,39" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* big satisfied grin */}
      <path d="M90,48 Q100,57 110,48" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* body */}
      <line x1={100} y1={60} x2={100} y2={115} stroke={P.light} strokeWidth="2" />
      {/* left arm down */}
      <path d="M100,78 L72,100" fill="none" stroke={P.light} strokeWidth="2" />
      {/* right arm up doing kiss gesture */}
      <path d="M100,78 L132,65 L140,52" fill="none" stroke={P.light} strokeWidth="2" />
      {/* kiss hand */}
      <circle cx={142} cy={49} r={5} fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* sparkles from kiss */}
      <Sparkle x={155} y={38} s={4} />
      <Sparkle x={148} y={30} s={3} />
      <Sparkle x={160} y={45} s={3} />
      {/* legs */}
      <line x1={100} y1={115} x2={85} y2={155} stroke={P.light} strokeWidth="2" />
      <line x1={100} y1={115} x2={115} y2={155} stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

function FoodBaby() {
  return (
    <FigureScene>
      {/* head */}
      <circle cx={100} cy={38} r={16} fill="none" stroke={P.light} strokeWidth="2" />
      {/* blissful eyes */}
      <path d="M91,36 Q95,33 99,36" fill="none" stroke={P.light} strokeWidth="1.5" />
      <path d="M101,36 Q105,33 109,36" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* content smile */}
      <path d="M93,44 Q100,50 107,44" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* body */}
      <line x1={100} y1={54} x2={100} y2={80} stroke={P.light} strokeWidth="2" />
      {/* comically round belly */}
      <ellipse cx={100} cy={95} rx={22} ry={20} fill="none" stroke={P.light} strokeWidth="2" />
      {/* arms hugging belly */}
      <path d="M100,72 Q75,80 82,100" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,72 Q125,80 118,100" fill="none" stroke={P.light} strokeWidth="2" />
      {/* floating hearts */}
      <path d="M60,30 Q60,25 65,25 Q70,25 70,30 Q70,35 65,38 Q60,35 60,30 Z" fill={P.red} opacity={0.5} />
      <path d="M135,22 Q135,18 139,18 Q143,18 143,22 Q143,26 139,28 Q135,26 135,22 Z" fill={P.red} opacity={0.4} />
      {/* legs (spread for balance with big belly) */}
      <line x1={95} y1={112} x2={78} y2={155} stroke={P.light} strokeWidth="2" />
      <line x1={105} y1={112} x2={122} y2={155} stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

function PowerUp() {
  return (
    <FigureScene>
      {/* head */}
      <circle cx={100} cy={40} r={16} fill="none" stroke={P.light} strokeWidth="2" />
      {/* determined eyes */}
      <circle cx={94} cy={38} r={2} fill={P.light} />
      <circle cx={106} cy={38} r={2} fill={P.light} />
      {/* grin */}
      <path d="M92,46 Q100,52 108,46" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* body */}
      <line x1={100} y1={56} x2={100} y2={110} stroke={P.light} strokeWidth="2.5" />
      {/* flexing arms! */}
      <path d="M100,72 L75,65 L65,45" fill="none" stroke={P.light} strokeWidth="2.5" />
      <path d="M100,72 L125,65 L135,45" fill="none" stroke={P.light} strokeWidth="2.5" />
      {/* muscle bumps */}
      <ellipse cx={68} cy={52} rx={7} ry={5} fill="none" stroke={P.light} strokeWidth="1.5" />
      <ellipse cx={132} cy={52} rx={7} ry={5} fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* power radiating lines */}
      <line x1={50} y1={35} x2={40} y2={30} stroke={P.green} strokeWidth="1.5" opacity={0.5} />
      <line x1={150} y1={35} x2={160} y2={30} stroke={P.green} strokeWidth="1.5" opacity={0.5} />
      <line x1={55} y1={70} x2={42} y2={70} stroke={P.green} strokeWidth="1.5" opacity={0.4} />
      <line x1={145} y1={70} x2={158} y2={70} stroke={P.green} strokeWidth="1.5" opacity={0.4} />
      {/* +HP text */}
      <text x={145} y={28} fill={P.green} fontSize="14" fontFamily="monospace" fontWeight="bold" opacity={0.6}>+HP</text>
      {/* legs power stance */}
      <line x1={100} y1={110} x2={80} y2={155} stroke={P.light} strokeWidth="2" />
      <line x1={100} y1={110} x2={120} y2={155} stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

function VictoryDance() {
  return (
    <FigureScene>
      {/* head tilted */}
      <circle cx={105} cy={38} r={16} fill="none" stroke={P.light} strokeWidth="2" />
      {/* excited eyes */}
      <circle cx={99} cy={35} r={2.5} fill={P.light} />
      <circle cx={111} cy={35} r={2.5} fill={P.light} />
      {/* open happy mouth */}
      <ellipse cx={105} cy={46} rx={5} ry={4} fill={P.bg} stroke={P.light} strokeWidth="1.5" />
      {/* body */}
      <line x1={102} y1={54} x2={98} y2={105} stroke={P.light} strokeWidth="2" />
      {/* arms up celebrating */}
      <path d="M100,72 L65,45 L55,30" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,72 L140,50 L155,35" fill="none" stroke={P.light} strokeWidth="2" />
      {/* musical notes */}
      <circle cx={48} cy={25} r={3} fill={P.light} opacity={0.4} />
      <line x1={51} y1={25} x2={51} y2={12} stroke={P.light} strokeWidth="1" opacity={0.4} />
      <circle cx={162} cy={30} r={3} fill={P.light} opacity={0.4} />
      <line x1={165} y1={30} x2={165} y2={17} stroke={P.light} strokeWidth="1" opacity={0.4} />
      {/* one leg up (dancing!) */}
      <line x1={98} y1={105} x2={80} y2={148} stroke={P.light} strokeWidth="2" />
      <line x1={98} y1={105} x2={130} y2={120} stroke={P.light} strokeWidth="2" />
      {/* foot of raised leg */}
      <line x1={130} y1={120} x2={128} y2={140} stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

function BigBrain() {
  return (
    <FigureScene>
      {/* head */}
      <circle cx={100} cy={45} r={16} fill="none" stroke={P.light} strokeWidth="2" />
      {/* smug half-lidded eyes */}
      <line x1={92} y1={42} x2={98} y2={42} stroke={P.light} strokeWidth="2" />
      <line x1={102} y1={42} x2={108} y2={42} stroke={P.light} strokeWidth="2" />
      <circle cx={95} cy={42} r={1.5} fill={P.light} />
      <circle cx={105} cy={42} r={1.5} fill={P.light} />
      {/* knowing smirk */}
      <path d="M95,51 Q102,55 110,50" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* body leaning back smugly */}
      <line x1={100} y1={61} x2={95} y2={115} stroke={P.light} strokeWidth="2" />
      {/* arm pointing to temple */}
      <path d="M98,78 L70,90 L70,110" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M98,78 L118,58 L112,40" fill="none" stroke={P.light} strokeWidth="2" />
      {/* lightbulb above head */}
      <ellipse cx={100} cy={14} rx={8} ry={10} fill="none" stroke={P.orange} strokeWidth="1.5" opacity={0.6} />
      <line x1={97} y1={24} x2={103} y2={24} stroke={P.orange} strokeWidth="1.5" opacity={0.5} />
      {/* radiating knowledge lines */}
      <line x1={88} y1={8} x2={82} y2={2} stroke={P.orange} strokeWidth="1" opacity={0.3} />
      <line x1={100} y1={3} x2={100} y2={-3} stroke={P.orange} strokeWidth="1" opacity={0.3} />
      <line x1={112} y1={8} x2={118} y2={2} stroke={P.orange} strokeWidth="1" opacity={0.3} />
      {/* legs crossed casually */}
      <line x1={95} y1={115} x2={80} y2={155} stroke={P.light} strokeWidth="2" />
      <line x1={95} y1={115} x2={110} y2={150} stroke={P.light} strokeWidth="2" />
      <line x1={110} y1={150} x2={100} y2={155} stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

function NatureHighFive() {
  return (
    <FigureScene>
      {/* person head */}
      <circle cx={80} cy={50} r={15} fill="none" stroke={P.light} strokeWidth="2" />
      {/* happy eyes */}
      <circle cx={74} cy={48} r={2} fill={P.light} />
      <circle cx={86} cy={48} r={2} fill={P.light} />
      {/* smile */}
      <path d="M74,55 Q80,60 86,55" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* body */}
      <line x1={80} y1={65} x2={80} y2={118} stroke={P.light} strokeWidth="2" />
      {/* arm reaching for high five */}
      <path d="M80,82 L115,60 L130,50" fill="none" stroke={P.light} strokeWidth="2" />
      {/* other arm */}
      <path d="M80,82 L55,100" fill="none" stroke={P.light} strokeWidth="2" />
      {/* hand */}
      <path d="M130,50 L134,44 M130,50 L135,48 M130,50 L134,53" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* little plant */}
      <line x1={145} y1={140} x2={145} y2={80} stroke={P.green} strokeWidth="3" opacity={0.7} />
      <ellipse cx={145} cy={72} rx={8} ry={10} fill={P.green} opacity={0.5} />
      {/* plant's tiny arm reaching back */}
      <path d="M140,78 L135,55" fill="none" stroke={P.green} strokeWidth="2" opacity={0.6} />
      {/* leaf hand */}
      <ellipse cx={133} cy={52} rx={5} ry={3} fill={P.green} opacity={0.5} />
      {/* impact sparkles */}
      <Sparkle x={133} y={48} s={4} />
      <Sparkle x={140} y={42} s={3} />
      {/* legs */}
      <line x1={80} y1={118} x2={65} y2={158} stroke={P.light} strokeWidth="2" />
      <line x1={80} y1={118} x2={95} y2={158} stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

// ─── 6 Funny Toxic Outcome Illustrations ────────────────────

function SoulLeaving() {
  return (
    <FigureScene>
      {/* ground line */}
      <line x1={30} y1={150} x2={170} y2={150} stroke={P.dim} strokeWidth="1" opacity={0.3} />
      {/* body lying flat */}
      <circle cx={55} cy={140} r={12} fill="none" stroke={P.light} strokeWidth="2" />
      {/* X eyes */}
      <path d="M49,137 L55,143 M55,137 L49,143" stroke={P.light} strokeWidth="1.5" />
      <path d="M56,137 L62,143 M62,137 L56,143" stroke={P.light} strokeWidth="1.5" />
      {/* flat body */}
      <line x1={67} y1={140} x2={140} y2={140} stroke={P.light} strokeWidth="2" />
      {/* sprawled legs */}
      <line x1={140} y1={140} x2={155} y2={125} stroke={P.light} strokeWidth="2" />
      <line x1={140} y1={140} x2={160} y2={150} stroke={P.light} strokeWidth="2" />
      {/* arm flopped */}
      <line x1={90} y1={140} x2={85} y2={155} stroke={P.light} strokeWidth="2" />
      {/* ghost floating up! */}
      <g opacity={0.4}>
        <ellipse cx={100} cy={65} rx={14} ry={16} fill="none" stroke={P.light} strokeWidth="1.5" />
        {/* ghost eyes */}
        <circle cx={95} cy={62} r={2} fill={P.light} />
        <circle cx={105} cy={62} r={2} fill={P.light} />
        {/* ghost open mouth (surprised) */}
        <ellipse cx={100} cy={70} rx={3} ry={4} fill={P.light} opacity={0.4} />
        {/* ghost waving goodbye */}
        <path d="M114,60 L128,50 L132,42" fill="none" stroke={P.light} strokeWidth="1.5" />
        {/* ghost tail */}
        <path d="M90,80 Q95,88 100,80 Q105,88 110,80" fill="none" stroke={P.light} strokeWidth="1.5" />
      </g>
      {/* rising lines */}
      <line x1={100} y1={90} x2={100} y2={85} stroke={P.light} strokeWidth="0.5" opacity={0.2} />
      <line x1={95} y1={95} x2={95} y2={88} stroke={P.light} strokeWidth="0.5" opacity={0.15} />
    </FigureScene>
  );
}

function FaceGoesGreen() {
  return (
    <FigureScene>
      {/* head */}
      <circle cx={100} cy={42} r={18} fill={P.greenDk} fillOpacity={0.3} stroke={P.light} strokeWidth="2" />
      {/* spiral eyes (dizzy) */}
      <path d="M90,38 Q90,34 94,34 Q98,34 98,38 Q98,42 92,42" fill="none" stroke={P.light} strokeWidth="1.5" />
      <path d="M106,38 Q106,34 110,34 Q114,34 114,38 Q114,42 108,42" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* puffed cheeks */}
      <ellipse cx={82} cy={48} rx={6} ry={4} fill="none" stroke={P.light} strokeWidth="1" />
      <ellipse cx={118} cy={48} rx={6} ry={4} fill="none" stroke={P.light} strokeWidth="1" />
      {/* mouth about to blow */}
      <ellipse cx={100} cy={52} rx={4} ry={3} fill={P.greenDk} opacity={0.4} stroke={P.light} strokeWidth="1" />
      {/* stink lines */}
      <path d="M68,30 Q65,22 70,15" fill="none" stroke={P.green} strokeWidth="1" opacity={0.3} />
      <path d="M75,25 Q72,17 77,10" fill="none" stroke={P.green} strokeWidth="1" opacity={0.25} />
      <path d="M130,28 Q133,20 128,13" fill="none" stroke={P.green} strokeWidth="1" opacity={0.3} />
      {/* body hunched */}
      <path d="M100,60 Q95,85 100,110" fill="none" stroke={P.light} strokeWidth="2" />
      {/* arms clutching stomach */}
      <path d="M100,80 Q80,85 85,100" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,80 Q120,85 115,100" fill="none" stroke={P.light} strokeWidth="2" />
      {/* legs wobbling */}
      <path d="M100,110 Q90,130 85,155" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,110 Q110,130 115,155" fill="none" stroke={P.light} strokeWidth="2" />
    </FigureScene>
  );
}

function ThisIsFine() {
  return (
    <FigureScene>
      {/* seated figure */}
      <circle cx={100} cy={55} r={16} fill="none" stroke={P.light} strokeWidth="2" />
      {/* calm smile (unhinged) */}
      <circle cx={94} cy={52} r={2} fill={P.light} />
      <circle cx={106} cy={52} r={2} fill={P.light} />
      <path d="M93,60 Q100,65 107,60" fill="none" stroke={P.light} strokeWidth="1.5" />
      {/* body seated */}
      <line x1={100} y1={71} x2={100} y2={110} stroke={P.light} strokeWidth="2" />
      {/* arms casually on lap */}
      <path d="M100,85 L75,100 L80,110" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,85 L125,100 L120,110" fill="none" stroke={P.light} strokeWidth="2" />
      {/* legs seated */}
      <path d="M100,110 L80,130 L85,155" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,110 L120,130 L115,155" fill="none" stroke={P.light} strokeWidth="2" />
      {/* chaos flames around */}
      <path d="M40,100 Q42,80 50,70 Q45,60 52,45" fill="none" stroke={P.red} strokeWidth="2" opacity={0.4} />
      <path d="M35,110 Q38,90 45,80 Q42,70 48,58" fill="none" stroke={P.orange} strokeWidth="1.5" opacity={0.3} />
      <path d="M160,100 Q158,80 150,70 Q155,60 148,45" fill="none" stroke={P.red} strokeWidth="2" opacity={0.4} />
      <path d="M165,110 Q162,90 155,80 Q158,70 152,58" fill="none" stroke={P.orange} strokeWidth="1.5" opacity={0.3} />
      {/* small flame wisps */}
      <path d="M55,120 Q57,110 60,105" fill="none" stroke={P.red} strokeWidth="1" opacity={0.3} />
      <path d="M145,118 Q143,108 140,103" fill="none" stroke={P.red} strokeWidth="1" opacity={0.3} />
    </FigureScene>
  );
}

function GravityWins() {
  return (
    <FigureScene>
      {/* ground */}
      <line x1={20} y1={148} x2={180} y2={148} stroke={P.dim} strokeWidth="1" opacity={0.3} />
      {/* face-planted figure */}
      <circle cx={100} cy={138} r={14} fill="none" stroke={P.light} strokeWidth="2" />
      {/* X eyes (face down impression) */}
      <path d="M94,135 L100,141 M100,135 L94,141" stroke={P.light} strokeWidth="1.5" />
      <path d="M101,135 L107,141 M107,135 L101,141" stroke={P.light} strokeWidth="1.5" />
      {/* body sticking up */}
      <line x1={100} y1={124} x2={100} y2={85} stroke={P.light} strokeWidth="2" />
      {/* arms flopped */}
      <line x1={100} y1={100} x2={65} y2={140} stroke={P.light} strokeWidth="2" />
      <line x1={100} y1={100} x2={135} y2={140} stroke={P.light} strokeWidth="2" />
      {/* legs up in air */}
      <line x1={100} y1={85} x2={80} y2={60} stroke={P.light} strokeWidth="2" />
      <line x1={100} y1={85} x2={120} y2={60} stroke={P.light} strokeWidth="2" />
      {/* stars circling above */}
      <Sparkle x={70} y={50} s={4} />
      <Sparkle x={100} y={40} s={3} />
      <Sparkle x={130} y={50} s={4} />
      <Sparkle x={85} y={35} s={3} />
      <Sparkle x={115} y={35} s={3} />
    </FigureScene>
  );
}

function DramaticDeath() {
  return (
    <FigureScene>
      {/* spotlight from above */}
      <polygon points="75,0 50,170 150,170 125,0" fill={P.warmGlow} opacity={0.08} />
      {/* on one knee */}
      <circle cx={100} cy={50} r={16} fill="none" stroke={P.light} strokeWidth="2" />
      {/* anguished eyes looking up */}
      <circle cx={94} cy={46} r={2.5} fill={P.light} />
      <circle cx={106} cy={46} r={2.5} fill={P.light} />
      {/* open mouth of anguish */}
      <ellipse cx={100} cy={56} rx={5} ry={4} fill={P.bg} stroke={P.light} strokeWidth="1.5" />
      {/* body kneeling */}
      <line x1={100} y1={66} x2={100} y2={110} stroke={P.light} strokeWidth="2" />
      {/* arms reaching toward sky */}
      <path d="M100,80 L60,50 L50,25" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,80 L140,50 L150,25" fill="none" stroke={P.light} strokeWidth="2" />
      {/* spread fingers */}
      <path d="M50,25 L46,18 M50,25 L50,16 M50,25 L54,19" fill="none" stroke={P.light} strokeWidth="1" />
      <path d="M150,25 L146,18 M150,25 L150,16 M150,25 L154,19" fill="none" stroke={P.light} strokeWidth="1" />
      {/* kneeling legs */}
      <path d="M100,110 L80,130 L85,155" fill="none" stroke={P.light} strokeWidth="2" />
      <path d="M100,110 L120,135 L110,155" fill="none" stroke={P.light} strokeWidth="2" />
      {/* dramatic tear */}
      <line x1={94} y1={50} x2={92} y2={58} stroke={P.waterHi} strokeWidth="1" opacity={0.4} />
    </FigureScene>
  );
}

function InstantRegret() {
  return (
    <FigureScene>
      {/* head */}
      <circle cx={100} cy={45} r={17} fill="none" stroke={P.light} strokeWidth="2" />
      {/* huge horrified eyes */}
      <circle cx={92} cy={42} r={5} fill="none" stroke={P.light} strokeWidth="1.5" />
      <circle cx={108} cy={42} r={5} fill="none" stroke={P.light} strokeWidth="1.5" />
      <circle cx={92} cy={42} r={2} fill={P.light} />
      <circle cx={108} cy={42} r={2} fill={P.light} />
      {/* tiny horrified mouth */}
      <circle cx={100} cy={54} r={3} fill={P.bg} stroke={P.light} strokeWidth="1.5" />
      {/* hand over mouth */}
      <path d="M100,80 L85,62 Q90,55 100,55" fill="none" stroke={P.light} strokeWidth="2" />
      {/* other hand holding "food" */}
      <path d="M100,80 L135,75" fill="none" stroke={P.light} strokeWidth="2" />
      {/* the offending food (mushroom) */}
      <ellipse cx={142} cy={70} rx={7} ry={5} fill={P.red} opacity={0.4} />
      <rect x={141} y={72} width={2} height={7} fill={P.dim} opacity={0.4} />
      {/* sweat drops */}
      <ellipse cx={78} cy={35} rx={2} ry={3} fill={P.waterHi} opacity={0.4} />
      <ellipse cx={122} cy={33} rx={2} ry={3} fill={P.waterHi} opacity={0.35} />
      {/* body frozen */}
      <line x1={100} y1={62} x2={100} y2={120} stroke={P.light} strokeWidth="2" />
      {/* legs */}
      <line x1={100} y1={120} x2={85} y2={158} stroke={P.light} strokeWidth="2" />
      <line x1={100} y1={120} x2={115} y2={158} stroke={P.light} strokeWidth="2" />
      {/* realization lines */}
      <line x1={75} y1={25} x2={68} y2={18} stroke={P.light} strokeWidth="1" opacity={0.3} />
      <line x1={125} y1={25} x2={132} y2={18} stroke={P.light} strokeWidth="1" opacity={0.3} />
      <line x1={100} y1={22} x2={100} y2={14} stroke={P.light} strokeWidth="1" opacity={0.3} />
    </FigureScene>
  );
}

// ─── Outcome Lookup ─────────────────────────────────────────

const safeOutcomes = [ChefKiss, FoodBaby, PowerUp, VictoryDance, BigBrain, NatureHighFive];
const toxicOutcomes = [SoulLeaving, FaceGoesGreen, ThisIsFine, GravityWins, DramaticDeath, InstantRegret];

// ─── Exported Components ────────────────────────────────────

export function BiomeScene({ biome }: { biome: string }) {
  const Renderer = biomeScenes[biome];
  if (!Renderer) return null;
  return <Renderer />;
}

export function OutcomeScene({ safe, encounterId }: { safe: boolean; encounterId: number }) {
  const pool = safe ? safeOutcomes : toxicOutcomes;
  const idx = encounterId % pool.length;
  const Renderer = pool[idx];
  return <Renderer />;
}
