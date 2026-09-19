import React, { useEffect, useRef } from 'react';
import type { DetectionResult, ScouterLensColor, TargetPhotoScanResult } from '../types';

interface ScouterHUDOverlayProps {
  detection: DetectionResult;
  lensColor: ScouterLensColor;
  isLocked: boolean;
  isOver9000: boolean;
  hasCrackedGlass: boolean;
  lockedPhotoScan?: TargetPhotoScanResult | null;
}

const COLOR_MAP: Record<ScouterLensColor, { primary: string; glow: string; secondary: string; dark: string }> = {
  green: { primary: '#00ff66', glow: 'rgba(0, 255, 102, 0.5)', secondary: '#80ffaa', dark: 'rgba(0, 40, 15, 0.8)' },
  red: { primary: '#ff2a4b', glow: 'rgba(255, 42, 75, 0.5)', secondary: '#ff8597', dark: 'rgba(50, 5, 12, 0.8)' },
  blue: { primary: '#00e5ff', glow: 'rgba(0, 229, 255, 0.5)', secondary: '#80f2ff', dark: 'rgba(0, 30, 50, 0.8)' },
  yellow: { primary: '#ffb300', glow: 'rgba(255, 179, 0, 0.5)', secondary: '#ffd980', dark: 'rgba(50, 35, 0, 0.8)' },
  purple: { primary: '#c433ff', glow: 'rgba(196, 51, 255, 0.5)', secondary: '#e299ff', dark: 'rgba(35, 0, 50, 0.8)' },
};

