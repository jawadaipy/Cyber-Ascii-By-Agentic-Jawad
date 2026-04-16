import React from 'react';
import { AnalysisResult } from '../types';
import { X, ShieldAlert, Cpu, Activity, Loader2, MessageSquare, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: AnalysisResult | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, result }) => {
  if (!isOpen) return null;

  const isError = result?.tags.includes('ERROR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-black border border-green-500 shadow-[0_0_40px_rgba(0,255,0,0.25)] overflow-hidden font-mono">
        
        {/* Scanner Line Animation */}
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_#0f0] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
        )}

        {/* Header */}
        <div className="bg-green-900/30 p-4 border-b border-green-500/50 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.1),transparent_70%)]"></div>
            <h2 className="text-green-500 text-sm font-bold flex items-center gap-2 tracking-[0.2em] relative z-10">
                <Cpu className="w-4 h-4" />
                NEURAL ANALYSIS SYSTEM
            </h2>
            <button 
              onClick={onClose} 
              className="text-green-700 hover:text-green-400 transition-colors relative z-10"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content Area */}
        <div className="p-6 text-green-400 min-h-[350px] flex flex-col relative">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(0,255,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            {isLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Matrix Digital Rain Animation */}
                    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden select-none flex justify-around">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div 
                                key={i} 
                                className="matrix-column text-[8px] sm:text-[10px] whitespace-nowrap"
                                style={{
                                    animationDuration: `${Math.random() * 3 + 2}s`,
                                    animationDelay: `${Math.random() * 2}s`
                                }}
                            >
                                {Array.from({ length: 30 }).map((_, j) => (
                                    <div key={j} className="my-1">
                                        {String.fromCharCode(0x30A0 + Math.random() * 96)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col items-center space-y-6 bg-black/40 backdrop-blur-sm p-4 border border-green-500/20 rounded-lg">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-green-500 animate-[spin_3s_linear_infinite]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-4 text-center">
                            <div className="text-lg font-bold tracking-widest animate-pulse text-green-300">DECODING DIGITAL SIGNATURE...</div>
                            <div className="text-[10px] text-green-700/80 font-mono text-left inline-block border-l border-green-900 pl-3">
                                ENCRYPTION: BYPASSING <br/>
                                NEURAL_CORE: OVERCLOCKING <br/>
                                MATRIX_STATUS: SYNCING... <br/>
                                READY_FOR_EXTRACT: 72%
                            </div>
                        </div>
                    </div>
                </div>
            ) : result ? (
                <div className="flex-grow flex flex-col space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Status Header */}
                    <div className="flex items-center gap-3 border border-green-500/30 bg-green-500/5 p-3 rounded-sm">
                        {isError ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${isError ? 'text-red-400' : 'text-green-300'}`}>
                          {isError ? 'PROCESS_FAILED: LINK INTERRUPTED' : 'SCAN_COMPLETE: DATA PURIFIED'}
                        </span>
                    </div>

                    {/* Threat Level Badge */}
                    <div className="border border-green-800/50 p-4 bg-green-900/10 flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-green-700 font-bold uppercase tracking-wider">THREAT LEVEL ASSESSMENT</span>
                          <div className={`text-xl font-bold flex items-center gap-2 mt-1 ${
                              result.threatLevel.includes('HIGH') || result.threatLevel.includes('CRITICAL') ? 'text-red-500' : 'text-green-400'
                          }`}>
                              <ShieldAlert className="w-5 h-5" />
                              {result.threatLevel}
                          </div>
                        </div>
                        <Activity className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>

                    {/* Description Container */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] text-green-700 font-bold uppercase tracking-[0.2em] border-b border-green-950 pb-1">SUBJECT ANALYSIS REPORT</h3>
                        <p className="leading-relaxed text-sm text-green-200/90 py-2 border-l-2 border-green-600/30 pl-4 italic">
                            {result.description}
                        </p>
                    </div>

                    {/* Attributes Tags */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] text-green-700 font-bold uppercase tracking-[0.2em] border-b border-green-950 pb-1">IDENTIFIED_ATTRIBUTES</h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {result.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] border border-green-500/30 px-2 py-1 bg-green-500/5 text-green-400 tracking-wider hover:bg-green-500/20 transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="pt-4 border-t border-green-950 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <a 
                          href="https://whatsapp.com/channel/0029VayBRLf4dTnBtUMEHv0z" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-bold text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] active:scale-95 group"
                        >
                          <MessageSquare className="w-4 h-4" />
                          JOIN AI SPACE
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                        
                        <button 
                          onClick={onClose} 
                          className="w-full sm:w-auto text-[10px] bg-transparent border border-green-700 text-green-700 hover:border-green-400 hover:text-green-400 px-6 py-2 uppercase font-bold transition-all"
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                    <div>
                        <div className="text-xl font-bold text-red-500">CRITICAL_EXCEPTION</div>
                        <div className="text-xs text-red-900 mt-2 tracking-widest">DATA_FEED_CORRUPTED // NEURAL_HANDSHAKE_FAILED</div>
                    </div>
                    <button onClick={onClose} className="mt-8 border border-red-900 px-6 py-2 text-red-900 hover:bg-red-900 hover:text-black transition-all uppercase text-xs">
                      Reboot Link
                    </button>
                </div>
            )}
        </div>

        {/* Dynamic Footer Bar */}
        <div className="bg-green-950/40 p-2 border-t border-green-900/50 flex justify-between items-center text-[9px] text-green-800 uppercase tracking-widest relative">
            <div className="flex gap-4">
              <span>TERMINAL_ID: 884-X</span>
              <span>USER: {isError ? "UNKNOWN" : "AUTHORIZED"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span>{isLoading ? "UPLOADING..." : "SECURE_LINK"}</span>
            </div>
        </div>

      </div>
      <style>{`
        @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
        @keyframes matrix-fall {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .matrix-column {
            display: flex;
            flex-direction: column;
            animation: matrix-fall linear infinite;
        }
      `}</style>
    </div>
  );
};