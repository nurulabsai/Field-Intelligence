/**
 * Generate PWA icons using the official NuruOS logo mark.
 * Logo: Circular badge with stylized "N" (two rounded verticals + diagonal slash).
 * Adapted to Stitch design system: bgDeep #0B0F19, neonLime #BEF264.
 *
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

/**
 * NuruOS logo mark: circle containing a stylized "N" formed by
 * two rounded vertical pill shapes with a diagonal slash between them.
 * Rendered on dark background with neon-lime logo for PWA use.
 */
function createSvg(size) {
  const pad = Math.round(size * 0.06);
  const s = size - pad * 2; // usable area
  const cx = size / 2;
  const cy = size / 2;
  const r = s / 2; // circle radius

  // The N mark is centered inside the circle
  // Scale all logo geometry relative to the circle radius
  const logoScale = r * 0.55; // controls how big the N is inside the circle

  // Left vertical pill of the N
  const pillW = logoScale * 0.38;
  const pillH = logoScale * 1.6;
  const pillR = pillW / 2; // fully rounded ends

  // Left pill position
  const leftX = cx - logoScale * 0.42;
  const leftY = cy - pillH / 2;

  // Right pill position
  const rightX = cx + logoScale * 0.42 - pillW;
  const rightY = cy - pillH / 2;

  // Diagonal slash (the connecting stroke of the N)
  const slashW = logoScale * 0.18;
  const slashAngle = -32; // degrees

  // Circle stroke width
  const circleStroke = Math.max(1.5, size * 0.035);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E1324"/>
      <stop offset="100%" stop-color="#0B0F19"/>
    </linearGradient>
    <clipPath id="safe">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.18}"/>
    </clipPath>
  </defs>

  <!-- Full background (maskable safe zone) -->
  <rect width="${size}" height="${size}" fill="url(#bg)" clip-path="url(#safe)"/>

  <!-- Outer circle ring -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.78}" fill="none"
          stroke="#BEF264" stroke-width="${circleStroke}" opacity="0.9"/>

  <!-- Inner filled circle (subtle dark fill) -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.78 - circleStroke / 2}" fill="rgba(190,242,100,0.05)"/>

  <!-- Left vertical pill -->
  <rect x="${leftX}" y="${leftY}" width="${pillW}" height="${pillH}"
        rx="${pillR}" ry="${pillR}" fill="#BEF264"/>

  <!-- Right vertical pill -->
  <rect x="${rightX}" y="${rightY}" width="${pillW}" height="${pillH}"
        rx="${pillR}" ry="${pillR}" fill="#BEF264"/>

  <!-- Diagonal slash connecting the two verticals -->
  <g transform="rotate(${slashAngle} ${cx} ${cy})">
    <rect x="${cx - slashW / 2}" y="${cy - pillH * 0.42}" width="${slashW}" height="${pillH * 0.84}"
          rx="${slashW / 2}" ry="${slashW / 2}" fill="#0B0F19"/>
  </g>

  <!-- Subtle glow behind the mark -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="#BEF264" opacity="0.04"/>
</svg>`;
}

const sizes = [
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

for (const { name, size } of sizes) {
  const svg = createSvg(size);
  const outPath = resolve(outDir, name);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`Generated ${name} (${size}x${size})`);
}

// Favicon at public root
const faviconSvg = createSvg(32);
await sharp(Buffer.from(faviconSvg)).png().toFile(resolve(__dirname, '..', 'public', 'favicon.png'));
console.log('Generated favicon.png (32x32)');

console.log('\nAll PWA icons regenerated with official NuruOS logo mark.');
