/**
 * Zod Validation Schemas — 6-Step Farm Audit Wizard
 * NuruOS Field Intelligence
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

/** Tanzanian phone: +255 followed by 9 digits (leading zero dropped) */
const tanzanianPhone = z
  .string()
  .regex(
    /^\+255[1-9]\d{8}$/,
    'Must be a valid Tanzanian phone number (+255XXXXXXXXX)',
  );

/** GPS latitude must fall within Tanzania: approx -11.75 to -1.0 */
const tanzaniaLat = z
  .number()
  .min(-11.75, 'Latitude out of Tanzania bounds')
  .max(-1.0, 'Latitude out of Tanzania bounds');

/** GPS longitude must fall within Tanzania: approx 29.0 to 40.5 */
const tanzaniaLng = z
  .number()
  .min(29.0, 'Longitude out of Tanzania bounds')
  .max(40.5, 'Longitude out of Tanzania bounds');

/** Severity scale 0-4 (none → extreme) */
const severity = z.number().int().min(0).max(4);

// ---------------------------------------------------------------------------
// Step 1 — Identity
// ---------------------------------------------------------------------------

export const step1IdentitySchema = z.object({
  farmer_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name is too long'),
  farmer_phone: tanzanianPhone,
  farmer_national_id: z
    .string()
    .regex(/^\d{8,20}$/, 'National ID should be 8-20 digits')
    .optional()
    .or(z.literal('')),
  cooperative: z.string().max(200).optional().default(''),
  farm_name: z.string().max(200).optional().default(''),
});

export type Step1Identity = z.infer<typeof step1IdentitySchema>;

// ---------------------------------------------------------------------------
// Step 2 — Location
// ---------------------------------------------------------------------------

export const step2LocationSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
  ward: z.string().min(1, 'Ward is required'),
  village: z.string().min(1, 'Village is required'),
  gps_lat: tanzaniaLat,
  gps_lng: tanzaniaLng,
  gps_accuracy: z
    .number()
    .min(0, 'Accuracy cannot be negative')
    .max(100, 'GPS accuracy too low (>100 m) — move to open sky')
    .optional()
    .default(0),
});

export type Step2Location = z.infer<typeof step2LocationSchema>;

// ---------------------------------------------------------------------------
// Step 3 — Farm Characteristics
// ---------------------------------------------------------------------------

export const step3FarmSchema = z
  .object({
    total_area_ha: z
      .number()
      .positive('Total area must be greater than 0')
      .max(10_000, 'Area seems unrealistically large'),
    cultivated_area_ha: z
      .number()
      .nonnegative('Cultivated area cannot be negative')
      .max(10_000, 'Area seems unrealistically large'),
    land_tenure: z.enum([
      'owned',
      'leased',
      'communal',
      'government',
      'borrowed',
      'other',
    ]),
    soil_type: z.enum([
      'clay',
      'sandy',
      'loam',
      'silt',
      'clay_loam',
      'sandy_loam',
      'other',
    ]),
    irrigation_type: z.enum([
      'none',
      'drip',
      'sprinkler',
      'flood',
      'furrow',
      'bucket',
      'other',
    ]),
    water_source: z.enum([
      'rain',
      'river',
      'well',
      'borehole',
      'dam',
      'spring',
      'piped',
      'other',
    ]),
  })
  .refine((d) => d.cultivated_area_ha <= d.total_area_ha, {
    message: 'Cultivated area cannot exceed total area',
    path: ['cultivated_area_ha'],
  });

export type Step3Farm = z.infer<typeof step3FarmSchema>;

// ---------------------------------------------------------------------------
// Step 4 — Crops
// ---------------------------------------------------------------------------

const cropEntrySchema = z.object({
  crop_id: z.string().min(1, 'Select a crop'),
  area_ha: z
    .number()
    .positive('Crop area must be greater than 0')
    .max(10_000, 'Area seems unrealistically large'),
  variety: z.string().max(120).optional().default(''),
  planting_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  expected_harvest: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
});

export const step4CropsSchema = z.object({
  crops: z
    .array(cropEntrySchema)
    .min(1, 'At least one crop is required')
    .max(20, 'Too many crop entries'),
});

export type Step4Crops = z.infer<typeof step4CropsSchema>;
export type CropEntry = z.infer<typeof cropEntrySchema>;

// ---------------------------------------------------------------------------
// Step 5 — Inputs
// ---------------------------------------------------------------------------

