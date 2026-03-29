
import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/mapsLoader';
import { LocationData } from '../types';
import { MapPin, Navigation, Layers, Loader2, AlertTriangle, RefreshCw, Crosshair } from 'lucide-react';

declare var google: any;

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (loc: LocationData) => void;
  readOnly?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, readOnly }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  const [markerInstance, setMarkerInstance] = useState<any | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isCapturing, setIsCapturing] = useState(false);

  // Handle Auth Failure (Invalid API Key)
  useEffect(() => {
      const handleAuthError = () => {
          console.warn("Maps API Key Invalid - Switching to Sensor Mode");
          setMapLoadError(true);
          setIsMapLoaded(false);
      };
      window.addEventListener('google-maps-auth-failure', handleAuthError);
      return () => window.removeEventListener('google-maps-auth-failure', handleAuthError);
  }, []);

  // Load Google Maps API with timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const load = async () => {
        try {
            // Set a timeout to fallback if maps take too long (e.g. offline or bad key)
            timeoutId = setTimeout(() => {
                if (isMounted) setMapLoadError(true);
            }, 8000);

            await loadGoogleMaps();
            
            if (isMounted) {
                clearTimeout(timeoutId);
                setIsMapLoaded(true);
            }
        } catch (e: any) {
            if (isMounted) {
                clearTimeout(timeoutId);
                setMapLoadError(true);
            }
        }
    };
    
    if (!(window as any).google || !(window as any).google.maps) {
        load();
    } else {
        setIsMapLoaded(true);
    }

    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstance && !mapLoadError) {
      try {
          const initialLat = value?.latitude || -6.369028; // Default Tanzania
          const initialLng = value?.longitude || 34.888822;

          const map = new google.maps.Map(mapRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: value ? 17 : 6,
            mapTypeId: mapType,
            disableDefaultUI: true,
            zoomControl: true,
          });

          const marker = new google.maps.Marker({
            map,
            position: { lat: initialLat, lng: initialLng },
            draggable: !readOnly,
            animation: google.maps.Animation.DROP,
          });

          marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (pos) {
              // Preserve existing accuracy if dragged, or default to 5m
              const currentAcc = value?.accuracy || 5; 
              onChange({
                latitude: pos.lat(),
                longitude: pos.lng(),
                accuracy: currentAcc, 
                timestamp: Date.now()
              });
            }
          });

          setMapInstance(map);
          setMarkerInstance(marker);
      } catch (e) {
          console.error("Error initializing map", e);
          setMapLoadError(true);
      }
    }
  }, [isMapLoaded, mapRef, mapLoadError]);

  // Update Map when Value Changes (External updates, e.g., GPS button)
  useEffect(() => {
    if (mapInstance && markerInstance && value) {
      const newPos = { lat: value.latitude, lng: value.longitude };
      markerInstance.setPosition(newPos);
      mapInstance.panTo(newPos);
      if (mapInstance.getZoom()! < 15) mapInstance.setZoom(17);
    }
  }, [value, mapInstance, markerInstance]);

  // Toggle Map Type
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapTypeId(mapType);
    }
  }, [mapType, mapInstance]);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    setIsCapturing(true);
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const loc = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp,
            };
            
            onChange(loc);
            setIsCapturing(false);
            
            // If map is active, center it
            if (mapInstance) {
                const newPos = { lat: loc.latitude, lng: loc.longitude };
                mapInstance.panTo(newPos);
                mapInstance.setZoom(18);
            }
        },
        (err) => {
            setIsCapturing(false);
            console.warn("GPS Error", err);
            // If map failed AND gps failed, user is stuck. Suggest simulation.
            if (mapLoadError) {
                const useSim = window.confirm("Could not get GPS signal. Use simulated location for testing?");
                if (useSim) handleSimulateLocation();
            } else {
                alert(`GPS Error: ${err.message}. Please check your device settings.`);
            }
        },
        options
    );
  };

  const handleSimulateLocation = () => {
      // Use a fixed point in Morogoro, Tanzania
      onChange({
          latitude: -6.8235,
          longitude: 37.6534,
          accuracy: 5,
          timestamp: Date.now()
      });
  };

  // --- Fallback View (Offline or Map Load Error) ---
  if (!isMapLoaded || mapLoadError) {
      return (
          <div className="w-full bg-slate-50 rounded-xl border-2 border-slate-200 p-6 flex flex-col items-center text-center gap-4 animate-in fade-in">
              <div className={`p-4 rounded-full ${value ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {isCapturing ? <Loader2 className="w-8 h-8 animate-spin" /> : <MapPin className="w-8 h-8" />}
              </div>
              
              <div>
                  <h3 className="font-bold text-slate-900">GPS Location</h3>
                  <p className="text-sm text-slate-500">
                      {mapLoadError && !value ? "Map unavailable. Using GPS sensor only." : (value ? "Location Captured" : "Waiting for capture...")}
                  </p>
                  {mapLoadError && (
                      <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 px-2 py-1 rounded">
                          Map API Key Error - Sensor Mode Active
                      </p>
                  )}
              </div>
              
              {value ? (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 w-full max-w-xs shadow-sm">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                              <div className="text-[10px] uppercase text-slate-400 font-bold">Latitude</div>
                              <div className="text-lg font-mono font-bold text-slate-800">{value.latitude.toFixed(6)}</div>
                          </div>
                          <div>
                              <div className="text-[10px] uppercase text-slate-400 font-bold">Longitude</div>
                              <div className="text-lg font-mono font-bold text-slate-800">{value.longitude.toFixed(6)}</div>
                          </div>
                      </div>
                      <div className={`text-xs font-bold flex items-center justify-center gap-1.5 py-1 rounded ${value.accuracy && value.accuracy <= 10 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {value.accuracy && value.accuracy <= 10 ? <div className="w-2 h-2 rounded-full bg-green-500" /> : <AlertTriangle className="w-3 h-3" />}
                          Accuracy: ±{Math.round(value.accuracy || 0)}m
                      </div>
                  </div>
              ) : (
                  <div className="text-sm text-slate-400 italic bg-slate-100 px-4 py-2 rounded-lg">
                      No coordinates captured
                  </div>
              )}

              <button 
                  type="button"
                  onClick={handleCaptureLocation}
                  disabled={isCapturing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 hover:bg-blue-700"
              >
                  {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  {value ? "Update GPS" : "Capture GPS"}
              </button>
              
              <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 max-w-xs">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Ensure you are outdoors for best accuracy.</span>
                  </div>
                  
                  {/* Simulation Button for Testing/Blocked GPS */}
                  <button 
                      type="button" 
                      onClick={handleSimulateLocation}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1 mt-2"
                  >
                      <Crosshair className="w-3 h-3" />
                      GPS not working? Use Mock Location
                  </button>
              </div>

               {/* Add Slider Here for Offline Mode too */}
                {!readOnly && value && (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg w-full max-w-xs mt-4">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> GPS Accuracy Test
                          </span>
                          <span className={`text-xs font-mono font-bold ${(!value?.accuracy || value.accuracy <= 20) ? 'text-green-600' : (value.accuracy <= 100 ? 'text-yellow-600' : 'text-red-600')}`}>
                              {value?.accuracy ? Math.round(value.accuracy) : 0}m
                          </span>
                      </div>
                      <input 
                          type="range" 
                          min="5" 
                          max="150" 
                          step="5"
                          className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          value={value.accuracy || 5}
                          onChange={(e) => {
                              onChange({ ...value, accuracy: Number(e.target.value) });
                          }}
                      />
                  </div>
                )}

          </div>
      );
  }

  // --- Map View ---
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            type="button"
            onClick={() => setMapType(t => t === 'roadmap' ? 'satellite' : 'roadmap')}
            className="bg-white p-2 rounded-lg shadow-md text-slate-700 hover:text-blue-600"
            title="Toggle Satellite"
          >
            <Layers className="w-6 h-6" />
          </button>
          {!readOnly && (
            <button 
              type="button"
              onClick={handleCaptureLocation}
              className={`bg-white p-2 rounded-lg shadow-md text-slate-700 hover:text-blue-600 ${isCapturing ? 'animate-pulse text-blue-600' : ''}`}
              title="My Location"
            >
              {isCapturing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Accuracy overlay */}
        {value && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-slate-100">
            <div className="text-xs font-mono font-bold text-slate-800">
              {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)} 
            </div>
            <div className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${value.accuracy && value.accuracy <= 10 ? 'text-green-600' : 'text-amber-600'}`}>
              {value.accuracy && value.accuracy <= 10 ? <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> : <AlertTriangle className="w-3 h-3" />}
              ±{Math.round(value.accuracy || 0)}m Accuracy
            </div>
          </div>
        )}
      </div>

      {/* --- Accuracy Simulation Tool for Testing --- */}
      {!readOnly && value && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> GPS Accuracy Test
                </span>
                <span className={`text-xs font-mono font-bold ${(!value?.accuracy || value.accuracy <= 20) ? 'text-green-600' : (value.accuracy <= 100 ? 'text-yellow-600' : 'text-red-600')}`}>
                    {value?.accuracy ? Math.round(value.accuracy) : 0}m
                </span>
            </div>
            <input 
                type="range" 
                min="5" 
                max="150" 
                step="5"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={value.accuracy || 5}
                onChange={(e) => {
                    onChange({ ...value, accuracy: Number(e.target.value) });
                }}
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5m (Best)</span>
                <span>100m (Max Allowed)</span>
                <span>150m (Error)</span>
            </div>
        </div>
      )}
    </div>
  );
};
