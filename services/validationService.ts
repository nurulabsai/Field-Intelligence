
import { LocationData } from '../types';

export const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Morogoro': ['Morogoro Urban', 'Morogoro Rural', 'Mvomero', 'Kilosa', 'Kilombero', 'Ulanga', 'Malinyi', 'Gairo', 'Ifakara'],
  'Ruvuma': ['Songea Urban', 'Songea Rural', 'Mbinga', 'Namtumbo', 'Tunduru', 'Nyasa', 'Madaba'],
  'Pwani': ['Kibaha Urban', 'Kibaha Rural', 'Bagamoyo', 'Chalinze', 'Kisarawe', 'Mkuranga', 'Rufiji', 'Kibiti', 'Mafia']
};

export const validateGPS = (location: LocationData | null): { valid: boolean; error?: string; warning?: string } => {
  if (!location) return { valid: false, error: 'GPS location is required.' };

  // Tanzania Bounds
  const latValid = location.latitude >= -12 && location.latitude <= -1;
  const lonValid = location.longitude >= 29 && location.longitude <= 41;

  if (!latValid || !lonValid) {
    // Changed from error to warning to allow testing outside Tanzania
    return { valid: true, warning: `Coordinates (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}) are outside standard Tanzania boundaries.` };
  }

  // Age Check (5 minutes)
  if (location.timestamp) {
    const ageMinutes = (Date.now() - location.timestamp) / 1000 / 60;
    if (ageMinutes > 5) {
      return { valid: true, warning: 'GPS data is stale (>5 mins old). Please re-capture.' };
    }
  }

  const acc = location.accuracy || 100;

  // Accuracy Check
  // Critical Error: Accuracy worse than 100m is rejected
  if (acc > 100) {
     return { valid: false, error: `GPS accuracy too low (${Math.round(acc)}m). Must be better than 100m.` };
  }

  // Warning: Accuracy worse than 20m suggests poor signal
  if (acc > 20) {
    return { valid: true, warning: `GPS accuracy is low (${Math.round(acc)}m). Try to get under 20m.` };
  }
  
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) return { valid: false, error: 'Phone number is required.' };
  
  // Clean string
  const clean = phone.replace(/\s+/g, '').replace(/-/g, '');
  
  // Tanzania format: +255[67]xxxxxxxx or 0[67]xxxxxxxx
  const regex = /^(?:\+255|0)[67]\d{8}$/;
  
  if (!regex.test(clean)) {
    return { valid: false, error: 'Invalid Tanzania number. Use 07... or +2557...' };
  }
  
  return { valid: true };
};

export const validateNumeric = (
  value: string | number, 
  min: number, 
  max: number, 
  label: string
): { valid: boolean; error?: string; warning?: string } => {
  if (value === '' || value === undefined || value === null) return { valid: true }; // Optional check handled elsewhere
  const num = Number(value);
  
  if (isNaN(num)) return { valid: false, error: `${label} must be a number.` };
  if (num < min) return { valid: false, error: `${label} cannot be less than ${min}.` };
  if (num > max) return { valid: true, warning: `${label} seems unusually high (> ${max}). Please verify.` };
  
  return { valid: true };
};

export const convertArea = (value: number, unit: 'Acres' | 'Hectares'): string => {
  if (!value) return '';
  if (unit === 'Acres') {
    return `${(value * 0.404686).toFixed(2)} Hectares`;
  } else {
    return `${(value * 2.47105).toFixed(2)} Acres`;
  }
};

export const normalizeAreaToHectares = (value: number, unit: 'Acres' | 'Hectares'): number => {
  if (unit === 'Hectares') return value;
  return value * 0.404686;
};

// --- New Helpers for AI/Context ---

export const getPriceWarning = (crop: string, price: string): string | null => {
  const p = Number(price);
  if (isNaN(p)) return null;

  const ranges: Record<string, [number, number]> = {
    'Maize': [400, 800],
    'Rice': [1200, 2200],
    'Beans': [1500, 3000],
    'Sunflower': [800, 1500],
    'Coffee': [5000, 15000] // Parchment
  };

  const range = ranges[crop];
  if (range) {
    if (p < range[0]) return `Entered price (${p}) is lower than typical range (${range[0]}-${range[1]}).`;
    if (p > range[1]) return `Entered price (${p}) is higher than typical range (${range[0]}-${range[1]}).`;
  }
  return null;
};

export const getSmartSeasonDefaults = (region: string, crop: string): { planting: string; harvest: string } | null => {
  // Simplified logic for demo
  if (crop === 'Maize') {
    if (['Morogoro', 'Pwani'].includes(region)) return { planting: 'Oct-Dec', harvest: 'Mar-May' }; // Vuli
    if (region === 'Ruvuma') return { planting: 'Dec-Jan', harvest: 'Jun-Aug' }; // Masika only
  }
  if (crop === 'Rice') {
     return { planting: 'Dec-Jan', harvest: 'May-Jul' };
  }
  return null;
};
