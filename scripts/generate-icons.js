// Script to generate PWA icons from a source image
// Usage: node scripts/generate-icons.js
// Requires: sharp (npm install sharp --save-dev)
// Or you can manually create icons at the sizes listed below

const fs = require("fs");
const path = require("path");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

// Create icons directory
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate simple SVG-based PNG placeholder icons
function generateSVGIcon(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="${size * 0.4}" font-family="Arial, sans-serif">🎮</text>
</svg>`;
  return svg;
}

// Write SVG icons as fallback (browsers support SVG icons)
SIZES.forEach((size) => {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(ICONS_DIR, filename), svg);
  console.log(`Generated: ${filename}`);
});

console.log("\nNote: For production, convert these SVGs to PNGs using:");
console.log("  npx sharp-cli -i public/icons/icon-512x512.svg -o public/icons/icon-512x512.png resize 512 512");
console.log("\nOr use an online tool like https://realfavicongenerator.net/");
