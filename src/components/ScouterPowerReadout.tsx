import React, { useEffect, useState } from 'react';
import { Target, ShieldAlert, Cpu, Camera, Flame } from 'lucide-react';
import type { DetectionResult, ScouterLensColor, TargetPhotoScanResult } from '../types';

interface ScouterPowerReadoutProps {
  detection: DetectionResult;
  lensColor: ScouterLensColor;
  isMeasuring: boolean;
  isLocked: boolean;
  displayedPower: number;
  lockedPhotoScan?: TargetPhotoScanResult | null;
  onTriggerMeasure: () => void;
  onOpenTacticalDossier: () => void;
  onOpenLockedPhotoModal?: () => void;
  onCaptureSnapshot: () => void;
  isCapturingDossier: boolean;
}

const THEME_ACCENTS: Record<ScouterLensColor, { text: string; glow: string; border: string; bg: string }> = {
  green: { text: 'text-[#00ff66]', glow: 'shadow-[#00ff66]/40', border: 'border-[#00ff66]', bg: 'bg-[#00ff66]/10' },
  red: { text: 'text-[#ff2a4b]', glow: 'shadow-[#ff2a4b]/40', border: 'border-[#ff2a4b]', bg: 'bg-[#ff2a4b]/10' },
  blue: { text: 'text-[#00e5ff]', glow: 'shadow-[#00e5ff]/40', border: 'border-[#00e5ff]', bg: 'bg-[#00e5ff]/10' },
  yellow: { text: 'text-[#ffb300]', glow: 'shadow-[#ffb300]/40', border: 'border-[#ffb300]', bg: 'bg-[#ffb300]/10' },
  purple: { text: 'text-[#c433ff]', glow: 'shadow-[#c433ff]/40', border: 'border-[#c433ff]', bg: 'bg-[#c433ff]/10' },
};

