
import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/mapsLoader';
import { AuditRecord } from '../types';
import { AlertTriangle, Map } from 'lucide-react';

declare var google: any;

interface AdminMapProps {
  audits: AuditRecord[];
}

export const AdminMap: React.FC<AdminMapProps> = ({ audits }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleAuthError = () => setError(true);
    window.addEventListener('google-maps-auth-failure', handleAuthError);

    loadGoogleMaps().then(() => {
      if (mapRef.current && !map) {
        try {
            const newMap = new google.maps.Map(mapRef.current, {
              center: { lat: -6.369028, lng: 34.888822 }, // Tanzania Center
              zoom: 6,
              mapTypeId: 'roadmap',
              streetViewControl: false,
            });
            setMap(newMap);
        } catch(e) {
            setError(true);
        }
      }
    }).catch(() => {
      setError(true);
    });

    return () => window.removeEventListener('google-maps-auth-failure', handleAuthError);
  }, []);

  useEffect(() => {
    if (map && audits.length > 0) {
      // Clear existing markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      const bounds = new google.maps.LatLngBounds();
      let hasValidLoc = false;

      audits.forEach(audit => {
        if (audit.location) {
          hasValidLoc = true;
          const pos = { lat: audit.location.latitude, lng: audit.location.longitude };
          
          const marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: audit.businessName,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: audit.status === 'synced' ? '#10b981' : '#f59e0b',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
            }
          });

          // InfoWindow
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 5px; color: #333;">
                <strong>${audit.businessName}</strong><br/>
                <span style="font-size: 10px; color: #666;">${audit.type.toUpperCase()} • ${new Date(audit.createdAt).toLocaleDateString()}</span>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(pos);
        }
      });

      if (hasValidLoc) {
        map.fitBounds(bounds);
      }
    }
  }, [map, audits]);

  if (error) {
    return (
      <div className="w-full h-full rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-300">
        <AlertTriangle className="w-12 h-12 mb-3 text-amber-400" />
        <h3 className="font-bold text-slate-600">Map Unavailable</h3>
        <p className="text-sm max-w-xs text-center mt-1">
            Google Maps could not load due to an invalid API key or network issue.
        </p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full rounded-xl bg-slate-100 border border-slate-200" />;
};
