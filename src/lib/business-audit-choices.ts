/**
 * Business Audit Choice Lists — derived from NuruOS KoboToolbox XLSForm v1
 *
 * Each list mirrors the "choices" sheet exactly so field values stay
 * compatible with the backend and with the KoboToolbox data pipeline.
 */

export interface Choice {
  value: string;
  label: string;
}

export const YES_NO: Choice[] = [
  { value: 'yes', label: 'Yes / Ndiyo' },
  { value: 'no', label: 'No / Hapana' },
];

export const YES_NO_UNCLEAR: Choice[] = [
  { value: 'yes', label: 'Yes / Ndiyo' },
  { value: 'no', label: 'No / Hapana' },
  { value: 'unclear', label: 'Unclear / Haionekani' },
];

export const DISTRICTS: Choice[] = [
  { value: 'morogoro_urban', label: 'Morogoro Urban' },
  { value: 'morogoro_rural', label: 'Morogoro Rural' },
  { value: 'kilombero', label: 'Kilombero' },
  { value: 'ulanga', label: 'Ulanga' },
  { value: 'kilosa', label: 'Kilosa' },
  { value: 'mvomero', label: 'Mvomero' },
  { value: 'gairo', label: 'Gairo' },
  { value: 'malinyi', label: 'Malinyi' },
  { value: 'ifakara', label: 'Ifakara TC' },
];

export const STAKEHOLDER_TYPES: Choice[] = [
  { value: 'agro_dealer', label: 'Agro-Input Dealer / Muuzaji Pembejeo' },
  { value: 'commodity_buyer', label: 'Commodity Buyer / Mnunuzi Mazao' },
  { value: 'trader', label: 'Trader/Middleman / Dalali' },
  { value: 'transporter', label: 'Transporter / Msafirishaji' },
  { value: 'warehouse', label: 'Warehouse/Storage / Ghala' },
  { value: 'processor', label: 'Processor / Msindikaji' },
  { value: 'cooperative', label: 'Cooperative/Group / Kikundi' },
  { value: 'financial', label: 'Financial Service / Huduma za Fedha' },
  { value: 'extension', label: 'Extension/NGO / Ugani' },
  { value: 'mixed', label: 'Mixed/Multiple / Mchanganyiko' },
];

export const INPUT_CATEGORIES: Choice[] = [
  { value: 'fertilizer', label: 'Fertilizer / Mbolea' },
  { value: 'seeds', label: 'Seeds / Mbegu' },
  { value: 'pesticides', label: 'Pesticides / Dawa Wadudu' },
  { value: 'herbicides', label: 'Herbicides / Dawa Magugu' },
  { value: 'fungicides', label: 'Fungicides / Dawa Ukungu' },
  { value: 'equipment', label: 'Equipment / Vifaa' },
  { value: 'irrigation', label: 'Irrigation / Umwagiliaji' },
  { value: 'animal_feeds', label: 'Animal Feeds / Chakula Mifugo' },
  { value: 'vet_products', label: 'Veterinary / Dawa Mifugo' },
];

export const COMMODITIES: Choice[] = [
  { value: 'maize', label: 'Maize / Mahindi' },
  { value: 'rice', label: 'Rice / Mchele' },
  { value: 'beans', label: 'Beans / Maharage' },
  { value: 'sunflower', label: 'Sunflower / Alizeti' },
  { value: 'sesame', label: 'Sesame / Ufuta' },
  { value: 'groundnuts', label: 'Groundnuts / Karanga' },
  { value: 'sorghum', label: 'Sorghum / Mtama' },
  { value: 'millet', label: 'Millet / Uwele' },
  { value: 'cassava', label: 'Cassava / Muhogo' },
  { value: 'cashew', label: 'Cashew / Korosho' },
  { value: 'vegetables', label: 'Vegetables / Mboga' },
  { value: 'fruits', label: 'Fruits / Matunda' },
  { value: 'cotton', label: 'Cotton / Pamba' },
  { value: 'tobacco', label: 'Tobacco / Tumbaku' },
];

export const VOLUME_CATEGORIES: Choice[] = [
  { value: 'small', label: '< 1 ton / Ndogo' },
  { value: 'medium', label: '1-10 tons / Wastani' },
  { value: 'large', label: '10-50 tons / Kubwa' },
  { value: 'very_large', label: '50+ tons / Kubwa Sana' },
];

export const PAYMENT_TERMS: Choice[] = [
  { value: 'cash', label: 'Cash / Taslimu' },
  { value: 'mobile_money', label: 'Mobile Money / M-Pesa/Tigo' },
  { value: 'bank', label: 'Bank Transfer / Benki' },
  { value: 'delayed', label: 'Delayed / Baadaye' },
  { value: 'advance', label: 'Advance / Mapema' },
  { value: 'contract', label: 'Contract / Mkataba' },
];

