export type ScouterLensColor = 'green' | 'red' | 'blue' | 'yellow' | 'purple';

export interface BoundingTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label?: string;
}

export interface ColorStats {
  r: number;
  g: number;
  b: number;
  hex: string;
  name: string;
  brightness: number;
  isWarm: boolean;
  saturation: number;
}

export interface DetectionResult {
  powerLevel: number;
  isOver9000: boolean;
  isOverload: boolean;
  auraType: 'none' | 'golden' | 'blue' | 'crimson' | 'emerald' | 'dark_purple';
  auraName: string;
  auraColor: string;
  threatLevel: 'Insignificante' | 'Humano Normal' | 'Soldado Frieza' | 'Guerrero Élite' | 'Amenaza Planetaria' | 'Deidad / Dios';
  energyStability: 'Estable' | 'En Aumento (Carga de Ki)' | 'Fluctuación Crítica' | 'Ki Divino Suprimido';
  targetBox: BoundingTarget | null;
  colorStats: ColorStats;
  motionScore: number;
  energyFlare: number;
  scouterRunes: string;
  distanceMeters: number;
}

export interface DeepScanResult {
  race: string;
  calculatedPower: number;
  threatLevel: string;
  battleStance: string;
  kiAura: string;
  specialTechnique: string;
  scouterAdvice: string;
  isOver9000: boolean;
  friezaQuote: string;
}

export interface PresetWarrior {
  id: string;
  name: string;
  race: string;
  canonicalPower: number;
  auraColor: string;
  image: string;
  quote: string;
}

export interface TargetPhotoScanResult {
  isFullBody: boolean;
  framingType: 'cuerpo_entero' | 'medio_cuerpo' | 'primer_plano' | 'desconocido';
  framingDescription: string;
  isShort: boolean;
  isOverweight: boolean;
  statureDescription: string;
  buildDescription: string;
  calculatedPower: number;
  threatLevel: string;
  scouterAlert: string;
  diagnosticMessage: string;
  photoUrl?: string;
  capturedAt?: string;
}
