/**
 * Generate PWA icons for NuruOS Field Intelligence.
 * Uses the Stitch design system: bgDeep #0B0F19, neonLime #BEF264, Sora font.
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

// NuruOS icon: dark navy rounded-rect background with a neon-lime "N" monogram
// and a subtle leaf/field element
function createSvg(size) {
  const padding = Math.round(size * 0.12);
  const cornerRadius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.48);
  const centerX = size / 2;
  const centerY = size / 2;

  // Leaf accent coordinates (small stylized leaf near bottom-right of the N)
  const leafX = centerX + size * 0.18;
  const leafY = centerY + size * 0.12;
  const leafSize = size * 0.12;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E1324"/>
      <stop offset="100%" stop-color="#0B0F19"/>
    </linearGradient>
    <linearGradient id="lime" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#D4F97A"/>
      <stop offset="100%" stop-color="#BEF264"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${size * 0.02}"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}"
        rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#bg)"/>

  <!-- Subtle border -->
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}"
        rx="${cornerRadius}" ry="${cornerRadius}" fill="none"
        stroke="rgba(190,242,100,0.15)" stroke-width="${Math.max(1, size * 0.005)}"/>

  <!-- Glow behind letter -->
  <text x="${centerX}" y="${centerY + fontSize * 0.08}" text-anchor="middle" dominant-baseline="central"
        font-family="'Sora','Inter','SF Pro Display',system-ui,sans-serif"
        font-weight="700" font-size="${fontSize}" fill="#BEF264" opacity="0.3"
        filter="url(#glow)">N</text>

  <!-- Main "N" letterform -->
  <text x="${centerX}" y="${centerY + fontSize * 0.08}" text-anchor="middle" dominant-baseline="central"
        font-family="'Sora','Inter','SF Pro Display',system-ui,sans-serif"
        font-weight="700" font-size="${fontSize}" fill="url(#lime)">N</text>

  <!-- Small leaf accent -->
  <path d="M${leafX},${leafY} Q${leafX + leafSize * 0.8},${leafY - leafSize * 1.2} ${leafX + leafSize * 0.3},${leafY - leafSize * 1.5}
           Q${leafX + leafSize * 0.1},${leafY - leafSize * 0.5} ${leafX},${leafY}Z"
        fill="#BEF264" opacity="0.6"/>

  <!-- Leaf vein -->
  <line x1="${leafX}" y1="${leafY}" x2="${leafX + leafSize * 0.45}" y2="${leafY - leafSize * 1.1}"
        stroke="#0B0F19" stroke-width="${Math.max(0.5, size * 0.004)}" opacity="0.5"/>
</svg>`;
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
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

// Also generate a favicon.ico-compatible PNG at root
const faviconSvg = createSvg(32);
await sharp(Buffer.from(faviconSvg)).png().toFile(resolve(__dirname, '..', 'public', 'favicon.png'));
console.log('Generated favicon.png (32x32)');

console.log('\nAll PWA icons generated in public/icons/');
