import React from 'react';
import { X, Download, ShieldCheck } from 'lucide-react';

interface ScouterSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshotUrl: string | null;
  powerLevel: number;
}

export const ScouterSnapshotModal: React.FC<ScouterSnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshotUrl,
  powerLevel,
}) => {
  if (!isOpen || !snapshotUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = snapshotUrl;
    link.download = `scouter-reading-${powerLevel}-pl.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-emerald-500/50 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold font-['Orbitron',sans-serif] text-white">
              LECTURA TÁCTICA CAPTURADA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot image container */}
        <div className="p-4 flex flex-col items-center gap-3 overflow-y-auto">
          <div className="relative rounded-xl overflow-hidden border-2 border-zinc-700 shadow-2xl max-h-[55vh]">
            <img
              src={snapshotUrl}
              alt="Scouter Snapshot"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center">
            <span className="text-xs font-mono text-zinc-400">PODER REGISTRADO POR EL RASTREADOR:</span>
            <div className="text-2xl sm:text-3xl font-black font-['Share_Tech_Mono',monospace] text-emerald-400">
              {powerLevel.toLocaleString('es-ES')} PL
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-4 bg-zinc-900/80 border-t border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
          >
            CERRAR
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs tracking-wider font-['Orbitron',sans-serif] flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            <span>DESCARGAR FOTO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
