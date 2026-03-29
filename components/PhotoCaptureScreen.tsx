/**
 * PHOTO CAPTURE SCREEN
 * 
 * Matches the camera screen showing:
 * - Full-screen camera viewfinder
 * - Photo annotation overlay
 * - Camera controls (capture, flash, rotate)
 * - AI object detection overlay
 */

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Zap, X, Image as ImageIcon } from 'lucide-react';
import './PhotoCaptureScreen.css';

interface PhotoCaptureScreenProps {
  onCapture: (photo: File) => void;
  onClose: () => void;
  showAIDetection?: boolean;
  context?: string; // e.g., "Generator - Intake Room"
}

export const PhotoCaptureScreen: React.FC<PhotoCaptureScreenProps> = ({
  onCapture,
  onClose,
  showAIDetection = true,
  context = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [aiDetections, setAiDetections] = useState<any[]>([]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraFacing]);

  // Mock AI Detection Simulation
  useEffect(() => {
    if (!showAIDetection) return;
    
    const timer = setInterval(() => {
      // Simulate detecting an object occasionally
      if (Math.random() > 0.6) {
        setAiDetections([{
          id: Date.now(),
          label: 'Generator Unit',
          x: 20 + Math.random() * 10,
          y: 30 + Math.random() * 10,
          width: 60,
          height: 40
        }]);
      } else {
        setAiDetections([]);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [showAIDetection]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera access error:', error);
      // Fallback for demo in non-secure context or no camera
      alert('Unable to access camera. Please check permissions or use a secure context (HTTPS).');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const toggleCamera = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="photo-capture-screen animate-in fade-in">
      {/* Video Preview */}
      <video
        ref={videoRef}
        className="camera-preview"
        autoPlay
        playsInline
        muted
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header Overlay */}
      <div className="camera-header">
        <button className="camera-header-btn" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        {context && (
          <div className="camera-context">
            <span className="context-badge">{context}</span>
          </div>
        )}
        <div style={{ width: 44 }} /> {/* Spacer for layout balance */}
      </div>

      {/* AI Detection Overlay */}
      {showAIDetection && aiDetections.map((detection) => (
        <div
          key={detection.id}
          className="detection-box"
          style={{
            left: `${detection.x}%`,
            top: `${detection.y}%`,
            width: `${detection.width}%`,
            height: `${detection.height}%`,
          }}
        >
          <span className="detection-label">{detection.label}</span>
        </div>
      ))}

      {/* Center Focus Guides */}
      <div className="camera-guides">
        <div className="guide-line guide-vertical"></div>
        <div className="guide-line guide-horizontal"></div>
        <div className="focus-frame">
            <div className="focus-corner tl"></div>
            <div className="focus-corner tr"></div>
            <div className="focus-corner bl"></div>
            <div className="focus-corner br"></div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="camera-controls">
        <button
          className="control-btn"
          onClick={() => setFlashEnabled(!flashEnabled)}
        >
          <span className="control-icon">
            <Zap className={`w-6 h-6 ${flashEnabled ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </span>
          <span className="control-label">Flash</span>
        </button>

        <button className="capture-btn" onClick={capturePhoto}>
          <div className="capture-btn-inner"></div>
        </button>

        <button className="control-btn" onClick={toggleCamera}>
          <span className="control-icon">
            <RefreshCw className="w-6 h-6" />
          </span>
          <span className="control-label">Flip</span>
        </button>
      </div>
    </div>
  );
};