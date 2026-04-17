/**
 * Zod Validation Schemas — 6-Step Farm Audit Wizard
 * NuruOS Field Intelligence
 */

import { z } from 'zod';
import { normalizeDecimalComma, parseLocaleNumber } from './utils';

// ---------------------------------------------------------------------------
// Locale-aware numeric coercion
// ---------------------------------------------------------------------------

/**
 * Wraps an inner numeric schema with a Swahili decimal-comma preprocessor so
 * users typing "2,5" (meaning 2.5) are accepted alongside "2.5". Numbers pass
 * through untouched; non-strings are left alone so downstream refinements
 * (range, non-negative, etc.) can reject them normally.
 *
 * @example
 *   localeNumber(z.coerce.number().positive().max(10_000))
 */
function localeNumber<S extends z.ZodTypeAny>(inner: S) {
  return z.preprocess(
    (v) => (typeof v === 'string' ? normalizeDecimalComma(v) : v),
    inner,
  );
}

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

/** Tanzanian phone: +255 followed by 9 digits (leading zero dropped).
 *  Accepts bare 9-digit input (UI shows +255 prefix separately). */
const tanzanianPhone = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  let v = val.trim();
  if (/^0\d{9}$/.test(v)) v = v.slice(1);
  if (/^[1-9]\d{8}$/.test(v)) v = `+255${v}`;
  return v;
}, z
  .string()
  .regex(
    /^\+255[1-9]\d{8}$/,
    'Must be a valid Tanzanian phone number (+255XXXXXXXXX)',
  ));

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

export const farmerGenderEnum = z.enum(['female', 'male', 'other', 'prefer_not_say'], {
  error: 'Gender is required',
});

export const reportingSeasonEnum = z.enum(
  [
    'masika_2024_25',
    'vuli_2024_25',
    'masika_2025_26',
    'vuli_2025_26',
    'long_rains_2025',
    'short_rains_2025',
    'other_season',
  ],
  { error: 'Reporting season is required' },
);

export const labourTypeEnum = z.enum(
  [
    'family_only',
    'hired_daily',
    'hired_seasonal',
    'exchange_labour',
    'mechanized',
    'none',
  ],
  { error: 'Invalid labour type' },
);

/** OR-TAMISEMI-style production constraints (multiselect). */
export const ortamisemiConstraintTagEnum = z.enum([
  'input_access',
  'finance_credit',
  'labour_shortage',
  'land_access',
  'extension_services',
  'water_irrigation',
  'pests_diseases',
  'postharvest_market',
  'climate_weather',
  'transport',
  'other',
]);

export const step1IdentitySchema = z
  .object({
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
    farm_name: z.string().min(1, 'Farm name is required').max(200),
    farmer_gender: farmerGenderEnum,
    farmer_dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for date of birth'),
    reporting_season: reportingSeasonEnum,
    labour_types: z
      .array(labourTypeEnum)
      .min(1, 'Select at least one labour category'),
    /** Shown after consent gate — must stay true to pass step 0. */
    data_use_consent: z.literal(true),
    /** Set by UI when Supabase finds the same E.164 phone on dim_actors. */
    phone_duplicate_detected: z.boolean().optional(),
    /** User confirms they are auditing the correct person / intentional re-entry. */
    phone_duplicate_confirmed: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.phone_duplicate_detected && !data.phone_duplicate_confirmed) {
      ctx.addIssue({
        code: 'custom',
        path: ['farmer_phone'],
        message:
          'This phone is already registered. Confirm with the farmer or change the number.',
      });
    }
  });

export type Step1Identity = z.infer<typeof step1IdentitySchema>;

// ---------------------------------------------------------------------------
// Step 2 — Location
// ---------------------------------------------------------------------------

