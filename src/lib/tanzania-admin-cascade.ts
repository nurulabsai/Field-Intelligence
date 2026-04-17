/**
 * Region → district cascade for Pwani, Morogoro, and Ruvuma (OR-TAMISEMI field work 2026).
 * Ward/village remain free text (varies by OMR form).
 *
 * District names follow common Tanzanian admin spelling used in field tools.
 */

export const TARGET_REGION_KEYS = ['Pwani', 'Morogoro', 'Ruvuma'] as const;
export type TargetRegionName = (typeof TARGET_REGION_KEYS)[number];

/**
 * Canonical Tanzania region list (mainland + Zanzibar).
 * Alphabetical. Consumed by dropdowns in Step2_Location and StepFarmProfile.
 */
export const TANZANIA_REGIONS = [
  'Arusha',
  'Dar es Salaam',
  'Dodoma',
  'Geita',
  'Iringa',
  'Kagera',
  'Katavi',
  'Kigoma',
  'Kilimanjaro',
  'Lindi',
  'Manyara',
  'Mara',
  'Mbeya',
  'Morogoro',
  'Mtwara',
  'Mwanza',
  'Njombe',
  'Pemba North',
  'Pemba South',
  'Pwani',
  'Rukwa',
  'Ruvuma',
  'Shinyanga',
  'Simiyu',
  'Singida',
  'Songwe',
  'Tabora',
  'Tanga',
  'Unguja North',
  'Unguja South',
  'Zanzibar Central/South',
] as const;

/** Districts per region (alphabetical within region). */
export const DISTRICTS_BY_REGION: Record<TargetRegionName, readonly string[]> = {
  Pwani: [
    'Bagamoyo',
    'Kibaha',
    'Kisarawe',
    'Mafia',
    'Mkuranga',
    'Rufiji',
  ],
  Morogoro: [
    'Gairo',
    'Kilombero',
    'Kilosa',
    'Malinyi',
    'Morogoro District',
    'Morogoro Municipal',
    'Mvomero',
    'Ulanga',
  ],
  Ruvuma: [
    'Madaba',
    'Mbinga',
    'Namtumbo',
    'Nyasa',
    'Songea District',
    'Songea Municipal',
    'Tunduru',
  ],
};

export function districtsForRegion(region: string): string[] {
  if (region in DISTRICTS_BY_REGION) {
    return [...DISTRICTS_BY_REGION[region as TargetRegionName]];
  }
  return [];
}
