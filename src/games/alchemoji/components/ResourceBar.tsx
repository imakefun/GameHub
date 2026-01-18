import { motion } from 'framer-motion';
import { Coins, Zap } from 'lucide-react';
import type { Resources } from '../types';

interface ResourceBarProps {
  resources: Resources;
}

export function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <div className="flex items-center gap-6 p-4 glass rounded-xl">
      <motion.div
        key={resources.money}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        <div className="p-2 rounded-lg bg-yellow-500/20">
          <Coins className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs text-surface-400">Money</p>
          <p className="text-lg font-bold text-yellow-400">
            ${resources.money.toLocaleString()}
          </p>
        </div>
      </motion.div>

      <motion.div
        key={resources.energy}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Zap className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-surface-400">Energy</p>
          <p className="text-lg font-bold text-blue-400">
            {Math.floor(resources.energy).toLocaleString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