const step2LocationCore = z.object({
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

/** Accepts `gps_lat` / `gps_lng` or legacy `latitude` / `longitude` from the location step UI. */
export const step2LocationSchema = z.preprocess((raw) => {
  if (typeof raw !== 'object' || raw === null) return raw;
  const o = { ...(raw as Record<string, unknown>) };
  if (typeof o.latitude === 'number' && o.gps_lat === undefined) o.gps_lat = o.latitude;
  if (typeof o.longitude === 'number' && o.gps_lng === undefined) o.gps_lng = o.longitude;
  return o;
}, step2LocationCore);

export type Step2Location = z.infer<typeof step2LocationSchema>;

// ---------------------------------------------------------------------------
// Step 3 — Farm Characteristics
// ---------------------------------------------------------------------------

export const step3FarmSchema = z
  .object({
    total_area_ha: localeNumber(
      z.coerce
        .number()
        .positive('Total area must be greater than 0')
        .max(10_000, 'Area seems unrealistically large'),
    ),
    cultivated_area_ha: localeNumber(
      z.coerce
        .number()
        .nonnegative('Cultivated area cannot be negative')
        .max(10_000, 'Area seems unrealistically large'),
    ),
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
  area_ha: localeNumber(
    z.coerce
      .number()
      .positive('Crop area must be greater than 0')
      .max(10_000, 'Area seems unrealistically large'),
  ),
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
  fertilizer_amount_kg: localeNumber(
    z.coerce
      .number()
      .nonnegative('Amount cannot be negative')
      .max(50_000, 'Amount seems unrealistic')
      .optional()
      .default(0),
  ),
  pesticide_type: z
    .enum(['none', 'organic', 'chemical', 'both'])
    .default('none'),
  pesticide_amount_l: localeNumber(
    z.coerce
      .number()
      .nonnegative('Amount cannot be negative')
      .max(10_000, 'Amount seems unrealistic')
      .optional()
      .default(0),
  ),
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

function numish(v: unknown): number | undefined {
  const n = parseLocaleNumber(v);
  return n === null ? undefined : n;
}

/** Maps legacy Step6 field names and flat constraint keys into schema shape. */
function preprocessStep6Yield(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  const o = { ...(raw as Record<string, unknown>) };

  if (o.yield_estimate_kg_ha === undefined) {
    const n = numish(o.yield_estimate);
    if (n !== undefined) o.yield_estimate_kg_ha = n;
  }
  if (o.actual_yield_kg_ha === undefined) {
    const n = numish(o.actual_yield);
    if (n !== undefined) o.actual_yield_kg_ha = n;
  }
  if (o.yield_loss_pct === undefined && o.yield_loss !== undefined) {
    const n = numish(o.yield_loss);
    if (n !== undefined) o.yield_loss_pct = n;
  }
  if (o.price_per_kg_tzs === undefined) {
    const n = numish(o.price_per_kg);
    if (n !== undefined) o.price_per_kg_tzs = n;
  }

  if (
    (o.gps_capture === undefined || o.gps_capture === null) &&
    typeof o.yield_latitude === 'number' &&
    typeof o.yield_longitude === 'number'
  ) {
    o.gps_capture = {
      lat: o.yield_latitude,
      lng: o.yield_longitude,
      accuracy: numish(o.yield_gps_accuracy),
    };
  }

  const hasFlat =
    o.constraint_pests !== undefined ||
    o.constraint_diseases !== undefined ||
    o.constraint_drought !== undefined ||
    o.constraint_flooding !== undefined;
  if ((o.constraints === undefined || o.constraints === null) && hasFlat) {
    o.constraints = {
      pests: numish(o.constraint_pests) ?? 0,
      diseases: numish(o.constraint_diseases) ?? 0,
      drought: numish(o.constraint_drought) ?? 0,
      flooding: numish(o.constraint_flooding) ?? 0,
    };
  }

  const ph = o.photos;
  if (Array.isArray(ph) && ph.length > 0 && typeof ph[0] === 'string') {
    o.photos = (ph as string[]).map((dataUrl, i) => ({
      id: `legacy_${i}_${Date.now()}`,
      dataUrl,
      timestamp: new Date().toISOString(),
    }));
  }

  const tags = o.ortamisemi_constraint_tags;
  if (!Array.isArray(tags) || tags.length === 0) {
    o.ortamisemi_constraint_tags = ['other'];
  }

  return o;
}

export const step6YieldSchema = z.preprocess(
  preprocessStep6Yield,
  z.object({
    yield_estimate_kg_ha: localeNumber(
      z.coerce
        .number()
        .nonnegative('Cannot be negative')
        .max(100_000, 'Yield seems unrealistically high')
        .optional()
        .default(0),
    ),
    actual_yield_kg_ha: localeNumber(
      z.coerce
        .number()
        .nonnegative('Cannot be negative')
        .max(100_000, 'Yield seems unrealistically high')
        .optional()
        .default(0),
    ),
    yield_loss_pct: localeNumber(
      z.coerce
        .number()
        .min(0, 'Cannot be below 0%')
        .max(100, 'Cannot exceed 100%')
        .optional()
        .default(0),
    ),
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
    price_per_kg_tzs: localeNumber(
      z.coerce
        .number()
        .nonnegative('Price cannot be negative')
        .max(1_000_000, 'Price seems unrealistically high')
        .optional()
        .default(0),
    ),
    constraints: constraintSchema.default({
      pests: 0,
      diseases: 0,
      drought: 0,
      flooding: 0,
    }),
    /** OR-TAMISEMI multiselect — distinct from severity sliders. */
    ortamisemi_constraint_tags: z
      .array(ortamisemiConstraintTagEnum)
      .min(1, 'Select at least one production constraint'),
    photos: z.array(photoEntry).max(20).optional().default([]),
    gps_capture: gpsCapture,
    notes: z.string().max(2000).optional().default(''),
  }),
);

export type Step6Yield = z.infer<typeof step6YieldSchema>;

// ---------------------------------------------------------------------------
// Step 2b — Farm Profile (new)
// ---------------------------------------------------------------------------

export const stepFarmProfileSchema = z.object({
  farm_profile: z.object({
    id: z.string().min(1),
    farm_name: z.string().min(1, 'Farm name is required').max(200),
    farmer_name: z.string().min(2, 'Farmer name must be at least 2 characters').max(120),
    farmer_phone: z.string().min(1, 'Farmer phone is required'),
    village: z.string().min(1, 'Village is required'),
    ward: z.string().min(1, 'Ward is required'),
    district: z.string().min(1, 'District is required'),
    region: z.string().min(1, 'Region is required'),
    total_area_ha: localeNumber(
      z.coerce
        .number()
        .positive('Farm area must be greater than 0')
        .max(10_000),
    ),
    tenure_type: z.enum(['owned', 'leased', 'communal', 'government', 'borrowed', 'other'], {
      error: 'Tenure type is required',
    }),
    farming_system: z.enum(['rainfed', 'irrigated', 'mixed'], {
      error: 'Farming system is required',
    }),
    contact_number: z.string().optional().default(''),
    water_source: z.string().optional().default(''),
    notes: z.string().max(2000).optional().default(''),
  }),
});

export type StepFarmProfile = z.infer<typeof stepFarmProfileSchema>;

// ---------------------------------------------------------------------------
// Step 2c — Farm Boundary (new)
// ---------------------------------------------------------------------------

const gpsBoundaryPointSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  accuracy: z.number(),
  timestamp: z.string(),
  sequence: z.number(),
});

export const stepFarmBoundarySchema = z.object({
  farm_boundary: z.object({
    id: z.string().min(1),
    farm_id: z.string().min(1),
    capture_method: z.string().default(''),
    points: z.array(gpsBoundaryPointSchema).default([]),
    status: z.enum(['draft', 'complete', 'skipped']),
    confidence: z.string().default(''),
    captured_at: z.string().default(''),
    captured_by: z.string().default(''),
    gps_accuracy_summary: z.any().nullable(),
    area_ha: z.number().nullable(),
    notes: z.string().max(2000).optional().default(''),
    skip_reason: z.string().optional().default(''),
  }).refine(
    d => d.status === 'skipped' || d.status === 'complete',
    { message: 'Please capture the farm boundary or provide a reason for skipping' },
  ),
});

export type StepFarmBoundary = z.infer<typeof stepFarmBoundarySchema>;

// ---------------------------------------------------------------------------
// Step 2d — Plot Structure (new)
// ---------------------------------------------------------------------------

const plotGpsSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  accuracy: z.number(),
  timestamp: z.string(),
}).nullable();

