import * as turf from '@turf/turf';
import type { GeoPoint, GeoPolygon } from '../types/auditTypes';

export type AccuracyLevel = 'good' | 'fair' | 'poor';

export function getAccuracyLevel(meters: number): AccuracyLevel {
  if (meters < 10) return 'good';
  if (meters < 30) return 'fair';
  return 'poor';
}

export function getAccuracyColor(meters: number): string {
  const level = getAccuracyLevel(meters);
  return level === 'good' ? '#BEF264' : level === 'fair' ? '#FFBF00' : '#FF4B4B';
}

export function getAccuracyLabel(meters: number): string {
  const level = getAccuracyLevel(meters);
  const m = meters.toFixed(1);
  if (level === 'good') return `GPS Strong — ±${m}m`;
  if (level === 'fair') return `GPS Fair — ±${m}m — walk slowly`;
  return `GPS Weak — ±${m}m — wait for better signal`;
}

export function calculateDistance(a: GeoPoint, b: GeoPoint): number {
  return turf.distance([a.lng, a.lat], [b.lng, b.lat], { units: 'meters' });
}

export function buildPolygonFromPoints(points: GeoPoint[]): GeoPolygon {
  if (points.length < 3) throw new Error('Minimum 3 points required for polygon');
  const coords = points.map(p => [p.lng, p.lat]);
  coords.push(coords[0]!);
  const poly = turf.polygon([coords]);
  return { points, area: turf.area(poly) / 10000 };
}

export function buildCirclePolygon(center: GeoPoint, radiusMeters: number): GeoPolygon {
  const radiusKm = radiusMeters / 1000;
  const circle = turf.circle([center.lng, center.lat], radiusKm, {
    units: 'kilometers', steps: 32
  });
  const coords = circle.geometry.coordinates[0]!;
  const points: GeoPoint[] = coords.map(([lng, lat]) => ({
    lat: lat!, lng: lng!, accuracy: 0, capturedAt: new Date().toISOString()
  }));
  return { points, area: turf.area(circle) / 10000 };
}

export function calculateAccuracySummary(points: GeoPoint[]): { min: number; max: number; avg: number } | null {
  if (!points.length) return null;
  const accs = points.map(p => p.accuracy);
  return {
    min: Math.min(...accs),
    max: Math.max(...accs),
    avg: accs.reduce((s, a) => s + a, 0) / accs.length,
  };
}

export function pointToGeoJSON(p: GeoPoint): { type: string; coordinates: number[] } {
  return { type: 'Point', coordinates: [p.lng, p.lat] };
}

export function polygonToGeoJSON(polygon: GeoPolygon): { type: string; coordinates: number[][][] } {
  const coords = polygon.points.map(p => [p.lng, p.lat]);
  coords.push(coords[0]!);
  return { type: 'Polygon', coordinates: [coords] };
}
