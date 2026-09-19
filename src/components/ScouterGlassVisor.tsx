import React from 'react';
import type { ScouterLensColor } from '../types';

interface ScouterGlassVisorProps {
  lensColor: ScouterLensColor;
  isOver9000: boolean;
  hasCrackedGlass: boolean;
  children: React.ReactNode;
}

const TINT_STYLES: Record<ScouterLensColor, { bgTint: string; borderGlow: string; ambientGlow: string }> = {
  green: {
    bgTint: 'rgba(0, 45, 15, 0.28)',
    borderGlow: 'rgba(0, 255, 102, 0.65)',
    ambientGlow: 'rgba(0, 255, 102, 0.15)',
  },
  red: {
    bgTint: 'rgba(60, 5, 12, 0.32)',
    borderGlow: 'rgba(255, 42, 75, 0.75)',
    ambientGlow: 'rgba(255, 42, 75, 0.2)',
  },
  blue: {
    bgTint: 'rgba(0, 30, 55, 0.3)',
    borderGlow: 'rgba(0, 229, 255, 0.65)',
    ambientGlow: 'rgba(0, 229, 255, 0.15)',
  },
  yellow: {
    bgTint: 'rgba(55, 40, 0, 0.28)',
    borderGlow: 'rgba(255, 179, 0, 0.65)',
    ambientGlow: 'rgba(255, 179, 0, 0.15)',
  },
  purple: {
    bgTint: 'rgba(45, 5, 55, 0.3)',
    borderGlow: 'rgba(196, 51, 255, 0.65)',
    ambientGlow: 'rgba(196, 51, 255, 0.15)',
  },
};

export const ScouterGlassVisor: React.FC<ScouterGlassVisorProps> = ({
  lensColor,
  isOver9000,
  children,
}) => {
  const currentTint = TINT_STYLES[lensColor] || TINT_STYLES.green;

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      {/* Outer Headset frame border & curve */}
      <div
        className={`relative w-full h-full flex flex-col transition-all duration-300 ${
          isOver9000 ? 'animate-pulse' : ''
        }`}
        style={{
          boxShadow: `inset 0 0 100px ${currentTint.ambientGlow}`,
        }}
      >
        {/* The Camera Feed / Video layer */}
        <div className="absolute inset-0 w-full h-full z-0">{children}</div>

        {/* Optical Glass Color Tint Filter */}
        <div
          className="absolute inset-0 pointer-events-none z-1 transition-colors duration-300 mix-blend-multiply"
          style={{ backgroundColor: currentTint.bgTint }}
        />

        {/* Secondary optical color grading */}
        <div
          className="absolute inset-0 pointer-events-none z-1 transition-colors duration-300 opacity-25"
          style={{ backgroundColor: currentTint.borderGlow }}
        />

        {/* Authentic DBZ Scouter Curved Eyepiece Outer Outline Mask */}
        <div
          className="absolute inset-2 sm:inset-4 md:inset-6 pointer-events-none z-2 rounded-[28px] border-2 transition-all duration-300"
          style={{
            borderColor: currentTint.borderGlow,
            boxShadow: `0 0 25px ${currentTint.borderGlow}, inset 0 0 35px ${currentTint.ambientGlow}`,
          }}
        >
          {/* Eyepiece corner telemetry markers */}
          <div className="absolute top-2 left-3 text-[9px] font-mono tracking-widest text-white/70">
            [FRIEZA-CORP // SCOUTER-T74]
          </div>
          <div className="absolute top-2 right-3 text-[9px] font-mono tracking-widest text-white/70">
            FREQ: 984.2 GHz [LENS-CALIB]
          </div>
          <div className="absolute bottom-2 left-3 text-[9px] font-mono tracking-widest text-white/70">
            OPTICAL FLUX: 99.8%
          </div>
          <div className="absolute bottom-2 right-3 text-[9px] font-mono tracking-widest text-white/70">
            SENS: MAX
          </div>
        </div>

        {/* CRT Scanline & Micro-Grid effect */}
        <div
          className="absolute inset-0 pointer-events-none z-2 opacity-35"
          style={{
            backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))`,
            backgroundSize: '100% 3px, 4px 100%',
          }}
        />

        {/* Glass reflection gradient highlight (glossy lens curve) */}
        <div
          className="absolute inset-0 pointer-events-none z-2 opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.15) 100%)',
          }}
        />

        {/* Mechanical Scouter Ear-Mount Bracket styling on the left edge */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-5 h-28 sm:h-36 bg-gradient-to-r from-zinc-900 to-zinc-700 rounded-r-xl border-y-2 border-r-2 border-zinc-500 shadow-xl z-20 pointer-events-none flex flex-col items-center justify-around py-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <div className="w-1.5 h-6 rounded-full bg-zinc-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        </div>

        {/* Overload / Over 9000 flashing warning frame */}
        {isOver9000 && (
          <div className="absolute inset-0 pointer-events-none z-10 border-4 border-red-500/80 animate-ping opacity-30" />
        )}
      </div>
    </div>
  );
};
