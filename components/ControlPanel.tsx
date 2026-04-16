import React from 'react';
import { AsciiOptions, DENSITY_MAPS } from '../types';
import { Sliders, Monitor, Type, Palette, ScanEye, RotateCcw } from 'lucide-react';
import { playButtonSound } from '../utils/soundEffects';

interface ControlPanelProps {
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
  onAnalyze?: () => void;
  onReset?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions, onAnalyze, onReset }) => {
  const handleChange = (key: keyof AsciiOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (key: keyof AsciiOptions, value: any) => {
      playButtonSound();
      handleChange(key, value);
  }

  return (
    <div className="absolute bottom-0 w-full bg-black/90 border-t border-green-900/50 backdrop-blur-md p-3 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-nowrap md:flex-wrap gap-4 md:gap-8 overflow-x-auto pb-4 md:pb-0 scrollbar-hide items-center text-green-500 text-[10px] md:text-xs font-mono">
        
        {/* Analyze Button Redundancy */}
        {onAnalyze && (
          <div className="shrink-0">
            <button 
              onClick={() => { playButtonSound(); onAnalyze(); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-900/40 border border-green-500/50 text-green-400 font-bold rounded-sm hover:bg-green-500 hover:text-black transition-all group whitespace-nowrap"
            >
              <ScanEye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              ANALYZE
            </button>
          </div>
        )}

        {/* Reset Button */}
        {onReset && (
          <div className="shrink-0">
            <button 
              onClick={() => { playButtonSound(); onReset(); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-500/30 text-red-500 font-bold rounded-sm hover:bg-red-500 hover:text-black transition-all group whitespace-nowrap"
              title="Reset to Default"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-90deg] transition-transform" />
              RESET
            </button>
          </div>
        )}

        {/* Font Size */}
        <div className="flex flex-col gap-1 w-28 md:w-32 shrink-0">
          <div className="flex items-center gap-2 mb-0.5 opacity-70">
             <Type className="w-3 h-3" />
             <label className="uppercase">FONT: {options.fontSize}px</label>
          </div>
          <input 
            type="range" 
            min="6" 
            max="24" 
            value={options.fontSize} 
            onChange={(e) => handleChange('fontSize', Number(e.target.value))}
            className="accent-green-500 h-1 bg-green-900/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div className="flex flex-col gap-1 w-28 md:w-32 shrink-0">
           <div className="flex items-center gap-2 mb-0.5 opacity-70">
             <Sliders className="w-3 h-3" />
             <label className="uppercase">GAIN: {options.brightness.toFixed(1)}</label>
           </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value={options.brightness} 
            onChange={(e) => handleChange('brightness', Number(e.target.value))}
            className="accent-green-500 h-1 bg-green-900/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1 w-28 md:w-32 shrink-0">
           <div className="flex items-center gap-2 mb-0.5 opacity-70">
             <Monitor className="w-3 h-3" />
             <label className="uppercase">EXP: {options.contrast.toFixed(1)}</label>
           </div>
          <input 
            type="range" 
            min="0.5" 
            max="3.0" 
            step="0.1" 
            value={options.contrast} 
            onChange={(e) => handleChange('contrast', Number(e.target.value))}
            className="accent-green-500 h-1 bg-green-900/50 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Color Mode */}
        <div className="flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center gap-2 opacity-70">
                <Palette className="w-3 h-3" />
                <span className="uppercase">FILTER</span>
            </div>
            <div className="flex gap-1">
                {(['matrix', 'bw', 'retro', 'color'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange('colorMode', mode)}
                        className={`px-2 py-0.5 border ${options.colorMode === mode ? 'bg-green-500 text-black border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-transparent border-green-900/50 text-green-800 hover:border-green-500'} text-[9px] uppercase transition-all`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>

        {/* Density Map */}
        <div className="flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center gap-2 opacity-70">
                <Type className="w-3 h-3" />
                <span className="uppercase">KERNEL</span>
            </div>
            <div className="flex gap-1">
                {(Object.keys(DENSITY_MAPS) as Array<keyof typeof DENSITY_MAPS>).map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange('density', mode)}
                        className={`px-2 py-0.5 border ${options.density === mode ? 'bg-green-500 text-black border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-transparent border-green-900/50 text-green-800 hover:border-green-500'} text-[9px] uppercase transition-all`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};