#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📝 Checking syntax...');

const srcDir = path.join(__dirname, '../src');
const files = [];

function findJsFiles(dir) {
  const entries = fs.readdirSync(dir);
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules') {
        findJsFiles(fullPath);
      }
    } else if (entry.endsWith('.js')) {
      files.push(fullPath);
    }
  });
}

findJsFiles(srcDir);

let errors = 0;
files.forEach((file) => {
  try {
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  } catch (error) {
    console.error(`❌ Syntax error in ${path.relative(srcDir, file)}`);
    console.error(error.message);
    errors++;
  }
});

if (errors > 0) {
  console.error(`\n❌ Found ${errors} syntax errors`);
  process.exit(1);
}

console.log(`✅ Checked ${files.length} files - all syntax ok\n`);
