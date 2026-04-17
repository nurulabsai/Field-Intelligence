/**
 * Canonical wizard option values — must match `src/lib/validations.ts` z.enum lists.
 * Labels support bilingual display (EN primary, SW secondary).
 */

export interface EnumOption {
  value: string;
  labelEn: string;
  labelSw: string;
}

export const SOIL_TYPE_OPTIONS: EnumOption[] = [
  { value: 'clay', labelEn: 'Clay', labelSw: 'Udongo wa udongo' },
  { value: 'sandy', labelEn: 'Sandy', labelSw: 'Mchanga' },
  { value: 'loam', labelEn: 'Loam', labelSw: 'Loam' },
  { value: 'silt', labelEn: 'Silt', labelSw: 'Silt' },
  { value: 'clay_loam', labelEn: 'Clay loam', labelSw: 'Loam ya udongo' },
  { value: 'sandy_loam', labelEn: 'Sandy loam', labelSw: 'Loam ya mchanga' },
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];

export const IRRIGATION_TYPE_OPTIONS: EnumOption[] = [
  { value: 'none', labelEn: 'None', labelSw: 'Hakuna' },
  { value: 'drip', labelEn: 'Drip', labelSw: 'Drip' },
  { value: 'sprinkler', labelEn: 'Sprinkler', labelSw: 'Sprinkler' },
  { value: 'flood', labelEn: 'Flood', labelSw: 'Mafuriko' },
  { value: 'furrow', labelEn: 'Furrow', labelSw: 'Mishimo' },
  { value: 'bucket', labelEn: 'Bucket / manual', labelSw: 'Ndoo / mkono' },
  { value: 'other', labelEn: 'Other (e.g. canal)', labelSw: 'Nyingine (mf. mifereji)' },
];

export const WATER_SOURCE_OPTIONS: EnumOption[] = [
  { value: 'rain', labelEn: 'Rain', labelSw: 'Mvua' },
  { value: 'river', labelEn: 'River', labelSw: 'Mto' },
  { value: 'well', labelEn: 'Well', labelSw: 'Kisima' },
  { value: 'borehole', labelEn: 'Borehole', labelSw: 'Kisima cha kina' },
  { value: 'dam', labelEn: 'Dam', labelSw: 'Bwawa' },
  { value: 'spring', labelEn: 'Spring', labelSw: 'Chemchemi' },
  { value: 'piped', labelEn: 'Piped water', labelSw: 'Maji ya bomba' },
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];

export const LAND_TENURE_OPTIONS: EnumOption[] = [
  { value: 'owned', labelEn: 'Owned', labelSw: 'Mwenye' },
  { value: 'leased', labelEn: 'Leased', labelSw: 'Kodi' },
  { value: 'communal', labelEn: 'Communal', labelSw: 'Ya jamii' },
  { value: 'government', labelEn: 'Government', labelSw: 'Serikali' },
  { value: 'borrowed', labelEn: 'Borrowed', labelSw: 'Amajiriwa' },
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];

export const FERTILIZER_TYPE_OPTIONS: EnumOption[] = [
  { value: 'none', labelEn: 'None', labelSw: 'Hakuna' },
  { value: 'organic', labelEn: 'Organic only', labelSw: 'Mbolea ya asili tu' },
  { value: 'inorganic', labelEn: 'Inorganic only', labelSw: 'Mbolea ya kemikali tu' },
  { value: 'both', labelEn: 'Organic + inorganic', labelSw: 'Asili na kemikali' },
];

export const PESTICIDE_TYPE_OPTIONS: EnumOption[] = [
  { value: 'none', labelEn: 'None', labelSw: 'Hakuna' },
  { value: 'organic', labelEn: 'Organic / bio-pesticides', labelSw: 'Dawa za asili' },
  { value: 'chemical', labelEn: 'Chemical', labelSw: 'Dawa za kemikali' },
  { value: 'both', labelEn: 'Organic + chemical', labelSw: 'Asili na kemikali' },
];

export const SEED_TYPE_OPTIONS: EnumOption[] = [
  { value: 'local', labelEn: 'Local / farmer-saved', labelSw: 'Za kienyeji' },
  { value: 'improved', labelEn: 'Improved (OPV)', labelSw: 'Zilizoboreshwa' },
  { value: 'hybrid', labelEn: 'Hybrid', labelSw: 'Hybrid' },
  { value: 'gmo', labelEn: 'GMO', labelSw: 'GMO' },
  { value: 'mixed', labelEn: 'Mixed sources', labelSw: 'Mchanganyiko' },
];

export const SEED_SOURCE_OPTIONS: EnumOption[] = [
  { value: 'own', labelEn: 'Own saved', labelSw: 'Zilizohifadhiwa nyumbani' },
  { value: 'market', labelEn: 'Market', labelSw: 'Soko' },
  { value: 'government', labelEn: 'Government', labelSw: 'Serikali' },
  { value: 'ngo', labelEn: 'NGO / project', labelSw: 'NGO / mradi' },
  { value: 'agro_dealer', labelEn: 'Agro-dealer', labelSw: 'Muuzaji wa pembejeo' },
  { value: 'cooperative', labelEn: 'Cooperative', labelSw: 'Ushirika' },
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];

/**
 * Canonical crop list — 35 Tanzania-relevant crops with bilingual labels.
 * Values are snake_case and stable: they are persisted as `crop_id` and
 * `current_crop`, so renaming requires a data migration. Keep this list in
 * sync with any downstream crop taxonomy / lookup tables.
 */
