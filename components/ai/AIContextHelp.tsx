
import React, { useState } from 'react';
import './AIContextHelp.css';

export interface SimilarFarmData {
  id: string;
  yield?: number;
  challenges?: string[];
  location: string;
}

interface AIContextHelpProps {
  questionId: string;
  questionType: string; // 'number' | 'multiselect' etc
  label: string;
  similarFarms?: SimilarFarmData[];
  historicalAverage?: number | string;
  unit?: string;
  district?: string;
}

export const AIContextHelp: React.FC<AIContextHelpProps> = ({
  questionId,
  questionType,
  label,
  similarFarms,
  historicalAverage,
  unit = '',
  district = 'this area'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!similarFarms && !historicalAverage) return null;

  return (
    <div className="ai-context-help">
      <button
        type="button" // Prevent form submission
        className="context-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2">💡 <span className="font-bold text-sm text-indigo-700">AI Context</span></span>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="context-content animate-in slide-in-from-top-2">
          {/* Historical Average */}
          {historicalAverage && (
            <div className="context-section">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Typical for {district}:</h4>
              <p className="context-stat text-lg font-bold text-slate-800">
                {historicalAverage} {unit}
              </p>
              <p className="context-explanation text-xs text-slate-500">
                Based on {similarFarms?.length || 0} similar farms
              </p>
            </div>
          )}

          {/* Range Information */}
          {similarFarms && similarFarms.length > 0 && questionType === 'number' && (
            <div className="context-section mt-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Range in similar farms:</h4>
              <div className="range-visualization mt-4">
                <RangeBar
                  min={getMin(similarFarms)}
                  max={getMax(similarFarms)}
                  average={Number(historicalAverage) || 0}
                  unit={unit}
                />
              </div>
            </div>
          )}

          {/* Top Performers */}
          {questionId.includes('yield') && similarFarms && (
            <div className="context-section mt-3 bg-green-50 p-2 rounded-lg border border-green-100">
              <h4 className="text-xs font-bold text-green-800 mb-1">🏆 Top performers achieve:</h4>
              <p className="context-stat text-sm font-bold text-green-700">
                {getTopPerformerValue(similarFarms)} {unit}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RangeBar: React.FC<{
  min: number;
  max: number;
  average: number;
  unit: string;
}> = ({ min, max, average, unit }) => {
  const range = max - min || 1; // Prevent division by zero
  // Clamp values for visual safety
  const avgPosition = Math.min(100, Math.max(0, ((average - min) / range) * 100));

  return (
    <div className="relative h-4 mt-4 mb-2">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 rounded-full -translate-y-1/2" />
      
      {/* Min Marker */}
      <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: '0%' }}>
        <div className="w-2 h-2 bg-slate-400 rounded-full" />
        <span className="text-[10px] text-slate-500 mt-1">{min}</span>
      </div>

      {/* Avg Marker */}
      <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10" style={{ left: `${avgPosition}%`, transform: 'translate(-50%, -50%)' }}>
        <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
        <span className="text-[10px] font-bold text-blue-700 mt-2 bg-white px-1 rounded shadow-sm border border-blue-100">Avg {average}</span>
      </div>

      {/* Max Marker */}
      <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ right: '0%' }}>
        <div className="w-2 h-2 bg-slate-400 rounded-full" />
        <span className="text-[10px] text-slate-500 mt-1">{max}</span>
      </div>
    </div>
  );
};

// Helper functions
function getMin(farms: SimilarFarmData[]): number {
    const vals = farms.map(f => f.yield || 0).filter(v => v > 0);
    return vals.length ? Math.min(...vals) : 0;
}

function getMax(farms: SimilarFarmData[]): number {
    const vals = farms.map(f => f.yield || 0).filter(v => v > 0);
    return vals.length ? Math.max(...vals) : 100;
}

function getTopPerformerValue(farms: SimilarFarmData[]): number {
    return getMax(farms);
}
