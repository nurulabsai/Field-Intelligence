import { describe, it, expect } from 'vitest';
import {
  step1IdentitySchema,
  step2LocationSchema,
  step3FarmSchema,
  step4CropsSchema,
  step5InputsSchema,
  step6YieldSchema,
  validateStep,
  TOTAL_STEPS,
} from '../validations';

// ---------------------------------------------------------------------------
// Step 1 — Identity
// ---------------------------------------------------------------------------

describe('step1IdentitySchema', () => {
  const valid = {
    farmer_name: 'Juma Mwangi',
    farmer_phone: '+255712345678',
    farmer_gender: 'male' as const,
    farmer_dob: '1985-06-15',
    reporting_season: 'masika_2025_26' as const,
    labour_types: ['family_only' as const],
    data_use_consent: true as const,
    farm_name: 'Kijiji farm',
  };

  it('accepts valid identity data', () => {
    expect(step1IdentitySchema.safeParse(valid).success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    const result = step1IdentitySchema.safeParse({ ...valid, farmer_name: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid Tanzanian phone', () => {
    const result = step1IdentitySchema.safeParse({ ...valid, farmer_phone: '+1234567890' });
    expect(result.success).toBe(false);
  });

  it('normalizes phone with leading zero to +255 prefix', () => {
    const result = step1IdentitySchema.safeParse({ ...valid, farmer_phone: '0712345678' });
    expect(result.success).toBe(true);
  });

  it('accepts optional national ID', () => {
    const result = step1IdentitySchema.safeParse({
      ...valid,
      farmer_national_id: '12345678',
      cooperative: '',
      farm_name: 'Test farm',
    });
    expect(result.success).toBe(true);
  });

  it('rejects national ID with letters', () => {
    const result = step1IdentitySchema.safeParse({
      ...valid,
      cooperative: '',
      farm_name: 'F',
      farmer_national_id: 'ABC123',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step 2 — Location
// ---------------------------------------------------------------------------

describe('step2LocationSchema', () => {
  const valid = {
    region: 'Pwani',
    district: 'Rufiji',
    ward: 'Utete',
    village: 'Kikale',
    gps_lat: -7.47,
    gps_lng: 39.18,
  };

  it('accepts valid Tanzanian location', () => {
    expect(step2LocationSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects latitude outside Tanzania', () => {
    const result = step2LocationSchema.safeParse({ ...valid, gps_lat: 5.0 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude outside Tanzania', () => {
    const result = step2LocationSchema.safeParse({ ...valid, gps_lng: 10.0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty region', () => {
    const result = step2LocationSchema.safeParse({ ...valid, region: '' });
    expect(result.success).toBe(false);
  });

  it('accepts GPS accuracy up to 100m', () => {
    const result = step2LocationSchema.safeParse({ ...valid, gps_accuracy: 50 });
    expect(result.success).toBe(true);
  });

  it('rejects GPS accuracy over 100m', () => {
    const result = step2LocationSchema.safeParse({ ...valid, gps_accuracy: 150 });
    expect(result.success).toBe(false);
  });

  it('maps latitude/longitude to gps_lat/gps_lng', () => {
    const result = step2LocationSchema.safeParse({
      region: 'Pwani',
      district: 'Rufiji',
      ward: 'Utete',
      village: 'Kikale',
      latitude: -7.47,
      longitude: 39.18,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gps_lat).toBe(-7.47);
      expect(result.data.gps_lng).toBe(39.18);
    }
  });
});

// ---------------------------------------------------------------------------
// Step 3 — Farm Characteristics
// ---------------------------------------------------------------------------

describe('step3FarmSchema', () => {
  const valid = {
    total_area_ha: 10,
    cultivated_area_ha: 8,
    land_tenure: 'owned' as const,
    soil_type: 'loam' as const,
    irrigation_type: 'drip' as const,
    water_source: 'river' as const,
  };

  it('accepts valid farm data', () => {
    expect(step3FarmSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects cultivated area exceeding total area', () => {
    const result = step3FarmSchema.safeParse({ ...valid, cultivated_area_ha: 15 });
    expect(result.success).toBe(false);
  });

  it('rejects zero total area', () => {
    const result = step3FarmSchema.safeParse({ ...valid, total_area_ha: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects unrealistically large area', () => {
    const result = step3FarmSchema.safeParse({ ...valid, total_area_ha: 20_000 });
    expect(result.success).toBe(false);
  });

  it('accepts Swahili decimal-comma input ("2,5" → 2.5 ha)', () => {
    const result = step3FarmSchema.safeParse({
      ...valid,
      total_area_ha: '2,5',
      cultivated_area_ha: '1,75',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total_area_ha).toBe(2.5);
      expect(result.data.cultivated_area_ha).toBe(1.75);
    }
  });

  it('enforces cultivated ≤ total when both use comma decimals', () => {
    const result = step3FarmSchema.safeParse({
      ...valid,
      total_area_ha: '2,0',
      cultivated_area_ha: '2,5',
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step 4 — Crops
// ---------------------------------------------------------------------------

describe('step4CropsSchema', () => {
  it('accepts valid crop entries', () => {
    const result = step4CropsSchema.safeParse({
      crops: [{ crop_id: 'maize', area_ha: 5 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty crops array', () => {
    const result = step4CropsSchema.safeParse({ crops: [] });
    expect(result.success).toBe(false);
  });

  it('rejects crop with zero area', () => {
    const result = step4CropsSchema.safeParse({
      crops: [{ crop_id: 'maize', area_ha: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts planting date in YYYY-MM-DD format', () => {
    const result = step4CropsSchema.safeParse({
      crops: [{ crop_id: 'rice', area_ha: 3, planting_date: '2025-03-15' }],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 5 — Inputs
// ---------------------------------------------------------------------------

describe('step5InputsSchema', () => {
  it('accepts defaults (all none/zero)', () => {
    const result = step5InputsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid input data', () => {
    const result = step5InputsSchema.safeParse({
      fertilizer_type: 'organic',
      fertilizer_amount_kg: 500,
      seed_type: 'hybrid',
      seed_source: 'agro_dealer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative fertilizer amount', () => {
    const result = step5InputsSchema.safeParse({ fertilizer_amount_kg: -10 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Step 6 — Yield & Constraints
// ---------------------------------------------------------------------------

describe('step6YieldSchema', () => {
  it('accepts defaults (all zero)', () => {
    const result = step6YieldSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid yield data', () => {
    const result = step6YieldSchema.safeParse({
      yield_estimate_kg_ha: 3000,
      actual_yield_kg_ha: 2500,
      yield_loss_pct: 15,
      market_channel: 'cooperative',
      price_per_kg_tzs: 800,
      ortamisemi_constraint_tags: ['input_access', 'finance_credit'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects yield loss over 100%', () => {
    const result = step6YieldSchema.safeParse({ yield_loss_pct: 110 });
    expect(result.success).toBe(false);
  });

  it('validates constraint severity range 0-4', () => {
    const result = step6YieldSchema.safeParse({
      constraints: { pests: 5, diseases: 0, drought: 0, flooding: 0 },
      ortamisemi_constraint_tags: ['other'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid photo entries', () => {
    const result = step6YieldSchema.safeParse({
      photos: [{ id: 'p1', timestamp: '2025-03-15T10:00:00Z', label: 'field' }],
      ortamisemi_constraint_tags: ['pests_diseases'],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateStep helper
// ---------------------------------------------------------------------------

describe('validateStep', () => {
  it('returns TOTAL_STEPS = 11', () => {
    expect(TOTAL_STEPS).toBe(11);
  });

  it('validates step 0 (identity)', () => {
    const result = validateStep(0, {
      farmer_name: 'Test User',
      farmer_phone: '+255712345678',
      farmer_gender: 'female',
      farmer_dob: '1990-01-01',
      reporting_season: 'masika_2025_26',
      labour_types: ['none'],
      data_use_consent: true,
      farm_name: 'Demo farm',
    });
    expect(result.success).toBe(true);
  });

  it('returns error for invalid step 0 data', () => {
    const result = validateStep(0, { farmer_name: '' });
    expect(result.success).toBe(false);
  });

  it('throws RangeError for out-of-bounds step', () => {
    expect(() => validateStep(-1, {})).toThrow(RangeError);
    expect(() => validateStep(11, {})).toThrow(RangeError);
  });
});
