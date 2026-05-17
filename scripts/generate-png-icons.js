/**
 * Generate PNG icons from canvas for PWA
 * Run: node scripts/generate-png-icons.js
 * 
 * This creates simple gradient PNG icons.
 * For production, replace with professionally designed icons.
 */

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#7c3aed");
  gradient.addColorStop(1, "#06b6d4");
  ctx.fillStyle = gradient;

  // Rounded rect
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Controller icon
  const cx = size / 2;
  const cy = size * 0.45;
  const scale = size / 512;

  // Controller body
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 140 * scale, 80 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // D-pad
  ctx.fillStyle = "white";
  ctx.fillRect(cx - 100 * scale, cy - 15 * scale, 50 * scale, 12 * scale);
  ctx.fillRect(cx - 81 * scale, cy - 34 * scale, 12 * scale, 50 * scale);

  // Buttons
  const buttons = [
    { x: 70, y: -15, color: "#ef4444" },
    { x: 95, y: 5, color: "#22c55e" },
    { x: 70, y: 25, color: "#3b82f6" },
    { x: 45, y: 5, color: "#eab308" },
  ];
  buttons.forEach(({ x, y, color }) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + x * scale, cy + y * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
  });

  // Text
  ctx.fillStyle = "white";
  ctx.font = `bold ${48 * scale}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("GAME HUB", cx, size * 0.78);

  // Save
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(ICONS_DIR, filename), buffer);
  console.log(`Generated: ${filename} (${size}x${size})`);
}

// Only generate if canvas module is available
try {
  generateIcon(192, "icon-192.png");
  generateIcon(512, "icon-512.png");
  console.log("Done!");
} catch (e) {
  console.log("canvas module not available. Creating placeholder PNGs...");
  console.log("Install with: npm install canvas --save-dev");
  console.log("Or use https://realfavicongenerator.net/ to generate icons from the SVG.");
}
