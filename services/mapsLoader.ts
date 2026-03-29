
let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    // Set up global auth failure handler
    // This catches "InvalidKeyMapError" and other auth issues causing the map to gray out
    (window as any).gm_authFailure = () => {
      console.error("Google Maps API Authentication Failure (Invalid Key)");
      window.dispatchEvent(new Event('google-maps-auth-failure'));
    };

    // Try env vars for Maps key, or fallback to API_KEY
    // Try env vars for Maps key, or fallback to VITE_API_KEY
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

    // We allow proceeding even without a key string to let the API script load and trigger auth failure if needed,
    // or work in limited dev mode if applicable. 
    // However, usually we need a key.

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = (err) => {
      // Reset promise so we can try again if it fails (e.g. network)
      googleMapsPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
