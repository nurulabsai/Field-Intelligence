import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RefreshCw, X, Check, MapPin, AlertTriangle, ChevronLeft, Zap, Grid } from 'lucide-react';
import { AuditImage, LocationData } from '../types';
// @ts-ignore
import piexif from 'piexifjs';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (image: AuditImage) => void;
  onClose: () => void;
  label?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, label }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewData, setPreviewData] = useState<AuditImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingGPS, setIsUpdatingGPS] = useState(false);
  const [blurScore, setBlurScore] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Please allow camera access to take audit photos.");
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const calculateSize = (base64String: string) => {
    return Math.round((base64String.length * 3) / 4);
  };

  const checkBlur = (ctx: CanvasRenderingContext2D, width: number, height: number): number => {
    const cx = Math.floor(width / 2 - 100);
    const cy = Math.floor(height / 2 - 100);
    const w = 200;
    const h = 200;
    if (width < 200 || height < 200) return 100; 
    const imageData = ctx.getImageData(cx, cy, w, h);
    const data = imageData.data;
    let score = 0;
    for (let i = 0; i < data.length; i += 4) {
      if ((i / 4) % w < w - 1) {
        const rDiff = Math.abs(data[i] - data[i + 4]);
        const gDiff = Math.abs(data[i+1] - data[i + 5]);
        const bDiff = Math.abs(data[i+2] - data[i + 6]);
        score += rDiff + gDiff + bDiff;
      }
    }
    return Math.min(100, Math.round((score / (w * h) / 3) * 2)); 
  };

  const getGPS = async (timeout = 3000): Promise<LocationData | undefined> => {
     try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout });
          });
          return {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          };
        } catch (e) {
          console.warn("Could not fetch GPS for photo");
          return undefined;
        }
  };

  const embedEXIF = (jpegData: string, gps: LocationData): string => {
    try {
        const exifObj = { "0th": {}, "Exif": {}, "GPS": {} };
        const lat = Math.abs(gps.latitude);
        const latDeg = Math.floor(lat);
        const latMin = Math.floor((lat - latDeg) * 60);
        const latSec = (lat - latDeg - latMin / 60) * 3600;
        
        exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = gps.latitude < 0 ? 'S' : 'N';
        exifObj.GPS[piexif.GPSIFD.GPSLatitude] = [[latDeg, 1], [latMin, 1], [Math.round(latSec * 100), 100]];

        const lon = Math.abs(gps.longitude);
        const lonDeg = Math.floor(lon);
        const lonMin = Math.floor((lon - lonDeg) * 60);
        const lonSec = (lon - lonDeg - lonMin / 60) * 3600;

        exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = gps.longitude < 0 ? 'W' : 'E';
        exifObj.GPS[piexif.GPSIFD.GPSLongitude] = [[lonDeg, 1], [lonMin, 1], [Math.round(lonSec * 100), 100]];
        
        if (gps.accuracy) exifObj.GPS[31] = [Math.round(gps.accuracy * 100), 100];

        const exifBytes = piexif.dump(exifObj);
        return piexif.insert(exifBytes, jpegData);
    } catch (e) {
        return jpegData;
    }
  };

  const handleRecaptureGPS = async () => {
    if (!previewData) return;
    setIsUpdatingGPS(true);
    const newGPS = await getGPS(10000); 
    if (newGPS) {
        let updatedDataUrl = previewData.dataUrl || "";
        if (updatedDataUrl) updatedDataUrl = embedEXIF(updatedDataUrl, newGPS);
        setPreviewData(prev => prev ? ({ ...prev, gps: newGPS, dataUrl: updatedDataUrl }) : null);
    } else {
        alert("Could not acquire a better GPS signal.");
    }
    setIsUpdatingGPS(false);
  };

  const capture = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const sharpness = checkBlur(ctx, canvas.width, canvas.height);
        setBlurScore(sharpness);
        let dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const gpsData = await getGPS();
        if (gpsData) dataUrl = embedEXIF(dataUrl, gpsData);
        
        const newImage: AuditImage = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          dataUrl: dataUrl,
          label: label,
          gps: gpsData,
          originalSize: canvas.width * canvas.height * 3,
          compressedSize: calculateSize(dataUrl),
          synced: false
        };
        setPreviewData(newImage);
      }
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setPreviewData(null);
    setBlurScore(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (previewData) {
      onCapture(previewData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F19] z-50 overflow-hidden font-sans text-white">
      
      {/* Background Gradient overlay over video */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none"></div>

      {previewData ? (
        // Preview Captured Image
        <div className="absolute inset-0 z-20 flex flex-col bg-black">
          <img src={previewData.dataUrl} className="flex-1 object-cover" alt="Preview" />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent p-6 pt-24 text-white z-30">
            {blurScore !== null && blurScore < 30 && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 backdrop-blur-md animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span className="font-bold text-sm text-red-100">Image is blurry. Please hold steady.</span>
              </div>
            )}

            <div className="w-full glass-pill rounded-3xl p-5 mb-6 border-white/10">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${previewData.gps ? 'text-[var(--neon-cyan)]' : 'text-red-400'}`} />
                    {previewData.gps ? (
                      <div className="flex flex-col">
                        <span className=" text-sm text-white/90">
                          {previewData.gps.latitude.toFixed(5)}, {previewData.gps.longitude.toFixed(5)}
                        </span>
                        <span className="text-xs text-[#94A3B8] font-bold tracking-widest uppercase">±{Math.round(previewData.gps.accuracy || 0)}m ACCURACY</span>
                      </div>
                    ) : (
                      <span className=" text-sm text-white/90">No GPS Signal</span>
                    )}
                  </div>
                  {previewData.gps && (previewData.gps.accuracy || 100) > 20 && (
                      <button onClick={handleRecaptureGPS} disabled={isUpdatingGPS} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <RefreshCw className={`w-5 h-5 ${isUpdatingGPS ? 'animate-spin text-[var(--neon-cyan)]' : 'text-white/80'}`} />
                      </button>
                  )}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleRetake}
                className="flex-1 py-4 rounded-full font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2  tracking-wide"
              >
                RETAKE
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-4 rounded-full font-bold text-black bg-[var(--neon-lime)] shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:bg-[#aade4e] transition-colors flex items-center justify-center gap-2  tracking-wide"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Active Camera View
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Floating Header */}
          <header className="absolute top-0 left-0 right-0 z-50 p-6 pt-12">
            <div className="max-w-md mx-auto flex items-center justify-between glass-pill rounded-full p-2 pr-5">
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white bg-white/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-pulse-cyan shadow-[0_0_8px_#67E8F9]"></div>
                <span className=" text-[11px] font-bold tracking-[0.2em] uppercase text-white/90">
                  {label || 'AI SCANNING'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">
                  <Zap size={20} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">
                  <Grid size={20} />
                </button>
              </div>
            </div>
          </header>

          {/* AI Scanning Brackets Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="viewfinder-bracket top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl border-white/60"></div>
              <div className="viewfinder-bracket top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl border-white/60"></div>
              <div className="viewfinder-bracket bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl border-white/60"></div>
              <div className="viewfinder-bracket bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl border-white/60"></div>
              
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="glass-pill rounded-full px-5 py-2.5 flex items-center justify-center gap-3 whitespace-nowrap border-white/20">
                  <div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-pulse-cyan shadow-[0_0_8px_#67E8F9]"></div>
                  <span className="text-[10px]  font-bold tracking-[0.1em] uppercase text-white/90 neon-cyan-text-glow">
                    Detecting Environment...
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />

          {/* Bottom Control Deck */}
          <footer className="absolute bottom-0 left-0 right-0 z-50">
            <div className="glass-pill rounded-t-[40px] p-6 pb-12 flex flex-col items-center gap-8 mx-auto max-w-md border-b-0 border-x-0 bg-[#0B0F19]/90">
              
              {/* Segmented Modes */}
              <div className="flex items-center justify-between w-full max-w-[280px] bg-white/5 rounded-full p-1.5 border border-white/5">
                <button className="flex-1 py-2 text-[10px]  font-bold tracking-widest text-[var(--neon-lime)] bg-white/10 rounded-full shadow-sm">SCAN</button>
                <button className="flex-1 py-2 text-[10px]  font-semibold tracking-widest text-white/40 hover:text-white/70 transition-colors">PHOTO</button>
                <button className="flex-1 py-2 text-[10px]  font-semibold tracking-widest text-white/40 hover:text-white/70 transition-colors">VIDEO</button>
              </div>
              
              {/* Shutter Controls */}
              <div className="flex items-center justify-between w-full px-4">
                {/* Thumbnail */}
                <button className="w-[52px] h-[52px] rounded-[14px] overflow-hidden border border-white/20 bg-slate-800 shadow-md">
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-slate-700"></div>
                </button>
                
                {/* Shutter */}
                <button onClick={capture} disabled={isProcessing} className="shutter-outer shadow-[0_0_30px_rgba(190,242,100,0.15)] relative">
                  {isProcessing ? (
                     <div className="absolute inset-0 border-[4px] border-[var(--neon-lime)] border-t-transparent rounded-full animate-spin z-20" />
                  ) : (
                     <div className="shutter-inner shadow-[inset_0_4px_10px_rgba(255,255,255,0.4)]"></div>
                  )}
                </button>
                
                {/* Flip Camera */}
                <button className="w-[52px] h-[52px] rounded-full glass-pill flex items-center justify-center active:rotate-180 transition-transform duration-500 hover:bg-white/10">
                  <RefreshCw className="w-5 h-5 text-white/80" />
                </button>
              </div>

              {/* Home Indicator Bar */}
              <div className="w-32 h-[5px] bg-white/20 rounded-full mt-2 hidden sm:block"></div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
