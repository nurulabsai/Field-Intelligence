
import React from 'react';
import { AuditRecord } from '../types';
import { MapPin, Calendar, ClipboardCheck, Trash2, Wheat, Store } from 'lucide-react';

interface AuditCardProps {
  audit: AuditRecord;
  onView: (audit: AuditRecord) => void;
  onDelete: (id: string) => void;
}

const AuditCard: React.FC<AuditCardProps> = ({ audit, onView, onDelete }) => {
  const isFarm = audit.type === 'farm';

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onView(audit)}
    >
      <div className="flex">
        {audit.images.length > 0 ? (
          <img 
            src={audit.images[0].dataUrl} 
            alt="Preview" 
            className="w-24 h-24 object-cover sm:w-32 sm:h-32"
          />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 flex items-center justify-center">
            {isFarm ? (
              <Wheat className="text-slate-400 w-8 h-8" />
            ) : (
              <Store className="text-slate-400 w-8 h-8" />
            )}
          </div>
        )}
        
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-900 truncate flex-1 mr-2">{audit.businessName || 'Unnamed Location'}</h3>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${isFarm ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {isFarm ? 'Farm' : 'Biz'}
              </span>
            </div>
            <div className="flex items-center text-slate-500 text-xs mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(audit.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-slate-500 text-xs mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {audit.location ? `${audit.location.latitude.toFixed(4)}, ${audit.location.longitude.toFixed(4)}` : 'No GPS'}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              audit.status === 'synced' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {audit.status}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(audit.id); }}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditCard;