export const CROP_OPTIONS: EnumOption[] = [
  // Cereals / staples
  { value: 'maize', labelEn: 'Maize', labelSw: 'Mahindi' },
  { value: 'rice', labelEn: 'Rice', labelSw: 'Mpunga' },
  { value: 'wheat', labelEn: 'Wheat', labelSw: 'Ngano' },
  { value: 'sorghum', labelEn: 'Sorghum', labelSw: 'Mtama' },
  { value: 'millet', labelEn: 'Millet', labelSw: 'Uwele' },
  // Roots / tubers
  { value: 'cassava', labelEn: 'Cassava', labelSw: 'Muhogo' },
  { value: 'sweet_potato', labelEn: 'Sweet potato', labelSw: 'Viazi vitamu' },
  { value: 'irish_potato', labelEn: 'Irish potato', labelSw: 'Viazi mviringo' },
  // Legumes / pulses
  { value: 'beans', labelEn: 'Beans', labelSw: 'Maharage' },
  { value: 'groundnuts', labelEn: 'Groundnuts', labelSw: 'Karanga' },
  { value: 'pigeon_pea', labelEn: 'Pigeon pea', labelSw: 'Mbaazi' },
  { value: 'cowpea', labelEn: 'Cowpea', labelSw: 'Kunde' },
  { value: 'green_gram', labelEn: 'Green gram', labelSw: 'Choroko' },
  // Oilseeds
  { value: 'sunflower', labelEn: 'Sunflower', labelSw: 'Alizeti' },
  { value: 'sesame', labelEn: 'Sesame', labelSw: 'Ufuta' },
  { value: 'soybean', labelEn: 'Soybean', labelSw: 'Soya' },
  // Cash crops
  { value: 'cotton', labelEn: 'Cotton', labelSw: 'Pamba' },
  { value: 'coffee', labelEn: 'Coffee', labelSw: 'Kahawa' },
  { value: 'tea', labelEn: 'Tea', labelSw: 'Chai' },
  { value: 'cashew', labelEn: 'Cashew nuts', labelSw: 'Korosho' },
  { value: 'tobacco', labelEn: 'Tobacco', labelSw: 'Tumbaku' },
  { value: 'sisal', labelEn: 'Sisal', labelSw: 'Mkonge' },
  { value: 'cocoa', labelEn: 'Cocoa', labelSw: 'Kakao' },
  // Fruits
  { value: 'banana', labelEn: 'Banana', labelSw: 'Ndizi' },
  { value: 'coconut', labelEn: 'Coconut', labelSw: 'Nazi' },
  { value: 'mango', labelEn: 'Mango', labelSw: 'Embe' },
  { value: 'orange', labelEn: 'Orange', labelSw: 'Chungwa' },
  { value: 'pineapple', labelEn: 'Pineapple', labelSw: 'Nanasi' },
  { value: 'avocado', labelEn: 'Avocado', labelSw: 'Parachichi' },
  // Vegetables
  { value: 'tomato', labelEn: 'Tomato', labelSw: 'Nyanya' },
  { value: 'onion', labelEn: 'Onion', labelSw: 'Kitunguu' },
  { value: 'cabbage', labelEn: 'Cabbage', labelSw: 'Kabichi' },
  { value: 'okra', labelEn: 'Okra', labelSw: 'Bamia' },
  { value: 'spinach', labelEn: 'Spinach', labelSw: 'Mchicha' },
  // Fallback
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];

export const MARKET_CHANNEL_OPTIONS: EnumOption[] = [
  { value: 'farm_gate', labelEn: 'Farm gate', labelSw: 'Shambani' },
  { value: 'local_market', labelEn: 'Local market', labelSw: 'Soko la ndani' },
  { value: 'cooperative', labelEn: 'Cooperative', labelSw: 'Ushirika' },
  { value: 'trader', labelEn: 'Trader', labelSw: 'Mfanyabiashara' },
  { value: 'processor', labelEn: 'Processor', labelSw: 'Kiwanda' },
  { value: 'export', labelEn: 'Export', labelSw: 'Nje ya nchi' },
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];

function optLabel(o: EnumOption, lang: 'en' | 'sw'): string {
  return lang === 'sw' ? `${o.labelSw} / ${o.labelEn}` : `${o.labelEn} / ${o.labelSw}`;
}

export function optionsForDropdown(options: EnumOption[], lang: 'en' | 'sw') {
  return options.map(o => ({ value: o.value, label: optLabel(o, lang) }));
}

/** OR-TAMISEMI constraint multiselect — values match validations ortamisemiConstraintTagEnum. */
export const ORTAMISEMI_CONSTRAINT_OPTIONS: EnumOption[] = [
  { value: 'input_access', labelEn: 'Inputs access', labelSw: 'Upatikanaji wa pembejeo' },
  { value: 'finance_credit', labelEn: 'Finance / credit', labelSw: 'Fedha / mkopo' },
  { value: 'labour_shortage', labelEn: 'Labour shortage', labelSw: 'Ukosefu wa kazi' },
  { value: 'land_access', labelEn: 'Land access', labelSw: 'Upatikanaji wa ardhi' },
  { value: 'extension_services', labelEn: 'Extension services', labelSw: 'Huduma ya ugani' },
  { value: 'water_irrigation', labelEn: 'Water / irrigation', labelSw: 'Maji / umwagiliaji' },
  { value: 'pests_diseases', labelEn: 'Pests & diseases', labelSw: 'Wadudu na magonjwa' },
  { value: 'postharvest_market', labelEn: 'Post-harvest / market', labelSw: 'Baada ya mavuno / soko' },
  { value: 'climate_weather', labelEn: 'Climate / weather', labelSw: 'Tabianchi / hali ya hewa' },
  { value: 'transport', labelEn: 'Transport', labelSw: 'Usafiri' },
  { value: 'other', labelEn: 'Other', labelSw: 'Nyingine' },
];
