import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawPixel) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth: 8
  ihdr[9] = 6; // color type: 6 (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Helper to draw Fiat Journal icon
// Dark stone base: #1c1917 (28, 25, 23)
// Gold/Amber: #f59e0b (245, 158, 11) or #fbbf24 (251, 191, 36)
// Inner accent: #d97706
function renderIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background
  const bgR = 28, bgG = 25, bgB = 23;

  if (isMaskable) {
    // Maskable icons should fill entire square bleed
    // Inside safe zone (central circle radius 0.38)
    const dx = nx - 0.5;
    const dy = ny - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Subtle radial gradient in background
    const bgFactor = Math.max(0, 1 - dist * 0.8);
    const r = Math.min(255, Math.floor(bgR + bgFactor * 15));
    const g = Math.min(255, Math.floor(bgG + bgFactor * 15));
    const b = Math.min(255, Math.floor(bgB + bgFactor * 20));

    // Draw the "F" monogram inside safe zone
    const isF = checkFMonogram(nx, ny, 0.22, 0.20, 0.78, 0.80);
    if (isF) {
      // Golden gradient
      const goldR = 245 + Math.floor((1 - ny) * 10);
      const goldG = 175 + Math.floor((1 - ny) * 30);
      const goldB = 25 + Math.floor((1 - ny) * 40);
      return [goldR, goldG, goldB, 255];
    }

    // Small star/sparkle at top right of F
    const isSpark = checkSparkle(nx, ny, 0.72, 0.24, 0.04);
    if (isSpark) {
      return [253, 230, 138, 255];
    }

    return [r, g, b, 255];
  } else {
    // Standard icon with rounded squircle
    const radius = 0.22;
    const inSquircle = checkRoundedRect(nx, ny, 0.05, 0.05, 0.95, 0.95, radius);
    if (!inSquircle) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }

    // Border line
    const onBorder = !checkRoundedRect(nx, ny, 0.06, 0.06, 0.94, 0.94, radius - 0.01);
    if (onBorder) {
      return [68, 64, 60, 255]; // stone-700 subtle border
    }

    // Inside squircle:
    const isF = checkFMonogram(nx, ny, 0.22, 0.20, 0.78, 0.80);
    if (isF) {
      const goldR = 245 + Math.floor((1 - ny) * 10);
      const goldG = 175 + Math.floor((1 - ny) * 30);
      const goldB = 25 + Math.floor((1 - ny) * 40);
      return [goldR, goldG, goldB, 255];
    }

    const isSpark = checkSparkle(nx, ny, 0.74, 0.24, 0.045);
    if (isSpark) {
      return [253, 230, 138, 255];
    }

    // Subtle dark gradient background
    const dx = nx - 0.5;
    const dy = ny - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const bgFactor = Math.max(0, 1 - dist * 0.9);
    const r = Math.min(255, Math.floor(bgR + bgFactor * 15));
    const g = Math.min(255, Math.floor(bgG + bgFactor * 15));
    const b = Math.min(255, Math.floor(bgB + bgFactor * 20));

    return [r, g, b, 255];
  }
}

function checkRoundedRect(x, y, x1, y1, x2, y2, r) {
  if (x < x1 || x > x2 || y < y1 || y > y2) return false;
  const left = x1 + r;
  const right = x2 - r;
  const top = y1 + r;
  const bottom = y2 - r;

  if (x >= left && x <= right) return true;
  if (y >= top && y <= bottom) return true;

  const cx = x < left ? left : right;
  const cy = y < top ? top : bottom;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function checkFMonogram(nx, ny, minX, minY, maxX, maxY) {
  // Normalize inside bounding box
  if (nx < minX || nx > maxX || ny < minY || ny > maxY) return false;
  const u = (nx - minX) / (maxX - minX);
  const v = (ny - minY) / (maxY - minY);

  // F geometry:
  // Stem: u in [0.08, 0.28], v in [0.05, 0.95]
  if (u >= 0.08 && u <= 0.28 && v >= 0.05 && v <= 0.95) return true;

  // Top Bar: u in [0.28, 0.85], v in [0.05, 0.23]
  if (u >= 0.28 && u <= 0.85 && v >= 0.05 && v <= 0.23) return true;

  // Middle Bar: u in [0.28, 0.70], v in [0.42, 0.58]
  if (u >= 0.28 && u <= 0.70 && v >= 0.42 && v <= 0.58) return true;

  return false;
}

function checkSparkle(nx, ny, cx, cy, rad) {
  const dx = Math.abs(nx - cx);
  const dy = Math.abs(ny - cy);
  if (dx > rad || dy > rad) return false;
  // Star/diamond shape
  return (dx / rad + dy / rad) <= 1.0;
}

// Ensure public directory
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Icons
console.log('Generating 192x192 PNG...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  createPNG(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false))
);

console.log('Generating 512x512 PNG...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false))
);

console.log('Generating 512x512 Maskable PNG...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true))
);

console.log('Generating 180x180 Apple Touch Icon...');
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPNG(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false))
);

// Also generate SVG version
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#1C1917" stroke="#44403C" stroke-width="8"/>
  <path d="M140 100 H390 V170 H220 V250 H340 V310 H220 V412 H140 Z" fill="url(#goldGrad)" rx="8" />
  <path d="M400 130 L415 150 L435 155 L418 170 L422 190 L400 178 L378 190 L382 170 L365 155 L385 150 Z" fill="#FDE68A" />
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

console.log('PWA icons successfully generated!');
