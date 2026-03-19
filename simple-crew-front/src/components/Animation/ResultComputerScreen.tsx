import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Monitor, Download, Copy } from 'lucide-react';

interface ResultComputerScreenProps {
  isOpen: boolean;
  onClose: () => void;
  result: string;
}

export const ResultComputerScreen: React.FC<ResultComputerScreenProps> = ({ isOpen, onClose, result }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
        >
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl h-[80vh] bg-[#1a1a1a] rounded-3xl border-[12px] border-[#333] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Monitor Shine Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10 z-10" />
            
            {/* CRT Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />

            {/* Monitor Header */}
            <div className="h-12 bg-[#2a2a2a] border-b border-black/20 flex items-center justify-between px-6 z-30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="h-4 w-[1px] bg-white/10 mx-2" />
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-bold">
                  <Monitor size={14} />
                  <span>Mission_Output_Viewer.exe</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button className="text-gray-500 hover:text-white transition-colors">
                    <Download size={16} />
                 </button>
                 <button className="text-gray-500 hover:text-white transition-colors">
                    <Copy size={16} />
                 </button>
                 <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>
            </div>

            {/* Screen Content Area */}
            <div className="flex-1 bg-[#050505] relative overflow-hidden flex flex-col p-8 font-mono">
                {/* Visual Glitch/Vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] pointer-events-none z-10" />
                
                <header className="mb-8 border-b border-indigo-500/20 pb-4 shrink-0">
                    <div className="text-indigo-500 text-xs mb-1">CREWAI OPERATING SYSTEM [VERSION 4.2.0.FINAL]</div>
                    <div className="text-gray-600 text-[10px]">(C) 2026 SIMPLE CREW BUILDER CORP. ALL RIGHTS RESERVED.</div>
                    <div className="mt-4 flex items-center gap-2">
                        <Terminal size={12} className="text-emerald-500" />
                        <span className="text-emerald-500 text-xs">$ cat ./final_report.md</span>
                        <motion.span 
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-2 h-4 bg-emerald-500"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 relative z-0">
                    <div className="text-amber-500/90 leading-relaxed text-sm whitespace-pre-wrap filter drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]">
                        {result || "NO DATA RECEIVED. PLEASE CHECK CONNECTION TO COORDINATOR NODE."}
                    </div>
                    
                    {/* End of results decorative tag */}
                    <div className="mt-12 pt-8 border-t border-white/5 text-[10px] text-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span>CHECKSUM: OK</span>
                            <span>ENCRYPTION: AES-256</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>NODE_STATUS: STABLE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Monitor Base Shadow */}
            <div className="h-4 bg-gradient-to-t from-black/40 to-transparent shrink-0" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
