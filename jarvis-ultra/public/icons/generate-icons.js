// Dieses Skript generiert die Icons
// Du kannst es mit: node public/icons/generate-icons.js ausführen

const fs = require('fs');
const path = require('path');

// Erstelle den icons Ordner falls er nicht existiert
const iconsDir = __dirname;
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG Icon Template
const iconSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0e27;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f1535;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad1)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="none" stroke="#00ff88" stroke-width="${size*0.04}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.25}" fill="none" stroke="#00ff88" stroke-width="${size*0.02}" opacity="0.6"/>
  <path d="M ${size*0.3} ${size*0.5} L ${size*0.45} ${size*0.35} L ${size*0.55} ${size*0.65} L ${size*0.7} ${size*0.5}"
        fill="none" stroke="#00ff88" stroke-width="${size*0.03}" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${size*0.5}" y="${size*0.75}" font-family="Arial, sans-serif" font-size="${size*0.2}"
        fill="#00ff88" text-anchor="middle" font-weight="bold">J</text>
</svg>`;

// Speichere SVG Icons
const sizes = [192, 512, 96];
sizes.forEach(size => {
  const svg = iconSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

// Maskable Icons (für verschiedene Formen)
const maskableSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#00ff88"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="none" stroke="#0a0e27" stroke-width="${size*0.04}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.25}" fill="none" stroke="#0a0e27" stroke-width="${size*0.02}" opacity="0.6"/>
</svg>`;

[192, 512].forEach(size => {
  const svg = maskableSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}-maskable.svg`), svg);
  console.log(`✓ Created icon-${size}x${size}-maskable.svg`);
});

console.log('\n✅ Icons erstellt! Diese SVG-Dateien werden automatisch als PNGs genutzt.');
console.log('Für optimale Kompatibilität könnten diese noch zu PNGs konvertiert werden.');
