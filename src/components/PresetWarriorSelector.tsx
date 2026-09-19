import React, { useRef } from 'react';
import { Upload, Sparkles, X } from 'lucide-react';
import { PRESET_WARRIORS } from '../data/presetWarriors';
import type { PresetWarrior } from '../types';

interface PresetWarriorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPreset: PresetWarrior | null;
  onSelectPreset: (warrior: PresetWarrior) => void;
  onCustomImageUpload: (imageSrc: string) => void;
}

export const PresetWarriorSelector: React.FC<PresetWarriorSelectorProps> = ({
  isOpen,
  onClose,
  selectedPreset,
  onSelectPreset,
  onCustomImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCustomImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold font-['Orbitron',sans-serif] text-white">
              SELECCIONAR OBJETIVO DE PRUEBA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of preset warriors */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_WARRIORS.map((warrior) => {
              const isSelected = selectedPreset?.id === warrior.id;
              return (
                <button
                  key={warrior.id}
                  onClick={() => onSelectPreset(warrior)}
                  className={`p-3 rounded-xl border text-left flex gap-3 items-center transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <img
                    src={warrior.image}
                    alt={warrior.name}
                    className="w-14 h-14 rounded-lg object-cover border border-zinc-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate font-['Orbitron',sans-serif]">
                      {warrior.name}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">{warrior.race}</p>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                      KI: {warrior.canonicalPower.toLocaleString('es-ES')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Upload custom picture option */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-900/40 hover:bg-emerald-950/20 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-bold font-mono transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>SUBIR TU PROPIA FOTO PARA MEDIR SU PODER</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
