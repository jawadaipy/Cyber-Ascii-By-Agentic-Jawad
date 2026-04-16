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
    <div className="absolute bottom-0 w-full bg-black/95 border-t border-green-500/30 backdrop-blur-xl p-3 z-30 transition-all duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-screen-2xl mx-auto flex flex-nowrap lg:flex-wrap gap-4 lg:gap-8 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide items-center text-green-500 text-[11px] lg:text-xs font-mono px-2">
        
        {/* ACTION GROUP */}
        <div className="flex items-center gap-2 pr-4 border-r border-green-900/40 shrink-0">
          {onAnalyze && (
            <button 
              onClick={() => { playButtonSound(); onAnalyze(); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95 whitespace-nowrap"
            >
              <ScanEye className="w-4 h-4" />
              ANALYZE
            </button>
          )}

          {onReset && (
            <button 
              onClick={() => { playButtonSound(); onReset(); }}
              className="flex items-center justify-center p-2 bg-red-950/20 border border-red-500/30 text-red-500 rounded-full hover:bg-red-500 hover:text-black transition-all group shrink-0"
              title="Reset Settings"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" />
            </button>
          )}
        </div>

        {/* IMAGE CONTROLS */}
        <div className="flex items-center gap-6 px-4 border-r border-green-900/40 shrink-0">
          {/* Font Size */}
          <div className="flex flex-col gap-1 w-28 shrink-0">
            <div className="flex items-center gap-2 mb-0.5 opacity-60">
               <Type className="w-3 h-3" />
               <label className="uppercase tracking-tighter">FONT: {options.fontSize}px</label>
            </div>
            <input 
              type="range" 
              min="6" 
              max="24" 
              value={options.fontSize} 
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="accent-green-500 h-1 bg-green-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Brightness */}
          <div className="flex flex-col gap-1 w-28 shrink-0">
             <div className="flex items-center gap-2 mb-0.5 opacity-60">
               <Sliders className="w-3 h-3" />
               <label className="uppercase tracking-tighter">GAIN: {options.brightness.toFixed(1)}</label>
             </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              value={options.brightness} 
              onChange={(e) => handleChange('brightness', Number(e.target.value))}
              className="accent-green-500 h-1 bg-green-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-col gap-1 w-28 shrink-0">
             <div className="flex items-center gap-2 mb-0.5 opacity-60">
               <Monitor className="w-3 h-3" />
               <label className="uppercase tracking-tighter">CONTRAST: {options.contrast.toFixed(1)}</label>
             </div>
            <input 
              type="range" 
              min="0.5" 
              max="3.0" 
              step="0.1" 
              value={options.contrast} 
              onChange={(e) => handleChange('contrast', Number(e.target.value))}
              className="accent-green-500 h-1 bg-green-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* MODE SELECTORS */}
        <div className="flex items-center gap-8 pl-4 shrink-0">
          {/* Color Mode */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 opacity-50">
                  <Palette className="w-3 h-3" />
                  <span className="uppercase tracking-widest text-[9px]">Filter</span>
              </div>
              <div className="flex gap-1.5">
                  {(['matrix', 'bw', 'retro', 'color'] as const).map(mode => (
                      <button
                          key={mode}
                          onClick={() => handleModeChange('colorMode', mode)}
                          className={`px-3 py-1 border rounded-sm ${options.colorMode === mode ? 'bg-green-500 text-black border-green-500' : 'bg-transparent border-green-900 border-dashed text-green-900 hover:border-green-500 hover:text-green-500'} text-[9px] uppercase font-bold transition-all`}
                      >
                          {mode}
                      </button>
                  ))}
              </div>
          </div>

          {/* Density Map */}
          <div className="flex flex-col gap-2 pr-6">
              <div className="flex items-center gap-2 opacity-50">
                  <Type className="w-3 h-3" />
                  <span className="uppercase tracking-widest text-[9px]">Complex</span>
              </div>
              <div className="flex gap-1.5">
                  {(Object.keys(DENSITY_MAPS) as Array<keyof typeof DENSITY_MAPS>).map(mode => (
                      <button
                          key={mode}
                          onClick={() => handleModeChange('density', mode)}
                          className={`px-3 py-1 border rounded-sm ${options.density === mode ? 'bg-green-500 text-black border-green-500' : 'bg-transparent border-green-900 border-dashed text-green-900 hover:border-green-500 hover:text-green-500'} text-[9px] uppercase font-bold transition-all`}
                      >
                          {mode}
                      </button>
                  ))}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};