const plotSchema = z.object({
  id: z.string().min(1),
  farm_id: z.string().min(1),
  name: z.string().min(1, 'Plot name is required'),
  area_ha: localeNumber(
    z.coerce.number().positive('Plot area must be greater than 0'),
  ),
  status: z.enum(['active', 'fallow', 'prepared', 'abandoned'], {
    error: 'Plot status is required',
  }),
  current_crop: z.string().min(1, 'Current crop is required'),
  variety: z.string().optional().default(''),
  growth_stage: z.enum([
    'germination', 'vegetative', 'flowering', 'fruiting',
    'maturity', 'harvest', 'post_harvest',
  ], { error: 'Growth stage is required' }),
  irrigation_status: z.enum(['irrigated', 'rainfed', 'supplemental'], {
    error: 'Irrigation status is required',
  }),
  center_gps: plotGpsSchema,
  planting_season: z.string().optional().default(''),
  photo: z.string().optional().default(''),
  notes: z.string().max(2000).optional().default(''),
});

export const stepPlotStructureSchema = z.object({
  plots: z.array(plotSchema).min(1, 'At least one plot is required').max(50),
});

export type StepPlotStructure = z.infer<typeof stepPlotStructureSchema>;

// ---------------------------------------------------------------------------
// Step 2e — Plot Observations (new)
// ---------------------------------------------------------------------------

