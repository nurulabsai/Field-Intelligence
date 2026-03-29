/**
 * Application Constants
 */

export const APP_CONFIG = {
  NAME: 'NuruOS Field Intelligence',
  VERSION: '1.0.0',
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGES_PER_AUDIT: 10,
  MAX_AUDIO_DURATION_MINUTES: 5,
  SYNC_INTERVAL_MS: 30000,
  MAX_OFFLINE_AUDITS: 100
};

export const STORAGE_KEYS = {
  AUDITS: 'nuruos_audits',
  USER: 'nuruos_user',
  SETTINGS: 'nuruos_settings',
  SYNC_QUEUE: 'nuruos_sync_queue'
};

export const ROUTES = {
  HOME: '/',
  NEW_AUDIT: '/audit',
  FARM_AUDIT: '/audit/farm',
  BUSINESS_AUDIT: '/audit/business',
  HISTORY: '/history',
  SETTINGS: '/settings'
};

export const TANZANIA_REGIONS = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera',
  'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara',
  'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pwani',
  'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe',
  'Tabora', 'Tanga', 'Zanzibar North', 'Zanzibar South', 'Zanzibar West'
];

export const CROP_TYPES = [
  'Maize', 'Rice', 'Wheat', 'Sorghum', 'Millet', 'Beans',
  'Sunflower', 'Cotton', 'Coffee', 'Tea', 'Cashew', 'Tobacco',
  'Cassava', 'Sweet Potato', 'Irish Potato', 'Banana', 'Sugarcane'
];

export const BUSINESS_TYPES = [
  'Agro-dealer', 'Input Supplier', 'Warehouse', 'Processing Plant',
  'Storage Facility', 'Retail Shop', 'Cooperative', 'Other'
];

export const SOIL_TYPES = [
  'Sandy', 'Clay', 'Loam', 'Silt', 'Peat', 'Chalk', 'Not Sure'
];
