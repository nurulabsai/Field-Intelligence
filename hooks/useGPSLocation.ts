import { useState, useCallback } from 'react';
import { LocationData } from '../types';

interface UseGPSLocationReturn {
  getCurrentPosition: () => Promise<LocationData>;
  watchPosition: (callback: (position: LocationData) => void) => () => void;
  isLoading: boolean;
  error: string | null;
}

export const useGPSLocation = (): UseGPSLocationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by this device';
        setError(err);
        reject(new Error(err));
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          const reading: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          resolve(reading);
        },
        (err) => {
          setIsLoading(false);
          let errorMessage = 'Failed to get GPS position';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'GPS permission denied. Please enable location services.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'GPS position unavailable. Check if GPS is enabled.';
              break;
            case err.TIMEOUT:
              errorMessage = 'GPS request timed out. Please try again.';
              break;
          }

          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const watchPosition = useCallback((callback: (position: LocationData) => void) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this device');
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const reading: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        callback(reading);
      },
      (err) => {
        console.error('GPS watch error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    getCurrentPosition,
    watchPosition,
    isLoading,
    error,
  };
};