const plotObservationSchema = z.object({
  id: z.string().min(1),
  plot_id: z.string().min(1, 'Observation must be linked to a plot'),
  plot_name: z.string().default(''),
  crop_condition: z.enum(['excellent', 'good', 'fair', 'poor', 'failed'], {
    error: 'Crop condition is required',
  }),
  pest_present: z.boolean({ error: 'Indicate if pests are present' }),
  disease_present: z.boolean({ error: 'Indicate if disease is present' }),
  pest_type: z.string().optional().default(''),
  pest_severity: z.string().optional().default(''),
  disease_type: z.string().optional().default(''),
  disease_severity: z.string().optional().default(''),
  stress_level: z.string().optional().default(''),
  plant_vigor: z.string().optional().default(''),
  soil_moisture: z.string().optional().default(''),
  weed_pressure: z.string().optional().default(''),
  yield_outlook: z.string().optional().default(''),
  notes: z.string().max(2000).optional().default(''),
  photo: z.string().optional().default(''),
  voice_note: z.string().optional().default(''),
});

export const stepPlotObservationsSchema = z.object({
  plot_observations: z.array(plotObservationSchema).min(1, 'At least one plot observation is required'),
});

export type StepPlotObservations = z.infer<typeof stepPlotObservationsSchema>;

// ---------------------------------------------------------------------------
// Full wizard schema (all steps combined) — 10-step form
// ---------------------------------------------------------------------------

/** Full wizard: `.and()` composes preprocess-wrapped steps (Zod 4) where `.merge()` cannot. */
export const fullAuditSchema = step1IdentitySchema
  .and(step2LocationSchema)
  .and(stepFarmProfileSchema)
  .and(stepFarmBoundarySchema)
  .and(stepPlotStructureSchema)
  .and(stepPlotObservationsSchema)
  .and(
    z.object({
      total_area_ha: z.number().positive().max(10_000),
      cultivated_area_ha: z.number().nonnegative().max(10_000),
      land_tenure: z.enum(['owned', 'leased', 'communal', 'government', 'borrowed', 'other']),
      soil_type: z.enum(['clay', 'sandy', 'loam', 'silt', 'clay_loam', 'sandy_loam', 'other']),
      irrigation_type: z.enum(['none', 'drip', 'sprinkler', 'flood', 'furrow', 'bucket', 'other']),
      water_source: z.enum(['rain', 'river', 'well', 'borehole', 'dam', 'spring', 'piped', 'other']),
    }),
  )
  .and(step4CropsSchema)
  .and(step5InputsSchema)
  .and(step6YieldSchema);

export type FullAuditData = z.infer<typeof fullAuditSchema>;

// ---------------------------------------------------------------------------
// Step-indexed schema map — 10 steps
// ---------------------------------------------------------------------------

/**
 * Lenient passthrough schema used for new steps where validation is
 * advisory rather than blocking (the step components handle their own
 * inline validation). Using z.any() lets the wizard advance freely
 * while the step components show inline warnings.
 */
const passthroughSchema = z.record(z.string(), z.any());

export const stepSchemas = [
  step1IdentitySchema,       // 0 - Identity (+ OR-TAMISEMI core fields)
  step2LocationSchema,       // 1 - Location
  passthroughSchema,         // 2 - Farm Profile (inline validation)
  passthroughSchema,         // 3 - Farm Boundary (inline validation)
  passthroughSchema,         // 4 - Plot Structure (inline validation)
  passthroughSchema,         // 5 - Plot Observations (inline validation)
  step3FarmSchema,           // 6 - Farm Characteristics
  step4CropsSchema,          // 7 - Crops
  step5InputsSchema,         // 8 - Inputs
  step6YieldSchema,          // 9 - Yield
  passthroughSchema,         // 10 - Submission review (inline)
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
  return stepSchemas[stepIndex]!.safeParse(data);
}
