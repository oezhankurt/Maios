#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking dependencies...');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const installedDeps = Object.keys(packageJson.dependencies || {});
const devDeps = Object.keys(packageJson.devDependencies || {});
const allDeps = [...installedDeps, ...devDeps, 'express', 'sequelize', 'pg', 'fs', 'path'];

// Scan all files for requires
const srcDir = path.join(__dirname, '../src');
const pattern = /require\(['"]([^'"]+)['"]\)/g;
const missingDeps = new Set();

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') scanDir(fullPath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = pattern.exec(content))) {
        const dep = match[1].split('/')[0];
        // Skip relative paths and builtins
        const builtins = ['fs', 'path', 'http', 'https', 'util', 'events', 'stream', 'crypto', 'child_process', 'os', 'zlib'];
        if (!dep.startsWith('.') && !dep.startsWith('/') && !builtins.includes(dep)) {
          if (!allDeps.includes(dep)) {
            missingDeps.add(`${dep} (in ${file})`);
          }
        }
      }
    }
  });
}

scanDir(srcDir);

if (missingDeps.size > 0) {
  console.error('\n❌ Missing dependencies:');
  missingDeps.forEach((dep) => console.error(`   - ${dep}`));
  process.exit(1);
}

console.log('✅ All dependencies installed\n');