export const ScouterPowerReadout: React.FC<ScouterPowerReadoutProps> = ({
  detection,
  lensColor,
  isMeasuring,
  isLocked,
  displayedPower,
  lockedPhotoScan,
  onTriggerMeasure,
  onOpenTacticalDossier,
  onOpenLockedPhotoModal,
  onCaptureSnapshot,
  isCapturingDossier,
}) => {
  const [glitchRunes, setGlitchRunes] = useState<string>('⌖⍟⏣⎈⍝');
  const theme = THEME_ACCENTS[lensColor] || THEME_ACCENTS.green;
  const isOver9000 = displayedPower > 9000;

  // Animate alien runes during measurement or continuous live scan
  useEffect(() => {
    const interval = setInterval(() => {
      const runes = ['⌖', '⍟', '⏣', '⎈', '⍝', '⎇', '⎔', '⍚', '⟁', '⌬', '⍡', '⍢', '⏚', '⏦', '⍭'];
      let str = '';
      for (let i = 0; i < 6; i++) {
        str += runes[Math.floor(Math.random() * runes.length)];
      }
      setGlitchRunes(str);
    }, isMeasuring ? 50 : 180);

    return () => clearInterval(interval);
  }, [isMeasuring]);

  return (
    <div className="relative z-20 w-full p-3 sm:p-5 flex flex-col gap-3 pointer-events-auto">
      {/* Top Warning Banner if Over 9000 */}
      {isOver9000 && (
        <div className="w-full py-1 px-3 bg-red-600/90 text-white font-black text-center text-xs sm:text-sm tracking-widest uppercase rounded-lg shadow-lg shadow-red-600/50 border border-red-400 flex items-center justify-center gap-2 animate-bounce">
          <ShieldAlert className="w-4 h-4" />
          <span>¡ALERTA DE COMBATE: NIVEL SUPERIOR A 9,000! (IT'S OVER 9000!)</span>
          <ShieldAlert className="w-4 h-4" />
        </div>
      )}

      {/* Main Glass HUD Status Deck */}
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-stretch justify-between gap-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/15 p-3 sm:p-4 shadow-2xl">
        
        {/* Left Section: Main Power Number and Scouter Alien Glyphs */}
        <div className="flex-1 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400">NIVEL DE COMBATE (KI)</span>
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                {glitchRunes}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-mono font-semibold uppercase text-zinc-300">
                {isLocked ? 'OBJETIVO FIJADO' : isMeasuring ? 'CALCULANDO FLUX...' : 'MODO CONTINUO'}
              </span>
            </div>
          </div>

          {/* Glowing Digital Power Numerals */}
          <div className="flex items-baseline gap-2 sm:gap-3 py-1">
            <span
              className={`text-4xl sm:text-5xl md:text-6xl font-black font-['Share_Tech_Mono',monospace] tracking-wider transition-all duration-75 ${
                isOver9000 ? 'text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : `${theme.text} drop-shadow-[0_0_12px_rgba(0,255,102,0.6)]`
              }`}
            >
              {displayedPower.toLocaleString('es-ES')}
            </span>
            <span className="text-xs sm:text-sm font-black font-['Orbitron',sans-serif] tracking-widest text-zinc-400 uppercase">
              PL / RAD
            </span>
          </div>

          {/* Threat rating & Aura badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide bg-white/10 border border-white/15 text-zinc-200">
              RANGO: <strong className="text-white">{detection.threatLevel}</strong>
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide bg-zinc-900 border border-zinc-700 flex items-center gap-1 text-zinc-300">
              <Flame className="w-3 h-3" style={{ color: detection.auraColor }} />
              <span style={{ color: detection.auraColor }}>{detection.auraName}</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 text-zinc-400">
              ESTABILIDAD: {detection.energyStability}
            </span>

            {/* Quick Morphological Pill if Photo Scan was performed */}
            {lockedPhotoScan && (
              <button
                onClick={onOpenLockedPhotoModal}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-emerald-500/50"
                title="Ver informe fotográfico y morfológico"
              >
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>
                  {lockedPhotoScan.isFullBody ? 'CUERPO ENTERO' : 'PARCIAL'} | {lockedPhotoScan.isShort ? 'BAJO' : 'NORM'} | {lockedPhotoScan.isOverweight ? 'SOBREPESO' : 'ATLÉTICO'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Visual telemetry meters & Quick Actions */}
        <div className="flex flex-col justify-between gap-3 md:w-80 md:border-l md:border-white/10 md:pl-4">
          {/* Energy & Motion telemetry bars */}
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>INTENSIDAD DE AURA</span>
                <span className="font-bold text-white">{detection.energyFlare}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-150 rounded-full"
                  style={{
                    width: `${detection.energyFlare}%`,
                    backgroundColor: detection.auraColor || '#00ff66',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>ACTIVIDAD CINÉTICA</span>
                <span className="font-bold text-white">{detection.motionScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150 rounded-full"
                  style={{ width: `${detection.motionScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tactical Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {/* Lock / Take Photo Measure Button */}
            <button
              onClick={onTriggerMeasure}
              disabled={isMeasuring}
              className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-bold font-['Orbitron',sans-serif] text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                isLocked
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-black font-black shadow-emerald-600/40'
              }`}
            >
              {isLocked ? <Target className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              <span>{isLocked ? 'LIBERAR BLANCO' : isMeasuring ? 'CAPTURANDO...' : 'FIJAR Y TOMAR FOTO'}</span>
            </button>

            {/* View Locked Photo Dossier (if locked) */}
            {isLocked && lockedPhotoScan && onOpenLockedPhotoModal && (
              <button
                onClick={onOpenLockedPhotoModal}
                className="py-2 sm:py-2.5 px-2.5 rounded-xl font-bold font-['Orbitron',sans-serif] text-xs tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 flex items-center justify-center gap-1 transition-all active:scale-95"
                title="Ver análisis de la foto capturada"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">VER FOTO</span>
              </button>
            )}

            {/* Deep Scan AI Button */}
            <button
              onClick={onOpenTacticalDossier}
              disabled={isCapturingDossier}
              className="py-2 sm:py-2.5 px-3 rounded-xl font-bold font-['Orbitron',sans-serif] text-xs tracking-wider bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/50 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-950/50 active:scale-95"
              title="Informe Militar de la Organización de Freezer"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">INFORME IA</span>
            </button>

            {/* Photo Snapshot Button */}
            <button
              onClick={onCaptureSnapshot}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 flex items-center justify-center transition-all active:scale-95"
              title="Capturar foto con visor Scouter"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
