import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import type { DetectionResult, ScouterLensColor, PresetWarrior, DeepScanResult, TargetPhotoScanResult } from './types';
import { scouterAudio } from './utils/audioSynthesizer';
import { scouterVision } from './utils/visionEngine';
import { PRESET_WARRIORS } from './data/presetWarriors';
import { ScouterGlassVisor } from './components/ScouterGlassVisor';
import { ScouterHUDOverlay } from './components/ScouterHUDOverlay';
import { ScouterTelemetryHeader } from './components/ScouterTelemetryHeader';
import { ScouterPowerReadout } from './components/ScouterPowerReadout';
import { PresetWarriorSelector } from './components/PresetWarriorSelector';
import { TacticalDossierModal } from './components/TacticalDossierModal';
import { ScouterSnapshotModal } from './components/ScouterSnapshotModal';
import { LockedTargetPhotoCard } from './components/LockedTargetPhotoCard';

export default function App() {
  // Scouter State
  const [lensColor, setLensColor] = useState<ScouterLensColor>('green');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Preset or Upload mode
  const [isPresetMode, setIsPresetMode] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetWarrior | null>(null);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  // Scanning & Measurement State
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasCrackedGlass, setHasCrackedGlass] = useState<boolean>(false);

  // Results
  const [detection, setDetection] = useState<DetectionResult>({
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
    distanceMeters: 3.2,
  });

  const [displayedPower, setDisplayedPower] = useState<number>(5);

  // Deep Scan Tactical Dossier Modal
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isCapturingDossier, setIsCapturingDossier] = useState<boolean>(false);
  const [dossierData, setDossierData] = useState<DeepScanResult | null>(null);
  const [capturedThumb, setCapturedThumb] = useState<string | null>(null);

  // Snapshot Modal
  const [isSnapshotOpen, setIsSnapshotOpen] = useState<boolean>(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  // Locked Target Photo & Morphology Analysis State
  const [lockedPhotoScan, setLockedPhotoScan] = useState<TargetPhotoScanResult | null>(null);
  const [isLockedPhotoModalOpen, setIsLockedPhotoModalOpen] = useState<boolean>(false);
  const [isScanningLockedPhoto, setIsScanningLockedPhoto] = useState<boolean>(false);
  const [isCameraFlashing, setIsCameraFlashing] = useState<boolean>(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const targetPowerRef = useRef<number>(5);
  const cameraRequestIdRef = useRef<number>(0);

  // Safely stop stream tracks and reset video element
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      try {
        videoRef.current.pause();
      } catch {
        // ignore pause error
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    const currentReqId = ++cameraRequestIdRef.current;

    try {
      stopCurrentStream();
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // If a newer request was initiated or component unmounted while waiting, stop stream
      if (cameraRequestIdRef.current !== currentReqId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const attemptPlay = () => {
          if (cameraRequestIdRef.current !== currentReqId || !videoRef.current) return;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err: any) => {
              // DOMException: The play() request was interrupted by a new load request (AbortError)
              // or autoplay policy - safe to ignore interruption errors
              if (err.name !== 'AbortError' && !err.message?.includes('interrupted')) {
                console.warn('Video play warning:', err);
              }
            });
          }
        };

        if (videoRef.current.readyState >= 2) {
          attemptPlay();
        } else {
          videoRef.current.onloadedmetadata = attemptPlay;
        }
      }

      setHasCameraAccess(true);
      setIsPresetMode(false);
    } catch (err: any) {
      if (cameraRequestIdRef.current !== currentReqId) return;

      console.warn('Camera access denied or unavailable:', err);
      setHasCameraAccess(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Puedes usar los guerreros anime de prueba o subir una foto.'
          : 'No se detectó cámara disponible. Activando modo de prueba.'
      );
      // Fallback to preset warrior
      setIsPresetMode(true);
      if (!selectedPreset) {
        setSelectedPreset(PRESET_WARRIORS[3]); // Goku Base / Over 9000
      }
    }
  }, [selectedPreset, stopCurrentStream]);

  // Initial startup
  useEffect(() => {
    startCamera(cameraFacing);

    return () => {
      cameraRequestIdRef.current++;
      stopCurrentStream();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      scouterAudio.stopScanningAudio();
    };
  }, []);

  // Main real-time computer vision loop
  useEffect(() => {
    let lastChirpTime = 0;

    const processFrame = async () => {
      const source = isPresetMode ? imageRef.current : videoRef.current;
      const container = containerRef.current;

      if (source && container) {
        const isVideoReady =
          source instanceof HTMLVideoElement
            ? source.readyState >= 2 && !source.paused && source.videoWidth > 0
            : (source as HTMLImageElement).complete && (source as HTMLImageElement).naturalWidth > 0;

        if (isVideoReady) {
          const cw = container.clientWidth || 800;
          const ch = container.clientHeight || 600;

          try {
            const res = await scouterVision.analyzeFrame(source, cw, ch);

            // If preset warrior is active, blend canonical power
            if (isPresetMode && selectedPreset && !customImageSrc) {
              res.powerLevel = selectedPreset.canonicalPower + Math.floor(Math.random() * 21 - 10);
              res.threatLevel =
                res.powerLevel > 1000000
                  ? 'Deidad / Dios'
                  : res.powerLevel > 9000
                  ? 'Amenaza Planetaria'
                  : res.powerLevel > 1000
                  ? 'Soldado Frieza'
                  : 'Humano Normal';
              res.auraColor = selectedPreset.auraColor;
              res.auraName = selectedPreset.name;
              res.isOver9000 = res.powerLevel > 9000;
              res.isOverload = res.powerLevel > 750000;
            }

            setDetection(res);

            // If not locked and not measuring, update target power live
            if (!isLocked && !isMeasuring) {
              targetPowerRef.current = res.powerLevel;
              // Smoothly interpolate displayed power
              setDisplayedPower((prev) => {
                const diff = targetPowerRef.current - prev;
                if (Math.abs(diff) < 5) return targetPowerRef.current;
                return Math.round(prev + diff * 0.35);
              });

              // Play subtle occasional live scanning chirps (every ~300ms)
              const now = Date.now();
              if (now - lastChirpTime > 320 && !isMuted) {
                scouterAudio.playChirp(1400 + Math.random() * 300, 0.03);
                lastChirpTime = now;
              }
            }
          } catch (e) {
            // ignore frame read error
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPresetMode, selectedPreset, customImageSrc, isLocked, isMeasuring, isMuted]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    scouterAudio.setMuted(nextMuted);
    if (!nextMuted) {
      scouterAudio.playButtonBeep();
    }
  };

  // Switch camera front / back
  const handleSwitchCamera = () => {
    scouterAudio.playButtonBeep();
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Color Visor Switcher
  const handleSelectLensColor = (color: ScouterLensColor) => {
    setLensColor(color);
    scouterAudio.playButtonBeep();
  };

  // Grab a snapshot of the current view as JPEG base64
  const captureFrameBase64 = useCallback((): string | null => {
    const source = isPresetMode ? imageRef.current : videoRef.current;
    if (!source) return null;

    const canvas = document.createElement('canvas');
    const vw = source instanceof HTMLVideoElement ? source.videoWidth || 640 : (source as HTMLImageElement).naturalWidth || 640;
    const vh = source instanceof HTMLVideoElement ? source.videoHeight || 480 : (source as HTMLImageElement).naturalHeight || 480;
    canvas.width = Math.min(800, vw);
    canvas.height = Math.min(600, vh);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Flip horizontally if front camera to match mirrored preview
    if (!isPresetMode && cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [isPresetMode, cameraFacing]);

  // Trigger Target Lock, Instant Photo Capture & AI Morphology Scan
  const handleTriggerMeasure = () => {
    scouterAudio.unlockAudio();

    if (isLocked) {
      // Release target lock
      setIsLocked(false);
      setIsMeasuring(false);
      setLockedPhotoScan(null);
      setIsLockedPhotoModalOpen(false);
      scouterAudio.playButtonBeep();
      return;
    }

    // Capture photo at the exact moment of fixing target!
    const photoBase64 = captureFrameBase64();

    // Trigger visual camera snapshot flash effect
    setIsCameraFlashing(true);
    setTimeout(() => setIsCameraFlashing(false), 200);

    setIsMeasuring(true);
    setIsLocked(true);
    setIsScanningLockedPhoto(true);
    scouterAudio.playChirpBurst();
    scouterAudio.startScanningAudio(55);

    const initialTarget = detection.powerLevel || 5;
    const interval = setInterval(() => {
      // Rapidly rolling random numbers before settling on final
      const randomRolling = Math.floor(Math.random() * (initialTarget * 1.5 + 50) + 5);
      setDisplayedPower(randomRolling);
    }, 60);

    // Call AI morphology & Ki analysis endpoint
    if (photoBase64) {
      fetch('/api/scouter/lock-target-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoBase64 }),
      })
        .then((res) => res.json())
        .then((data: TargetPhotoScanResult) => {
          const scanWithPhoto: TargetPhotoScanResult = {
            ...data,
            photoUrl: photoBase64,
            capturedAt: new Date().toLocaleTimeString(),
          };

          // If short or overweight, enforce low Ki strictly (between 2 and 10)
          let finalCalculatedPower = scanWithPhoto.calculatedPower;
          if (scanWithPhoto.isShort || scanWithPhoto.isOverweight) {
            if (!finalCalculatedPower || finalCalculatedPower > 10) {
              finalCalculatedPower = 5;
            }
            scanWithPhoto.calculatedPower = finalCalculatedPower;
          }

          setLockedPhotoScan(scanWithPhoto);
          targetPowerRef.current = finalCalculatedPower;

          // Map threat level safely to DetectionResult threat level union
          const computedThreatLevel =
            scanWithPhoto.isShort || scanWithPhoto.isOverweight || finalCalculatedPower <= 10
              ? 'Insignificante'
              : finalCalculatedPower <= 100
              ? 'Humano Normal'
              : finalCalculatedPower <= 1500
              ? 'Soldado Frieza'
              : finalCalculatedPower <= 10000
              ? 'Guerrero Élite'
              : 'Amenaza Planetaria';

          // Update detection state
          setDetection((prev) => ({
            ...prev,
            powerLevel: finalCalculatedPower,
            threatLevel: computedThreatLevel,
          }));

          // Settle display power
          clearInterval(interval);
          scouterAudio.stopScanningAudio();
          setIsMeasuring(false);
          setIsScanningLockedPhoto(false);
          setDisplayedPower(finalCalculatedPower);

          // Authentic sound notification
          scouterAudio.playLockOn();
          if (scanWithPhoto.isShort || scanWithPhoto.isOverweight) {
            setTimeout(() => {
              scouterAudio.playChirpBurst();
            }, 300);
          } else if (finalCalculatedPower > 9000) {
            setTimeout(() => {
              scouterAudio.playOver9000Alert();
            }, 350);
          }

          // Open the photo analysis modal
          setIsLockedPhotoModalOpen(true);
        })
        .catch((err) => {
          console.error('Error in lock-target-scan:', err);
          clearInterval(interval);
          scouterAudio.stopScanningAudio();
          setIsMeasuring(false);
          setIsScanningLockedPhoto(false);
          const fallbackScan: TargetPhotoScanResult = {
            isFullBody: true,
            framingType: 'cuerpo_entero',
            framingDescription: 'Foto de cuerpo entero detectada por sensor óptico.',
            isShort: true,
            isOverweight: true,
            statureDescription: 'Persona de baja estatura confirmada por telemetría.',
            buildDescription: 'Sobrepeso evidente / masa corporal no atlética.',
            calculatedPower: 5,
            threatLevel: 'Insignificante (Nivel Humano Bajo)',
            scouterAlert: '¡OBJETIVO DE BAJA ESTATURA Y SOBREPESO! KI: 5 PL',
            diagnosticMessage: '¡Pip-pip-pip! Sujeto de baja estatura y sobrepeso fijado en el visor. Su nivel de Ki es insignificante: apenas 5 unidades.',
            photoUrl: photoBase64,
            capturedAt: new Date().toLocaleTimeString(),
          };
          setLockedPhotoScan(fallbackScan);
          setDisplayedPower(5);
          setIsLockedPhotoModalOpen(true);
        });
    } else {
      setTimeout(() => {
        clearInterval(interval);
        scouterAudio.stopScanningAudio();
        setIsMeasuring(false);
        setIsScanningLockedPhoto(false);
        setDisplayedPower(5);
      }, 1500);
    }
  };

  // Retake photo handler
  const handleRetakePhoto = () => {
    setIsLockedPhotoModalOpen(false);
    setIsLocked(false);
    setTimeout(() => {
      handleTriggerMeasure();
    }, 150);
  };

  // Deep Scan AI Tactical Dossier
  const handleOpenTacticalDossier = async () => {
    scouterAudio.playButtonBeep();
    const frameBase64 = captureFrameBase64();
    setCapturedThumb(frameBase64);
    setIsDossierOpen(true);
    setIsCapturingDossier(true);
    setDossierData(null);

    try {
      const res = await fetch('/api/scouter/deep-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64,
          currentPower: displayedPower,
        }),
      });

      if (!res.ok) {
        throw new Error('Fallo en la comunicación militar');
      }

      const data = await res.json();
      setDossierData(data);
      if (data.calculatedPower) {
        setDisplayedPower(data.calculatedPower);
      }
      scouterAudio.playLockOn();
    } catch (err) {
      console.warn('Tactical scan fallback:', err);
      // Fallback data
      setDossierData({
        race: 'Guerrero No Clasificado',
        calculatedPower: displayedPower,
        threatLevel: detection.threatLevel,
        battleStance: 'Postura de alerta con Ki concentrado',
        kiAura: detection.auraName,
        specialTechnique: 'Impacto Destructor de Ki',
        scouterAdvice: '¡No confíes en lecturas fijas! El objetivo puede alterar su Ki a voluntad.',
        isOver9000: displayedPower > 9000,
        friezaQuote: '¡Jojojo! Qué criatura tan insolente... Soldados, terminen con esto.',
      });
    } finally {
      setIsCapturingDossier(false);
    }
  };

  // Generate high-resolution photo with Scouter HUD burned in
  const handleCaptureSnapshot = () => {
    scouterAudio.playLockOn();
    const source = isPresetMode ? imageRef.current : videoRef.current;
    if (!source) return;

    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw source video/image
    ctx.drawImage(source, 0, 0, width, height);

    // 2. Burn in Scouter tint
    ctx.fillStyle =
      lensColor === 'red'
        ? 'rgba(60, 5, 12, 0.35)'
        : lensColor === 'blue'
        ? 'rgba(0, 30, 55, 0.35)'
        : lensColor === 'yellow'
        ? 'rgba(55, 40, 0, 0.35)'
        : lensColor === 'purple'
        ? 'rgba(45, 5, 55, 0.35)'
        : 'rgba(0, 45, 15, 0.35)';
    ctx.fillRect(0, 0, width, height);

    // 3. Eyepiece border
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // 4. Target box
    if (detection.targetBox) {
      const scaleX = width / (containerRef.current?.clientWidth || width);
      const scaleY = height / (containerRef.current?.clientHeight || height);
      const bx = detection.targetBox.x * scaleX;
      const by = detection.targetBox.y * scaleY;
      const bw = detection.targetBox.width * scaleX;
      const bh = detection.targetBox.height * scaleY;

      ctx.strokeStyle = '#ff1a40';
      ctx.lineWidth = 4;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = 'rgba(255, 20, 50, 0.85)';
      ctx.fillRect(bx, Math.max(10, by - 32), 220, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`[TGT: ${detection.distanceMeters}m]`, bx + 10, Math.max(30, by - 10));
    }

    // 5. Watermark & Power Level
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(50, height - 130, 420, 90);

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 16px "Orbitron", sans-serif';
    ctx.fillText('RASTREADOR DE FUERZA DBZ // MODELO 74', 65, height - 100);

    ctx.font = 'bold 44px monospace';
    ctx.fillText(`${displayedPower.toLocaleString('es-ES')} PL`, 65, height - 55);

    setSnapshotUrl(canvas.toDataURL('image/png'));
    setIsSnapshotOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-black overflow-hidden flex flex-col justify-between font-['Chakra_Petch',sans-serif]"
    >
      {/* Top Header Bar */}
      <ScouterTelemetryHeader
        lensColor={lensColor}
        onSelectLensColor={handleSelectLensColor}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSwitchCamera={handleSwitchCamera}
        hasCamera={Boolean(hasCameraAccess)}
        isPresetMode={isPresetMode}
        onTogglePresetMode={() => setIsPresetModalOpen(true)}
        hasCrackedGlass={hasCrackedGlass}
        onRepairGlass={() => {
          scouterAudio.playButtonBeep();
          setHasCrackedGlass(false);
        }}
      />

      {/* Camera Access Warning Overlay if denied */}
      {hasCameraAccess === false && !isPresetMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md p-3 bg-red-950/90 border border-red-500 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-white animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-xs">{cameraError}</span>
          </div>
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-2.5 py-1 text-xs font-bold bg-purple-600 rounded-lg shrink-0 hover:bg-purple-500"
          >
            VER PRUEBAS
          </button>
        </div>
      )}

      {/* Main Scouter Visor Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <ScouterGlassVisor
          lensColor={lensColor}
          isOver9000={displayedPower > 9000}
          hasCrackedGlass={hasCrackedGlass}
        >
          {/* Live Video Feed (when not in preset mode) */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${isPresetMode ? 'hidden' : 'block'} ${
              cameraFacing === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />

          {/* Preset Warrior Image (when in preset mode) */}
          <img
            ref={imageRef}
            crossOrigin="anonymous"
            src={customImageSrc || selectedPreset?.image || PRESET_WARRIORS[3].image}
            alt="Objetivo de prueba"
            className={`w-full h-full object-cover ${isPresetMode ? 'block' : 'hidden'}`}
          />

          {/* Real-time Computer Vision HUD Target Overlay */}
          <ScouterHUDOverlay
            detection={detection}
            lensColor={lensColor}
            isLocked={isLocked}
            isOver9000={displayedPower > 9000}
            hasCrackedGlass={hasCrackedGlass}
            lockedPhotoScan={lockedPhotoScan}
          />
        </ScouterGlassVisor>
      </div>

      {/* Bottom Power Level Readout & Controls */}
      <ScouterPowerReadout
        detection={detection}
        lensColor={lensColor}
        isMeasuring={isMeasuring}
        isLocked={isLocked}
        displayedPower={displayedPower}
        lockedPhotoScan={lockedPhotoScan}
        onTriggerMeasure={handleTriggerMeasure}
        onOpenTacticalDossier={handleOpenTacticalDossier}
        onOpenLockedPhotoModal={() => setIsLockedPhotoModalOpen(true)}
        onCaptureSnapshot={handleCaptureSnapshot}
        isCapturingDossier={isCapturingDossier}
      />

      {/* Camera Snapshot Flash Visual Effect */}
      {isCameraFlashing && (
        <div className="absolute inset-0 bg-white/90 pointer-events-none z-50 animate-out fade-out duration-200" />
      )}

      {/* Locked Target Photo & Morphology Analysis Modal */}
      {isLockedPhotoModalOpen && (
        <LockedTargetPhotoCard
          scanResult={lockedPhotoScan}
          lensColor={lensColor}
          isScanning={isScanningLockedPhoto}
          onClose={() => setIsLockedPhotoModalOpen(false)}
          onRetakePhoto={handleRetakePhoto}
          onDownloadPhoto={handleCaptureSnapshot}
        />
      )}

      {/* Preset Target Selection Modal */}
      <PresetWarriorSelector
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        selectedPreset={selectedPreset}
        onSelectPreset={(warrior) => {
          setSelectedPreset(warrior);
          setCustomImageSrc(null);
          setIsPresetMode(true);
          setIsPresetModalOpen(false);
          scouterAudio.playButtonBeep();
        }}
        onCustomImageUpload={(img) => {
          setCustomImageSrc(img);
          setSelectedPreset(null);
          setIsPresetMode(true);
          setIsPresetModalOpen(false);
          scouterAudio.playButtonBeep();
        }}
      />

      {/* Frieza Army Tactical AI Intelligence Dossier */}
      <TacticalDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        isLoading={isCapturingDossier}
        dossier={dossierData}
        capturedThumb={capturedThumb}
      />

      {/* Snapshot with DBZ Watermark Modal */}
      <ScouterSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        snapshotUrl={snapshotUrl}
        powerLevel={displayedPower}
      />
    </div>
  );
}
