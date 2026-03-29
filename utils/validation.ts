/**
 * Validation Utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Tanzania phone format: +255 or 0 followed by 9 digits
  const phoneRegex = /^(\+255|0)[67]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateCoordinates = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const validateFarmSize = (size: number, unit: string): boolean => {
  if (size <= 0) return false;
  if (unit === 'acres' && size > 10000) return false;
  if (unit === 'hectares' && size > 4000) return false;
  return true;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return value !== null && value !== undefined;
};
