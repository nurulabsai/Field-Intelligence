
import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Bot, Loader2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from './CameraCapture';
import { analyzeGeneralImage } from '../services/geminiService';
import { AuditImage } from '../types';

export const ImageAnalysisScreen = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCapture = (img: AuditImage) => {
    setImage(img.dataUrl || null);
    setResult(null);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    const text = await analyzeGeneralImage(image);
    setResult(text || "Could not analyze image. Please try again.");
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-teal-700 text-white p-4 pt-6 pb-8 shadow-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 font-medium">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-8 h-8" /> AI Image Analysis
        </h1>
        <p className="text-teal-100 text-sm mt-1">Identify crops, pests, and more with Gemini 3 Pro</p>
      </div>

      <div className="p-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
          {image ? (
            <div className="relative flex-1 bg-black group">
              <img src={image} alt="Target" className="w-full h-full object-contain max-h-[60vh]" />
              <button 
                onClick={() => { setImage(null); setResult(null); }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-4 min-h-[300px]">
              <ImageIcon className="w-16 h-16 opacity-20" />
              <p className="font-medium text-slate-500">Select an image to analyze</p>
              <div className="flex gap-4 w-full max-w-xs">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold border border-blue-100 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <Camera className="w-5 h-5" /> Camera
                </button>
                <label className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
          )}

          {image && (
            <div className="p-4 border-t border-slate-100 bg-white">
              {!result && !isAnalyzing && (
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Bot className="w-5 h-5" /> Analyze Image
                </button>
              )}
              
              {isAnalyzing && (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <p className="font-medium">Gemini Pro is analyzing...</p>
                </div>
              )}

              {result && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 text-teal-700 font-bold border-b border-slate-100 pb-2">
                    <Bot className="w-5 h-5" /> Analysis Result
                  </div>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
                  <button 
                    onClick={() => { setImage(null); setResult(null); }}
                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold mt-4 hover:bg-slate-200 transition-colors"
                  >
                    Analyze Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