export const VEHICLE_TYPES: Choice[] = [
  { value: 'motorcycle', label: 'Motorcycle / Pikipiki' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'truck_small', label: 'Small Truck 3-5t' },
  { value: 'truck_medium', label: 'Medium Truck 5-10t' },
  { value: 'truck_large', label: 'Large Truck 10t+' },
  { value: 'trailer', label: 'Trailer / Trela' },
];

export const SERVICE_TYPES: Choice[] = [
  { value: 'storage', label: 'Storage / Ghala' },
  { value: 'soil_testing', label: 'Soil Testing / Upimaji Udongo' },
  { value: 'equipment_repair', label: 'Equipment Repair / Ukarabati' },
  { value: 'milling', label: 'Milling / Kusaga' },
  { value: 'drying', label: 'Drying / Kukaushia' },
  { value: 'packaging', label: 'Packaging / Ufungaji' },
  { value: 'financial', label: 'Financial / Mikopo' },
  { value: 'insurance', label: 'Insurance / Bima' },
  { value: 'certification', label: 'Certification / Vyeti' },
  { value: 'training', label: 'Training / Mafunzo' },
];

export const STOCK_LEVELS: Choice[] = [
  { value: 'in_stock', label: 'In Stock / Ipo' },
  { value: 'low_stock', label: 'Low Stock / Kidogo' },
  { value: 'out_of_stock', label: 'Out of Stock / Hakuna' },
  { value: 'not_sold', label: 'Not Sold Here / Hauzwi' },
];

export const MARKET_ACTIVITY: Choice[] = [
  { value: 'very_high', label: 'Very High / Juu Sana' },
  { value: 'high', label: 'High / Juu' },
  { value: 'normal', label: 'Normal / Kawaida' },
  { value: 'low', label: 'Low / Chini' },
  { value: 'very_low', label: 'Very Low / Chini Sana' },
];

export const PRODUCT_CATEGORIES: Choice[] = [
  { value: 'fertilizer', label: 'Fertilizer / Mbolea' },
  { value: 'seeds', label: 'Seeds / Mbegu' },
  { value: 'pesticides', label: 'Pesticides / Dawa Wadudu' },
  { value: 'herbicides', label: 'Herbicides / Dawa Magugu' },
  { value: 'fungicides', label: 'Fungicides / Dawa Ukungu' },
  { value: 'equipment', label: 'Equipment / Vifaa' },
  { value: 'animal_health', label: 'Animal Health / Mifugo' },
];

export const PRODUCT_CONDITIONS: Choice[] = [
  { value: 'good', label: 'Good / Nzuri' },
  { value: 'acceptable', label: 'Acceptable / Sawa' },
  { value: 'damaged', label: 'Damaged / Imeharibika' },
  { value: 'expired', label: 'Expired / Imeisha Muda' },
];

export const CHALLENGES: Choice[] = [
  { value: 'capital', label: 'Lack of Capital / Ukosefu wa Mtaji' },
  { value: 'supply', label: 'Supply Shortage / Upungufu wa Bidhaa' },
  { value: 'transport', label: 'Transport Problems / Usafiri' },
  { value: 'storage', label: 'Storage Issues / Uhifadhi' },
  { value: 'market', label: 'Market Access / Soko' },
  { value: 'prices', label: 'Price Fluctuation / Mabadiliko ya Bei' },
  { value: 'quality', label: 'Quality Issues / Ubora' },
  { value: 'pests', label: 'Pests/Disease / Wadudu/Magonjwa' },
  { value: 'weather', label: 'Weather / Hali ya Hewa' },
  { value: 'credit', label: 'Customer Credit / Deni' },
  { value: 'competition', label: 'Competition / Ushindani' },
  { value: 'regulations', label: 'Regulations / Sheria' },
];

export const DATA_QUALITY: Choice[] = [
  { value: 'high', label: 'High - All verified / Juu' },
  { value: 'medium', label: 'Medium - Mostly verified / Wastani' },
  { value: 'low', label: 'Low - Some uncertain / Chini' },
];

export const BUSINESS_STEP_LABELS = [
  'Audit Info',
  'Stakeholder',
  'Activities',
  'Stock & Prices',
  'Buying Prices',
  'Market Prices',
  'Product Audit',
  'Final Notes',
] as const;

export const BUSINESS_TOTAL_STEPS = BUSINESS_STEP_LABELS.length;
