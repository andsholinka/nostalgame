// Creates minimal valid PNG icons for PWA
// These are simple colored squares - replace with real icons for production

const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Minimal PNG generator (1x1 pixel scaled - browsers will handle it)
// For a proper icon, use a design tool and export PNGs
function createMinimalPNG(size) {
  // PNG file structure
  const width = size;
  const height = size;

  // We'll create a simple SVG and reference it
  // For now, create a placeholder file
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${Math.round(width * 0.15)}" fill="url(#bg)"/>
  <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${Math.round(width * 0.4)}">🎮</text>
</svg>`;

  return svg;
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

SIZES.forEach((size) => {
  const svg = createMinimalPNG(size);
  // Save as SVG (modern browsers support SVG icons in manifest)
  fs.writeFileSync(path.join(ICONS_DIR, `icon-${size}x${size}.png`), svg);
  console.log(`Created: icon-${size}x${size}.png (SVG format - replace with real PNG for production)`);
});

console.log("\nDone! Icons created in public/icons/");
console.log("For production, replace these with proper PNG icons.");