export const step5InputsSchema = z.object({
  fertilizer_type: z
    .enum(['none', 'organic', 'inorganic', 'both'])
    .default('none'),
  fertilizer_amount_kg: z
    .number()
    .nonnegative('Amount cannot be negative')
    .max(50_000, 'Amount seems unrealistic')
    .optional()
    .default(0),
  pesticide_type: z
    .enum(['none', 'organic', 'chemical', 'both'])
    .default('none'),
  pesticide_amount_l: z
    .number()
    .nonnegative('Amount cannot be negative')
    .max(10_000, 'Amount seems unrealistic')
    .optional()
    .default(0),
  seed_type: z
    .enum(['local', 'improved', 'hybrid', 'gmo', 'mixed'])
    .default('local'),
  seed_source: z
    .enum([
      'own',
      'market',
      'government',
      'ngo',
      'agro_dealer',
      'cooperative',
      'other',
    ])
    .default('own'),
});

export type Step5Inputs = z.infer<typeof step5InputsSchema>;

// ---------------------------------------------------------------------------
// Step 6 — Yield & Constraints
// ---------------------------------------------------------------------------

const constraintSchema = z.object({
  pests: severity.default(0),
  diseases: severity.default(0),
  drought: severity.default(0),
  flooding: severity.default(0),
});

const gpsCapture = z
  .object({
    lat: tanzaniaLat,
    lng: tanzaniaLng,
    accuracy: z.number().nonnegative().optional(),
    timestamp: z.string().optional(),
  })
  .optional();

const photoEntry = z.object({
  id: z.string().min(1),
  dataUrl: z.string().optional(),
  storageUrl: z.string().url().optional(),
  label: z.string().optional(),
  timestamp: z.string(),
});

export const step6YieldSchema = z.object({
  yield_estimate_kg_ha: z
    .number()
    .nonnegative('Cannot be negative')
    .max(100_000, 'Yield seems unrealistically high')
    .optional()
    .default(0),
  actual_yield_kg_ha: z
    .number()
    .nonnegative('Cannot be negative')
    .max(100_000, 'Yield seems unrealistically high')
    .optional()
    .default(0),
  yield_loss_pct: z
    .number()
    .min(0, 'Cannot be below 0%')
    .max(100, 'Cannot exceed 100%')
    .optional()
    .default(0),
  market_channel: z
    .enum([
      'farm_gate',
      'local_market',
      'cooperative',
      'trader',
      'processor',
      'export',
      'other',
    ])
    .default('farm_gate'),
  price_per_kg_tzs: z
    .number()
    .nonnegative('Price cannot be negative')
    .max(1_000_000, 'Price seems unrealistically high')
    .optional()
    .default(0),
  constraints: constraintSchema.default({
    pests: 0,
    diseases: 0,
    drought: 0,
    flooding: 0,
  }),
  photos: z.array(photoEntry).max(20).optional().default([]),
  gps_capture: gpsCapture,
  notes: z.string().max(2000).optional().default(''),
});

export type Step6Yield = z.infer<typeof step6YieldSchema>;

// ---------------------------------------------------------------------------
// Full wizard schema (all steps combined)
// ---------------------------------------------------------------------------

export const fullAuditSchema = step1IdentitySchema
  .merge(step2LocationSchema)
  .merge(
    z.object({
      total_area_ha: z.number().positive().max(10_000),
      cultivated_area_ha: z.number().nonnegative().max(10_000),
      land_tenure: z.enum(['owned', 'leased', 'communal', 'government', 'borrowed', 'other']),
      soil_type: z.enum(['clay', 'sandy', 'loam', 'silt', 'clay_loam', 'sandy_loam', 'other']),
      irrigation_type: z.enum(['none', 'drip', 'sprinkler', 'flood', 'furrow', 'bucket', 'other']),
      water_source: z.enum(['rain', 'river', 'well', 'borehole', 'dam', 'spring', 'piped', 'other']),
    }),
  )
  .merge(step4CropsSchema)
  .merge(step5InputsSchema)
  .merge(step6YieldSchema);

export type FullAuditData = z.infer<typeof fullAuditSchema>;

// ---------------------------------------------------------------------------
// Step-indexed schema map (useful for per-step validation in the wizard)
// ---------------------------------------------------------------------------

export const stepSchemas = [
  step1IdentitySchema,
  step2LocationSchema,
  step3FarmSchema,
  step4CropsSchema,
  step5InputsSchema,
  step6YieldSchema,
] as const;

export const TOTAL_STEPS = stepSchemas.length;

/**
 * Validate data for a specific wizard step (0-indexed).
 * Returns `{ success: true, data }` or `{ success: false, error }`.
 */
export function validateStep(stepIndex: number, data: unknown) {
  if (stepIndex < 0 || stepIndex >= TOTAL_STEPS) {
    throw new RangeError(`Invalid step index: ${stepIndex}. Must be 0-${TOTAL_STEPS - 1}.`);
  }
  return stepSchemas[stepIndex].safeParse(data);
}
