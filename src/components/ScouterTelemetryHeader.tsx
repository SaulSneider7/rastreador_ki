import React from 'react';
import { Volume2, VolumeX, Camera, Sparkles, Wrench } from 'lucide-react';
import type { ScouterLensColor } from '../types';

interface ScouterTelemetryHeaderProps {
  lensColor: ScouterLensColor;
  onSelectLensColor: (color: ScouterLensColor) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onSwitchCamera: () => void;
  hasCamera: boolean;
  isPresetMode: boolean;
  onTogglePresetMode: () => void;
  hasCrackedGlass: boolean;
  onRepairGlass: () => void;
}

const LENS_OPTIONS: Array<{ id: ScouterLensColor; name: string; bg: string; ring: string }> = [
  { id: 'green', name: 'Esmeralda (Saiyajin)', bg: 'bg-[#00ff66]', ring: 'ring-[#00ff66]' },
  { id: 'red', name: 'Rubí (Freezer/Zarbon)', bg: 'bg-[#ff2a4b]', ring: 'ring-[#ff2a4b]' },
  { id: 'blue', name: 'Zafiro (Ginyu)', bg: 'bg-[#00e5ff]', ring: 'ring-[#00e5ff]' },
  { id: 'yellow', name: 'Ámbar (Cheelai)', bg: 'bg-[#ffb300]', ring: 'ring-[#ffb300]' },
  { id: 'purple', name: 'Hakai (Destrucción)', bg: 'bg-[#c433ff]', ring: 'ring-[#c433ff]' },
];

export const ScouterTelemetryHeader: React.FC<ScouterTelemetryHeaderProps> = ({
  lensColor,
  onSelectLensColor,
  isMuted,
  onToggleMute,
  onSwitchCamera,
  hasCamera,
  isPresetMode,
  onTogglePresetMode,
  hasCrackedGlass,
  onRepairGlass,
}) => {
  return (
    <header className="relative z-20 w-full px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 bg-black/40 backdrop-blur-md border-b border-white/10 select-none">
      {/* Brand & Imperial insignia */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-inner">
          <span className="text-sm font-black text-emerald-400">⚡</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase font-['Orbitron',sans-serif] text-white">
              RASTREADOR DBZ
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/10 text-emerald-300 border border-emerald-500/30">
              MOD-74
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-tight">
            SISTEMA TÁCTICO DE KI EN TIEMPO REAL
          </p>
        </div>
      </div>

      {/* Center lens color picker */}
      <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
        <span className="text-[10px] font-mono text-zinc-400 mr-1 hidden sm:inline">VISOR:</span>
        {LENS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelectLensColor(opt.id)}
            title={opt.name}
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-150 ${opt.bg} ${
              lensColor === opt.id ? `ring-2 ${opt.ring} scale-125 shadow-lg` : 'opacity-40 hover:opacity-80'
            }`}
          />
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {hasCrackedGlass && (
          <button
            onClick={onRepairGlass}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/50 rounded-lg hover:bg-amber-900 transition-colors shadow-lg animate-pulse"
            title="Reparar cristal del rastreador"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">REPARAR LENTE</span>
          </button>
        )}

        <button
          onClick={onTogglePresetMode}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
            isPresetMode
              ? 'bg-purple-900/60 border-purple-400 text-purple-200'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title="Alternar entre cámara y guerreros de prueba"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPresetMode ? 'EN MODO PRUEBA' : 'OBJETIVOS ANIME'}</span>
        </button>

        {hasCamera && !isPresetMode && (
          <button
            onClick={onSwitchCamera}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Cambiar cámara frontal/trasera"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onToggleMute}
          className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
            isMuted
              ? 'bg-red-950/70 border-red-800 text-red-400'
              : 'bg-zinc-900/80 border-zinc-700 text-emerald-400 hover:bg-zinc-800'
          }`}
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
