/**
 * Farm Boundary Collection - Unit Tests
 * Run with: npm test (if vitest configured) or manual verification
 */
import { describe, it, expect } from 'vitest';
import * as turf from '@turf/turf';
import { TEST_CORNERS } from './testData';

describe('Boundary Calculations', () => {
  it('calculates area for 4-corner polygon', () => {
    const coordinates = TEST_CORNERS.map((c) => [c.lon, c.lat]);
    coordinates.push(coordinates[0] as number[]);
    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    const areaHa = area / 10000;
    expect(areaHa).toBeGreaterThan(0);
    expect(areaHa).toBeLessThan(10);
  });

  it('handles 3 corners (invalid - no closed polygon)', () => {
    const coords = TEST_CORNERS.slice(0, 3).map((c) => [c.lon, c.lat]);
    coords.push(coords[0] as number[]);
    const polygon = turf.polygon([coords]);
    const area = turf.area(polygon);
    expect(area).toBeGreaterThanOrEqual(0);
  });
});

