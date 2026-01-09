// Create AhaduLearning logo
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG logo
const svgLogo = `
<svg width="140" height="70" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="140" height="70" fill="#0e8cc3" rx="8"/>
  
  <!-- Large A -->
  <text x="20" y="45" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">A</text>
  
  <!-- Ahadu text -->
  <text x="55" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="white">Ahadu</text>
  
  <!-- Learning text -->
  <text x="55" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="white">Learning</text>
</svg>
`;

// Save the SVG file
const svgPath = path.join(__dirname, 'ahadulearning-logo.svg');
fs.writeFileSync(svgPath, svgLogo);

console.log('AhaduLearning logo created at:', svgPath);
console.log('Convert this SVG to PNG and save as logo.png in the same directory');
