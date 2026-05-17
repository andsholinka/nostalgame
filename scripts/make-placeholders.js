const fs = require("fs");
const path = require("path");

function createSVG(size) {
  const rx = Math.round(size * 0.15);
  const fontSize = Math.round(size * 0.35);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)" rx="${rx}"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="white" font-family="Arial, sans-serif" font-weight="bold">GH</text></svg>`;
}

const dir = path.join(__dirname, "..", "public", "icons");
fs.writeFileSync(path.join(dir, "icon-192.png"), createSVG(192));
fs.writeFileSync(path.join(dir, "icon-512.png"), createSVG(512));
console.log("Created placeholder icons (SVG content in .png files - replace with real PNGs for production)");
