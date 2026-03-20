import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import type { Station as StationType } from './types';

interface StationProps {
  station: StationType;
}

export const Station = ({ station }: StationProps) => (
  <div
    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 interactive-element z-10"
    style={{ left: `${station.x}%`, top: `${station.y}%` }}
  >
    <motion.div 
      animate={station.status === 'active' ? { scale: [1, 1.1, 1], borderColor: ['rgba(255,255,255,0.1)', '#4f46e5', 'rgba(255,255,255,0.1)'] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className={`p-4 rounded-2xl backdrop-blur-md border transition-all duration-500 bg-[#0a0e14] ${
        station.status === 'done' ? 'border-[#10b981] text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
        station.status === 'active' ? 'border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)]' :
        station.status === 'rest' ? 'border-amber-500/30 text-amber-400 opacity-60' :
        'border-white/10 text-gray-500'
      }`}
    >
      {station.status === 'done' ? <CheckCircle2 size={20} /> : station.icon}
    </motion.div>
    <span className={`text-[9px] font-mono uppercase tracking-widest whitespace-nowrap ${
      station.status === 'done' ? 'text-emerald-500' :
      station.status === 'active' ? 'text-indigo-400' :
      station.status === 'rest' ? 'text-amber-600' :
      'text-gray-600'
    }`}>
      {station.name}
    </span>
  </div>
);
