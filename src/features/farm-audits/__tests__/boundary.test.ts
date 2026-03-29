/**
 * Farm Boundary Collection - Unit Tests
 * Run with: npm test (if vitest configured) or manual verification
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as turf from '@turf/turf';
import { mapAuditToFarmAuditPayload } from '../../../../services/farmAuditService';
import { VALID_FARM_AUDIT, INVALID_FARM_AUDIT, TEST_CORNERS } from './testData';

describe('Boundary Calculations', () => {
  it('calculates area for 4-corner polygon', () => {
    const coordinates = TEST_CORNERS.map((c) => [c.lon, c.lat]);
    coordinates.push(coordinates[0]);
    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    const areaHa = area / 10000;
    expect(areaHa).toBeGreaterThan(0);
    expect(areaHa).toBeLessThan(10);
  });

  it('handles 3 corners (invalid - no closed polygon)', () => {
    const coords = TEST_CORNERS.slice(0, 3).map((c) => [c.lon, c.lat]);
    coords.push(coords[0]);
    const polygon = turf.polygon([coords]);
    const area = turf.area(polygon);
    expect(area).toBeGreaterThanOrEqual(0);
  });
});

describe('mapAuditToFarmAuditPayload', () => {
  it('returns valid payload for farm audit with 4 corners', () => {
    const payload = mapAuditToFarmAuditPayload(VALID_FARM_AUDIT);
    expect(payload).not.toBeNull();
    expect(payload!.boundary_corners).toHaveLength(4);
    expect(payload!.farmer_name).toContain('John');
    expect(payload!.target_region).toBe('Pwani');
    expect(payload!.crops_grown.length).toBeGreaterThan(0);
  });

  it('returns null for audit with <4 corners', () => {
    const payload = mapAuditToFarmAuditPayload(INVALID_FARM_AUDIT);
    expect(payload).toBeNull();
  });

  it('returns null for non-farm audit', () => {
    const businessAudit = { ...VALID_FARM_AUDIT, type: 'business' as const, businessData: {} };
    const payload = mapAuditToFarmAuditPayload(businessAudit);
    expect(payload).toBeNull();
  });

  it('uses centroid from corners when location missing', () => {
    const auditNoLocation = {
      ...VALID_FARM_AUDIT,
      location: null,
    };
    const payload = mapAuditToFarmAuditPayload(auditNoLocation);
    expect(payload).not.toBeNull();
    const expectedLat = TEST_CORNERS.reduce((s, c) => s + c.lat, 0) / 4;
    const expectedLon = TEST_CORNERS.reduce((s, c) => s + c.lon, 0) / 4;
    expect(Math.abs(payload!.farm_latitude - expectedLat)).toBeLessThan(0.0001);
    expect(Math.abs(payload!.farm_longitude - expectedLon)).toBeLessThan(0.0001);
  });
});