export const ScouterHUDOverlay: React.FC<ScouterHUDOverlayProps> = ({
  detection,
  lensColor,
  isLocked,
  hasCrackedGlass,
  lockedPhotoScan,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanPosRef = useRef<number>(0);
  const scanDirectionRef = useRef<number>(1);
  const rotAngleRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }>>([]);

  const theme = COLOR_MAP[lensColor] || COLOR_MAP.green;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Scanning sweep bar
      scanPosRef.current += 3.5 * scanDirectionRef.current;
      if (scanPosRef.current >= h) {
        scanPosRef.current = h;
        scanDirectionRef.current = -1;
      } else if (scanPosRef.current <= 0) {
        scanPosRef.current = 0;
        scanDirectionRef.current = 1;
      }

      const scanY = scanPosRef.current;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, 'rgba(0,0,0,0)');
      scanGrad.addColorStop(0.5, theme.glow);
      scanGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, Math.max(0, scanY - 20), w, 40);

      // Bright laser sweep line
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // 2. Optical Reticle / Crosshairs
      rotAngleRef.current += 0.015;
      const cx = w * 0.5;
      const cy = h * 0.5;

      // Center crosshair with rotating segmented ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotAngleRef.current);

      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 16]);
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Static crosshair center
      ctx.strokeStyle = theme.secondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy);
      ctx.lineTo(cx - 8, cy);
      ctx.moveTo(cx + 8, cy);
      ctx.lineTo(cx + 25, cy);
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx, cy - 8);
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx, cy + 25);
      ctx.stroke();

      // Center point
      ctx.fillStyle = theme.primary;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Subject Tracking Bounding Box
      const target = detection.targetBox;
      if (target) {
        const { x, y, width: bw, height: bh } = target;
        const cornerLen = Math.min(28, bw * 0.25);

        ctx.save();
        ctx.strokeStyle = isLocked ? '#ff1a40' : theme.primary;
        ctx.shadowColor = isLocked ? '#ff1a40' : theme.primary;
        ctx.shadowBlur = 10;
        ctx.lineWidth = isLocked ? 3 : 2;

        // Draw 4 distinct Sci-Fi target bracket corners
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerLen);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerLen, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + bw - cornerLen, y);
        ctx.lineTo(x + bw, y);
        ctx.lineTo(x + bw, y + cornerLen);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + bw, y + bh - cornerLen);
        ctx.lineTo(x + bw, y + bh);
        ctx.lineTo(x + bw - cornerLen, y + bh);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x + cornerLen, y + bh);
        ctx.lineTo(x, y + bh);
        ctx.lineTo(x, y + bh - cornerLen);
        ctx.stroke();

        // Target Info Tag on Box
        ctx.fillStyle = isLocked ? 'rgba(255, 20, 50, 0.85)' : theme.dark;
        ctx.fillRect(x, Math.max(10, y - 26), Math.max(160, bw * 0.65), 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 11px "Chakra Petch", monospace';
        const labelText = isLocked ? `[OBJETIVO FIJADO: ${detection.distanceMeters}m]` : `[RASTREANDO KI: ${detection.distanceMeters}m]`;
        ctx.fillText(labelText, x + 8, Math.max(26, y - 11));

        // Diagonal targeting trajectory line from center to target
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x + bw / 2, y + bh / 2);
        ctx.stroke();

        // 4. Ki Aura Energy Particles
        if (detection.auraType !== 'none' || detection.energyFlare > 25) {
          // Spawn new particles
          if (particlesRef.current.length < 40) {
            particlesRef.current.push({
              x: x + Math.random() * bw,
              y: y + bh - Math.random() * (bh * 0.5),
              vx: (Math.random() - 0.5) * 2.5,
              vy: -(Math.random() * 3 + 2),
              life: 0,
              maxLife: Math.random() * 35 + 20,
              size: Math.random() * 4 + 2,
            });
          }
        }

        ctx.restore();
      }

      // Render and update Aura particles
      if (particlesRef.current.length > 0) {
        ctx.save();
        ctx.fillStyle = detection.auraColor || theme.primary;
        ctx.shadowColor = detection.auraColor || theme.primary;
        ctx.shadowBlur = 12;

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          const alpha = 1 - p.life / p.maxLife;
          if (alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. High-tension Cracked Glass effect if scouter overloaded!
      if (hasCrackedGlass) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;

        // Draw iconic lightning web cracks radiating from top-right lens impact
        const crackOriginX = w * 0.82;
        const crackOriginY = h * 0.18;

        ctx.beginPath();
        ctx.moveTo(crackOriginX, crackOriginY);
        ctx.lineTo(crackOriginX - 70, crackOriginY + 90);
        ctx.lineTo(crackOriginX - 140, crackOriginY + 120);
        ctx.lineTo(crackOriginX - 220, crackOriginY + 170);

        ctx.moveTo(crackOriginX - 70, crackOriginY + 90);
        ctx.lineTo(crackOriginX - 85, crackOriginY + 190);
        ctx.lineTo(crackOriginX - 110, crackOriginY + 280);

        ctx.moveTo(crackOriginX, crackOriginY);
        ctx.lineTo(crackOriginX - 35, crackOriginY + 120);
        ctx.lineTo(crackOriginX + 40, crackOriginY + 210);

        ctx.moveTo(crackOriginX, crackOriginY);
        ctx.lineTo(crackOriginX - 160, crackOriginY + 40);
        ctx.lineTo(crackOriginX - 270, crackOriginY + 80);

        ctx.stroke();
        ctx.restore();
      }

      // 6. Locked Photo Morphology HUD Telemetry Readout
      if (isLocked && lockedPhotoScan) {
        ctx.save();
        const boxX = 20;
        const boxY = 65;
        const boxW = Math.min(310, w - 40);
        const isDegradedKi = lockedPhotoScan.isShort || lockedPhotoScan.isOverweight;

        // Backdrop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = isDegradedKi ? '#ff2a4b' : theme.primary;
        ctx.lineWidth = 1.5;
        ctx.fillRect(boxX, boxY, boxW, 92);
        ctx.strokeRect(boxX, boxY, boxW, 92);

        // Header
        ctx.fillStyle = isDegradedKi ? '#ff2a4b' : theme.primary;
        ctx.font = '700 10px "Orbitron", sans-serif';
        ctx.fillText('ANÁLISIS DE FOTO // BLANCO FIJADO', boxX + 10, boxY + 18);

        // Lines
        ctx.font = '700 11px "Chakra Petch", monospace';
        ctx.fillStyle = lockedPhotoScan.isFullBody ? '#00ff66' : '#ffd980';
        ctx.fillText(
          `• ENCUADRE: ${lockedPhotoScan.isFullBody ? 'CUERPO ENTERO [OK]' : 'PARCIAL'}`,
          boxX + 10,
          boxY + 36
        );

        ctx.fillStyle = lockedPhotoScan.isShort ? '#ff9900' : '#88ffaa';
        ctx.fillText(
          `• ESTATURA: ${lockedPhotoScan.isShort ? 'BAJA ESTATURA' : 'NORMAL'}`,
          boxX + 10,
          boxY + 52
        );

        ctx.fillStyle = lockedPhotoScan.isOverweight ? '#ff3344' : '#88ffaa';
        ctx.fillText(
          `• COMPLEXIÓN: ${lockedPhotoScan.isOverweight ? 'CON SOBREPESO' : 'NORMAL'}`,
          boxX + 10,
          boxY + 68
        );

        ctx.fillStyle = isDegradedKi ? '#ff2a4b' : theme.primary;
        ctx.font = '700 11px "Orbitron", sans-serif';
        ctx.fillText(
          `• NIVEL KI: ${lockedPhotoScan.calculatedPower} PL ${isDegradedKi ? '(POCO KI / RIDÍCULO)' : ''}`,
          boxX + 10,
          boxY + 84
        );

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [detection, lensColor, isLocked, hasCrackedGlass, theme, lockedPhotoScan]);

  // Adjust canvas resolution dynamically
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
        canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
