#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Validating imports...');

const invalidPatterns = [
  { pattern: 'authMiddleware', correct: 'auth', file: 'routes' },
  { pattern: 'require.*authMiddleware', correct: "require('../middleware/auth')", file: 'routes' },
];

const routesDir = path.join(__dirname, '../src/routes');
const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.js'));

let hasErrors = false;

files.forEach((file) => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for wrong auth imports
  if (content.includes('authMiddleware')) {
    console.error(`❌ ${file}: Found "authMiddleware", should be "auth"`);
    hasErrors = true;
  }

  // Check for verifyToken function
  if (content.includes('verifyToken') && !content.includes('jwt')) {
    console.error(`❌ ${file}: Found "verifyToken", should be "authenticate"`);
    hasErrors = true;
  }

  // Validate module exists
  if (content.includes("require('../middleware/auth')")) {
    const authPath = path.join(__dirname, '../src/middleware/auth.js');
    if (!fs.existsSync(authPath)) {
      console.error(`❌ ${file}: auth.js middleware not found at ${authPath}`);
      hasErrors = true;
    }
  }
});

if (hasErrors) {
  console.error('\n❌ Import validation failed');
  process.exit(1);
}

console.log('✅ All imports validated\n');
