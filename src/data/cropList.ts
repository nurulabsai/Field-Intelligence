export const TANZANIA_CROPS = [
  'Maize', 'Rice', 'Cassava', 'Sweet Potato', 'Irish Potato',
  'Beans', 'Cowpea', 'Soybean', 'Groundnut', 'Sunflower',
  'Cotton', 'Tobacco', 'Sugarcane', 'Sisal', 'Pyrethrum',
  'Coffee', 'Tea', 'Cashew', 'Coconut', 'Banana',
  'Mango', 'Avocado', 'Tomato', 'Onion', 'Cabbage',
  'Sorghum', 'Millet', 'Wheat', 'Barley', 'Other',
] as const;

export type TanzaniaCrop = typeof TANZANIA_CROPS[number];
