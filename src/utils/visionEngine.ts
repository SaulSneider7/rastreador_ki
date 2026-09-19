import type { BoundingTarget, ColorStats, DetectionResult } from '../types';

// Saiyan / Frieza Force digital scouter runes
const SCOUTER_GLYPHS = ['⌖', '⍟', '⏣', '⎈', '⍝', '⎇', '⎔', '⍚', '⟁', '⌬', '⍡', '⍢', '⏚', '⏦', '⍭'];

export class ScouterVisionEngine {
  private prevFrameData: Uint8ClampedArray | null = null;
  private faceDetector: any = null;
  private smoothedTarget: BoundingTarget | null = null;
  private sampleCanvas: HTMLCanvasElement;
  private sampleCtx: CanvasRenderingContext2D | null;

  constructor() {
    this.sampleCanvas = document.createElement('canvas');
    this.sampleCanvas.width = 160;
    this.sampleCanvas.height = 120;
    this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

    // Initialize experimental native FaceDetector if browser supports it
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        this.faceDetector = new (window as any).FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        });
      } catch (e) {
        this.faceDetector = null;
      }
    }
  }

  public getRandomRunes(length: number = 5): string {
    let res = '';
    for (let i = 0; i < length; i++) {
      res += SCOUTER_GLYPHS[Math.floor(Math.random() * SCOUTER_GLYPHS.length)];
    }
    return res;
  }

  /**
   * Process a single video or image frame and output real-time Dragon Ball Z Scouter metrics
   */
  public async analyzeFrame(
    sourceElement: HTMLVideoElement | HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<DetectionResult> {
    if (!this.sampleCtx) {
      return this.getDefaultResult();
    }

    const sw = this.sampleCanvas.width;
    const sh = this.sampleCanvas.height;

    // Draw downsampled frame for fast 60fps computer vision processing
    this.sampleCtx.drawImage(sourceElement, 0, 0, sw, sh);
    const frame = this.sampleCtx.getImageData(0, 0, sw, sh);
    const data = frame.data;

    // 1. Motion & Kinetic activity detection
    let motionDelta = 0;
    if (this.prevFrameData && this.prevFrameData.length === data.length) {
      let sampleDiffSum = 0;
      const step = 4 * 4; // Sub-sample pixels for speed
      for (let i = 0; i < data.length; i += step) {
        const diff = Math.abs(data[i] - this.prevFrameData[i]) +
                     Math.abs(data[i + 1] - this.prevFrameData[i + 1]) +
                     Math.abs(data[i + 2] - this.prevFrameData[i + 2]);
        if (diff > 45) {
          sampleDiffSum += diff;
        }
      }
      motionDelta = Math.min(100, Math.floor((sampleDiffSum / (data.length / step)) * 1.5));
    }
    this.prevFrameData = new Uint8ClampedArray(data);

    // 2. Color spectrum & Dominant tones
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let totalLuminance = 0;

    // Center focal region for subject Ki analysis (central 50% box)
    const startX = Math.floor(sw * 0.25);
    const endX = Math.floor(sw * 0.75);
    const startY = Math.floor(sh * 0.2);
    const endY = Math.floor(sh * 0.8);
    let focalCount = 0;

    // Color bins
    let goldenEnergy = 0;
    let cyanBlueEnergy = 0;
    let crimsonRedEnergy = 0;
    let emeraldGreenEnergy = 0;
    let violetPurpleEnergy = 0;

    // Centroid of brightness/interest tracking
    let weightedX = 0;
    let weightedY = 0;
    let totalWeight = 0;

    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const idx = (y * sw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        totalR += r;
        totalG += g;
        totalB += b;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        focalCount++;

        // Calculate HSV
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max / 255;

        if (d !== 0) {
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          else if (max === g) h = ((b - r) / d + 2) * 60;
          else h = ((r - g) / d + 4) * 60;
        }

        // Weight tracking for center of mass
        const weight = lum * (s * 1.5 + 0.5);
        if (weight > 70) {
          weightedX += x * weight;
          weightedY += y * weight;
          totalWeight += weight;
        }

        // Aura identification
        if (s > 0.35 && v > 0.4) {
          if (h >= 35 && h <= 65) {
            goldenEnergy += 1.5; // Super Saiyan Golden Aura
          } else if (h >= 175 && h <= 220) {
            cyanBlueEnergy += 1.4; // SSJ Blue / God Ki
          } else if (h <= 18 || h >= 340) {
            crimsonRedEnergy += 1.3; // Kaioken / Destruction
          } else if (h >= 90 && h <= 150) {
            emeraldGreenEnergy += 1.2; // Legendary / Broly / Namek
          } else if (h >= 265 && h <= 315) {
            violetPurpleEnergy += 1.3; // Majin / Beerus
          }
        }
      }
    }

    const avgR = focalCount ? Math.round(totalR / focalCount) : 120;
    const avgG = focalCount ? Math.round(totalG / focalCount) : 120;
    const avgB = focalCount ? Math.round(totalB / focalCount) : 120;
    const avgLum = focalCount ? Math.round(totalLuminance / focalCount) : 120;

    const hexColor = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
    const maxAuraScore = Math.max(
      goldenEnergy,
      cyanBlueEnergy,
      crimsonRedEnergy,
      emeraldGreenEnergy,
      violetPurpleEnergy
    );

    let auraType: DetectionResult['auraType'] = 'none';
    let auraName = 'Ki Terrestre Estándar';
    let auraColor = '#00ff66';
    let auraBonusMultiplier = 1.0;

    if (maxAuraScore > 18) {
      if (maxAuraScore === goldenEnergy) {
        auraType = 'golden';
        auraName = 'AURA DORADA (SUPER SAIYAJIN)';
        auraColor = '#ffd700';
        auraBonusMultiplier = 12.5;
      } else if (maxAuraScore === cyanBlueEnergy) {
        auraType = 'blue';
        auraName = 'KI DIVINO AZUL (SSJ BLUE / DIOS)';
        auraColor = '#00d0ff';
        auraBonusMultiplier = 28.0;
      } else if (maxAuraScore === crimsonRedEnergy) {
        auraType = 'crimson';
        auraName = 'AURA CARMESÍ (KAIOKEN / HAKAI)';
        auraColor = '#ff2244';
        auraBonusMultiplier = 8.5;
      } else if (maxAuraScore === emeraldGreenEnergy) {
        auraType = 'emerald';
        auraName = 'KI VERDE MUTANTE (LEGENDARIO / NAMEK)';
        auraColor = '#22ff66';
        auraBonusMultiplier = 15.0;
      } else if (maxAuraScore === violetPurpleEnergy) {
        auraType = 'dark_purple';
        auraName = 'KI OSCURO DESTRUCTOR (MAJIN / FREEZER)';
        auraColor = '#c422ff';
        auraBonusMultiplier = 18.0;
      }
    }

    // 3. Subject Tracking / Target Bounding Box
    let rawTarget: BoundingTarget | null = null;

    // Check Native FaceDetector first
    if (this.faceDetector && sourceElement instanceof HTMLVideoElement) {
      try {
        const faces = await this.faceDetector.detect(sourceElement);
        if (faces && faces.length > 0) {
          const face = faces[0].boundingBox;
          rawTarget = {
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height,
            confidence: 0.95,
            label: 'GUERRERO IDENTIFICADO',
          };
        }
      } catch (e) {
        // Fallback to optical centroid
      }
    }

    // Fallback to luminosity/contrast centroid
    if (!rawTarget) {
      if (totalWeight > 1000) {
        const cx = (weightedX / totalWeight / sw) * canvasWidth;
        const cy = (weightedY / totalWeight / sh) * canvasHeight;
        const bw = Math.max(140, Math.min(canvasWidth * 0.5, canvasWidth * 0.35));
        const bh = Math.max(160, Math.min(canvasHeight * 0.6, canvasHeight * 0.45));

        rawTarget = {
          x: Math.max(20, cx - bw / 2),
          y: Math.max(20, cy - bh / 2),
          width: bw,
          height: bh,
          confidence: 0.82,
          label: 'FOCO DE KI DETECTADO',
        };
      } else {
        // Center default target
        const bw = canvasWidth * 0.38;
        const bh = canvasHeight * 0.48;
        rawTarget = {
          x: (canvasWidth - bw) / 2,
          y: (canvasHeight - bh) / 2,
          width: bw,
          height: bh,
          confidence: 0.6,
          label: 'RASTREANDO SECTOR',
        };
      }
    }

    // Smooth bounding box coordinates using exponential smoothing
    if (!this.smoothedTarget) {
      this.smoothedTarget = { ...rawTarget };
    } else {
      const alpha = 0.22;
      this.smoothedTarget.x += (rawTarget.x - this.smoothedTarget.x) * alpha;
      this.smoothedTarget.y += (rawTarget.y - this.smoothedTarget.y) * alpha;
      this.smoothedTarget.width += (rawTarget.width - this.smoothedTarget.width) * alpha;
      this.smoothedTarget.height += (rawTarget.height - this.smoothedTarget.height) * alpha;
      this.smoothedTarget.confidence = rawTarget.confidence;
      this.smoothedTarget.label = rawTarget.label;
    }

    // Distance estimation: target relative size to screen height
    const heightRatio = this.smoothedTarget.height / Math.max(1, canvasHeight);
    const distanceMeters = Math.max(1.2, Number((2.8 / Math.max(0.15, heightRatio)).toFixed(1)));

    // 4. Power Level Calculation Formula
    // Base power determined by image contrast and brightness
    const baseEnergy = Math.max(5, Math.floor(avgLum * 1.8));
    // Motion adds surging Ki!
    const motionMultiplier = 1.0 + (motionDelta / 100) * 3.5;
    // Target proximity (closer targets emit stronger measured flux)
    const proximityMultiplier = Math.min(3.0, 1.0 + (heightRatio * 1.8));

    let rawCalculatedPower = Math.floor(
      baseEnergy * proximityMultiplier * motionMultiplier * auraBonusMultiplier
    );

    // Micro-fluctuation to give the authentic scouter number twitching effect
    const jitter = Math.floor(Math.random() * 19 - 9);
    rawCalculatedPower = Math.max(5, rawCalculatedPower + jitter);

    // Determine Threat Level & Stability
    let threatLevel: DetectionResult['threatLevel'] = 'Humano Normal';
    if (rawCalculatedPower < 50) {
      threatLevel = 'Insignificante';
    } else if (rawCalculatedPower < 1000) {
      threatLevel = 'Humano Normal';
    } else if (rawCalculatedPower < 4000) {
      threatLevel = 'Soldado Frieza';
    } else if (rawCalculatedPower < 20000) {
      threatLevel = 'Guerrero Élite';
    } else if (rawCalculatedPower < 500000) {
      threatLevel = 'Amenaza Planetaria';
    } else {
      threatLevel = 'Deidad / Dios';
    }

    let energyStability: DetectionResult['energyStability'] = 'Estable';
    if (motionDelta > 40) {
      energyStability = 'En Aumento (Carga de Ki)';
    } else if (rawCalculatedPower > 9000) {
      energyStability = 'Fluctuación Crítica';
    } else if (auraType === 'blue') {
      energyStability = 'Ki Divino Suprimido';
    }

    const colorStats: ColorStats = {
      r: avgR,
      g: avgG,
      b: avgB,
      hex: hexColor,
      name: auraName,
      brightness: Math.round((avgLum / 255) * 100),
      isWarm: avgR > avgB,
      saturation: Math.round(Math.min(100, maxAuraScore * 2)),
    };

    return {
      powerLevel: rawCalculatedPower,
      isOver9000: rawCalculatedPower > 9000,
      isOverload: rawCalculatedPower > 750000,
      auraType,
      auraName,
      auraColor,
      threatLevel,
      energyStability,
      targetBox: { ...this.smoothedTarget },
      colorStats,
      motionScore: motionDelta,
      energyFlare: Math.min(100, Math.floor(motionDelta * 0.7 + maxAuraScore * 1.2)),
      scouterRunes: this.getRandomRunes(5),
      distanceMeters,
    };
  }

  private getDefaultResult(): DetectionResult {
    return {
      powerLevel: 5,
      isOver9000: false,
      isOverload: false,
      auraType: 'none',
      auraName: 'Ki Terrestre Estándar',
      auraColor: '#00ff66',
      threatLevel: 'Insignificante',
      energyStability: 'Estable',
      targetBox: null,
      colorStats: {
        r: 100,
        g: 100,
        b: 100,
        hex: '#646464',
        name: 'Sin datos',
        brightness: 50,
        isWarm: false,
        saturation: 10,
      },
      motionScore: 0,
      energyFlare: 0,
      scouterRunes: '⌖⍟⏣⎈⍝',
      distanceMeters: 3.5,
    };
  }
}

export const scouterVision = new ScouterVisionEngine();
