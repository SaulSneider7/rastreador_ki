import React from 'react';
import { X, Zap, Skull, AlertTriangle, Compass } from 'lucide-react';
import type { DeepScanResult } from '../types';

interface TacticalDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  dossier: DeepScanResult | null;
  capturedThumb: string | null;
}

export const TacticalDossierModal: React.FC<TacticalDossierModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  dossier,
  capturedThumb,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border-2 border-purple-500/60 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Imperial Insignia */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-950 via-zinc-900 to-purple-950 border-b border-purple-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-900 border border-purple-400 flex items-center justify-center">
              <Skull className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                INFORME TÁCTICO // FUERZAS DE FREEZER
              </h3>
              <p className="text-[10px] font-mono text-purple-300">
                INTELIGENCIA MILITAR INTERPLANETARIA - ARCHIVO #774-DBZ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
              <p className="text-sm font-bold font-['Orbitron',sans-serif] text-purple-300 tracking-wider">
                TRANSMITIENDO DATOS A LA NAVE NODRIZA...
              </p>
              <p className="text-xs font-mono text-zinc-400">
                Sincronizando espectrometría de Ki con la base de datos de combate
              </p>
            </div>
          ) : dossier ? (
            <>
              {/* Snapshot + Quick Stats Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/80 p-3 sm:p-4 rounded-xl border border-zinc-800">
                {capturedThumb && (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-md shrink-0 relative">
                    <img
                      src={capturedThumb}
                      alt="Objetivo analizado"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-purple-900/20 mix-blend-color" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-black/80 px-1 py-0.5 rounded text-purple-300">
                      CAPTURA
                    </span>
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">ESPECIE / CLASIFICACIÓN</span>
                    <h4 className="text-base sm:text-lg font-bold text-white font-['Orbitron',sans-serif]">
                      {dossier.race}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">PODER CONFIRMADO</span>
                      <div className="text-2xl sm:text-3xl font-black font-['Share_Tech_Mono',monospace] text-emerald-400">
                        {dossier.calculatedPower.toLocaleString('es-ES')}
                      </div>
                    </div>

                    <div className="border-l border-zinc-700 pl-3">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">GRADO DE AMENAZA</span>
                      <div className="text-sm sm:text-base font-bold text-amber-400">
                        {dossier.threatLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Tactical Intel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                    <Compass className="w-3.5 h-3.5" />
                    <span>POSTURA DE COMBATE</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    {dossier.battleStance}
                  </p>
                </div>

                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Zap className="w-3.5 h-3.5" />
                    <span>TÉCNICA ESPECIAL PROBABLE</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    {dossier.specialTechnique}
                  </p>
                </div>

                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>RECOMENDACIÓN DEL RASTREADOR</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-mono">
                    {dossier.scouterAdvice}
                  </p>
                </div>
              </div>

              {/* Frieza / Commander Quote */}
              <div className="bg-gradient-to-r from-purple-950/80 to-zinc-900 p-3.5 rounded-xl border border-purple-500/40 relative">
                <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase block mb-1">
                  COMENTARIO DEL ALTO MANDO:
                </span>
                <p className="text-xs sm:text-sm italic text-purple-100 font-serif leading-relaxed">
                  "{dossier.friezaQuote}"
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 text-center py-6">
              No se pudo obtener el informe militar. Inténtalo de nuevo.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-zinc-900/80 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider font-['Orbitron',sans-serif] transition-colors"
          >
            VOLVER AL VISOR
          </button>
        </div>
      </div>
    </div>
  );
};
