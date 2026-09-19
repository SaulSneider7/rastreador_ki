import React from 'react';
import type { TargetPhotoScanResult, ScouterLensColor } from '../types';
import { CheckCircle2, AlertTriangle, X, Download, RotateCcw, User } from 'lucide-react';

interface LockedTargetPhotoCardProps {
  scanResult: TargetPhotoScanResult | null;
  lensColor: ScouterLensColor;
  isScanning: boolean;
  onClose: () => void;
  onRetakePhoto: () => void;
  onDownloadPhoto?: () => void;
}

export const LockedTargetPhotoCard: React.FC<LockedTargetPhotoCardProps> = ({
  scanResult,
  isScanning,
  onClose,
  onRetakePhoto,
  onDownloadPhoto,
}) => {
  if (!scanResult && !isScanning) return null;

  const isShortOrOverweight = scanResult?.isShort || scanResult?.isOverweight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-zinc-950 border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-emerald-950/60 p-4 sm:p-6 text-white flex flex-col gap-4 font-['Chakra_Petch',sans-serif]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <h3 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-white tracking-wider">
                BLANCO FIJADO // FOTO DE COMBATE
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                TELEMETRÍA MORFOLÓGICA Y DETECCIÓN DE KI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isScanning && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <span className="font-['Orbitron',sans-serif] font-bold text-emerald-400 tracking-widest text-sm">
              PROCESANDO CAPTURA Y MORFOLOGÍA...
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Verificando encuadre (cuerpo entero), estatura, masa corporal y flujo de Ki...
            </span>
          </div>
        )}

        {/* Scanned Result Content */}
        {!isScanning && scanResult && (
          <div className="flex flex-col gap-4">
            {/* Warning Alert if Short or Overweight with Low Ki */}
            {isShortOrOverweight && (
              <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/70 text-amber-200 flex items-start gap-2.5 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs uppercase tracking-wide text-amber-300 block">
                    {scanResult.scouterAlert || '¡SUJETO DE BAJA ESTATURA O SOBREPESO DETECTADO!'}
                  </span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    El Rastreador confirma masa corporal no apta para combate de alta velocidad. Flujo de Ki calificado como <strong>insignificante ({scanResult.calculatedPower} PL)</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Photo & Morphological Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Photo Preview with HUD Frame */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center">
                {scanResult.photoUrl ? (
                  <img
                    src={scanResult.photoUrl}
                    alt="Blanco fijado"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500">
                    <User className="w-10 h-10" />
                    <span className="text-xs">Foto fijada</span>
                  </div>
                )}

                {/* Scouter HUD reticle burned onto preview */}
                <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/40 m-2 rounded-lg flex flex-col justify-between p-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-emerald-300 bg-black/50 px-1 rounded">
                    <span>LOCKED TARGET</span>
                    <span>{scanResult.capturedAt || '00:00:00'}</span>
                  </div>
                  <div className="self-end text-[9px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded text-red-400 border border-red-500/40">
                    KI: {scanResult.calculatedPower} PL
                  </div>
                </div>
              </div>

              {/* Badges Breakdown */}
              <div className="flex flex-col gap-2">
                {/* 1. Framing Badge (Cuerpo Entero) */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  scanResult.isFullBody
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${scanResult.isFullBody ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block">ENCUADRE:</span>
                      <strong className="text-xs font-bold font-['Orbitron',sans-serif]">
                        {scanResult.isFullBody ? 'CUERPO ENTERO' : scanResult.framingType === 'medio_cuerpo' ? 'PLANO MEDIO' : 'PRIMER PLANO'}
                      </strong>
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    scanResult.isFullBody ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {scanResult.isFullBody ? 'CONFIRMADO' : 'PARCIAL'}
                  </span>
                </div>

                {/* 2. Stature Badge (Baja estatura) */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  scanResult.isShort
                    ? 'bg-red-950/40 border-red-500/60 text-red-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">ESTATURA ESTIMADA:</span>
                    <strong className="text-xs font-bold font-['Orbitron',sans-serif]">
                      {scanResult.isShort ? 'PERSONA BAJA' : 'ESTATURA NORMAL'}
                    </strong>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    scanResult.isShort ? 'bg-red-500/20 text-red-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {scanResult.isShort ? 'BAJA ESTATURA' : 'ESTÁNDAR'}
                  </span>
                </div>

                {/* 3. Weight/Build Badge (Sobrepeso) */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  scanResult.isOverweight
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">COMPLEXIÓN / PESO:</span>
                    <strong className="text-xs font-bold font-['Orbitron',sans-serif]">
                      {scanResult.isOverweight ? 'CON SOBREPESO' : 'COMPLEXIÓN NORMAL'}
                    </strong>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    scanResult.isOverweight ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {scanResult.isOverweight ? 'SOBREPESO' : 'ATLÉTICO'}
                  </span>
                </div>

                {/* 4. Power Level (Poco Ki) */}
                <div className="p-2.5 rounded-xl bg-black border border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block">FUERZA DE PELEA (KI):</span>
                    <strong className="text-sm font-['Orbitron',sans-serif] text-emerald-400 font-black">
                      {scanResult.calculatedPower} PL
                    </strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-800 text-red-400 border border-red-500/30">
                    {scanResult.calculatedPower <= 10 ? 'POCO NIVEL DE KI' : 'NIVEL ESTÁNDAR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Commentary from the Scouter */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                DIAGNÓSTICO TÁCTICO DEL RASTREADOR:
              </span>
              <p className="text-xs font-mono text-zinc-200 leading-relaxed italic">
                "{scanResult.diagnosticMessage}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onRetakePhoto}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold font-['Orbitron',sans-serif] text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>REPETIR FOTO</span>
              </button>

              {onDownloadPhoto && (
                <button
                  onClick={onDownloadPhoto}
                  className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold font-['Orbitron',sans-serif] text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Descargar foto con visor"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">DESCARGAR FOTO</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold font-['Orbitron',sans-serif] text-xs transition-colors"
              >
                ACEPTAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
